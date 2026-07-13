import { supabase } from '../supabaseClient';
import { Note, NoteAttachment } from '../types';
import { storageService } from './storageService';
import { offlineDb } from './offlineDb';

// Helper to map Supabase DB naming (snake_case) to App naming (camelCase)
const mapToNote = (data: any): Note => {
  const isEncrypted = (data.title && data.title.startsWith('NEO_ENC_v1::')) || 
                      (data.content && data.content.startsWith('NEO_ENC_v1::'));
  
  let tags = data.tags || [];
  if (isEncrypted && !tags.includes('locked')) {
    tags = [...tags, 'locked'];
  }

  return {
    id: data.id,
    title: data.title || '',
    content: data.content || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    thumbnailUrl: data.thumbnail_url || undefined,
    tags: tags,
    attachments: data.attachments || [],
  };
};

const NOTE_LIMIT = 3;

// Helper to check online status
const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;

export const noteService = {
  // Fetch all notes for the authenticated user
  getAll: async (): Promise<Note[]> => {
    try {
      if (isOnline()) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        const notes = (data || []).map(mapToNote);
        await offlineDb.saveNotes(notes);
        
        return notes.filter(n => !n.tags?.includes('collection_item') && !n.tags?.includes('trash'));
      }
    } catch (err) {
      console.warn("Failed to fetch from remote, falling back to offline DB", err);
    }
    
    // Fallback to offline DB
    const offlineNotes = await offlineDb.getNotes();
    offlineNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return offlineNotes.filter(n => !n.tags?.includes('collection_item') && !n.tags?.includes('trash'));
  },

  // Fetch all trashed notes for the authenticated user
  getTrash: async (): Promise<Note[]> => {
    try {
      if (isOnline()) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .contains('tags', ['trash'])
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(mapToNote);
      }
    } catch (err) {
      console.warn("Failed to fetch trash from remote", err);
    }
    
    // Fallback
    const offlineNotes = await offlineDb.getNotes();
    offlineNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return offlineNotes.filter(n => n.tags?.includes('trash'));
  },

  // Get the total count of notes for the current user
  getCount: async (): Promise<number> => {
    try {
      if (isOnline()) {
        const { count, error } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .not('tags', 'cs', '{"collection_item"}');
        
        if (error) throw error;
        return count || 0;
      }
    } catch (err) {
      console.warn("Failed to get count from remote", err);
    }
    const notes = await noteService.getAll();
    return notes.length;
  },

  // Get a single note by ID
  getById: async (id: string): Promise<Note | undefined> => {
    try {
      if (isOnline()) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        const note = mapToNote(data);
        await offlineDb.saveNote(note);
        return note;
      }
    } catch (err) {
      console.warn("Failed to get note from remote", err);
    }
    return offlineDb.getNote(id);
  },

  getStreak: async (): Promise<number> => {
    try {
      if (!isOnline()) return 0;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('notes')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return 0;

      // Extract unique dates as YYYY-MM-DD
      const activityDates = [...new Set(data.map(n => new Date(n.created_at).toISOString().split('T')[0]))];
      
      if (activityDates.length === 0) return 0;

      let streak = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if streak is currently active (today or yesterday)
      if (activityDates[0] !== todayStr && activityDates[0] !== yesterdayStr) {
        return 0; // Streak broken
      }

      let currentDate = new Date(activityDates[0]);

      for (const dateStr of activityDates) {
        if (dateStr === currentDate.toISOString().split('T')[0]) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break; // Break in the consecutive days sequence
        }
      }

      return streak;
    } catch(err) {
      return 0;
    }
  },

  // Search notes by title or content
  search: async (query: string): Promise<Note[]> => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    const allNotes = await noteService.getAll();
    return allNotes.filter(note => 
       note.title.toLowerCase().includes(q) || 
       note.content.toLowerCase().includes(q) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  },

  // Create a new note
  create: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const dbPayload = {
      user_id: user.id,
      title: note.title,
      content: note.content,
      thumbnail_url: note.thumbnailUrl,
      tags: note.tags || [],
      attachments: note.attachments || []
    };

    if (isOnline()) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert(dbPayload)
          .select()
          .single();
        if (error) throw error;
        const created = mapToNote(data);
        await offlineDb.saveNote(created);
        return created;
      } catch (err) {
        console.warn("Failed to create remote note, saving offline", err);
      }
    }
    
    // Offline creation
    const offlineNote: Note = {
      id: tempId,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      attachments: note.attachments || [],
      thumbnailUrl: note.thumbnailUrl,
      createdAt: now,
      updatedAt: now
    };
    
    await offlineDb.saveNote(offlineNote);
    await offlineDb.queueSync('CREATE', tempId, dbPayload);
    
    // Trigger sync in background if online but request failed (or if online comes back)
    noteService.syncOfflineOperations();
    return offlineNote;
  },

  // Update an existing note
  update: async (id: string, updates: Partial<Note>, options?: { preserveUpdatedAt?: boolean }): Promise<Note> => {
    const dbUpdates: any = {};
    if (!options?.preserveUpdatedAt) { 
      dbUpdates.updated_at = new Date().toISOString();
    }
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;

    if (isOnline()) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        const updated = mapToNote(data);
        await offlineDb.saveNote(updated);
        return updated;
      } catch (err) {
        console.warn("Failed to update remote note, saving offline", err);
      }
    }
    
    // Offline update
    const existing = await offlineDb.getNote(id);
    if (!existing) throw new Error("Note not found offline");
    
    const updatedOffline: Note = {
      ...existing,
      ...updates,
      updatedAt: dbUpdates.updated_at || existing.updatedAt
    };
    
    await offlineDb.saveNote(updatedOffline);
    
    // We only queue updates if it's a UUID (temp ID implies it's a CREATE that hasn't synced yet)
    // Actually, to be safe, if we queue an UPDATE for a temp ID, the sync logic needs to handle dependencies.
    // For simplicity, just queue the UPDATE. If CREATE is queued, it will run first.
    await offlineDb.queueSync('UPDATE', id, dbUpdates);
    
    noteService.syncOfflineOperations();
    return updatedOffline;
  },

  // Move a note to trash (soft delete)
  delete: async (id: string): Promise<void> => {
    const note = await noteService.getById(id);
    if (!note) return;
    
    const tags = note.tags || [];
    if (!tags.includes('trash')) {
      tags.push('trash');
      await noteService.update(id, { tags }, { preserveUpdatedAt: true });
    }
  },

  // Hard delete a note and its associated files
  hardDelete: async (id: string): Promise<void> => {
    const note = await noteService.getById(id);
    
    if (note) {
      const pathsToDelete: string[] = [];
      
      if (note.thumbnailUrl && !note.thumbnailUrl.startsWith('http')) {
        pathsToDelete.push(note.thumbnailUrl);
      }
      if (note.attachments && note.attachments.length > 0) {
        note.attachments.forEach(att => pathsToDelete.push(att.path));
      }
      if (pathsToDelete.length > 0) {
        // storageService offline? We ignore it for now, can fail
        try {
          await storageService.deleteFiles(pathsToDelete);
        } catch(e) {}
      }
    }

    if (isOnline()) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);
        if (error) throw error;
        await offlineDb.deleteNote(id);
        return;
      } catch (err) {
        console.warn("Failed hard delete online, queuing offline");
      }
    }
    
    await offlineDb.deleteNote(id);
    await offlineDb.queueSync('HARD_DELETE', id);
    noteService.syncOfflineOperations();
  },

  // Process offline operations
  syncOfflineOperations: async () => {
    if (!isOnline()) return;
    
    const ops = await offlineDb.getSyncQueue();
    if (ops.length === 0) return;
    
    console.log(`Syncing ${ops.length} offline operations...`);
    
    // Map of tempIds to real IDs returned by server
    const idMap = new Map<string, string>();
    
    for (const op of ops) {
      try {
        const targetId = idMap.get(op.noteId) || op.noteId;
        
        if (op.type === 'CREATE') {
          // It's possible the user logged out, check session
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) break; // Stop syncing if no user
          
          op.payload.user_id = user.id;
          
          const { data, error } = await supabase
            .from('notes')
            .insert(op.payload)
            .select()
            .single();
            
          if (error) throw error;
          
          const created = mapToNote(data);
          idMap.set(op.noteId, created.id); // Map temp ID to real ID
          
          // Delete old temp note and save real note
          await offlineDb.deleteNote(op.noteId);
          await offlineDb.saveNote(created);
        } 
        else if (op.type === 'UPDATE') {
          const { data, error } = await supabase
            .from('notes')
            .update(op.payload)
            .eq('id', targetId)
            .select()
            .single();
            
          if (error) throw error;
          const updated = mapToNote(data);
          await offlineDb.saveNote(updated);
        }
        else if (op.type === 'DELETE') {
          // DEPRECATED: We use UPDATE with tags for soft delete, but keeping just in case
        }
        else if (op.type === 'HARD_DELETE') {
          const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', targetId);
          if (error) throw error;
          await offlineDb.deleteNote(targetId);
        }
        
        // Remove from queue on success
        await offlineDb.removeSyncOp(op.id);
      } catch (err) {
        console.error("Failed to sync operation", op, err);
        // We could break here to maintain ordering and try again later
        break;
      }
    }
  }
};

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log("Back online. Triggering sync...");
    noteService.syncOfflineOperations();
  });
}

// Internal delay helper for responsiveness sim
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

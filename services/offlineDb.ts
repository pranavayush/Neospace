import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note } from '../types';

export interface OfflineSyncOp {
  id: string; // unique operation id
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'HARD_DELETE';
  noteId: string;
  payload?: any;
  timestamp: number;
}

export interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
  };
  syncQueue: {
    key: string;
    value: OfflineSyncOp;
  };
}

const DB_NAME = 'neo-notes-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NotesDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<NotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    },
  });
}

export const offlineDb = {
  // --- Notes Cache ---
  async getNotes(): Promise<Note[]> {
    if (!dbPromise) return [];
    const db = await dbPromise;
    return db.getAll('notes');
  },

  async getNote(id: string): Promise<Note | undefined> {
    if (!dbPromise) return undefined;
    const db = await dbPromise;
    return db.get('notes', id);
  },

  async saveNote(note: Note): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('notes', note);
  },

  async saveNotes(notes: Note[]): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    const tx = db.transaction('notes', 'readwrite');
    for (const note of notes) {
      tx.store.put(note);
    }
    await tx.done;
  },

  async deleteNote(id: string): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.delete('notes', id);
  },

  // --- Sync Queue ---
  async queueSync(type: OfflineSyncOp['type'], noteId: string, payload?: any): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    const op: OfflineSyncOp = {
      id: crypto.randomUUID(),
      type,
      noteId,
      payload,
      timestamp: Date.now()
    };
    await db.put('syncQueue', op);
  },

  async getSyncQueue(): Promise<OfflineSyncOp[]> {
    if (!dbPromise) return [];
    const db = await dbPromise;
    const ops = await db.getAll('syncQueue');
    // Sort by timestamp
    return ops.sort((a, b) => a.timestamp - b.timestamp);
  },

  async removeSyncOp(id: string): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.delete('syncQueue', id);
  }
};

import { supabase } from '../supabaseClient';
import { Collection, CollectionItem } from '../types';

// Map DB row to CollectionItem
const mapToCollectionItem = (data: any): CollectionItem => {
  // We use `notes` table to store collection items. 
  // 'content' holds description/notes. 'attachments' holds metadata as JSON.
  
  let metadata: any = {};
  if (data.attachments && data.attachments.length > 0) {
    try {
      metadata = data.attachments[0].metadata || {};
    } catch (e) {}
  }

  // Parse type from tags
  const tags: string[] = data.tags || [];
  const typeTag = tags.find(t => t.startsWith('type:')) || 'type:link';
  const type = typeTag.replace('type:', '');
  const collectionIdTag = tags.find(t => t.startsWith('collectionId:')) || 'collectionId:default';
  const collectionId = collectionIdTag.replace('collectionId:', '');
  
  const isFavorite = tags.includes('favorite');
  const isPinned = tags.includes('pinned');
  const urlTag = tags.find(t => t.startsWith('url:'));
  const url = urlTag ? decodeURIComponent(urlTag.replace('url:', '')) : undefined;

  return {
    id: data.id,
    collectionId: collectionId,
    title: data.title || '',
    url: url || metadata.url,
    type: type,
    thumbnailUrl: data.thumbnail_url || undefined,
    metadata: metadata,
    tags: tags.filter(t => !t.startsWith('type:') && !t.startsWith('collectionId:') && !t.startsWith('url:') && t !== 'collection_item' && t !== 'favorite' && t !== 'pinned'),
    notes: data.content || '',
    isFavorite,
    isPinned,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const collectionService = {
  getCollections: async (): Promise<Collection[]> => {
    // Return a default collection since we removed local collections but UI might still need it
    return [{
      id: 'default',
      name: 'My Workspace',
      description: 'Default collection',
      icon: '📚',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
  },

  createCollection: async (name: string, description?: string, icon?: string): Promise<Collection> => {
    return {
      id: 'default',
      name,
      description,
      icon: icon || '📚',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  deleteCollection: async (id: string): Promise<void> => {
    // No-op for now
  },

  getItems: async (collectionId: string): Promise<CollectionItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .contains('tags', ['collection_item'])
      .contains('tags', [`collectionId:${collectionId}`])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching collection items', error);
      return [];
    }

    return (data || [])
      .filter((item: any) => !(item.tags || []).includes('trash'))
      .map(mapToCollectionItem)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllItems: async (): Promise<CollectionItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .contains('tags', ['collection_item'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching all collection items', error);
      return [];
    }

    return (data || [])
      .filter((item: any) => !(item.tags || []).includes('trash'))
      .map(mapToCollectionItem)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createItem: async (item: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionItem> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const tags = [
      'collection_item',
      `type:${item.type}`,
      `collectionId:${item.collectionId || 'default'}`,
      ...(item.isFavorite ? ['favorite'] : []),
      ...(item.isPinned ? ['pinned'] : []),
      ...(item.tags || [])
    ];
    
    if (item.url) {
      tags.push(`url:${encodeURIComponent(item.url)}`);
    }

    const attachments = [{
      metadata: item.metadata || {},
    }];

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: item.title,
        content: item.notes || '',
        thumbnail_url: item.thumbnailUrl,
        tags: tags,
        attachments: attachments
      })
      .select()
      .single();

    if (error) throw error;
    return mapToCollectionItem(data);
  },

  deleteItem: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First fetch the existing record to get current tags
    const { data: existing, error: fetchErr } = await supabase
      .from('notes')
      .select('tags')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchErr) throw fetchErr;

    const tags = existing.tags || [];
    if (!tags.includes('trash')) {
      tags.push('trash');
      const { error } = await supabase
        .from('notes')
        .update({ tags })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    }
  },

  updateItem: async (id: string, updates: Partial<CollectionItem>): Promise<CollectionItem | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First fetch the existing record to get current tags
    const { data: existing, error: fetchErr } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const currentItem = mapToCollectionItem(existing);
    
    const isFavorite = updates.isFavorite !== undefined ? updates.isFavorite : currentItem.isFavorite;
    const isPinned = updates.isPinned !== undefined ? updates.isPinned : currentItem.isPinned;
    const type = updates.type !== undefined ? updates.type : currentItem.type;
    const collectionId = updates.collectionId !== undefined ? updates.collectionId : currentItem.collectionId;
    const url = updates.url !== undefined ? updates.url : currentItem.url;
    const tagsArr = updates.tags !== undefined ? updates.tags : currentItem.tags;
    
    const tags = [
      'collection_item',
      `type:${type}`,
      `collectionId:${collectionId || 'default'}`,
      ...(isFavorite ? ['favorite'] : []),
      ...(isPinned ? ['pinned'] : []),
      ...(tagsArr || [])
    ];
    
    if (url) {
      tags.push(`url:${encodeURIComponent(url)}`);
    }

    const attachments = [{
      metadata: updates.metadata !== undefined ? updates.metadata : currentItem.metadata,
    }];

    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
      tags: tags,
      attachments: attachments
    };

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.notes !== undefined) dbUpdates.content = updates.notes;
    if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;

    const { data, error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return mapToCollectionItem(data);
  }
};

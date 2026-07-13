export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export type PriorityLevel = 'high' | 'medium' | 'low' | 'none';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority: PriorityLevel;
  category?: string;
  completed: boolean;
  checklist?: TaskChecklistItem[];
  createdAt: string;
  updatedAt: string;
  isRecurring?: boolean;
}

export interface NoteAttachment {
  name: string;
  path: string;
  size: number;
  type: string;
  id: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO Date string
  updatedAt: string;
  thumbnailUrl?: string;
  tags?: string[];
  attachments?: NoteAttachment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  title: string;
  url?: string;
  type: string; // 'youtube' | 'website' | 'product' | 'image' | 'pdf' | 'book' | 'course' | 'idea'
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  notes?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RoutePath {
  HOME = '/',
  TASKS = '/tasks',
  NOTES = '/notes',
  COLLECTIONS = '/collections',
  QR_GENERATOR = '/qr',
  FAVORITES = '/favorites',
  TRASH = '/trash',
  STORE = '/store',
  CREATE_NOTE = '/notes/new',
  EDIT_NOTE = '/notes/:id/edit',
  NOTE_DETAIL = '/notes/:id',
  ACCOUNT = '/account',
  LOGIN = '/login',
  SIGNUP = '/signup',
  FORGOT_PASSWORD = '/forgot-password',
}
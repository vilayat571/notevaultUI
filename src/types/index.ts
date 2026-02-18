export interface User {
  _id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
}

export type NoteCategory = 'book' | 'video' | 'article' | 'course' | 'general';
export type NoteStatus = 'currently_reading' | 'finished' | 'will_repeat' | 'repeated';

export interface Note {
  _id: string;
  user: User | string;
  title: string;
  description: string;
  content: string;
  category: NoteCategory;
  cover: string;
  coverColor: string;
  link: string;
  author: string;
  status: NoteStatus;
  isPublic: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  token: string;
}

export interface NotesResponse {
  status: string;
  count: number;
  notes: Note[];
}

export interface NoteResponse {
  status: string;
  note: Note;
  message?: string;
}

export interface ApiError {
  status: string;
  message: string;
}

export type UserRole = 'user' | 'foodvendor' | 'admin';

export interface CurrentUser {
  username: string;
  role: UserRole;
  token: string;
}

export interface Comment {
  id: string;
  username: string;
  rating: number;
  body: string;
  created_at: string;
}

export interface AdminStats {
  streets: number;
  vendors: number;
  users: number;
  comments: number;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

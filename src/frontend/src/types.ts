export type UserRole = 'user' | 'foodvendor' | 'admin';

export interface CurrentUser {
  username: string;
  role: UserRole;
  token: string;
}

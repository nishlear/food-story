export type UserRole = 'user' | 'foodvendor' | 'admin';
export type Language = 'en' | 'vi' | 'ko' | 'ja' | 'zh-CN' | 'zh-TW' | 'es';

export type VendorDescriptionTranslations = Partial<Record<Language, string>>;

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

export interface Vendor {
  id: string;
  street_id: string;
  name: string;
  description: string | null;
  description_translations: VendorDescriptionTranslations;
  rating: number;
  reviews: number;
  x: number;
  y: number;
  type: string;
  address: string | null;
  images: string[];
  owner_username: string | null;
  lat: number | null;
  lon: number | null;
}

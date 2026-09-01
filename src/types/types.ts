export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

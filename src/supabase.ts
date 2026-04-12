import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type UserRole = 'admin' | 'employee' | 'client';

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  photo_url?: string;
  subscription_expires_at?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  barbershop_id: string;
}

export interface Order {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  value: number;
  scheduled_at: string;
  created_at: string;
}

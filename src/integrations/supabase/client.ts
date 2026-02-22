// Supabase client – uses VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from env
// Add to .env: VITE_SUPABASE_URL=https://<ref>.supabase.co  VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
// If not set, a placeholder client is used – Supabase features won't work until .env is configured.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || PLACEHOLDER_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || PLACEHOLDER_KEY;

/** True if real Supabase credentials are set in .env (app can use Auth, DB, Storage, Edge Functions). */
export const isSupabaseConfigured =
  SUPABASE_URL !== PLACEHOLDER_URL && SUPABASE_PUBLISHABLE_KEY !== PLACEHOLDER_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

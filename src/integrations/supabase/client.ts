// Supabase client – uses VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from env
// Add to .env: VITE_SUPABASE_URL=https://<ref>.supabase.co  VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
// If not set, a placeholder client is used – Supabase features won't work until .env is configured.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://placeholder.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || 'placeholder-key';

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

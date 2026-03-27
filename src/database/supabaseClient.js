import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || !supabaseAnonKey ||
  supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

if (isPlaceholder) {
  console.warn("Supabase credentials missing or placeholder. Supabase features will be disabled.");
}

// Create a real client only when credentials are valid
export const supabase = isPlaceholder
  ? {
      auth: {
        signInWithPassword: async () => ({ data: null, error: null }),
        signUp: async () => ({ data: null, error: null }),
        signOut: async () => {},
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: function() { return this; },
      }),
    }
  : createClient(supabaseUrl, supabaseAnonKey);

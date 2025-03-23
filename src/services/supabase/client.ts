import { createClient } from '@supabase/supabase-js';

// Connect to Supabase using the provided environmental variables
const supabaseUrl = `https://${import.meta.env.VITE_DB_HOST}`;
const supabaseKey = import.meta.env.VITE_DB_PASSWORD;

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});
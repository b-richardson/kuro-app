import { createClient } from "@supabase/supabase-js";

// Get your Supabase URL and keys from your .env.local file.
// Make sure your .env.local file contains:
//   VITE_SUPABASE_URL=your-supabase-url
//   VITE_SUPABASE_ANON_KEY=your-anon-key
//   VITE_SUPABASE_SERVICE_KEY=your-service-key (optional, for development)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// In development, if you have a service key defined, use it for full access.
// Otherwise, use the anon key.
const SUPABASE_KEY =
  import.meta.env.DEV && import.meta.env.VITE_SUPABASE_SERVICE_KEY
    ? import.meta.env.VITE_SUPABASE_SERVICE_KEY
    : import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the mode for debugging purposes.
console.log(
  import.meta.env.DEV
    ? "Running in development mode"
    : "Running in production mode"
);

// Create and export the Supabase client.
// Configure session handling for the application
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
});
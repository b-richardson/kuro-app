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
// Configure session handling for the application with enhanced persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Explicitly set storage to localStorage to ensure sessions persist
    storage: localStorage,
    storageKey: 'obsidian-template-creator-auth', // Use a specific key for our app
    flowType: 'implicit' // Use implicit flow for better vite dev server compatibility
  },
  // Set global database schema
  db: {
    schema: 'public',
  },
  // Configure cookie options for better persistence
  cookies: {
    // Use a long-lived cookie (30 days)
    lifetime: 60 * 60 * 24 * 30, 
    domain: window.location.hostname, // Set to current domain
    sameSite: 'lax',
    path: '/',
    secure: window.location.protocol === 'https:'
  }
});
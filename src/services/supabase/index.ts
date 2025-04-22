import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Client Configuration
 *
 * This file configures and exports the Supabase client for use throughout the application.
 * It's set up with optimal settings for authentication and session handling.
 */

// Get Supabase URL and keys from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In development, use service key if available (for admin operations)
const SUPABASE_KEY =
  import.meta.env.DEV && import.meta.env.VITE_SUPABASE_SERVICE_KEY
    ? import.meta.env.VITE_SUPABASE_SERVICE_KEY
    : SUPABASE_ANON_KEY;

// Log runtime mode for debugging
console.log(
  import.meta.env.DEV
    ? "Running in development mode"
    : "Running in production mode"
);

// Storage key for consistent session management
const STORAGE_KEY = "obsidian-template-creator-auth";

/**
 * Supabase client with optimal auth configuration
 *
 * Key configuration points:
 * - autoRefreshToken: Automatically refreshes the token before it expires
 * - persistSession: Maintains the session across page reloads
 * - detectSessionInUrl: Handles OAuth redirects automatically
 * - storage: Uses browser's localStorage for session persistence
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: STORAGE_KEY,
    flowType: "pkce",
    debug: import.meta.env.DEV, // Enable debug logs in development
  },
  // Global database schema
  db: {
    schema: "public",
  },
  // Robust global fetch timeout configuration
  global: {
    headers: {
      "X-Client-Info": "obsidian-template-creator",
    },
    fetch: (url, options) => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );

      return Promise.race([
        fetch(url, options),
        timeoutPromise,
      ]) as Promise<Response>;
    },
  },
});

// For debugging: Detect any stuck pending auth state in localStorage
try {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    const hasPendingAuthState =
      parsed?.pendingAuthState?.status === "in-progress";

    if (hasPendingAuthState) {
      console.warn(
        "Detected pending auth state that might be stuck. This could cause auth issues.",
        parsed.pendingAuthState
      );
      // We don't auto-clear this as it could be legitimate, but this log helps with debugging
    }
  }
} catch (e) {
  console.error("Error checking for pending auth state:", e);
}

export * from "./database";
export * from "./types";

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

/**
 * Auth Store
 *
 * This store provides a centralized source of truth for authentication state
 * using Pinia and Supabase Auth. Key features:
 *
 * - Maintains both user object and session for complete auth state
 * - Uses isAuthenticated computed property that checks both user and session
 * - Reacts to Supabase's onAuthStateChange events to keep state in sync
 * - Provides explicit initialize() method that must be called when app starts
 * - Tracks initialization status to prevent duplicate initialization
 * - Provides a userId getter for convenience with proper typing
 * - Implements comprehensive error handling for all auth operations
 *
 * IMPORTANT: The auth store must be initialized at app startup using:
 *   1. Direct call to authStore.initialize() in App.vue, or
 *   2. Through the initializeAuth() utility function
 *
 * Auth state consistency is guaranteed only after initialization is complete.
 */

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value);
  const userId = computed(() => user.value?.id || null);

  /**
   * Initialize the auth store and set up auth state change listener
   * This should be called when the app starts
   */
  const initialize = async (): Promise<boolean> => {
    if (initialized.value) return true;

    isLoading.value = true;
    error.value = null;

    try {
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      session.value = sessionData.session;

      // If we have a session, get user data
      if (session.value) {
        const { data: userData } = await supabase.auth.getUser();
        user.value = userData.user;
      }

      // Set up the auth state change subscription
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log(`Auth state changed: ${event}`);
        session.value = newSession;

        if (newSession) {
          // When we get a new session, update the user data
          const { data } = await supabase.auth.getUser();
          user.value = data.user;
        } else {
          // Clear user when session is gone
          user.value = null;
        }
      });

      // Cleanup function for the subscription could be implemented if needed

      initialized.value = true;
      isLoading.value = false;
      return true;
    } catch (err) {
      const e = err as Error;
      console.error("Failed to initialize auth store:", e);
      error.value = e.message;
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Sign in a user with email and password
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        error.value = authError.message;
        isLoading.value = false;
        return false;
      }

      session.value = data.session;
      user.value = data.user;
      isLoading.value = false;
      return true;
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Sign up a new user with email and password
   */
  const signUp = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; confirmationRequired: boolean }> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        error.value = signUpError.message;
        isLoading.value = false;
        return { success: false, confirmationRequired: false };
      }

      session.value = data.session;
      user.value = data.user;
      isLoading.value = false;

      return {
        success: true,
        confirmationRequired: !data.session,
      };
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      isLoading.value = false;
      return { success: false, confirmationRequired: false };
    }
  };

  /**
   * Send a password reset email
   */
  const resetPassword = async (email: string): Promise<boolean> => {
    error.value = null;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password?update=true`,
        }
      );

      if (resetError) {
        error.value = resetError.message;
        return false;
      }

      return true;
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      return false;
    }
  };

  /**
   * Update the user's password after a reset
   */
  const updatePassword = async (password: string): Promise<boolean> => {
    error.value = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        error.value = updateError.message;
        return false;
      }

      return true;
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      return false;
    }
  };

  /**
   * Check if the user is authenticated and refresh user data
   */
  const checkAuth = async (): Promise<boolean> => {
    error.value = null;

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        session.value = null;
        user.value = null;
        return false;
      }

      session.value = data.session;

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        user.value = null;
        return false;
      }

      user.value = userData.user;
      return true;
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      return false;
    }
  };

  /**
   * Sign out the current user
   */
  const logout = async (): Promise<boolean> => {
    error.value = null;

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        error.value = signOutError.message;
        return false;
      }

      session.value = null;
      user.value = null;
      return true;
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      return false;
    }
  };

  /**
   * Sign in with an OAuth provider
   */
  const signInWithOAuth = async (
    provider: "google" | "github" | "facebook" | "twitter",
    options: { redirectTo?: string } = {}
  ): Promise<{ success: boolean; data?: any }> => {
    error.value = null;

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (oauthError) {
        error.value = oauthError.message;
        return { success: false };
      }

      return { success: true, data };
    } catch (err) {
      const e = err as Error;
      error.value = e.message;
      return { success: false };
    }
  };

  return {
    // State
    user,
    session,
    error,
    isLoading,
    initialized,

    // Getters
    isAuthenticated,
    userId,

    // Actions
    initialize,
    login,
    signUp,
    logout,
    resetPassword,
    updatePassword,
    checkAuth,
    signInWithOAuth,
  };
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/index";

/**
 * Auth Store
 *
 * This store provides a centralized source of truth for authentication state.
 * It leverages Supabase's built-in session management while providing a clean
 * interface for the application to interact with. It should only Use Supabase’s built-in session management
 * and provide a clean interface for the application to interact with.
 * React directly to onAuthStateChange events to update the session and user data.
 * Provide a method to initialize the store with the current session and user data.
 * Use the session returned by supabase.auth.getSession() in App.vue or a top-level composable.
 */

/**
 * Auth Store Definition
 */
export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!session.value);

  const initialize = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    session.value = currentSession;

    if (currentSession) {
      const { data: userData } = await supabase.auth.getUser();
      user.value = userData.user;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      error.value = authError.message;
      isLoading.value = false;
      return false;
    }

    session.value = data.session;
    user.value = data.user;
    isLoading.value = false;
    return true;
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; confirmationRequired: boolean }> => {
    isLoading.value = true;
    error.value = null;

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
  };

  const resetPassword = async (email: string): Promise<boolean> => {
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
  };

  const checkAuth = async (): Promise<boolean> => {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !data.session) {
      session.value = null;
      user.value = null;
      return false;
    }

    session.value = data.session;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      user.value = null;
      return false;
    }

    user.value = userData.user;
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    session.value = null;
    user.value = null;
  };

  const signInWithOAuth = async (
    provider: "google" | "github" | "facebook" | "twitter",
    options: { redirectTo?: string } = {}
  ): Promise<{ success: boolean; data?: any }> => {
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options,
    });

    if (oauthError) {
      error.value = oauthError.message;
      return { success: false };
    }

    return { success: true, data };
  };

  supabase.auth.onAuthStateChange(async (_, newSession) => {
    session.value = newSession;

    if (newSession) {
      const { data: userData } = await supabase.auth.getUser();
      user.value = userData.user;
    } else {
      user.value = null;
    }
  });

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    initialize,
    login,
    signUp,
    logout,
    resetPassword,
    checkAuth,
    signInWithOAuth,
  };
});

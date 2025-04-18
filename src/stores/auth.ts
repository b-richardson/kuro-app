import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, Session, Provider } from "@supabase/supabase-js";
import {
  getSession,
  getUser,
  onAuthStateChange,
  signIn,
  signUp,
  signOut,
  resetPassword as resetPasswordService,
  updateUser,
  signInWithOAuth as signInWithOAuthService,
} from "@/services/supabase/auth";

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
   */
  const initialize = async (): Promise<boolean> => {
    if (initialized.value) return true;
    isLoading.value = true;
    error.value = null;

    try {
      const { data: sessionData } = await getSession();
      session.value = sessionData.session;

      if (session.value) {
        const { data: userData } = await getUser();
        user.value = userData.user;
      }

      const {
        data: { subscription },
      } = onAuthStateChange(async (event, newSession) => {
        console.log(`Auth state changed: ${event}`);
        session.value = newSession;

        if (newSession) {
          const { data } = await getUser();
          user.value = data.user;
        } else {
          user.value = null;
        }
      });

      initialized.value = true;
      isLoading.value = false;
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      isLoading.value = false;
      return false;
    }
  };

  /**
   * Sign in user
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await signIn(email, password);
      if (authError) {
        error.value = authError.message;
        return false;
      }

      session.value = data.session;
      user.value = data.user;
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Sign up user
   */
  const register = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; confirmationRequired: boolean }> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: signUpError } = await signUp(email, password);
      if (signUpError) {
        error.value = signUpError.message;
        return { success: false, confirmationRequired: false };
      }

      session.value = data.session;
      user.value = data.user;

      return {
        success: true,
        confirmationRequired: !data.session,
      };
    } catch (err) {
      error.value = (err as Error).message;
      return { success: false, confirmationRequired: false };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Send password reset
   */
  const resetPassword = async (email: string): Promise<boolean> => {
    error.value = null;
    try {
      const { error: resetError } = await resetPasswordService(email);
      if (resetError) {
        error.value = resetError.message;
        return false;
      }
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      return false;
    }
  };

  /**
   * Update password after reset
   */
  const updatePassword = async (password: string): Promise<boolean> => {
    error.value = null;
    try {
      const { error: updateError } = await updateUser({ password });
      if (updateError) {
        error.value = updateError.message;
        return false;
      }
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      return false;
    }
  };

  /**
   * Validate user session
   */
  const checkAuth = async (): Promise<boolean> => {
    error.value = null;
    try {
      const { data, error: sessionError } = await getSession();
      if (sessionError || !data.session) {
        session.value = null;
        user.value = null;
        return false;
      }

      session.value = data.session;
      const { data: userData, error: userError } = await getUser();
      if (userError || !userData.user) {
        user.value = null;
        return false;
      }

      user.value = userData.user;
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      return false;
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<boolean> => {
    error.value = null;
    try {
      const { error: signOutError } = await signOut();
      if (signOutError) {
        error.value = signOutError.message;
        return false;
      }

      session.value = null;
      user.value = null;
      return true;
    } catch (err) {
      error.value = (err as Error).message;
      return false;
    }
  };

  /**
   * OAuth sign in
   */
  const signInWithOAuth = async (
    provider: Provider,
    options: { redirectTo?: string } = {}
  ): Promise<{ success: boolean; data?: any }> => {
    error.value = null;
    try {
      const { data, error: oauthError } = await signInWithOAuthService({
        provider,
        options,
      });

      if (oauthError) {
        error.value = oauthError.message;
        return { success: false };
      }

      return { success: true, data };
    } catch (err) {
      error.value = (err as Error).message;
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
    register,
    logout,
    resetPassword,
    updatePassword,
    checkAuth,
    signInWithOAuth,
  };
});

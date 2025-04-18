import {
  AuthError,
  AuthResponse,
  OAuthResponse,
  AuthTokenResponse,
  Session,
  User,
  UserResponse,
  Provider,
  SignInWithOAuthCredentials,
} from "@supabase/supabase-js";
import { supabase } from "./index";

/**
 * Sign up a new user with email and password.
 */
export const signUp = async (
  email: string,
  password: string
): Promise<ReturnType<typeof supabase.auth.signUp>> => {
  return await supabase.auth.signUp({ email, password });
};

/**
 * Sign in an existing user with email and password.
 */
export const signIn = async (
  email: string,
  password: string
): Promise<ReturnType<typeof supabase.auth.signInWithPassword>> => {
  return await supabase.auth.signInWithPassword({ email, password });
};

/**
 * Sign in user with OAuth provider.
 */
export const signInWithOAuth = async (
  credentials: SignInWithOAuthCredentials
): Promise<OAuthResponse> => {
  return await supabase.auth.signInWithOAuth(credentials);
};

/**
 * Sign out the currently authenticated user.
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  return await supabase.auth.signOut();
};

/**
 * Get the current user.
 */
export const getUser = async (): Promise<UserResponse> => {
  return await supabase.auth.getUser();
};

/**
 * Retrieve the current session.
 */
export const getSession = async (): Promise<{
  data: { session: Session | null };
  error: AuthError | null;
}> => {
  return await supabase.auth.getSession();
};

/**
 * Update user data.
 */
export const updateUser = async (attributes: {
  email?: string;
  password?: string;
  data?: { [key: string]: any };
}): Promise<UserResponse> => {
  return await supabase.auth.updateUser(attributes);
};

/**
 * Send password reset email.
 */
export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password?update=true`,
  });
};

/**
 * Verify one-time password (OTP) for email verification or password reset.
 */
export const verifyOtp = async (
  email: string,
  token: string,
  type: "email" | "recovery" = "recovery"
) => {
  return await supabase.auth.verifyOtp({ email, token, type });
};

/**
 * Set up an auth state change listener.
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Refresh the current session.
 */
export const refreshSession = async () => {
  return await supabase.auth.refreshSession();
};

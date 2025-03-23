import { 
  AuthError, 
  AuthResponse, 
  AuthTokenResponse, 
  Session, 
  User,
  UserResponse
} from "@supabase/supabase-js";
import { supabase } from "./index";

/**
 * Type definitions for auth operations
 */
export interface SupabaseAuthResponse<T = any> {
  data: T | null;
  error: Error | AuthError | null;
}

/**
 * Sign up a new user with email and password.
 */
export const signUp = async (
  email: string,
  password: string
): Promise<SupabaseAuthResponse<AuthResponse>> => {
  const response = await supabase.auth.signUp({ email, password });
  return response;
};

/**
 * Sign in an existing user with email and password.
 */
export const signIn = async (
  email: string,
  password: string
): Promise<SupabaseAuthResponse<AuthTokenResponse>> => {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return response;
};

/**
 * Sign in user with OAuth provider.
 */
export const signInWithOAuth = async (
  provider: 'google' | 'github' | 'facebook' | 'twitter'
): Promise<SupabaseAuthResponse<AuthResponse>> => {
  const response = await supabase.auth.signInWithOAuth({
    provider,
  });
  return response;
};

/**
 * Sign out the currently authenticated user.
 */
export const signOut = async (): Promise<{ error: Error | AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Get the current user.
 */
export const getUser = async (): Promise<SupabaseAuthResponse<User>> => {
  const response = await supabase.auth.getUser();
  return response;
};

/**
 * Retrieve the current session.
 */
export const getSession = async (): Promise<SupabaseAuthResponse<Session>> => {
  const response = await supabase.auth.getSession();
  return response;
};

/**
 * Update user data.
 */
export const updateUser = async (
  attributes: { email?: string; password?: string; data?: { [key: string]: any } }
): Promise<SupabaseAuthResponse<UserResponse>> => {
  const response = await supabase.auth.updateUser(attributes);
  return response;
};

/**
 * Send password reset email.
 */
export const resetPassword = async (
  email: string
): Promise<SupabaseAuthResponse> => {
  const response = await supabase.auth.resetPasswordForEmail(email);
  return response;
};

/**
 * Verify one-time password (OTP) for email verification or password reset.
 */
export const verifyOtp = async (
  email: string,
  token: string,
  type: 'email' | 'recovery' = 'recovery'
): Promise<SupabaseAuthResponse<AuthTokenResponse>> => {
  const response = await supabase.auth.verifyOtp({
    email,
    token,
    type
  });
  return response;
};

/**
 * Set up an auth state change listener
 * @returns A subscription object that can be unsubscribed
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Refresh the current session.
 */
export const refreshSession = async (): Promise<SupabaseAuthResponse<AuthTokenResponse>> => {
  const response = await supabase.auth.refreshSession();
  return response;
};
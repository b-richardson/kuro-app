import {
  AuthError,
  AuthResponse,
  AuthTokenResponse,
  Session,
  User,
  UserResponse,
  Provider,
  SignInWithOAuthCredentials
} from "@supabase/supabase-js";
import { supabase } from "./index";

/**
 * Auth Service
 * 
 * This service provides a clean interface to Supabase auth functionality.
 * It centralizes all authentication-related operations to provide a consistent API.
 */

/**
 * Type definitions for auth operations
 */
export interface SupabaseAuthResponse<T = any> {
  data: T | null;
  error: Error | AuthError | null;
}

/**
 * Sign up a new user with email and password.
 * 
 * @param email User's email address
 * @param password User's chosen password
 * @returns Auth response with user and session if successful
 */
export const signUp = async (
  email: string,
  password: string
): Promise<SupabaseAuthResponse<AuthResponse>> => {
  try {
    return await supabase.auth.signUp({ email, password });
  } catch (error) {
    console.error("Error during sign up:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Sign in an existing user with email and password.
 * 
 * @param email User's email address
 * @param password User's password
 * @returns Auth response with user and session if successful
 */
export const signIn = async (
  email: string,
  password: string
): Promise<SupabaseAuthResponse<AuthTokenResponse>> => {
  try {
    return await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    console.error("Error during sign in:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Sign in user with OAuth provider.
 * 
 * @param provider OAuth provider (google, github, etc.)
 * @param options Optional OAuth configuration
 * @returns Auth response with URL to redirect to
 */
export const signInWithOAuth = async (
  credentials: SignInWithOAuthCredentials
): Promise<SupabaseAuthResponse<AuthResponse>> => {
  try {
    return await supabase.auth.signInWithOAuth(credentials);
  } catch (error) {
    console.error("Error during OAuth sign in:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Sign out the currently authenticated user.
 * 
 * @returns Object with error if sign out failed
 */
export const signOut = async (): Promise<{ error: Error | AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Error during sign out:", error);
    return { error: error as Error };
  }
};

/**
 * Get the current user.
 * 
 * @returns Auth response with user data if authenticated
 */
export const getUser = async (): Promise<SupabaseAuthResponse<User>> => {
  try {
    return await supabase.auth.getUser();
  } catch (error) {
    console.error("Error getting user:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Retrieve the current session.
 * 
 * @returns Auth response with session data if authenticated
 */
export const getSession = async (): Promise<SupabaseAuthResponse<Session>> => {
  try {
    return await supabase.auth.getSession();
  } catch (error) {
    console.error("Error getting session:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update user data.
 * 
 * @param attributes User attributes to update
 * @returns Auth response with updated user data
 */
export const updateUser = async (
  attributes: { email?: string; password?: string; data?: { [key: string]: any } }
): Promise<SupabaseAuthResponse<UserResponse>> => {
  try {
    return await supabase.auth.updateUser(attributes);
  } catch (error) {
    console.error("Error updating user:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Send password reset email.
 * 
 * @param email User's email address
 * @returns Auth response with confirmation if successful
 */
export const resetPassword = async (
  email: string
): Promise<SupabaseAuthResponse> => {
  try {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?update=true`
    });
  } catch (error) {
    console.error("Error sending password reset:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Verify one-time password (OTP) for email verification or password reset.
 * 
 * @param email User's email address
 * @param token OTP token from email
 * @param type Type of verification
 * @returns Auth response with session if successful
 */
export const verifyOtp = async (
  email: string,
  token: string,
  type: 'email' | 'recovery' = 'recovery'
): Promise<SupabaseAuthResponse<AuthTokenResponse>> => {
  try {
    return await supabase.auth.verifyOtp({
      email,
      token,
      type
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { data: null, error: error as Error };
  }
};

/**
 * Set up an auth state change listener
 * 
 * @param callback Function to call when auth state changes
 * @returns Subscription object that can be unsubscribed
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Refresh the current session.
 * 
 * @returns Auth response with refreshed session
 */
export const refreshSession = async (): Promise<SupabaseAuthResponse<AuthTokenResponse>> => {
  try {
    return await supabase.auth.refreshSession();
  } catch (error) {
    console.error("Error refreshing session:", error);
    return { data: null, error: error as Error };
  }
};
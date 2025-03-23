import { SignInWithOAuthCredentials } from "./../../../node_modules/@supabase/auth-js/src/lib/types";
import { supabase } from "./index";

// Define an interface for the auth response if you wish to enforce types.
export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Sign up a new user with email and password.
 */
export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

/**
 * Sign in an existing user with email and password.
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * Sign out the currently authenticated user.
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Retrieve the current session.
 */
export const getSession = async (): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

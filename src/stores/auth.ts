import { defineStore } from 'pinia';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as supabaseAuth from '@/services/supabase/auth';
import { supabase } from '@/services/supabase/index';
import router from '@/router';

// Application-specific User type that extends Supabase user data
export interface User {
  id: string;
  email: string;
  name: string;
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'canceled' | 'expired';
    expiresAt: string | null;
  };
  createdAt: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State (keeping the same interface for compatibility)
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const authSubscription = ref<{ data: any } | null>(null);
  const sessionChecked = ref(false); // Track if we've checked the session yet

  // Helper function to map Supabase user to our application User type
  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    // Extract user metadata or use defaults
    const userMetadata = supabaseUser.user_metadata || {};
    const name = userMetadata.name || supabaseUser.email?.split('@')[0] || 'User';
    
    // Default subscription plan for new users
    const subscription = userMetadata.subscription || {
      plan: 'free',
      status: 'active',
      expiresAt: null
    };

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name,
      subscription,
      createdAt: supabaseUser.created_at || new Date().toISOString()
    };
  };

  // Error handling helper
  const handleError = (err: any) => {
    console.error('Auth error:', err);
    const errorMessage = err?.message || err?.error_description || 'An authentication error occurred';
    error.value = errorMessage;
    return false;
  };

  // Login with email and password with enhanced session handling
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Starting login process...');
      const { data, error: signInError } = await supabaseAuth.signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      if (data?.user && data?.session) {
        console.log('Login successful, processing user data and session');
        
        // Map and store user data
        const mappedUser = mapSupabaseUser(data.user);
        user.value = mappedUser;
        isAuthenticated.value = true;
        
        // Ensure session is properly set in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        console.log('Auth state set, user authenticated:', {
          userId: mappedUser.id,
          authenticated: isAuthenticated.value
        });
        
        return true;
      }
      
      throw new Error('No user or session returned from sign in');
    } catch (err) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Sign up with email and password with enhanced session handling
  const signUp = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Starting signup process...');
      const { data, error: signUpError } = await supabaseAuth.signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Check if confirmation is required
      if (data?.user?.identities?.length === 0) {
        console.log('Email confirmation required for signup');
        return { success: true, confirmationRequired: true };
      }
      
      if (data?.user && data?.session) {
        console.log('Signup successful, processing user data and session');
        
        // Map and store user data
        const mappedUser = mapSupabaseUser(data.user);
        user.value = mappedUser;
        isAuthenticated.value = true;
        
        // Ensure session is properly set in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        console.log('Auth state set after signup, user authenticated:', {
          userId: mappedUser.id,
          authenticated: isAuthenticated.value
        });
        
        return { success: true, confirmationRequired: false };
      }
      
      throw new Error('No user or session returned from sign up');
    } catch (err) {
      handleError(err);
      return { success: false, confirmationRequired: false };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout the user with improved cleanup
  const logout = async () => {
    isLoading.value = true;
    
    try {
      // First, clear any stored session in localStorage to ensure clean logout
      localStorage.removeItem('supabase.auth.token');
      
      // Then make the API call to sign out
      const { error: signOutError } = await supabaseAuth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      // Clear local state
      user.value = null;
      isAuthenticated.value = false;
      
      // Clear any other auth-related storage
      localStorage.removeItem('obsidian-template-creator-auth');
      
      return true;
    } catch (err) {
      handleError(err);
      // Still clear local state even on API error
      user.value = null;
      isAuthenticated.value = false;
      
      // Force cleanup of any local storage items
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('obsidian-template-creator-auth');
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Check authentication status with improved session handling
  const checkAuth = async () => {
    isLoading.value = true;
    
    try {
      console.log('Checking auth status...');
      // Make the API call to validate and refresh if needed
      const { data: sessionData, error: sessionError } = await supabaseAuth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      if (sessionData?.session) {
        console.log('Valid session found, getting user details');
        
        // Get user details
        const { data: userData, error: userError } = await supabaseAuth.getUser();
        
        if (userError) {
          console.error('User error:', userError);
          throw userError;
        }
        
        if (userData?.user) {
          console.log('User found, updating auth state');
          const mappedUser = mapSupabaseUser(userData.user);
          user.value = mappedUser;
          isAuthenticated.value = true;
          
          // Force a token refresh to ensure we have a valid session
          await supabaseAuth.refreshSession();
          sessionChecked.value = true;
          
          return true;
        }
      }
      
      // No valid session found
      console.log('No valid session found, not authenticated');
      user.value = null;
      isAuthenticated.value = false;
      sessionChecked.value = true;
      return false;
    } catch (err) {
      console.error('Error in checkAuth:', err);
      handleError(err);
      // Reset auth state on error
      user.value = null;
      isAuthenticated.value = false;
      sessionChecked.value = true;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Password reset request
  const resetPassword = async (email: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: resetError } = await supabaseAuth.resetPassword(email);
      
      if (resetError) {
        throw resetError;
      }
      
      return true;
    } catch (err) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Update profile data
  const updateProfile = async (profile: Partial<User>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Update user metadata in Supabase
      const { data, error: updateError } = await supabaseAuth.updateUser({
        data: {
          name: profile.name,
          subscription: profile.subscription
        }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      if (data?.user) {
        // Update local user state
        user.value = {
          ...user.value!,
          ...profile
        };
        
        return true;
      }
      
      throw new Error('User update failed');
    } catch (err) {
      return handleError(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Sync auth state with router
  const syncAuthStateWithRouter = async () => {
    if (!sessionChecked.value) {
      return; // Don't sync until we've checked the session
    }
    
    const currentRouteName = router.currentRoute.value.name as string;
    const requiresAuth = router.currentRoute.value.meta?.requiresAuth as boolean;
    const hideForAuth = router.currentRoute.value.meta?.hideForAuth as boolean;
    
    console.log('Syncing auth state with router:', {
      isAuthenticated: isAuthenticated.value,
      currentRoute: currentRouteName,
      requiresAuth,
      hideForAuth
    });
    
    // If user is authenticated but on a hideForAuth route, redirect to dashboard
    if (isAuthenticated.value && hideForAuth) {
      console.log('User authenticated but on auth page, redirecting to dashboard');
      router.replace({ name: 'dashboard' });
    }
    // If user is not authenticated but on a requiresAuth route, redirect to login
    else if (!isAuthenticated.value && requiresAuth) {
      console.log('User not authenticated but on protected route, redirecting to login');
      router.replace({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath }
      });
    }
  };
  
  // Watch for auth state changes
  watch(isAuthenticated, (newValue) => {
    console.log('Auth state changed:', { authenticated: newValue });
    syncAuthStateWithRouter();
  });

  // Set up auth state change listener
  onMounted(() => {
    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`, session);
      
      if (event === 'SIGNED_IN' && session) {
        // Get user details and update store
        const { data: userData, error: userError } = await supabaseAuth.getUser();
        
        if (!userError && userData?.user) {
          console.log('SIGNED_IN event with valid user data, updating auth state');
          user.value = mapSupabaseUser(userData.user);
          isAuthenticated.value = true;
          sessionChecked.value = true;
          
          // Force a token refresh to ensure everything is valid
          await supabaseAuth.refreshSession();
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Clear user data on sign out
        console.log(`${event} event, clearing auth state`);
        user.value = null;
        isAuthenticated.value = false;
        sessionChecked.value = true;
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Session refreshed, verify and update if needed
        if (!isAuthenticated.value) {
          console.log('TOKEN_REFRESHED event but not authenticated, checking user data');
          const { data: userData, error: userError } = await supabaseAuth.getUser();
          
          if (!userError && userData?.user) {
            console.log('Valid user data found after token refresh');
            user.value = mapSupabaseUser(userData.user);
            isAuthenticated.value = true;
            sessionChecked.value = true;
          }
        }
      }
    });
    
    // Store subscription for cleanup
    authSubscription.value = data;
    
    // Initialize auth state
    checkAuth().then(() => {
      syncAuthStateWithRouter();
    });
  });

  // Clean up subscriptions
  onUnmounted(() => {
    if (authSubscription.value) {
      authSubscription.value.subscription.unsubscribe();
    }
  });

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionChecked,
    
    // Actions
    login,           // Maintained for backward compatibility
    signUp,          // New method for registration
    logout,          // Maintained for backward compatibility
    checkAuth,       // Maintained for backward compatibility
    resetPassword,   // Added for password reset
    updateProfile,   // Added for profile updates
    syncAuthStateWithRouter // Expose for use in components
  };
});
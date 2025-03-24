<template>
  <div class="login-view">
    <div class="login-container glass-card">
      <div class="login-header">
        <div class="app-logo">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1>
          {{ pageTitle }}
        </h1>
        <p class="login-subtitle">
          {{ pageSubtitle }}
        </p>
      </div>

      <!-- Sign In / Sign Up Form -->
      <form v-if="!isResetPassword && !isEmailSent" class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="your@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group" v-if="!isEmailVerification">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Your password"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Only show for signup -->
        <div class="form-group" v-if="isSignup && !isEmailVerification">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="form-error" v-if="error">
          {{ error }}
        </div>

        <div class="form-success" v-if="successMessage">
          {{ successMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            {{ loadingText }}
          </span>
          <span v-else>
            {{ submitButtonText }}
          </span>
        </button>

        <div class="form-divider" v-if="!isEmailVerification">
          <span>Or</span>
        </div>

        <button
          type="button"
          class="oauth-button google-button"
          @click="handleOAuthLogin('google')"
          v-if="!isEmailVerification"
        >
          <i class="fab fa-google"></i> Continue with Google
        </button>

        <button
          type="button"
          class="oauth-button github-button"
          @click="handleOAuthLogin('github')"
          v-if="!isEmailVerification"
        >
          <i class="fab fa-github"></i> Continue with GitHub
        </button>
      </form>

      <!-- Password Reset Request Form -->
      <form v-if="isResetPassword && !isEmailSent" class="login-form" @submit.prevent="handleResetRequest">
        <div class="form-group">
          <label for="resetEmail">Email</label>
          <input
            type="email"
            id="resetEmail"
            v-model="email"
            placeholder="your@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-error" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            Sending reset link...
          </span>
          <span v-else>
            Send Reset Link
          </span>
        </button>
      </form>

      <!-- Email Sent Confirmation -->
      <div v-if="isEmailSent" class="login-form email-sent-container">
        <div class="email-sent-icon">
          <i class="fas fa-envelope"></i>
        </div>
        <h2>{{ emailSentTitle }}</h2>
        <p>{{ emailSentMessage }}</p>
        <p class="email-sent-address">{{ email }}</p>
        <button class="login-button" @click="goBackToLogin">
          Return to Login
        </button>
      </div>

      <div class="login-footer">
        <p v-if="!isSignup && !isResetPassword && !isEmailVerification && !isEmailSent">
          Don't have an account?
          <a href="#" @click.prevent="goToSignup">Sign up</a>
        </p>
        <p v-else-if="!isResetPassword && !isEmailVerification && !isEmailSent">
          Already have an account?
          <a href="#" @click.prevent="goToLogin">Sign in</a>
        </p>
        <p v-if="!isResetPassword && !isEmailVerification && !isEmailSent">
          <a href="#" @click.prevent="goToResetPassword">Forgot password?</a>
        </p>
        <p v-if="(isResetPassword || isEmailVerification) && !isEmailSent">
          <a href="#" @click.prevent="goToLogin">Back to login</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import * as supabaseAuth from "@/services/supabase/auth";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";

// Props for determining the mode of the form
const props = defineProps({
  isSignup: { type: Boolean, default: false },
  isResetPassword: { type: Boolean, default: false },
  isEmailVerification: { type: Boolean, default: false },
});

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const authStore = useAuthStore();

// Local state for the form
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const isEmailSent = ref(false);
const emailSentTitle = ref("Check your email");
const emailSentMessage = ref("We've sent you a link to verify your email address.");

// Computed properties for dynamic text content
const pageTitle = computed(() => {
  if (props.isResetPassword) return "Reset your password";
  if (props.isEmailVerification) return "Verify your email";
  return props.isSignup ? "Sign Up to Obsidian Template Builder" : "Sign In to Obsidian Template Builder";
});

const pageSubtitle = computed(() => {
  if (props.isResetPassword) return "Enter your email to receive a password reset link";
  if (props.isEmailVerification) return "Check your email for a verification code";
  return props.isSignup ? "Create a new account" : "Sign in to your account";
});

const submitButtonText = computed(() => {
  if (props.isResetPassword) return "Send Reset Link";
  if (props.isEmailVerification) return "Verify Email";
  return props.isSignup ? "Sign Up" : "Sign In";
});

const loadingText = computed(() => {
  if (props.isResetPassword) return "Sending...";
  if (props.isEmailVerification) return "Verifying...";
  return props.isSignup ? "Signing up..." : "Signing in...";
});

// Check if we're in signup mode
const isSignup = computed(() => props.isSignup);

// Handle form submission based on current mode
const handleSubmit = async () => {
  // Clear previous errors/messages
  error.value = "";
  successMessage.value = "";
  
  // Validate form
  if (!email.value || !password.value) {
    error.value = "Please fill in all fields";
    return;
  }
  
  // In signup mode, check if passwords match
  if (isSignup.value && password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  isLoading.value = true;

  try {
    if (isSignup.value) {
      // Handle sign-up
      const { success, confirmationRequired } = await authStore.signUp(email.value, password.value);
      
      if (success) {
        if (confirmationRequired) {
          // Show email confirmation message
          isEmailSent.value = true;
          emailSentTitle.value = "Verify your email";
          emailSentMessage.value = "We've sent you a link to verify your email address. Please check your inbox.";
        } else {
          // Show success toast
          uiStore.showToast("Successfully signed up and logged in", "success");
          
          // Redirect to dashboard or the intended destination
          const redirectPath = (route.query.redirect as string) || "/dashboard";
          console.log('Redirecting after signup to:', redirectPath);
          
          // Force a complete page reload to reinitialize everything
          console.log('Forcing complete page reload after signup to:', redirectPath);
          window.location.replace(redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`);
        }
      } else {
        // Handle sign-up error from authStore
        error.value = authStore.error || "Something went wrong with the sign up process";
      }
    } else {
      // Handle sign-in
      const success = await authStore.login(email.value, password.value);
      
      if (success) {
        // Log authentication state for debugging
        console.log('After login auth state:', {
          authenticated: authStore.isAuthenticated,
          user: authStore.user,
          route: route.path
        });
        
        // Show success toast
        uiStore.showToast("Successfully signed in", "success");
        
        // Redirect to dashboard or the intended destination
        // Use nextTick to ensure the DOM is updated and state changes are processed
        const redirectPath = (route.query.redirect as string) || "/dashboard";
        console.log('Redirecting to:', redirectPath);
        
        // Force a complete page reload to reinitialize everything
        // This is the most reliable way to handle auth state changes
        console.log('Forcing complete page reload to:', redirectPath);
        window.location.replace(redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`);
      } else {
        // Handle sign-in error from authStore
        error.value = authStore.error || "Invalid email or password";
      }
    }
  } catch (err: any) {
    error.value = err.message || "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};

// Handle OAuth login
const handleOAuthLogin = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
  isLoading.value = true;
  error.value = "";
  
  try {
    const { data, error: authError } = await supabaseAuth.signInWithOAuth({ provider });
    
    if (authError) {
      throw authError;
    }
    
    // The OAuth flow will redirect the user away from the app,
    // so we don't need to do anything more here
    if (!data) {
      uiStore.showToast(`Redirecting to ${provider} for authentication...`, "info");
    }
  } catch (err: any) {
    error.value = err.message || `Could not sign in with ${provider}`;
    uiStore.showToast(error.value, "error");
  } finally {
    isLoading.value = false;
  }
};

// Handle password reset request
const handleResetRequest = async () => {
  isLoading.value = true;
  error.value = "";
  
  try {
    const success = await authStore.resetPassword(email.value);
    
    if (success) {
      isEmailSent.value = true;
      emailSentTitle.value = "Reset link sent";
      emailSentMessage.value = "We've sent you a password reset link. Please check your inbox.";
    } else {
      error.value = authStore.error || "Something went wrong sending the reset link";
    }
  } catch (err: any) {
    error.value = err.message || "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};

// Navigation helpers
const goToLogin = () => {
  router.push({ name: "login" });
};

const goToSignup = () => {
  router.push({ name: "signup" });
};

const goToResetPassword = () => {
  router.push({ name: "resetPassword" });
};

const goBackToLogin = () => {
  router.push({ name: "login" });
};

// Check for OAuth redirects on mount
onMounted(async () => {
  console.log('LoginView mounted, checking for OAuth redirects');
  
  // Parse the hash URL for an access token to determine if returning from OAuth
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  
  if (accessToken) {
    console.log('OAuth access token detected, processing authentication');
    // If we have an access token, the user has been authenticated via OAuth
    
    // First check if the user is already properly authenticated in our store
    await authStore.checkAuth();
    
    if (authStore.isAuthenticated) {
      uiStore.showToast("Successfully authenticated", "success");
      
      // We should redirect to the dashboard
      const redirectPath = (route.query.redirect as string) || "/dashboard";
      console.log('Redirecting after OAuth login to:', redirectPath);
      
      // Force a complete page reload to reinitialize everything
      console.log('Forcing complete page reload after OAuth to:', redirectPath);
      window.location.replace(redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`);
    } else {
      console.log('OAuth token detected but user not authenticated in store');
      uiStore.showToast("Authentication in progress...", "info");
      // Give a bit more time for auth state to sync before redirecting
      setTimeout(() => {
        const redirectPath = (route.query.redirect as string) || "/dashboard";
        console.log('OAuth fallback timeout triggered, forcing reload to:', redirectPath);
        window.location.replace(redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`);
      }, 1000);
    }
  }
  
  // Check for any reset token in the URL
  const resetToken = route.query.reset_token;
  if (resetToken) {
    // Handle password reset logic here
    uiStore.showToast("Password reset token detected", "info");
  }
});
</script>

<style scoped>
.login-view {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.login-container {
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  animation: fadeIn 0.5s ease;
}

.login-header {
  padding: var(--spacing-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
}

.app-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin-bottom: var(--spacing-md);
}

.login-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
}

.login-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group input {
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.form-error {
  padding: var(--spacing-sm);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.form-success {
  padding: var(--spacing-sm);
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.login-button {
  padding: var(--spacing-sm);
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 171, 88, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-divider {
  display: flex;
  align-items: center;
  margin: var(--spacing-sm) 0;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}

.form-divider::before,
.form-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--glass-border);
}

.form-divider span {
  padding: 0 var(--spacing-sm);
}

.oauth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.google-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.github-button {
  background: rgba(51, 51, 51, 0.2);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.oauth-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.15);
}

.login-footer {
  padding: var(--spacing-md);
  text-align: center;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.login-footer p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.login-footer a {
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.login-footer a:hover {
  color: var(--color-primary-light);
}

/* Email sent confirmation styles */
.email-sent-container {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.email-sent-icon {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.email-sent-container h2 {
  margin: 0 0 var(--spacing-md);
  font-size: 1.5rem;
}

.email-sent-container p {
  margin: 0 0 var(--spacing-md);
  color: var(--color-text-secondary);
}

.email-sent-address {
  font-weight: bold;
  background: rgba(0, 0, 0, 0.1);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-lg) !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
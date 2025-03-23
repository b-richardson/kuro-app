<template>
  <div class="login-view">
    <div class="login-container glass-card">
      <div class="login-header">
        <div class="app-logo">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1>
          {{ isSignupMode ? "Sign Up" : "Sign In" }} to Obsidian Template
          Builder
        </h1>
        <p class="login-subtitle">
          {{
            isSignupMode ? "Create a new account" : "Sign in to your account"
          }}
        </p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Your password"
            required
          />
        </div>

        <div class="form-error" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            {{ isSignupMode ? "Signing up..." : "Signing in..." }}
          </span>
          <span v-else>
            {{ isSignupMode ? "Sign Up" : "Sign In" }}
          </span>
        </button>

        <div class="form-divider">
          <span>Or</span>
        </div>

        <button
          type="button"
          class="oauth-button google-button"
          @click="handleOAuthLogin('google')"
        >
          <i class="fab fa-google"></i> Continue with Google
        </button>

        <button
          type="button"
          class="oauth-button github-button"
          @click="handleOAuthLogin('github')"
        >
          <i class="fab fa-github"></i> Continue with GitHub
        </button>
      </form>

      <div class="login-footer">
        <p v-if="!isSignupMode">
          Don't have an account?
          <a href="#" @click.prevent="toggleMode">Sign up</a>
        </p>
        <p v-else>
          Already have an account?
          <a href="#" @click.prevent="toggleMode">Sign in</a>
        </p>
        <p>
          <a href="#" @click.prevent="resetPassword">Forgot password?</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { signIn, signUp } from "@/services/supabase/auth";
import { useUIStore } from "@/stores/ui";

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();

// Local state for the form and mode toggle
const email = ref("user@example.com");
const password = ref("password");
const error = ref("");
const isLoading = ref(false);
const isSignupMode = ref(false);

// Handle form submission based on current mode
const handleSubmit = async () => {
  isLoading.value = true;
  error.value = "";

  let authResult;
  if (isSignupMode.value) {
    authResult = await signUp(email.value, password.value);
  } else {
    authResult = await signIn(email.value, password.value);
  }
  isLoading.value = false;

  if (authResult.error) {
    error.value = authResult.error.message;
    uiStore.showToast(authResult.error.message, "error");
    return;
  }

  const redirectPath = (route.query.redirect as string) || "/dashboard";
  router.push(redirectPath);
  uiStore.showToast(
    isSignupMode.value ? "Successfully signed up" : "Successfully signed in",
    "success"
  );
};

// Dummy OAuth login (update with real OAuth logic as needed)
const handleOAuthLogin = (provider: string) => {
  uiStore.showToast(`OAuth login with ${provider} would happen here`, "info");
};

// Toggle between sign in and sign up modes
const toggleMode = () => {
  isSignupMode.value = !isSignupMode.value;
  error.value = ""; // clear errors when toggling
};

// Stub for password reset navigation
const resetPassword = () => {
  uiStore.showToast("Password reset would happen here", "info");
};
</script>

<style scoped>
/* (Keep your existing CSS unchanged) */
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

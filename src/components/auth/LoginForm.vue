<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">Welcome Back to Kuro</h2>
        <p class="auth-subtitle">
          Sign in to continue building powerful Obsidian templates
        </p>
      </div>

      <!-- OAuth providers -->
      <div class="oauth-section">
        <button class="oauth-btn google-btn" @click="handle('oauth', 'google')">
          <i class="fab fa-google oauth-icon"></i>
          <span>Continue with Google</span>
        </button>
        <button class="oauth-btn github-btn" @click="handle('oauth', 'github')">
          <i class="fab fa-github oauth-icon"></i>
          <span>Continue with GitHub</span>
        </button>
        <button class="oauth-btn apple-btn" @click="handle('oauth', 'apple')">
          <i class="fab fa-apple oauth-icon"></i>
          <span>Continue with Apple</span>
        </button>
      </div>

      <div class="divider"><span>or continue with email</span></div>

      <form class="auth-form" @submit.prevent="handle('email')">
        <div class="form-group">
          <label for="email">Email address</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
          </div>
          <div class="error-message" v-if="auth.error && !password">
            Invalid email or password
          </div>
        </div>

        <div class="form-group">
          <div class="label-row">
            <label for="password">Password</label>
            <router-link
              :to="{ name: 'login', query: { type: 'reset-password' } }"
              class="forgot-link"
            >
              Forgot password?
            </router-link>
          </div>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="auth.isLoading">
          <span v-if="!auth.isLoading">Sign In</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>

      <div class="auth-footer">
        <p>
          Don't have an account?
          <router-link
            :to="{ name: 'login', query: { type: 'register' } }"
            class="signup-link"
          >
            Create an account
          </router-link>
        </p>
      </div>

      <div class="terms-privacy">
        By signing in, you agree to our
        <a href="/terms" target="_blank">Terms of Service</a> and
        <a href="/privacy" target="_blank">Privacy Policy</a>
      </div>
    </div>

    <div class="auth-benefits">
      <div class="benefits-content">
        <div class="benefit-item">
          <i class="fas fa-shapes"></i>
          <div>
            <h3>Visual Template Builder</h3>
            <p>Create Obsidian templates without writing code</p>
          </div>
        </div>
        <div class="benefit-item">
          <i class="fas fa-sync-alt"></i>
          <div>
            <h3>Direct Vault Integration</h3>
            <p>Send templates straight to your Obsidian vault</p>
          </div>
        </div>
        <div class="benefit-item">
          <i class="fas fa-users"></i>
          <div>
            <h3>Save & Share Templates</h3>
            <p>Build a library of your custom templates</p>
          </div>
        </div>
      </div>

      <GradientBackground class="benefits-background" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthForm } from "@/composables/useAuthForm";
import GradientBackground from "@/components/UI/GradientBackground.vue";

type OAuthProvider = "google" | "github" | "apple";

const { email, password, login, auth } = useAuthForm();

const router = useRouter();
const showPassword = ref(false);

const handle = async (type: "email" | "oauth", provider?: OAuthProvider) => {
  if (type === "email") {
    const success = await login();
    if (success) {
      const redirectPath = router.currentRoute.value.query.redirect as string;
      router.push(redirectPath || "/dashboard");
    }
  }

  if (type === "oauth" && provider) {
    await auth.signInWithOAuth(provider, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  height: 100%;
}

.auth-card {
  flex: 1;
  padding: 1.5rem;
  max-width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.auth-title {
  font-size: 1.375rem;
  margin-bottom: 0.5rem;
}
.auth-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-light);
}

.oauth-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.oauth-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: var(--color-surface-dark);
  color: var(--color-text);
  justify-content: center;
  font-size: 0.9375rem;
}
.oauth-btn:hover {
  background: var(--color-surface);
}
.oauth-icon {
  font-size: 1.125rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  margin: 1.25rem 0;
  font-size: 0.8125rem;
  color: var(--color-text-light);
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.divider::before {
  left: 0;
}
.divider::after {
  right: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}
.label-row {
  display: flex;
  justify-content: space-between;
}
.input-wrapper {
  position: relative;
}
.input-wrapper i {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: var(--color-text-light);
  font-size: 0.875rem;
  z-index: 2;
}
input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.25rem; /* LEFT for icon, RIGHT for eye */
  border: 1px solid var(--color-border);
  background: var(--color-surface-dark);
  border-radius: 0.5rem;
  color: var(--color-text);
  font-size: 0.9375rem;
  position: relative;
  transition: border-color 0.2s ease;
}
input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-surface-dark); /* Prevent color change */
  color: var(--color-text); /* Prevent turning white */
}
input:-webkit-autofill {
  box-shadow: 0 0 0px 1000px var(--color-surface-dark) inset !important;
  -webkit-text-fill-color: var(--color-text) !important;
  transition: background-color 9999s ease-in-out 0s;
}
.toggle-password {
  position: absolute;
  right: 0.75rem; /* keep a small right margin */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.error-message {
  color: #e53935;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
.forgot-link {
  font-size: 0.75rem;
  color: var(--color-primary);
}

.remember-me {
  font-size: 0.8125rem;
  color: var(--color-text-light);
}

.submit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-light);
}
.signup-link {
  color: var(--color-primary);
}

.terms-privacy {
  font-size: 0.75rem;
  text-align: center;
  margin-top: 1.25rem;
  color: var(--color-text-light);
}

.auth-benefits {
  display: none;
  flex: 1;
  position: relative;
  color: white;
}

.benefits-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
  padding: 1.5rem;
  height: 100%;
}

.benefits-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.benefit-item {
  display: flex;
  gap: 0.75rem;
}
.benefit-item i {
  font-size: 1.25rem;
}
.benefit-item h3 {
  font-size: 1rem;
}
.benefit-item p {
  font-size: 0.875rem;
}

@media (min-width: 992px) {
  .auth-benefits {
    display: block;
  }
}
@media (max-width: 991px) {
  .auth-container {
    flex-direction: column;
    height: auto;
  }
}
</style>

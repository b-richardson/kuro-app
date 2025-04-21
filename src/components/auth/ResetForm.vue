<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">Reset Your Password</h2>
        <p class="auth-subtitle">
          We'll send you a link to create a new password for your Kuro account
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleReset">
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
        </div>

        <button class="submit-btn" type="submit" :disabled="auth.isLoading">
          <span v-if="!auth.isLoading">Send Reset Link</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>

      <div class="auth-footer">
        <p>
          Changed your mind?
          <router-link to="/login" class="signup-link"
            >Back to login</router-link
          >
        </p>
      </div>

      <p v-if="auth.error" class="form-error">{{ auth.error }}</p>
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
import { useRouter } from "vue-router";
import { useAuthForm } from "@/composables/useAuthForm";
import GradientBackground from "@/components/UI/GradientBackground.vue";

const { email, auth } = useAuthForm();
const router = useRouter();

const handleReset = async () => {
  const success = await auth.resetPassword(email.value);
  if (success) {
    router.push({
      name: "login",
      query: {
        email: email.value,
        type: "reset-password",
      },
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
  text-align: center;
  margin: 1.25rem 0;
  font-size: 0.8125rem;
  color: var(--color-text-light);
  position: relative;
}
.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
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
  left: 1rem;
  transform: translateY(-50%);
  color: var(--color-text-light);
  font-size: 0.875rem;
}
input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.25rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface-dark);
  border-radius: 0.5rem;
  color: var(--color-text);
  font-size: 0.9375rem;
}
input:focus {
  outline: none;
  border-color: var(--color-primary);
}
.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  font-size: 0.875rem;
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
  z-index: 2;
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

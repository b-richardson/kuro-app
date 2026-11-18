<template>
  <div class="auth-container">
    <div class="email-sent-container">
      <div class="auth-card">
        <div class="auth-header">
          <i class="fas fa-check-circle large-icon" />
          <h2 class="auth-title">Check Your Email</h2>
          <p class="auth-subtitle">{{ message }}</p>
        </div>

        <div class="auth-form">
          <button
            v-if="email"
            class="submit-btn"
            @click="handleResend"
            :disabled="isSending"
          >
            {{ isSending ? "Resending..." : "Resend Email" }}
          </button>

          <div class="form-footer">
            <router-link to="/login" class="signup-link"
              >Back to Login</router-link
            >
            <router-link
              :to="{ name: 'login', query: { type: 'register' } }"
              class="signup-link"
            >
              Create Account
            </router-link>
          </div>
        </div>

        <div class="terms-privacy">
          Didn't receive anything? Make sure to check your spam folder too.
        </div>
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
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import GradientBackground from "@/components/UI/GradientBackground.vue";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const auth = useAuthStore();
const isSending = ref(false);

const type = computed(() => route.query.type);
const email = ref((route.query.email as string) || "");

const message = computed(() => {
  if (type.value === "confirm") {
    return "Check your inbox for a verification link to complete your Kuro registration.";
  } else if (type.value === "reset-password") {
    return "If an account with that email exists, we’ve sent you a reset password link.";
  }
  return "";
});

const handleResend = async () => {
  if (!email.value) return;
  isSending.value = true;

  try {
    if (type.value === "reset-password") {
      await auth.resetPassword(email.value);
    } else {
      // Supabase does not provide a "resend confirmation email" endpoint.
      // This reuses the `register` method with a dummy password to trigger a re-send
      // if the user exists but hasn't confirmed yet. Not ideal, but works without a backend.
      // Note: This will fail if the user is already confirmed or if email confirmation is disabled.
      await auth.register(email.value, "placeholder-password");
    }
  } finally {
    isSending.value = false;
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

.large-icon {
  font-size: 2.5rem;
  color: var(--color-success, #4caf50);
  margin-bottom: 0.75rem;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.25rem;
}

.email-sent-container {
  display: flex;
  justify-content: center;
  align-items: center;
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

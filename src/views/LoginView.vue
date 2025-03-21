<template>
  <div class="login-view">
    <div class="login-container glass-card">
      <div class="login-header">
        <div class="app-logo">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1>Obsidian Template Builder</h1>
        <p class="login-subtitle">Sign in to your account</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
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
        
        <div class="form-error" v-if="authStore.error">
          {{ authStore.error }}
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading">
            <i class="fas fa-spinner fa-spin"></i> Signing in...
          </span>
          <span v-else>Sign In</span>
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
        <p>Don't have an account? <a href="#" @click.prevent="goToSignup">Sign up</a></p>
        <p><a href="#" @click.prevent="resetPassword">Forgot password?</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUIStore();

// Form state
const email = ref('');
const password = ref('');

// Login methods
const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  
  if (success) {
    // Navigate to the redirect path or dashboard
    const redirectPath = route.query.redirect as string || '/dashboard';
    router.push(redirectPath);
    
    uiStore.showToast('Successfully signed in', 'success');
  }
};

const handleOAuthLogin = (provider: string) => {
  // In a real app, this would redirect to the OAuth provider
  uiStore.showToast(`OAuth login with ${provider} would happen here`, 'info');
};

const goToSignup = () => {
  // In a real app, this would navigate to the signup page
  uiStore.showToast('Signup would happen here', 'info');
};

const resetPassword = () => {
  // In a real app, this would navigate to password reset
  uiStore.showToast('Password reset would happen here', 'info');
};

// For demo purposes, pre-fill the email
email.value = 'user@example.com';
password.value = 'password';
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
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
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
  color: #F44336;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.login-button {
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
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
  content: '';
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
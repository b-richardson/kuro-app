<template>
  <div class="auth-callback-container">
    <div class="auth-callback-content">
      <div class="loader"></div>
      <h2>{{ message }}</h2>
      <p>{{ subMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

// Component state
const message = ref('Completing authentication...');
const subMessage = ref('Please wait while we process your sign-in.');
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUIStore();

// Handle OAuth callback
onMounted(async () => {
  console.log('Auth callback component mounted, processing OAuth redirect');

  try {
    // Supabase detects the hash fragment and session tokens automatically
    // We just need to check if authentication succeeded
    await authStore.checkAuth();
    
    // Check if we're authenticated after the check
    if (authStore.isAuthenticated) {
      message.value = 'Authentication successful';
      subMessage.value = 'You will be redirected shortly...';
      
      console.log('Auth callback: Successfully authenticated');
      
      // Show success notification
      uiStore.showToast('Successfully signed in', 'success');
      
      // Get redirect destination from query param or default to dashboard
      const redirectPath = route.query.redirect as string || '/dashboard';
      
      // Redirect after a short delay to ensure UI is updated
      setTimeout(() => {
        router.replace(redirectPath);
      }, 1500);
    } else {
      // Authentication failed
      message.value = 'Authentication failed';
      subMessage.value = 'Unable to complete the sign-in process. Please try again.';
      
      console.error('Auth callback: Failed to authenticate');
      uiStore.showToast('Authentication failed. Please try again.', 'error');
      
      // Redirect to login after delay
      setTimeout(() => {
        router.replace({ name: 'login' });
      }, 3000);
    }
  } catch (error) {
    console.error('Error during OAuth callback processing:', error);
    
    message.value = 'Authentication error';
    subMessage.value = 'An error occurred while processing your sign-in.';
    
    // Show error notification
    uiStore.showToast('Authentication error. Please try again.', 'error');
    
    // Redirect to login after delay
    setTimeout(() => {
      router.replace({ name: 'login' });
    }, 3000);
  }
});
</script>

<style scoped>
.auth-callback-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.auth-callback-content {
  max-width: 500px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* Removed blur effect */
  animation: fadeIn 0.5s ease;
}

h2 {
  margin-top: 1.5rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

p {
  margin-top: 0.5rem;
  color: var(--color-text-secondary);
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--color-text-tertiary);
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
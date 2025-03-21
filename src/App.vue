<template>
  <div class="app">
    <!-- Global toast notifications -->
    <ToastNotification ref="toastRef" position="top-right" />
    
    <!-- Router view that will render the current route's component -->
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import ToastNotification from './components/UI/ToastNotification.vue';
import { useUIStore, usePreferencesStore, useTemplateStore } from './stores';

// Component references
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null);
const router = useRouter();

// Get stores
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const templateStore = useTemplateStore();

// Load stored data
onMounted(() => {
  preferencesStore.loadPreferences();
  templateStore.loadTemplates();
  uiStore.loadUIPreferences();
  
  // Navigate based on last visited view
  const lastView = preferencesStore.lastVisitedView;
  
  if (lastView === 'editor') {
    const templateId = templateStore.currentTemplateId || '';
    
    if (templateId) {
      router.replace(`/editor/${templateId}`);
    } else {
      router.replace('/library');
    }
  } else if (lastView === 'library') {
    router.replace('/library');
  } else if (router.currentRoute.value.path === '/') {
    // If we're at the root path, go to library unless this is first visit
    const firstVisit = localStorage.getItem('obsidian-template-creator-first-visit');
    if (firstVisit) {
      router.replace('/library');
    } else {
      localStorage.setItem('obsidian-template-creator-first-visit', 'false');
    }
  }
});

// Watch for toast messages
watchEffect(() => {
  if (uiStore.toastMessages.length > 0 && toastRef.value) {
    uiStore.toastMessages.forEach(toast => {
      switch (toast.type) {
        case 'success':
          toastRef.value?.success(toast.message);
          break;
        case 'error':
          toastRef.value?.error(toast.message);
          break;
        case 'info':
        default:
          toastRef.value?.info(toast.message);
      }
      uiStore.removeToast(toast.id);
    });
  }
});

// Expose toast functionality to other components (will be deprecated in favor of store)
defineExpose({
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    uiStore.addToast(message, type as any);
  }
});
</script>

<style>
/* Global styles remain in main style.css */

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
/* App container */
.app {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
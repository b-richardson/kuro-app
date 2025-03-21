<template>
  <div class="app" :class="{ 'theme-dark': isDarkTheme, 'theme-light': !isDarkTheme }">
    <!-- Background with gradient and noise -->
    <GradientBackground />
    
    <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Global Sidebar -->
      <GlobalSidebar 
        :is-modified="isModified"
        @add-section="handleAddSection"
        @save-template="handleSaveTemplate"
        @export-template="handleExportTemplate"
        @new-template="handleNewTemplate"
        @theme-change="handleThemeChange"
      />
      
      <!-- Main Content Area -->
      <main class="app-content">
        <!-- Mobile sidebar toggle -->
        <button 
          class="sidebar-toggle glass-button" 
          @click="toggleSidebar"
          aria-label="Toggle sidebar"
        >
          <i class="fas" :class="sidebarCollapsed ? 'fa-bars' : 'fa-times'"></i>
        </button>
        
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- Global components -->
    <ToastNotification ref="toastRef" position="top-right" />
    
    <!-- Export Dialog (when triggered) -->
    <ExportDialog v-if="showExportDialog" @close="showExportDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplateStore } from './stores/template';
import { useUIStore } from './stores/ui';
import { usePreferencesStore } from './stores/preferences';

import GradientBackground from './components/UI/GradientBackground.vue';
import GlobalSidebar from './components/Layout/GlobalSidebar.vue';
import ToastNotification from './components/UI/ToastNotification.vue';
import ExportDialog from './components/TemplateCreator/ExportDialog.vue';

// Component references
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null);
const router = useRouter();
const sidebarCollapsed = ref(false);
const showExportDialog = ref(false);
const isDarkTheme = ref(true);

// Get stores
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const templateStore = useTemplateStore();

// Computed
const isModified = computed(() => uiStore.isModified);

// Toggle sidebar for mobile 
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// Methods
const handleAddSection = (section) => {
  templateStore.addSection(section);
  uiStore.setModified(true);
};

const handleSaveTemplate = async () => {
  try {
    await templateStore.saveCurrentTemplate();
    uiStore.showToast('Template saved successfully', 'success');
    uiStore.setModified(false);
  } catch (error) {
    uiStore.showToast(`Error saving template: ${error}`, 'error');
  }
};

const handleExportTemplate = () => {
  showExportDialog.value = true;
};

const handleNewTemplate = () => {
  if (uiStore.isModified) {
    uiStore.showConfirmationDialog(
      'Unsaved Changes',
      'You have unsaved changes. Do you want to save before creating a new template?',
      'Save',
      'Discard',
      async () => {
        await handleSaveTemplate();
        createNewTemplate();
      },
      () => {
        createNewTemplate();
      }
    );
  } else {
    createNewTemplate();
  }
};

const createNewTemplate = () => {
  templateStore.createNewTemplate();
  router.push({ name: 'editor' });
};

const handleThemeChange = (theme) => {
  isDarkTheme.value = theme === 'dark';
  preferencesStore.setTheme(theme);
};

// Provide theme to components
provide('theme', computed(() => isDarkTheme.value ? 'dark' : 'light'));

// Load stored data
onMounted(() => {
  preferencesStore.loadPreferences();
  templateStore.loadTemplates();
  uiStore.loadUIPreferences();
  
  // Set theme - default to dark or system preference
  const savedTheme = preferencesStore.theme || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  isDarkTheme.value = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
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
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.app-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Theme classes */
.theme-dark {
  --color-bg: #1E1E2E;
  --color-text: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.75);
  --color-text-tertiary: rgba(255, 255, 255, 0.5);
}

.theme-light {
  --color-bg: #f8f9fa;
  --color-text: #333;
  --color-text-secondary: #555;
  --color-text-tertiary: #777;
}

/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile sidebar toggle */
.sidebar-toggle {
  position: fixed;
  top: var(--spacing-md);
  left: var(--spacing-md);
  width: 40px;
  height: 40px;
  background: rgba(30, 30, 46, 0.7);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  cursor: pointer;
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  display: none;
}

.sidebar-toggle i {
  font-size: 1.1rem;
  color: var(--color-text);
}

/* Media queries for responsive design */
@media (max-width: 768px) {
  .app-layout.sidebar-collapsed .global-sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar-toggle {
    display: flex;
  }
  
  .app-layout:not(.sidebar-collapsed) .sidebar-toggle {
    left: 240px; /* Width of sidebar on mobile */
  }
}
</style>
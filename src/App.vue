<template>
  <div
    class="app"
    :class="{ 'theme-dark': isDarkTheme, 'theme-light': !isDarkTheme }"
  >
    <GradientBackground />

    <div
      class="app-layout"
      :class="{
        'sidebar-collapsed': sidebarCollapsed,
        'with-sidebar': authStore.isAuthenticated && !isAuthRoute,
      }"
    >
      <GlobalSidebar
        v-if="authStore.isAuthenticated && !isAuthRoute"
        :is-modified="isModified"
        @save-template="handleSaveTemplate"
        @new-template="handleNewTemplate"
        @theme-change="handleThemeChange"
        @logout="handleLogout"
      />

      <!-- Main content -->
      <main class="app-content">
        <button
          v-if="authStore.isAuthenticated && !isAuthRoute"
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

    <ToastNotification ref="toastRef" position="top-right" />
    <ExportDialog v-if="showExportDialog" @close="showExportDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "./stores/template";
import { useUIStore } from "./stores/ui";
import { usePreferencesStore } from "./stores/preferences";
import { useAuthStore } from "./stores/auth";
import { useObsidianStore } from "./stores/obsidian";
import { initializeAuth } from "./utils/authInitializer";
import { restoreObsidianConnection } from "./utils/obsidianUtils";

import GradientBackground from "./components/UI/GradientBackground.vue";
import GlobalSidebar from "./components/Layout/GlobalSidebar.vue";
import ToastNotification from "./components/UI/ToastNotification.vue";
import ExportDialog from "./components/Export/ExportDialog.vue";

// Refs and stores
const router = useRouter();
const toastRef = ref(null);
const sidebarCollapsed = ref(false);
const showExportDialog = ref(false);
const isDarkTheme = ref(true);
const appInitialized = ref(false);

// Provide theme to all components
provide("theme", isDarkTheme);

const authStore = useAuthStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const templateStore = useTemplateStore();
const obsidianStore = useObsidianStore();

const isModified = computed(() => uiStore.isModified);

// Detect current route
const isAuthRoute = computed(() => {
  const name = router.currentRoute.value.name as string;
  return [
    "login",
    "signup",
    "resetPassword",
    "auth-callback",
    "landing",
    "home",
  ].includes(name);
});

// Handlers
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleSaveTemplate = async () => {
  try {
    await templateStore.saveCurrentTemplate();
    uiStore.showToast("Template saved successfully", "success");
    uiStore.setModified(false);
  } catch (error) {
    uiStore.showToast(`Error saving template: ${error}`, "error");
  }
};

const handleNewTemplate = () => {
  if (uiStore.isModified) {
    uiStore.showConfirmationDialog(
      "Unsaved Changes",
      "You have unsaved changes. Do you want to save before creating a new template?",
      "Save",
      "Discard",
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
  router.push({ name: "editor" });
};

const handleThemeChange = (theme: string) => {
  isDarkTheme.value = theme === "dark";
  preferencesStore.setEditorTheme(theme);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "landing" });
};

// Init logic
onMounted(async () => {
  console.log("App.vue mounting...");

  try {
    await initializeAuth();
    preferencesStore.loadPreferences();

    const savedTheme =
      preferencesStore.editorTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    isDarkTheme.value = savedTheme === "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (authStore.isAuthenticated) {
      await Promise.allSettled([
        templateStore.loadTemplates(),
        restoreObsidianConnection(),
      ]);
    }

    uiStore.loadUIPreferences?.();
  } catch (err) {
    console.error("App initialization error:", err);
  } finally {
    appInitialized.value = true;
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

.app-layout.with-sidebar .app-content {
  /* margin-left: 260px; Width of sidebar */
}

@media (max-width: 768px) {
  .app-layout.with-sidebar .app-content {
    margin-left: 0;
  }

  .app-layout.with-sidebar.sidebar-collapsed .global-sidebar {
    transform: translateX(-100%);
  }

  .app-layout.with-sidebar:not(.sidebar-collapsed) .sidebar-toggle {
    left: 240px; /* Width of sidebar on mobile */
  }
}

.app-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Theme classes */
.theme-dark {
  --color-bg: #1e1e2e;
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
  /* Removed blur effects that were causing readability issues */
  display: none;
}

.sidebar-toggle i {
  font-size: 1.1rem;
  color: var(--color-text);
}

/* App loading state */
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.app-loading h2 {
  margin-top: 1.5rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

.app-loading .loader {
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

/* Media queries for responsive design */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: flex;
  }
}
</style>

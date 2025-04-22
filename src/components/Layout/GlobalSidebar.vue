<template>
  <div class="global-sidebar">
    <!-- App header with logo -->
    <div class="sidebar-header">
      <div class="app-logo-container">
        <div class="app-logo">
          <img src="@/assets/kuro-icon-mark.png" alt="Kuro" class="logo-icon" />
        </div>
        <h1 class="app-title">Kuro</h1>
      </div>
    </div>

    <!-- Main navigation -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-header">
          <i class="fas fa-cog"></i>
          <span>Workspace</span>
        </div>

        <div class="nav-section-items">
          <router-link
            to="/dashboard"
            class="nav-item"
            :class="{ active: currentRoute === 'dashboard' }"
          >
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </router-link>

          <router-link
            to="/my-templates"
            class="nav-item"
            :class="{ active: currentRoute === 'my-templates' }"
          >
            <i class="fas fa-folder"></i>
            <span>My Templates</span>
          </router-link>

          <router-link
            to="/templates"
            class="nav-item"
            :class="{ active: currentRoute === 'template-browser' }"
          >
            <i class="fas fa-bars"></i>
            <span>Template Browser</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- User section -->
    <div class="user-section" v-if="authStore.user">
      <div class="user-section-header">
        <i class="fas fa-user"></i>
        <span>User</span>
      </div>

      <div
        class="user-profile"
        @click="navigateToSettings"
        role="button"
        tabindex="0"
        :class="{ active: currentRoute === 'settings' }"
      >
        <div class="user-avatar-wrapper">
          <div class="user-avatar">
            {{ getInitials(authStore.user?.email || "") }}
          </div>
          <div
            v-if="obsidianStore.isConnected"
            class="connection-dot"
            title="Connected to Obsidian"
          ></div>
        </div>
        <div class="user-info">
          <div class="user-name">Placeholder for User Name</div>
          <div class="user-action">
            <span>Account Settings</span>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <div class="user-controls">
        <button
          class="control-button"
          @click="toggleTheme"
          aria-label="Toggle theme"
        >
          <i class="fas" :class="isDarkTheme ? 'fa-sun' : 'fa-moon'"></i>
          <span>{{ isDarkTheme ? "Light Mode" : "Dark Mode" }}</span>
        </button>

        <!-- Add this button somewhere in your UI for testing -->
        <button @click="refreshStore" class="refresh-button">
          <i class="fas fa-sync-alt"></i> Refresh Data
        </button>

        <button
          class="control-button logout-button"
          @click="logout"
          aria-label="Logout"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore, usePreferencesStore } from "@/stores";
import { useAuthStore } from "@/stores/auth";
import { useObsidianStore } from "@/stores/obsidian";
import { useDataStoreManager } from "@/stores/dataStoreManager";

// Stores
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const obsidianStore = useObsidianStore();
const dataStoreManager = useDataStoreManager();

const refreshStore = async () => {
  await dataStoreManager.refreshDataStore();
};

// Theme state
const isDarkTheme = ref(true);

// Determine current route
const currentRoute = computed(() => {
  const path = route.path;
  if (path === "/dashboard") return "dashboard";
  if (path === "/my-templates") return "my-templates";
  if (path === "/templates") return "template-browser";
  if (path === "/settings") return "settings";
  return "";
});

// Handlers
const getInitials = (email: string) => {
  if (!email) return "";

  // Get initials from email (first letter of username)
  const username = email.split("@")[0];
  return username.charAt(0).toUpperCase();
};

const logout = () => {
  authStore.logout();
  router.push({ name: "login" });
};

const navigateToSettings = () => {
  router.push({ path: "/settings" });
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  const theme = isDarkTheme.value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  preferencesStore.setEditorTheme(theme);
};

// Init theme
onMounted(() => {
  const savedTheme =
    preferencesStore.editorTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  isDarkTheme.value = savedTheme === "dark";
});
</script>

<style scoped>
.global-sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100vh;
  background: rgba(33, 34, 44, 0.95);
  border-right: 1px solid var(--glass-border);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
  position: relative;
}

/* App header */
.sidebar-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  justify-content: space-between;
  border-bottom: 1px solid var(--glass-border);
  height: 70px; /* Fixed height for consistency */
}

.app-logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.app-logo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.app-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.connection-indicator {
  display: flex;
  align-items: center;
}

/* Main navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
  flex: 1;
}

.nav-section {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-xl);
}

.nav-section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.nav-section-header i {
  font-size: 0.8rem;
  color: var(--color-primary-light);
}

.nav-section-items {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-standard);
  position: relative;
  border-left: 3px solid transparent;
  border-radius: 0;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-primary-light);
}

.nav-item.active {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary-light);
  border-left: 3px solid var(--color-primary);
}

.nav-item.active::after {
  content: "";
  position: absolute;
  right: var(--spacing-lg);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-primary);
}

.nav-item i {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  transition: transform var(--transition-fast);
}

.nav-item:hover i {
  transform: translateX(2px);
}

/* Contextual content */
.sidebar-context {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  max-height: 30vh;
  overflow-y: auto;
}

.context-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--glass-border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
  margin: 0;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filter-group {
  margin-bottom: var(--spacing-sm);
}

.filter-label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.filter-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.875rem;
  appearance: none;
  padding-right: 30px; /* Space for the icon */
}

.select-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
  font-size: 0.75rem;
}

.view-toggle {
  display: flex;
  gap: var(--spacing-xs);
}

.view-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.view-toggle-btn.active {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary-light);
  border-color: var(--color-primary-dark);
}

/* Action button */
.sidebar-actions {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
  transition: all var(--transition-standard);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.3);
}

.action-button i {
  font-size: 0.9rem;
}

/* User section (new) */
.user-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.connection-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #10b981; /* Green */

  border-radius: 50%;
  box-shadow: 0 0 6px #10b981;
}

.user-section {
  padding: var(--spacing-lg) var(--spacing-lg);
  border-top: 1px solid var(--glass-border);
  margin-top: auto; /* Push to bottom */
}

.user-section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.user-section-header i {
  font-size: 0.8rem;
  color: var(--color-primary-light);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  margin-bottom: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-standard);
  position: relative;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(var(--color-primary-rgb), 0.3);
  transform: translateY(-1px);
}

.user-profile:active {
  transform: translateY(0);
}

.user-profile.active {
  background: rgba(var(--color-primary-rgb), 0.08);
  border-color: rgba(var(--color-primary-rgb), 0.4);
}

.user-profile:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.3);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.user-action i {
  font-size: 0.7rem;
  transition: transform var(--transition-fast);
}

.user-profile:hover .user-action i {
  transform: translateX(2px);
}

.user-name {
  font-weight: 500;
  font-size: 0.95rem;
}

/* User controls */
.user-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.control-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
  text-align: left;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.control-button i {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.logout-button {
  color: var(--color-error);
  border-color: rgba(248, 113, 113, 0.2);
}

.logout-button:hover {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.4);
}

.refresh-button {
  background: #60a5fa;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mobile close button */
.mobile-close-button {
  display: none;
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
}

/* Custom scrollbar */
.sidebar-nav::-webkit-scrollbar,
.sidebar-context::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track,
.sidebar-context::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb,
.sidebar-context::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover,
.sidebar-context::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .global-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 280px; /* Slightly wider on mobile */
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
  }

  .global-sidebar.show {
    transform: translateX(0);
  }

  .mobile-close-button {
    display: flex;
  }

  /* Ensure the logo is visible on mobile */
  .app-logo-container {
    margin-right: 40px; /* Space for close button */
  }
}
</style>

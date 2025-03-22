<template>
  <div class="global-sidebar glass-card">
    <!-- App logo and title -->
    <div class="sidebar-header">
      <div class="app-logo">
        <i class="fas fa-file-alt"></i>
      </div>
      <h1 class="app-title">Template Builder</h1>
      
      <!-- Obsidian connection status -->
      <ObsidianStatusIndicator />
    </div>

    <!-- User profile section -->
    <div class="user-profile" v-if="authStore.user">
      <div class="user-avatar">
        {{ getInitials(authStore.user.name) }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ authStore.user.name }}</div>
        <div class="user-plan">
          {{ getPlanLabel(authStore.user.subscription.plan) }}
        </div>
      </div>
    </div>

    <!-- Main navigation -->
    <div class="sidebar-nav">
      <router-link
        to="/dashboard"
        class="nav-item"
        exact
        :class="{ active: currentRoute === 'dashboard' }"
      >
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
      </router-link>

      <router-link
        to="/library"
        class="nav-item"
        :class="{ active: currentRoute === 'library' }"
      >
        <i class="fas fa-folder"></i>
        <span>My Templates</span>
      </router-link>

      <router-link
        to="/template-library"
        class="nav-item"
        :class="{ active: currentRoute === 'templateLibrary' }"
      >
        <i class="fas fa-book"></i>
        <span>Template Library</span>
      </router-link>
      
      <router-link
        to="/obsidian-explorer"
        class="nav-item"
        :class="{ active: currentRoute === 'obsidian-explorer' }"
        v-if="obsidianStore.isConnected"
      >
        <i class="fas fa-mountain"></i>
        <span>Obsidian Explorer</span>
      </router-link>

      <router-link
        to="/settings"
        class="nav-item"
        :class="{ active: currentRoute === 'settings' }"
      >
        <i class="fas fa-cog"></i>
        <span>Settings</span>
      </router-link>
    </div>

    <!-- Divider -->
    <div class="sidebar-divider"></div>

    <!-- Context-sensitive content based on current route -->
    <div class="sidebar-context">
      <!-- Show template filters when in library view -->
      <div v-if="currentRoute === 'library'" class="template-filters">
        <h2 class="sidebar-section-title">Filters</h2>
        <!-- Filter options will go here -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select class="filter-select">
            <option value="name">Name</option>
            <option value="date">Date Modified</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="sidebar-footer">
      <div v-if="currentRoute === 'editor'" class="editor-actions">
        <button
          class="action-button primary-button"
          @click="$emit('save-template')"
          :disabled="!isModified"
        >
          <i class="fas fa-save"></i>
          <span>Save</span>
        </button>

        <button
          class="action-button secondary-button"
          @click="$emit('export-template')"
        >
          <i class="fas fa-download"></i>
          <span>Export</span>
        </button>
      </div>

      <button
        v-else-if="currentRoute === 'dashboard' || currentRoute === 'library'"
        class="action-button primary-button"
        @click="$emit('new-template')"
      >
        <i class="fas fa-plus"></i>
        <span>New Template</span>
      </button>

      <!-- Theme toggle button -->
      <div class="footer-actions">
        <button class="theme-toggle" @click="toggleTheme">
          <i class="fas" :class="isDarkTheme ? 'fa-sun' : 'fa-moon'"></i>
        </button>

        <button class="logout-button" @click="logout">
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
import SectionLibrary from "@/components/TemplateCreator/SectionLibrary.vue";
import ObsidianStatusIndicator from "@/components/Layout/ObsidianStatusIndicator.vue";
import { useUIStore, usePreferencesStore, useObsidianStore } from "@/stores";
import { useAuthStore } from "@/stores/auth";

// Props
const props = defineProps({
  isModified: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits([
  "add-section",
  "save-template",
  "export-template",
  "new-template",
  "theme-change",
]);

// Get stores
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const authStore = useAuthStore();
const obsidianStore = useObsidianStore();
const router = useRouter();

// Get current route
const route = useRoute();
const currentRoute = computed(() => {
  if (route.path === "/dashboard") return "dashboard";
  if (route.path.includes("/editor")) return "editor";
  if (route.path === "/library") return "library";
  if (route.path === "/template-library") return "templateLibrary";
  if (route.path === "/settings") return "settings";
  if (route.path === "/obsidian-explorer") return "obsidian-explorer";
  return "";
});

// User profile methods
const getInitials = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const getPlanLabel = (plan: string) => {
  switch (plan) {
    case "free":
      return "Free Plan";
    case "premium":
      return "Premium Plan";
    case "pro":
      return "Pro Plan";
    default:
      return "Free Plan";
  }
};

const logout = () => {
  authStore.logout();
  router.push({ name: "login" });
};

// Theme toggle
const isDarkTheme = ref(true); // Default to dark theme

onMounted(() => {
  // Initialize theme based on stored preference
  const savedTheme =
    preferencesStore.editorTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  isDarkTheme.value = savedTheme === "dark";
});

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  const themeName = isDarkTheme.value ? "dark" : "light";

  // Update the document theme
  document.documentElement.setAttribute("data-theme", themeName);

  // Store preference
  preferencesStore.setEditorTheme(themeName);

  // Emit theme change
  emit("theme-change", themeName);
};
</script>

<style scoped>
.global-sidebar {
  display: flex;
  flex-direction: column;
  width: 260px; /* Was 280px */
  height: 100vh;
  background: rgba(30, 30, 46, 0.8);
  border-right: 1px solid var(--glass-border);
  border-radius: 0;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, width 0.3s ease;
  overflow: hidden;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: var(--spacing-md) var(--spacing-lg); /* Reduced from var(--spacing-lg) */
  gap: var(--spacing-md);
  justify-content: space-between;
}

.app-logo {
  width: 36px; /* Was 40px */
  height: 36px; /* Was 40px */
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem; /* Was 1.25rem */
  color: white;
}

.app-title {
  font-size: 1.125rem; /* Was 1.25rem */
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
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-md);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md); /* Reduced from var(--spacing-md) */
  border-radius: var(--radius-md);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-fast);
  margin-bottom: 2px; /* Was var(--spacing-xs) */
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary-light);
}

.nav-item i {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.sidebar-divider {
  height: 1px;
  background: var(--glass-border);
  margin: var(--spacing-md) var(--spacing-lg);
}

.sidebar-context {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--spacing-sm); /* Was 0 var(--spacing-md) */
}

.sidebar-section-title {
  font-size: 0.8rem; /* Was 0.9rem */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) var(--spacing-md); /* Was var(--spacing-md) var(--spacing-md) */
}

.section-library-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-filters {
  padding: 0 var(--spacing-sm) var(--spacing-md);
}

.filter-group {
  margin-bottom: var(--spacing-md);
}

.filter-label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.filter-select {
  width: 100%;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.875rem;
}

.sidebar-footer {
  padding: var(--spacing-sm) var(--spacing-md); /* Was var(--spacing-md) */
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.editor-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm); /* Reduced from var(--spacing-sm) var(--spacing-md) */
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9rem; /* Added to reduce text size */
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
}

.primary-button {
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(255, 171, 88, 0.2);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 171, 88, 0.3);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
}

.theme-toggle {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.theme-toggle:hover {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.05);
}

/* Custom scrollbar for sidebar content */
.sidebar-context::-webkit-scrollbar {
  width: 3px; /* Was 4px */
}

.sidebar-context::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-context::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08); /* Lighter, more subtle */
  border-radius: 1.5px;
}

.sidebar-context::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* User profile styles */
.user-profile {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
}

.user-avatar {
  width: 36px;
  height: 36px;
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
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.user-plan {
  font-size: 0.75rem;
  color: var(--color-primary);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.logout-button:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 768px) {
  .global-sidebar {
    width: 240px;
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.2);
  }
}
</style>

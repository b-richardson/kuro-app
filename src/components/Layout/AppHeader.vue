<template>
  <header class="app-header glass-card">
    <div class="header-container">
      <!-- Back Button (if enabled) -->
      <button
        v-if="showBackButton"
        @click="handleBack"
        class="app-header__back-button"
        aria-label="Go back"
      >
        <i class="fas fa-arrow-left"></i>
        <span>Back</span>
      </button>

      <!-- App Logo and Title -->
      <div class="app-branding">
        <div class="app-logo">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1 class="app-header__title">
          {{ title || "Obsidian Template Builder" }}
        </h1>
      </div>

      <!-- Actions Toolbar -->
      <div class="actions">
        <!-- Slot for custom actions -->
        <slot name="actions">
          <!-- Default actions based on current view -->
          <template v-if="view === 'library'">
            <!-- New Template Button in Library View -->
            <button
              @click="createNewTemplate"
              class="btn btn-primary action-btn"
              aria-label="Create new template"
            >
              <i class="fas fa-plus"></i> New Template
            </button>
          </template>

          <template v-else-if="view === 'editor'">
            <!-- Save button -->
            <button
              @click="saveTemplate"
              class="btn btn-primary action-btn"
              aria-label="Save template"
            >
              <i class="fas fa-save"></i> Save
            </button>
          </template>
        </slot>

        <!-- Theme Toggle (always visible) -->
        <button
          class="theme-toggle"
          :class="{ 'theme-dark': isDarkTheme }"
          @click="toggleTheme"
          aria-label="Toggle theme"
        >
          <i class="fas" :class="isDarkTheme ? 'fa-sun' : 'fa-moon'"></i>
        </button>
      </div>
    </div>

    <!-- Global Toast Notifications -->
    <ToastNotification ref="toastRef" position="top-right" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import ToastNotification from "@/components/UI/ToastNotification.vue";
import { usePreferencesStore } from "@/stores/preferences";

// Props
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  sections: {
    default: () => [],
  },
  view: {
    type: String as () => "library" | "editor" | "home",
    default: "home",
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
});

// Stores
const preferencesStore = usePreferencesStore();

// Reactive state
const isDarkTheme = ref(false);

// Emits
const emit = defineEmits<{
  (e: "view-change", view: "library" | "editor" | "home"): void;
  (e: "preview-toggle", visible: boolean): void;
  (e: "save"): void;
  (e: "export", format: string): void;
  (e: "new-template"): void;
  (e: "back"): void;
}>();

// Methods
const createNewTemplate = () => {
  emit("new-template");
};

const handleBack = () => {
  emit("back");
};

const saveTemplate = () => {
  emit("save");
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  const themeName = isDarkTheme.value ? "dark" : "light";

  // Update the document theme
  document.documentElement.setAttribute("data-theme", themeName);
  document.body.classList.toggle("dark-theme", isDarkTheme.value);

  // Store preference
  preferencesStore.setEditorTheme(themeName);
};

// Lifecycle hooks
onMounted(() => {
  // Check for saved theme preference or use system preference
  const savedTheme =
    preferencesStore.editorTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  // Set initial theme state
  isDarkTheme.value = savedTheme === "dark";

  // Apply theme
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.body.classList.toggle("dark-theme", isDarkTheme.value);
});
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--glass-border);

  /* Enhanced glassmorphism effect */
  background: rgba(30, 30, 46, 0.7) !important;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  /* Remove border radius for header */
  border-radius: 0;

  /* Animation for header appearance */
  animation: headerAppear 0.3s ease-out;
}

/* Animation for header appearance */
@keyframes headerAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.app-branding {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    to bottom right,
    var(--color-primary-light),
    var(--color-primary)
  );
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow);
}

.app-logo i {
  font-size: 1.25rem;
  color: var(--color-background);
}

.app-header__title {
  font-size: 1.25rem;
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
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-btn {
  min-width: 120px;
  justify-content: center;
}

.app-header__back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  margin-right: var(--spacing-md);
}

.app-header__back-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.app-header__back-button:active {
  transform: translateY(0);
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  cursor: pointer;
  margin-left: var(--spacing-md);
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--glass-background);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.theme-toggle.theme-dark i {
  color: var(--color-primary-light);
}

.theme-toggle i {
  font-size: 1.1rem;
}

/* Mobile responsive design */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    height: auto;
  }

  .actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    min-width: 0;
  }

  .app-header__title {
    font-size: 1.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .theme-toggle {
    margin-left: var(--spacing-sm);
  }

  .app-header__back-button span {
    display: none;
  }
}

@media (max-width: 480px) {
  .app-logo {
    width: 32px;
    height: 32px;
  }

  .app-header__title {
    font-size: 1rem;
  }

  .actions {
    gap: var(--spacing-xs);
  }

  .action-btn {
    font-size: 0.8rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>

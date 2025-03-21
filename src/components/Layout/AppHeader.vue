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
        <h1 class="app-header__title">{{ title || 'Obsidian Template Builder' }}</h1>
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
            
            <!-- Enhanced Export Dropdown -->
            <ExportDropdown 
              v-if="sections.length > 0"
              ref="exportDropdownRef"
              :sections="sections"
              :initial-profile="exportProfile"
              @profile-changed="handleProfileChanged"
              @export-success="handleExportSuccess"
              @export-error="handleExportError"
            />
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import ExportDropdown from '@/components/TemplateCreator/ExportDropdown.vue';
import ToastNotification from '@/components/UI/ToastNotification.vue';
import { ExportProfileId } from '@/components/TemplateCreator/ExportProfileSelector.vue';
import { usePreferencesStore } from '@/stores/preferences';

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  sections: {
    type: Array as () => TemplateSection[],
    default: () => []
  },
  view: {
    type: String as () => 'library' | 'editor' | 'home',
    default: 'home'
  },
  showBackButton: {
    type: Boolean,
    default: false
  }
});

// References
const exportDropdownRef = ref<InstanceType<typeof ExportDropdown> | null>(null);
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null);

// Stores
const preferencesStore = usePreferencesStore();

// Reactive state
const isDarkTheme = ref(false);
const exportProfile = ref<ExportProfileId>(preferencesStore.currentExportProfile?.id as ExportProfileId || 'full');

// Emits
const emit = defineEmits<{
  (e: 'view-change', view: 'library' | 'editor' | 'home'): void;
  (e: 'preview-toggle', visible: boolean): void;
  (e: 'save'): void;
  (e: 'export', format: string): void;
  (e: 'new-template'): void;
  (e: 'back'): void; 
  (e: 'export-profile-changed', profile: ExportProfileId): void;
}>();

// Methods
const createNewTemplate = () => {
  emit('new-template');
};

const handleBack = () => {
  emit('back');
};

const saveTemplate = () => {
  emit('save');
};

// Handle export profile changes
const handleProfileChanged = (profile: ExportProfileId) => {
  exportProfile.value = profile;
  emit('export-profile-changed', profile);
};

// Handle export success
const handleExportSuccess = (method: 'download' | 'clipboard', profile: ExportProfileId) => {
  if (!toastRef.value) return;
  
  const profileName = getProfileDisplayName(profile);
  
  if (method === 'download') {
    toastRef.value.success(`Downloaded as ${profileName}`, {
      description: 'Your template has been downloaded as a Markdown file.',
      duration: 4000
    });
  } else {
    toastRef.value.success(`Copied to clipboard as ${profileName}`, {
      description: 'The template content has been copied to your clipboard.',
      duration: 4000
    });
  }
};

// Handle export errors
const handleExportError = (error: string) => {
  if (toastRef.value) {
    toastRef.value.error('Export failed', {
      description: error,
      duration: 5000
    });
  }
};

// Get display name for profile
const getProfileDisplayName = (profile: ExportProfileId): string => {
  const foundProfile = preferencesStore.exportProfiles.find(p => p.id === profile);
  if (foundProfile) {
    return foundProfile.name;
  }
  
  switch (profile) {
    case 'plain':
      return 'Plain Markdown';
    case 'templater':
      return 'Templater Format';
    case 'dataview':
      return 'Dataview Format';
    case 'full':
      return 'Full Plugin Format';
    default:
      return 'Markdown';
  }
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  const themeName = isDarkTheme.value ? 'dark' : 'light';
  
  // Update the document theme
  document.documentElement.setAttribute('data-theme', themeName);
  document.body.classList.toggle('dark-theme', isDarkTheme.value);
  
  // Store preference
  preferencesStore.setEditorTheme(themeName);
};

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  // Shortcut for export (Ctrl/Cmd+E)
  if ((e.ctrlKey || e.metaKey) && e.key === 'e' && props.view === 'editor') {
    e.preventDefault();
    if (exportDropdownRef.value) {
      exportDropdownRef.value.open();
    }
  }
  
  // Shortcut for save (Ctrl/Cmd+S)
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && props.view === 'editor') {
    e.preventDefault();
    saveTemplate();
  }
  
  // Shortcut for new template (Ctrl/Cmd+N)
  if ((e.ctrlKey || e.metaKey) && e.key === 'n' && props.view === 'library') {
    e.preventDefault();
    createNewTemplate();
  }
};

// Lifecycle hooks
onMounted(() => {
  // Check for saved theme preference or use system preference
  const savedTheme = preferencesStore.editorTheme || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Set initial theme state
  isDarkTheme.value = savedTheme === 'dark';
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.classList.toggle('dark-theme', isDarkTheme.value);
  
  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  // Remove keyboard shortcut listener when component is unmounted
  document.removeEventListener('keydown', handleKeyDown);
});

// Expose toast for other components to use
defineExpose({
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (toastRef.value) {
      switch (type) {
        case 'success':
          toastRef.value.success(message);
          break;
        case 'error':
          toastRef.value.error(message);
          break;
        case 'warning':
          toastRef.value.warning(message);
          break;
        default:
          toastRef.value.info(message);
      }
    }
  }
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
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
  background: linear-gradient(to bottom right, var(--color-primary-light), var(--color-primary));
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
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
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
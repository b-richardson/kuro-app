<template>
  <header class="app-header glass">
    <div class="header-container">
      <!-- App Logo and Title -->
      <div class="app-branding">
        <div class="app-logo">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1 class="app-title">Obsidian Template Builder</h1>
      </div>
      
      <!-- Actions Toolbar -->
      <div class="actions">
        <!-- Different actions based on current view -->
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
          <!-- Back to Library button in Editor View -->
          <button 
            @click="backToLibrary"
            class="btn btn-outline action-btn"
            aria-label="Back to library"
          >
            <i class="fas fa-arrow-left"></i> Back to Library
          </button>
          
          <!-- Preview button -->
          <button 
            @click="showPreview"
            class="btn btn-outline action-btn"
            aria-label="Preview"
          >
            <i class="fas fa-eye"></i> Preview
          </button>
          
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
import { ref, computed, onMounted } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import ExportDropdown from '@/components/TemplateCreator/ExportDropdown.vue';
import ToastNotification from '@/components/UI/ToastNotification.vue';
import { ExportProfileId } from '@/components/TemplateCreator/ExportProfileSelector.vue';

// Props
const props = defineProps<{
  sections?: TemplateSection[];
  view: 'library' | 'editor';
}>();

// Provide default values for props
const sections = computed(() => props.sections || []);

// References
const exportDropdownRef = ref<InstanceType<typeof ExportDropdown> | null>(null);
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null);

// Reactive state
const isDarkTheme = ref(false);
const exportProfile = ref<ExportProfileId>('full');

// Emits
const emit = defineEmits<{
  (e: 'view-change', view: 'library' | 'editor'): void;
  (e: 'preview-toggle', visible: boolean): void;
  (e: 'save'): void;
  (e: 'export', format: 'markdown' | 'templater' | 'dataview' | 'full'): void;
  (e: 'new-template'): void;
  (e: 'back-to-library'): void;
  (e: 'export-profile-changed', profile: ExportProfileId): void;
}>();

// Methods
const createNewTemplate = () => {
  emit('new-template');
};

const backToLibrary = () => {
  emit('back-to-library');
};

const showPreview = () => {
  emit('preview-toggle', true);
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
  
  // Update the document theme
  if (isDarkTheme.value) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-theme');
  }
  
  // Store preference in localStorage
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
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
  
  // Shortcut for going back to library (Escape in editor view)
  if (e.key === 'Escape' && props.view === 'editor') {
    e.preventDefault();
    backToLibrary();
  }
};

// Initialize theme and set up event listeners on component mount
onMounted(() => {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme state
  isDarkTheme.value = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark);
  
  // Apply theme
  if (isDarkTheme.value) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-theme');
  }
  
  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyDown);
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
  z-index: 50;
  border-bottom: 1px solid var(--glass-border);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.app-title {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(to right, var(--color-text), var(--color-primary-light));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  cursor: pointer;
  margin-left: var(--spacing-md);
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--color-surface);
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
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .theme-toggle {
    margin-left: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .app-logo {
    width: 32px;
    height: 32px;
  }
  
  .app-title {
    font-size: 1.1rem;
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
<template>
  <div class="app">
    <!-- Global toast notifications -->
    <ToastNotification ref="toastRef" position="top-right" />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      v-model:show="showUnsavedChangesDialog"
      title="Unsaved Changes"
      message="You have unsaved changes that will be lost if you navigate away. Do you want to continue?"
      variant="warning"
      confirm-button-text="Continue"
      @confirm="confirmViewChange"
    />

    <!-- Library View -->
    <Transition name="fade" mode="out-in">
      <div v-if="currentView === 'library'" class="view-container">
        <AppHeader 
          :view="currentView" 
          @view-change="handleViewChange"
          @new-template="createNewTemplate"
        />
        
        <TemplateLibrary
          :current-template-id="currentTemplateId"
          :is-modified="isModified"
          :export-profile="exportProfile"
          @create-new="createNewTemplate"
          @load="loadTemplate"
          @delete="handleTemplateDelete"
          @duplicate="handleTemplateDuplicate"
          @export="handleTemplateExport"
          @import-complete="handleImportComplete"
          @notification="handleNotification"
        />
      </div>
    </Transition>

    <!-- Editor View -->
    <Transition name="fade" mode="out-in">
      <div v-if="currentView === 'editor'" class="view-container">
        <AppHeader 
          :view="currentView" 
          @view-change="handleViewChange"
          @preview-toggle="handlePreviewToggle"
          @save="saveCurrentTemplate"
          @export="exportTemplateAs"
          @back-to-library="goToLibrary"
        />
        
        <div class="editor-layout">
          <!-- Sidebar -->
          <div class="editor-sidebar">
            <SectionLibrary @add-section="addSection" />
          </div>
          
          <!-- Canvas -->
          <div class="editor-canvas">
            <DragDropEditor 
              :sections="sections" 
              @update="updateSections"
              @delete="deleteSection"
              @section-change="handleSectionChange"
              @duplicate="duplicateSection"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Preview Overlay -->
    <Transition name="slide-up">
      <div v-if="showPreview" class="preview-overlay">
        <div class="preview-header">
          <h2>Preview</h2>
          <button 
            @click="closePreview"
            class="btn btn-circle"
            aria-label="Close preview"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="preview-content">
          <div class="template-preview-container">
            <div class="template-preview-header">
              <ExportDropdown
                ref="exportDropdownRef"
                :sections="sections"
                :initial-profile="exportProfile"
                @profile-changed="updateExportProfile"
                @export-success="handleExportSuccess"
                @export-error="handleExportError"
              />
            </div>
            
            <MarkdownPreview 
              :sections="sections" 
              :export-profile="exportProfile" 
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import { ExportProfileId } from '@/components/TemplateCreator/ExportProfileSelector.vue';
import { loadTemplate as loadTemplateFromStorage, saveTemplate as saveTemplateToStorage } from '@/utils/templateStorage';

// Import components
import AppHeader from '@/components/Layout/AppHeader.vue';
import SectionLibrary from '@/components/TemplateCreator/SectionLibrary.vue';
import DragDropEditor from '@/components/TemplateCreator/DragDropEditor.vue';
import MarkdownPreview from '@/components/TemplateCreator/MarkdownPreview.vue';
import ExportDropdown from '@/components/TemplateCreator/ExportDropdown.vue';
import TemplateLibrary from '@/components/TemplateCreator/TemplateLibrary.vue';
import ToastNotification from '@/components/UI/ToastNotification.vue';
import ConfirmationDialog from '@/components/UI/ConfirmationDialog.vue';

// Component references
const exportDropdownRef = ref<InstanceType<typeof ExportDropdown> | null>(null);
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null);

// State for view management
const currentView = ref<'library' | 'editor'>('library');
const showPreview = ref(false);
const pendingView = ref<'library' | 'editor' | null>(null);
const showUnsavedChangesDialog = ref(false);

// Template state
const exportProfile = ref<ExportProfileId>('full');
const currentTemplateId = ref<string>('');
const currentTemplateName = ref<string>('');
const currentTemplateDescription = ref<string>('');
const isModified = ref<boolean>(false);
const initialState = ref<string>('[]'); // JSON string of initial state for change detection

// Template sections
const sections = reactive<TemplateSection[]>([]);

// Load last used view from localStorage if available
onMounted(() => {
  const savedView = localStorage.getItem('obsidian-template-creator-last-view');
  if (savedView === 'editor' || savedView === 'library') {
    currentView.value = savedView;
  }
  
  // Load last template if in editor view
  if (currentView.value === 'editor') {
    const lastTemplateId = localStorage.getItem('obsidian-template-creator-last-template');
    if (lastTemplateId) {
      loadTemplate(lastTemplateId);
    } else {
      // If no last template, switch to library view
      currentView.value = 'library';
    }
  }
});

/**
 * Save the current view to localStorage
 */
const saveCurrentView = () => {
  localStorage.setItem('obsidian-template-creator-last-view', currentView.value);
  
  if (currentView.value === 'editor' && currentTemplateId.value) {
    localStorage.setItem('obsidian-template-creator-last-template', currentTemplateId.value);
  }
};

/**
 * Creates a new template
 */
const createNewTemplate = () => {
  currentView.value = 'editor';
  sections.splice(0, sections.length);
  currentTemplateId.value = '';
  currentTemplateName.value = '';
  currentTemplateDescription.value = '';
  exportProfile.value = 'full';
  updateInitialState();
  saveCurrentView();
};

/**
 * Loads a template by ID
 */
const loadTemplate = (id: string) => {
  try {
    const template = loadTemplateFromStorage(id);
    if (template) {
      // Update current template info
      currentTemplateId.value = template.id;
      currentTemplateName.value = template.name;
      currentTemplateDescription.value = template.description;
      exportProfile.value = template.exportProfile;
      
      // Clear sections and load new ones
      sections.splice(0, sections.length, ...template.sections);
      
      // Switch to editor view
      currentView.value = 'editor';
      
      // Reset modified state
      updateInitialState();
      
      // Save view state
      saveCurrentView();
    } else {
      if (toastRef.value) {
        toastRef.value.error('Template not found');
      }
    }
  } catch (error) {
    if (toastRef.value) {
      toastRef.value.error(`Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Navigate back to the library view
 */
const goToLibrary = () => {
  if (isModified.value) {
    // Show confirmation dialog
    pendingView.value = 'library';
    showUnsavedChangesDialog.value = true;
  } else {
    // Switch to library view immediately
    currentView.value = 'library';
    saveCurrentView();
  }
};

/**
 * Handles confirming view change with unsaved changes
 */
const confirmViewChange = () => {
  if (pendingView.value) {
    currentView.value = pendingView.value;
    pendingView.value = null;
    saveCurrentView();
  }
};

/**
 * Handles view change request from AppHeader
 */
const handleViewChange = (view: 'library' | 'editor') => {
  if (currentView.value !== view) {
    if (view === 'library' && isModified.value) {
      // Show confirmation dialog
      pendingView.value = 'library';
      showUnsavedChangesDialog.value = true;
    } else {
      currentView.value = view;
      saveCurrentView();
    }
  }
};

/**
 * Handles preview toggle
 */
const handlePreviewToggle = (visible: boolean) => {
  showPreview.value = visible;
};

/**
 * Closes the preview overlay
 */
const closePreview = () => {
  showPreview.value = false;
};

/**
 * Adds a new section to the template
 */
const addSection = (section: TemplateSection) => {
  sections.push(section);
  updateModifiedState();
};

/**
 * Updates all sections after drag-drop reordering
 */
const updateSections = (updatedSections: TemplateSection[]) => {
  // Clear the array and add all items to maintain reactivity
  sections.splice(0, sections.length, ...updatedSections);
  updateModifiedState();
};

/**
 * Deletes a section by ID
 */
const deleteSection = (sectionId: string) => {
  const index = sections.findIndex(s => s.id === sectionId);
  if (index !== -1) {
    sections.splice(index, 1);
    updateModifiedState();
  }
};

/**
 * Updates the current export profile
 */
const updateExportProfile = (profile: ExportProfileId) => {
  exportProfile.value = profile;
  updateModifiedState();
};

/**
 * Handles changes to individual section content
 */
const handleSectionChange = () => {
  updateModifiedState();
};

/**
 * Duplicates a section (will be handled by DragDropEditor)
 */
const duplicateSection = () => {
  updateModifiedState();
};

/**
 * Handles saving the current template
 */
const saveCurrentTemplate = () => {
  if (!currentTemplateName.value) {
    // Prompt for a name
    const name = prompt('Enter a name for your template:', 'My Template');
    if (!name) return; // User cancelled
    
    currentTemplateName.value = name;
  }
  
  try {
    // Save to storage
    const savedId = saveTemplateToStorage(
      currentTemplateName.value,
      currentTemplateDescription.value,
      sections,
      exportProfile.value,
      currentTemplateId.value || undefined
    );
    
    // Update template ID if needed
    if (savedId !== currentTemplateId.value) {
      currentTemplateId.value = savedId;
    }
    
    // Reset modified state
    updateInitialState();
    
    // Show success notification
    if (toastRef.value) {
      toastRef.value.success('Template saved successfully!', {
        duration: 3000
      });
    }
  } catch (error) {
    if (toastRef.value) {
      toastRef.value.error(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Handles exporting the template in a specific format
 */
const exportTemplateAs = (format: 'markdown' | 'templater' | 'dataview' | 'full') => {
  // Update the export profile to match the requested format
  exportProfile.value = format as ExportProfileId;
  
  // Show the preview
  showPreview.value = true;
  
  // Open the export dropdown
  if (exportDropdownRef.value) {
    setTimeout(() => {
      exportDropdownRef.value?.open();
    }, 300); // Add a small delay to let the preview finish rendering
  }
};

/**
 * Handle export success events
 */
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

/**
 * Handle export error events
 */
const handleExportError = (error: string) => {
  if (toastRef.value) {
    toastRef.value.error('Export failed', {
      description: error,
      duration: 5000
    });
  }
};

/**
 * Handle template delete events
 */
const handleTemplateDelete = (templateId: string) => {
  if (toastRef.value) {
    toastRef.value.success('Template deleted successfully');
  }
  
  // If the deleted template is the current one, reset it
  if (templateId === currentTemplateId.value) {
    currentTemplateId.value = '';
    currentTemplateName.value = '';
    currentTemplateDescription.value = '';
    sections.splice(0, sections.length);
    updateInitialState();
  }
};

/**
 * Handle template duplicate events
 */
const handleTemplateDuplicate = (templateId: string) => {
  if (toastRef.value) {
    toastRef.value.success('Template duplicated successfully');
  }
};

/**
 * Handle template export events
 */
const handleTemplateExport = (templateId: string) => {
  if (toastRef.value) {
    toastRef.value.success('Template exported successfully');
  }
};

/**
 * Handle template import events
 */
const handleImportComplete = (count: number) => {
  if (toastRef.value) {
    toastRef.value.success(`Successfully imported ${count} templates`);
  }
};

/**
 * Handle notifications from TemplateLibrary
 */
const handleNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
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
      case 'info':
      default:
        toastRef.value.info(message);
    }
  }
};

/**
 * Get display name for export profile
 */
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

/**
 * Creates a serialized version of the current state for change detection
 */
const serializeCurrentState = (): string => {
  return JSON.stringify({
    sections,
    exportProfile: exportProfile.value,
    name: currentTemplateName.value,
    description: currentTemplateDescription.value
  });
};

/**
 * Updates the initial state to match the current state
 */
const updateInitialState = () => {
  initialState.value = serializeCurrentState();
  isModified.value = false;
};

/**
 * Updates the modified state by comparing current state to initial state
 */
const updateModifiedState = () => {
  const currentState = serializeCurrentState();
  isModified.value = currentState !== initialState.value;
};

// Set initial state on component mount
updateInitialState();

// Watch for changes to the sections array that might not be caught by our event handlers
watch([sections, exportProfile, currentTemplateName, currentTemplateDescription], () => {
  updateModifiedState();
}, { deep: true });
</script>

<style>
/* Global styles */
:root {
  --color-background: #121212;
  --color-surface: #222222;
  --color-text: #e1e1e1;
  --color-text-muted: #a0a0a0;
  --color-primary: #7c3aed;
  --color-primary-light: #9f6bff;
  --color-primary-dark: #6429c8;
  --color-secondary: #379fff;
  --color-error: #d94141;
  --color-warning: #ffab00;
  --color-success: #2eb85c;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --glass-background: rgba(36, 36, 36, 0.8);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --glass-blur: 10px;
}

/* Glass utility class */
.glass {
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-primary-light);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-surface);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}

.btn-circle {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid layout for template cards */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

/* Card styles */
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(30px);
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

/* View container for library and editor */
.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Editor layout */
.editor-layout {
  display: flex;
  height: calc(100vh - 62px); /* Adjust for header height */
  overflow: hidden;
}

.editor-sidebar {
  width: 260px;
  height: 100%;
  border-right: 1px solid var(--color-surface);
  background: rgba(255, 255, 255, 0.05);
  overflow: auto;
  padding: var(--spacing-md);
}

.editor-canvas {
  flex: 1;
  height: 100%;
  overflow: hidden;
  padding: var(--spacing-lg);
  position: relative;
  box-sizing: border-box;
}

/* Preview overlay */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-background);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-surface);
}

.preview-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}

/* Template preview container */
.template-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
  }
  
  .editor-sidebar {
    width: 100%;
    height: auto;
    max-height: 30%;
    border-right: none;
    border-bottom: 1px solid var(--color-surface);
  }
  
  .template-preview-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
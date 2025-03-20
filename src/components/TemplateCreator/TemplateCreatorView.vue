<template>
  <div class="template-creator">
    <!-- Header with App controls -->
    <AppHeader 
      ref="appHeaderRef" 
      :sections="sections" 
      @view-change="handleViewChange"
      @preview-toggle="handlePreviewToggle"
      @save="handleSave"
      @export-profile-changed="updateExportProfile"
    />
    
    <div class="template-creator__content">
      <div class="template-creator__sidebar" :class="{ 'hidden': currentView === 'preview' }">
        <!-- Section library with available template sections -->
        <SectionLibrary @add-section="addSection" />
        
        <!-- Template Manager -->
        <div class="template-creator__manager">
          <TemplateManager 
            :current-template-id="currentTemplateId"
            :is-modified="isModified"
            :sections="sections"
            :export-profile="exportProfile"
            @save="handleTemplateSave"
            @load="handleTemplateLoad"
            @new="handleNewTemplate"
          />
        </div>
      </div>
      
      <div class="template-creator__editor" :class="{ 'hidden': currentView === 'preview' }">
        <!-- Drag and drop editor for template sections -->
        <DragDropEditor 
          :sections="sections" 
          @update="updateSections"
          @delete="deleteSection"
          @section-change="handleSectionChange"
        />
      </div>
      
      <div 
        class="template-creator__preview" 
        :class="{ 'fullscreen': currentView === 'preview', 'hidden': currentView === 'editor-only' }"
      >
        <!-- Markdown preview of the template with current export profile -->
        <MarkdownPreview 
          :sections="sections" 
          :export-profile="exportProfile" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import { ExportProfileId } from './ExportProfileSelector.vue';

// Import components
import AppHeader from '@/components/Layout/AppHeader.vue';
import SectionLibrary from './SectionLibrary.vue';
import DragDropEditor from './DragDropEditor.vue';
import MarkdownPreview from './MarkdownPreview.vue';
import TemplateManager from './TemplateManager.vue';
import ToastNotification from '@/components/UI/ToastNotification.vue';

// References
const appHeaderRef = ref<InstanceType<typeof AppHeader> | null>(null);

// Template state
const sections = reactive<TemplateSection[]>([]);
const exportProfile = ref<ExportProfileId>('full');
const currentTemplateId = ref<string>('');
const isModified = ref<boolean>(false);
const initialState = ref<string>('[]'); // JSON string of initial state for change detection
const currentView = ref<'editor' | 'preview' | 'editor-only'>('editor');

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
 * Handles saving a template
 */
const handleTemplateSave = (id: string) => {
  currentTemplateId.value = id;
  updateInitialState(); // Reset modified state after save
};

/**
 * Handles loading a template
 */
const handleTemplateLoad = (templateData: { id: string, sections: TemplateSection[], exportProfile: ExportProfileId }) => {
  currentTemplateId.value = templateData.id;
  exportProfile.value = templateData.exportProfile;
  
  // Clear sections and load new ones
  sections.splice(0, sections.length, ...templateData.sections);
  
  // Reset modified state
  updateInitialState();
};

/**
 * Handles creating a new template
 */
const handleNewTemplate = () => {
  currentTemplateId.value = '';
  sections.splice(0, sections.length);
  exportProfile.value = 'full';
  updateInitialState();
};

/**
 * Creates a serialized version of the current state for change detection
 */
const serializeCurrentState = (): string => {
  return JSON.stringify({
    sections,
    exportProfile: exportProfile.value
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
// This needs to be after all the state definitions and functions
updateInitialState();

/**
 * Handles view change from the AppHeader
 */
const handleViewChange = (view: 'library' | 'editor') => {
  if (view === 'library') {
    currentView.value = 'editor';
  } else {
    currentView.value = 'editor-only';
  }
};

/**
 * Handles preview toggle from the AppHeader
 */
const handlePreviewToggle = (visible: boolean) => {
  currentView.value = visible ? 'preview' : 'editor';
};

/**
 * Handles save action from the AppHeader
 */
const handleSave = () => {
  // If we have a current template ID, save to that, otherwise prompt for a name
  if (currentTemplateId.value) {
    handleTemplateSave(currentTemplateId.value);
    
    if (appHeaderRef.value) {
      appHeaderRef.value.showToast('Template saved!', 'success');
    }
  } else {
    // Show template manager save dialog or prompt for name
    // This would depend on your implementation
    if (appHeaderRef.value) {
      appHeaderRef.value.showToast('Please name and save your template using the Save button in the sidebar', 'info');
    }
  }
};

// Watch for changes to the sections array that might not be caught by our event handlers
watch([sections, exportProfile], () => {
  updateModifiedState();
}, { deep: true });
</script>

<style scoped>
.template-creator {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
  overflow: hidden;
}

.template-creator__content {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) minmax(350px, 1.5fr) minmax(300px, 1.5fr);
  gap: 1.5rem;
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  height: calc(100vh - 62px); /* Updated to match AppHeader height */
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
  transition: all 0.3s ease;
}

.template-creator__sidebar,
.template-creator__editor,
.template-creator__preview {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  overflow: auto;
  border: 1px solid rgba(230, 235, 245, 0.8);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.template-creator__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.template-creator__manager {
  margin-top: auto;
  border-top: 1px solid rgba(230, 235, 245, 0.8);
  padding-top: 1rem;
}

/* View state classes */
.hidden {
  display: none;
}

.fullscreen {
  grid-column: 1 / -1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .template-creator__content {
    grid-template-columns: minmax(220px, 1fr) minmax(300px, 2fr);
    gap: 1rem;
  }
  
  .template-creator__preview:not(.fullscreen) {
    grid-column: span 2;
  }
}

@media (max-width: 900px) {
  .template-creator__content {
    grid-template-columns: 1fr;
    padding: 1rem;
    height: calc(100vh - 62px);
    overflow-y: auto;
  }
  
  .template-creator__sidebar,
  .template-creator__editor,
  .template-creator__preview {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .template-creator__preview:not(.fullscreen) {
    grid-column: span 1;
  }
  
  .template-creator__preview.fullscreen {
    max-height: calc(100vh - 82px);
  }
}

@media (max-width: 640px) {
  .template-creator__content {
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .template-creator__sidebar,
  .template-creator__editor,
  .template-creator__preview {
    max-height: none;
    padding: 0.75rem;
  }
  
  .template-creator__preview.fullscreen {
    padding: 0.5rem;
  }
}
</style>
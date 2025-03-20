<template>
  <div class="template-creator">
    <div class="template-creator__header">
      <h1 class="template-creator__title">Obsidian Template Creator</h1>
      <div class="template-creator__actions">
        <!-- Template Manager -->
        <TemplateManager 
          :current-template-id="currentTemplateId"
          :is-modified="isModified"
          :sections="sections"
          :export-profile="exportProfile"
          @save="handleTemplateSave"
          @load="handleTemplateLoad"
          @new="handleNewTemplate"
        />
        
        <!-- Export Profile Selector -->
        <ExportProfileSelector 
          :model-value="exportProfile"
          @update:model-value="updateExportProfile" 
        />
        
        <!-- Download markdown button -->
        <DownloadMarkdown 
          :sections="sections" 
          :initial-profile="exportProfile"
          @profile-changed="updateExportProfile" 
        />
      </div>
    </div>
    
    <div class="template-creator__content">
      <div class="template-creator__sidebar">
        <!-- Section library with available template sections -->
        <SectionLibrary @add-section="addSection" />
      </div>
      
      <div class="template-creator__editor">
        <!-- Drag and drop editor for template sections -->
        <DragDropEditor 
          :sections="sections" 
          @update="updateSections"
          @delete="deleteSection"
          @section-change="handleSectionChange"
        />
      </div>
      
      <div class="template-creator__preview">
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
import SectionLibrary from './SectionLibrary.vue';
import DragDropEditor from './DragDropEditor.vue';
import MarkdownPreview from './MarkdownPreview.vue';
import DownloadMarkdown from './DownloadMarkdown.vue';
import ExportProfileSelector from './ExportProfileSelector.vue';
import TemplateManager from './TemplateManager.vue';

// Template state
const sections = reactive<TemplateSection[]>([]);
const exportProfile = ref<ExportProfileId>('full');
const currentTemplateId = ref<string>('');
const isModified = ref<boolean>(false);
const initialState = ref<string>('[]'); // JSON string of initial state for change detection

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

.template-creator__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(230, 235, 245, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  z-index: 10;
}

.template-creator__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4f46e5;
  margin: 0;
}

.template-creator__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.template-creator__content {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) minmax(350px, 1.5fr) minmax(300px, 1.5fr);
  gap: 1.5rem;
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  height: calc(100vh - 80px);
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
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
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .template-creator__content {
    grid-template-columns: minmax(220px, 1fr) minmax(300px, 2fr);
    gap: 1rem;
  }
  
  .template-creator__preview {
    grid-column: span 2;
  }
  
  .template-creator__actions {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}

@media (max-width: 900px) {
  .template-creator__content {
    grid-template-columns: 1fr;
    padding: 1rem;
    height: calc(100vh - 70px);
    overflow-y: auto;
  }
  
  .template-creator__sidebar,
  .template-creator__editor,
  .template-creator__preview {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .template-creator__preview {
    grid-column: span 1;
  }
  
  .template-creator__header {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 640px) {
  .template-creator__header {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .template-creator__title {
    font-size: 1.25rem;
  }
  
  .template-creator__content {
    gap: 0.75rem;
    padding: 0.75rem;
    height: calc(100vh - 110px);
  }
  
  .template-creator__sidebar,
  .template-creator__editor,
  .template-creator__preview {
    max-height: none;
  }
}
</style>
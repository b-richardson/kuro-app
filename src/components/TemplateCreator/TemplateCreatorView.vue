<template>
  <div class="template-creator">
    <div class="template-creator__sidebar">
      <!-- Section library with available template sections -->
      <SectionLibrary @add-section="addSection" />
    </div>
    
    <div class="template-creator__main">
      <div class="template-creator__editor">
        <!-- Drag and drop editor for template sections -->
        <DragDropEditor 
          :sections="sections" 
          @update="updateSections"
          @delete="deleteSection"
        />
      </div>
      
      <div class="template-creator__preview">
        <!-- Markdown preview of the template -->
        <MarkdownPreview :sections="sections" />
      </div>
    </div>
    
    <div class="template-creator__actions">
      <!-- Download markdown button -->
      <DownloadMarkdown :sections="sections" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';

// Import components
import SectionLibrary from './SectionLibrary.vue';
import DragDropEditor from './DragDropEditor.vue';
import MarkdownPreview from './MarkdownPreview.vue';
import DownloadMarkdown from './DownloadMarkdown.vue';

// Initialize reactive state for template sections
const sections = reactive<TemplateSection[]>([]);

/**
 * Adds a new section to the template
 */
const addSection = (section: TemplateSection) => {
  sections.push(section);
};

/**
 * Updates all sections after drag-drop reordering
 */
const updateSections = (updatedSections: TemplateSection[]) => {
  // Clear the array and add all items to maintain reactivity
  sections.splice(0, sections.length, ...updatedSections);
};

/**
 * Deletes a section by ID
 */
const deleteSection = (sectionId: string) => {
  const index = sections.findIndex(s => s.id === sectionId);
  if (index !== -1) {
    sections.splice(index, 1);
  }
};
</script>

<style scoped>
.template-creator {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  gap: 1rem;
}

.template-creator__main {
  display: flex;
  flex: 1;
  gap: 1rem;
}

.template-creator__sidebar {
  width: 250px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.template-creator__editor,
.template-creator__preview {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  overflow: auto;
}

.template-creator__actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

@media (min-width: 768px) {
  .template-creator {
    flex-direction: row;
  }
  
  .template-creator__main {
    flex-direction: row;
  }
}
</style>
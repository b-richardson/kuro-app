<template>
  <div class="template-creator">
    <div class="template-creator__header">
      <h1 class="template-creator__title">Obsidian Template Creator</h1>
      <div class="template-creator__actions">
        <!-- Download markdown button -->
        <DownloadMarkdown :sections="sections" />
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
        />
      </div>
      
      <div class="template-creator__preview">
        <!-- Markdown preview of the template -->
        <MarkdownPreview :sections="sections" />
      </div>
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

.template-creator__content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  height: calc(100vh - 80px);
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
    grid-template-columns: 1fr 1fr;
  }
  
  .template-creator__preview {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .template-creator__content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .template-creator__preview {
    grid-column: span 1;
  }
  
  .template-creator__header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
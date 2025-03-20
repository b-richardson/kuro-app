<template>
  <div class="drag-drop-editor">
    <h2 class="drag-drop-editor__title">Template Editor</h2>
    
    <div v-if="sections.length === 0" class="drag-drop-editor__empty">
      <div class="drag-drop-editor__empty-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <p class="drag-drop-editor__empty-text">Your template is empty</p>
      <p class="drag-drop-editor__empty-hint">Add sections from the library or drag them here</p>
    </div>
    
    <draggable
      v-else
      v-model="sectionsList"
      item-key="id"
      group="sections"
      class="drag-drop-editor__sections"
      handle=".section-handle"
      @change="updateSections"
    >
      <template #item="{ element }">
        <div class="drag-drop-editor__section-wrapper">
          <TemplateSection
            :section="element"
            @update:content="updateSectionContent(element.id, $event)"
            @delete="deleteSection(element.id)"
          />
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { TemplateSection as ITemplateSection } from '@/types/TemplateSection';
import TemplateSection from './TemplateSection.vue';

// Define props
const props = defineProps<{
  sections: ITemplateSection[]
}>();

// Define emits
const emit = defineEmits<{
  (e: 'update', sections: ITemplateSection[]): void;
  (e: 'delete', sectionId: string): void;
}>();

// Create a computed property for the sections to support v-model with draggable
const sectionsList = computed({
  get: () => props.sections,
  set: (value) => {
    emit('update', value);
  }
});

/**
 * Updates sections after drag-drop events
 */
const updateSections = () => {
  emit('update', sectionsList.value);
};

/**
 * Updates content of a specific section
 */
const updateSectionContent = (sectionId: string, newContent: string[]) => {
  const sectionIndex = props.sections.findIndex(section => section.id === sectionId);
  if (sectionIndex !== -1) {
    // Create a new array to trigger reactivity
    const updatedSections = [...props.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      content: newContent
    };
    emit('update', updatedSections);
  }
};

/**
 * Deletes a section by ID
 */
const deleteSection = (sectionId: string) => {
  emit('delete', sectionId);
};
</script>

<style scoped>
.drag-drop-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drag-drop-editor__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.drag-drop-editor__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background-color: rgba(0, 0, 0, 0.03);
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.drag-drop-editor__empty-icon {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.drag-drop-editor__empty-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #666;
  margin: 0 0 0.5rem;
}

.drag-drop-editor__empty-hint {
  font-size: 0.875rem;
  color: #888;
  margin: 0;
}

.drag-drop-editor__sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100px;
}

.drag-drop-editor__section-wrapper {
  position: relative;
}
</style>
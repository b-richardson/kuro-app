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
    
    <!-- Fallback for any draggable loading issues -->
    <div v-else-if="!isDraggableLoaded" class="drag-drop-editor__sections">
      <div v-for="section in sections" :key="section.id" class="drag-drop-editor__section-wrapper">
        <TemplateSection
          :section="section"
          @update:content="updateSectionContent(section.id, $event)"
          @delete="deleteSection(section.id)"
        />
      </div>
    </div>
    
    <DraggableWrapper
      v-else
      v-model="sectionsList"
      item-key="id"
      group="sections"
      class="drag-drop-editor__sections"
      handle=".section-handle"
      ghost-class="sortable-ghost"
      chosen-class="sortable-chosen"
      animation="200"
      @change="updateSections"
      tag="transition-group"
      :component-data="{
        name: 'section-list',
        tag: 'div'
      }"
    >
      <template #item="{element}">
        <div class="drag-drop-editor__section-wrapper">
          <TemplateSection
            :section="element"
            @update:content="updateSectionContent(element.id, $event)"
            @delete="deleteSection(element.id)"
          />
        </div>
      </template>
    </DraggableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { TemplateSection as ITemplateSection } from '@/types/TemplateSection';
import TemplateSection from './TemplateSection.vue';
import DraggableWrapper from './DraggableWrapper.vue';

// Track if draggable component is loaded properly
const isDraggableLoaded = ref(true);

// Handle any error with draggable loading
onMounted(() => {
  try {
    // Check if draggable is valid
    if (typeof draggable !== 'object' && typeof draggable !== 'function') {
      console.error('Draggable component not loaded correctly');
      isDraggableLoaded.value = false;
    }
  } catch (e) {
    console.error('Error checking draggable component:', e);
    isDraggableLoaded.value = false;
  }
});

// Define props
const props = defineProps<{
  sections: ITemplateSection[]
}>();

// Define emits
const emit = defineEmits<{
  (e: 'update', sections: ITemplateSection[]): void;
  (e: 'delete', sectionId: string): void;
  (e: 'section-change'): void;
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
  emit('section-change');
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
    emit('section-change');
  }
};

/**
 * Deletes a section by ID
 */
const deleteSection = (sectionId: string) => {
  emit('delete', sectionId);
  emit('section-change');
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
  color: #4f46e5;
}

.drag-drop-editor__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border: 2px dashed rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  text-align: center;
  margin-top: 1rem;
  flex: 1;
  transition: all 0.2s ease;
}

.drag-drop-editor__empty:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(99, 102, 241, 0.5);
}

.drag-drop-editor__empty-icon {
  font-size: 3.5rem;
  color: rgba(99, 102, 241, 0.4);
  margin-bottom: 1.5rem;
}

.drag-drop-editor__empty-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #4f46e5;
  margin: 0 0 0.5rem;
}

.drag-drop-editor__empty-hint {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  max-width: 90%;
}

.drag-drop-editor__sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100px;
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.drag-drop-editor__section-wrapper {
  position: relative;
  animation: fadeIn 0.3s ease forwards;
}

.sortable-ghost {
  opacity: 0.4;
}

.sortable-chosen {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
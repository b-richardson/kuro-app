<template>
  <div class="drag-drop-editor" @click.self="clearSelection">
    <div v-if="sections.length === 0" class="empty-template">
      <div class="empty-template-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <p class="empty-template-title">Your template is empty</p>
      <p class="empty-template-subtitle">Add sections from the library or drag them here</p>
    </div>
    
    <!-- Fallback for any draggable loading issues -->
    <div v-else-if="!isDraggableLoaded" class="sections-list">
      <div v-for="section in sections" :key="section.id" class="section-wrapper">
        <TemplateSection
          :section="section"
          :is-selected="selectedSectionId === section.id"
          :auto-focus="section.id === autoFocusSectionId"
          @update:content="updateSectionContent(section.id, $event)"
          @delete="deleteSection(section.id)"
          @select="selectSection(section.id)"
          @duplicate="duplicateSection(section.id)"
        />
      </div>
    </div>
    
    <DraggableWrapper
      v-else
      v-model="sectionsList"
      item-key="id"
      group="sections"
      class="sections-list"
      handle=".section-handle"
      ghost-class="section-ghost"
      chosen-class="section-chosen"
      animation="200"
      @change="updateSections"
      tag="transition-group"
      :component-data="{
        name: 'fade',
        tag: 'div',
        css: true
      }"
    >
      <template #item="{element}">
        <div class="section-wrapper">
          <TemplateSection
            :section="element"
            :is-selected="selectedSectionId === element.id"
            :auto-focus="element.id === autoFocusSectionId"
            @update:content="updateSectionContent(element.id, $event)"
            @delete="deleteSection(element.id)"
            @select="selectSection(element.id)"
            @duplicate="duplicateSection(element.id)"
          />
        </div>
      </template>
    </DraggableWrapper>
    
    <!-- Keyboard shortcuts help (toggled with Alt+?) -->
    <div v-if="showKeyboardHelp" class="keyboard-shortcuts-help">
      <div class="keyboard-shortcuts-header">
        <h3>Keyboard Shortcuts</h3>
        <button @click="showKeyboardHelp = false" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="keyboard-shortcuts-content">
        <div class="keyboard-shortcut-group">
          <h4>General</h4>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> + <span class="keyboard-key">?</span>
            <span class="keyboard-description">Show/hide keyboard shortcuts</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Esc</span>
            <span class="keyboard-description">Clear selection</span>
          </div>
        </div>
        <div class="keyboard-shortcut-group">
          <h4>When section is selected</h4>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> + <span class="keyboard-key">A</span>
            <span class="keyboard-description">Add line to current section</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> + <span class="keyboard-key">D</span>
            <span class="keyboard-description">Duplicate section</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> + <span class="keyboard-key">Delete</span>
            <span class="keyboard-description">Delete section</span>
          </div>
        </div>
        <div class="keyboard-shortcut-group">
          <h4>Table section</h4>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> + <span class="keyboard-key">R</span>
            <span class="keyboard-description">Add new row</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> + <span class="keyboard-key">C</span>
            <span class="keyboard-description">Add new column</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toast notification system -->
    <Transition name="toast-fade">
      <div v-if="toast.show" class="editor-toast" :class="toast.type">
        <div class="editor-toast-icon">
          <i :class="toastIcon"></i>
        </div>
        <div class="editor-toast-content">
          <div class="editor-toast-message">{{ toast.message }}</div>
        </div>
        <button class="editor-toast-close" @click="hideToast">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { TemplateSection as ITemplateSection } from '@/types/TemplateSection';
import TemplateSection from './TemplateSection.vue';
import DraggableWrapper from './DraggableWrapper.vue';
import { v4 as uuidv4 } from 'uuid';

// Track if draggable component is loaded properly
const isDraggableLoaded = ref(true);
const selectedSectionId = ref<string | null>(null);
const autoFocusSectionId = ref<string | null>(null);
const showKeyboardHelp = ref(false);

// Toast notification system
interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  timeout: ReturnType<typeof setTimeout> | null;
}

const toast = ref<ToastState>({
  show: false,
  message: '',
  type: 'info',
  timeout: null
});

const toastIcon = computed(() => {
  switch (toast.value.type) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-exclamation-circle';
    default: return 'fas fa-info-circle';
  }
});

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
  // Clear any existing timeout
  if (toast.value.timeout) {
    clearTimeout(toast.value.timeout);
    toast.value.timeout = null;
  }
  
  // Update toast properties
  toast.value.message = message;
  toast.value.type = type;
  toast.value.show = true;
  
  // Set auto-hide timeout
  toast.value.timeout = setTimeout(() => {
    hideToast();
  }, duration);
};

const hideToast = () => {
  toast.value.show = false;
  
  // Clear timeout
  if (toast.value.timeout) {
    clearTimeout(toast.value.timeout);
    toast.value.timeout = null;
  }
};

// Handle any error with draggable loading
onMounted(() => {
  try {
    // Check if draggable is valid by checking its properties
    // This is just a basic check that will be refined when the component actually tries to render
    if (typeof draggable !== 'object' && typeof draggable !== 'function') {
      console.error('Draggable component not loaded correctly');
      isDraggableLoaded.value = false;
    }
    
    // Add global keyboard event listener
    document.addEventListener('keydown', handleGlobalKeydown);
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
 * Handle global keyboard shortcuts
 */
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Toggle keyboard shortcuts help with Alt+?
  if (event.altKey && event.key === '/') {
    event.preventDefault();
    showKeyboardHelp.value = !showKeyboardHelp.value;
    return;
  }
  
  // Clear selection with Escape
  if (event.key === 'Escape') {
    clearSelection();
    showKeyboardHelp.value = false;
    return;
  }
  
  // More global shortcuts can be added here
};

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
  // If we're deleting the currently selected section, clear the selection
  if (selectedSectionId.value === sectionId) {
    selectedSectionId.value = null;
  }
  
  // Show a toast notification
  showToast('Section deleted', 'info');
  
  emit('delete', sectionId);
  emit('section-change');
};

/**
 * Selects a section for editing
 */
const selectSection = (sectionId: string) => {
  selectedSectionId.value = sectionId;
  
  // Clear auto-focus since we're selecting explicitly
  autoFocusSectionId.value = null;
};

/**
 * Clears the currently selected section
 */
const clearSelection = () => {
  selectedSectionId.value = null;
};

/**
 * Duplicates a section
 */
const duplicateSection = (sectionId: string) => {
  const sectionIndex = props.sections.findIndex(section => section.id === sectionId);
  if (sectionIndex !== -1) {
    // Create a copy of the section with a new ID
    const originalSection = props.sections[sectionIndex];
    const newSection: ITemplateSection = {
      ...JSON.parse(JSON.stringify(originalSection)), // Deep copy
      id: uuidv4() // Generate a new unique ID
    };
    
    // Insert the new section after the original
    const updatedSections = [...props.sections];
    updatedSections.splice(sectionIndex + 1, 0, newSection);
    
    // Update sections and select the new section
    emit('update', updatedSections);
    emit('section-change');
    
    // Show a toast notification
    showToast('Section duplicated', 'success');
    
    // Select and auto-focus the new section
    nextTick(() => {
      selectedSectionId.value = newSection.id;
      autoFocusSectionId.value = newSection.id;
    });
  }
};
</script>

<style scoped>
.drag-drop-editor {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.empty-template {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  right: var(--spacing-md);
  bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed var(--color-surface);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.empty-template:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-primary);
}

.empty-template-icon {
  font-size: 3.5rem;
  color: var(--color-primary);
  opacity: 0.4;
  margin-bottom: var(--spacing-lg);
}

.empty-template-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-sm);
}

.empty-template-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
  max-width: 90%;
}

.sections-list {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  display: block;
}

.sections-list > div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-wrapper {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: var(--spacing-md);
  z-index: 1;
  animation: fadeIn 0.3s ease forwards;
  will-change: opacity;
  transform: translate3d(0, 0, 0); /* Force GPU acceleration */
  position: static;
}

.section-ghost {
  opacity: 0.4;
  z-index: 2;
}

.section-chosen {
  box-shadow: 0 0 15px rgba(255, 171, 88, 0.2);
  z-index: 3;
}

/* Keyboard shortcuts help */
.keyboard-shortcuts-help {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: calc(100% - 40px);
  max-width: 500px;
  max-height: calc(100% - 40px);
  overflow: auto;
  z-index: 1000;
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.keyboard-shortcuts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  position: sticky;
  top: 0;
}

.keyboard-shortcuts-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-dark);
}

.close-button {
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-dark);
}

.keyboard-shortcuts-content {
  padding: 12px 16px;
}

.keyboard-shortcut-group {
  margin-bottom: 16px;
}

.keyboard-shortcut-group h4 {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: var(--color-text-dark);
  font-weight: 600;
}

.keyboard-shortcut {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.keyboard-key {
  display: inline-block;
  padding: 2px 6px;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 4px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.keyboard-description {
  margin-left: 8px;
  color: var(--color-text);
  flex: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Toast notifications */
.editor-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 400px;
  z-index: 1100;
  border-left: 4px solid #64748b;
}

.editor-toast.success {
  border-left-color: #10b981;
}

.editor-toast.success .editor-toast-icon {
  color: #10b981;
}

.editor-toast.error {
  border-left-color: #ef4444;
}

.editor-toast.error .editor-toast-icon {
  color: #ef4444;
}

.editor-toast.info {
  border-left-color: #3b82f6;
}

.editor-toast.info .editor-toast-icon {
  color: #3b82f6;
}

.editor-toast-icon {
  font-size: 1.25rem;
}

.editor-toast-content {
  flex: 1;
}

.editor-toast-message {
  font-size: 0.9375rem;
  color: var(--color-text-dark);
}

.editor-toast-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.editor-toast-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-dark);
}

/* Toast animation */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 640px) {
  .keyboard-shortcuts-help {
    width: calc(100% - 20px);
    max-width: none;
    height: calc(100% - 20px);
    max-height: none;
    position: fixed;
  }
  
  .keyboard-shortcut {
    font-size: 0.8125rem;
  }
  
  .editor-toast {
    width: calc(100% - 40px);
    max-width: none;
    min-width: 0;
    bottom: 10px;
    right: 20px;
  }
}
</style>
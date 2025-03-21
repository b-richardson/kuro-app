<template>
  <div class="drag-drop-editor" @click.self="clearSelection">
    <div v-if="sections.length === 0" class="empty-template">
      <div class="empty-template-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <p class="empty-template-title">Your template is empty</p>
      <p class="empty-template-subtitle">
        Add sections from the library or drag them here
      </p>
    </div>

    <!-- Simple rendering of sections with move up/down buttons -->
    <div v-else class="sections-list">
      <div
        v-for="(section, index) in sections"
        :key="section.id"
        class="section-wrapper"
      >
        <div class="section-controls">
          <button
            class="section-move-button"
            @click.stop="moveSection(index, 'up')"
            :disabled="index === 0"
            title="Move section up"
          >
            <i class="fas fa-arrow-up"></i>
          </button>
          <button
            class="section-move-button"
            @click.stop="moveSection(index, 'down')"
            :disabled="index === sections.length - 1"
            title="Move section down"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
        </div>
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
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">?</span>
            <span class="keyboard-description"
              >Show/hide keyboard shortcuts</span
            >
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Esc</span>
            <span class="keyboard-description">Clear selection</span>
          </div>
        </div>
        <div class="keyboard-shortcut-group">
          <h4>When section is selected</h4>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">A</span>
            <span class="keyboard-description"
              >Add line to current section</span
            >
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">D</span>
            <span class="keyboard-description">Duplicate section</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">Delete</span>
            <span class="keyboard-description">Delete section</span>
          </div>
        </div>
        <div class="keyboard-shortcut-group">
          <h4>Table section</h4>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">R</span>
            <span class="keyboard-description">Add new row</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">C</span>
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
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { TemplateSection as ITemplateSection } from "@/types/TemplateSection";
import TemplateSection from "./TemplateSection.vue";
import { v4 as uuidv4 } from "uuid";

// Component lifecycle state - define this FIRST
const isComponentMounted = ref(false);

// Define props
const props = defineProps<{
  sections: ITemplateSection[];
}>();

// Define emits
const emit = defineEmits<{
  (e: "update", sections: ITemplateSection[]): void;
  (e: "delete", sectionId: string): void;
  (e: "section-change"): void;
}>();

// UI state
const selectedSectionId = ref<string | null>(null);
const autoFocusSectionId = ref<string | null>(null);
const showKeyboardHelp = ref(false);

// Toast notification system
interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
  timeout: ReturnType<typeof setTimeout> | null;
}

const toast = ref<ToastState>({
  show: false,
  message: "",
  type: "info",
  timeout: null,
});

const toastIcon = computed(() => {
  switch (toast.value.type) {
    case "success":
      return "fas fa-check-circle";
    case "error":
      return "fas fa-exclamation-circle";
    default:
      return "fas fa-info-circle";
  }
});

// Toast methods
const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info",
  duration = 3000
) => {
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

/**
 * Adapter function to safely handle type mismatches between
 * store definition and component expectations
 */
const adaptSectionTypes = () => {
  // Guard against invalid parameters or unmounted component
  if (
    !isComponentMounted.value ||
    !props.sections ||
    props.sections.length === 0
  ) {
    return;
  }

  try {
    // Create a mapping between store types and component expected types
    const typeMap: Record<string, string> = {
      heading: "header",
      list: "checklist",
      text: "text",
      table: "table",
      code: "text",
      frontmatter: "yaml",
    };

    // Check if any section needs adaptation
    let needsAdaptation = false;

    props.sections.forEach((section) => {
      if (!section) return; // Skip undefined/null sections

      // Type-safe check
      const sectionType = section.type as string;
      if (typeMap[sectionType] && sectionType !== typeMap[sectionType]) {
        needsAdaptation = true;
      }

      // Also ensure content is an array (store might use string)
      if (typeof section.content === "string") {
        needsAdaptation = true;
      }

      // Check if pluginType is missing
      if (section.pluginType === undefined) {
        needsAdaptation = true;
      }
    });

    if (needsAdaptation) {
      // Create adapted sections with proper types
      const adaptedSections = props.sections.map((section) => {
        if (!section) return section; // Skip undefined/null sections

        // Create a new object to avoid mutating props directly
        const adapted = { ...section };

        // Type-safe adaptation
        const sectionType = section.type as string;
        if (typeMap[sectionType]) {
          adapted.type = typeMap[sectionType] as any;
        }

        // Ensure content is an array
        if (typeof section.content === "string") {
          adapted.content = [section.content];
        }

        // Ensure pluginType exists
        if (adapted.pluginType === undefined) {
          adapted.pluginType = null;
        }

        return adapted;
      });

      // Replace the sections in the computed property - use nextTick for safety
      nextTick(() => {
        if (isComponentMounted.value) {
          emit("update", adaptedSections);
        }
      });
    }
  } catch (error) {
    console.error("Error adapting section types:", error);
  }
};

/**
 * Handle global keyboard shortcuts
 */
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Toggle keyboard shortcuts help with Alt+?
  if (event.altKey && event.key === "/") {
    event.preventDefault();
    showKeyboardHelp.value = !showKeyboardHelp.value;
    return;
  }

  // Clear selection with Escape
  if (event.key === "Escape") {
    clearSelection();
    showKeyboardHelp.value = false;
    return;
  }
};

/**
 * Move a section up or down in the list
 * This function safely reorders sections with proper reactivity handling
 */
const moveSection = (index: number, direction: "up" | "down") => {
  // Validate parameters to avoid runtime errors
  if (index === undefined || index === null || !direction) {
    console.error("Invalid parameters in moveSection:", { index, direction });
    return;
  }

  // Guard against operations on unmounted components
  if (!props.sections || !Array.isArray(props.sections)) {
    console.warn("moveSection called with invalid sections array");
    return;
  }

  // Calculate the new index
  const newIndex = direction === "up" ? index - 1 : index + 1;

  // Ensure the new index is valid
  if (newIndex < 0 || newIndex >= props.sections.length) {
    return;
  }

  try {
    // Create a fresh copy of the sections array to maintain Vue reactivity
    const updatedSections = props.sections.map((section) => ({ ...section }));

    // Store references to the sections we're swapping
    const sectionA = updatedSections[index];
    const sectionB = updatedSections[newIndex];

    // Perform the swap with proper type safety
    updatedSections[newIndex] = sectionA;
    updatedSections[index] = sectionB;

    // Update the sections - wrap in nextTick to avoid DOM update conflicts
    nextTick(() => {
      emit("update", updatedSections);
      emit("section-change");

      // Show a toast notification
      showToast(`Section moved ${direction}`, "success");
    });
  } catch (error) {
    console.error("Error moving section:", error);
    showToast("Failed to move section", "error");
  }
};

// Add a watcher for sections prop to apply adapters
watch(
  () => props.sections,
  (newSections) => {
    if (isComponentMounted.value) {
      adaptSectionTypes();
    }
  },
  { immediate: false, deep: true }
);

// Set up event listeners
onMounted(() => {
  try {
    // Mark component as mounted
    isComponentMounted.value = true;

    // Add global keyboard event listener
    document.addEventListener("keydown", handleGlobalKeydown);

    // Apply section type adapter on mount
    adaptSectionTypes();
  } catch (e) {
    console.error("Error in DragDropEditor mount:", e);
  }
});

// Clean up when component is unmounted
onUnmounted(() => {
  try {
    // Mark component as unmounted
    isComponentMounted.value = false;

    // Remove event listeners
    document.removeEventListener("keydown", handleGlobalKeydown);

    // Clear any pending timeouts
    if (toast.value.timeout) {
      clearTimeout(toast.value.timeout);
      toast.value.timeout = null;
    }
  } catch (e) {
    console.error("Error in DragDropEditor unmount:", e);
  }
});

/**
 * Updates content of a specific section
 */
const updateSectionContent = (sectionId: string, newContent: string[]) => {
  // Guard against invalid parameters or unmounted component
  if (!isComponentMounted.value || !sectionId || !Array.isArray(newContent)) {
    return;
  }

  try {
    const sectionIndex = props.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (sectionIndex !== -1) {
      // Create a new array to trigger reactivity
      const updatedSections = props.sections.map((section) => ({ ...section }));

      // Update the specific section with the new content
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        content: [...newContent], // Create a new array for content
      };

      // Emit the update events
      nextTick(() => {
        emit("update", updatedSections);
        emit("section-change");
      });
    }
  } catch (error) {
    console.error("Error updating section content:", error);
  }
};

/**
 * Deletes a section by ID
 */
const deleteSection = (sectionId: string) => {
  // Guard against invalid parameters or unmounted component
  if (!isComponentMounted.value || !sectionId) {
    return;
  }

  try {
    // If we're deleting the currently selected section, clear the selection
    if (selectedSectionId.value === sectionId) {
      selectedSectionId.value = null;
    }

    // Emit events safely wrapped in nextTick
    nextTick(() => {
      emit("delete", sectionId);
      emit("section-change");

      // Show a toast notification
      showToast("Section deleted", "info");
    });
  } catch (error) {
    console.error("Error deleting section:", error);
  }
};

/**
 * Selects a section for editing
 */
const selectSection = (sectionId: string) => {
  // Guard against invalid parameters or unmounted component
  if (!isComponentMounted.value || !sectionId) {
    return;
  }

  try {
    // Update selection state
    selectedSectionId.value = sectionId;

    // Clear auto-focus since we're selecting explicitly
    autoFocusSectionId.value = null;
  } catch (error) {
    console.error("Error selecting section:", error);
  }
};

/**
 * Clears the currently selected section
 */
const clearSelection = () => {
  // Guard against unmounted component
  if (!isComponentMounted.value) {
    return;
  }

  try {
    selectedSectionId.value = null;
  } catch (error) {
    console.error("Error clearing selection:", error);
  }
};

/**
 * Duplicates a section
 */
const duplicateSection = (sectionId: string) => {
  // Guard against invalid parameters or unmounted component
  if (
    !isComponentMounted.value ||
    !sectionId ||
    !Array.isArray(props.sections)
  ) {
    return;
  }

  try {
    const sectionIndex = props.sections.findIndex(
      (section) => section.id === sectionId
    );
    if (sectionIndex === -1) {
      return;
    }

    // Create a copy of the section with a new ID using a safe deep copy approach
    const originalSection = props.sections[sectionIndex];
    const newSection: ITemplateSection = {
      ...JSON.parse(JSON.stringify(originalSection)), // Deep copy
      id: uuidv4(), // Generate a new unique ID
    };

    // Create a new array and splice in the new section
    const updatedSections = props.sections.map((section) => ({ ...section }));
    updatedSections.splice(sectionIndex + 1, 0, newSection);

    // First emit events to update sections
    emit("update", updatedSections);
    emit("section-change");

    // Show a toast notification
    showToast("Section duplicated", "success");

    // Use multiple nextTick calls to ensure proper rendering sequence
    nextTick(() => {
      // Wait for section to be added to DOM
      nextTick(() => {
        // Then update selection state
        if (isComponentMounted.value) {
          selectedSectionId.value = newSection.id;
          autoFocusSectionId.value = newSection.id;
        }
      });
    });
  } catch (error) {
    console.error("Error duplicating section:", error);
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

/* Section controls for up/down buttons */
.section-controls {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.section-move-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.section-move-button:hover:not(:disabled) {
  background: rgba(255, 171, 88, 0.1);
  color: var(--color-primary);
}

.section-move-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

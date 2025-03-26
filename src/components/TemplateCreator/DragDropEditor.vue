<template>
  <div class="drag-drop-editor" @click.self="clearSelection">
    <div v-if="sections.length === 0" class="empty-template">
      <div class="empty-template-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <p class="empty-template-title">Your template is empty</p>
      <p class="empty-template-subtitle">
        Add modules from the library or drag them here
      </p>
    </div>

    <!-- Simple rendering of modules with move up/down buttons -->
    <div v-else class="modules-list">
      <div
        v-for="(section, index) in sections"
        :key="section.id"
        class="module-wrapper"
      >
        <TemplateModuleEditor
          :module="section"
          :index="index"
          :modules="sections"
          :is-selected="selectedModuleId === section.id"
          :auto-focus="section.id === autoFocusModuleId"
          @update:content="updateModuleContent(section.id, $event)"
          @update="emit('update', $event)"
          @delete="deleteModule(section.id)"
          @select="selectModule(section.id)"
          @duplicate="duplicateModule(section.id)"
          @module-change="emit('module-change')"
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
          <h4>When module is selected</h4>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">A</span>
            <span class="keyboard-description">Add line to current module</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">D</span>
            <span class="keyboard-description">Duplicate module</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">Delete</span>
            <span class="keyboard-description">Delete module</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">↑</span>
            <span class="keyboard-description">Move module up</span>
          </div>
          <div class="keyboard-shortcut">
            <span class="keyboard-key">Alt</span> +
            <span class="keyboard-key">↓</span>
            <span class="keyboard-description">Move module down</span>
          </div>
        </div>
        <div class="keyboard-shortcut-group">
          <h4>Table module</h4>
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
import { TemplateModule as ITemplateModule } from "@/types/TemplateModule";
import TemplateModuleEditor from "@/components/TemplateCreator/TemplateModuleEditor.vue";
import { v4 as uuidv4 } from "uuid";

// Component lifecycle state - define this FIRST
const isComponentMounted = ref(false);

// Define props
const props = defineProps<{
  sections: ITemplateModule[];
}>();

// Define emits
const emit = defineEmits<{
  (e: "update", sections: ITemplateModule[]): void;
  (e: "delete", moduleId: string): void;
  (e: "module-change"): void;
}>();

// UI state
const selectedModuleId = ref<string | null>(null);
const autoFocusModuleId = ref<string | null>(null);
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
 *
 * This improved version preserves content during adaptation and only
 * emits updates when necessary, avoiding content resets during editing.
 */
// Define a flag to track initial adaptation
const hasPerformedInitialAdaptation = ref(false);

// Define a flag to track active module editing
const isUserEditingModule = ref(false);

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

// The moveModule functionality is now handled in TemplateModuleEditor

// IMPROVED: Only adapt section types once on mount, removing problematic watcher entirely
// This prevents destructive cycle of content resets during editing
// Section types should be adapted at initialization and when explicitly needed
// NOT automatically on every content change

// Event listener for focus events on input elements
const handleInputFocus = () => {
  isUserEditingModule.value = true;
};

// Event listener for blur events on input elements
const handleInputBlur = () => {
  isUserEditingModule.value = false;
};

// Set up event listeners
// Define new function that only runs once rather than on every content change
const adaptModuleTypesOnce = () => {
  if (!props.sections || props.sections.length === 0) return;

  // Create a mapping between store types and component expected types
  const typeMap: Record<string, string> = {
    heading: "header",
    list: "checklist",
    text: "text",
    table: "table",
    code: "text",
    frontmatter: "yaml",
  };

  // Check if any module needs adaptation
  let needsAdaptation = false;

  props.sections.forEach((module) => {
    // Type-safe check
    const moduleType = module.type as string;
    if (typeMap[moduleType] && moduleType !== typeMap[moduleType]) {
      needsAdaptation = true;
    }

    // Also ensure content is an array (store might use string)
    if (typeof module.content === "string") {
      needsAdaptation = true;
    }
  });

  if (needsAdaptation) {
    console.log("Adapting module types once on mount...");

    // Create adapted modules with proper types
    const adaptedModules = props.sections.map((module) => {
      // Create a new object to avoid mutating props directly
      const adapted = { ...module };

      // Type-safe adaptation
      const moduleType = module.type as string;
      if (typeMap[moduleType]) {
        // @ts-ignore - We need to convert types safely
        adapted.type = typeMap[moduleType];
      }

      // Ensure content is an array
      if (typeof module.content === "string") {
        adapted.content = [module.content];
      }

      // Ensure pluginType exists
      if (adapted.pluginType === undefined) {
        adapted.pluginType = null;
      }

      return adapted;
    });

    emit("update", adaptedModules);
  }
};

onMounted(() => {
  try {
    // Mark component as mounted
    isComponentMounted.value = true;

    // Add global keyboard event listener
    document.addEventListener("keydown", handleGlobalKeydown);

    // Add event listeners for editing state tracking
    document.addEventListener("focusin", handleInputFocus);
    document.addEventListener("focusout", handleInputBlur);

    // Apply module type adapter ONLY ONCE on mount instead of watching for changes
    // This fixes the reactivity issues with modules resetting during editing
    adaptModuleTypesOnce();

    // Log successful initialization
    console.log(
      "DragDropEditor successfully mounted with initial section adaptation"
    );
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
    document.removeEventListener("focusin", handleInputFocus);
    document.removeEventListener("focusout", handleInputBlur);

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
 * Updates content of a specific module
 * IMPROVED: Optimized to minimize unnecessary object recreation
 * and preserve reactivity during editing
 */
const updateModuleContent = (moduleId: string, newContent: string[]) => {
  // Guard against invalid parameters or unmounted component
  if (!isComponentMounted.value || !moduleId || !Array.isArray(newContent)) {
    return;
  }

  // Set a flag that we're actively editing this module
  // This prevents adaptModuleTypes from running during editing
  isUserEditingModule.value = true;

  try {
    const moduleIndex = props.sections.findIndex(
      (section) => section.id === moduleId
    );
    if (moduleIndex !== -1) {
      // Create a targeted update that preserves reactivity but minimizes cloning
      const updatedSections = [...props.sections];

      // Get the current module
      const currentModule = updatedSections[moduleIndex];

      // Create a new module object with minimal changes
      const updatedModule = {
        ...currentModule,
        // Only copy the content that actually changed
        content: [...newContent],
        // Keep existing metadata if any
        metadata: currentModule.metadata
          ? { ...currentModule.metadata }
          : undefined,
      };

      // Update only the specific module in the array
      updatedSections[moduleIndex] = updatedModule;

      // Emit the update events
      nextTick(() => {
        if (isComponentMounted.value) {
          emit("update", updatedSections);
          emit("module-change");
        }
      });
    }
  } catch (error) {
    console.error("Error updating module content:", error);
  }
};

/**
 * Deletes a module by ID
 */
const deleteModule = (moduleId: string) => {
  // Guard against invalid parameters or unmounted component
  if (!isComponentMounted.value || !moduleId) {
    return;
  }

  try {
    // If we're deleting the currently selected module, clear the selection
    if (selectedModuleId.value === moduleId) {
      selectedModuleId.value = null;
    }

    // Emit events safely wrapped in nextTick
    nextTick(() => {
      emit("delete", moduleId);
      emit("module-change");

      // Show a toast notification
      showToast("Module deleted", "info");
    });
  } catch (error) {
    console.error("Error deleting module:", error);
  }
};

/**
 * Selects a module for editing
 */
const selectModule = (moduleId: string) => {
  // Guard against invalid parameters or unmounted component
  if (!isComponentMounted.value || !moduleId) {
    return;
  }

  try {
    // Update selection state
    selectedModuleId.value = moduleId;

    // Clear auto-focus since we're selecting explicitly
    autoFocusModuleId.value = null;
  } catch (error) {
    console.error("Error selecting module:", error);
  }
};

/**
 * Clears the currently selected module
 */
const clearSelection = () => {
  // Guard against unmounted component
  if (!isComponentMounted.value) {
    return;
  }

  try {
    selectedModuleId.value = null;
  } catch (error) {
    console.error("Error clearing selection:", error);
  }
};

/**
 * Duplicates a module
 */
const duplicateModule = (moduleId: string) => {
  // Guard against invalid parameters or unmounted component
  if (
    !isComponentMounted.value ||
    !moduleId ||
    !Array.isArray(props.sections)
  ) {
    return;
  }

  try {
    const moduleIndex = props.sections.findIndex(
      (section) => section.id === moduleId
    );
    if (moduleIndex === -1) {
      return;
    }

    // Create a copy of the module with a new ID using a safe deep copy approach
    const originalModule = props.sections[moduleIndex];
    const newModule: ITemplateModule = {
      ...JSON.parse(JSON.stringify(originalModule)), // Deep copy
      id: uuidv4(), // Generate a new unique ID
    };

    // Create a new array and splice in the new module
    const updatedSections = props.sections.map((section) => ({ ...section }));
    updatedSections.splice(moduleIndex + 1, 0, newModule);

    // First emit events to update sections
    emit("update", updatedSections);
    emit("module-change");

    // Show a toast notification
    showToast("Module duplicated", "success");

    // Use multiple nextTick calls to ensure proper rendering sequence
    nextTick(() => {
      // Wait for module to be added to DOM
      nextTick(() => {
        // Then update selection state
        if (isComponentMounted.value) {
          selectedModuleId.value = newModule.id;
          autoFocusModuleId.value = newModule.id;
        }
      });
    });
  } catch (error) {
    console.error("Error duplicating module:", error);
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

.modules-list {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  display: block;
  scroll-behavior: smooth;
}

.modules-list > div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.module-wrapper {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: var(--spacing-md);
  z-index: 1;
  animation: fadeIn 0.3s ease forwards;
  will-change: opacity;
  transform: translate3d(0, 0, 0); /* Force GPU acceleration */
  position: static;
}

/* Module wrapper styling */

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

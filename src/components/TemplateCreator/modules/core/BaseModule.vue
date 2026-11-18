<template>
  <div
    class="template-module-editor"
    :class="[
      `template-module-editor--${module.type}`,
      module.pluginType
        ? `template-module-editor--plugin-${module.pluginType}`
        : '',
      { 'template-module-editor--selected': isSelected },
      { 'template-module-editor--editing': isEditing },
      { 'template-module-editor--frontmatter': isFrontmatter },
    ]"
    @click="handleModuleClick"
    tabindex="0"
    ref="moduleRef"
  >
    <!-- Module header with arrow controls and actions -->
    <div class="template-module-editor-header">
      <div class="module-controls">
        <!-- Hide move buttons for frontmatter modules -->
        <template v-if="!isFrontmatter">
          <button
            class="module-move-button"
            @click.stop="moveModule('up')"
            :disabled="index === 0"
            title="Move module up"
          >
            <i class="fas fa-arrow-up"></i>
          </button>
          <button
            class="module-move-button"
            @click.stop="moveModule('down')"
            :disabled="index === modules.length - 1"
            title="Move module down"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
        </template>
        <!-- Visual indicator for frontmatter placement -->
        <div
          v-else
          class="frontmatter-position-indicator"
          title="Frontmatter must be at the top"
        >
          <i class="fas fa-lock"></i>
        </div>
      </div>
      <div class="template-module-editor-type">
        <i :class="moduleIcon"></i>
        <span>{{ moduleTypeLabel }}</span>
        <span
          v-if="module.pluginType"
          class="template-module-editor-plugin-tag"
        >
          <i :class="pluginIcon"></i>
          {{ pluginTypeLabel }}
        </span>
        <!-- Special indicator for frontmatter -->
        <span v-if="isFrontmatter" class="frontmatter-badge">
          Always at top
        </span>
      </div>
      <div class="template-module-editor-actions">
        <button
          class="template-module-editor-action"
          title="Add line"
          @click.stop="addContentLine"
        >
          <i class="fas fa-plus"></i>
        </button>
        <!-- Hide duplicate button for frontmatter -->
        <button
          v-if="!isFrontmatter"
          class="template-module-editor-action template-module-editor-action--duplicate"
          title="Duplicate module"
          @click.stop="$emit('duplicate')"
        >
          <i class="fas fa-copy"></i>
        </button>
        <button
          class="template-module-editor-action template-module-editor-action--delete"
          title="Delete module"
          @click.stop="confirmDeleteModule"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Rest of the component remains unchanged -->
    <!-- Validation error alert -->
    <div v-if="validationError" class="template-module-editor-validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>

    <!-- Module content - overridden by child modules -->
    <div class="template-module-editor-content">
      <slot></slot>
    </div>

    <Transition name="modal">
      <div
        v-if="showDeleteConfirm"
        class="delete-confirm-overlay"
        @click.self="cancelDelete"
      >
        <div class="delete-confirm-modal">
          <div class="delete-confirm-header">
            <i class="fas fa-trash delete-confirm-icon"></i>
            <h3>Delete Module</h3>
          </div>
          <div class="delete-confirm-content">
            Are you sure you want to delete this module?
          </div>
          <div class="delete-confirm-actions">
            <button
              class="delete-confirm-button delete-confirm-cancel"
              @click="cancelDelete"
            >
              Cancel
            </button>
            <button
              class="delete-confirm-button delete-confirm-delete"
              @click="confirmDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onUnmounted } from "vue";
import { TemplateModule } from "@/types/TemplateModule";
import {
  getPluginDisplayName,
  getModuleIcon,
  getPluginIcon,
} from "@/utils/pluginTemplatesUtils";

// Define props
const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
  (e: "add-line"): void;
}>();

// Check if module is frontmatter
const isFrontmatter = computed(() => props.module.type === "frontmatter");

// Component state
const isEditing = ref(false);
const moduleRef = ref<HTMLElement | null>(null);
const lastActiveElement = ref<HTMLElement | null>(null);

// Focus management
const firstInputRef = ref<HTMLElement | null>(null);

// Set the input reference for autofocus
const setInputRef = (el: HTMLElement | null) => {
  if (el) {
    firstInputRef.value = el;
  }
};

const showDeleteConfirm = ref(false);

// Initialize the module on mount
onMounted(() => {
  // Focus the first input if autoFocus is true
  if (props.isSelected && props.autoFocus && firstInputRef.value) {
    nextTick(() => {
      firstInputRef.value?.focus();
    });
  }

  // Add event handler for outside clicks to deselect
  document.addEventListener("click", handleOutsideClick);
});

// Clean up event listeners
onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});

// Handle module selection
const handleModuleClick = () => {
  emit("select");
};

// Handle click outside the module
const handleOutsideClick = (event: MouseEvent) => {
  if (moduleRef.value && !moduleRef.value.contains(event.target as Node)) {
    // If we're not editing, we can deselect
    if (!isEditing.value) {
      // Not emitting anything here because the parent component
      // will handle the selection of the new module
    }
  }
};

// Set editing state
const setEditing = (editing: boolean) => {
  isEditing.value = editing;

  // Store the last active element if we're starting to edit
  if (editing) {
    lastActiveElement.value = document.activeElement as HTMLElement;
  }
};

// Confirm module deletion
const confirmDeleteModule = () => {
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};

const confirmDelete = () => {
  showDeleteConfirm.value = false;
  emit("delete");
};

// Get module type label
const moduleTypeLabel = computed(() => {
  const labels = {
    frontmatter: "Frontmatter",
    header: "Header",
    checklist: "Checklist",
    table: "Table",
    text: "Text",
    divider: "Divider",
    codeBlock: "Code Block",
    // Templater plugin modules
    templaterField: "Templater Field",
    templaterDateAndTime: "Templater Date & Time",
    templaterUserInput: "Templater User Input",
    templaterFileProperty: "Templater File Property",
    templaterConditionalContent: "Templater Conditional Content",
    templaterValueTransformation: "Templater Value Transformation",
    templaterTemplateVariables: "Templater Template Variables",

    // Dataview plugin modules
    dataviewQuery: "Dataview Query",
    dataviewListQuery: "List View",
    dataviewTableQuery: "Table View",
    dataviewTaskQuery: "Task View",
    dataviewCalendarQuery: "Calendar View",
    dataviewInlineFields: "Dataview Inline Fields",
  };
  return labels[props.module.type] || props.module.type;
});

// Get module icon
const moduleIcon = computed(() => {
  return getModuleIcon(props.module.type);
});

// Get plugin display name and icon
const pluginTypeLabel = computed(() => {
  return props.module.pluginType
    ? getPluginDisplayName(props.module.pluginType)
    : "";
});

const pluginIcon = computed(() => {
  return props.module.pluginType ? getPluginIcon(props.module.pluginType) : "";
});

// Validation error handling
const validationError = ref<string | null>(null);

/**
 * Move the module up or down
 * @param direction 'up' or 'down'
 */
const moveModule = (direction: "up" | "down") => {
  // Don't allow moving frontmatter modules
  if (isFrontmatter.value) {
    return;
  }

  // Guard against invalid operations
  if (
    (direction === "up" && props.index === 0) ||
    (direction === "down" && props.index === props.modules.length - 1)
  ) {
    return;
  }

  try {
    // Create a fresh copy of the modules array
    const updatedModules = props.modules.map((module) => ({ ...module }));

    // Calculate the new index
    const newIndex = direction === "up" ? props.index - 1 : props.index + 1;

    // Don't allow swapping with frontmatter
    if (updatedModules[newIndex].type === "frontmatter") {
      return;
    }

    // Store references to the modules we're swapping
    const moduleA = updatedModules[props.index];
    const moduleB = updatedModules[newIndex];

    // Perform the swap
    updatedModules[newIndex] = moduleA;
    updatedModules[props.index] = moduleB;

    // Emit update events
    emit("update", updatedModules);
    emit("module-change");
  } catch (error) {
    console.error("Error moving module:", error);
  }
};

// Add a new content line
const addContentLine = () => {
  emit("add-line");
};

// Expose functions to be used by child components
defineExpose({
  setEditing,
  setInputRef,
});
</script>

<style scoped>
.template-module-editor {
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-md);
  position: relative;
  outline: none;
}

.template-module-editor:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
}

/* Selected state styling */
.template-module-editor--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(255, 171, 88, 0.2), 0 5px 15px rgba(0, 0, 0, 0.07);
  transform: translateY(-1px);
}

/* Editing state styling */
.template-module-editor--editing {
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.3), 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Focus outline for keyboard navigation */
.template-module-editor:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.template-module-editor-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.2s ease;
}

.template-module-editor--selected .template-module-editor-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom-color: rgba(255, 171, 88, 0.2);
}

/* Module controls for up/down buttons */
.module-controls {
  display: flex;
  gap: 4px;
  margin-right: var(--spacing-sm);
}

.module-move-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.module-move-button:hover:not(:disabled) {
  background: rgba(255, 171, 88, 0.1);
  color: var(--color-primary);
}

.module-move-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.template-module-editor-type {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--color-text);
}

.template-module-editor--selected .template-module-editor-type {
  color: var(--color-text-dark);
}

.template-module-editor-plugin-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  padding: 2px var(--spacing-xs);
  background-color: rgba(255, 171, 88, 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  margin-left: var(--spacing-xs);
}

.template-module-editor--plugin-templater .template-module-editor-plugin-tag {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.template-module-editor--plugin-dataview .template-module-editor-plugin-tag {
  background-color: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.template-module-editor-actions {
  margin-left: auto;
  display: flex;
  gap: var(--spacing-xs);
}

.template-module-editor-action {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.template-module-editor-action:hover {
  background-color: rgba(255, 171, 88, 0.1);
  color: var(--color-primary);
}

.template-module-editor-action--duplicate:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.template-module-editor-action--delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.template-module-editor-validation-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

.template-module-editor-content {
  padding: var(--spacing-md);
}

/* Keyboard shortcut hints in tooltips */
button[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 20;
}

/* Type-specific styles */
.template-module-editor--header {
  border-top: 3px solid var(--color-primary);
}

.template-module-editor--checklist {
  border-top: 3px solid #10b981;
}

.template-module-editor--table {
  border-top: 3px solid #f59e0b;
}

.template-module-editor--text {
  border-top: 3px solid var(--color-primary-light);
}

.template-module-editor--divider {
  border-top: 3px solid #64748b;
}

.template-module-editor--code-block {
  border-top: 3px solid #3b82f6;
}

/* Hide the add-line button for divider modules */
.template-module-editor--divider
  .template-module-editor-action[title="Add line"] {
  display: none;
}

.template-module-editor--templaterField {
  border-top: 3px solid #3b82f6;
}

.template-module-editor--dataviewQuery {
  border-top: 3px solid #059669;
}

/* delete modal */
.delete-confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  border-radius: var(--radius-md);
}

.delete-confirm-modal {
  background: rgba(30, 30, 46, 0.95);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  width: 90%;
  max-width: 300px;
  overflow: hidden;
}

.delete-confirm-header {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-confirm-icon {
  color: #ef4444;
  font-size: 1.2rem;
}

.delete-confirm-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
}

.delete-confirm-content {
  padding: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.delete-confirm-actions {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-confirm-button {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.delete-confirm-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
}

.delete-confirm-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.delete-confirm-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.delete-confirm-delete:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .delete-confirm-modal {
  transition: transform 0.3s;
}

.modal-leave-active .delete-confirm-modal {
  transition: transform 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .delete-confirm-modal {
  transform: scale(0.9);
}

.modal-leave-to .delete-confirm-modal {
  transform: scale(0.95);
}

/* Frontmatter-specific styles */
.template-module-editor--frontmatter {
  border-top: 3px solid #9333ea; /* Purple for frontmatter */
  /* Special shadow for frontmatter to indicate importance */
  box-shadow: 0 0 0 1px rgba(147, 51, 234, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
}

.template-module-editor--frontmatter:hover {
  box-shadow: 0 0 0 1px rgba(147, 51, 234, 0.15), 0 6px 15px rgba(0, 0, 0, 0.07);
}

.template-module-editor--frontmatter.template-module-editor--selected {
  border-color: #9333ea;
  box-shadow: 0 0 0 1px rgba(147, 51, 234, 0.2), 0 5px 15px rgba(0, 0, 0, 0.07);
}

.frontmatter-position-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  color: #9333ea;
  font-size: 0.9rem;
}

.frontmatter-badge {
  font-size: 0.7rem;
  background-color: rgba(147, 51, 234, 0.1);
  color: #9333ea;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  margin-left: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

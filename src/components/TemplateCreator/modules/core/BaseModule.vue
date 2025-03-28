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
    ]"
    @click="handleModuleClick"
    tabindex="0"
    ref="moduleRef"
  >
    <!-- Module header with arrow controls and actions -->
    <div class="template-module-editor-header">
      <div class="module-controls">
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
      </div>
      <div class="template-module-editor-actions">
        <button
          class="template-module-editor-action"
          title="Add line"
          @click.stop="addContentLine"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button
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

    <!-- Validation error alert -->
    <div v-if="validationError" class="template-module-editor-validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>

    <!-- Module content - overridden by child modules -->
    <div class="template-module-editor-content">
      <slot></slot>
    </div>

    <!-- Toast for feedback messages -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="template-module-editor-toast"
        :class="toastType"
      >
        <i :class="toastIcon"></i>
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { ModuleType, TemplateModule, ToastType } from "./moduleTypes";
import { createToastPlaceholder } from "./moduleUtils";
import {
  getPluginDisplayName,
  getModuleIcon,
  validatePluginSyntax,
  getPluginIcon,
} from "@/utils/pluginTemplatesUtils";
import ToastPlaceholder from "./ToastPlaceholder.vue";

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

// Component state
const isEditing = ref(false);
const moduleRef = ref<HTMLElement | null>(null);
const lastActiveElement = ref<HTMLElement | null>(null);

// Toast feedback state
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref<ToastType>("info");
const toastTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Focus management
const firstInputRef = ref<HTMLElement | null>(null);

// Set the input reference for autofocus
const setInputRef = (el: HTMLElement | null) => {
  if (el) {
    firstInputRef.value = el;
  }
};

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

// Toast management - simplified placeholder implementation
const displayToast = (
  message: string,
  type: ToastType = "info"
) => {
  // Use the placeholder function to log toast to console
  createToastPlaceholder(message, type);
  
  // For backward compatibility, still update the component state
  // but this will be removed in the future
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value);
  }
  
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  
  toastTimeout.value = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const toastIcon = computed(() => {
  switch (toastType.value) {
    case "success":
      return "fas fa-check-circle";
    case "error":
      return "fas fa-exclamation-circle";
    default:
      return "fas fa-info-circle";
  }
});

// Confirm module deletion
const confirmDeleteModule = () => {
  if (confirm("Are you sure you want to delete this module?")) {
    emit("delete");
  }
};

// Get module type label
const moduleTypeLabel = computed(() => {
  const labels = {
    header: "Header",
    checklist: "Checklist",
    table: "Table",
    text: "Text",
    yaml: "YAML Frontmatter",
    templaterField: "Templater Field",
    dataviewQuery: "Dataview Query",
    kanban: "Kanban Board",
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

// Validate plugin syntax when content changes
watch(
  () => props.module.content,
  (newContent) => {
    if (props.module.pluginType) {
      const result = validatePluginSyntax(props.module.pluginType, newContent);
      validationError.value = result.isValid ? null : result.error || null;
    } else {
      validationError.value = null;
    }
  },
  { deep: true }
);

/**
 * Move the module up or down
 * @param direction 'up' or 'down'
 */
const moveModule = (direction: "up" | "down") => {
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
  displayToast,
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

.template-module-editor--plugin-kanban .template-module-editor-plugin-tag {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
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

/* Toast notification styling */
.template-module-editor-toast {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 80%;
  border-left: 3px solid #64748b;
}

.template-module-editor-toast.success {
  border-left-color: #10b981;
}

.template-module-editor-toast.success i {
  color: #10b981;
}

.template-module-editor-toast.error {
  border-left-color: #ef4444;
}

.template-module-editor-toast.error i {
  color: #ef4444;
}

.template-module-editor-toast.info {
  border-left-color: #3b82f6;
}

.template-module-editor-toast.info i {
  color: #3b82f6;
}

/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
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

.template-module-editor--yaml {
  border-top: 3px solid var(--color-text-muted);
}

.template-module-editor--templaterField {
  border-top: 3px solid #3b82f6;
}

.template-module-editor--dataviewQuery {
  border-top: 3px solid #059669;
}

.template-module-editor--kanban {
  border-top: 3px solid #8b5cf6;
}
</style>

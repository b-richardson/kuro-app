<!-- InlineDataviewFieldsModule.vue -->
<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    @add-line="handleAddField"
    ref="baseModuleRef"
  >
    <div class="inline-dataview-fields-container">
      <h3 class="module-title">
        <i class="fas fa-database"></i> Dataview Inline Fields
      </h3>
      
      <!-- Visual Builder Mode -->
      <div v-if="editorMode === 'visual'" class="visual-builder-mode">
        <DataviewInlineFieldsBuilder
          :content="module.content"
          :layout="layoutType"
          @update:content="updateFieldsContent"
          @update:layout="updateLayout"
        />
      </div>
      
      <!-- Code Editor Mode -->
      <div v-else class="code-editor-mode">
        <textarea
          v-model="rawContent"
          class="code-textarea"
          placeholder="Field:: Value"
          rows="5"
          @input="updateRawContent"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :ref="isSelected && autoFocus ? setInputRef : undefined"
        ></textarea>
        
        <div v-if="validationError" class="validation-error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ validationError }}
        </div>
      </div>
      
      <!-- Bottom controls -->
      <div class="module-controls">
        <button 
          class="toggle-mode-btn"
          @click="toggleEditorMode"
          title="Toggle between visual builder and code editor"
        >
          <i :class="editorMode === 'visual' ? 'fas fa-code' : 'fas fa-sliders-h'"></i>
          {{ editorMode === 'visual' ? 'Code Editor' : 'Visual Builder' }}
        </button>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import DataviewInlineFieldsBuilder from "./components/DataviewInlineFieldsBuilder.vue";
import { TemplateModule } from "@/types/TemplateModule";
import {
  DataviewFieldLayout,
  parseFieldsFromContent,
  generateContentFromFields,
  createEmptyField,
} from "@/utils/dataviewFieldsUtils";

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
}>();

// Reference to the base module component
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

// State
const editorMode = ref<'visual' | 'code'>('visual');
const rawContent = ref('');
const validationError = ref('');

// Get layout type from metadata or detect from content
const layoutType = ref<DataviewFieldLayout>(
  props.module.metadata?.layout ||
    (props.module.content && props.module.content.length > 1
      ? "block"
      : "inline")
);

// Ensure the module has the correct type
onMounted(() => {
  // Ensure module has correct type and plugin type
  if (props.module.type !== "dataviewFields" || props.module.pluginType !== "dataview") {
    const updatedModule = {
      ...props.module,
      type: "dataviewFields",
      pluginType: "dataview",
    };

    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }

  // Initialize metadata if needed
  if (!props.module.metadata || !props.module.metadata.layout) {
    const updatedModule = {
      ...props.module,
      metadata: {
        ...props.module.metadata,
        layout: layoutType.value,
      },
    };

    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }
  
  // Initialize raw content
  rawContent.value = props.module.content?.join('\n') || '';
  
  console.log('Inline Dataview Fields Module initialized', props.module.type);
});

// Set input reference for autofocus
const setInputRef = (el: HTMLTextAreaElement) => {
  inputRef.value = el;
  baseModuleRef.value?.setInputRef(el);
};

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

// Toggle between visual and code editor modes
function toggleEditorMode() {
  if (editorMode.value === 'visual') {
    // Switching to code mode
    rawContent.value = props.module.content?.join('\n') || '';
    editorMode.value = 'code';
  } else {
    // Switching to visual mode
    try {
      // Validate the raw content by attempting to parse it
      const fields = parseFieldsFromContent(rawContent.value.split('\n'));
      if (fields.length === 0) {
        // If parsing fails, add an empty field
        const emptyField = createEmptyField();
        const content = generateContentFromFields([emptyField], layoutType.value);
        emit("update:content", content);
      }
      validationError.value = '';
      editorMode.value = 'visual';
    } catch (error) {
      validationError.value = 'Could not parse fields. Please check your syntax.';
      return;
    }
  }
}

// Update content when props change
const updateContent = (content: string[]) => {
  if (editorMode.value === 'code') {
    rawContent.value = content.join('\n');
  }
  emit("update:content", content);
};

// Update content from visual builder
const updateFieldsContent = (content: string[]) => {
  emit("update:content", content);
};

// Update layout type
const updateLayout = (layout: DataviewFieldLayout) => {
  layoutType.value = layout;
  
  // Update module metadata
  if (props.module.metadata?.layout !== layout) {
    const updatedModule = {
      ...props.module,
      metadata: {
        ...props.module.metadata,
        layout: layout,
      },
    };

    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }
};

// Update raw content from textarea
const updateRawContent = () => {
  validationError.value = '';
  
  // Split by newlines for content array
  const content = rawContent.value.split('\n');
  emit("update:content", content);
};

// Handle add field from BaseModule
const handleAddField = () => {
  if (editorMode.value === 'visual') {
    // Let the builder handle it
    return;
  } else {
    // Add a new empty field line to the raw content
    rawContent.value += '\nNewField:: ';
    const content = rawContent.value.split('\n');
    emit("update:content", content);
    
    // Show toast for user feedback
    baseModuleRef.value?.displayToast("New field added", "success");
  }
};

// Watch for content changes from parent
watch(
  () => props.module.content,
  (newContent) => {
    if (editorMode.value === 'code' && newContent) {
      rawContent.value = newContent.join('\n');
    }
  },
  { deep: true }
);

// Watch for metadata changes
watch(
  () => props.module.metadata?.layout,
  (newLayout) => {
    if (newLayout && newLayout !== layoutType.value) {
      layoutType.value = newLayout;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.inline-dataview-fields-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

.module-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.module-title i {
  color: var(--interactive-accent);
}

.visual-builder-mode,
.code-editor-mode {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.code-textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
  font-family: var(--font-monospace);
  font-size: 0.9em;
  resize: vertical;
}

.validation-error {
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.module-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.toggle-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-mode-btn:hover {
  background: var(--background-modifier-hover);
}
</style>

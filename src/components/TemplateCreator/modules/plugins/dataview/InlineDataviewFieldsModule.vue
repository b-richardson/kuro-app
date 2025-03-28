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
    @add-line="addField"
    ref="baseModuleRef"
  >
    <div class="inline-dataview-fields-editor">
      <!-- Layout controls -->
      <div class="layout-row">
        <label class="layout-label">Layout:</label>
        <div class="button-group">
          <button
            class="button-group-item"
            :class="{ active: layoutType === 'inline' }"
            @click="changeLayout('inline')"
            title="Inline layout (fields side by side)"
          >
            <i class="fas fa-grip-lines"></i> Inline
          </button>
          <button
            class="button-group-item"
            :class="{ active: layoutType === 'block' }"
            @click="changeLayout('block')"
            title="Block layout (one field per line)"
          >
            <i class="fas fa-grip-lines-vertical"></i> Block
          </button>
        </div>
      </div>

      <!-- Field collection -->
      <div
        class="dataview-fields-collection"
        :class="{
          'inline-layout': layoutType === 'inline',
          'block-layout': layoutType === 'block',
        }"
      >
        <div v-if="fields.length === 0" class="empty-fields-message">
          <i class="fas fa-info-circle"></i>
          Add your first Dataview field using the + button
        </div>

        <div
          v-for="(field, fieldIndex) in fields"
          :key="field.id"
          class="dataview-field-item"
        >
          <!-- Field controls -->
          <div class="field-controls">
            <button
              class="field-move-button"
              @click.stop="moveField(fieldIndex, 'up')"
              :disabled="fieldIndex === 0"
              title="Move field up"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
            <button
              class="field-move-button"
              @click.stop="moveField(fieldIndex, 'down')"
              :disabled="fieldIndex === fields.length - 1"
              title="Move field down"
            >
              <i class="fas fa-arrow-down"></i>
            </button>
          </div>

          <!-- Field name input -->
          <div class="field-name-container">
            <input
              type="text"
              class="field-name-input"
              v-model="field.name"
              placeholder="Field name"
              @input="updateModuleContent"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              :ref="
                fieldIndex === 0 && isSelected ? setFirstInputRef : undefined
              "
              list="field-name-suggestions"
            />
            <span class="field-separator">::</span>
          </div>

          <!-- Field value input -->
          <div class="field-value-container">
            <input
              type="text"
              class="field-value-input"
              v-model="field.value"
              placeholder="Value"
              @input="updateModuleContent"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />

            <!-- Field type indicator -->
            <div
              class="field-type-indicator"
              :class="getFieldTypeClass(field.value)"
            >
              <i :class="getFieldTypeIcon(field.value)"></i>
            </div>
          </div>

          <!-- Delete button -->
          <button
            class="field-delete-button"
            @click.stop="deleteField(fieldIndex)"
            title="Delete field"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Add field button -->
      <button class="add-field-button" @click="addField">
        <i class="fas fa-plus"></i> Add Field
      </button>

      <!-- Field name suggestions datalist -->
      <datalist id="field-name-suggestions">
        <option
          v-for="suggestion in fieldNameSuggestions"
          :key="suggestion"
          :value="suggestion"
        ></option>
      </datalist>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import {
  DataviewField,
  DataviewFieldLayout,
  parseFieldsFromContent,
  generateContentFromFields,
  getFieldTypeIcon,
  getFieldTypeClass,
  getDefaultFieldSuggestions,
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

// Reference to the first input field for autofocus
const firstInputRef = ref<HTMLInputElement | null>(null);

// Ensure the module has the correct type
onMounted(() => {
  // Ensure module has correct type and plugin type
  if (props.module.type !== "dataviewFields") {
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
});

// Set first input reference for autofocus
const setFirstInputRef = (el: HTMLInputElement) => {
  firstInputRef.value = el;
  baseModuleRef.value?.setInputRef(el);
};

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

// Get layout type from metadata or detect from content
const layoutType = ref<DataviewFieldLayout>(
  props.module.metadata?.layout ||
    (props.module.content && props.module.content.length > 1
      ? "block"
      : "inline")
);

// Fields collection
const fields = ref<DataviewField[]>(
  parseFieldsFromContent(props.module.content || [""])
);

// Field name suggestions from local storage
const fieldNameSuggestions = ref<string[]>([]);

// Load field name suggestions from local storage
onMounted(() => {
  try {
    const storedSuggestions = localStorage.getItem("dataview-field-names");
    if (storedSuggestions) {
      fieldNameSuggestions.value = JSON.parse(storedSuggestions);
    }

    // Add common Dataview field names if none exist
    if (fieldNameSuggestions.value.length === 0) {
      fieldNameSuggestions.value = getDefaultFieldSuggestions();
    }

    // Initialize with a default empty field if none exist
    if (fields.value.length === 0) {
      fields.value = [createEmptyField()];
      updateModuleContent();
    }
  } catch (e) {
    console.error("Error loading field name suggestions:", e);
  }
});

// Update module content based on fields
const updateModuleContent = () => {
  // Add field name to suggestions if it doesn't exist
  fields.value.forEach((field) => {
    if (field.name && !fieldNameSuggestions.value.includes(field.name)) {
      fieldNameSuggestions.value.push(field.name);
      // Store suggestions in local storage
      try {
        localStorage.setItem(
          "dataview-field-names",
          JSON.stringify(fieldNameSuggestions.value)
        );
      } catch (e) {
        console.error("Error saving field name suggestions:", e);
      }
    }
  });

  // Generate content using the utility function
  const content = generateContentFromFields(fields.value, layoutType.value);

  // Update metadata with layout type
  if (props.module.metadata?.layout !== layoutType.value) {
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

  emit("update:content", content);
};

// Update content when props change
const updateContent = (content: string[]) => {
  fields.value = parseFieldsFromContent(content || [""]);
  if (fields.value.length === 0) {
    fields.value = [createEmptyField()];
  }
  emit("update:content", content);
};

// Add a new field
const addField = () => {
  fields.value.push(createEmptyField());
  updateModuleContent();

  // Show toast for user feedback
  baseModuleRef.value?.displayToast("New field added", "success");

  // Focus the new field after it's added
  setTimeout(() => {
    const inputs = document.querySelectorAll(".field-name-input");
    if (inputs.length > 0) {
      (inputs[inputs.length - 1] as HTMLInputElement).focus();
    }
  }, 10);
};

// Delete a field
const deleteField = (index: number) => {
  fields.value.splice(index, 1);

  // Always keep at least one field
  if (fields.value.length === 0) {
    fields.value = [createEmptyField()];
  }

  updateModuleContent();

  // Show toast for user feedback
  baseModuleRef.value?.displayToast("Field deleted", "info");
};

// Move a field up or down
const moveField = (index: number, direction: "up" | "down") => {
  if (direction === "up" && index > 0) {
    const temp = fields.value[index];
    fields.value[index] = fields.value[index - 1];
    fields.value[index - 1] = temp;
  } else if (direction === "down" && index < fields.value.length - 1) {
    const temp = fields.value[index];
    fields.value[index] = fields.value[index + 1];
    fields.value[index + 1] = temp;
  }
  updateModuleContent();
};

// Change layout type
const changeLayout = (type: DataviewFieldLayout) => {
  layoutType.value = type;
  updateModuleContent();
};

// Watch for content changes from parent
watch(
  () => props.module.content,
  (newContent) => {
    if (newContent) {
      fields.value = parseFieldsFromContent(newContent);
      if (fields.value.length === 0) {
        fields.value = [createEmptyField()];
      }
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
.inline-dataview-fields-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
  width: 100%;
}

.layout-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.layout-label {
  font-size: 0.9rem;
  color: var(--text-normal);
  margin-right: 0.5rem;
}

.button-group {
  display: flex;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  overflow: hidden;
}

.button-group-item {
  padding: 0.3rem 0.7rem;
  background: var(--background-secondary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--text-normal);
}

.button-group-item:hover {
  background: var(--background-modifier-hover);
}

.button-group-item.active {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}

.dataview-fields-collection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.empty-fields-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  background: var(--background-secondary);
  border-radius: 4px;
}
</style>

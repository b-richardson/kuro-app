<template>
  <div class="dataview-inline-fields-builder">
    <!-- Layout controls -->
    <div class="layout-controls">
      <h3 class="dataview-section-title">
        <i class="fas fa-columns"></i> Layout
      </h3>
      <div class="button-group">
        <button
          class="button-group-item"
          :class="{ active: layoutType === 'inline' }"
          @click="setLayout('inline')"
          title="Inline layout (fields side by side)"
        >
          <i class="fas fa-grip-lines"></i> Inline
        </button>
        <button
          class="button-group-item"
          :class="{ active: layoutType === 'block' }"
          @click="setLayout('block')"
          title="Block layout (one field per line)"
        >
          <i class="fas fa-grip-lines-vertical"></i> Block
        </button>
      </div>
    </div>

    <!-- Field collection -->
    <div class="dataview-fields-section">
      <h3 class="dataview-section-title">
        <i class="fas fa-database"></i> Fields
      </h3>
      
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
          <!-- Field name input -->
          <div class="field-name-container">
            <input
              type="text"
              class="field-name-input"
              v-model="field.name"
              placeholder="Field name"
              @input="updateFields"
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
              @input="updateFields"
            />

            <!-- Field type indicator -->
            <div
              class="field-type-indicator"
              :class="getFieldTypeClass(field.value)"
            >
              <i :class="getFieldTypeIcon(field.value)"></i>
            </div>
          </div>

          <!-- Field controls -->
          <div class="field-controls">
            <button
              class="field-move-button"
              @click="moveField(fieldIndex, 'up')"
              :disabled="fieldIndex === 0"
              title="Move field up"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
            <button
              class="field-move-button"
              @click="moveField(fieldIndex, 'down')"
              :disabled="fieldIndex === fields.length - 1"
              title="Move field down"
            >
              <i class="fas fa-arrow-down"></i>
            </button>
            <button
              class="field-delete-button"
              @click="deleteField(fieldIndex)"
              title="Delete field"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
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

// Define props and emits
const props = defineProps<{
  content: string[];
  layout?: DataviewFieldLayout;
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update:layout", layout: DataviewFieldLayout): void;
}>();

// Layout type
const layoutType = ref<DataviewFieldLayout>(props.layout || 'inline');

// Fields collection
const fields = ref<DataviewField[]>(
  parseFieldsFromContent(props.content || [""])
);

// Field name suggestions
const fieldNameSuggestions = ref<string[]>(getDefaultFieldSuggestions());

// Watch for content changes
watch(() => props.content, (newContent) => {
  if (newContent) {
    fields.value = parseFieldsFromContent(newContent);
    if (fields.value.length === 0) {
      fields.value = [createEmptyField()];
    }
  }
}, { deep: true });

// Watch for layout changes
watch(() => props.layout, (newLayout) => {
  if (newLayout) {
    layoutType.value = newLayout;
  }
});

// Add a new field
function addField() {
  fields.value.push(createEmptyField());
  updateFields();
}

// Delete a field
function deleteField(index: number) {
  fields.value.splice(index, 1);

  // Always keep at least one field
  if (fields.value.length === 0) {
    fields.value = [createEmptyField()];
  }

  updateFields();
}

// Move a field up or down
function moveField(index: number, direction: "up" | "down") {
  if (direction === "up" && index > 0) {
    const temp = fields.value[index];
    fields.value[index] = fields.value[index - 1];
    fields.value[index - 1] = temp;
  } else if (direction === "down" && index < fields.value.length - 1) {
    const temp = fields.value[index];
    fields.value[index] = fields.value[index + 1];
    fields.value[index + 1] = temp;
  }
  updateFields();
}

// Set layout type
function setLayout(type: DataviewFieldLayout) {
  layoutType.value = type;
  emit('update:layout', type);
  updateFields();
}

// Update fields and emit content
function updateFields() {
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
  emit("update:content", content);
}
</script>

<style scoped>
.dataview-inline-fields-builder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.dataview-section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-normal);
}

.dataview-section-title i {
  color: var(--interactive-accent);
}

.layout-controls {
  background-color: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 6px;
  padding: 1rem;
}

.button-group {
  display: flex;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  overflow: hidden;
}

.button-group-item {
  padding: 0.5rem 0.75rem;
  background: var(--background-secondary);
  border: none;
  flex: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-normal);
  transition: all 0.2s ease;
}

.button-group-item:hover {
  background: var(--background-modifier-hover);
}

.button-group-item.active {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}

.dataview-fields-section {
  background-color: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 6px;
  padding: 1rem;
  position: relative;
}

.dataview-fields-collection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.inline-layout .dataview-field-item {
  flex-direction: row;
}

.block-layout .dataview-field-item {
  flex-direction: column;
}

.empty-fields-message {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  background: var(--background-secondary);
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-fields-message i {
  font-size: 1.5rem;
  color: var(--text-faint);
}

.dataview-field-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: 4px;
  position: relative;
}

.field-name-container {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.field-value-container {
  display: flex;
  align-items: center;
  flex: 2;
  position: relative;
}

.field-name-input,
.field-value-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
  background: var(--background-primary);
  color: var(--text-normal);
  font-size: 0.9rem;
}

.field-name-input:focus,
.field-value-input:focus {
  border-color: var(--interactive-accent);
  outline: none;
}

.field-separator {
  font-weight: bold;
  color: var(--text-accent);
  user-select: none;
}

.field-type-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
}

.field-type-indicator.type-text {
  color: #3498db;
}

.field-type-indicator.type-number {
  color: #2ecc71;
}

.field-type-indicator.type-boolean {
  color: #9b59b6;
}

.field-type-indicator.type-date {
  color: #e74c3c;
}

.field-type-indicator.type-link {
  color: #f39c12;
}

.field-controls {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.field-move-button,
.field-delete-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.field-move-button:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
}

.field-move-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-delete-button:hover {
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  border-color: rgba(255, 0, 0, 0.2);
}

.add-field-button {
  width: 100%;
  padding: 0.625rem;
  background: var(--background-secondary);
  border: 1px dashed var(--background-modifier-border);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-field-button:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
  border-color: var(--background-modifier-border-hover);
}

/* Block layout specific styles */
.block-layout .dataview-field-item {
  padding: 0.75rem;
}

.block-layout .field-name-container,
.block-layout .field-value-container {
  width: 100%;
}

.block-layout .field-controls {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}
</style>
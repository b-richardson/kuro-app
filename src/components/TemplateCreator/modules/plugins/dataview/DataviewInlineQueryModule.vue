<template>
  <!-- 
    IMPORTANT NOTE FOR DEVELOPERS:
    - This component should NOT implement any connection checks to Obsidian
    - This component should NOT display any toast messages
    - All connection validation and user feedback should be handled by parent components
    - Keep this component focused solely on building Dataview inline fields
    -->
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event as any)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    @add-line="regenerateMarkdown"
    ref="baseModuleRef"
  >
    <div class="dataview-inline-editor">
      <!-- Inline Field Builder -->
      <div class="dataview-inline-editor__section">
        <div class="dataview-inline-editor__section-header">
          <div class="dataview-inline-editor__section-title">
            <i class="fas fa-code"></i>
            Inline Field Builder
          </div>
        </div>

        <div class="dataview-inline-editor__fields">
          <!-- Existing Fields -->
          <div
            v-for="(field, index) in inlineFields"
            :key="index"
            class="dataview-inline-editor__field-item"
          >
            <div class="dataview-inline-editor__field-group">
              <div class="dataview-inline-editor__field-controls">
                <input
                  type="text"
                  class="dataview-inline-editor__input dataview-inline-editor__field-name"
                  v-model="field.name"
                  placeholder="Field name"
                  @input="handleFieldUpdate(index)"
                />

                <div class="dataview-inline-editor__field-separator">::</div>

                <input
                  type="text"
                  class="dataview-inline-editor__input dataview-inline-editor__field-value"
                  v-model="field.value"
                  placeholder="Value"
                  @input="handleFieldUpdate(index)"
                />
              </div>

              <div class="dataview-inline-editor__field-actions">
                <button
                  class="dataview-inline-editor__action-btn"
                  title="Delete field"
                  @click="removeField(index)"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Display Style -->
            <div class="dataview-inline-editor__style-options">
              <div class="dataview-inline-editor__style-options-header">
                Display style:
              </div>
              <div class="dataview-inline-editor__style-buttons">
                <button
                  class="dataview-inline-editor__style-btn"
                  :class="{ active: field.displayStyle === 'inline' }"
                  @click="setDisplayStyle(index, 'inline')"
                  title="Regular inline field"
                >
                  Inline
                </button>
                <button
                  class="dataview-inline-editor__style-btn"
                  :class="{ active: field.displayStyle === 'block' }"
                  @click="setDisplayStyle(index, 'block')"
                  title="Block field (starts a multi-line value)"
                >
                  Block
                </button>
                <button
                  class="dataview-inline-editor__style-btn"
                  :class="{ active: field.displayStyle === 'hidden' }"
                  @click="setDisplayStyle(index, 'hidden')"
                  title="Hidden field (only visible to Dataview)"
                >
                  Hidden
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Field Button -->
          <button
            class="dataview-inline-editor__add-field-btn"
            @click="addField"
          >
            <i class="fas fa-plus"></i>
            Add Field
          </button>
        </div>
      </div>

      <!-- Common Fields Quick Add -->
      <div class="dataview-inline-editor__section">
        <div class="dataview-inline-editor__section-header">
          <div class="dataview-inline-editor__section-title">
            <i class="fas fa-bolt"></i>
            Quick Add Common Fields
          </div>
        </div>

        <div class="dataview-inline-editor__common-fields">
          <button
            v-for="field in commonFields"
            :key="field.name"
            class="dataview-inline-editor__common-field-btn"
            @click="addCommonField(field)"
          >
            {{ field.name }}
          </button>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";

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

// Inline fields data structure
interface InlineField {
  name: string;
  value: string;
  displayStyle: "inline" | "block" | "hidden";
}

// Fields state
const inlineFields = ref<InlineField[]>([]);

// Common fields for quick add
const commonFields = [
  { name: "Status", value: "" },
  { name: "Priority", value: "" },
  { name: "Due", value: "" },
  { name: "Tags", value: "" },
  { name: "Category", value: "" },
  { name: "Author", value: "" },
  { name: "URL", value: "" },
  { name: "Rating", value: "" },
  { name: "Complete", value: "" },
  { name: "Source", value: "" },
  { name: "Location", value: "" },
  { name: "Date", value: "" },
];

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingContent(props.module.content);
  } else {
    // Add a default empty field
    inlineFields.value.push({
      name: "",
      value: "",
      displayStyle: "inline",
    });
    regenerateMarkdown();
  }
});

// Parse existing content
function parseExistingContent(content: string[]) {
  // Reset fields
  inlineFields.value = [];

  // Process each line
  content.forEach((line) => {
    // Skip empty lines
    if (!line.trim()) return;

    // Try to parse as a Dataview inline field
    const inlineMatch = line.match(/^(.+?)\s*::\s*(.+)$/);
    const blockMatch = line.match(/^(.+?)\s*::\s*$/);
    const hiddenMatch = line.match(/^\[!(.+?)\s*::\s*(.+)\]$/);

    if (inlineMatch) {
      // Regular inline field
      inlineFields.value.push({
        name: inlineMatch[1].trim(),
        value: inlineMatch[2].trim(),
        displayStyle: "inline",
      });
    } else if (blockMatch) {
      // Block field (field::)
      inlineFields.value.push({
        name: blockMatch[1].trim(),
        value: "",
        displayStyle: "block",
      });
    } else if (hiddenMatch) {
      // Hidden field [!field::value]
      inlineFields.value.push({
        name: hiddenMatch[1].trim(),
        value: hiddenMatch[2].trim(),
        displayStyle: "hidden",
      });
    } else {
      // Not a recognized format, add as a regular field
      inlineFields.value.push({
        name: "",
        value: line.trim(),
        displayStyle: "inline",
      });
    }
  });

  // If no fields were parsed, add a default empty one
  if (inlineFields.value.length === 0) {
    inlineFields.value.push({
      name: "",
      value: "",
      displayStyle: "inline",
    });
  }

  // Update the markdown
  regenerateMarkdown();
}

// Add a new empty field
function addField() {
  inlineFields.value.push({
    name: "",
    value: "",
    displayStyle: "inline",
  });
  regenerateMarkdown();
}

// Add a common field
function addCommonField(field: { name: string; value: string }) {
  inlineFields.value.push({
    name: field.name,
    value: field.value,
    displayStyle: "inline",
  });
  regenerateMarkdown();
}

// Remove a field
function removeField(index: number) {
  inlineFields.value.splice(index, 1);

  // Ensure there's always at least one field
  if (inlineFields.value.length === 0) {
    inlineFields.value.push({
      name: "",
      value: "",
      displayStyle: "inline",
    });
  }

  regenerateMarkdown();
}

// Set the display style for a field
function setDisplayStyle(index: number, style: "inline" | "block" | "hidden") {
  inlineFields.value[index].displayStyle = style;
  regenerateMarkdown();
}

// Handle updates to fields
function handleFieldUpdate(index: number) {
  regenerateMarkdown();
}

// Generate markdown for all fields
function regenerateMarkdown() {
  const lines: string[] = [];

  inlineFields.value.forEach((field) => {
    // Skip empty fields
    if (!field.name && !field.value) return;

    // Format based on display style
    if (field.displayStyle === "inline") {
      lines.push(`${field.name}:: ${field.value}`);
    } else if (field.displayStyle === "block") {
      lines.push(`${field.name}::`);
    } else if (field.displayStyle === "hidden") {
      lines.push(`[!${field.name}:: ${field.value}]`);
    }
  });

  // Update content
  updateContent(lines);
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}
</script>

<style scoped>
.dataview-inline-editor {
  width: 100%;
  color: #cbd5e1;
}

/* Section styling */
.dataview-inline-editor__section {
  margin-bottom: 20px;
}

.dataview-inline-editor__section-header {
  margin-bottom: 12px;
}

.dataview-inline-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  color: #e2e8f0;
}

/* Fields section */
.dataview-inline-editor__fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dataview-inline-editor__field-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
}

.dataview-inline-editor__field-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dataview-inline-editor__field-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.dataview-inline-editor__field-name {
  flex: 1;
}

.dataview-inline-editor__field-value {
  flex: 1.5;
}

.dataview-inline-editor__field-separator {
  font-weight: bold;
  padding: 0 4px;
  color: #ffab58;
}

.dataview-inline-editor__field-actions {
  display: flex;
  gap: 4px;
}

.dataview-inline-editor__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
}

.dataview-inline-editor__input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-inline-editor__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dataview-inline-editor__action-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* Style options */
.dataview-inline-editor__style-options {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dataview-inline-editor__style-options-header {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.dataview-inline-editor__style-buttons {
  display: flex;
  gap: 8px;
}

.dataview-inline-editor__style-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-inline-editor__style-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.dataview-inline-editor__style-btn.active {
  background: rgba(255, 171, 88, 0.15);
  border-color: rgba(255, 171, 88, 0.3);
  color: #ffab58;
}

/* Add field button */
.dataview-inline-editor__add-field-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 171, 88, 0.1);
  color: #ffab58;
  border: 1px solid rgba(255, 171, 88, 0.2);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.dataview-inline-editor__add-field-btn:hover {
  background: rgba(255, 171, 88, 0.2);
}

/* Common fields */
.dataview-inline-editor__common-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dataview-inline-editor__common-field-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-inline-editor__common-field-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-inline-editor__field-group,
  .dataview-inline-editor__field-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .dataview-inline-editor__field-actions {
    margin-top: 8px;
    justify-content: flex-end;
  }

  .dataview-inline-editor__style-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

<template>
  <div class="yaml-editor">
    <div class="yaml-editor__header">
      <div class="yaml-editor__title">
        <i class="fas fa-code"></i>
        YAML Front Matter
      </div>
      <div class="yaml-editor__actions">
        <div class="yaml-editor__presets">
          <button
            class="yaml-editor__preset-btn"
            @click="isPresetSelectorOpen = !isPresetSelectorOpen"
          >
            <i class="fas fa-list"></i>
            Presets
          </button>

          <div class="yaml-editor__preset-dropdown" v-if="isPresetSelectorOpen">
            <div class="yaml-editor__preset-search">
              <input
                type="text"
                v-model="presetSearchQuery"
                placeholder="Search presets..."
              />
            </div>
            <div class="yaml-editor__preset-list">
              <div
                v-for="preset in filteredPresets"
                :key="preset.id"
                class="yaml-editor__preset-item"
                @click="applyPreset(preset.id)"
              >
                <div class="yaml-editor__preset-name">{{ preset.name }}</div>
                <div class="yaml-editor__preset-description">
                  {{ preset.description }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="yaml-editor__toggle-view">
          <button
            class="yaml-editor__view-btn"
            :class="{ active: editorMode === 'visual' }"
            @click="setEditorMode('visual')"
            title="Visual Editor"
          >
            <i class="fas fa-table"></i>
          </button>
          <button
            class="yaml-editor__view-btn"
            :class="{ active: editorMode === 'code' }"
            @click="setEditorMode('code')"
            title="Code Editor"
          >
            <i class="fas fa-code"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="validationError" class="yaml-editor__validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>

    <!-- Visual editor mode -->
    <div v-if="editorMode === 'visual'" class="yaml-editor__visual-mode">
      <div class="yaml-editor__fields">
        <!-- Dynamic fields based on current fields -->
        <div
          v-for="(field, index) in yamlFields"
          :key="index"
          class="yaml-editor__field"
        >
          <div class="yaml-editor__field-header">
            <div class="yaml-editor__field-name">
              <input
                type="text"
                v-model="field.key"
                placeholder="Field name"
                @input="updateYaml"
                class="yaml-editor__field-key-input"
              />
            </div>
            <div class="yaml-editor__field-type">
              <select
                v-model="field.type"
                @change="updateFieldType(index)"
                class="yaml-editor__field-type-select"
              >
                <option value="string">Text</option>
                <option value="array">List</option>
                <option value="boolean">Yes/No</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div class="yaml-editor__field-actions">
              <button
                class="yaml-editor__field-delete"
                @click="removeField(index)"
                title="Remove Field"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Field value based on type -->
          <div class="yaml-editor__field-value">
            <!-- String input -->
            <input
              v-if="field.type === 'string'"
              type="text"
              v-model="field.value"
              placeholder="Text value"
              @input="updateYaml"
              class="yaml-editor__input"
            />

            <!-- Number input -->
            <input
              v-else-if="field.type === 'number'"
              type="number"
              v-model.number="field.value"
              placeholder="0"
              @input="updateYaml"
              class="yaml-editor__input"
            />

            <!-- Date input -->
            <div
              v-else-if="field.type === 'date'"
              class="yaml-editor__date-field"
            >
              <input
                type="text"
                v-model="field.value"
                placeholder="YYYY-MM-DD"
                @input="updateYaml"
                class="yaml-editor__input"
              />
              <button
                class="yaml-editor__templater-btn"
                @click="insertDateTemplate(index)"
                title="Insert Templater date"
              >
                <i class="fas fa-calendar-alt"></i>
              </button>
            </div>

            <!-- Boolean toggle -->
            <div
              v-else-if="field.type === 'boolean'"
              class="yaml-editor__boolean-field"
            >
              <label class="yaml-editor__toggle">
                <input
                  type="checkbox"
                  :checked="field.value === true || field.value === 'true'"
                  @change="toggleBoolean(index, $event)"
                />
                <span class="yaml-editor__toggle-slider"></span>
              </label>
              <span class="yaml-editor__boolean-label">
                {{
                  field.value === true || field.value === "true" ? "Yes" : "No"
                }}
              </span>
            </div>

            <!-- Array/List input -->
            <div
              v-else-if="field.type === 'array'"
              class="yaml-editor__array-field"
            >
              <div class="yaml-editor__tags">
                <div
                  v-for="(tag, tagIndex) in getArrayValues(field.value)"
                  :key="tagIndex"
                  class="yaml-editor__tag"
                >
                  <span class="yaml-editor__tag-text">{{ tag }}</span>
                  <button
                    class="yaml-editor__tag-remove"
                    @click="removeArrayItem(index, tagIndex)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <input
                  type="text"
                  v-model="newTagValues[index]"
                  placeholder="Add item..."
                  @keydown.enter.prevent="addArrayItem(index)"
                  class="yaml-editor__tag-input"
                />
              </div>
            </div>
          </div>

          <div
            v-if="field.type === 'string' || field.type === 'number'"
            class="yaml-editor__templater-hint"
          >
            <button
              class="yaml-editor__templater-hint-btn"
              @click="showTemplaterMenu($event, index)"
              title="Insert Templater variable"
            >
              <i class="fas fa-bolt"></i>
              Add Templater Variable
            </button>
          </div>
        </div>
      </div>

      <div class="yaml-editor__add-field">
        <button class="yaml-editor__add-field-btn" @click="addNewField">
          <i class="fas fa-plus"></i> Add Field
        </button>

        <div class="yaml-editor__common-fields">
          <button
            class="yaml-editor__common-field-btn"
            @click="showCommonFieldsMenu = !showCommonFieldsMenu"
          >
            <i class="fas fa-ellipsis-h"></i>
            Common Fields
          </button>

          <div
            class="yaml-editor__common-fields-menu"
            v-if="showCommonFieldsMenu"
          >
            <div class="yaml-editor__common-fields-section">
              <h4 class="yaml-editor__common-fields-title">Standard Fields</h4>
              <div class="yaml-editor__common-fields-list">
                <button
                  v-for="field in availableCommonFields"
                  :key="field.key"
                  class="yaml-editor__common-field-item"
                  @click="addCommonField(field)"
                >
                  {{ field.label }}
                </button>
              </div>
            </div>

            <div class="yaml-editor__common-fields-section">
              <h4 class="yaml-editor__common-fields-title">Plugin Fields</h4>
              <div class="yaml-editor__common-fields-list">
                <button
                  v-for="field in availablePluginFields"
                  :key="field.key"
                  class="yaml-editor__common-field-item"
                  @click="addCommonField(field)"
                >
                  {{ field.label }}
                  <span class="yaml-editor__plugin-tag">
                    {{ field.pluginName }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Code editor mode -->
    <div v-else class="yaml-editor__code-mode">
      <div class="yaml-editor__code-editor">
        <textarea
          class="yaml-editor__code-textarea"
          v-model="yamlCode"
          @input="updateFromCode"
          placeholder="Enter YAML front matter here..."
          rows="10"
        ></textarea>
      </div>

      <div class="yaml-editor__code-hint">
        <i class="fas fa-info-circle"></i>
        YAML must be valid. Keys should be unique and values properly formatted.
      </div>
    </div>

    <!-- Templater variable menu -->
    <div
      v-if="showTemplaterVariableMenu"
      class="yaml-editor__templater-menu"
      :style="templaterMenuPosition"
    >
      <div class="yaml-editor__templater-menu-header">
        <div class="yaml-editor__templater-menu-title">Templater Variables</div>
        <button
          class="yaml-editor__templater-menu-close"
          @click="showTemplaterVariableMenu = false"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="yaml-editor__templater-menu-content">
        <div class="yaml-editor__templater-category">
          <h4 class="yaml-editor__templater-category-title">Date & Time</h4>
          <div class="yaml-editor__templater-items">
            <button
              class="yaml-editor__templater-item"
              @click="insertTemplaterVariable('date.now()', 'date')"
            >
              Current Date
            </button>
            <button
              class="yaml-editor__templater-item"
              @click="
                insertTemplaterVariable(
                  'date.now(&quot;YYYY-MM-DD&quot;)',
                  'date'
                )
              "
            >
              Current Date (YYYY-MM-DD)
            </button>
            <button
              class="yaml-editor__templater-item"
              @click="
                insertTemplaterVariable('date.now(&quot;HH:mm&quot;)', 'time')
              "
            >
              Current Time
            </button>
          </div>
        </div>

        <div class="yaml-editor__templater-category">
          <h4 class="yaml-editor__templater-category-title">File Properties</h4>
          <div class="yaml-editor__templater-items">
            <button
              class="yaml-editor__templater-item"
              @click="insertTemplaterVariable('file.title', 'title')"
            >
              File Title
            </button>
            <button
              class="yaml-editor__templater-item"
              @click="insertTemplaterVariable('file.folder', 'folder')"
            >
              Folder Path
            </button>
            <button
              class="yaml-editor__templater-item"
              @click="insertTemplaterVariable('file.creation_date', 'created')"
            >
              Creation Date
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { TemplateSection } from "@/types/TemplateSect";
import {
  yamlPresets,
  getPresetById,
  commonYamlFields,
  pluginYamlFields,
  parseYamlLines,
  yamlObjectToLines,
  validateYamlSyntax,
  formatValueForYaml,
  convertValueByType,
  YamlFieldMetadata,
} from "@/utils/yamlUtils";

// Props and emits
const props = defineProps<{
  content: string[];
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
}>();

// Interface for internal YAML field representation
interface YamlField {
  key: string;
  value: any;
  type: "string" | "array" | "boolean" | "date" | "number";
}

// Local state
const editorMode = ref<"visual" | "code">("visual");
const yamlFields = ref<YamlField[]>([]);
const yamlCode = ref("");
const validationError = ref("");
const isPresetSelectorOpen = ref(false);
const showCommonFieldsMenu = ref(false);
const presetSearchQuery = ref("");
const newTagValues = ref<{ [index: number]: string }>({});
const showTemplaterVariableMenu = ref(false);
const activeFieldIndex = ref(-1);
const templaterMenuPosition = ref({
  top: "0px",
  left: "0px",
});

// Computed properties
const filteredPresets = computed(() => {
  if (!presetSearchQuery.value) {
    return yamlPresets;
  }

  const query = presetSearchQuery.value.toLowerCase();
  return yamlPresets.filter((preset) => {
    return (
      preset.name.toLowerCase().includes(query) ||
      preset.description.toLowerCase().includes(query)
    );
  });
});

const availableCommonFields = computed(() => {
  const existingKeys = yamlFields.value.map((field) => field.key);
  return commonYamlFields.filter((field) => !existingKeys.includes(field.key));
});

const availablePluginFields = computed(() => {
  const existingKeys = yamlFields.value.map((field) => field.key);
  return pluginYamlFields.filter((field) => !existingKeys.includes(field.key));
});

// Initialize the editor
onMounted(() => {
  initializeFromContent();
});

// Watch for content changes from parent
watch(
  () => props.content,
  () => {
    if (props.content.join("\n") !== yamlCode.value) {
      initializeFromContent();
    }
  },
  { deep: true }
);

// Methods
function initializeFromContent() {
  // Initialize from existing content or with default empty YAML
  const content =
    props.content.length > 0 ? [...props.content] : ["---", "---"];

  // Set the code editor content
  yamlCode.value = content.join("\n");

  // Parse for visual editor
  let processedLines = [...content];

  // Remove the YAML markers if present
  if (processedLines[0]?.trim() === "---") {
    processedLines.shift();
  }
  if (processedLines[processedLines.length - 1]?.trim() === "---") {
    processedLines.pop();
  }

  // Convert to fields
  yamlFields.value = [];
  newTagValues.value = {};

  // Process each line
  let currentArrayField: string | null = null;
  let currentArrayItems: string[] = [];

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i].trim();
    if (!line) continue;

    // Handle array item
    if (line.startsWith("- ") && currentArrayField) {
      currentArrayItems.push(line.substring(2).trim());
      continue;
    } else if (currentArrayField && currentArrayItems.length > 0) {
      // Add the completed array field and reset
      yamlFields.value.push({
        key: currentArrayField,
        value: currentArrayItems,
        type: "array",
      });
      currentArrayField = null;
      currentArrayItems = [];
    }

    // Regular key-value line
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // Check if this is the start of an array
    if (!value) {
      // Check if next line is an array item
      if (
        i + 1 < processedLines.length &&
        processedLines[i + 1].trim().startsWith("- ")
      ) {
        currentArrayField = key;
        continue;
      }
    }

    // Handle different value types
    if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
      yamlFields.value.push({
        key,
        value: value.toLowerCase() === "true",
        type: "boolean",
      });
    } else if (value.startsWith("[") && value.endsWith("]")) {
      // Inline array
      const arrayValue = value
        .substring(1, value.length - 1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      yamlFields.value.push({
        key,
        value: arrayValue,
        type: "array",
      });

      // Initialize new tag input
      newTagValues.value[yamlFields.value.length - 1] = "";
    } else if (!isNaN(Number(value)) && value !== "") {
      yamlFields.value.push({
        key,
        value: Number(value),
        type: "number",
      });
    } else if (
      value.match(/^\d{4}-\d{2}-\d{2}/) ||
      value.includes("tp.date") ||
      key === "date" ||
      key === "created" ||
      key === "modified" ||
      key === "due_date" ||
      key === "due"
    ) {
      yamlFields.value.push({
        key,
        value: value,
        type: "date",
      });
    } else {
      yamlFields.value.push({
        key,
        value: value,
        type: "string",
      });
    }
  }

  // Add final array if still processing one
  if (currentArrayField && currentArrayItems.length > 0) {
    yamlFields.value.push({
      key: currentArrayField,
      value: currentArrayItems,
      type: "array",
    });
  }

  // Initialize new tag inputs for all array fields
  yamlFields.value.forEach((field, index) => {
    if (field.type === "array" && !newTagValues.value[index]) {
      newTagValues.value[index] = "";
    }
  });

  // Validate
  validateYaml();
}

function setEditorMode(mode: "visual" | "code") {
  if (mode === "code" && editorMode.value === "visual") {
    // Switching to code mode, update code from fields
    updateYaml();
  } else if (mode === "visual" && editorMode.value === "code") {
    // Switching to visual mode, parse code to fields
    updateFromCode();
  }

  editorMode.value = mode;
}

function updateYaml() {
  const yamlObject: { [key: string]: any } = {};

  // Convert fields to YAML object
  for (const field of yamlFields.value) {
    if (field.key.trim()) {
      yamlObject[field.key] = field.value;
    }
  }

  // Convert to lines
  const lines = ["---"];

  for (const [key, value] of Object.entries(yamlObject)) {
    if (Array.isArray(value)) {
      // Handle arrays
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        value.forEach((item) => lines.push(`  - ${item}`));
      }
    } else if (typeof value === "boolean") {
      // Handle booleans
      lines.push(`${key}: ${value ? "true" : "false"}`);
    } else if (value !== null && value !== undefined) {
      // Handle other values
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");

  // Update code editor
  yamlCode.value = lines.join("\n");

  // Validate
  validationError.value = "";
  const validation = validateYamlSyntax(lines);
  if (!validation.isValid) {
    validationError.value = validation.error || "Invalid YAML syntax";
    return;
  }

  // Emit update
  emit("update:content", lines);
}

function updateFromCode() {
  // Split the code into lines
  let lines = yamlCode.value.split("\n");

  // Validate
  validationError.value = "";
  const validation = validateYamlSyntax(lines);
  if (!validation.isValid) {
    validationError.value = validation.error || "Invalid YAML syntax";
    return;
  }

  // Parse the code
  initializeFromContent();

  // Emit update
  emit("update:content", lines);
}

function validateYaml() {
  // Validate the YAML
  validationError.value = "";

  // Check for duplicate keys
  const keys = new Set<string>();
  for (const field of yamlFields.value) {
    if (!field.key.trim()) continue;

    if (keys.has(field.key)) {
      validationError.value = `Duplicate key: ${field.key}`;
      return;
    }

    keys.add(field.key);
  }

  // Validate the code if in code mode
  if (editorMode.value === "code") {
    const lines = yamlCode.value.split("\n");
    const validation = validateYamlSyntax(lines);
    if (!validation.isValid) {
      validationError.value = validation.error || "Invalid YAML syntax";
    }
  }
}

function addNewField() {
  yamlFields.value.push({
    key: "",
    value: "",
    type: "string",
  });

  // Close menus
  showCommonFieldsMenu.value = false;
}

function removeField(index: number) {
  yamlFields.value.splice(index, 1);
  updateYaml();
}

function updateFieldType(index: number) {
  const field = yamlFields.value[index];
  const oldValue = field.value;

  // Convert the value to the new type
  switch (field.type) {
    case "string":
      field.value = String(oldValue);
      break;
    case "number":
      field.value = !isNaN(Number(oldValue)) ? Number(oldValue) : 0;
      break;
    case "boolean":
      field.value = Boolean(oldValue);
      break;
    case "date":
      field.value = oldValue ? String(oldValue) : "";
      break;
    case "array":
      if (!Array.isArray(oldValue)) {
        field.value = oldValue ? [String(oldValue)] : [];
        newTagValues.value[index] = "";
      }
      break;
  }

  updateYaml();
}

function getArrayValues(value: any): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

function addArrayItem(index: number) {
  const newValue = newTagValues.value[index];
  if (!newValue.trim()) return;

  if (!Array.isArray(yamlFields.value[index].value)) {
    yamlFields.value[index].value = [];
  }

  yamlFields.value[index].value.push(newValue.trim());
  newTagValues.value[index] = "";
  updateYaml();
}

function removeArrayItem(fieldIndex: number, itemIndex: number) {
  if (Array.isArray(yamlFields.value[fieldIndex].value)) {
    yamlFields.value[fieldIndex].value.splice(itemIndex, 1);
    updateYaml();
  }
}

function toggleBoolean(index: number, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  yamlFields.value[index].value = checked;
  updateYaml();
}

function applyPreset(presetId: string) {
  const preset = getPresetById(presetId);
  if (!preset) return;

  // Confirm before overwriting
  if (yamlFields.value.length > 0) {
    if (!confirm("This will replace your current YAML fields. Continue?")) {
      return;
    }
  }

  // Convert preset to fields
  yamlFields.value = [];
  newTagValues.value = {};

  for (const [key, value] of Object.entries(preset.frontmatter)) {
    const fieldMetadata = preset.fields.find((f) => f.key === key);
    const type = fieldMetadata?.type || "string";

    yamlFields.value.push({
      key,
      value,
      type: type as "string" | "array" | "boolean" | "date" | "number",
    });

    // Initialize new tag input for arrays
    if (type === "array") {
      newTagValues.value[yamlFields.value.length - 1] = "";
    }
  }

  isPresetSelectorOpen.value = false;
  updateYaml();
}

function addCommonField(field: YamlFieldMetadata) {
  yamlFields.value.push({
    key: field.key,
    value:
      field.type === "array"
        ? []
        : field.type === "boolean"
        ? false
        : field.type === "number"
        ? 0
        : "",
    type: field.type as "string" | "array" | "boolean" | "date" | "number",
  });

  // Initialize new tag input for arrays
  if (field.type === "array") {
    newTagValues.value[yamlFields.value.length - 1] = "";
  }

  showCommonFieldsMenu.value = false;
  updateYaml();
}

function showTemplaterMenu(event: MouseEvent, fieldIndex: number) {
  // Position the menu
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  templaterMenuPosition.value = {
    top: `${rect.bottom + window.scrollY + 5}px`,
    left: `${rect.left + window.scrollX}px`,
  };

  // Show the menu
  showTemplaterVariableMenu.value = true;
  activeFieldIndex.value = fieldIndex;
}

function insertTemplaterVariable(variable: string, defaultKey: string = "") {
  if (activeFieldIndex.value === -1) return;

  // Insert the variable
  const field = yamlFields.value[activeFieldIndex.value];
  field.value = `<% tp.${variable} %>`;

  // If field has no key yet, suggest one
  if (!field.key && defaultKey) {
    field.key = defaultKey;
  }

  // Close the menu
  showTemplaterVariableMenu.value = false;

  // Update YAML
  updateYaml();
}

function insertDateTemplate(index: number) {
  // Insert a Templater date variable
  yamlFields.value[index].value = '<% tp.date.now("YYYY-MM-DD") %>';
  updateYaml();
}
</script>

<style scoped>
.yaml-editor {
  width: 100%;
  position: relative;
  font-size: 0.9375rem;
}

.yaml-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.yaml-editor__title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}

.yaml-editor__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.yaml-editor__presets {
  position: relative;
}

.yaml-editor__preset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.yaml-editor__preset-btn:hover {
  background-color: rgba(79, 70, 229, 0.15);
}

.yaml-editor__preset-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  width: 300px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.yaml-editor__preset-search {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.yaml-editor__preset-search input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.yaml-editor__preset-list {
  max-height: 320px;
  overflow-y: auto;
}

.yaml-editor__preset-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.yaml-editor__preset-item:last-child {
  border-bottom: none;
}

.yaml-editor__preset-item:hover {
  background-color: #f1f5f9;
}

.yaml-editor__preset-name {
  font-weight: 500;
  font-size: 0.9375rem;
  color: #334155;
  margin-bottom: 0.25rem;
}

.yaml-editor__preset-description {
  font-size: 0.8125rem;
  color: #64748b;
}

.yaml-editor__toggle-view {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.yaml-editor__view-btn {
  padding: 0.4rem 0.75rem;
  background-color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.yaml-editor__view-btn.active {
  background-color: #f1f5f9;
  font-weight: 500;
  color: #4f46e5;
}

.yaml-editor__validation-error {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Visual Editor */
.yaml-editor__visual-mode {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.yaml-editor__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.yaml-editor__field {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8fafc;
}

.yaml-editor__field-header {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.yaml-editor__field-name {
  flex: 1;
}

.yaml-editor__field-key-input {
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.yaml-editor__field-type {
  margin-left: 0.75rem;
}

.yaml-editor__field-type-select {
  padding: 0.4rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.8125rem;
  background-color: white;
}

.yaml-editor__field-actions {
  margin-left: 0.75rem;
}

.yaml-editor__field-delete {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.yaml-editor__field-delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.yaml-editor__field-value {
  padding: 0.875rem;
}

.yaml-editor__input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9375rem;
  background-color: white;
}

.yaml-editor__date-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.yaml-editor__templater-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.yaml-editor__templater-btn:hover {
  background-color: #e2e8f0;
  color: #4f46e5;
}

.yaml-editor__boolean-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.yaml-editor__toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.yaml-editor__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.yaml-editor__toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.4s;
  border-radius: 24px;
}

.yaml-editor__toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.yaml-editor__toggle input:checked + .yaml-editor__toggle-slider {
  background-color: #4f46e5;
}

.yaml-editor__toggle input:checked + .yaml-editor__toggle-slider:before {
  transform: translateX(24px);
}

.yaml-editor__boolean-label {
  font-size: 0.9375rem;
  color: #475569;
}

.yaml-editor__array-field {
  width: 100%;
}

.yaml-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.yaml-editor__tag {
  display: flex;
  align-items: center;
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
}

.yaml-editor__tag-text {
  margin-right: 0.5rem;
}

.yaml-editor__tag-remove {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: color 0.2s;
}

.yaml-editor__tag-remove:hover {
  color: #ef4444;
}

.yaml-editor__tag-input {
  flex: 1;
  min-width: 150px;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9375rem;
  background-color: white;
}

.yaml-editor__templater-hint {
  padding: 0 0.875rem 0.875rem;
}

.yaml-editor__templater-hint-btn {
  width: auto;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  color: #4f46e5;
  background-color: rgba(79, 70, 229, 0.05);
  border: 1px dashed rgba(79, 70, 229, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.yaml-editor__templater-hint-btn:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

.yaml-editor__add-field {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.yaml-editor__add-field-btn {
  padding: 0.625rem 1rem;
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.yaml-editor__add-field-btn:hover {
  background-color: rgba(79, 70, 229, 0.15);
}

.yaml-editor__common-fields {
  position: relative;
}

.yaml-editor__common-field-btn {
  padding: 0.625rem 1rem;
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.yaml-editor__common-field-btn:hover {
  background-color: #e2e8f0;
}

.yaml-editor__common-fields-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 0.75rem;
}

.yaml-editor__common-fields-section {
  margin-bottom: 1rem;
}

.yaml-editor__common-fields-section:last-child {
  margin-bottom: 0;
}

.yaml-editor__common-fields-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 0.625rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.yaml-editor__common-fields-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.yaml-editor__common-field-item {
  padding: 0.5rem 0.75rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.yaml-editor__common-field-item:hover {
  background-color: #f1f5f9;
  color: #4f46e5;
  border-color: #cbd5e1;
}

.yaml-editor__plugin-tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 4px;
}

/* Code Editor */
.yaml-editor__code-mode {
  width: 100%;
}

.yaml-editor__code-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  min-height: 240px;
  background-color: #f8fafc;
  resize: vertical;
}

.yaml-editor__code-hint {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Templater Variable Menu */
.yaml-editor__templater-menu {
  position: absolute;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 150;
  overflow: hidden;
}

.yaml-editor__templater-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.yaml-editor__templater-menu-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #334155;
}

.yaml-editor__templater-menu-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yaml-editor__templater-menu-content {
  max-height: 320px;
  overflow-y: auto;
  padding: 0.75rem;
}

.yaml-editor__templater-category {
  margin-bottom: 1rem;
}

.yaml-editor__templater-category:last-child {
  margin-bottom: 0;
}

.yaml-editor__templater-category-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 0.5rem;
}

.yaml-editor__templater-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.yaml-editor__templater-item {
  padding: 0.5rem 0.75rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.yaml-editor__templater-item:hover {
  background-color: #e0e7ff;
  color: #4f46e5;
  border-color: #c7d2fe;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .yaml-editor__preset-dropdown {
    width: 260px;
    right: -40px;
  }

  .yaml-editor__common-fields-menu {
    width: 280px;
    right: -40px;
  }

  .yaml-editor__add-field {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .yaml-editor__field-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .yaml-editor__field-actions {
    margin-left: auto;
  }
}
</style>

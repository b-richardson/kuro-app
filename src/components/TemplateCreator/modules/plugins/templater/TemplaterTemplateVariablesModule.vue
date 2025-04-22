<template>
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
    ref="baseModuleRef"
  >
    <div class="variable-module">
      <!-- Module Header -->
      <div class="variable-module__header">
        <div class="variable-module__header-icon">
          <i class="fas fa-cube"></i>
        </div>
        <div class="variable-module__header-title">Template Variable</div>
      </div>

      <!-- Variable Configuration -->
      <div class="variable-module__container">
        <!-- Variable Name -->
        <div class="variable-module__section">
          <div class="variable-module__section-title">Variable Name</div>
          <div class="variable-module__name-input">
            <input
              type="text"
              class="variable-module__text-input"
              v-model="variableName"
              @input="sanitizeVariableName"
              placeholder="e.g., meetingTitle"
            />
          </div>
        </div>

        <!-- Value Source -->
        <div class="variable-module__section">
          <div class="variable-module__section-title">Value Source</div>

          <div class="variable-module__source-selector">
            <button
              v-for="source in valueSources"
              :key="source.id"
              class="variable-module__source-button"
              :class="{
                'variable-module__source-button--active':
                  valueSource === source.id,
              }"
              @click="setValueSource(source.id)"
            >
              <i :class="source.icon"></i>
              <span>{{ source.label }}</span>
            </button>
          </div>

          <!-- Direct Input -->
          <div
            v-if="valueSource === 'direct'"
            class="variable-module__value-input"
          >
            <input
              type="text"
              class="variable-module__text-input"
              v-model="directValue"
              @input="generateCode"
              placeholder="Enter a value"
            />
          </div>

          <!-- File Property -->
          <div
            v-if="valueSource === 'file'"
            class="variable-module__file-property"
          >
            <select
              class="variable-module__select"
              v-model="fileProperty"
              @change="generateCode"
            >
              <option value="title">File Title</option>
              <option value="path">File Path</option>
              <option value="folder">Folder Name</option>
              <option value="created">Creation Date</option>
              <option value="modified">Last Modified Date</option>
              <option value="tags">Tags</option>
            </select>

            <div
              v-if="fileProperty === 'created' || fileProperty === 'modified'"
              class="variable-module__date-format"
            >
              <div class="variable-module__secondary-label">Date Format</div>
              <select
                class="variable-module__select"
                v-model="dateFormat"
                @change="generateCode"
              >
                <option value="YYYY-MM-DD">ISO (2023-05-15)</option>
                <option value="MM/DD/YYYY">Short (05/15/2023)</option>
                <option value="MMMM D, YYYY">Long (May 15, 2023)</option>
                <option value="ddd, MMM D">Day (Mon, May 15)</option>
              </select>
            </div>
          </div>

          <!-- User Variable -->
          <div
            v-if="valueSource === 'variable'"
            class="variable-module__variable-input"
          >
            <input
              type="text"
              class="variable-module__text-input"
              v-model="sourceVariable"
              @input="sanitizeSourceVariable"
              placeholder="Enter variable name"
            />
            <div class="variable-module__hint">
              Reference another variable from a user input or transformation
            </div>
          </div>

          <!-- Frontmatter -->
          <div
            v-if="valueSource === 'frontmatter'"
            class="variable-module__frontmatter-input"
          >
            <input
              type="text"
              class="variable-module__text-input"
              v-model="frontmatterKey"
              @input="generateCode"
              placeholder="frontmatter key (e.g., tags, status)"
            />
            <div class="variable-module__hint">
              Get a value from the file's frontmatter
            </div>
          </div>

          <!-- Date Calculation -->
          <div v-if="valueSource === 'date'" class="variable-module__date-calc">
            <div class="variable-module__date-base">
              <div class="variable-module__secondary-label">Base Date</div>
              <select
                class="variable-module__select"
                v-model="dateBase"
                @change="generateCode"
              >
                <option value="now">Current Date</option>
                <option value="created">File Creation Date</option>
                <option value="modified">File Modified Date</option>
              </select>
            </div>

            <div class="variable-module__date-offset">
              <div class="variable-module__secondary-label">Date Offset</div>
              <div class="variable-module__offset-controls">
                <select
                  class="variable-module__select variable-module__select--small"
                  v-model="dateDirection"
                  @change="generateCode"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>

                <input
                  type="number"
                  class="variable-module__number-input"
                  v-model.number="dateAmount"
                  min="0"
                  @input="generateCode"
                />

                <select
                  class="variable-module__select"
                  v-model="dateUnit"
                  @change="generateCode"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div class="variable-module__date-format">
              <div class="variable-module__secondary-label">Date Format</div>
              <select
                class="variable-module__select"
                v-model="dateCalcFormat"
                @change="generateCode"
              >
                <option value="YYYY-MM-DD">ISO (2023-05-15)</option>
                <option value="MM/DD/YYYY">Short (05/15/2023)</option>
                <option value="MMMM D, YYYY">Long (May 15, 2023)</option>
                <option value="ddd, MMM D">Day (Mon, May 15)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="variable-module__section">
          <div class="variable-module__section-title">Options</div>

          <div class="variable-module__usage">
            <label class="variable-module__checkbox">
              <input
                type="checkbox"
                v-model="insertUsage"
                @change="generateCode"
              />
              <span>Insert usage example</span>
            </label>

            <div class="variable-module__usage-note">
              This adds a comment showing how to use the variable
            </div>
          </div>

          <div class="variable-module__defaults">
            <label class="variable-module__checkbox">
              <input
                type="checkbox"
                v-model="useDefaultValue"
                @change="generateCode"
              />
              <span>Default value</span>
            </label>

            <div v-if="useDefaultValue" class="variable-module__default-input">
              <input
                type="text"
                class="variable-module__text-input"
                v-model="defaultValue"
                @input="generateCode"
                placeholder="Value if source is empty"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
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

// Variable name
const variableName = ref("");

// Value source options
const valueSource = ref("direct");
const valueSources = [
  { id: "direct", label: "Direct Input", icon: "fas fa-keyboard" },
  { id: "file", label: "File Property", icon: "fas fa-file-alt" },
  { id: "variable", label: "User Variable", icon: "fas fa-cube" },
  { id: "frontmatter", label: "Frontmatter", icon: "fas fa-list" },
  { id: "date", label: "Date Calculation", icon: "fas fa-calendar-alt" },
];

// Direct input value
const directValue = ref("");

// File property options
const fileProperty = ref("title");
const dateFormat = ref("YYYY-MM-DD");

// User variable
const sourceVariable = ref("");

// Frontmatter
const frontmatterKey = ref("");

// Date calculation
const dateBase = ref("now");
const dateDirection = ref("+");
const dateAmount = ref(0);
const dateUnit = ref("days");
const dateCalcFormat = ref("YYYY-MM-DD");

// Advanced options
const insertUsage = ref(true);
const useDefaultValue = ref(false);
const defaultValue = ref("");

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Set defaults and generate initial code
    generateCode();
  }
});

// Set value source
function setValueSource(source: string) {
  valueSource.value = source;
  generateCode();
}

// Sanitize variable name
function sanitizeVariableName() {
  // Replace spaces and special characters with underscores
  variableName.value = variableName.value
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");

  generateCode();
}

// Sanitize source variable
function sanitizeSourceVariable() {
  // Replace spaces and special characters with underscores
  sourceVariable.value = sourceVariable.value
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");

  generateCode();
}

// Generate the variable definition code
function generateVariableCode() {
  if (!variableName.value) {
    return "/* Please enter a variable name */";
  }

  let valueCode = "";

  // Generate code based on value source
  switch (valueSource.value) {
    case "direct":
      valueCode = `"${directValue.value.replace(/"/g, '\\"')}"`;
      break;

    case "file":
      valueCode = generateFilePropertyCode();
      break;

    case "variable":
      if (!sourceVariable.value) {
        valueCode = '""';
      } else {
        valueCode = `tp.user.${sourceVariable.value}`;
      }
      break;

    case "frontmatter":
      if (!frontmatterKey.value) {
        valueCode = '""';
      } else {
        valueCode = `tp.frontmatter.${frontmatterKey.value}`;
      }
      break;

    case "date":
      valueCode = generateDateCalculationCode();
      break;
  }

  // Add default value if enabled
  if (useDefaultValue.value && defaultValue.value) {
    valueCode = `(${valueCode} || "${defaultValue.value.replace(
      /"/g,
      '\\"'
    )}")`;
  }

  return `tp.user.${variableName.value} = ${valueCode}`;
}

// Generate file property code
function generateFilePropertyCode() {
  switch (fileProperty.value) {
    case "title":
      return "tp.file.title";

    case "path":
      return "tp.file.path(true)";

    case "folder":
      return "tp.file.folder()";

    case "created":
      return `tp.file.creation_date("${dateFormat.value}")`;

    case "modified":
      return `tp.file.last_modified_date("${dateFormat.value}")`;

    case "tags":
      return "tp.file.tags.join(', ')";

    default:
      return "tp.file.title";
  }
}

// Generate date calculation code
function generateDateCalculationCode() {
  let baseDate = "";

  // Determine base date
  switch (dateBase.value) {
    case "now":
      baseDate = "tp.date.now";
      break;

    case "created":
      baseDate = "tp.file.creation_date";
      break;

    case "modified":
      baseDate = "tp.file.last_modified_date";
      break;
  }

  // If no offset, just return formatted date
  if (dateAmount.value === 0) {
    return `${baseDate}("${dateCalcFormat.value}")`;
  }

  // Otherwise, calculate with offset
  return `${baseDate}("${dateCalcFormat.value}", "${dateDirection.value}${dateAmount.value}${dateUnit.value}")`;
}

// Generate usage example
function generateUsageExample() {
  if (!variableName.value) {
    return "";
  }

  return `
  // Example usage:
  // <% tp.user.${variableName.value} %>`;
}

// Generate the full Templater code
function generateCode() {
  let code = "";

  // Variable definition
  code = `<% ${generateVariableCode()} %>`;

  // Add usage example if enabled
  if (insertUsage.value) {
    code += generateUsageExample();
  }

  updateContent([code]);
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Remove the Templater tags
    const cleanCode = code.replace(/<%|%>/g, "").trim();

    // Check for variable definition
    const variableMatch = cleanCode.match(
      /tp\.user\.(\w+)\s*=\s*(.*?)(?:\/\/|$)/
    );

    if (variableMatch) {
      // Set variable name
      variableName.value = variableMatch[1];

      // Extract value expression
      const valueExpr = variableMatch[2].trim();

      // Check for default value
      if (valueExpr.includes("||")) {
        useDefaultValue.value = true;

        const defaultMatch = valueExpr.match(/\|\|\s*"([^"]*)"(?:\))?/);
        if (defaultMatch) {
          defaultValue.value = defaultMatch[1];
        }
      }

      // Determine value source and parse specific options
      if (valueExpr.includes("tp.file.")) {
        valueSource.value = "file";
        parseFilePropertyCode(valueExpr);
      } else if (valueExpr.includes("tp.user.")) {
        valueSource.value = "variable";
        parseVariableCode(valueExpr);
      } else if (valueExpr.includes("tp.frontmatter.")) {
        valueSource.value = "frontmatter";
        parseFrontmatterCode(valueExpr);
      } else if (
        valueExpr.includes("tp.date.") ||
        valueExpr.includes("tp.file.creation_date(") ||
        valueExpr.includes("tp.file.last_modified_date(")
      ) {
        valueSource.value = "date";
        parseDateCalculationCode(valueExpr);
      } else {
        valueSource.value = "direct";
        parseDirectInputCode(valueExpr);
      }

      // Check for usage example
      insertUsage.value = code.includes("// Example usage:");
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
    generateCode();
  }
}

// Parse direct input code
function parseDirectInputCode(code: string) {
  const valueMatch = code.match(/"([^"]*)"/);

  if (valueMatch) {
    directValue.value = valueMatch[1];
  }
}

// Parse file property code
function parseFilePropertyCode(code: string) {
  if (code.includes("tp.file.title")) {
    fileProperty.value = "title";
  } else if (code.includes("tp.file.path")) {
    fileProperty.value = "path";
  } else if (code.includes("tp.file.folder")) {
    fileProperty.value = "folder";
  } else if (code.includes("tp.file.tags")) {
    fileProperty.value = "tags";
  } else if (code.includes("tp.file.creation_date")) {
    fileProperty.value = "created";
    const formatMatch = code.match(/creation_date\("([^"]+)"\)/);
    if (formatMatch) {
      dateFormat.value = formatMatch[1];
    }
  } else if (code.includes("tp.file.last_modified_date")) {
    fileProperty.value = "modified";
    const formatMatch = code.match(/last_modified_date\("([^"]+)"\)/);
    if (formatMatch) {
      dateFormat.value = formatMatch[1];
    }
  }
}

// Parse variable code
function parseVariableCode(code: string) {
  const varMatch = code.match(/tp\.user\.(\w+)/);

  if (varMatch) {
    sourceVariable.value = varMatch[1];
  }
}

// Parse frontmatter code
function parseFrontmatterCode(code: string) {
  const keyMatch = code.match(/tp\.frontmatter\.(\w+)/);

  if (keyMatch) {
    frontmatterKey.value = keyMatch[1];
  }
}

// Parse date calculation code
function parseDateCalculationCode(code: string) {
  // Determine base date
  if (code.includes("tp.date.now")) {
    dateBase.value = "now";
  } else if (code.includes("tp.file.creation_date")) {
    dateBase.value = "created";
  } else if (code.includes("tp.file.last_modified_date")) {
    dateBase.value = "modified";
  }

  // Extract format
  const formatMatch = code.match(/"([^"]+)"/);
  if (formatMatch) {
    dateCalcFormat.value = formatMatch[1];
  }

  // Check for offset
  const offsetMatch = code.match(/"([+-])(\d+)(\w+)"/);
  if (offsetMatch) {
    dateDirection.value = offsetMatch[1];
    dateAmount.value = parseInt(offsetMatch[2]);
    dateUnit.value = offsetMatch[3];
  } else {
    dateAmount.value = 0;
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for changes to update code
watch(
  [
    variableName,
    valueSource,
    directValue,
    fileProperty,
    dateFormat,
    sourceVariable,
    frontmatterKey,
    dateBase,
    dateDirection,
    dateAmount,
    dateUnit,
    dateCalcFormat,
    insertUsage,
    useDefaultValue,
    defaultValue,
  ],
  () => {
    generateCode();
  },
  { deep: true }
);
</script>

<style scoped>
.variable-module {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.variable-module__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.variable-module__header-icon {
  color: #a855f7;
  font-size: 18px;
}

.variable-module__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Container */
.variable-module__container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section styling */
.variable-module__section {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.variable-module__section-title {
  font-weight: 500;
  font-size: 15px;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.variable-module__secondary-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

/* Name input */
.variable-module__name-input {
  position: relative;
}

/* Source selector */
.variable-module__source-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.variable-module__source-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.variable-module__source-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.variable-module__source-button i {
  font-size: 20px;
  margin-bottom: 4px;
}

.variable-module__source-button span {
  font-size: 14px;
}

.variable-module__source-button--active {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.5);
  color: #fff;
}

.variable-module__source-button--active i {
  color: #a855f7;
}

/* Value inputs */
.variable-module__value-input,
.variable-module__file-property,
.variable-module__variable-input,
.variable-module__frontmatter-input,
.variable-module__date-calc {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.variable-module__date-base,
.variable-module__date-offset,
.variable-module__date-format {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.variable-module__offset-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.variable-module__usage,
.variable-module__defaults {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variable-module__usage-note,
.variable-module__hint {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 26px;
}

.variable-module__default-input {
  margin-top: 4px;
}

/* Form controls */
.variable-module__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
}

.variable-module__text-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.25);
}

.variable-module__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.variable-module__number-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 70px;
  text-align: center;
}

.variable-module__number-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
}

.variable-module__select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.variable-module__select--small {
  width: 60px;
  padding-right: 28px;
}

.variable-module__select:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
}

/* Checkbox */
.variable-module__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.variable-module__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.variable-module__checkbox input[type="checkbox"]:checked {
  background: rgba(168, 85, 247, 0.8);
  border-color: rgba(168, 85, 247, 0.8);
}

.variable-module__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.variable-module__checkbox span {
  font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .variable-module__source-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .variable-module__offset-controls {
    flex-wrap: wrap;
  }
}
</style>

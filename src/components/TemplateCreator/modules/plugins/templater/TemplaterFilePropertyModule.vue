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
    <div class="file-property">
      <!-- Module Header -->
      <div class="file-property__header">
        <div class="file-property__header-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="file-property__header-title">File Property</div>
      </div>

      <!-- Property Selection UI -->
      <div class="file-property__selection">
        <!-- Category Selection Dropdown -->
        <div class="file-property__field">
          <label for="property-category">Property Category</label>
          <div class="file-property__select-wrapper">
            <select
              id="property-category"
              v-model="selectedCategory"
              class="file-property__select"
            >
              <option value="">Select a category</option>
              <option
                v-for="category in propertyCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Property Selection Dropdown (appears after category selection) -->
        <div class="file-property__field" v-if="selectedCategory">
          <label for="property-type">Property Type</label>
          <div class="file-property__select-wrapper">
            <select
              id="property-type"
              v-model="selectedProperty"
              class="file-property__select"
            >
              <option value="">Select a property</option>
              <option
                v-for="property in getCategoryProperties(selectedCategory)"
                :key="property.id"
                :value="property.id"
              >
                {{ property.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Format Options (appears after property selection) -->
      <div class="file-property__format" v-if="selectedProperty">
        <!-- File Name Options -->
        <div
          v-if="selectedProperty === 'fileName'"
          class="file-property__options"
        >
          <div class="file-property__toggle">
            <input
              type="checkbox"
              id="includeExtension"
              v-model="formatOptions.includeExtension"
            />
            <label for="includeExtension">Include file extension (.md)</label>
          </div>
        </div>

        <!-- Path Options -->
        <div
          v-if="
            selectedProperty === 'folderPath' || selectedProperty === 'filePath'
          "
          class="file-property__options"
        >
          <div class="file-property__radio-group">
            <div class="file-property__radio">
              <input
                type="radio"
                id="fullPath"
                value="full"
                v-model="formatOptions.pathFormat"
              />
              <label for="fullPath">Full path</label>
            </div>
            <div class="file-property__radio">
              <input
                type="radio"
                id="relativePath"
                value="relative"
                v-model="formatOptions.pathFormat"
              />
              <label for="relativePath">Relative path</label>
            </div>
          </div>
        </div>

        <!-- Parent Folder Options -->
        <div
          v-if="selectedProperty === 'parentFolder'"
          class="file-property__options"
        >
          <label class="file-property__label">Folder level</label>
          <div class="file-property__level-selector">
            <button
              class="file-property__level-btn"
              @click="decrementLevel"
              :disabled="formatOptions.parentLevel <= 1"
            >
              <i class="fas fa-minus"></i>
            </button>
            <div class="file-property__level-display">
              {{ formatOptions.parentLevel }}
            </div>
            <button class="file-property__level-btn" @click="incrementLevel">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="file-property__level-label">
            {{
              formatOptions.parentLevel === 1
                ? "Direct parent folder"
                : `${formatOptions.parentLevel} levels up`
            }}
          </div>
        </div>

        <!-- Date Format Options -->
        <div
          v-if="
            selectedProperty === 'creation' || selectedProperty === 'modified'
          "
          class="file-property__options"
        >
          <label class="file-property__label">Date Format</label>
          <div class="file-property__date-formats">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="file-property__format-button"
              :class="{
                'file-property__format-button--active':
                  formatOptions.dateFormat === format.id,
              }"
              @click="selectDateFormat(format.id)"
            >
              {{ format.name }}
            </button>
          </div>
        </div>

        <!-- File Size Options -->
        <div
          v-if="selectedProperty === 'fileSize'"
          class="file-property__options"
        >
          <div class="file-property__toggle">
            <input
              type="checkbox"
              id="humanReadable"
              v-model="formatOptions.humanReadable"
            />
            <label for="humanReadable">Human readable format (KB, MB)</label>
          </div>
        </div>

        <!-- Optional Prefix/Label Field -->
        <div class="file-property__field file-property__prefix">
          <label for="prefix-text">Prefix text (optional):</label>
          <input
            type="text"
            id="prefix-text"
            v-model="prefixText"
            class="file-property__input"
            placeholder="e.g., 'Path:', 'Created:'"
          />
        </div>
      </div>

      <!-- Runtime Example Preview -->
      <div class="file-property__preview" v-if="selectedProperty">
        <div class="file-property__preview-header">Example output:</div>
        <div class="file-property__preview-content">
          <span v-if="prefixText" class="file-property__preview-prefix">{{
            prefixText
          }}</span>
          <span class="file-property__preview-value">{{
            getExampleOutput()
          }}</span>
        </div>
        <div class="file-property__preview-note">
          Will be replaced with actual file property at runtime
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
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

// Module state
const selectedCategory = ref("");
const selectedProperty = ref("");
const prefixText = ref("");

// Format options for different property types
const formatOptions = ref({
  includeExtension: false,
  pathFormat: "relative",
  parentLevel: 1,
  dateFormat: "simple",
  humanReadable: true,
});

// Property categories with their properties
const propertyCategories = [
  {
    id: "fileInfo",
    name: "File Information",
    icon: "📄",
    properties: [
      { id: "fileName", name: "File Name" },
      { id: "folderPath", name: "Folder Path" },
      { id: "filePath", name: "Full Path" },
      { id: "parentFolder", name: "Parent Folder" },
    ],
  },
  {
    id: "dateTime",
    name: "Date & Time",
    icon: "📅",
    properties: [
      { id: "creation", name: "Creation Date" },
      { id: "modified", name: "Last Modified Date" },
    ],
  },
  {
    id: "contentStats",
    name: "Content Statistics",
    icon: "📊",
    properties: [
      { id: "wordCount", name: "Word Count" },
      { id: "charCount", name: "Character Count" },
      { id: "fileSize", name: "File Size" },
    ],
  },
];

// Date formats
const dateFormats = [
  { id: "simple", name: "Simple", format: "MMM D, YYYY" },
  { id: "short", name: "Short", format: "MM/DD/YYYY" },
  { id: "full", name: "Full", format: "dddd, MMMM D, YYYY" },
  { id: "iso", name: "ISO", format: "YYYY-MM-DD" },
];

// Get properties for selected category
const getCategoryProperties = (categoryId: string) => {
  const category = propertyCategories.find((cat) => cat.id === categoryId);
  return category ? category.properties : [];
};

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  }
});

// Select date format
function selectDateFormat(format: string) {
  formatOptions.value.dateFormat = format;
}

// Increment/decrement parent folder level
function incrementLevel() {
  formatOptions.value.parentLevel++;
}

function decrementLevel() {
  if (formatOptions.value.parentLevel > 1) {
    formatOptions.value.parentLevel--;
  }
}

// Generate example output based on current selections
function getExampleOutput() {
  switch (selectedProperty.value) {
    case "fileName":
      return formatOptions.value.includeExtension ? "my-note.md" : "my-note";

    case "folderPath":
      return formatOptions.value.pathFormat === "full"
        ? "/Vault/Projects/Current"
        : "Projects/Current";

    case "filePath":
      return formatOptions.value.pathFormat === "full"
        ? "/Vault/Projects/Current/my-note.md"
        : "Projects/Current/my-note.md";

    case "parentFolder":
      if (formatOptions.value.parentLevel === 1) {
        return "Current";
      } else if (formatOptions.value.parentLevel === 2) {
        return "Projects";
      } else {
        return "Vault";
      }

    case "creation":
      return getFormattedDateExample(formatOptions.value.dateFormat);

    case "modified":
      return getFormattedDateExample(formatOptions.value.dateFormat);

    case "wordCount":
      return "250 words";

    case "charCount":
      return "1,423 characters";

    case "fileSize":
      return formatOptions.value.humanReadable ? "24.5 KB" : "25,088 bytes";

    default:
      return "";
  }
}

// Get formatted date example based on format
function getFormattedDateExample(formatId: string) {
  const today = new Date();
  switch (formatId) {
    case "simple":
      return `Apr 4, 2025`;
    case "short":
      return `04/04/2025`;
    case "full":
      return `Friday, April 4, 2025`;
    case "iso":
      return `2025-04-04`;
    default:
      return `Apr 4, 2025`;
  }
}

// Generate the Templater code based on selections
function generateCode() {
  // If nothing selected, return empty
  if (!selectedProperty.value) {
    return "";
  }

  let prefix = prefixText.value ? `${prefixText.value} ` : "";
  let code = prefix + "<% tp.file.";

  switch (selectedProperty.value) {
    case "fileName":
      code += `title${
        formatOptions.value.includeExtension ? "(true)" : "()"
      } %>`;
      break;

    case "folderPath":
      code += `folder(${
        formatOptions.value.pathFormat === "full" ? "true" : "false"
      }) %>`;
      break;

    case "filePath":
      code += `path(${
        formatOptions.value.pathFormat === "full" ? "true" : "false"
      }) %>`;
      break;

    case "parentFolder":
      const level = formatOptions.value.parentLevel;
      if (level === 1) {
        code += `folder(false) %>`;
      } else {
        // For multiple levels up, use path manipulation
        code += `path(false).split("/").slice(0, -${level}).join("/") %>`;
      }
      break;

    case "creation":
      const createFormat = getFormatString(formatOptions.value.dateFormat);
      code += `creation_date("${createFormat}") %>`;
      break;

    case "modified":
      const modifiedFormat = getFormatString(formatOptions.value.dateFormat);
      code += `last_modified_date("${modifiedFormat}") %>`;
      break;

    case "wordCount":
      code += `content.split(/\\s+/).length %>`;
      break;

    case "charCount":
      code += `content.length %>`;
      break;

    case "fileSize":
      if (formatOptions.value.humanReadable) {
        code += `size(true) %>`;
      } else {
        code += `size(false) %>`;
      }
      break;
  }

  return code;
}

// Helper to get date format string based on selection
function getFormatString(formatId: string) {
  const format = dateFormats.find((f) => f.id === formatId);
  return format ? format.format : "YYYY-MM-DD";
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Extract prefix if exists
    const prefixMatch = code.match(/^(.*?)<% tp\.file\./);
    if (prefixMatch && prefixMatch[1]) {
      prefixText.value = prefixMatch[1].trim();
    }

    // Remove the prefix and Templater tags
    const cleanCode = code.replace(/^.*?<% ?|%>/g, "").trim();

    // Set category and property based on the code
    if (cleanCode.includes("tp.file.title")) {
      selectedCategory.value = "fileInfo";
      selectedProperty.value = "fileName";
      formatOptions.value.includeExtension = cleanCode.includes("title(true)");
    } else if (cleanCode.includes("tp.file.folder")) {
      selectedCategory.value = "fileInfo";

      if (cleanCode.includes("path(false).split")) {
        // This is a parent folder with level
        selectedProperty.value = "parentFolder";
        const levelMatch = cleanCode.match(/slice\(0, -(\d+)\)/);
        if (levelMatch) {
          formatOptions.value.parentLevel = parseInt(levelMatch[1]);
        }
      } else {
        selectedProperty.value = "folderPath";
        formatOptions.value.pathFormat = cleanCode.includes("folder(true)")
          ? "full"
          : "relative";
      }
    } else if (cleanCode.includes("tp.file.path")) {
      selectedCategory.value = "fileInfo";
      selectedProperty.value = "filePath";
      formatOptions.value.pathFormat = cleanCode.includes("path(true)")
        ? "full"
        : "relative";
    } else if (cleanCode.includes("tp.file.creation_date")) {
      selectedCategory.value = "dateTime";
      selectedProperty.value = "creation";
      parseFormatFromCode(cleanCode, "creation_date");
    } else if (cleanCode.includes("tp.file.last_modified_date")) {
      selectedCategory.value = "dateTime";
      selectedProperty.value = "modified";
      parseFormatFromCode(cleanCode, "last_modified_date");
    } else if (cleanCode.includes("tp.file.content.split")) {
      selectedCategory.value = "contentStats";
      selectedProperty.value = "wordCount";
    } else if (cleanCode.includes("tp.file.content.length")) {
      selectedCategory.value = "contentStats";
      selectedProperty.value = "charCount";
    } else if (cleanCode.includes("tp.file.size")) {
      selectedCategory.value = "contentStats";
      selectedProperty.value = "fileSize";
      formatOptions.value.humanReadable = cleanCode.includes("size(true)");
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just leave selections empty
  }
}

// Helper to parse date format from code
function parseFormatFromCode(code: string, funcName: string) {
  const formatMatch = code.match(new RegExp(`${funcName}\\("([^"]+)"`));
  if (formatMatch) {
    const extractedFormat = formatMatch[1];

    // Try to match with predefined formats
    const matchedFormat = dateFormats.find((f) => f.format === extractedFormat);
    if (matchedFormat) {
      formatOptions.value.dateFormat = matchedFormat.id;
    } else {
      // Default to simple if no match
      formatOptions.value.dateFormat = "simple";
    }
  }
}

// Update content when options change
function updateContent() {
  const code = generateCode();
  emit("update:content", [code]);
}

// Watch for changes to update generated code
watch(
  [selectedCategory, selectedProperty, formatOptions, prefixText],
  () => {
    if (selectedProperty.value) {
      updateContent();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.file-property {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header styles */
.file-property__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.file-property__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.file-property__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Selection dropdowns */
.file-property__selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-property__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-property__field label {
  font-size: 14px;
  color: #94a3b8;
}

.file-property__select-wrapper {
  position: relative;
}

.file-property__select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  appearance: none;
}

.file-property__select-wrapper::after {
  content: "▼";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
  pointer-events: none;
}

.file-property__input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
}

/* Format options */
.file-property__format {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.2s ease-in;
}

.file-property__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.file-property__label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 4px;
}

/* Toggle and radio styles */
.file-property__toggle,
.file-property__radio {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-property__radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-property__toggle input[type="checkbox"],
.file-property__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  cursor: pointer;
}

.file-property__toggle input[type="checkbox"] {
  border-radius: 4px;
}

.file-property__radio input[type="radio"] {
  border-radius: 50%;
}

.file-property__toggle input[type="checkbox"]:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.file-property__toggle input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.file-property__radio input[type="radio"]:checked {
  border-color: #3b82f6;
}

.file-property__radio input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
}

.file-property__toggle label,
.file-property__radio label {
  font-size: 14px;
  cursor: pointer;
  color: #e2e8f0;
}

/* Level selector for parent folders */
.file-property__level-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-property__level-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.file-property__level-btn:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.8);
}

.file-property__level-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-property__level-display {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
}

.file-property__level-label {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Date format buttons */
.file-property__date-formats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.file-property__format-button {
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.file-property__format-button:hover {
  background: rgba(30, 41, 59, 0.8);
}

.file-property__format-button--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Prefix field styling */
.file-property__prefix {
  margin-top: 4px;
}

/* Example preview */
.file-property__preview {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.2s ease-in;
}

.file-property__preview-header {
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 10px;
}

.file-property__preview-content {
  padding: 12px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 14px;
  color: #f8fafc;
  word-break: break-all;
}

.file-property__preview-prefix {
  color: #94a3b8;
}

.file-property__preview-value {
  color: #60a5fa;
}

.file-property__preview-note {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .file-property__date-formats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

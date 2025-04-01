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

      <!-- Property Selection Cards -->
      <div class="file-property__cards">
        <!-- File Name Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'fileName',
          }"
          @click="selectProperty('fileName')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-file-signature"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">File Name</div>
            <div class="file-property__card-desc">
              Insert the name of the current file
            </div>
          </div>
        </div>

        <!-- Folder Path Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'folderPath',
          }"
          @click="selectProperty('folderPath')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-folder"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">Folder Path</div>
            <div class="file-property__card-desc">
              Insert the path to the file's folder
            </div>
          </div>
        </div>

        <!-- File Path Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'filePath',
          }"
          @click="selectProperty('filePath')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-sitemap"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">Full Path</div>
            <div class="file-property__card-desc">
              Insert the complete file path
            </div>
          </div>
        </div>

        <!-- Parent Folder Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'parentFolder',
          }"
          @click="selectProperty('parentFolder')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-level-up-alt"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">Parent Folder</div>
            <div class="file-property__card-desc">
              Insert the name of the parent folder
            </div>
          </div>
        </div>

        <!-- Creation Date Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'creation',
          }"
          @click="selectProperty('creation')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">Creation Date</div>
            <div class="file-property__card-desc">
              Insert when the file was created
            </div>
          </div>
        </div>

        <!-- Modified Date Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'modified',
          }"
          @click="selectProperty('modified')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">Modified Date</div>
            <div class="file-property__card-desc">
              Insert when the file was last updated
            </div>
          </div>
        </div>

        <!-- File Stats Card -->
        <div
          class="file-property__card"
          :class="{
            'file-property__card--active': selectedProperty === 'stats',
          }"
          @click="selectProperty('stats')"
        >
          <div class="file-property__card-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="file-property__card-content">
            <div class="file-property__card-title">File Stats</div>
            <div class="file-property__card-desc">
              Insert file size or word count
            </div>
          </div>
        </div>
      </div>

      <!-- Options Panel -->
      <div v-if="selectedProperty" class="file-property__options">
        <!-- File Name Options -->
        <div
          v-if="selectedProperty === 'fileName'"
          class="file-property__option-group"
        >
          <div class="file-property__option-title">Options</div>
          <div class="file-property__checkbox">
            <input
              type="checkbox"
              id="includeExtension"
              v-model="fileNameOptions.includeExtension"
              @change="generateCode"
            />
            <label for="includeExtension">Include file extension (.md)</label>
          </div>
        </div>

        <!-- Path Options -->
        <div
          v-if="
            selectedProperty === 'folderPath' || selectedProperty === 'filePath'
          "
          class="file-property__option-group"
        >
          <div class="file-property__option-title">Format</div>
          <div class="file-property__radio-group">
            <div class="file-property__radio">
              <input
                type="radio"
                id="fullPath"
                value="full"
                v-model="pathOptions.format"
                @change="generateCode"
              />
              <label for="fullPath">Full path (e.g., /Folder/Subfolder)</label>
            </div>
            <div class="file-property__radio">
              <input
                type="radio"
                id="relativePath"
                value="relative"
                v-model="pathOptions.format"
                @change="generateCode"
              />
              <label for="relativePath">Relative path (from vault root)</label>
            </div>
          </div>
        </div>

        <!-- Parent Folder Options -->
        <div
          v-if="selectedProperty === 'parentFolder'"
          class="file-property__option-group"
        >
          <div class="file-property__option-title">Levels Up</div>
          <div class="file-property__level-selector">
            <button
              class="file-property__level-btn"
              @click="decrementLevel"
              :disabled="parentOptions.level <= 1"
            >
              <i class="fas fa-minus"></i>
            </button>
            <div class="file-property__level-display">
              {{ parentOptions.level }}
            </div>
            <button class="file-property__level-btn" @click="incrementLevel">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="file-property__level-label">
            {{
              parentOptions.level === 1
                ? "Direct parent folder"
                : `${parentOptions.level} levels up`
            }}
          </div>
        </div>

        <!-- Date Options -->
        <div
          v-if="
            selectedProperty === 'creation' || selectedProperty === 'modified'
          "
          class="file-property__option-group"
        >
          <div class="file-property__option-title">Date Format</div>
          <div class="file-property__format-buttons">
            <button
              v-for="format in dateFormats"
              :key="format.id"
              class="file-property__format-button"
              :class="{
                'file-property__format-button--active':
                  dateOptions.format === format.id,
              }"
              @click="selectDateFormat(format.id)"
            >
              {{ format.name }}
            </button>
          </div>
        </div>

        <!-- Stats Options -->
        <div
          v-if="selectedProperty === 'stats'"
          class="file-property__option-group"
        >
          <div class="file-property__option-title">Statistics</div>
          <div class="file-property__radio-group">
            <div class="file-property__radio">
              <input
                type="radio"
                id="wordCount"
                value="wordCount"
                v-model="statsOptions.type"
                @change="generateCode"
              />
              <label for="wordCount">Word count</label>
            </div>
            <div class="file-property__radio">
              <input
                type="radio"
                id="charCount"
                value="charCount"
                v-model="statsOptions.type"
                @change="generateCode"
              />
              <label for="charCount">Character count</label>
            </div>
            <div class="file-property__radio">
              <input
                type="radio"
                id="fileSize"
                value="fileSize"
                v-model="statsOptions.type"
                @change="generateCode"
              />
              <label for="fileSize">File size</label>
            </div>
          </div>

          <div
            v-if="statsOptions.type === 'fileSize'"
            class="file-property__checkbox"
          >
            <input
              type="checkbox"
              id="humanReadable"
              v-model="statsOptions.humanReadable"
              @change="generateCode"
            />
            <label for="humanReadable">Human readable (KB, MB)</label>
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

// Property selection state
const selectedProperty = ref("");

// Property-specific options
const fileNameOptions = ref({
  includeExtension: false,
});

const pathOptions = ref({
  format: "relative",
});

const parentOptions = ref({
  level: 1,
});

const dateOptions = ref({
  format: "simple",
});

const statsOptions = ref({
  type: "wordCount",
  humanReadable: true,
});

// Date formats
const dateFormats = [
  { id: "simple", name: "Simple", format: "MMM D, YYYY" },
  { id: "short", name: "Short", format: "MM/DD/YYYY" },
  { id: "full", name: "Full", format: "dddd, MMMM D, YYYY" },
  { id: "iso", name: "ISO", format: "YYYY-MM-DD" },
];

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Set default selection
    selectProperty("fileName");
  }
});

// Select a property
function selectProperty(property: string) {
  selectedProperty.value = property;
  generateCode();
}

// Increment/decrement parent folder level
function incrementLevel() {
  parentOptions.value.level++;
  generateCode();
}

function decrementLevel() {
  if (parentOptions.value.level > 1) {
    parentOptions.value.level--;
    generateCode();
  }
}

// Select date format
function selectDateFormat(format: string) {
  dateOptions.value.format = format;
  generateCode();
}

// Generate the Templater code
function generateCode() {
  let code = "<% tp.file.";

  switch (selectedProperty.value) {
    case "fileName":
      code += `title${
        fileNameOptions.value.includeExtension ? "(true)" : "()"
      } %>`;
      break;

    case "folderPath":
      code += `folder(${
        pathOptions.value.format === "full" ? "true" : "false"
      }) %>`;
      break;

    case "filePath":
      code += `path(${
        pathOptions.value.format === "full" ? "true" : "false"
      }) %>`;
      break;

    case "parentFolder":
      const level = parentOptions.value.level;
      if (level === 1) {
        code += `folder(false) %>`;
      } else {
        // For multiple levels up, we need to use path manipulation
        code += `path(false).split("/").slice(0, -${level}).join("/") %>`;
      }
      break;

    case "creation":
      const createFormat = getFormatString(dateOptions.value.format);
      code += `creation_date("${createFormat}") %>`;
      break;

    case "modified":
      const modifiedFormat = getFormatString(dateOptions.value.format);
      code += `last_modified_date("${modifiedFormat}") %>`;
      break;

    case "stats":
      switch (statsOptions.value.type) {
        case "wordCount":
          code += `content.split(/\\s+/).length %>`;
          break;

        case "charCount":
          code += `content.length %>`;
          break;

        case "fileSize":
          if (statsOptions.value.humanReadable) {
            // Formatted file size
            code += `size(true) %>`;
          } else {
            // Raw bytes
            code += `size(false) %>`;
          }
          break;
      }
      break;
  }

  updateContent([code]);
}

// Helper to get date format string based on selection
function getFormatString(formatId: string) {
  const format = dateFormats.find((f) => f.id === formatId);
  return format ? format.format : "YYYY-MM-DD";
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Remove the Templater tags
    const cleanCode = code.replace(/<%|%>/g, "").trim();

    // Match different file properties
    if (cleanCode.includes("tp.file.title")) {
      selectedProperty.value = "fileName";
      fileNameOptions.value.includeExtension =
        cleanCode.includes("title(true)");
    } else if (cleanCode.includes("tp.file.folder")) {
      if (cleanCode.includes("path(false).split")) {
        // This is a parent folder with level
        selectedProperty.value = "parentFolder";
        const levelMatch = cleanCode.match(/slice\(0, -(\d+)\)/);
        if (levelMatch) {
          parentOptions.value.level = parseInt(levelMatch[1]);
        }
      } else {
        selectedProperty.value = "folderPath";
        pathOptions.value.format = cleanCode.includes("folder(true)")
          ? "full"
          : "relative";
      }
    } else if (cleanCode.includes("tp.file.path")) {
      selectedProperty.value = "filePath";
      pathOptions.value.format = cleanCode.includes("path(true)")
        ? "full"
        : "relative";
    } else if (cleanCode.includes("tp.file.creation_date")) {
      selectedProperty.value = "creation";
      parseFormatFromCode(cleanCode, "creation_date");
    } else if (cleanCode.includes("tp.file.last_modified_date")) {
      selectedProperty.value = "modified";
      parseFormatFromCode(cleanCode, "last_modified_date");
    } else if (cleanCode.includes("tp.file.content")) {
      selectedProperty.value = "stats";
      if (cleanCode.includes("split")) {
        statsOptions.value.type = "wordCount";
      } else {
        statsOptions.value.type = "charCount";
      }
    } else if (cleanCode.includes("tp.file.size")) {
      selectedProperty.value = "stats";
      statsOptions.value.type = "fileSize";
      statsOptions.value.humanReadable = cleanCode.includes("size(true)");
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
    selectProperty("fileName");
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
      dateOptions.value.format = matchedFormat.id;
    } else {
      // Default to simple if no match
      dateOptions.value.format = "simple";
    }
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for option changes to update code
watch(
  [fileNameOptions, pathOptions, parentOptions, dateOptions, statsOptions],
  () => {
    generateCode();
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
  gap: 20px;
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

/* Property cards grid */
.file-property__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

/* Property card */
.file-property__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-property__card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.file-property__card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.file-property__card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #60a5fa;
  flex-shrink: 0;
}

.file-property__card--active .file-property__card-icon {
  background: rgba(59, 130, 246, 0.4);
  color: #ffffff;
}

.file-property__card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-property__card-title {
  font-weight: 500;
  font-size: 14px;
}

.file-property__card-desc {
  font-size: 12px;
  color: #94a3b8;
}

.file-property__card--active .file-property__card-desc {
  color: #cbd5e1;
}

/* Options panel */
.file-property__options {
  margin-top: 4px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-property__option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-property__option-title {
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 4px;
}

/* Checkbox styles */
.file-property__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-property__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.file-property__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.file-property__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.file-property__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

/* Radio styles */
.file-property__radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-property__radio {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-property__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.file-property__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.file-property__radio input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
}

.file-property__radio label {
  font-size: 14px;
  cursor: pointer;
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.file-property__level-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
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

/* Format buttons for dates */
.file-property__format-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.file-property__format-button {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.file-property__format-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.file-property__format-button--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .file-property__cards {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .file-property__format-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .file-property__card {
    flex-direction: column;
    text-align: center;
  }

  .file-property__card-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto;
  }
}
</style>

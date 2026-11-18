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
    ref="baseModuleRef"
  >
    <div class="text-transform">
      <!-- Module Header -->
      <div class="text-transform__header">
        <div class="text-transform__header-icon">
          <i class="fas fa-wand-magic-sparkles"></i>
        </div>
        <div class="text-transform__header-title">Text Magic</div>
      </div>

      <!-- Main Content Area -->
      <div class="text-transform__content">
        <!-- Step 1: Select Text Source -->
        <div class="text-transform__step">
          <div class="text-transform__step-header">
            <div class="text-transform__step-number">1</div>
            <div class="text-transform__step-title">
              What text do you want to transform?
            </div>
          </div>

          <div class="text-transform__source-selector">
            <select
              class="text-transform__select"
              v-model="textSource"
              @change="updateOutput"
            >
              <option value="file.title">📄 File Title</option>
              <option value="file.creation_date">📅 File Creation Date</option>
              <option value="date.now">⏱️ Current Date/Time</option>
              <option value="custom">✏️ Custom Text</option>
              <option value="variable">🔄 Template Variable</option>
            </select>

            <div
              v-if="textSource === 'custom'"
              class="text-transform__custom-input-container"
            >
              <input
                type="text"
                class="text-transform__input"
                v-model="customText"
                @input="updateOutput"
                placeholder="Type your text here..."
              />
            </div>

            <div
              v-if="textSource === 'variable'"
              class="text-transform__custom-input-container"
            >
              <input
                type="text"
                class="text-transform__input"
                v-model="variableName"
                @input="sanitizeVariableName"
                placeholder="Enter variable name (e.g., projectName)"
              />
              <div class="text-transform__hint">
                This variable must be defined elsewhere in your template
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Select Transformation Task -->
        <div class="text-transform__step">
          <div class="text-transform__step-header">
            <div class="text-transform__step-number">2</div>
            <div class="text-transform__step-title">
              What do you want to do with it?
            </div>
          </div>

          <div class="text-transform__task-selector">
            <div
              v-for="(task, index) in transformationTasks"
              :key="index"
              class="text-transform__task-tab"
              :class="{
                'text-transform__task-tab--active': selectedTask === index,
              }"
              @click="selectTask(index)"
            >
              <i :class="task.icon"></i>
              <span>{{ task.label }}</span>
            </div>
          </div>

          <!-- Format Text Tab -->
          <div
            v-if="selectedTask === 0"
            class="text-transform__options-container"
          >
            <div class="text-transform__options-subtitle">
              How should the text appear?
            </div>

            <div class="text-transform__examples-grid">
              <div
                v-for="(example, index) in formatExamples"
                :key="index"
                class="text-transform__example-card"
                :class="{
                  'text-transform__example-card--selected':
                    selectedFormatExample === index,
                }"
                @click="selectFormatExample(index)"
              >
                <div class="text-transform__example-before">
                  {{ getExampleInput(example.before) }}
                </div>
                <div class="text-transform__example-arrow">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div class="text-transform__example-after">
                  {{ example.after }}
                </div>
                <div class="text-transform__example-name">
                  {{ example.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Clean Up Text Tab -->
          <div
            v-if="selectedTask === 1"
            class="text-transform__options-container"
          >
            <div class="text-transform__options-subtitle">
              Select a clean-up operation:
            </div>

            <div class="text-transform__examples-grid">
              <div
                v-for="(example, index) in cleanupExamples"
                :key="index"
                class="text-transform__example-card"
                :class="{
                  'text-transform__example-card--selected':
                    selectedCleanupExample === index,
                }"
                @click="selectCleanupExample(index)"
              >
                <div class="text-transform__example-before">
                  {{ getExampleInput(example.before) }}
                </div>
                <div class="text-transform__example-arrow">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div class="text-transform__example-after">
                  {{ example.after }}
                </div>
                <div class="text-transform__example-name">
                  {{ example.name }}
                </div>
              </div>
            </div>

            <!-- Special options for replace -->
            <div
              v-if="selectedCleanupExample === 0 && cleanupExamples[0]"
              class="text-transform__replace-options"
            >
              <div class="text-transform__replace-row">
                <div class="text-transform__replace-label">Find:</div>
                <input
                  type="text"
                  class="text-transform__input"
                  v-model="replaceOptions.find"
                  @input="updateOutput"
                  placeholder="Text to find"
                />
              </div>

              <div class="text-transform__replace-row">
                <div class="text-transform__replace-label">Replace with:</div>
                <input
                  type="text"
                  class="text-transform__input"
                  v-model="replaceOptions.replace"
                  @input="updateOutput"
                  placeholder="New text"
                />
              </div>

              <div class="text-transform__replace-options-row">
                <label class="text-transform__checkbox">
                  <input
                    type="checkbox"
                    v-model="replaceOptions.replaceAll"
                    @change="updateOutput"
                  />
                  <span>Replace all occurrences</span>
                </label>

                <label class="text-transform__checkbox">
                  <input
                    type="checkbox"
                    v-model="replaceOptions.caseSensitive"
                    @change="updateOutput"
                  />
                  <span>Case sensitive</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Extract Parts Tab -->
          <div
            v-if="selectedTask === 2"
            class="text-transform__options-container"
          >
            <div class="text-transform__options-subtitle">
              What part do you want to extract?
            </div>

            <div class="text-transform__examples-grid">
              <div
                v-for="(example, index) in extractExamples"
                :key="index"
                class="text-transform__example-card"
                :class="{
                  'text-transform__example-card--selected':
                    selectedExtractExample === index,
                }"
                @click="selectExtractExample(index)"
              >
                <div class="text-transform__example-before">
                  {{ getExampleInput(example.before) }}
                </div>
                <div class="text-transform__example-arrow">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div class="text-transform__example-after">
                  {{ example.after }}
                </div>
                <div class="text-transform__example-name">
                  {{ example.name }}
                </div>
              </div>
            </div>

            <!-- Extract portion options -->
            <div
              v-if="selectedExtractExample === 0 && extractExamples[0]"
              class="text-transform__extract-options"
            >
              <div class="text-transform__extract-row">
                <div class="text-transform__extract-label">Start position:</div>
                <input
                  type="number"
                  class="text-transform__number-input"
                  v-model.number="extractOptions.start"
                  @input="updateOutput"
                  min="0"
                />
              </div>

              <div class="text-transform__extract-row">
                <div class="text-transform__extract-label">
                  How many characters:
                </div>
                <input
                  type="number"
                  class="text-transform__number-input"
                  v-model.number="extractOptions.length"
                  @input="updateOutput"
                  min="1"
                />
              </div>
            </div>
          </div>

          <!-- Format Numbers & Dates Tab -->
          <div
            v-if="selectedTask === 3"
            class="text-transform__options-container"
          >
            <div class="text-transform__options-subtitle">
              Choose a formatting style:
            </div>

            <div class="text-transform__examples-grid">
              <div
                v-for="(example, index) in formatNumberDateExamples"
                :key="index"
                class="text-transform__example-card"
                :class="{
                  'text-transform__example-card--selected':
                    selectedNumberDateExample === index,
                }"
                @click="selectNumberDateExample(index)"
              >
                <div class="text-transform__example-before">
                  {{ getExampleInput(example.before) }}
                </div>
                <div class="text-transform__example-arrow">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div class="text-transform__example-after">
                  {{ example.after }}
                </div>
                <div class="text-transform__example-name">
                  {{ example.name }}
                </div>
              </div>
            </div>

            <!-- Date format options -->
            <div
              v-if="
                selectedNumberDateExample === 1 && formatNumberDateExamples[1]
              "
              class="text-transform__date-format-options"
            >
              <div class="text-transform__date-format-row">
                <div class="text-transform__date-format-label">Format:</div>
                <select
                  class="text-transform__select"
                  v-model="dateFormatOption"
                  @change="updateOutput"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (04/15/2023)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2023-04-15)</option>
                  <option value="MMM D, YYYY">
                    MMM D, YYYY (Apr 15, 2023)
                  </option>
                  <option value="MMMM D, YYYY">
                    MMMM D, YYYY (April 15, 2023)
                  </option>
                  <option value="dddd, MMMM D">
                    dddd, MMMM D (Saturday, April 15)
                  </option>
                  <option value="custom">Custom Format...</option>
                </select>
              </div>

              <div
                v-if="dateFormatOption === 'custom'"
                class="text-transform__date-format-custom"
              >
                <input
                  type="text"
                  class="text-transform__input"
                  v-model="customDateFormat"
                  @input="updateOutput"
                  placeholder="e.g., YYYY-MM-DD HH:mm"
                />

                <div class="text-transform__date-tokens">
                  <button
                    v-for="token in dateFormatTokens"
                    :key="token.token"
                    class="text-transform__token-chip"
                    @click="insertDateToken(token.token)"
                  >
                    {{ token.token }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Save As Variable (Optional) -->
        <div class="text-transform__step">
          <div class="text-transform__step-header">
            <div class="text-transform__step-number">3</div>
            <div class="text-transform__step-title">
              Save as variable? (Optional)
            </div>
          </div>

          <div class="text-transform__variable-option">
            <label class="text-transform__checkbox">
              <input
                type="checkbox"
                v-model="saveAsVariable"
                @change="updateOutput"
              />
              <span>Save the result as a variable to use elsewhere</span>
            </label>

            <div
              v-if="saveAsVariable"
              class="text-transform__variable-name-container"
            >
              <input
                type="text"
                class="text-transform__input"
                v-model="outputVariableName"
                @input="sanitizeOutputVariableName"
                placeholder="Variable name (e.g., formattedTitle)"
              />
              <div class="text-transform__hint">
                You can reference this variable elsewhere using<br />
                <code
                  >&lt;% tp.user.{{
                    outputVariableName || "variableName"
                  }}
                  %&gt;</code
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Options Toggle -->
        <div class="text-transform__advanced-toggle" @click="toggleAdvanced">
          <i
            :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
          <span>Advanced Options</span>
        </div>

        <!-- Advanced Options Panel -->
        <div v-if="showAdvanced" class="text-transform__advanced-panel">
          <div class="text-transform__advanced-header">
            Generated Templater Code:
          </div>
          <div class="text-transform__code-preview">{{ generatedCode }}</div>

          <div
            v-if="selectedTask === 1 && selectedCleanupExample === 2"
            class="text-transform__advanced-regex"
          >
            <div class="text-transform__advanced-subtitle">
              Regular Expression Settings:
            </div>

            <div class="text-transform__regex-row">
              <div class="text-transform__regex-label">Pattern:</div>
              <input
                type="text"
                class="text-transform__input"
                v-model="regexOptions.pattern"
                @input="updateOutput"
                placeholder="Regular expression pattern"
              />
            </div>

            <div class="text-transform__regex-row">
              <div class="text-transform__regex-label">Replace with:</div>
              <input
                type="text"
                class="text-transform__input"
                v-model="regexOptions.replace"
                @input="updateOutput"
                placeholder="Replacement (can use $1, $2 for groups)"
              />
            </div>

            <div class="text-transform__regex-options-row">
              <label class="text-transform__checkbox">
                <input
                  type="checkbox"
                  v-model="regexOptions.global"
                  @change="updateOutput"
                />
                <span>Global (g)</span>
              </label>

              <label class="text-transform__checkbox">
                <input
                  type="checkbox"
                  v-model="regexOptions.caseInsensitive"
                  @change="updateOutput"
                />
                <span>Case insensitive (i)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
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

// Step 1: Source Text Selection
const textSource = ref("file.title");
const customText = ref("");
const variableName = ref("");

// Step 2: Task Selection
const selectedTask = ref(0);
const transformationTasks = [
  { label: "Format Text", icon: "fas fa-font" },
  { label: "Clean Up Text", icon: "fas fa-broom" },
  { label: "Extract Parts", icon: "fas fa-scissors" },
  { label: "Format Numbers & Dates", icon: "fas fa-calendar-alt" },
];

// Format Text Examples
const selectedFormatExample = ref(0);
const formatExamples = [
  {
    name: "Title Case",
    before: "my-sample-file",
    after: "My Sample File",
  },
  {
    name: "UPPERCASE",
    before: "my-sample-file",
    after: "MY SAMPLE FILE",
  },
  {
    name: "lowercase",
    before: "My Sample File",
    after: "my sample file",
  },
  {
    name: "Sentence case",
    before: "my sample file",
    after: "My sample file",
  },
  {
    name: "camelCase",
    before: "my-sample-file",
    after: "mySampleFile",
  },
  {
    name: "snake_case",
    before: "My Sample File",
    after: "my_sample_file",
  },
  {
    name: "kebab-case",
    before: "My Sample File",
    after: "my-sample-file",
  },
];

// Clean Up Text Examples
const selectedCleanupExample = ref(0);
const cleanupExamples = [
  {
    name: "Replace Text",
    before: "Hello World",
    after: "Hello Friend",
  },
  {
    name: "Remove Extra Spaces",
    before: "Too   many    spaces",
    after: "Too many spaces",
  },
  {
    name: "Advanced Pattern Matching",
    before: "Hello123World",
    after: "Hello World",
  },
  {
    name: "Remove Special Characters",
    before: "Hello@#$%World!",
    after: "HelloWorld",
  },
  {
    name: "Fix Quotes & Dashes",
    before: '"Smart" quotes--and dashes',
    after: '"Regular" quotes - and dashes',
  },
];

// Replace Options
const replaceOptions = ref({
  find: "World",
  replace: "Friend",
  replaceAll: true,
  caseSensitive: true,
});

// Regex Options
const regexOptions = ref({
  pattern: "(\\w+)(\\d+)(\\w+)",
  replace: "$1 $3",
  global: true,
  caseInsensitive: false,
});

// Extract Parts Examples
const selectedExtractExample = ref(0);
const extractExamples = [
  {
    name: "Extract Portion",
    before: "This is a long sentence",
    after: "This is",
  },
  {
    name: "First Word Only",
    before: "Project Status Report",
    after: "Project",
  },
  {
    name: "Last Word Only",
    before: "Project Status Report",
    after: "Report",
  },
  {
    name: "First Character of Each Word",
    before: "Project Status Report",
    after: "PSR",
  },
  {
    name: "Extract After Delimiter",
    before: "Category: Important",
    after: "Important",
  },
];

// Extract Options
const extractOptions = ref({
  start: 0,
  length: 7,
});

// Format Numbers & Dates Examples
const selectedNumberDateExample = ref(0);
const formatNumberDateExamples = [
  {
    name: "Currency Format",
    before: "1234.56",
    after: "$1,234.56",
  },
  {
    name: "Date Format",
    before: "2023-04-15",
    after: "April 15, 2023",
  },
  {
    name: "Percentage",
    before: "0.756",
    after: "75.6%",
  },
  {
    name: "Ordinal Number",
    before: "1",
    after: "1st",
  },
  {
    name: "Round Number",
    before: "123.456",
    after: "123",
  },
];

// Date Format Options
const dateFormatOption = ref("MMMM D, YYYY");
const customDateFormat = ref("");
const dateFormatTokens = [
  { token: "YYYY", description: "4-digit year" },
  { token: "MM", description: "2-digit month" },
  { token: "DD", description: "2-digit day" },
  { token: "ddd", description: "Short day name" },
  { token: "dddd", description: "Full day name" },
  { token: "MMM", description: "Short month name" },
  { token: "MMMM", description: "Full month name" },
  { token: "HH", description: "Hours (24h)" },
  { token: "hh", description: "Hours (12h)" },
  { token: "mm", description: "Minutes" },
  { token: "ss", description: "Seconds" },
  { token: "A", description: "AM/PM" },
];

// Step 3: Variable Options
const saveAsVariable = ref(false);
const outputVariableName = ref("");

// Advanced Options
const showAdvanced = ref(false);
const generatedCode = ref("<% tp.file.title.toUpperCase() %>");

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    try {
      parseExistingCode(props.module.content[0]);
    } catch (error) {
      console.error("Error parsing existing code:", error);
      // If parsing fails, just set defaults
      setDefaultOptions();
    }
  } else {
    // Set default options
    setDefaultOptions();
  }

  // Generate initial code
  updateOutput();
});

// Set default options based on module type
function setDefaultOptions() {
  textSource.value = "file.title";
  customText.value = "";
  variableName.value = "";
  selectedTask.value = 0;
  selectedFormatExample.value = 0;
  selectedCleanupExample.value = 0;
  selectedExtractExample.value = 0;
  selectedNumberDateExample.value = 0;
  saveAsVariable.value = false;
  outputVariableName.value = "";
  showAdvanced.value = false;

  // Set default options for various transformations
  replaceOptions.value = {
    find: "World",
    replace: "Friend",
    replaceAll: true,
    caseSensitive: true,
  };

  regexOptions.value = {
    pattern: "(\\w+)(\\d+)(\\w+)",
    replace: "$1 $3",
    global: true,
    caseInsensitive: false,
  };

  extractOptions.value = {
    start: 0,
    length: 7,
  };

  dateFormatOption.value = "MMMM D, YYYY";
  customDateFormat.value = "";
}

// Task selection
function selectTask(index: number) {
  selectedTask.value = index;
  updateOutput();
}

// Format example selection
function selectFormatExample(index: number) {
  selectedFormatExample.value = index;
  updateOutput();
}

// Cleanup example selection
function selectCleanupExample(index: number) {
  selectedCleanupExample.value = index;
  updateOutput();
}

// Extract example selection
function selectExtractExample(index: number) {
  selectedExtractExample.value = index;
  updateOutput();
}

// Number/Date example selection
function selectNumberDateExample(index: number) {
  selectedNumberDateExample.value = index;
  updateOutput();
}

// Get example input text based on source
function getExampleInput(defaultText: string): string {
  if (textSource.value === "custom" && customText.value) {
    return customText.value;
  } else if (textSource.value === "variable" && variableName.value) {
    return `[Variable: ${variableName.value}]`;
  } else if (textSource.value === "file.title") {
    return "my-sample-file";
  } else if (
    textSource.value === "file.creation_date" ||
    textSource.value === "date.now"
  ) {
    return "2023-04-15";
  }

  return defaultText;
}

// Toggle advanced options
function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value;
}

// Insert date token into custom format
function insertDateToken(token: string) {
  customDateFormat.value += token;
  updateOutput();
}

// Sanitize variable names
function sanitizeVariableName() {
  // Replace spaces and special characters with underscores
  variableName.value = variableName.value
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");

  updateOutput();
}

function sanitizeOutputVariableName() {
  // Replace spaces and special characters with underscores
  outputVariableName.value = outputVariableName.value
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");

  updateOutput();
}

// Generate code for the current transformation
function updateOutput() {
  let inputCode = getInputSourceCode();
  let transformCode = generateTransformationCode(inputCode);
  let finalCode;

  if (saveAsVariable.value && outputVariableName.value) {
    finalCode = `<% tp.user.${outputVariableName.value} = ${transformCode} %>`;
  } else {
    finalCode = `<% ${transformCode} %>`;
  }

  // Update the generated code preview
  generatedCode.value = finalCode;

  // Update the module content
  updateContent([finalCode]);
}

// Get code for input source
function getInputSourceCode(): string {
  switch (textSource.value) {
    case "file.title":
      return "tp.file.title";
    case "file.creation_date":
      return "tp.file.creation_date";
    case "date.now":
      return "tp.date.now()";
    case "custom":
      return JSON.stringify(customText.value);
    case "variable":
      return `tp.user.${variableName.value}`;
    default:
      return "tp.file.title";
  }
}

// Generate the transformation code based on selected options
function generateTransformationCode(inputCode: string): string {
  switch (selectedTask.value) {
    case 0: // Format Text
      return generateFormatTextCode(inputCode);
    case 1: // Clean Up Text
      return generateCleanupTextCode(inputCode);
    case 2: // Extract Parts
      return generateExtractPartsCode(inputCode);
    case 3: // Format Numbers & Dates
      return generateNumberDateFormatCode(inputCode);
    default:
      return inputCode;
  }
}

// Generate code for text formatting
function generateFormatTextCode(inputCode: string): string {
  switch (selectedFormatExample.value) {
    case 0: // Title Case
      return `(${inputCode}).replace(/[\\s-_]+/g, " ").replace(/\\b\\w/g, char => char.toUpperCase())`;
    case 1: // UPPERCASE
      return `(${inputCode}).toUpperCase()`;
    case 2: // lowercase
      return `(${inputCode}).toLowerCase()`;
    case 3: // Sentence case
      return `(${inputCode}).charAt(0).toUpperCase() + (${inputCode}).slice(1).toLowerCase()`;
    case 4: // camelCase
      return `(${inputCode}).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())`;
    case 5: // snake_case
      return `(${inputCode}).toLowerCase().replace(/[\\s-]+/g, "_").replace(/[^\\w_]/g, "")`;
    case 6: // kebab-case
      return `(${inputCode}).toLowerCase().replace(/[\\s_]+/g, "-").replace(/[^\\w-]/g, "")`;
    default:
      return inputCode;
  }
}

// Generate code for text cleanup
function generateCleanupTextCode(inputCode: string): string {
  switch (selectedCleanupExample.value) {
    case 0: // Replace Text
      if (!replaceOptions.value.find) return inputCode;

      const findStr = JSON.stringify(replaceOptions.value.find);
      const replaceStr = JSON.stringify(replaceOptions.value.replace || "");

      if (replaceOptions.value.replaceAll) {
        if (replaceOptions.value.caseSensitive) {
          return `(${inputCode}).split(${findStr}).join(${replaceStr})`;
        } else {
          return `(${inputCode}).replace(new RegExp(${JSON.stringify(
            escapeRegExp(replaceOptions.value.find)
          )}, "i"), ${replaceStr})`;
        }
      }
    case 1: // Remove Extra Spaces
      return `(${inputCode}).replace(/\\s+/g, " ").trim()`;
    case 2: // Advanced Pattern Matching (Regex)
      if (!regexOptions.value.pattern) return inputCode;

      let flags = "";
      if (regexOptions.value.global) flags += "g";
      if (regexOptions.value.caseInsensitive) flags += "i";

      return `(${inputCode}).replace(/${
        regexOptions.value.pattern
      }/${flags}, "${regexOptions.value.replace || ""}")`;
    case 3: // Remove Special Characters
      return `(${inputCode}).replace(/[^\\w\\s]/g, "")`;
    case 4: // Fix Quotes & Dashes
      return `(${inputCode}).replace(/[""]/g, '"').replace(/['']/g, "'").replace(/--/g, " - ")`;
    default:
      return inputCode;
  }
}

// Generate code for extracting parts of text
function generateExtractPartsCode(inputCode: string): string {
  switch (selectedExtractExample.value) {
    case 0: // Extract Portion
      return `(${inputCode}).slice(${extractOptions.value.start}, ${
        extractOptions.value.start + extractOptions.value.length
      })`;
    case 1: // First Word Only
      return `(${inputCode}).split(/\\s+/)[0]`;
    case 2: // Last Word Only
      return `(${inputCode}).split(/\\s+/).pop()`;
    case 3: // First Character of Each Word
      return `(${inputCode}).split(/\\s+/).map(word => word.charAt(0)).join("")`;
    case 4: // Extract After Delimiter
      return `(${inputCode}).split(":")[1]?.trim() || ""`;
    default:
      return inputCode;
  }
}

// Generate code for number and date formatting
function generateNumberDateFormatCode(inputCode: string): string {
  switch (selectedNumberDateExample.value) {
    case 0: // Currency Format
      return `"$" + Number(${inputCode}).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`;
    case 1: // Date Format
      const format =
        dateFormatOption.value === "custom"
          ? customDateFormat.value || "YYYY-MM-DD"
          : dateFormatOption.value;

      return `moment(${inputCode}).format("${format}")`;
    case 2: // Percentage
      return `(Number(${inputCode}) * 100).toFixed(1) + "%"`;
    case 3: // Ordinal Number
      return `(() => {
        const num = Number(${inputCode});
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return num + "st";
        if (j === 2 && k !== 12) return num + "nd";
        if (j === 3 && k !== 13) return num + "rd";
        return num + "th";
      })()`;
    case 4: // Round Number
      return `Math.round(Number(${inputCode})).toString()`;
    default:
      return inputCode;
  }
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\          return `(${inputCode}).replace(new RegExp(${JSON.stringify(escapeRegExp(replaceOptions.value."
  );
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Remove the Templater tags
    const cleanCode = code.replace(/<%|%>/g, "").trim();

    // Check for variable assignment
    const variableMatch = cleanCode.match(/tp\.user\.(\w+)\s*=\s*(.*)/);

    // Extract the transformation code
    const transformCode = variableMatch ? variableMatch[2] : cleanCode;

    // Set output variable if present
    if (variableMatch) {
      saveAsVariable.value = true;
      outputVariableName.value = variableMatch[1];
    }

    // Determine the input source
    parseInputSource(transformCode);

    // Try to determine the transformation type and options
    if (transformCode.includes(".toUpperCase()")) {
      selectedTask.value = 0; // Format Text
      selectedFormatExample.value = 1; // UPPERCASE
    } else if (transformCode.includes(".toLowerCase()")) {
      if (transformCode.includes('replace(/[\\s-]+/g, "_")')) {
        selectedTask.value = 0; // Format Text
        selectedFormatExample.value = 5; // snake_case
      } else if (transformCode.includes('replace(/[\\s_]+/g, "-")')) {
        selectedTask.value = 0; // Format Text
        selectedFormatExample.value = 6; // kebab-case
      } else {
        selectedTask.value = 0; // Format Text
        selectedFormatExample.value = 2; // lowercase
      }
    } else if (
      transformCode.includes(".replace(/\\b\\w/g, char => char.toUpperCase())")
    ) {
      selectedTask.value = 0; // Format Text
      selectedFormatExample.value = 0; // Title Case
    } else if (transformCode.includes(".charAt(0).toUpperCase() + ")) {
      selectedTask.value = 0; // Format Text
      selectedFormatExample.value = 3; // Sentence case
    } else if (
      transformCode.includes(".toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g")
    ) {
      selectedTask.value = 0; // Format Text
      selectedFormatExample.value = 4; // camelCase
    } else if (transformCode.includes(".replace(/\\s+/g, ")) {
      selectedTask.value = 1; // Clean Up Text
      selectedCleanupExample.value = 1; // Remove Extra Spaces
    } else if (transformCode.includes(".replace(/[^\\w\\s]/g, ")) {
      selectedTask.value = 1; // Clean Up Text
      selectedCleanupExample.value = 3; // Remove Special Characters
    } else if (
      transformCode.includes(".replace(") ||
      (transformCode.includes(".split(") && transformCode.includes(".join("))
    ) {
      selectedTask.value = 1; // Clean Up Text
      selectedCleanupExample.value = 0; // Replace Text

      // Try to extract the find/replace values
      const findMatch = transformCode.match(
        /\.split\("([^"]+)"\)|\\.replace\("([^"]+)"/
      );
      if (findMatch) {
        replaceOptions.value.find = findMatch[1] || findMatch[2] || "";
      }

      const replaceMatch = transformCode.match(
        /\.join\("([^"]+)"\)|\\.replace\([^,]+,\s*"([^"]+)"/
      );
      if (replaceMatch) {
        replaceOptions.value.replace = replaceMatch[1] || replaceMatch[2] || "";
      }

      replaceOptions.value.replaceAll =
        transformCode.includes(".split(") && transformCode.includes(".join(");
      replaceOptions.value.caseSensitive = !transformCode.includes("/i");
    } else if (transformCode.includes(".slice(")) {
      selectedTask.value = 2; // Extract Parts
      selectedExtractExample.value = 0; // Extract Portion

      // Try to extract start/length values
      const sliceMatch = transformCode.match(/\.slice\((\d+),\s*(\d+)\)/);
      if (sliceMatch) {
        extractOptions.value.start = parseInt(sliceMatch[1]);
        extractOptions.value.length =
          parseInt(sliceMatch[2]) - extractOptions.value.start;
      }
    } else if (transformCode.includes(".split(/\\s+/)[0]")) {
      selectedTask.value = 2; // Extract Parts
      selectedExtractExample.value = 1; // First Word Only
    } else if (transformCode.includes(".split(/\\s+/).pop()")) {
      selectedTask.value = 2; // Extract Parts
      selectedExtractExample.value = 2; // Last Word Only
    } else if (transformCode.includes(".map(word => word.charAt(0))")) {
      selectedTask.value = 2; // Extract Parts
      selectedExtractExample.value = 3; // First Character of Each Word
    } else if (
      transformCode.includes("moment(") &&
      transformCode.includes(".format(")
    ) {
      selectedTask.value = 3; // Format Numbers & Dates
      selectedNumberDateExample.value = 1; // Date Format

      // Try to extract the date format
      const formatMatch = transformCode.match(/\.format\("([^"]+)"\)/);
      if (formatMatch) {
        const format = formatMatch[1];

        if (
          [
            "MM/DD/YYYY",
            "YYYY-MM-DD",
            "MMM D, YYYY",
            "MMMM D, YYYY",
            "dddd, MMMM D",
          ].includes(format)
        ) {
          dateFormatOption.value = format;
        } else {
          dateFormatOption.value = "custom";
          customDateFormat.value = format;
        }
      }
    } else if (
      transformCode.includes("toLocaleString") &&
      transformCode.includes("$")
    ) {
      selectedTask.value = 3; // Format Numbers & Dates
      selectedNumberDateExample.value = 0; // Currency Format
    } else if (transformCode.includes("* 100") && transformCode.includes("%")) {
      selectedTask.value = 3; // Format Numbers & Dates
      selectedNumberDateExample.value = 2; // Percentage
    } else if (
      transformCode.includes('+ "st"') ||
      transformCode.includes('+ "nd"') ||
      transformCode.includes('+ "rd"') ||
      transformCode.includes('+ "th"')
    ) {
      selectedTask.value = 3; // Format Numbers & Dates
      selectedNumberDateExample.value = 3; // Ordinal Number
    } else if (transformCode.includes("Math.round")) {
      selectedTask.value = 3; // Format Numbers & Dates
      selectedNumberDateExample.value = 4; // Round Number
    }

    // Update the output
    updateOutput();
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, set defaults
    setDefaultOptions();
    updateOutput();
  }
}

// Parse the input source from code
function parseInputSource(code: string) {
  if (code.includes("tp.file.title")) {
    textSource.value = "file.title";
  } else if (code.includes("tp.file.creation_date")) {
    textSource.value = "file.creation_date";
  } else if (code.includes("tp.date.now()")) {
    textSource.value = "date.now";
  } else if (code.includes("tp.user.")) {
    textSource.value = "variable";
    const match = code.match(/tp\.user\.(\w+)/);
    if (match) {
      variableName.value = match[1];
    }
  } else if (code.match(/["'].*?["']/)) {
    textSource.value = "custom";
    const match = code.match(/["'](.*?)["']/);
    if (match) {
      customText.value = match[1];
    }
  }
}

// Watch for changes in relevant values
watch(
  [
    textSource,
    customText,
    variableName,
    selectedTask,
    selectedFormatExample,
    selectedCleanupExample,
    selectedExtractExample,
    selectedNumberDateExample,
    replaceOptions,
    regexOptions,
    extractOptions,
    dateFormatOption,
    customDateFormat,
    saveAsVariable,
    outputVariableName,
  ],
  () => {
    updateOutput();
  },
  { deep: true }
);
</script>

<style scoped>
.text-transform {
  width: 100%;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}

/* Header styles */
.text-transform__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.text-transform__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.text-transform__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Main content container */
.text-transform__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Step styling */
.text-transform__step {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-transform__step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.text-transform__step-number {
  width: 24px;
  height: 24px;
  background: rgba(96, 165, 250, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #60a5fa;
}

.text-transform__step-title {
  font-size: 15px;
  font-weight: 500;
  color: #e2e8f0;
}

/* Source selector */
.text-transform__source-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-transform__custom-input-container {
  margin-top: 8px;
  animation: fadeIn 0.2s ease-in-out;
}

/* Task selector */
.text-transform__task-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.text-transform__task-tab {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.text-transform__task-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.text-transform__task-tab--active {
  background: rgba(96, 165, 250, 0.15);
  border-color: rgba(96, 165, 250, 0.3);
  color: #fff;
}

.text-transform__task-tab i {
  color: #60a5fa;
  font-size: 14px;
}

/* Options container */
.text-transform__options-container {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.2s ease-in-out;
}

.text-transform__options-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}

/* Examples grid */
.text-transform__examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.text-transform__example-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.text-transform__example-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.text-transform__example-card--selected {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
}

.text-transform__example-before {
  font-family: monospace;
  font-size: 13px;
  color: #94a3b8;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-transform__example-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  font-size: 12px;
}

.text-transform__example-after {
  font-family: monospace;
  font-size: 13px;
  color: #60a5fa;
  font-weight: 500;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-transform__example-name {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

/* Replace options */
.text-transform__replace-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.2s ease-in-out;
}

.text-transform__replace-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-transform__replace-label {
  width: 100px;
  font-size: 13px;
  color: #94a3b8;
}

.text-transform__replace-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 4px;
}

/* Extract options */
.text-transform__extract-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.2s ease-in-out;
}

.text-transform__extract-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-transform__extract-label {
  width: 140px;
  font-size: 13px;
  color: #94a3b8;
}

/* Date format options */
.text-transform__date-format-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.2s ease-in-out;
}

.text-transform__date-format-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-transform__date-format-label {
  width: 80px;
  font-size: 13px;
  color: #94a3b8;
}

.text-transform__date-format-custom {
  margin-top: 8px;
  animation: fadeIn 0.2s ease-in-out;
}

.text-transform__date-tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.text-transform__token-chip {
  padding: 4px 8px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 4px;
  font-size: 12px;
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.2s;
}

.text-transform__token-chip:hover {
  background: rgba(96, 165, 250, 0.2);
}

/* Variable option */
.text-transform__variable-option {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.text-transform__variable-name-container {
  margin-top: 8px;
  animation: fadeIn 0.2s ease-in-out;
}

/* Advanced toggle */
.text-transform__advanced-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.text-transform__advanced-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

/* Advanced panel */
.text-transform__advanced-panel {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.2s ease-in-out;
}

.text-transform__advanced-header {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 8px;
}

.text-transform__code-preview {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: monospace;
  font-size: 13px;
  color: #60a5fa;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.text-transform__advanced-subtitle {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin: 16px 0 8px;
}

/* Regex options */
.text-transform__advanced-regex {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.text-transform__regex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-transform__regex-label {
  width: 100px;
  font-size: 13px;
  color: #94a3b8;
}

.text-transform__regex-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 4px;
}

/* Form controls */
.text-transform__input {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
}

.text-transform__input:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.5);
}

.text-transform__input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.text-transform__number-input {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.text-transform__number-input:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.5);
}

.text-transform__select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.text-transform__select:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.5);
}

/* Checkbox styling */
.text-transform__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-transform__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.text-transform__checkbox input[type="checkbox"]:checked {
  background: rgba(96, 165, 250, 0.8);
  border-color: rgba(96, 165, 250, 0.8);
}

.text-transform__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.text-transform__checkbox span {
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
}

/* Hint text */
.text-transform__hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.text-transform__hint code {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-transform__examples-grid {
    grid-template-columns: 1fr;
  }

  .text-transform__replace-row,
  .text-transform__extract-row,
  .text-transform__date-format-row,
  .text-transform__regex-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .text-transform__replace-label,
  .text-transform__extract-label,
  .text-transform__date-format-label,
  .text-transform__regex-label {
    width: auto;
    margin-bottom: 4px;
  }
}
</style>

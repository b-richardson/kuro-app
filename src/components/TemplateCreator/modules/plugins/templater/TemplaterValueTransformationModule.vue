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
    <div class="transform">
      <!-- Module Header -->
      <div class="transform__header">
        <div class="transform__header-icon">
          <i class="fas fa-magic"></i>
        </div>
        <div class="transform__header-title">Value Transformation</div>
      </div>

      <!-- Main Configuration Area -->
      <div class="transform__container">
        <!-- Value Source Selection -->
        <div class="transform__section">
          <div class="transform__section-title">1. Select Value Source</div>

          <div class="transform__source-options">
            <label class="transform__radio">
              <input
                type="radio"
                v-model="valueSource"
                value="input"
                @change="generateCode"
              />
              <span>Direct Input</span>
            </label>
            <label class="transform__radio">
              <input
                type="radio"
                v-model="valueSource"
                value="variable"
                @change="generateCode"
              />
              <span>Variable</span>
            </label>
          </div>

          <!-- Source value input -->
          <div v-if="valueSource === 'input'" class="transform__source-input">
            <input
              type="text"
              class="transform__text-input"
              v-model="sourceValue"
              @input="generateCode"
              placeholder="Enter text to transform"
            />
          </div>

          <!-- Variable source -->
          <div
            v-if="valueSource === 'variable'"
            class="transform__source-input"
          >
            <input
              type="text"
              class="transform__text-input"
              v-model="variableName"
              @input="sanitizeVariableName"
              placeholder="Enter variable name (e.g., projectName)"
            />
            <div class="transform__hint">
              Variable comes from User Input module or other template variable
            </div>
          </div>
        </div>

        <!-- Transformation Type Selection -->
        <div class="transform__section">
          <div class="transform__section-title">2. Select Transformation</div>

          <div class="transform__transformation-types">
            <button
              v-for="type in transformationTypes"
              :key="type.id"
              class="transform__type-button"
              :class="{
                'transform__type-button--active':
                  transformationType === type.id,
              }"
              @click="setTransformationType(type.id)"
            >
              <i :class="type.icon"></i>
              <span>{{ type.label }}</span>
            </button>
          </div>

          <!-- Text Case Transformation Options -->
          <div
            v-if="transformationType === 'textCase'"
            class="transform__options"
          >
            <div class="transform__options-grid">
              <button
                v-for="option in textCaseOptions"
                :key="option.id"
                class="transform__option-button"
                :class="{
                  'transform__option-button--active':
                    textCaseType === option.id,
                }"
                @click="setTextCaseType(option.id)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- String Substitution Options -->
          <div
            v-if="transformationType === 'substitution'"
            class="transform__options"
          >
            <div class="transform__options-header">
              <div class="transform__options-title">Find and Replace</div>
              <button class="transform__add-button" @click="addSubstitution">
                <i class="fas fa-plus"></i>
                <span>Add Pattern</span>
              </button>
            </div>

            <div
              v-if="substitutions.length === 0"
              class="transform__empty-state"
            >
              <div>Click "Add Pattern" to create a find and replace rule</div>
            </div>

            <div v-else class="transform__substitution-list">
              <div
                v-for="(sub, index) in substitutions"
                :key="index"
                class="transform__substitution-item"
              >
                <div class="transform__substitution-header">
                  <div class="transform__substitution-title">
                    Pattern {{ index + 1 }}
                  </div>
                  <button
                    class="transform__remove-button"
                    @click="removeSubstitution(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div class="transform__substitution-fields">
                  <div class="transform__field">
                    <label>Find:</label>
                    <input
                      type="text"
                      class="transform__text-input"
                      v-model="sub.find"
                      @input="generateCode"
                      placeholder="Text to find"
                    />
                  </div>

                  <div class="transform__substitution-arrow">
                    <i class="fas fa-arrow-right"></i>
                  </div>

                  <div class="transform__field">
                    <label>Replace with:</label>
                    <input
                      type="text"
                      class="transform__text-input"
                      v-model="sub.replace"
                      @input="generateCode"
                      placeholder="Replacement text"
                    />
                  </div>
                </div>

                <div class="transform__substitution-options">
                  <label class="transform__checkbox">
                    <input
                      type="checkbox"
                      v-model="sub.useRegex"
                      @change="generateCode"
                    />
                    <span>Use regular expression</span>
                  </label>

                  <label class="transform__checkbox">
                    <input
                      type="checkbox"
                      v-model="sub.caseSensitive"
                      @change="generateCode"
                    />
                    <span>Case sensitive</span>
                  </label>

                  <label class="transform__checkbox">
                    <input
                      type="checkbox"
                      v-model="sub.replaceAll"
                      @change="generateCode"
                    />
                    <span>Replace all occurrences</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Format Options -->
          <div
            v-if="transformationType === 'format'"
            class="transform__options"
          >
            <div class="transform__format-types">
              <button
                v-for="format in formatTypes"
                :key="format.id"
                class="transform__type-button"
                :class="{
                  'transform__type-button--active': formatType === format.id,
                }"
                @click="setFormatType(format.id)"
              >
                <i :class="format.icon"></i>
                <span>{{ format.label }}</span>
              </button>
            </div>

            <!-- Number Format Options -->
            <div
              v-if="formatType === 'number'"
              class="transform__format-options"
            >
              <div class="transform__options-grid">
                <button
                  v-for="numFormat in numberFormatOptions"
                  :key="numFormat.id"
                  class="transform__option-button"
                  :class="{
                    'transform__option-button--active':
                      numberFormat === numFormat.id,
                  }"
                  @click="setNumberFormat(numFormat.id)"
                >
                  <div class="transform__option-name">
                    {{ numFormat.label }}
                  </div>
                  <div class="transform__option-desc">
                    {{ numFormat.example }}
                  </div>
                </button>
              </div>

              <div
                class="transform__custom-options"
                v-if="numberFormat === 'custom'"
              >
                <div class="transform__field-row">
                  <div class="transform__field">
                    <label>Decimal Places:</label>
                    <input
                      type="number"
                      class="transform__number-input"
                      v-model.number="numberCustomOptions.decimals"
                      min="0"
                      max="10"
                      @input="generateCode"
                    />
                  </div>

                  <div class="transform__field">
                    <label>Thousands Separator:</label>
                    <select
                      class="transform__select"
                      v-model="numberCustomOptions.thousands"
                      @change="generateCode"
                    >
                      <option value="none">None</option>
                      <option value="comma">Comma (,)</option>
                      <option value="period">Period (.)</option>
                      <option value="space">Space</option>
                    </select>
                  </div>
                </div>

                <div class="transform__field-row">
                  <div class="transform__field">
                    <label>Prefix:</label>
                    <input
                      type="text"
                      class="transform__text-input"
                      v-model="numberCustomOptions.prefix"
                      placeholder="e.g., $"
                      @input="generateCode"
                    />
                  </div>

                  <div class="transform__field">
                    <label>Suffix:</label>
                    <input
                      type="text"
                      class="transform__text-input"
                      v-model="numberCustomOptions.suffix"
                      placeholder="e.g., %"
                      @input="generateCode"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Date Format Options -->
            <div v-if="formatType === 'date'" class="transform__format-options">
              <div class="transform__options-grid">
                <button
                  v-for="dateFormat in dateFormatOptions"
                  :key="dateFormat.id"
                  class="transform__option-button"
                  :class="{
                    'transform__option-button--active':
                      dateFormatChoice === dateFormat.id,
                  }"
                  @click="setDateFormat(dateFormat.id)"
                >
                  <div class="transform__option-name">
                    {{ dateFormat.label }}
                  </div>
                  <div class="transform__option-desc">
                    {{ dateFormat.example }}
                  </div>
                </button>
              </div>

              <div
                class="transform__custom-options"
                v-if="dateFormatChoice === 'custom'"
              >
                <div class="transform__field">
                  <label>Custom Format:</label>
                  <input
                    type="text"
                    class="transform__text-input"
                    v-model="dateCustomFormat"
                    placeholder="e.g., YYYY-MM-DD HH:mm"
                    @input="generateCode"
                  />

                  <div class="transform__token-chips">
                    <button
                      v-for="token in dateFormatTokens"
                      :key="token.token"
                      class="transform__token-chip"
                      @click="insertDateToken(token.token)"
                    >
                      {{ token.token }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Variable Option -->
        <div class="transform__section">
          <div class="transform__section-title">3. Configure Output</div>

          <label class="transform__checkbox">
            <input
              type="checkbox"
              v-model="saveToVariable"
              @change="generateCode"
            />
            <span>Store result in a variable</span>
          </label>

          <div v-if="saveToVariable" class="transform__output-variable">
            <input
              type="text"
              class="transform__text-input"
              v-model="outputVariableName"
              @input="sanitizeOutputVariableName"
              placeholder="Variable name (e.g., formattedText)"
            />
            <div class="transform__hint">
              Use this name to reference the transformed value elsewhere
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

// Value source
const valueSource = ref("input");
const sourceValue = ref("");
const variableName = ref("");

// Transformation types
const transformationType = ref("textCase");
const transformationTypes = [
  { id: "textCase", label: "Text Case", icon: "fas fa-font" },
  { id: "substitution", label: "Find & Replace", icon: "fas fa-exchange-alt" },
  { id: "format", label: "Format", icon: "fas fa-percentage" },
];

// Text case options
const textCaseType = ref("uppercase");
const textCaseOptions = [
  { id: "uppercase", label: "UPPERCASE" },
  { id: "lowercase", label: "lowercase" },
  { id: "titlecase", label: "Title Case" },
  { id: "sentencecase", label: "Sentence case" },
  { id: "camelcase", label: "camelCase" },
  { id: "kebabcase", label: "kebab-case" },
  { id: "snakecase", label: "snake_case" },
];

// Substitution options
const substitutions = ref<
  Array<{
    find: string;
    replace: string;
    useRegex: boolean;
    caseSensitive: boolean;
    replaceAll: boolean;
  }>
>([]);

// Format options
const formatType = ref("number");
const formatTypes = [
  { id: "number", label: "Number", icon: "fas fa-hashtag" },
  { id: "date", label: "Date", icon: "fas fa-calendar-alt" },
];

// Number format options
const numberFormat = ref("decimal");
const numberFormatOptions = [
  { id: "decimal", label: "Decimal", example: "1,234.56" },
  { id: "integer", label: "Integer", example: "1,235" },
  { id: "percent", label: "Percent", example: "12.3%" },
  { id: "currency", label: "Currency", example: "$1,234.56" },
  { id: "custom", label: "Custom", example: "Custom Format" },
];

const numberCustomOptions = ref({
  decimals: 2,
  thousands: "comma",
  prefix: "",
  suffix: "",
});

// Date format options
const dateFormatChoice = ref("short");
const dateFormatOptions = [
  { id: "short", label: "Short", example: "01/25/2023" },
  { id: "medium", label: "Medium", example: "Jan 25, 2023" },
  { id: "long", label: "Long", example: "January 25, 2023" },
  { id: "iso", label: "ISO", example: "2023-01-25" },
  { id: "custom", label: "Custom", example: "Custom Format" },
];

const dateCustomFormat = ref("YYYY-MM-DD");
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

// Output options
const saveToVariable = ref(false);
const outputVariableName = ref("");

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Set defaults and initialize code
    generateCode();
  }
});

// Set transformation type
function setTransformationType(type: string) {
  transformationType.value = type;
  generateCode();
}

// Set text case type
function setTextCaseType(type: string) {
  textCaseType.value = type;
  generateCode();
}

// Add a new substitution
function addSubstitution() {
  substitutions.value.push({
    find: "",
    replace: "",
    useRegex: false,
    caseSensitive: true,
    replaceAll: true,
  });
  generateCode();
}

// Remove a substitution
function removeSubstitution(index: number) {
  substitutions.value.splice(index, 1);
  generateCode();
}

// Set format type
function setFormatType(type: string) {
  formatType.value = type;
  generateCode();
}

// Set number format
function setNumberFormat(format: string) {
  numberFormat.value = format;
  generateCode();
}

// Set date format
function setDateFormat(format: string) {
  dateFormatChoice.value = format;
  generateCode();
}

// Insert date token
function insertDateToken(token: string) {
  dateCustomFormat.value += token;
  generateCode();
}

// Sanitize variable names
function sanitizeVariableName() {
  // Replace spaces and special characters with underscores
  variableName.value = variableName.value
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");

  generateCode();
}

function sanitizeOutputVariableName() {
  // Replace spaces and special characters with underscores
  outputVariableName.value = outputVariableName.value
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");

  generateCode();
}

// Generate transformation code
function generateTransformationCode(inputValue: string) {
  let transformCode = "";

  switch (transformationType.value) {
    case "textCase":
      transformCode = generateTextCaseCode(inputValue);
      break;
    case "substitution":
      transformCode = generateSubstitutionCode(inputValue);
      break;
    case "format":
      transformCode = generateFormatCode(inputValue);
      break;
  }

  return transformCode;
}

// Generate text case transformation code
function generateTextCaseCode(inputValue: string) {
  switch (textCaseType.value) {
    case "uppercase":
      return `(${inputValue}).toUpperCase()`;
    case "lowercase":
      return `(${inputValue}).toLowerCase()`;
    case "titlecase":
      return `(${inputValue}).replace(/\\b\\w/g, (char) => char.toUpperCase())`;
    case "sentencecase":
      return `(${inputValue}).charAt(0).toUpperCase() + (${inputValue}).slice(1).toLowerCase()`;
    case "camelcase":
      return `(${inputValue}).toLowerCase().replace(/[^a-zA-Z0-9]+(.)|(^[a-zA-Z])/g, (_, c, d) => c ? c.toUpperCase() : d.toUpperCase())`;
    case "kebabcase":
      return `(${inputValue}).toLowerCase().replace(/\\s+/g, "-").replace(/[^a-z0-9-]/g, "")`;
    case "snakecase":
      return `(${inputValue}).toLowerCase().replace(/\\s+/g, "_").replace(/[^a-z0-9_]/g, "")`;
    default:
      return inputValue;
  }
}

// Generate substitution code
function generateSubstitutionCode(inputValue: string) {
  if (substitutions.value.length === 0) {
    return inputValue;
  }

  let result = inputValue;

  // Apply each substitution
  substitutions.value.forEach((sub) => {
    if (!sub.find) return;

    const findStr = sub.useRegex
      ? `/${sub.find}/${sub.caseSensitive ? "" : "i"}`
      : `"${sub.find.replace(/"/g, '\\"')}"`;

    const replaceStr = `"${sub.replace.replace(/"/g, '\\"')}"`;

    if (sub.replaceAll) {
      if (sub.useRegex) {
        // For regex with replaceAll, use global flag
        result = `(${result}).replace(${findStr}g, ${replaceStr})`;
      } else {
        // For non-regex with replaceAll, use split/join
        result = `(${result}).split(${findStr}).join(${replaceStr})`;
      }
    } else {
      // For single replacement
      result = `(${result}).replace(${findStr}, ${replaceStr})`;
    }
  });

  return result;
}

// Generate format code
function generateFormatCode(inputValue: string) {
  if (formatType.value === "number") {
    return generateNumberFormatCode(inputValue);
  } else {
    return generateDateFormatCode(inputValue);
  }
}

// Generate number format code
function generateNumberFormatCode(inputValue: string) {
  const parseExpr = `Number(${inputValue})`;

  switch (numberFormat.value) {
    case "decimal":
      return `(${parseExpr}).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`;
    case "integer":
      return `Math.round(${parseExpr}).toLocaleString()`;
    case "percent":
      return `((${parseExpr}) * 100).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"`;
    case "currency":
      return `"$" + (${parseExpr}).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`;
    case "custom":
      let formatCode = `(${parseExpr}).toFixed(${numberCustomOptions.value.decimals})`;

      // Apply thousands separator
      if (numberCustomOptions.value.thousands !== "none") {
        formatCode = `(() => {
          const parts = (${formatCode}).split(".");
          const separator = ${
            numberCustomOptions.value.thousands === "comma"
              ? '","'
              : numberCustomOptions.value.thousands === "period"
              ? '"."'
              : '" "'
          };
          parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, separator);
          return parts.join(".");
        })()`;
      }

      // Add prefix and suffix
      if (
        numberCustomOptions.value.prefix ||
        numberCustomOptions.value.suffix
      ) {
        formatCode = `"${numberCustomOptions.value.prefix}" + ${formatCode} + "${numberCustomOptions.value.suffix}"`;
      }

      return formatCode;
  }

  return inputValue;
}

// Generate date format code
function generateDateFormatCode(inputValue: string) {
  let format = "";

  switch (dateFormatChoice.value) {
    case "short":
      format = "MM/DD/YYYY";
      break;
    case "medium":
      format = "MMM D, YYYY";
      break;
    case "long":
      format = "MMMM D, YYYY";
      break;
    case "iso":
      format = "YYYY-MM-DD";
      break;
    case "custom":
      format = dateCustomFormat.value;
      break;
  }

  return `moment(${inputValue}).format("${format}")`;
}

// Generate the full Templater code
function generateCode() {
  let code = "";

  // Get the input value
  const inputValue =
    valueSource.value === "input"
      ? `"${sourceValue.value.replace(/"/g, '\\"')}"`
      : variableName.value;

  // Apply the transformation
  let transformedValue = generateTransformationCode(inputValue);

  // Build the final template code
  if (saveToVariable.value && outputVariableName.value) {
    code = `<% ${
      "tp.user." + outputVariableName.value
    } = ${transformedValue} %>`;
  } else {
    code = `<% ${transformedValue} %>`;
  }

  updateContent([code]);
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Remove the Templater tags
    const cleanCode = code.replace(/<%|%>/g, "").trim();

    // Check for variable assignment
    const variableMatch = cleanCode.match(/tp\.user\.(\w+)\s*=\s*(.*)/);

    // Extract the transformation code
    let transformCode = variableMatch ? variableMatch[2] : cleanCode;

    // Set output variable if present
    if (variableMatch) {
      saveToVariable.value = true;
      outputVariableName.value = variableMatch[1];
    }

    // Try to determine the transformation type and input source
    if (
      transformCode.includes(".toUpperCase()") ||
      transformCode.includes(".toLowerCase()") ||
      transformCode.includes(".replace(/\\b\\w/g") ||
      transformCode.includes(".charAt(0).toUpperCase()")
    ) {
      // Text case transformation
      transformationType.value = "textCase";
      parseTextCaseTransformation(transformCode);
    } else if (
      transformCode.includes(".replace(") ||
      transformCode.includes(".split(") ||
      transformCode.includes(".join(")
    ) {
      // String substitution
      transformationType.value = "substitution";
      parseSubstitutionTransformation(transformCode);
    } else if (
      transformCode.includes("toLocaleString") ||
      transformCode.includes("toFixed") ||
      transformCode.includes("moment(") ||
      transformCode.includes(".format(")
    ) {
      // Format transformation
      transformationType.value = "format";

      if (
        transformCode.includes("toLocaleString") ||
        transformCode.includes("toFixed")
      ) {
        formatType.value = "number";
        parseNumberFormatTransformation(transformCode);
      } else if (
        transformCode.includes("moment(") ||
        transformCode.includes(".format(")
      ) {
        formatType.value = "date";
        parseDateFormatTransformation(transformCode);
      }
    }

    // Try to determine the input source
    const inputMatch = transformCode.match(/\(?"?([^"()]+)"?\)/);
    if (inputMatch) {
      const potentialInput = inputMatch[1];

      // If it's a string literal, it's a direct input
      if (
        transformCode.includes(`"${potentialInput}"`) ||
        transformCode.includes(`'${potentialInput}'`)
      ) {
        valueSource.value = "input";
        sourceValue.value = potentialInput;
      } else {
        // Otherwise, it's likely a variable
        valueSource.value = "variable";
        variableName.value = potentialInput;
      }
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
    generateCode();
  }
}

// Parse text case transformation
function parseTextCaseTransformation(code: string) {
  if (code.includes(".toUpperCase()")) {
    textCaseType.value = "uppercase";
  } else if (code.includes(".toLowerCase()")) {
    if (code.includes('replace(/\\s+/g, "-")')) {
      textCaseType.value = "kebabcase";
    } else if (code.includes('replace(/\\s+/g, "_")')) {
      textCaseType.value = "snakecase";
    } else {
      textCaseType.value = "lowercase";
    }
  } else if (code.includes(".replace(/\\b\\w/g")) {
    textCaseType.value = "titlecase";
  } else if (code.includes(".charAt(0).toUpperCase()")) {
    textCaseType.value = "sentencecase";
  } else if (
    code.includes("toLowerCase().replace(/[^a-zA-Z0-9]+(.)|(^[a-zA-Z])/g")
  ) {
    textCaseType.value = "camelcase";
  }
}

// Parse substitution transformation
function parseSubstitutionTransformation(code: string) {
  // Reset substitutions
  substitutions.value = [];

  // Extract substitution operations
  const replaceRegex =
    /\.replace\((\/[^/]+\/[gi]?|"[^"]+"|'[^']+'),\s*("[^"]+"|'[^']+')\)/g;
  const splitJoinRegex =
    /\.split\((\/[^/]+\/[gi]?|"[^"]+"|'[^']+').*?\.join\((\/[^/]+\/[gi]?|"[^"]+"|'[^']+')\)/g;

  let match;

  // Extract replace operations
  while ((match = replaceRegex.exec(code)) !== null) {
    const find = match[1].replace(/^["'/]|["'/]$/g, "");
    const replace = match[2].replace(/^["']|["']$/g, "");

    substitutions.value.push({
      find: find,
      replace: replace,
      useRegex: find.startsWith("/"),
      caseSensitive: !find.endsWith("i"),
      replaceAll: false,
    });
  }

  // Extract split/join operations (replaceAll)
  while ((match = splitJoinRegex.exec(code)) !== null) {
    const findSplit = match[1].replace(/^["'/]|["'/]$/g, "");
    const replaceJoin = match[2].replace(/^["'/]|["'/]$/g, "");

    substitutions.value.push({
      find: findSplit,
      replace: replaceJoin,
      useRegex: findSplit.startsWith("/"),
      caseSensitive: !findSplit.endsWith("i"),
      replaceAll: true,
    });
  }

  // If no substitutions were found, add an empty one
  if (substitutions.value.length === 0) {
    addSubstitution();
  }
}

// Parse number format transformation
function parseNumberFormatTransformation(code: string) {
  if (
    code.includes("minimumFractionDigits: 2") &&
    code.includes("maximumFractionDigits: 2")
  ) {
    if (code.includes("$")) {
      numberFormat.value = "currency";
    } else {
      numberFormat.value = "decimal";
    }
  } else if (code.includes("Math.round")) {
    numberFormat.value = "integer";
  } else if (code.includes("* 100") && code.includes("%")) {
    numberFormat.value = "percent";
  } else if (code.includes("toFixed")) {
    numberFormat.value = "custom";

    // Try to extract decimal places
    const decimalMatch = code.match(/toFixed\((\d+)\)/);
    if (decimalMatch) {
      numberCustomOptions.value.decimals = parseInt(decimalMatch[1]);
    }

    // Try to determine thousands separator
    if (code.includes('","')) {
      numberCustomOptions.value.thousands = "comma";
    } else if (code.includes('"."')) {
      numberCustomOptions.value.thousands = "period";
    } else if (code.includes('" "')) {
      numberCustomOptions.value.thousands = "space";
    } else {
      numberCustomOptions.value.thousands = "none";
    }

    // Try to extract prefix/suffix
    const prefixMatch = code.match(/"([^"]*)" \+ /);
    if (prefixMatch) {
      numberCustomOptions.value.prefix = prefixMatch[1];
    }

    const suffixMatch = code.match(/ \+ "([^"]*)"/);
    if (suffixMatch) {
      numberCustomOptions.value.suffix = suffixMatch[1];
    }
  }
}

// Parse date format transformation
function parseDateFormatTransformation(code: string) {
  const formatMatch = code.match(/\.format\("([^"]+)"\)/);

  if (formatMatch) {
    const format = formatMatch[1];

    switch (format) {
      case "MM/DD/YYYY":
        dateFormatChoice.value = "short";
        break;
      case "MMM D, YYYY":
        dateFormatChoice.value = "medium";
        break;
      case "MMMM D, YYYY":
        dateFormatChoice.value = "long";
        break;
      case "YYYY-MM-DD":
        dateFormatChoice.value = "iso";
        break;
      default:
        dateFormatChoice.value = "custom";
        dateCustomFormat.value = format;
    }
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for content changes
watch(
  [
    valueSource,
    sourceValue,
    variableName,
    transformationType,
    textCaseType,
    substitutions,
    formatType,
    numberFormat,
    numberCustomOptions,
    dateFormatChoice,
    dateCustomFormat,
    saveToVariable,
    outputVariableName,
  ],
  () => {
    generateCode();
  },
  { deep: true }
);
</script>

<style scoped>
.transform {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.transform__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.transform__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.transform__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Main container */
.transform__container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section styling */
.transform__section {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transform__section-title {
  font-weight: 500;
  font-size: 15px;
  color: #e2e8f0;
  margin-bottom: 8px;
}

/* Source options */
.transform__source-options {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.transform__source-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Transformation type buttons */
.transform__transformation-types,
.transform__format-types {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.transform__type-button {
  flex: 1;
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

.transform__type-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.transform__type-button i {
  font-size: 20px;
  margin-bottom: 4px;
}

.transform__type-button span {
  font-size: 14px;
}

.transform__type-button--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.transform__type-button--active i {
  color: #60a5fa;
}

/* Options */
.transform__options {
  padding: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transform__options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.transform__option-button {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.transform__option-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.transform__option-button--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
}

.transform__option-name {
  font-size: 14px;
  color: #e2e8f0;
}

.transform__option-desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Substitution styles */
.transform__options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.transform__options-title {
  font-weight: 500;
  font-size: 15px;
  color: #e2e8f0;
}

.transform__add-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  color: #60a5fa;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.transform__add-button:hover {
  background: rgba(59, 130, 246, 0.25);
}

.transform__empty-state {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.transform__substitution-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.transform__substitution-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transform__substitution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transform__substitution-title {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}

.transform__remove-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 4px;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s;
}

.transform__remove-button:hover {
  background: rgba(239, 68, 68, 0.2);
}

.transform__substitution-fields {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transform__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transform__field label {
  font-size: 13px;
  color: #94a3b8;
}

.transform__substitution-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  color: #94a3b8;
}

.transform__substitution-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* Custom format options */
.transform__custom-options {
  padding: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transform__field-row {
  display: flex;
  gap: 16px;
}

.transform__token-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.transform__token-chip {
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  font-size: 12px;
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.2s;
}

.transform__token-chip:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Output variable */
.transform__output-variable {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.transform__hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Form controls */
.transform__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
}

.transform__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.transform__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.transform__number-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.transform__number-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.transform__select {
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

.transform__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Radio and checkbox styles */
.transform__radio {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transform__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.transform__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.transform__radio input[type="radio"]:checked::after {
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

.transform__radio span {
  font-size: 14px;
  cursor: pointer;
}

.transform__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transform__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.transform__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.transform__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.transform__checkbox span {
  font-size: 14px;
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .transform__transformation-types,
  .transform__format-types {
    flex-direction: column;
  }

  .transform__field-row {
    flex-direction: column;
    gap: 12px;
  }

  .transform__substitution-fields {
    flex-direction: column;
    gap: 12px;
  }

  .transform__substitution-arrow {
    transform: rotate(90deg);
    margin: 8px 0;
  }

  .transform__substitution-options {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

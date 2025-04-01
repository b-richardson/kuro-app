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
    <div class="user-input">
      <!-- Module Header -->
      <div class="user-input__header">
        <div class="user-input__header-icon">
          <i class="fas fa-keyboard"></i>
        </div>
        <div class="user-input__header-title">User Input</div>
      </div>

      <!-- Input Type Selection -->
      <div class="user-input__type-selector">
        <button
          v-for="type in inputTypes"
          :key="type.id"
          class="user-input__type-button"
          :class="{ 'user-input__type-button--active': inputType === type.id }"
          @click="setInputType(type.id)"
        >
          <i :class="type.icon"></i>
          <span>{{ type.label }}</span>
        </button>
      </div>

      <!-- Configuration Panel -->
      <div class="user-input__config">
        <!-- Common fields across all input types -->
        <div class="user-input__field-group">
          <label class="user-input__label">Prompt Text</label>
          <input
            type="text"
            class="user-input__text-input"
            v-model="prompt"
            @input="generateCode"
            placeholder="e.g., What is the project name?"
          />
          <div class="user-input__field-tip">
            This text will be shown to the user when creating a note
          </div>
        </div>

        <div class="user-input__field-group">
          <label class="user-input__label">Variable Name</label>
          <div class="user-input__variable-wrapper">
            <input
              type="text"
              class="user-input__text-input user-input__variable-input"
              v-model="variableName"
              @input="sanitizeVariableName"
              placeholder="e.g., projectName"
            />
            <div class="user-input__variable-preview">
              <code>{{
                `<%${variableName ? " " + variableName + " " : ""}%>`
              }}</code>
            </div>
          </div>
          <div class="user-input__field-tip">
            Use this name to reference this input elsewhere in your template
          </div>
        </div>

        <!-- Type-specific configuration -->
        <div v-if="inputType === 'text'" class="user-input__field-group">
          <label class="user-input__label">Default Value</label>
          <input
            type="text"
            class="user-input__text-input"
            v-model="textOptions.defaultValue"
            @input="generateCode"
            placeholder="(Optional)"
          />
        </div>

        <div v-if="inputType === 'multiline'" class="user-input__field-group">
          <label class="user-input__label">Default Text</label>
          <textarea
            class="user-input__textarea"
            v-model="multilineOptions.defaultValue"
            @input="generateCode"
            placeholder="(Optional)"
            rows="4"
          ></textarea>

          <div class="user-input__checkbox">
            <input
              type="checkbox"
              id="placeholder"
              v-model="multilineOptions.asPlaceholder"
              @change="generateCode"
            />
            <label for="placeholder">Show as placeholder text</label>
          </div>
        </div>

        <div v-if="inputType === 'select'" class="user-input__field-group">
          <div class="user-input__options-header">
            <label class="user-input__label">Options</label>
            <button
              class="user-input__add-option-button"
              @click="addOption"
              aria-label="Add option"
            >
              <i class="fas fa-plus"></i>
              <span>Add Option</span>
            </button>
          </div>

          <div class="user-input__options-container">
            <div
              v-for="(option, index) in selectOptions.options"
              :key="index"
              class="user-input__option-item"
            >
              <input
                type="text"
                class="user-input__text-input"
                v-model="selectOptions.options[index]"
                @input="generateCode"
                placeholder="Option value"
              />
              <button
                class="user-input__remove-option"
                @click="removeOption(index)"
                aria-label="Remove option"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div class="user-input__display-type">
            <label class="user-input__radio">
              <input
                type="radio"
                v-model="selectOptions.displayAs"
                value="dropdown"
                @change="generateCode"
              />
              <span>Dropdown</span>
            </label>
            <label class="user-input__radio">
              <input
                type="radio"
                v-model="selectOptions.displayAs"
                value="radio"
                @change="generateCode"
              />
              <span>Radio Buttons</span>
            </label>
          </div>

          <div class="user-input__field-group">
            <label class="user-input__label">Default Selection</label>
            <select
              class="user-input__select"
              v-model="selectOptions.defaultOption"
              @change="generateCode"
            >
              <option value="">No default</option>
              <option
                v-for="(option, index) in selectOptions.options"
                :key="index"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>
        </div>

        <!-- Advanced Options (common across types) -->
        <div class="user-input__divider"></div>

        <div class="user-input__advanced">
          <button
            class="user-input__advanced-toggle"
            @click="showAdvanced = !showAdvanced"
          >
            <span>{{
              showAdvanced ? "Hide advanced options" : "Show advanced options"
            }}</span>
            <i
              :class="
                showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
              "
            ></i>
          </button>

          <div v-if="showAdvanced" class="user-input__advanced-panel">
            <div class="user-input__field-group">
              <div class="user-input__checkbox">
                <input
                  type="checkbox"
                  id="remember"
                  v-model="advancedOptions.remember"
                  @change="generateCode"
                />
                <label for="remember">Remember last value</label>
              </div>
              <div class="user-input__field-tip">
                Templater will suggest the last value you entered
              </div>
            </div>

            <div class="user-input__field-group">
              <div class="user-input__checkbox">
                <input
                  type="checkbox"
                  id="required"
                  v-model="advancedOptions.required"
                  @change="generateCode"
                />
                <label for="required">Required field</label>
              </div>
              <div class="user-input__field-tip">User must provide a value</div>
            </div>

            <div class="user-input__field-group">
              <label class="user-input__label">Tooltip</label>
              <input
                type="text"
                class="user-input__text-input"
                v-model="advancedOptions.tooltip"
                @input="generateCode"
                placeholder="Optional help text"
              />
            </div>
          </div>
        </div>

        <!-- Helpful usage tips -->
        <div class="user-input__tips">
          <div class="user-input__tips-header">
            <i class="fas fa-lightbulb"></i>
            <span>Using this input elsewhere</span>
          </div>
          <div class="user-input__tips-content">
            <p>To use this value in other parts of your template, use:</p>
            <code class="user-input__code">{{
              `<% ${variableName || "variableName"} %>`
            }}</code>
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

// Input types
const inputTypes = [
  { id: "text", label: "Text Input", icon: "fas fa-font" },
  { id: "multiline", label: "Multi-line Text", icon: "fas fa-align-left" },
  { id: "select", label: "Selection", icon: "fas fa-list-ul" },
];

// State
const inputType = ref("text");
const prompt = ref("");
const variableName = ref("");
const showAdvanced = ref(false);

// Type-specific options
const textOptions = ref({
  defaultValue: "",
});

const multilineOptions = ref({
  defaultValue: "",
  asPlaceholder: false,
});

const selectOptions = ref({
  options: ["Option 1", "Option 2", "Option 3"],
  displayAs: "dropdown",
  defaultOption: "",
});

// Advanced options
const advancedOptions = ref({
  remember: false,
  required: false,
  tooltip: "",
});

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Set defaults
    setInputType("text");
    generateCode();
  }
});

// Set input type
function setInputType(type: string) {
  inputType.value = type;
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

// Add option for select input
function addOption() {
  selectOptions.value.options.push(
    `Option ${selectOptions.value.options.length + 1}`
  );
  generateCode();
}

// Remove option for select input
function removeOption(index: number) {
  // Don't remove if it's the last option
  if (selectOptions.value.options.length > 1) {
    // If we're removing the default option, clear the default
    if (
      selectOptions.value.options[index] === selectOptions.value.defaultOption
    ) {
      selectOptions.value.defaultOption = "";
    }

    selectOptions.value.options.splice(index, 1);
    generateCode();
  }
}

// Generate the Templater code
function generateCode() {
  let code = "";

  // Start with the variable assignment if name is provided
  const hasVariable = variableName.value.trim() !== "";
  if (hasVariable) {
    code += `<% ${"tp.user." + variableName.value} = `;
  }

  // Build the appropriate Templater input function
  switch (inputType.value) {
    case "text":
      code += `await tp.system.prompt("${prompt.value}"`;

      // Add default value if specified
      if (textOptions.value.defaultValue) {
        code += `, "${textOptions.value.defaultValue}"`;
      }

      // Add options object if advanced options are used
      if (needsOptionsObject()) {
        code += `, ${buildOptionsObject()}`;
      }

      code += ")";
      break;

    case "multiline":
      code += `await tp.system.prompt("${prompt.value}"`;

      // Handle multiline text
      if (multilineOptions.value.defaultValue) {
        if (multilineOptions.value.asPlaceholder) {
          // If using as placeholder, pass empty string as default
          code += `, ""`;
        } else {
          // Otherwise, use the text as default
          code += `, \`${multilineOptions.value.defaultValue}\``;
        }
      }

      // Build options object
      const multilineOptions = {
        ...buildOptionsObjectContent(),
        multi: true,
      };

      // Add placeholder if needed
      if (
        multilineOptions.value.asPlaceholder &&
        multilineOptions.value.defaultValue
      ) {
        multilineOptions.placeholder = multilineOptions.value.defaultValue;
      }

      code += `, ${JSON.stringify(multilineOptions)}`;
      code += ")";
      break;

    case "select":
      // For select/dropdown inputs
      if (selectOptions.value.displayAs === "dropdown") {
        // Use suggest function for dropdown
        code += `await tp.system.suggester(
  [${selectOptions.value.options.map((opt) => `"${opt}"`).join(", ")}],
  [${selectOptions.value.options.map((opt) => `"${opt}"`).join(", ")}],
  ${hasAdvancedOptions() ? buildOptionsObject() : "false"}`;

        // Add placeholder as prompt if needed
        if (prompt.value) {
          code += `, "${prompt.value}"`;
        }

        code += ")";
      } else {
        // Use toggle for radio buttons
        code += `await tp.system.toggle(
  [${selectOptions.value.options.map((opt) => `"${opt}"`).join(", ")}],
  [${selectOptions.value.options.map((opt) => `"${opt}"`).join(", ")}]`;

        // Add default selection if specified
        if (selectOptions.value.defaultOption) {
          const defaultIndex = selectOptions.value.options.indexOf(
            selectOptions.value.defaultOption
          );
          if (defaultIndex >= 0) {
            code += `, ${defaultIndex}`;
          }
        }

        code += ")";
      }
      break;
  }

  // Close the variable assignment if needed
  if (hasVariable) {
    code += ` %>`;
  } else {
    code = `<% ${code} %>`;
  }

  updateContent([code]);
}

// Check if advanced options are used
function hasAdvancedOptions() {
  return (
    advancedOptions.value.remember ||
    advancedOptions.value.required ||
    advancedOptions.value.tooltip !== ""
  );
}

// Check if options object is needed
function needsOptionsObject() {
  return inputType.value === "multiline" || hasAdvancedOptions();
}

// Build options object content
function buildOptionsObjectContent() {
  const options: Record<string, any> = {};

  if (advancedOptions.value.remember) {
    options.remember = true;
  }

  if (advancedOptions.value.required) {
    options.required = true;
  }

  if (advancedOptions.value.tooltip) {
    options.tooltip = advancedOptions.value.tooltip;
  }

  return options;
}

// Build options object string
function buildOptionsObject() {
  const options = buildOptionsObjectContent();
  return Object.keys(options).length > 0 ? JSON.stringify(options) : "{}";
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Remove the Templater tags
    const cleanCode = code.replace(/<%|%>/g, "").trim();

    // Check for variable assignment
    const variableMatch = cleanCode.match(/tp\.user\.(\w+)\s*=\s*/);
    if (variableMatch) {
      variableName.value = variableMatch[1];
    }

    // Extract the core function call
    let functionCall = cleanCode;
    if (variableMatch) {
      functionCall = cleanCode.replace(variableMatch[0], "");
    }

    // Determine input type and parse options
    if (functionCall.includes("tp.system.prompt")) {
      // Parse prompt parameters
      const promptParamsMatch = functionCall.match(
        /tp\.system\.prompt\("([^"]+)"(?:,\s*(?:"([^"]+)"|`([^`]+)`))?,?\s*({[^}]+})?\)/
      );

      if (promptParamsMatch) {
        prompt.value = promptParamsMatch[1] || "";

        // Check if multiline
        if (promptParamsMatch[4] && promptParamsMatch[4].includes("multi")) {
          inputType.value = "multiline";

          // Check for default value or placeholder
          if (promptParamsMatch[2]) {
            multilineOptions.value.defaultValue = promptParamsMatch[2];
            multilineOptions.value.asPlaceholder = false;
          } else if (promptParamsMatch[3]) {
            multilineOptions.value.defaultValue = promptParamsMatch[3];
            multilineOptions.value.asPlaceholder = false;
          }

          // Parse placeholder
          const placeholderMatch = promptParamsMatch[4].match(
            /"placeholder"\s*:\s*"([^"]+)"/
          );
          if (placeholderMatch) {
            multilineOptions.value.defaultValue = placeholderMatch[1];
            multilineOptions.value.asPlaceholder = true;
          }
        } else {
          inputType.value = "text";

          // Get default value
          if (promptParamsMatch[2]) {
            textOptions.value.defaultValue = promptParamsMatch[2];
          }
        }

        // Parse advanced options
        if (promptParamsMatch[4]) {
          const optionsStr = promptParamsMatch[4];
          parseAdvancedOptions(optionsStr);
        }
      }
    } else if (
      functionCall.includes("tp.system.suggester") ||
      functionCall.includes("tp.system.toggle")
    ) {
      inputType.value = "select";

      // Determine display type
      selectOptions.value.displayAs = functionCall.includes(
        "tp.system.suggester"
      )
        ? "dropdown"
        : "radio";

      // Extract options from the arrays
      const optionsMatch = functionCall.match(/\[\s*((?:"[^"]+",?\s*)+)\]/);
      if (optionsMatch) {
        const optionsStr = optionsMatch[1];
        const options = optionsStr.match(/"([^"]+)"/g);

        if (options) {
          selectOptions.value.options = options.map((opt) =>
            opt.replace(/"/g, "")
          );
        }
      }

      // Extract default selection
      if (selectOptions.value.displayAs === "radio") {
        const defaultMatch = functionCall.match(/,\s*(\d+)\s*\)/);
        if (defaultMatch) {
          const defaultIndex = parseInt(defaultMatch[1]);
          if (
            defaultIndex >= 0 &&
            defaultIndex < selectOptions.value.options.length
          ) {
            selectOptions.value.defaultOption =
              selectOptions.value.options[defaultIndex];
          }
        }
      }

      // Extract prompt
      if (selectOptions.value.displayAs === "dropdown") {
        const promptMatch = functionCall.match(/,\s*"([^"]+)"\s*\)/);
        if (promptMatch) {
          prompt.value = promptMatch[1];
        }
      }
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
    setInputType("text");
  }
}

// Parse advanced options from options object
function parseAdvancedOptions(optionsStr: string) {
  try {
    // Extract remember option
    const rememberMatch = optionsStr.match(/"remember"\s*:\s*(true|false)/);
    if (rememberMatch) {
      advancedOptions.value.remember = rememberMatch[1] === "true";
    }

    // Extract required option
    const requiredMatch = optionsStr.match(/"required"\s*:\s*(true|false)/);
    if (requiredMatch) {
      advancedOptions.value.required = requiredMatch[1] === "true";
    }

    // Extract tooltip
    const tooltipMatch = optionsStr.match(/"tooltip"\s*:\s*"([^"]+)"/);
    if (tooltipMatch) {
      advancedOptions.value.tooltip = tooltipMatch[1];
    }
  } catch (error) {
    console.error("Error parsing advanced options:", error);
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for changes to update the code
watch(
  [
    inputType,
    prompt,
    textOptions,
    multilineOptions,
    selectOptions,
    advancedOptions,
  ],
  () => {
    generateCode();
  },
  { deep: true }
);
</script>

<style scoped>
.user-input {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.user-input__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-input__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.user-input__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Type selector */
.user-input__type-selector {
  display: flex;
  gap: 12px;
}

.user-input__type-button {
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

.user-input__type-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.user-input__type-button i {
  font-size: 22px;
  margin-bottom: 4px;
}

.user-input__type-button span {
  font-size: 14px;
}

.user-input__type-button--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.user-input__type-button--active i {
  color: #60a5fa;
}

/* Configuration panel */
.user-input__config {
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form field groups */
.user-input__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-input__label {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.user-input__field-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Text inputs */
.user-input__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s;
}

.user-input__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.user-input__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

/* Textarea */
.user-input__textarea {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s;
}

.user-input__textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

/* Variable input with preview */
.user-input__variable-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-input__variable-input {
  flex: 1;
}

.user-input__variable-preview {
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  color: #94a3b8;
}

.user-input__variable-preview code {
  font-family: monospace;
}

/* Checkboxes */
.user-input__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.user-input__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.user-input__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.user-input__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.user-input__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

/* Select dropdown */
.user-input__select {
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

.user-input__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Radio buttons */
.user-input__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.user-input__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.user-input__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.user-input__radio input[type="radio"]:checked::after {
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

.user-input__radio span {
  font-size: 14px;
  cursor: pointer;
}

.user-input__display-type {
  display: flex;
  margin-top: 12px;
}

/* Options for select input */
.user-input__options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-input__add-option-button {
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

.user-input__add-option-button:hover {
  background: rgba(59, 130, 246, 0.25);
}

.user-input__options-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.user-input__option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-input__remove-option {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.user-input__remove-option:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

/* Divider */
.user-input__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

/* Advanced panel */
.user-input__advanced {
  display: flex;
  flex-direction: column;
}

.user-input__advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-input__advanced-toggle:hover {
  color: #e2e8f0;
}

.user-input__advanced-panel {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* Tips section */
.user-input__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-input__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.user-input__tips-content {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.user-input__code {
  display: inline-block;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #94a3b8;
  margin-top: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-input__type-selector {
    flex-direction: column;
  }

  .user-input__variable-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .user-input__display-type {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

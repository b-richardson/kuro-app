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

      <!-- Prompt Type Selection -->
      <div class="user-input__prompt-type">
        <label class="user-input__label">What would you like to prompt?</label>
        <div class="user-input__prompt-type-options">
          <button
            v-for="type in promptTypes"
            :key="type.id"
            class="user-input__prompt-type-button"
            :class="{
              'user-input__prompt-type-button--active': promptType === type.id,
            }"
            @click="setPromptType(type.id)"
          >
            <i :class="type.icon"></i>
            <span>{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Prompt Configuration - Only show after prompt type is selected -->
      <div v-if="promptType" class="user-input__field-group">
        <label class="user-input__label">
          {{ promptLabelText }}
        </label>
        <input
          type="text"
          class="user-input__text-input"
          v-model="prompt"
          @input="generateCode"
          :placeholder="promptPlaceholder"
        />
        <div class="user-input__field-tip">
          {{ promptTipText }}
        </div>
      </div>

      <!-- Show Question/Instruction in Note Toggle -->
      <div
        v-if="promptType && promptType !== 'label'"
        class="user-input__field-group"
      >
        <div class="user-input__checkbox">
          <input
            type="checkbox"
            id="showInNote"
            v-model="showInNote"
            @change="generateCode"
          />
          <label for="showInNote">
            {{
              promptType === "question"
                ? "Show question in note"
                : "Show instruction in note"
            }}
          </label>
        </div>
        <div class="user-input__field-tip">
          {{
            promptType === "question"
              ? "Question will appear before the answer in the note"
              : "Instruction will appear before the answer in the note"
          }}
        </div>
      </div>

      <!-- Label Input (for Instruction with label enabled) -->
      <div
        v-if="promptType === 'instruction' && showInNote"
        class="user-input__field-group"
      >
        <label class="user-input__label">Label (shown in note)</label>
        <input
          type="text"
          class="user-input__text-input"
          v-model="instructionLabel"
          @input="generateCode"
          placeholder="e.g., Project name:"
        />
        <div class="user-input__field-tip">
          This label will appear before the answer in the note
        </div>
      </div>

      <!-- Answer Type Selection - Only shown after prompt text is entered -->
      <div v-if="prompt" class="user-input__answer-type">
        <label class="user-input__label">How do you want to answer?</label>
        <div class="user-input__type-selector">
          <button
            v-for="type in answerTypes"
            :key="type.id"
            class="user-input__type-button"
            :class="{
              'user-input__type-button--active': inputType === type.id,
            }"
            @click="setInputType(type.id)"
          >
            <i :class="type.icon"></i>
            <span>{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Text Input Configuration -->
      <div v-if="prompt && inputType === 'text'" class="user-input__config">
        <div class="user-input__field-group">
          <label class="user-input__label">Default Value</label>
          <input
            type="text"
            class="user-input__text-input"
            v-model="textOptions.defaultValue"
            @input="generateCode"
            placeholder="(Optional)"
          />
          <div class="user-input__field-tip">
            This will be pre-filled when using the template
          </div>
        </div>

        <div class="user-input__field-group">
          <div class="user-input__checkbox">
            <input
              type="checkbox"
              id="multiline"
              v-model="textOptions.multiline"
              @change="generateCode"
            />
            <label for="multiline">Allow multiple lines of text</label>
          </div>
          <div class="user-input__field-tip">
            User can enter paragraph text with line breaks
          </div>
        </div>
      </div>

      <!-- Dropdown Choices Configuration -->
      <div v-if="prompt && inputType === 'select'" class="user-input__config">
        <div class="user-input__field-group">
          <div class="user-input__options-header">
            <label class="user-input__label">Choices</label>
            <button
              class="user-input__add-option-button"
              @click="addOption"
              aria-label="Add option"
            >
              <i class="fas fa-plus"></i>
              <span>Add Choice</span>
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
                placeholder="Enter choice text"
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
          <div class="user-input__field-tip">
            This choice will be pre-selected when using the template
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
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

// Prompt types
const promptTypes = [
  { id: "question", label: "Question", icon: "fas fa-question-circle" },
  { id: "instruction", label: "Instruction", icon: "fas fa-tasks" },
  { id: "label", label: "Label", icon: "fas fa-tag" },
];

// Answer types with simplified options
const answerTypes = [
  { id: "text", label: "Text Input", icon: "fas fa-font" },
  { id: "select", label: "Dropdown Choices", icon: "fas fa-list-ul" },
];

// State
const promptType = ref("");
const inputType = ref("");
const prompt = ref("");
const showInNote = ref(true); // Default to showing question/instruction in note
const instructionLabel = ref("");

// Computed properties for prompt text variations
const promptLabelText = computed(() => {
  switch (promptType.value) {
    case "question":
      return "Question";
    case "instruction":
      return "Instruction";
    case "label":
      return "Label";
    default:
      return "Prompt Text";
  }
});

const promptPlaceholder = computed(() => {
  switch (promptType.value) {
    case "question":
      return "e.g., What is the project name?";
    case "instruction":
      return "e.g., Enter the project name";
    case "label":
      return "e.g., Project name:";
    default:
      return "e.g., What is the project name?";
  }
});

const promptTipText = computed(() => {
  switch (promptType.value) {
    case "question":
      return "This question will be shown to the user when creating a note";
    case "instruction":
      return "This instruction will guide the user when creating a note";
    case "label":
      return "This label will appear before the user input in the note";
    default:
      return "This text will be shown to the user when creating a note";
  }
});

// Type-specific options
const textOptions = ref({
  defaultValue: "",
  multiline: false,
});

const selectOptions = ref({
  options: ["Option 1", "Option 2", "Option 3"],
  defaultOption: "",
});

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingCode(props.module.content[0]);
  } else {
    // Set defaults
    setPromptType("question");
    setInputType("text");
    generateCode();
  }
});

// Set prompt type
function setPromptType(type: string) {
  promptType.value = type;
  generateCode();
}

// Set input type
function setInputType(type: string) {
  inputType.value = type;
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

  // Determine the prompt text based on type and settings
  let promptText = prompt.value;

  // For questions and instructions that should appear in the note
  if (
    (promptType.value === "question" || promptType.value === "instruction") &&
    showInNote.value
  ) {
    // Add the prompt/instruction before the variable
    if (promptType.value === "question") {
      code += `${promptText} `;
    } else if (promptType.value === "instruction" && instructionLabel.value) {
      code += `${instructionLabel.value} `;
    }
  }

  // For labels, always show them in the note
  if (promptType.value === "label") {
    code += `${promptText} `;
  }

  // Build the appropriate Templater input function
  switch (inputType.value) {
    case "text":
      code += `<% await tp.system.prompt("${promptText}"`;

      // Add default value if specified
      if (textOptions.value.defaultValue) {
        code += `, "${textOptions.value.defaultValue}"`;
      }

      // Add multiline parameter if enabled
      if (textOptions.value.multiline) {
        if (!textOptions.value.defaultValue) {
          code += ', ""'; // Add empty default if none provided
        }
        code += `, {multi: true}`;
      }

      code += ") %>";
      break;

    case "select":
      // Use suggester function for dropdown
      code += `<% await tp.system.suggester(
  [${selectOptions.value.options.map((opt) => `"${opt}"`).join(", ")}],
  [${selectOptions.value.options.map((opt) => `"${opt}"`).join(", ")}]`;

      // Add prompt text
      if (promptText) {
        code += `, false, "${promptText}"`;
      }

      code += ") %>";
      break;
  }

  updateContent([code]);
}

// Parse existing Templater code
function parseExistingCode(code: string) {
  try {
    // Try to determine if there's label text before the templater code
    const labelMatch = code.match(/^(.+?)\s*<%.+%>/);
    if (labelMatch) {
      const labelText = labelMatch[1].trim();
      prompt.value = labelText;

      // Determine prompt type based on the label text
      if (labelText.endsWith("?")) {
        promptType.value = "question";
        showInNote.value = true;
      } else if (labelText.endsWith(":")) {
        promptType.value = "label";
      } else {
        promptType.value = "instruction";
        instructionLabel.value = labelText;
        showInNote.value = true;
      }
    } else {
      // Default to question if no label detected
      promptType.value = "question";
    }

    // Clean the Templater code for parsing
    const cleanCode = code.replace(/^.*?<%\s*|\s*%>.*?$/g, "").trim();

    // Determine input type and parse options
    if (cleanCode.includes("tp.system.prompt")) {
      // Parse prompt parameters
      const promptParamsMatch = cleanCode.match(
        /tp\.system\.prompt\("([^"]+)"(?:,\s*(?:"([^"]+)"))?(?:,\s*({[^}]+}))?\)/
      );

      if (promptParamsMatch) {
        // Only set prompt if we didn't already find it as a label
        if (!labelMatch) {
          prompt.value = promptParamsMatch[1] || "";
        }

        // Set default value if provided
        if (promptParamsMatch[2]) {
          textOptions.value.defaultValue = promptParamsMatch[2];
        }

        // Check if multiline
        if (promptParamsMatch[3] && promptParamsMatch[3].includes("multi")) {
          textOptions.value.multiline = true;
        }

        // Set input type
        inputType.value = "text";
      }
    } else if (cleanCode.includes("tp.system.suggester")) {
      inputType.value = "select";

      // Extract options from the arrays
      const optionsMatch = cleanCode.match(/\[\s*((?:"[^"]+",?\s*)+)\]/);
      if (optionsMatch) {
        const optionsStr = optionsMatch[1];
        const options = optionsStr.match(/"([^"]+)"/g);

        if (options) {
          selectOptions.value.options = options.map((opt) =>
            opt.replace(/"/g, "")
          );
        }
      }

      // Extract prompt from the end (if present)
      const promptMatch = cleanCode.match(/,\s*"([^"]+)"\s*\)/);
      if (promptMatch && !labelMatch) {
        prompt.value = promptMatch[1];
      }
    }
  } catch (error) {
    console.error("Error parsing existing code:", error);
    // If parsing fails, just use defaults
    setPromptType("question");
    setInputType("text");
  }
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}

// Watch for changes to update the code
watch(
  [
    promptType,
    inputType,
    prompt,
    showInNote,
    instructionLabel,
    textOptions,
    selectOptions,
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

/* Prompt Type Selector */
.user-input__prompt-type {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-input__prompt-type-options {
  display: flex;
  gap: 12px;
}

.user-input__prompt-type-button {
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

.user-input__prompt-type-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.user-input__prompt-type-button i {
  font-size: 22px;
  margin-bottom: 4px;
}

.user-input__prompt-type-button span {
  font-size: 14px;
}

.user-input__prompt-type-button--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.user-input__prompt-type-button--active i {
  color: #60a5fa;
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

.user-input__answer-type {
  margin-top: 16px;
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
  .user-input__type-selector,
  .user-input__prompt-type-options {
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

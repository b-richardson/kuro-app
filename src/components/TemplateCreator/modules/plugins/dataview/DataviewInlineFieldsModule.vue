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
    ref="baseModuleRef"
  >
    <div class="inline-field-editor">
      <!-- Module Header -->
      <div class="inline-field-editor__header">
        <div class="inline-field-editor__header-icon">
          <i class="fas fa-tag"></i>
        </div>
        <div class="inline-field-editor__header-title">Inline Field</div>
      </div>

      <!-- Field Configuration Section -->
      <div class="inline-field-editor__section">
        <div class="inline-field-editor__section-header">
          <div class="inline-field-editor__section-title">
            <i class="fas fa-cube"></i>
            <span>Define Field</span>
          </div>
          <div class="inline-field-editor__section-description">
            Create a metadata field for users to fill in when using your
            template
          </div>
        </div>

        <div class="inline-field-editor__field-container">
          <!-- Field Name Input -->
          <div class="inline-field-editor__field-input-group">
            <input
              type="text"
              class="inline-field-editor__text-input"
              v-model="fieldName"
              placeholder="Define your field label here (e.g., Priority, Due, Status)"
              @input="generateField"
              :class="{
                'inline-field-editor__text-input--error': fieldNameError,
              }"
            />
            <div class="inline-field-editor__field-symbol">::</div>
          </div>

          <div class="inline-field-editor__input-feedback">
            <p v-if="fieldNameError" class="inline-field-editor__input-error">
              <i class="fas fa-exclamation-circle"></i>
              Please enter a field name
            </p>
            <p v-else class="inline-field-editor__input-help">
              <i class="fas fa-info-circle"></i>
              This creates a
              <span class="inline-field-editor__code"
                >{{ fieldName || "fieldName" }}::</span
              >
              that users will fill in later
            </p>
          </div>
        </div>

        <!-- Visual Examples and Context -->
        <div class="inline-field-editor__examples">
          <div class="inline-field-editor__examples-header">
            <i class="fas fa-lightbulb"></i>
            <span>Example Use Cases</span>
          </div>

          <div class="inline-field-editor__example-cards">
            <div class="inline-field-editor__example-card">
              <div class="inline-field-editor__example-title">Project Info</div>
              <div class="inline-field-editor__example-content">
                <code>Status::</code>
                <code>Priority::</code>
                <code>DueDate::</code>
              </div>
            </div>

            <div class="inline-field-editor__example-card">
              <div class="inline-field-editor__example-title">
                Task Tracking
              </div>
              <div class="inline-field-editor__example-content">
                <code>Difficulty::</code>
                <code>Estimated::</code>
                <code>Owner::</code>
              </div>
            </div>

            <div class="inline-field-editor__example-card">
              <div class="inline-field-editor__example-title">
                Meeting Notes
              </div>
              <div class="inline-field-editor__example-content">
                <code>Attendees::</code>
                <code>Decisions::</code>
                <code>Location::</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Options Section (Hidden by Default) -->
      <div class="inline-field-editor__section">
        <button
          class="inline-field-editor__advanced-toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span>{{
            showAdvanced ? "Hide advanced options" : "Show advanced options"
          }}</span>
          <i
            :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
        </button>

        <div v-if="showAdvanced" class="inline-field-editor__advanced-panel">
          <!-- Display Style Options -->
          <div class="inline-field-editor__option-group">
            <div class="inline-field-editor__option-label">
              Field Visibility
            </div>

            <div class="inline-field-editor__radio-group">
              <label class="inline-field-editor__radio">
                <input
                  type="radio"
                  name="displayStyle"
                  value="visible"
                  v-model="displayStyle"
                  @change="generateField"
                />
                <span>Visible</span>
                <span class="inline-field-editor__option-example"
                  >[key:: ]</span
                >
              </label>

              <label class="inline-field-editor__radio">
                <input
                  type="radio"
                  name="displayStyle"
                  value="hidden"
                  v-model="displayStyle"
                  @change="generateField"
                />
                <span>Hidden</span>
                <span class="inline-field-editor__option-example"
                  >[key:: ]{.hidden}</span
                >
              </label>
            </div>

            <div class="inline-field-editor__option-help">
              Hidden fields store data but don't appear in reading mode
            </div>
          </div>

          <!-- Integration with User Input Module -->
          <div class="inline-field-editor__option-group">
            <div class="inline-field-editor__option-label">
              Connect with User Input
            </div>

            <div class="inline-field-editor__checkbox">
              <input
                type="checkbox"
                id="use-prompt"
                v-model="useUserInput"
                @change="generateField"
              />
              <label for="use-prompt">Fill field with user prompt</label>
            </div>

            <div v-if="useUserInput" class="inline-field-editor__prompt-config">
              <input
                type="text"
                class="inline-field-editor__text-input"
                v-model="promptText"
                placeholder="Enter prompt text (e.g., 'Enter the project status')"
                @input="generateField"
              />

              <div class="inline-field-editor__option-help">
                When the template is used, this will prompt the user to provide
                a value
              </div>
            </div>
          </div>

          <!-- Required Field Option -->
          <div class="inline-field-editor__option-group">
            <div class="inline-field-editor__checkbox">
              <input
                type="checkbox"
                id="required-field"
                v-model="requiredField"
                @change="generateField"
              />
              <label for="required-field">Mark as required field</label>
            </div>

            <div class="inline-field-editor__option-help">
              Adds a visual indicator that this field should be completed
            </div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="inline-field-editor__tips">
        <div class="inline-field-editor__tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Inline Fields</span>
        </div>
        <div class="inline-field-editor__tips-content">
          <p>
            Inline fields add structured data directly in your notes using the
            <code>[key:: value]</code> format. When users create a note from
            your template, they'll fill in values for each field you define.
            These fields can later be queried with Dataview to create dynamic
            views of your notes.
          </p>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
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

// Field name with validation
const fieldName = ref("");
const fieldNameError = ref(false);

// Advanced options toggle
const showAdvanced = ref(false);

// Advanced options
const displayStyle = ref("visible"); // visible, hidden
const useUserInput = ref(false);
const promptText = ref("");
const requiredField = ref(false);

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingField(props.module.content[0]);
  } else {
    // Generate initial field
    generateField();
  }
});

// Validate field name
watch(fieldName, (newValue) => {
  fieldNameError.value = !newValue.trim();
});

// Parse existing field
function parseExistingField(content: string) {
  try {
    // Extract lines from content
    const lines = content.split("\n");

    // Look for inline field pattern
    for (const line of lines) {
      // Basic field pattern: [fieldName:: ]
      const basicFieldMatch = line.match(/\[([^:]+)::\s*\]/);
      if (basicFieldMatch) {
        fieldName.value = basicFieldMatch[1].trim();
      }

      // Field with user input: [fieldName:: <%* await tp.system.prompt("prompt text") %>]
      const promptFieldMatch = line.match(
        /\[([^:]+)::\s*<%\*\s*await\s*tp\.system\.prompt\s*\("([^"]+)"\)\s*%>\s*\]/
      );
      if (promptFieldMatch) {
        fieldName.value = promptFieldMatch[1].trim();
        useUserInput.value = true;
        promptText.value = promptFieldMatch[2].trim();
      }

      // Check for hidden style
      if (line.includes("{.hidden}")) {
        displayStyle.value = "hidden";
      }

      // Check for required marker
      if (line.includes("*")) {
        requiredField.value = true;
      }
    }

    // Generate field to ensure format
    generateField();
  } catch (error) {
    console.error("Error parsing existing field:", error);
    // If parsing fails, just generate a new default field
    generateField();
  }
}

// Generate field markdown
function generateField() {
  // Validate field name
  fieldNameError.value = !fieldName.value.trim();

  if (fieldNameError.value) {
    // Use default placeholder for preview but don't update content
    return;
  }

  let fieldContent = "";

  // Create the basic field with options
  if (useUserInput && promptText.value) {
    // Field with user input prompt
    fieldContent = `[${fieldName.value}:: <%* await tp.system.prompt("${promptText.value}") %>]`;
  } else {
    // Standard empty field
    fieldContent = `[${fieldName.value}:: ]`;
  }

  // Add hidden style if selected
  if (displayStyle.value === "hidden") {
    fieldContent += "{.hidden}";
  }

  // Add required marker if selected
  if (requiredField.value) {
    fieldContent += " *";
  }

  // Update content
  updateContent([fieldContent]);
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}
</script>

<style scoped>
.inline-field-editor {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.inline-field-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.inline-field-editor__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.inline-field-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Section styling */
.inline-field-editor__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.inline-field-editor__section-header {
  margin-bottom: 4px;
}

.inline-field-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #e2e8f0;
}

.inline-field-editor__section-description {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

/* Field input styling */
.inline-field-editor__field-container {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  margin-bottom: 8px;
}

.inline-field-editor__field-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 4px 12px;
  transition: all 0.2s;
}

.inline-field-editor__field-input-group:focus-within {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.inline-field-editor__text-input {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 15px;
  width: 100%;
}

.inline-field-editor__text-input:focus {
  outline: none;
}

.inline-field-editor__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.inline-field-editor__text-input--error {
  color: #f87171;
}

.inline-field-editor__field-symbol {
  color: #60a5fa;
  font-weight: bold;
  font-family: monospace;
  font-size: 16px;
  user-select: none;
}

.inline-field-editor__input-feedback {
  margin-top: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-field-editor__input-error {
  color: #f87171;
}

.inline-field-editor__input-help {
  color: #94a3b8;
}

.inline-field-editor__input-error i,
.inline-field-editor__input-help i {
  margin-right: 4px;
}

.inline-field-editor__code {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  color: #e2e8f0;
}

/* Example cards */
.inline-field-editor__examples {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
}

.inline-field-editor__examples-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.inline-field-editor__examples-header i {
  color: #60a5fa;
}

.inline-field-editor__example-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.inline-field-editor__example-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
}

.inline-field-editor__example-title {
  font-weight: 500;
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 8px;
  text-align: center;
}

.inline-field-editor__example-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inline-field-editor__example-content code {
  font-family: monospace;
  font-size: 12px;
  color: #94a3b8;
}

/* Advanced panel */
.inline-field-editor__advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.inline-field-editor__advanced-toggle:hover {
  color: #e2e8f0;
}

.inline-field-editor__advanced-panel {
  margin-top: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
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

/* Option groups */
.inline-field-editor__option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.inline-field-editor__option-group:last-child {
  margin-bottom: 0;
}

.inline-field-editor__option-label {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.inline-field-editor__option-help {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.inline-field-editor__option-example {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  margin-left: 8px;
  color: #94a3b8;
}

/* Checkbox styling */
.inline-field-editor__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-field-editor__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.inline-field-editor__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.inline-field-editor__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.inline-field-editor__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

/* Radio buttons */
.inline-field-editor__radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inline-field-editor__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.inline-field-editor__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.inline-field-editor__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.inline-field-editor__radio input[type="radio"]:checked::after {
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

/* Prompt configuration */
.inline-field-editor__prompt-config {
  margin-top: 8px;
  margin-left: 26px;
}

/* Tips section */
.inline-field-editor__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.inline-field-editor__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.inline-field-editor__tips-content {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.inline-field-editor__tips-content code {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .inline-field-editor__example-cards {
    grid-template-columns: 1fr;
  }
}
</style>

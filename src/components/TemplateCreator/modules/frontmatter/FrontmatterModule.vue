<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateFrontmatter"
    @update="$emit('update', $event as any)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    ref="baseModuleRef"
  >
    <div class="frontmatter">
      <!-- Module Header -->
      <div class="frontmatter__header">
        <div class="frontmatter__header-icon">
          <i class="fas fa-code"></i>
        </div>
        <div class="frontmatter__header-title">Frontmatter</div>
      </div>

      <!-- Empty State -->
      <div class="frontmatter__empty" v-if="properties.length === 0">
        <div class="frontmatter__empty-message">
          Add tags, dates, or custom fields to help Obsidian organize your note.
          You decide what gets filled in — now or later.
        </div>

        <div class="frontmatter__action-bar">
          <div class="frontmatter__dropdown">
            <button class="frontmatter__add-btn" @click="toggleFieldDropdown">
              <i class="fas fa-plus"></i> Add New Property
              <i class="fas fa-chevron-down frontmatter__dropdown-arrow"></i>
            </button>

            <div class="frontmatter__dropdown-menu" v-if="showFieldDropdown">
              <button
                v-for="type in propertyTypes"
                :key="type.id"
                class="frontmatter__dropdown-item"
                @click="addNewProperty(type.id)"
              >
                <i :class="type.icon"></i>
                <span>{{ type.name }}</span>
              </button>
            </div>
          </div>

          <div class="frontmatter__templates">
            <button
              class="frontmatter__template-btn"
              @click="toggleTemplateDropdown"
            >
              <i class="fas fa-book"></i> Use Template
              <i class="fas fa-chevron-down frontmatter__dropdown-arrow"></i>
            </button>

            <div class="frontmatter__dropdown-menu" v-if="showTemplateDropdown">
              <button
                v-for="template in quickTemplates"
                :key="template.id"
                class="frontmatter__dropdown-item"
                @click="applyTemplate(template.id)"
              >
                <i :class="template.icon"></i>
                <span>{{ template.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Property List with Actions on Top -->
      <div class="frontmatter__content" v-if="properties.length > 0">
        <div class="frontmatter__action-bar">
          <div class="frontmatter__dropdown">
            <button class="frontmatter__add-btn" @click="toggleFieldDropdown">
              <i class="fas fa-plus"></i> Add New Property
              <i class="fas fa-chevron-down frontmatter__dropdown-arrow"></i>
            </button>

            <div class="frontmatter__dropdown-menu" v-if="showFieldDropdown">
              <button
                v-for="type in propertyTypes"
                :key="type.id"
                class="frontmatter__dropdown-item"
                @click="addNewProperty(type.id)"
              >
                <i :class="type.icon"></i>
                <span>{{ type.name }}</span>
              </button>
            </div>
          </div>

          <div class="frontmatter__templates">
            <button
              class="frontmatter__template-btn"
              @click="toggleTemplateDropdown"
            >
              <i class="fas fa-book"></i> Use Template
              <i class="fas fa-chevron-down frontmatter__dropdown-arrow"></i>
            </button>

            <div class="frontmatter__dropdown-menu" v-if="showTemplateDropdown">
              <button
                v-for="template in quickTemplates"
                :key="template.id"
                class="frontmatter__dropdown-item"
                @click="applyTemplate(template.id)"
              >
                <i :class="template.icon"></i>
                <span>{{ template.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Properties List -->
        <div class="frontmatter__properties">
          <div
            v-for="(property, index) in properties"
            :key="index"
            class="frontmatter__property"
          >
            <!-- Property Header -->
            <div class="frontmatter__property-header">
              <!-- Property Name -->
              <input
                type="text"
                v-model="property.name"
                class="frontmatter__name-input"
                placeholder="Property name"
                @input="updateFrontmatter"
              />

              <!-- Property Type -->
              <select
                v-model="property.type"
                class="frontmatter__type-select"
                @change="handleTypeChange(index)"
              >
                <option
                  v-for="type in propertyTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.name }}
                </option>
              </select>

              <!-- Delete Property Button -->
              <button
                class="frontmatter__delete-btn"
                @click="removeProperty(index)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Property Value Input (based on type) -->
            <div class="frontmatter__property-value">
              <!-- Text Input -->
              <div
                v-if="property.type === 'text'"
                class="frontmatter__value-field"
              >
                <input
                  type="text"
                  v-model="property.value"
                  class="frontmatter__input"
                  placeholder="Text value"
                  @input="updateFrontmatter"
                />
              </div>

              <!-- Number Input -->
              <div
                v-if="property.type === 'number'"
                class="frontmatter__value-field"
              >
                <input
                  type="number"
                  v-model.number="property.value"
                  class="frontmatter__input"
                  placeholder="0"
                  @input="updateFrontmatter"
                />
              </div>

              <!-- Boolean Toggle -->
              <div
                v-if="property.type === 'boolean'"
                class="frontmatter__value-field"
              >
                <label class="frontmatter__toggle">
                  <input
                    type="checkbox"
                    v-model="property.value"
                    @change="updateFrontmatter"
                  />
                  <span class="frontmatter__toggle-slider"></span>
                  <span class="frontmatter__toggle-text">{{
                    property.value ? "Yes" : "No"
                  }}</span>
                </label>
              </div>

              <!-- Tags Input -->
              <div
                v-if="property.type === 'tags'"
                class="frontmatter__value-field"
              >
                <div class="frontmatter__tags">
                  <div
                    v-for="(tag, tagIndex) in property.value"
                    :key="tagIndex"
                    class="frontmatter__tag"
                  >
                    <span>{{ tag }}</span>
                    <button
                      class="frontmatter__tag-remove"
                      @click="removeTag(index, tagIndex)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div class="frontmatter__tag-input">
                  <input
                    type="text"
                    v-model="tagInputs[index]"
                    class="frontmatter__input"
                    placeholder="Type a tag and press Enter"
                    @keydown.enter.prevent="addTag(index)"
                  />
                  <button class="frontmatter__tag-add" @click="addTag(index)">
                    <i class="fas fa-plus"></i> Add Tag
                  </button>
                </div>
              </div>

              <!-- User Prompt Input -->
              <div
                v-if="property.type === 'prompt'"
                class="frontmatter__value-field"
              >
                <div class="frontmatter__prompt-field">
                  <label class="frontmatter__label">Question to ask:</label>
                  <input
                    type="text"
                    v-model="property.promptOptions.question"
                    class="frontmatter__input"
                    placeholder="e.g., What is the title of this note?"
                    @input="updateFrontmatter"
                  />
                </div>

                <div class="frontmatter__prompt-field">
                  <label class="frontmatter__label"
                    >Default answer (optional):</label
                  >
                  <input
                    type="text"
                    v-model="property.promptOptions.defaultValue"
                    class="frontmatter__input"
                    placeholder="Leave blank for no default"
                    @input="updateFrontmatter"
                  />
                </div>

                <div class="frontmatter__prompt-option">
                  <label class="frontmatter__toggle">
                    <input
                      type="checkbox"
                      v-model="property.promptOptions.multiline"
                      @change="updateFrontmatter"
                    />
                    <span class="frontmatter__toggle-slider"></span>
                  </label>
                  <span class="frontmatter__toggle-label"
                    >Allow multiple lines of text</span
                  >
                </div>

                <div class="frontmatter__prompt-preview">
                  <div class="frontmatter__preview-label">
                    Will prompt for input when using template
                  </div>
                </div>
              </div>

              <!-- File Property (dynamic value) -->
              <div
                v-if="property.type === 'fileProperty'"
                class="frontmatter__value-field"
              >
                <button
                  class="frontmatter__file-property-btn"
                  @click="openFilePropertySelector(index)"
                >
                  <i class="fas fa-magic"></i>
                  {{
                    property.fileProperty
                      ? getFilePropertyName(property.fileProperty)
                      : "Select a dynamic property"
                  }}
                </button>

                <div
                  v-if="property.fileProperty"
                  class="frontmatter__file-property-preview"
                >
                  <div class="frontmatter__preview-label">Will insert:</div>
                  <div class="frontmatter__preview-code">
                    {{ property.fileProperty }}
                  </div>
                </div>

                <!-- File Property Selector (modal or dropdown) -->
                <div
                  v-if="activeFilePropertyIndex === index"
                  class="frontmatter__file-property-selector"
                >
                  <div class="frontmatter__file-property-header">
                    <div>Select a dynamic property</div>
                    <button
                      @click="closeFilePropertySelector"
                      class="frontmatter__close-btn"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <div class="frontmatter__file-property-options">
                    <div
                      v-for="option in filePropertyOptions"
                      :key="option.id"
                      class="frontmatter__file-property-option"
                      @click="selectFileProperty(index, option.code)"
                    >
                      <i :class="option.icon"></i>
                      <span>{{ option.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Property Button -->
        <button
          class="frontmatter__add-property"
          @click="addNewProperty('text')"
        >
          <i class="fas fa-plus"></i> Add Property
        </button>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import YAML from "yaml";

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

// Reference to base module
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);

// UI state
const showFieldDropdown = ref(false);
const showTemplateDropdown = ref(false);
const activeFilePropertyIndex = ref(-1);

// Property Types with human-friendly names
const propertyTypes = [
  { id: "text", name: "Text", icon: "fas fa-font" },
  { id: "number", name: "Number", icon: "fas fa-hashtag" },
  { id: "boolean", name: "Yes/No", icon: "fas fa-toggle-on" },
  { id: "tags", name: "Tags", icon: "fas fa-tags" },
  { id: "prompt", name: "Ask a Question", icon: "fas fa-question-circle" },
  { id: "fileProperty", name: "Dynamic Value", icon: "fas fa-magic" },
];

// Common file property options
const filePropertyOptions = [
  {
    id: "fileName",
    name: "File Name",
    icon: "fas fa-file-signature",
    code: "<% tp.file.title() %>",
  },
  {
    id: "folderPath",
    name: "Folder Path",
    icon: "fas fa-folder",
    code: "<% tp.file.folder() %>",
  },
  {
    id: "creation",
    name: "Creation Date",
    icon: "fas fa-calendar-plus",
    code: '<% tp.file.creation_date("YYYY-MM-DD") %>',
  },
  {
    id: "modified",
    name: "Modified Date",
    icon: "fas fa-calendar-check",
    code: '<% tp.file.last_modified_date("YYYY-MM-DD") %>',
  },
  {
    id: "currentDate",
    name: "Today's Date",
    icon: "fas fa-calendar-day",
    code: '<% tp.date.now("YYYY-MM-DD") %>',
  },
];

// Template presets with clear names
const quickTemplates = [
  {
    id: "basic",
    name: "Basic Note",
    icon: "fas fa-file-alt",
    properties: [
      {
        name: "date",
        type: "fileProperty",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "tags",
        value: [],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
    ],
  },
  {
    id: "project",
    name: "Project Note",
    icon: "fas fa-tasks",
    properties: [
      {
        name: "type",
        type: "text",
        value: "project",
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "status",
        type: "text",
        value: "in-progress",
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "start-date",
        type: "fileProperty",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "tags",
        value: ["project"],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
    ],
  },
  {
    id: "meeting",
    name: "Meeting Note",
    icon: "fas fa-users",
    properties: [
      {
        name: "type",
        type: "text",
        value: "meeting",
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "date",
        type: "fileProperty",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "participants",
        type: "tags",
        value: [],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "tags",
        value: ["meeting"],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
    ],
  },
  {
    id: "book",
    name: "Book Notes",
    icon: "fas fa-book",
    properties: [
      {
        name: "type",
        type: "text",
        value: "literature",
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "title",
        type: "prompt",
        value: "",
        fileProperty: null,
        promptOptions: {
          question: "What is the title of the book?",
          defaultValue: "",
          multiline: false,
        },
      },
      {
        name: "author",
        type: "prompt",
        value: "",
        fileProperty: null,
        promptOptions: {
          question: "Who is the author?",
          defaultValue: "",
          multiline: false,
        },
      },
      {
        name: "date-read",
        type: "fileProperty",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "rating",
        type: "number",
        value: 0,
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "tags",
        value: ["book", "literature"],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
    ],
  },
];

// Module state
const properties = ref<
  Array<{
    name: string;
    type: string;
    value: any;
    fileProperty: string | null;
    promptOptions: {
      question: string;
      defaultValue: string;
      multiline: boolean;
    };
  }>
>([]);

// Input tracking
const tagInputs = ref<Record<number, string>>({});

// Initialize component
onMounted(() => {
  // Parse existing content if it exists
  if (props.module.content.length > 0) {
    parseExistingFrontmatter(props.module.content[0]);
  }
});

// Toggle dropdowns
function toggleFieldDropdown() {
  showFieldDropdown.value = !showFieldDropdown.value;
  if (showFieldDropdown.value) {
    showTemplateDropdown.value = false;
  }
}

function toggleTemplateDropdown() {
  showTemplateDropdown.value = !showTemplateDropdown.value;
  if (showTemplateDropdown.value) {
    showFieldDropdown.value = false;
  }
}

// Apply a template
function applyTemplate(templateId: string) {
  const template = quickTemplates.find((t) => t.id === templateId);
  if (template) {
    // Deep clone the template properties
    properties.value = JSON.parse(JSON.stringify(template.properties));
    updateFrontmatter();
  }
  showTemplateDropdown.value = false;
}

// Add a new property
function addNewProperty(type: string) {
  const newProp = {
    name: "",
    type: type,
    value: getDefaultValueForType(type),
    fileProperty: null,
    promptOptions: {
      question: "",
      defaultValue: "",
      multiline: false,
    },
  };

  properties.value.push(newProp);

  // Initialize tag input if needed
  if (type === "tags") {
    const index = properties.value.length - 1;
    tagInputs.value[index] = "";
  }

  updateFrontmatter();
  showFieldDropdown.value = false;
}

// Get default value based on property type
function getDefaultValueForType(type: string): any {
  switch (type) {
    case "text":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "tags":
      return [];
    case "prompt":
      return "";
    case "fileProperty":
      return "";
    default:
      return "";
  }
}

// Handle property type change
function handleTypeChange(index: number) {
  const prop = properties.value[index];

  // Reset value based on new type
  prop.value = getDefaultValueForType(prop.type);

  // Reset file property if changing from that type
  if (prop.type !== "fileProperty") {
    prop.fileProperty = null;
  }

  // Initialize tag input if needed
  if (prop.type === "tags") {
    tagInputs.value[index] = "";
  }

  updateFrontmatter();
}

// Remove a property
function removeProperty(index: number) {
  properties.value.splice(index, 1);
  updateFrontmatter();
}

// Tag handling
function addTag(propIndex: number) {
  const tagValue = tagInputs.value[propIndex]?.trim();
  if (tagValue && properties.value[propIndex]) {
    if (!Array.isArray(properties.value[propIndex].value)) {
      properties.value[propIndex].value = [];
    }

    // Don't add duplicate tags
    if (!properties.value[propIndex].value.includes(tagValue)) {
      properties.value[propIndex].value.push(tagValue);
    }

    tagInputs.value[propIndex] = "";
    updateFrontmatter();
  }
}

function removeTag(propIndex: number, tagIndex: number) {
  if (
    properties.value[propIndex] &&
    Array.isArray(properties.value[propIndex].value)
  ) {
    properties.value[propIndex].value.splice(tagIndex, 1);
    updateFrontmatter();
  }
}

// File property handling
function openFilePropertySelector(index: number) {
  activeFilePropertyIndex.value = index;
}

function closeFilePropertySelector() {
  activeFilePropertyIndex.value = -1;
}

function selectFileProperty(index: number, propertyCode: string) {
  properties.value[index].fileProperty = propertyCode;
  closeFilePropertySelector();
  updateFrontmatter();
}

function getFilePropertyName(propertyCode: string): string {
  const option = filePropertyOptions.find((opt) => opt.code === propertyCode);
  return option ? option.name : "Dynamic Value";
}

// Generate YAML frontmatter from properties
// Then wrap it in a special container so the custom renderer can identify it
function generateFrontmatter() {
  const frontmatterObj: Record<string, any> = {};

  for (const prop of properties.value) {
    if (!prop.name.trim()) continue;

    // For file property type, use the property code directly
    if (prop.type === "fileProperty" && prop.fileProperty) {
      frontmatterObj[prop.name] = prop.fileProperty;
    }
    // For prompt type, generate tp.system.prompt syntax
    else if (prop.type === "prompt" && prop.promptOptions.question) {
      let promptCode = `<% await tp.system.prompt("${prop.promptOptions.question}"`;

      // Add default value if provided
      if (prop.promptOptions.defaultValue) {
        promptCode += `, "${prop.promptOptions.defaultValue}"`;
      }

      // Add multiline parameter if enabled
      if (prop.promptOptions.multiline) {
        if (!prop.promptOptions.defaultValue) {
          promptCode += ', ""'; // Add empty default if none provided
        }
        promptCode += `, {multi: true}`;
      }

      promptCode += ") %>";
      frontmatterObj[prop.name] = promptCode;
    }
    // For other types, use the value
    else {
      frontmatterObj[prop.name] = prop.value;
    }
  }

  // Generate YAML string
  let yamlString = YAML.stringify(frontmatterObj);

  // Handle special case for Templater tags
  // This replaces the quoted Templater syntax with unquoted syntax
  yamlString = yamlString.replace(/"<%(.*?)%>"/g, "<$1>");

  // Just return the frontmatter without container markers - let the extension handle it
  return `---\n${yamlString}---\n`;
}

// Update frontmatter and emit content
function updateFrontmatter() {
  if (properties.value.length === 0) {
    emit("update:content", []);
    return;
  }

  const frontmatter = generateFrontmatter();
  emit("update:content", [frontmatter]);
}

// Parse existing frontmatter
function parseExistingFrontmatter(content: string) {
  try {
    // Extract YAML content between --- markers
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;

    // Convert Templater syntax to be parseable by YAML
    // This converts unquoted <% ... %> to quoted "<%...%>" for parsing
    let yamlContent = match[1].replace(/<%(.*?)%>/g, '"<%$1%>"');

    const parsed = YAML.parse(yamlContent);

    const newProperties = [];

    for (const [key, value] of Object.entries(parsed)) {
      let propertyType = "text";
      let propertyValue = value;
      let fileProperty = null;
      let promptOptions = {
        question: "",
        defaultValue: "",
        multiline: false,
      };

      // Check for templater tags
      if (typeof value === "string") {
        if (value.includes("tp.file.") || value.includes("tp.date.")) {
          propertyType = "fileProperty";
          fileProperty = value;
          propertyValue = "";
        }
        // Check for prompt syntax
        else if (value.includes("tp.system.prompt")) {
          propertyType = "prompt";

          // Extract question
          const questionMatch = value.match(/tp\.system\.prompt\("([^"]+)"/);
          if (questionMatch) {
            promptOptions.question = questionMatch[1];
          }

          // Extract default value
          const defaultMatch = value.match(
            /tp\.system\.prompt\("[^"]+",\s*"([^"]*)"/
          );
          if (defaultMatch) {
            promptOptions.defaultValue = defaultMatch[1];
          }

          // Check for multiline option
          promptOptions.multiline = value.includes("multi: true");

          propertyValue = "";
        }
      }
      // Determine type based on JavaScript type
      else if (typeof value === "number") {
        propertyType = "number";
      } else if (typeof value === "boolean") {
        propertyType = "boolean";
      } else if (Array.isArray(value)) {
        propertyType = "tags";
      }

      newProperties.push({
        name: key,
        type: propertyType,
        value: propertyValue,
        fileProperty: fileProperty,
        promptOptions: promptOptions,
      });
    }

    properties.value = newProperties;

    // Initialize tag inputs
    properties.value.forEach((prop, index) => {
      if (prop.type === "tags") {
        tagInputs.value[index] = "";
      }
    });
  } catch (error) {
    console.error("Error parsing frontmatter:", error);
  }
}

// Watch for external content changes
watch(
  () => props.module.content,
  (newContent) => {
    if (newContent.length > 0 && properties.value.length === 0) {
      parseExistingFrontmatter(newContent[0]);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.frontmatter {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header styles */
.frontmatter__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.frontmatter__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.frontmatter__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Empty state */
.frontmatter__empty {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 16px;
  background: rgba(15, 23, 42, 0.2);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  text-align: center;
}

.frontmatter__empty-message {
  font-size: 16px;
  color: #94a3b8;
}

/* Action bar */
.frontmatter__action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.frontmatter__dropdown {
  position: relative;
  flex: 1;
}

.frontmatter__add-btn,
.frontmatter__template-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.frontmatter__add-btn {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.frontmatter__add-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

.frontmatter__template-btn {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.frontmatter__template-btn:hover {
  background: rgba(30, 41, 59, 0.7);
}

.frontmatter__dropdown-arrow {
  font-size: 10px;
  opacity: 0.7;
}

.frontmatter__dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  animation: fadeIn 0.2s ease-out;
}

.frontmatter__dropdown-item {
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.15s;
}

.frontmatter__dropdown-item:last-child {
  border-bottom: none;
}

.frontmatter__dropdown-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.frontmatter__dropdown-item i {
  width: 20px;
  color: #60a5fa;
}

/* Properties list */
.frontmatter__properties {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.frontmatter__property {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.3);
}

.frontmatter__property-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.frontmatter__name-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
  font-size: 14px;
}

.frontmatter__type-select {
  width: 140px;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(148, 163, 184, 1)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.frontmatter__delete-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.frontmatter__delete-btn:hover {
  background: rgba(220, 38, 38, 0.2);
}

.frontmatter__property-value {
  padding: 16px;
}

.frontmatter__value-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.frontmatter__input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
}

.frontmatter__label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: -4px;
}

/* Toggle styling */
.frontmatter__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.frontmatter__toggle input {
  display: none;
}

.frontmatter__toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  transition: all 0.3s;
}

.frontmatter__toggle-slider:before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #94a3b8;
  border-radius: 50%;
  transition: all 0.3s;
}

.frontmatter__toggle input:checked + .frontmatter__toggle-slider {
  background: rgba(59, 130, 246, 0.5);
}

.frontmatter__toggle input:checked + .frontmatter__toggle-slider:before {
  left: 22px;
  background: #60a5fa;
}

.frontmatter__toggle-text {
  font-size: 14px;
  color: #94a3b8;
}

.frontmatter__toggle-label {
  font-size: 14px;
  color: #e2e8f0;
}

/* Tag styling */
.frontmatter__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.frontmatter__tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 4px;
  font-size: 13px;
}

.frontmatter__tag-remove {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 10px;
}

.frontmatter__tag-input {
  display: flex;
  gap: 8px;
}

.frontmatter__tag-add {
  padding: 0 12px;
  height: 36px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #60a5fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Prompt styling */
.frontmatter__prompt-field {
  margin-bottom: 12px;
}

.frontmatter__prompt-option {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.frontmatter__prompt-preview {
  margin-top: 8px;
  padding: 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: #60a5fa;
}

/* File property styling */
.frontmatter__file-property-btn {
  width: 100%;
  padding: 10px 14px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #60a5fa;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.frontmatter__file-property-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.frontmatter__file-property-preview {
  margin-top: 10px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.2);
  border-radius: 6px;
  font-size: 13px;
}

.frontmatter__preview-label {
  color: #94a3b8;
  margin-bottom: 6px;
}

.frontmatter__preview-code {
  font-family: monospace;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 4px;
  color: #60a5fa;
  font-size: 12px;
  word-break: break-all;
}

.frontmatter__file-property-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  max-width: 90vw;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 20;
  animation: fadeIn 0.2s ease-out;
}

.frontmatter__file-property-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
}

.frontmatter__close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.frontmatter__close-btn:hover {
  color: #e2e8f0;
}

.frontmatter__file-property-options {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.frontmatter__file-property-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.frontmatter__file-property-option:hover {
  background: rgba(59, 130, 246, 0.1);
}

.frontmatter__file-property-option i {
  width: 20px;
  text-align: center;
  color: #60a5fa;
}

/* Add Property Button */
.frontmatter__add-property {
  margin-top: 8px;
  padding: 10px 16px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #60a5fa;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.frontmatter__add-property:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Animations */
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

/* Responsive styles */
@media (max-width: 768px) {
  .frontmatter__action-bar {
    flex-direction: column;
  }

  .frontmatter__property-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .frontmatter__delete-btn {
    align-self: flex-end;
  }

  .frontmatter__file-property-selector {
    width: 90vw;
  }
}
</style>

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
    <div class="obsidian-properties">
      <!-- Empty State -->
      <div class="properties-empty" v-if="properties.length === 0">
        <div class="properties-empty__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-tags"
          >
            <path
              d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"
            />
            <path d="M6 9.01V9" />
            <path d="m15 5 6.3 6.3a2.69 2.69 0 0 1 0 3.79L18 18.31" />
            <path d="M17 11.99V12" />
          </svg>
        </div>
        <div class="properties-empty__message">
          Add properties like tags, dates, or status to organize this note.
        </div>
        <div class="properties-actions">
          <button
            class="properties-add-button properties-add-button--primary"
            @click="addNewProperty('text')"
          >
            <i class="fas fa-plus"></i> Add Property
          </button>
          <button
            class="properties-template-button"
            @click="toggleTemplateDropdown"
          >
            <i class="fas fa-layer-group"></i> Use Template
            <i
              :class="[
                'fas',
                showTemplateDropdown ? 'fa-chevron-up' : 'fa-chevron-down',
                'properties-dropdown-arrow',
              ]"
            ></i>
          </button>
          <div
            class="properties-dropdown-menu properties-dropdown-menu--template"
            v-if="showTemplateDropdown"
          >
            <button
              v-for="template in quickTemplates"
              :key="template.id"
              class="properties-dropdown-item"
              @click="applyTemplate(template.id)"
            >
              <i :class="template.icon"></i>
              <span>{{ template.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Properties List -->
      <div class="properties-list" v-else>
        <!-- Action Bar when properties exist -->
        <div class="properties-actions properties-actions--existing">
          <div class="properties-add-dropdown">
            <button class="properties-add-button" @click="toggleAddDropdown">
              <i class="fas fa-plus"></i> Add Property
              <i
                :class="[
                  'fas',
                  showAddDropdown ? 'fa-chevron-up' : 'fa-chevron-down',
                  'properties-dropdown-arrow',
                ]"
              ></i>
            </button>
            <div
              class="properties-dropdown-menu properties-dropdown-menu--add"
              v-if="showAddDropdown"
            >
              <button
                v-for="type in propertyTypes"
                :key="type.id"
                class="properties-dropdown-item"
                @click="addNewProperty(type.id)"
              >
                <i :class="type.icon"></i>
                <span>{{ type.name }}</span>
              </button>
            </div>
          </div>

          <div class="properties-template-dropdown">
            <button
              class="properties-template-button"
              @click="toggleTemplateDropdown"
            >
              <i class="fas fa-layer-group"></i> Templates
              <i
                :class="[
                  'fas',
                  showTemplateDropdown ? 'fa-chevron-up' : 'fa-chevron-down',
                  'properties-dropdown-arrow',
                ]"
              ></i>
            </button>
            <div
              class="properties-dropdown-menu properties-dropdown-menu--template"
              v-if="showTemplateDropdown"
            >
              <button
                v-for="template in quickTemplates"
                :key="template.id"
                class="properties-dropdown-item"
                @click="applyTemplate(template.id)"
              >
                <i :class="template.icon"></i>
                <span>{{ template.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Property Rows -->
        <div
          v-for="(property, index) in properties"
          :key="index"
          class="property-row"
        >
          <!-- Type Selector/Icon -->
          <div class="property-type-selector">
            <button
              @click="toggleTypeDropdown(index)"
              class="property-type-button"
            >
              <i :class="getPropertyTypeInfo(property.type).icon"></i>
            </button>
            <div
              class="properties-dropdown-menu property-type-dropdown"
              v-if="activeTypeDropdown === index"
            >
              <button
                v-for="type in propertyTypes"
                :key="type.id"
                class="properties-dropdown-item"
                @click="changePropertyType(index, type.id)"
              >
                <i :class="type.icon"></i>
                <span>{{ type.name }}</span>
              </button>
            </div>
          </div>

          <!-- Property Name -->
          <input
            type="text"
            v-model="property.name"
            class="property-name-input"
            placeholder="Property name"
            @input="debounceUpdate"
            @blur="updateFrontmatter"
          />

          <!-- Property Value (Dynamic Component) -->
          <div class="property-value-cell">
            <!-- Text Input -->
            <input
              v-if="property.type === 'text'"
              type="text"
              v-model="property.value"
              class="property-value-input property-value-input--text"
              placeholder="Text value"
              @input="debounceUpdate"
              @blur="updateFrontmatter"
            />

            <!-- Number Input -->
            <input
              v-if="property.type === 'number'"
              type="number"
              v-model.number="property.value"
              class="property-value-input property-value-input--number"
              placeholder="0"
              @input="debounceUpdate"
              @blur="updateFrontmatter"
            />

            <!-- Checkbox (Boolean) Input -->
            <div
              v-if="property.type === 'checkbox' || property.type === 'boolean'"
              class="property-value-input--checkbox"
            >
              <input
                type="checkbox"
                :id="'prop-checkbox-' + index"
                v-model="property.value"
                @change="updateFrontmatter"
              />
              <label
                :for="'prop-checkbox-' + index"
                class="checkbox-custom-label"
              ></label>
            </div>

            <!-- Date Input -->
            <input
              v-if="property.type === 'date'"
              type="date"
              v-model="property.value"
              class="property-value-input property-value-input--date"
              @input="debounceUpdate"
              @change="updateFrontmatter"
            />

            <!-- DateTime Input -->
            <input
              v-if="property.type === 'datetime'"
              type="datetime-local"
              v-model="property.value"
              class="property-value-input property-value-input--datetime"
              @input="debounceUpdate"
              @change="updateFrontmatter"
            />

            <!-- isRecurring Checkbox -->
            <div
              v-if="property.type === 'isRecurring'"
              class="property-value-input--checkbox property-value-input--recurring"
            >
              <input
                type="checkbox"
                :id="'prop-recurring-' + index"
                v-model="property.value"
                @change="updateFrontmatter"
              />
              <label
                :for="'prop-recurring-' + index"
                class="checkbox-custom-label"
              >
                <span v-if="property.value" class="recurring-indicator">
                  <i class="fas fa-redo-alt"></i>
                </span>
              </label>
              <span class="recurring-label">Recurring task</span>
            </div>

            <!-- List (Tags) Input -->
            <div
              v-if="property.type === 'list' || property.type === 'tags'"
              class="property-value-input--list"
            >
              <div class="property-tags">
                <span
                  v-for="(tag, tagIndex) in property.value"
                  :key="tagIndex"
                  class="property-tag"
                >
                  {{ tag }}
                  <button
                    @click="removeTag(index, tagIndex)"
                    class="property-tag-remove"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </div>
              <input
                type="text"
                v-model="tagInputs[index]"
                class="property-tag-entry-input"
                placeholder="Add item..."
                @keydown.enter.prevent="addTag(index)"
                @blur="addTagOnBlur(index)"
              />
            </div>

            <!-- Templater Prompt -->
            <div
              v-if="property.type === 'prompt'"
              class="property-value-input--prompt"
            >
              <div class="prompt-editor">
                <div class="prompt-field">
                  <label>Question to ask:</label>
                  <input
                    type="text"
                    v-model="property.promptOptions.question"
                    placeholder="e.g., What is the title?"
                    class="prompt-input"
                    @input="debounceUpdate"
                  />
                </div>
                <div class="prompt-field">
                  <label>Default answer:</label>
                  <input
                    type="text"
                    v-model="property.promptOptions.defaultValue"
                    placeholder="Optional default value"
                    class="prompt-input"
                    @input="debounceUpdate"
                  />
                </div>
                <div class="prompt-checkbox">
                  <input
                    type="checkbox"
                    :id="'multiline-' + index"
                    v-model="property.promptOptions.multiline"
                    @change="updateFrontmatter"
                  />
                  <label :for="'multiline-' + index"
                    >Allow multiple lines</label
                  >
                </div>
              </div>
            </div>

            <!-- Templater File Info -->
            <div
              v-if="
                property.type === 'fileInfo' || property.type === 'fileProperty'
              "
              class="property-value-input--fileinfo"
            >
              <div class="fileinfo-selector">
                <select
                  v-model="property.fileProperty"
                  class="fileinfo-select"
                  @change="updateFrontmatter"
                >
                  <option value="" disabled>Select file information...</option>
                  <option
                    v-for="option in filePropertyOptions"
                    :key="option.id"
                    :value="option.code"
                  >
                    {{ option.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Delete Button -->
          <button class="property-delete-button" @click="removeProperty(index)">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
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
const showAddDropdown = ref(false);
const showTemplateDropdown = ref(false);
const activeTypeDropdown = ref<number | null>(null);
let updateTimeout: ReturnType<typeof setTimeout> | null = null;

// Property Types with human-friendly names and icons
const propertyTypes = [
  { id: "text", name: "Text", icon: "fas fa-font" },
  { id: "list", name: "List / Tags", icon: "fas fa-tags" }, // "tags" in the original, "list" in UI
  { id: "number", name: "Number", icon: "fas fa-hashtag" },
  { id: "checkbox", name: "Checkbox", icon: "far fa-check-square" }, // "boolean" in the original, "checkbox" in UI
  { id: "date", name: "Date", icon: "fas fa-calendar-alt" },
  { id: "datetime", name: "Date & Time", icon: "fas fa-clock" },
  { id: "isRecurring", name: "Recurring Task", icon: "fas fa-redo-alt" },
  { id: "prompt", name: "Ask a Question", icon: "fas fa-terminal" },
  { id: "fileInfo", name: "Dynamic Value", icon: "fas fa-cogs" }, // "fileProperty" in the original, "fileInfo" in UI
];

// Get property type info by ID
function getPropertyTypeInfo(typeId: string) {
  // Map old type names to new UI type names
  const typeMap: Record<string, string> = {
    tags: "list",
    boolean: "checkbox",
    fileProperty: "fileInfo",
  };

  // Convert old type to new UI type if needed
  const uiTypeId = typeMap[typeId] || typeId;

  return propertyTypes.find((t) => t.id === uiTypeId) || propertyTypes[0]; // Default to text
}

// Common file property options
const filePropertyOptions = [
  {
    id: "fileName",
    name: "File Name",
    icon: "fas fa-file-signature",
    code: "<% tp.file.title %>",
  },
  {
    id: "folderPath",
    name: "Folder Path",
    icon: "fas fa-folder",
    code: "<% tp.file.folder %>",
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
  {
    id: "currentTime",
    name: "Current Time",
    icon: "fas fa-clock",
    code: '<% tp.date.now("HH:mm") %>',
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
  initializeTagInputs();

  // Set up click handler to close dropdowns when clicking outside
  document.addEventListener("click", handleOutsideClick);
});

// Clean up event listeners
onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});

// Handle clicks outside the component
function handleOutsideClick(e: Event) {
  const target = e.target as HTMLElement;
  if (baseModuleRef.value && !baseModuleRef.value.$el.contains(target)) {
    // Close all dropdowns if clicking outside
    closeDropdowns();
  }
}

// Helper functions
function truncate(str: string, len: number) {
  return str.length > len ? str.substring(0, len) + "..." : str;
}

// Toggle dropdowns
function toggleAddDropdown() {
  closeDropdowns();
  showAddDropdown.value = !showAddDropdown.value;
}

function toggleTemplateDropdown() {
  closeDropdowns();
  showTemplateDropdown.value = !showTemplateDropdown.value;
}

function toggleTypeDropdown(index: number) {
  closeDropdowns();
  activeTypeDropdown.value = activeTypeDropdown.value === index ? null : index;
}

function closeDropdowns() {
  activeTypeDropdown.value = null;
  showAddDropdown.value = false;
  showTemplateDropdown.value = false;
}

// Apply a template
function applyTemplate(templateId: string) {
  const template = quickTemplates.find((t) => t.id === templateId);
  if (template) {
    // Deep clone the template properties
    properties.value = JSON.parse(JSON.stringify(template.properties));
    initializeTagInputs();
    updateFrontmatter();
  }
  showTemplateDropdown.value = false;
}

// Add a new property
function addNewProperty(type: string) {
  // Map UI type to data type if needed
  const dataTypeMap: Record<string, string> = {
    list: "tags",
    checkbox: "boolean",
    fileInfo: "fileProperty",
  };

  const dataType = dataTypeMap[type] || type;

  const newProp = {
    name: "",
    type: dataType, // Use the data type for storage
    value: getDefaultValueForType(dataType),
    fileProperty: null,
    promptOptions: {
      question: "",
      defaultValue: "",
      multiline: false,
    },
  };

  properties.value.push(newProp);
  initializeTagInputs(); // Ensure tag input state exists

  // Focus the new property's name input
  nextTick(() => {
    const rows = baseModuleRef.value?.$el.querySelectorAll(".property-row");
    if (rows && rows.length > 0) {
      const newRow = rows[rows.length - 1];
      const nameInput = newRow.querySelector(
        ".property-name-input"
      ) as HTMLInputElement;
      nameInput?.focus();
    }
  });

  updateFrontmatter();
  showAddDropdown.value = false; // Close dropdown after adding
}

// Get default value based on property type
function getDefaultValueForType(type: string): any {
  switch (type) {
    case "text":
      return "";
    case "tags":
    case "list":
      return [];
    case "number":
      return 0;
    case "boolean":
    case "checkbox":
      return false;
    case "date":
      return formatDate(new Date()); // Current date in YYYY-MM-DD
    case "datetime":
      return formatDateTime(new Date()); // Current date-time in YYYY-MM-DDTHH:MM
    case "isRecurring":
      return false;
    case "prompt":
      return "";
    case "fileProperty":
    case "fileInfo":
      return "";
    default:
      return "";
  }
}

// Helper functions for date formatting
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)}T${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Handle property type change
function changePropertyType(index: number, newType: string) {
  // Map UI type to data type if needed
  const dataTypeMap: Record<string, string> = {
    list: "tags",
    checkbox: "boolean",
    fileInfo: "fileProperty",
  };

  // Some types don't need mapping (keep as is)
  const skipMapping = ["date", "datetime", "isRecurring"];

  const dataType = skipMapping.includes(newType)
    ? newType
    : dataTypeMap[newType] || newType;

  const prop = properties.value[index];
  if (prop.type === dataType) {
    activeTypeDropdown.value = null;
    return; // No change
  }

  prop.type = dataType;
  prop.value = getDefaultValueForType(dataType);

  // Reset specific fields if type changes away from them
  if (dataType !== "fileProperty") prop.fileProperty = null;
  if (dataType !== "prompt")
    prop.promptOptions = { question: "", defaultValue: "", multiline: false };

  initializeTagInputs(); // Re-init in case it changed to/from list
  updateFrontmatter();
  activeTypeDropdown.value = null; // Close dropdown
}

// Remove a property
function removeProperty(index: number) {
  properties.value.splice(index, 1);
  initializeTagInputs(); // Recalculate tag inputs
  updateFrontmatter();
}

// Debounce update to avoid excessive YAML generation on every keypress
function debounceUpdate() {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updateFrontmatter();
  }, 500); // 500ms delay
}

// Tag handling
function initializeTagInputs() {
  const newTagInputs: Record<number, string> = {};
  properties.value.forEach((prop, index) => {
    if (prop.type === "tags") {
      newTagInputs[index] = tagInputs.value[index] || ""; // Preserve existing input if possible
    }
  });
  tagInputs.value = newTagInputs;
}

function addTag(propIndex: number) {
  const tagValue = tagInputs.value[propIndex]?.trim();
  const prop = properties.value[propIndex];

  if (tagValue && prop && (prop.type === "tags" || prop.type === "list")) {
    // Ensure value is an array
    if (!Array.isArray(prop.value)) {
      prop.value = [];
    }
    // Add if not already present
    if (!prop.value.includes(tagValue)) {
      prop.value.push(tagValue);
      updateFrontmatter();
    }
    // Clear input
    tagInputs.value[propIndex] = "";
  }
}

function addTagOnBlur(propIndex: number) {
  // Add the tag if there's text in the input when blurring
  const tagValue = tagInputs.value[propIndex]?.trim();
  if (tagValue) {
    addTag(propIndex);
  }
}

function removeTag(propIndex: number, tagIndex: number) {
  const prop = properties.value[propIndex];
  if (
    prop &&
    (prop.type === "tags" || prop.type === "list") &&
    Array.isArray(prop.value)
  ) {
    prop.value.splice(tagIndex, 1);
    updateFrontmatter();
  }
}

// Generate YAML frontmatter from properties
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
        // Check for date format
        else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          propertyType = "date";
        }
        // Check for datetime format
        else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) {
          propertyType = "datetime";
        }
      }
      // Determine type based on JavaScript type
      else if (typeof value === "number") {
        propertyType = "number";
      } else if (typeof value === "boolean") {
        // Check for special boolean property names
        if (key === "isRecurring") {
          propertyType = "isRecurring";
        } else {
          propertyType = "boolean";
        }
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
    initializeTagInputs();
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
/* Base & Layout */
.obsidian-properties {
  width: 100%;
  background: var(--background-secondary, #2f333a);
  border: 1px solid var(--background-modifier-border, #3f444b);
  border-radius: 8px;
  padding: 16px;
  color: var(--text-normal, #e2e8f0);
  font-family: var(--font-interface, sans-serif);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-row {
  display: grid;
  grid-template-columns: [type] 30px [name] 1fr [value] 1.5fr [delete] 30px;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  border-radius: 4px;
  transition: background-color 0.15s ease-in-out;
}

.property-row:hover {
  background-color: var(--background-secondary-alt, #3a3e44);
}

/* Empty State */
.properties-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 20px;
  text-align: center;
  color: var(--text-muted, #94a3b8);
}

.properties-empty__icon {
  font-size: 32px;
  color: var(--text-faint, #64748b);
}

.properties-empty__icon svg {
  stroke-width: 1.5px;
}

.properties-empty__message {
  font-size: 15px;
  max-width: 300px;
  line-height: 1.5;
}

/* Actions (Buttons & Dropdowns) */
.properties-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
  position: relative;
}

.properties-actions--existing {
  justify-content: flex-start;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--background-modifier-border, #3f444b);
}

.properties-add-button,
.properties-template-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  border: 1px solid var(--background-modifier-border, #3f444b);
  background-color: var(--background-primary, #282c34);
  color: var(--text-muted, #94a3b8);
}

.properties-add-button:hover,
.properties-template-button:hover {
  background-color: var(--background-secondary, #2f333a);
  border-color: var(--interactive-accent-hover, #5c8df6);
  color: var(--text-normal, #e2e8f0);
}

.properties-add-button i,
.properties-template-button i {
  font-size: 12px;
}

.properties-add-button--primary {
  background-color: var(--interactive-accent, #4a7de7);
  border-color: var(--interactive-accent, #4a7de7);
  color: white;
}

.properties-add-button--primary:hover {
  background-color: var(--interactive-accent-hover, #5c8df6);
  border-color: var(--interactive-accent-hover, #5c8df6);
}

.properties-dropdown-arrow {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 4px;
}

/* Dropdown Menus */
.properties-add-dropdown,
.properties-template-dropdown,
.property-type-selector {
  position: relative;
}

.properties-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: var(--background-secondary-alt, #3a3e44);
  border: 1px solid var(--background-modifier-border-hover, #4a4f56);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 100;
  padding: 4px;
  max-height: 300px;
  overflow-y: auto;
  animation: fadeIn 0.15s ease-out forwards;
}

.property-type-dropdown {
  left: -4px;
  min-width: 180px;
}

.properties-dropdown-menu--template {
  left: auto;
  right: 0;
}

.properties-dropdown-item {
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text-normal, #e2e8f0);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.properties-dropdown-item:hover {
  background-color: var(--background-modifier-hover, #4a4f56);
}

.properties-dropdown-item i {
  width: 16px;
  text-align: center;
  color: var(--text-muted, #94a3b8);
  font-size: 12px;
}

.properties-dropdown-item:hover i {
  color: var(--interactive-accent, #4a7de7);
}

/* Property Row Elements */

/* Type Selector */
.property-type-button {
  grid-column: type;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.property-type-button:hover {
  background-color: var(--background-modifier-hover, #4a4f56);
  color: var(--text-normal, #e2e8f0);
}

.property-type-button i {
  font-size: 14px;
}

/* Name Input */
.property-name-input {
  grid-column: name;
  background: transparent;
  border: none;
  padding: 6px 8px;
  color: var(--text-normal, #e2e8f0);
  font-size: 14px;
  border-radius: 4px;
  width: 100%;
  transition: background-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.property-name-input:focus {
  background-color: var(--background-primary, #282c34);
  box-shadow: 0 0 0 1px var(--interactive-accent, #4a7de7);
}

.property-name-input::placeholder {
  color: var(--text-faint, #64748b);
  font-style: italic;
}

/* Value Cell & Inputs */
.property-value-cell {
  grid-column: value;
  display: flex;
  align-items: center;
}

.property-value-input,
.property-value-input--checkbox,
.property-value-input--list,
.property-value-input--prompt,
.property-value-input--fileinfo {
  width: 100%;
}

.property-value-input {
  background: transparent;
  border: none;
  padding: 6px 8px;
  color: var(--text-normal, #e2e8f0);
  font-size: 14px;
  border-radius: 4px;
  transition: background-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.property-value-input:focus {
  background-color: var(--background-primary, #282c34);
  box-shadow: 0 0 0 1px var(--interactive-accent, #4a7de7);
}

.property-value-input::placeholder {
  color: var(--text-faint, #64748b);
  font-style: italic;
}

/* Date and DateTime inputs */
.property-value-input--date,
.property-value-input--datetime {
  cursor: pointer;
  padding-right: 28px;
  min-width: 140px;
  background-color: var(--background-primary, #282c34);
  border: 1px solid var(--background-modifier-border, #3f444b);
}

.property-value-input--date::-webkit-calendar-picker-indicator,
.property-value-input--datetime::-webkit-calendar-picker-indicator {
  opacity: 0.6;
  cursor: pointer;
  filter: invert(0.7);
}

.property-value-input--date:hover::-webkit-calendar-picker-indicator,
.property-value-input--datetime:hover::-webkit-calendar-picker-indicator {
  opacity: 1;
}

/* Checkbox */
.property-value-input--checkbox {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 28px;
  padding: 0 8px;
  position: relative;
}

.property-value-input--checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid var(--text-faint, #64748b);
  border-radius: 3px;
  background-color: var(--background-primary, #282c34);
  cursor: pointer;
  position: relative;
  transition: background-color 0.15s, border-color 0.15s;
  margin: 0;
  z-index: 1;
}

.property-value-input--checkbox input[type="checkbox"]:checked {
  background-color: var(--interactive-accent, #4a7de7);
  border-color: var(--interactive-accent, #4a7de7);
}

.property-value-input--checkbox input[type="checkbox"]:checked::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.property-value-input--checkbox .checkbox-custom-label {
  position: absolute;
  left: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* isRecurring checkbox styling */
.property-value-input--recurring {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recurring-indicator {
  color: var(--interactive-accent, #4a7de7);
  font-size: 12px;
  animation: spin 4s linear infinite;
  display: inline-block;
}

.recurring-label {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
  margin-left: 4px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* List / Tags */
.property-value-input--list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  min-height: 28px;
}

.property-tags {
  display: contents;
}

.property-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--background-modifier-hover, #4a4f56);
  border-radius: 10px;
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  white-space: nowrap;
}

.property-tag-remove {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: none;
  color: var(--text-faint, #64748b);
  cursor: pointer;
  font-size: 8px;
  transition: background-color 0.15s, color 0.15s;
}

.property-tag-remove:hover {
  background: var(--background-modifier-error, #da5858);
  color: white;
}

.property-tag-entry-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  padding: 4px 0;
  color: var(--text-normal, #e2e8f0);
  font-size: 14px;
  outline: none;
  min-width: 80px;
}

.property-tag-entry-input::placeholder {
  color: var(--text-faint, #64748b);
}

/* Prompt Editor */
.prompt-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--background-primary, #282c34);
  border: 1px solid var(--background-modifier-border, #3f444b);
  border-radius: 6px;
  padding: 8px;
  width: 100%;
}

.prompt-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prompt-field label {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  font-weight: 500;
}

.prompt-input {
  background: var(--background-secondary, #2f333a);
  border: 1px solid var(--background-modifier-border, #3f444b);
  border-radius: 4px;
  padding: 6px 8px;
  color: var(--text-normal, #e2e8f0);
  font-size: 13px;
  width: 100%;
}

.prompt-input:focus {
  border-color: var(--interactive-accent, #4a7de7);
  outline: none;
}

.prompt-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.prompt-checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--text-faint, #64748b);
  border-radius: 3px;
  background-color: var(--background-secondary, #2f333a);
  cursor: pointer;
  position: relative;
  margin: 0;
}

.prompt-checkbox input[type="checkbox"]:checked {
  background-color: var(--interactive-accent, #4a7de7);
  border-color: var(--interactive-accent, #4a7de7);
}

.prompt-checkbox input[type="checkbox"]:checked::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.prompt-checkbox label {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
}

/* File Info Selector */
.fileinfo-selector {
  width: 100%;
}

.fileinfo-select {
  width: 100%;
  background: var(--background-primary, #282c34);
  border: 1px solid var(--background-modifier-border, #3f444b);
  border-radius: 4px;
  padding: 6px 8px;
  color: var(--text-normal, #e2e8f0);
  font-size: 13px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(148, 163, 184, 1)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  cursor: pointer;
}

.fileinfo-select:focus {
  border-color: var(--interactive-accent, #4a7de7);
  outline: none;
}

/* Delete Button */
.property-delete-button {
  grid-column: delete;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: var(--text-faint, #64748b);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, background-color 0.15s;
}

.property-row:hover .property-delete-button {
  opacity: 1;
}

.property-delete-button:hover {
  color: var(--text-error, #e57373);
  background-color: var(
    --background-modifier-error-hover,
    rgba(218, 88, 88, 0.2)
  );
}

.property-delete-button i {
  font-size: 14px;
}

/* Animations */
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

/* Focus Ring */
*:focus-visible {
  outline: 2px solid var(--interactive-accent, #4a7de7);
  outline-offset: 1px;
  box-shadow: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .property-row {
    grid-template-columns: [type] 30px [name] 1fr [delete] 30px;
    grid-template-rows: auto auto;
  }

  .property-name-input {
    grid-column: name;
    grid-row: 1;
  }

  .property-value-cell {
    grid-column: type / delete;
    grid-row: 2;
    margin-left: 30px;
  }

  .property-type-button {
    grid-row: 1;
  }

  .property-delete-button {
    grid-row: 1;
  }
}
</style>

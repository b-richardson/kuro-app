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
    <div class="fm-container">
      <!-- Empty State -->
      <div class="fm-empty" v-if="properties.length === 0">
        <div class="fm-empty-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF5733"
            stroke-width="1.5"
            class="fm-empty-icon"
          >
            <path
              d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"
            />
            <path d="M6 9.01V9" />
            <path d="m15 5 6.3 6.3a2.69 2.69 0 0 1 0 3.79L18 18.31" />
            <path d="M17 11.99V12" />
          </svg>
          <h2 class="fm-empty-title">Add Frontmatter</h2>
          <p class="fm-empty-description">
            Organize your note with properties like tags or dates. Try a quick
            start!
          </p>
          <div class="fm-empty-actions">
            <button
              class="fm-button fm-button--primary"
              @click="startAddingProperty('text')"
            >
              <i class="fas fa-plus"></i> Add Property
            </button>
            <button
              class="fm-button fm-button--secondary"
              @click="showTemplateModal = true"
            >
              <i class="fas fa-layer-group"></i> Templates
            </button>
          </div>
          <div class="fm-empty-suggestions">
            <span>Suggestions:</span>
            <button
              v-for="suggestion in propertySuggestions"
              :key="suggestion.type"
              class="fm-suggestion"
              @click="startAddingProperty(suggestion.type)"
            >
              <i :class="['fas', suggestion.icon]"></i>
              {{ suggestion.name }}
            </button>
          </div>
          <span class="fm-privacy-badge">Local Data</span>
        </div>
      </div>

      <!-- Property Panel -->
      <div class="fm-panel" v-else>
        <!-- Property List -->
        <div class="fm-property-list">
          <div class="fm-list-header">
            <h3>Properties</h3>
            <button
              class="fm-button fm-button--primary fm-button--small"
              @click="startAddingProperty('text')"
            >
              <i class="fas fa-plus"></i> Add
            </button>
          </div>
          <div class="fm-list-content">
            <div
              v-for="(property, index) in properties"
              :key="index"
              class="fm-property-row"
              :class="{ 'fm-property-row--error': validationErrors[index] }"
            >
              <input
                type="text"
                v-model="property.name"
                class="fm-input fm-input--name"
                placeholder="e.g., tags"
                @input="validateName(index)"
                @blur="updateFrontmatter"
                :aria-label="'Name for property ' + (index + 1)"
                :aria-invalid="!!validationErrors[index]?.name"
                :aria-describedby="'name-error-' + index"
              />
              <button
                class="fm-type-button"
                @click="startEditingType(index)"
                :aria-label="'Change type for ' + (property.name || 'property')"
              >
                <i
                  :class="['fas', getPropertyTypeInfo(property.type).icon]"
                ></i>
                {{ getPropertyTypeInfo(property.type).name }}
              </button>
              <div class="fm-value-wrapper">
                <!-- Text -->
                <input
                  v-if="property.type === 'text'"
                  type="text"
                  v-model="property.value"
                  class="fm-input fm-input--value"
                  placeholder="Enter text"
                  @input="debounceUpdate"
                  @blur="updateFrontmatter"
                  :aria-label="
                    'Value for ' + (property.name || 'text property')
                  "
                />

                <!-- Number -->
                <input
                  v-if="property.type === 'number'"
                  type="number"
                  v-model.number="property.value"
                  class="fm-input fm-input--value fm-input--number"
                  placeholder="0"
                  @input="debounceUpdate"
                  @blur="updateFrontmatter"
                  :aria-label="
                    'Value for ' + (property.name || 'number property')
                  "
                />

                <!-- Checkbox -->
                <label
                  v-if="property.type === 'checkbox'"
                  class="fm-toggle"
                  :aria-label="
                    'Toggle for ' + (property.name || 'checkbox property')
                  "
                >
                  <input
                    type="checkbox"
                    v-model="property.value"
                    @change="updateFrontmatter"
                  />
                  <span class="fm-toggle-slider"></span>
                </label>

                <!-- Date -->
                <input
                  v-if="property.type === 'date'"
                  type="date"
                  v-model="property.value"
                  class="fm-input fm-input--value fm-input--date"
                  @input="debounceUpdate"
                  @change="updateFrontmatter"
                  :aria-label="'Date for ' + (property.name || 'date property')"
                />

                <!-- Datetime -->
                <input
                  v-if="property.type === 'datetime'"
                  type="datetime-local"
                  v-model="property.value"
                  class="fm-input fm-input--value fm-input--datetime"
                  @input="debounceUpdate"
                  @change="updateFrontmatter"
                  :aria-label="
                    'Date and time for ' +
                    (property.name || 'datetime property')
                  "
                />

                <!-- Recurring Task -->
                <label
                  v-if="property.type === 'isRecurring'"
                  class="fm-toggle fm-toggle--recurring"
                  :aria-label="
                    'Recurring task for ' +
                    (property.name || 'recurring property')
                  "
                >
                  <input
                    type="checkbox"
                    v-model="property.value"
                    @change="updateFrontmatter"
                  />
                  <span class="fm-toggle-slider">
                    <i
                      v-if="property.value"
                      class="fas fa-redo-alt fm-recurring-icon"
                    ></i>
                  </span>
                </label>

                <!-- List/Tags -->
                <div v-if="property.type === 'list'" class="fm-tags">
                  <span
                    v-for="(tag, tagIndex) in property.value"
                    :key="tagIndex"
                    class="fm-tag"
                  >
                    {{ tag }}
                    <button
                      @click="removeTag(index, tagIndex)"
                      class="fm-tag-remove"
                      :aria-label="'Remove tag ' + tag"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                  <input
                    type="text"
                    v-model="tagInputs[index]"
                    class="fm-input fm-input--tag"
                    placeholder="Add tag"
                    @keydown.enter.prevent="addTag(index)"
                    @blur="addTagOnBlur(index)"
                    :aria-label="
                      'Add tag for ' + (property.name || 'list property')
                    "
                    list="suggested-tags"
                  />
                  <datalist id="suggested-tags">
                    <option
                      v-for="tag in suggestedTags"
                      :key="tag"
                      :value="tag"
                    ></option>
                  </datalist>
                </div>

                <!-- Templater Prompt -->
                <div
                  v-if="property.type === 'prompt'"
                  class="fm-prompt-details"
                >
                  <input
                    type="text"
                    v-model="property.promptOptions.question"
                    class="fm-input fm-input--value"
                    placeholder="e.g., What's the note title?"
                    @input="debounceUpdate"
                    @blur="updateFrontmatter"
                    :aria-label="
                      'Prompt question for ' +
                      (property.name || 'prompt property')
                    "
                  />
                  <input
                    type="text"
                    v-model="property.promptOptions.defaultValue"
                    class="fm-input fm-input--value"
                    placeholder="Default answer"
                    @input="debounceUpdate"
                    @blur="updateFrontmatter"
                    :aria-label="
                      'Default answer for ' +
                      (property.name || 'prompt property')
                    "
                  />
                  <label class="fm-toggle fm-toggle--prompt">
                    <input
                      type="checkbox"
                      v-model="property.promptOptions.multiline"
                      @change="updateFrontmatter"
                    />
                    <span class="fm-toggle-slider"></span>
                    Multiline
                  </label>
                </div>

                <!-- File Info -->
                <select
                  v-if="property.type === 'fileInfo'"
                  v-model="property.fileProperty"
                  class="fm-input fm-input--value fm-select"
                  @change="updateFrontmatter"
                  :aria-label="
                    'File information for ' +
                    (property.name || 'file info property')
                  "
                >
                  <option value="" disabled>Select...</option>
                  <option
                    v-for="option in filePropertyOptions"
                    :key="option.id"
                    :value="option.code"
                  >
                    {{ option.name }}
                  </option>
                </select>
              </div>
              <button
                class="fm-action-button fm-action-button--delete"
                @click="removeProperty(index)"
                :aria-label="'Delete ' + (property.name || 'property')"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
              <div
                v-if="validationErrors[index]?.name"
                class="fm-error-message"
                :id="'name-error-' + index"
              >
                {{ validationErrors[index].name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="fm-actions">
          <button
            class="fm-button fm-button--secondary"
            @click="showTemplateModal = true"
          >
            <i class="fas fa-layer-group"></i> Templates
          </button>
          <button
            class="fm-button fm-button--destructive"
            @click="confirmClearAll"
          >
            <i class="fas fa-trash-alt"></i> Clear All
          </button>
        </div>
      </div>

      <!-- Type Selection Modal -->
      <div
        v-if="showTypeModal"
        class="fm-type-modal-overlay"
        @click="showTypeModal = false"
      >
        <div class="fm-type-modal" @click.stop>
          <div class="fm-type-modal-header">
            <h3>Select Property Type</h3>
            <button
              class="fm-close-button"
              @click="showTypeModal = false"
              aria-label="Close type modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="fm-type-modal-content">
            <button
              v-for="type in propertyTypes"
              :key="type.id"
              class="fm-type-option"
              @click="selectType(type.id)"
            >
              <i :class="['fas', type.icon]"></i>
              <span class="fm-type-name">{{ type.name }}</span>
              <span class="fm-type-description">{{ type.description }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Template Modal -->
      <div
        v-if="showTemplateModal"
        class="fm-template-modal-overlay"
        @click="showTemplateModal = false"
      >
        <div class="fm-template-modal" @click.stop>
          <div class="fm-template-modal-header">
            <h3>Quick Start Templates</h3>
            <button
              class="fm-close-button"
              @click="showTemplateModal = false"
              aria-label="Close template modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="fm-template-modal-content">
            <div class="fm-template-grid">
              <button
                v-for="template in quickTemplates"
                :key="template.id"
                class="fm-template-option"
                @click="applyTemplate(template.id)"
              >
                <i :class="template.icon"></i>
                <span class="fm-template-name">{{ template.name }}</span>
                <span class="fm-template-preview">
                  {{ template.properties.map((p) => p.name).join(", ") }}
                </span>
              </button>
            </div>
          </div>
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

// Props
const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// Refs
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const showTemplateModal = ref(false);
const showTypeModal = ref(false);
const editingPropertyIndex = ref<number | null>(null);
let updateTimeout: ReturnType<typeof setTimeout> | null = null;

// Property Types
const propertyTypes = [
  {
    id: "text",
    name: "Text",
    icon: "fa-font",
    description: "Simple text, like a title or note.",
  },
  {
    id: "list",
    name: "Tags",
    icon: "fa-tags",
    description: "Multiple tags for categorization.",
  },
  {
    id: "number",
    name: "Number",
    icon: "fa-hashtag",
    description: "Numeric value, like a rating.",
  },
  {
    id: "checkbox",
    name: "Checkbox",
    icon: "fa-check-square",
    description: "True/false toggle.",
  },
  {
    id: "date",
    name: "Date",
    icon: "fa-calendar-alt",
    description: "Calendar date, like a due date.",
  },
  {
    id: "datetime",
    name: "Date & Time",
    icon: "fa-clock",
    description: "Date with time.",
  },
  {
    id: "isRecurring",
    name: "Recurring",
    icon: "fa-redo-alt",
    description: "Mark as recurring task.",
  },
  {
    id: "prompt",
    name: "Prompt",
    icon: "fa-terminal",
    description: "Ask a question on note creation.",
  },
  {
    id: "fileInfo",
    name: "Dynamic",
    icon: "fa-cogs",
    description: "Note metadata, like file name.",
  },
];

// Property Suggestions
const propertySuggestions = [
  { type: "list", name: "Tags", icon: "fa-tags" },
  { type: "date", name: "Date", icon: "fa-calendar-alt" },
  { type: "checkbox", name: "Completed", icon: "fa-check-square" },
];

// File Property Options
const filePropertyOptions = [
  {
    id: "fileName",
    name: "File Name",
    icon: "fa-file-signature",
    code: "<% tp.file.title %>",
  },
  {
    id: "folderPath",
    name: "Folder Path",
    icon: "fa-folder",
    code: "<% tp.file.folder %>",
  },
  {
    id: "creation",
    name: "Creation Date",
    icon: "fa-calendar-plus",
    code: '<% tp.file.creation_date("YYYY-MM-DD") %>',
  },
  {
    id: "modified",
    name: "Modified Date",
    icon: "fa-calendar-check",
    code: '<% tp.file.last_modified_date("YYYY-MM-DD") %>',
  },
  {
    id: "currentDate",
    name: "Today's Date",
    icon: "fa-calendar-day",
    code: '<% tp.date.now("YYYY-MM-DD") %>',
  },
  {
    id: "currentTime",
    name: "Current Time",
    icon: "fa-clock",
    code: '<% tp.date.now("HH:mm") %>',
  },
];

// Template Presets
const quickTemplates = [
  {
    id: "basic",
    name: "Basic Note",
    icon: "fas fa-file-alt",
    properties: [
      {
        name: "date",
        type: "fileInfo",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "list",
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
        type: "fileInfo",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "list",
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
        type: "fileInfo",
        value: "",
        fileProperty: '<% tp.date.now("YYYY-MM-DD") %>',
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "participants",
        type: "list",
        value: [],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
      {
        name: "tags",
        type: "list",
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
        type: "fileInfo",
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
        type: "list",
        value: ["book", "literature"],
        fileProperty: null,
        promptOptions: { question: "", defaultValue: "", multiline: false },
      },
    ],
  },
];

// Module State
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
const tagInputs = ref<Record<number, string>>({});
const validationErrors = ref<Record<number, { name?: string }>>({});
const suggestedTags = ref<string[]>(["project", "todo", "meeting", "book"]);

// Initialization
onMounted(async () => {
  if (props.module.content.length > 0) {
    parseExistingFrontmatter(props.module.content[0]);
  }
  initializeTagInputs();
  await fetchSuggestedTags();
});

onBeforeUnmount(() => {
  if (updateTimeout) clearTimeout(updateTimeout);
});

// Fetch Suggested Tags (Simulated API call)
async function fetchSuggestedTags() {
  try {
    // Placeholder: Replace with obsidianApiService call
    suggestedTags.value = [
      "project",
      "todo",
      "meeting",
      "book",
      "journal",
      "idea",
    ];
  } catch (error) {
    console.error("Error fetching tags:", error);
  }
}

// Property Type Info
function getPropertyTypeInfo(typeId: string) {
  return propertyTypes.find((t) => t.id === typeId) || propertyTypes[0];
}

// Default Value by Type
function getDefaultValueForType(type: string): any {
  switch (type) {
    case "text":
      return "";
    case "list":
      return [];
    case "number":
      return 0;
    case "checkbox":
      return false;
    case "date":
      return formatDate(new Date());
    case "datetime":
      return formatDateTime(new Date());
    case "isRecurring":
      return false;
    case "prompt":
      return "";
    case "fileInfo":
      return "";
    default:
      return "";
  }
}

// Date Formatting
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

// Type Selection
function startEditingType(index: number) {
  editingPropertyIndex.value = index;
  showTypeModal.value = true;
}

function startAddingProperty(type: string) {
  const newProp = {
    name: "",
    type,
    value: getDefaultValueForType(type),
    fileProperty: null,
    promptOptions: { question: "", defaultValue: "", multiline: false },
  };

  properties.value.push(newProp);
  const newIndex = properties.value.length - 1;
  initializeTagInputs();

  nextTick(() => {
    const rows = baseModuleRef.value?.$el.querySelectorAll(".fm-property-row");
    if (rows && rows.length > 0) {
      const newRow = rows[rows.length - 1];
      const nameInput = newRow.querySelector(
        ".fm-input--name"
      ) as HTMLInputElement;
      nameInput?.focus();
    }
  });

  updateFrontmatter();
}

function selectType(typeId: string) {
  if (editingPropertyIndex.value !== null) {
    const index = editingPropertyIndex.value;
    const prop = properties.value[index];
    if (prop.type !== typeId) {
      prop.type = typeId;
      prop.value = getDefaultValueForType(typeId);
      if (typeId !== "fileInfo") prop.fileProperty = null;
      if (typeId !== "prompt")
        prop.promptOptions = {
          question: "",
          defaultValue: "",
          multiline: false,
        };
      validateName(index);
      updateFrontmatter();
    }
  }
  showTypeModal.value = false;
  editingPropertyIndex.value = null;
}

// Validation
function validateName(index: number) {
  const prop = properties.value[index];
  const errors: { name?: string } = {};

  if (!prop.name.trim()) {
    errors.name = "Name required";
  } else if (!/^[a-zA-Z0-9_-]+$/.test(prop.name)) {
    errors.name = "Use letters, numbers, hyphens, underscores";
  } else if (
    properties.value.some((p, i) => i !== index && p.name === prop.name)
  ) {
    errors.name = "Name already used";
  }

  validationErrors.value[index] = errors;
  debounceUpdate();
}

// Property Management
function removeProperty(index: number) {
  properties.value.splice(index, 1);
  delete validationErrors.value[index];
  initializeTagInputs();
  updateFrontmatter();
}

function confirmClearAll() {
  if (confirm("Remove all properties? This cannot be undone.")) {
    properties.value = [];
    validationErrors.value = {};
    tagInputs.value = {};
    updateFrontmatter();
  }
}

// Tag Handling
function initializeTagInputs() {
  const newTagInputs: Record<number, string> = {};
  properties.value.forEach((prop, index) => {
    if (prop.type === "list") {
      newTagInputs[index] = tagInputs.value[index] || "";
    }
  });
  tagInputs.value = newTagInputs;
}

function addTag(propIndex: number) {
  const tagValue = tagInputs.value[propIndex]?.trim();
  const prop = properties.value[propIndex];

  if (tagValue && prop && prop.type === "list") {
    if (!Array.isArray(prop.value)) prop.value = [];
    if (!prop.value.includes(tagValue)) {
      prop.value.push(tagValue);
      if (!suggestedTags.value.includes(tagValue)) {
        suggestedTags.value.push(tagValue);
      }
      updateFrontmatter();
    }
    tagInputs.value[propIndex] = "";
  }
}

function addTagOnBlur(propIndex: number) {
  if (tagInputs.value[propIndex]?.trim()) {
    addTag(propIndex);
  }
}

function removeTag(propIndex: number, tagIndex: number) {
  const prop = properties.value[propIndex];
  if (prop && prop.type === "list" && Array.isArray(prop.value)) {
    prop.value.splice(tagIndex, 1);
    updateFrontmatter();
  }
}

// Template Handling
function applyTemplate(templateId: string) {
  const template = quickTemplates.find((t) => t.id === templateId);
  if (template) {
    properties.value = JSON.parse(JSON.stringify(template.properties));
    initializeTagInputs();
    updateFrontmatter();
  }
  showTemplateModal.value = false;
}

// Debounce Update
function debounceUpdate() {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updateFrontmatter();
  }, 300);
}

// Generate Frontmatter
function generateFrontmatter() {
  const frontmatterObj: Record<string, any> = {};

  for (const prop of properties.value) {
    if (!prop.name.trim()) continue;

    if (prop.type === "fileInfo" && prop.fileProperty) {
      frontmatterObj[prop.name] = prop.fileProperty;
    } else if (prop.type === "prompt" && prop.promptOptions.question) {
      let promptCode = `<% await tp.system.prompt("${prop.promptOptions.question}"`;
      if (prop.promptOptions.defaultValue) {
        promptCode += `, "${prop.promptOptions.defaultValue}"`;
      }
      if (prop.promptOptions.multiline) {
        if (!prop.promptOptions.defaultValue) promptCode += ', ""';
        promptCode += `, {multi: true}`;
      }
      promptCode += ") %>";
      frontmatterObj[prop.name] = promptCode;
    } else {
      frontmatterObj[prop.name] = prop.value;
    }
  }

  let yamlString = YAML.stringify(frontmatterObj);
  yamlString = yamlString.replace(/"<%(.*?)%>"/g, "<$1>");
  return `---\n${yamlString}---\n`;
}

// Update Frontmatter
function updateFrontmatter() {
  if (properties.value.length === 0) {
    emit("update:content", []);
    return;
  }

  const frontmatter = generateFrontmatter();
  emit("update:content", [frontmatter]);
}

// Parse Existing Frontmatter
function parseExistingFrontmatter(content: string) {
  try {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;

    let yamlContent = match[1].replace(/<%(.*?)%>/g, '"<%$1%>"');
    const parsed = YAML.parse(yamlContent);

    const newProperties = [];

    for (const [key, value] of Object.entries(parsed)) {
      let propertyType = "text";
      let propertyValue = value;
      let fileProperty = null;
      let promptOptions = { question: "", defaultValue: "", multiline: false };

      if (typeof value === "string") {
        if (value.includes("tp.file.") || value.includes("tp.date.")) {
          propertyType = "fileInfo";
          fileProperty = value;
          propertyValue = "";
        } else if (value.includes("tp.system.prompt")) {
          propertyType = "prompt";
          const questionMatch = value.match(/tp\.system\.prompt\("([^"]+)"/);
          if (questionMatch) promptOptions.question = questionMatch[1];
          const defaultMatch = value.match(
            /tp\.system\.prompt\("[^"]+",\s*"([^"]*)"/
          );
          if (defaultMatch) promptOptions.defaultValue = defaultMatch[1];
          promptOptions.multiline = value.includes("multi: true");
          propertyValue = "";
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          propertyType = "date";
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) {
          propertyType = "datetime";
        }
      } else if (typeof value === "number") {
        propertyType = "number";
      } else if (typeof value === "boolean") {
        propertyType = key === "isRecurring" ? "isRecurring" : "checkbox";
      } else if (Array.isArray(value)) {
        propertyType = "list";
      }

      newProperties.push({
        name: key,
        type: propertyType,
        value: propertyValue,
        fileProperty,
        promptOptions,
      });
    }

    properties.value = newProperties;
    initializeTagInputs();
  } catch (error) {
    console.error("Error parsing frontmatter:", error);
  }
}

// Watch Content Changes
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
/* Base & Glassmorphism */
.fm-container {
  width: 100%;
  max-width: 600px;
  background: rgba(20, 25, 35, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  color: #e1e1e6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  max-height: 500px;
  overflow-y: auto;
}

/* Empty State */
.fm-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.fm-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  background: rgba(30, 36, 50, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  animation: slideUp 0.5s ease-out;
}

.fm-empty-icon {
  animation: glow 2s infinite ease-in-out;
}

.fm-empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.fm-empty-description {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 300px;
}

.fm-empty-actions {
  display: flex;
  gap: 12px;
}

.fm-empty-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  align-items: center;
}

.fm-suggestion {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.fm-suggestion:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e1e1e6;
}

.fm-suggestion i {
  color: #60a5fa;
  font-size: 12px;
}

.fm-privacy-badge {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  margin-top: 8px;
}

/* Panel */
.fm-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Property List */
.fm-property-list {
  background: rgba(15, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
}

.fm-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.fm-list-header h3 {
  font-size: 14px;
  font-weight: 500;
  color: #e1e1e6;
}

.fm-list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fm-property-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(30, 36, 50, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.fm-property-row--error {
  border-color: #da5858;
}

.fm-input--name {
  flex: 1;
  min-width: 100px;
}

.fm-type-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.fm-type-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e1e1e6;
}

.fm-type-button i {
  color: #60a5fa;
  font-size: 12px;
}

.fm-value-wrapper {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fm-input--value {
  flex: 1;
}

.fm-input--number {
  width: 80px;
}

.fm-input--date,
.fm-input--datetime {
  width: 140px;
  padding-right: 30px;
}

.fm-input--tag {
  width: 100px;
}

.fm-action-button {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.fm-action-button--delete:hover {
  color: #60a5fa;
}

/* Inputs and Selects */
.fm-input,
.fm-select {
  padding: 8px 12px;
  background: rgba(15, 20, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #e1e1e6;
  font-size: 12px;
  transition: all 0.2s ease-out;
}

.fm-input:focus,
.fm-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.25);
}

.fm-input::placeholder {
  color: #717a8a;
}

.fm-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

.fm-input--date::-webkit-calendar-picker-indicator,
.fm-input--datetime::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

/* Toggle Switch */
.fm-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e1e1e6;
}

.fm-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.fm-toggle-slider {
  position: relative;
  width: 32px;
  height: 18px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.fm-toggle-slider:before {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  left: 1px;
  bottom: 1px;
  background: #ccc;
  border-radius: 50%;
  transition: all 0.3s;
}

.fm-toggle input:checked + .fm-toggle-slider {
  background: #60a5fa;
  border-color: #60a5fa;
}

.fm-toggle input:checked + .fm-toggle-slider:before {
  transform: translateX(14px);
  background: #fff;
}

.fm-toggle--recurring .fm-toggle-slider {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 2px;
}

.fm-recurring-icon {
  font-size: 10px;
  color: #fff;
  animation: spin 4s linear infinite;
}

.fm-toggle--prompt {
  margin-top: 6px;
}

/* Tags */
.fm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.fm-tag {
  background: rgba(96, 165, 250, 0.25);
  color: #60a5fa;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.fm-tag-remove {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.fm-tag-remove:hover {
  color: #e57373;
}

/* Prompt Details */
.fm-prompt-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Error Message */
.fm-error-message {
  font-size: 11px;
  color: #da5858;
  margin-top: 4px;
}

/* Buttons */
.fm-button {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  border: 1px solid transparent;
}

.fm-button--primary {
  background: #60a5fa;
  color: #fff;
}

.fm-button--primary:hover {
  background: #60a5fa;
  box-shadow: 0 2px 8px rgba(255, 87, 51, 0.3);
}

.fm-button--secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.fm-button--secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e1e1e6;
}

.fm-button--destructive {
  background: rgba(218, 88, 88, 0.1);
  border-color: rgba(218, 88, 88, 0.2);
  color: #da5858;
}

.fm-button--destructive:hover {
  background: rgba(218, 88, 88, 0.2);
  color: #e57373;
}

.fm-button--small {
  padding: 6px 10px;
  font-size: 11px;
}

.fm-button i {
  font-size: 12px;
}

/* Actions */
.fm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Type Modal */
.fm-type-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.fm-type-modal {
  background: rgba(20, 25, 35, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.fm-type-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fm-type-modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #e1e1e6;
}

.fm-type-modal-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fm-type-option {
  background: rgba(30, 36, 50, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.fm-type-option:hover {
  background: rgba(30, 36, 50, 0.9);
  border-color: #60a5fa;
}

.fm-type-option i {
  color: #60a5fa;
  font-size: 14px;
}

.fm-type-name {
  font-size: 13px;
  font-weight: 500;
  color: #e1e1e6;
  flex: 1;
}

.fm-type-description {
  font-size: 11px;
  color: #94a3b8;
}

/* Template Modal */
.fm-template-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.fm-template-modal {
  background: rgba(20, 25, 35, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.fm-template-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fm-template-modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #e1e1e6;
}

.fm-template-modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fm-template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.fm-template-option {
  background: rgba(30, 36, 50, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease-out;
}

.fm-template-option:hover {
  background: rgba(30, 36, 50, 0.9);
  border-color: #60a5fa;
}

.fm-template-option i {
  color: #60a5fa;
  font-size: 16px;
}

.fm-template-name {
  font-size: 13px;
  font-weight: 500;
  color: #e1e1e6;
  flex: 1;
}

.fm-template-preview {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  display: block;
}

.fm-close-button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.fm-close-button:hover {
  color: #e1e1e6;
}

/* Animations */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes glow {
  0% {
    stroke: #ff5733;
  }
  50% {
    stroke: #e64e2e;
  }
  100% {
    stroke: #ff5733;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .fm-container {
    padding: 16px;
  }

  .fm-empty-content {
    padding: 16px;
  }

  .fm-empty-actions {
    flex-direction: column;
    gap: 8px;
  }

  .fm-property-row {
    flex-direction: column;
    align-items: stretch;
  }

  .fm-value-wrapper {
    flex: 1;
  }

  .fm-input--name,
  .fm-input--value {
    width: 100%;
  }

  .fm-type-button {
    width: 100%;
    justify-content: flex-start;
  }

  .fm-type-modal,
  .fm-template-modal {
    width: 95%;
    padding: 16px;
  }

  .fm-template-grid {
    grid-template-columns: 1fr;
  }
}
</style>

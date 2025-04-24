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
    <div class="dv-frontmatter">
      <!-- Empty State -->
      <div class="dv-frontmatter-empty" v-if="properties.length === 0">
        <div class="dv-frontmatter-empty-content">
          <div class="dv-frontmatter-empty-icon">
            <i class="fas fa-tag"></i>
          </div>
          <h2 class="dv-frontmatter-empty-title">Add Frontmatter</h2>
          <p class="dv-frontmatter-empty-description">
            Organize your note with properties like tags or dates.
          </p>
          <div class="dv-frontmatter-empty-actions">
            <button
              class="dv-frontmatter-button dv-frontmatter-button--primary"
              @click="startAddingProperty('text')"
            >
              <i class="fas fa-plus"></i> Add Property
            </button>
            <button
              class="dv-frontmatter-button dv-frontmatter-button--secondary"
              @click="showTemplateModal = true"
            >
              <i class="fas fa-layer-group"></i> Templates
            </button>
          </div>
          <div class="dv-frontmatter-empty-suggestions">
            <span>Quick add:</span>
            <div class="dv-frontmatter-suggestions-list">
              <button
                v-for="suggestion in propertySuggestions"
                :key="suggestion.type"
                class="dv-frontmatter-suggestion"
                @click="startAddingProperty(suggestion.type)"
              >
                <i :class="['fas', suggestion.icon]"></i>
                {{ suggestion.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Property Panel -->
      <div class="dv-frontmatter-panel" v-else>
        <!-- Panel Header -->
        <div class="dv-frontmatter-panel-header">
          <div class="dv-frontmatter-panel-title">
            <i class="fas fa-tag"></i>
            <span>Note Properties</span>
          </div>
          <button
            class="dv-frontmatter-button dv-frontmatter-button--primary dv-frontmatter-button--small"
            @click="startAddingProperty('text')"
          >
            <i class="fas fa-plus"></i> Add Property
          </button>
        </div>

        <!-- Property List -->
        <div class="dv-frontmatter-property-list">
          <div
            v-for="(property, index) in properties"
            :key="index"
            class="dv-frontmatter-property-row"
            :class="{
              'dv-frontmatter-property-row--error': validationErrors[index],
            }"
          >
            <!-- Property Name -->
            <div class="dv-frontmatter-property-name">
              <input
                type="text"
                v-model="property.name"
                class="dv-frontmatter-input"
                placeholder="e.g., tags"
                @input="validateName(index)"
                @blur="updateFrontmatter"
                :aria-label="'Name for property ' + (index + 1)"
                :aria-invalid="!!validationErrors[index]?.name"
                :aria-describedby="'name-error-' + index"
              />
              <div
                v-if="validationErrors[index]?.name"
                class="dv-frontmatter-error-message"
                :id="'name-error-' + index"
              >
                {{ validationErrors[index].name }}
              </div>
            </div>

            <!-- Property Type -->
            <div class="dv-frontmatter-property-type">
              <button
                class="dv-frontmatter-type-button"
                @click="startEditingType(index)"
                :aria-label="'Change type for ' + (property.name || 'property')"
              >
                <i
                  :class="['fas', getPropertyTypeInfo(property.type).icon]"
                ></i>
                {{ getPropertyTypeInfo(property.type).name }}
              </button>
            </div>

            <!-- Property Value -->
            <div class="dv-frontmatter-property-value">
              <!-- Text Input -->
              <input
                v-if="property.type === 'text'"
                type="text"
                v-model="property.value"
                class="dv-frontmatter-input"
                placeholder="Enter text"
                @input="debounceUpdate"
                @blur="updateFrontmatter"
                :aria-label="'Value for ' + (property.name || 'text property')"
              />

              <!-- Number Input -->
              <input
                v-if="property.type === 'number'"
                type="number"
                v-model.number="property.value"
                class="dv-frontmatter-input dv-frontmatter-input--number"
                placeholder="0"
                @input="debounceUpdate"
                @blur="updateFrontmatter"
                :aria-label="
                  'Value for ' + (property.name || 'number property')
                "
              />

              <!-- Checkbox Toggle -->
              <label
                v-if="property.type === 'checkbox'"
                class="dv-frontmatter-toggle"
                :aria-label="
                  'Toggle for ' + (property.name || 'checkbox property')
                "
              >
                <input
                  type="checkbox"
                  v-model="property.value"
                  @change="updateFrontmatter"
                />
                <span class="dv-frontmatter-toggle-slider"></span>
              </label>

              <!-- Date Input -->
              <input
                v-if="property.type === 'date'"
                type="date"
                v-model="property.value"
                class="dv-frontmatter-input dv-frontmatter-input--date"
                @input="debounceUpdate"
                @change="updateFrontmatter"
                :aria-label="'Date for ' + (property.name || 'date property')"
              />

              <!-- Datetime Input -->
              <input
                v-if="property.type === 'datetime'"
                type="datetime-local"
                v-model="property.value"
                class="dv-frontmatter-input dv-frontmatter-input--datetime"
                @input="debounceUpdate"
                @change="updateFrontmatter"
                :aria-label="
                  'Date and time for ' + (property.name || 'datetime property')
                "
              />

              <!-- Recurring Task Toggle -->
              <label
                v-if="property.type === 'isRecurring'"
                class="dv-frontmatter-toggle"
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
                <span class="dv-frontmatter-toggle-slider">
                  <i
                    v-if="property.value"
                    class="fas fa-redo-alt dv-frontmatter-recurring-icon"
                  ></i>
                </span>
              </label>

              <!-- List/Tags Input -->
              <div v-if="property.type === 'list'" class="dv-frontmatter-tags">
                <div class="dv-frontmatter-tags-list">
                  <span
                    v-for="(tag, tagIndex) in property.value"
                    :key="tagIndex"
                    class="dv-frontmatter-tag"
                  >
                    {{ tag }}
                    <button
                      @click="removeTag(index, tagIndex)"
                      class="dv-frontmatter-tag-remove"
                      :aria-label="'Remove tag ' + tag"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
                <div class="dv-frontmatter-input-wrapper">
                  <i class="fas fa-plus-circle dv-frontmatter-input-icon"></i>
                  <input
                    type="text"
                    v-model="tagInputs[index]"
                    class="dv-frontmatter-input dv-frontmatter-input--tag"
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
              </div>

              <!-- Templater Prompt -->
              <div
                v-if="property.type === 'prompt'"
                class="dv-frontmatter-prompt-details"
              >
                <div class="dv-frontmatter-input-wrapper">
                  <i
                    class="fas fa-question-circle dv-frontmatter-input-icon"
                  ></i>
                  <input
                    type="text"
                    v-model="property.promptOptions.question"
                    class="dv-frontmatter-input"
                    placeholder="e.g., What's the note title?"
                    @input="debounceUpdate"
                    @blur="updateFrontmatter"
                    :aria-label="
                      'Prompt question for ' +
                      (property.name || 'prompt property')
                    "
                  />
                </div>
                <div class="dv-frontmatter-input-wrapper">
                  <i class="fas fa-reply dv-frontmatter-input-icon"></i>
                  <input
                    type="text"
                    v-model="property.promptOptions.defaultValue"
                    class="dv-frontmatter-input"
                    placeholder="Default answer"
                    @input="debounceUpdate"
                    @blur="updateFrontmatter"
                    :aria-label="
                      'Default answer for ' +
                      (property.name || 'prompt property')
                    "
                  />
                </div>
                <div class="dv-frontmatter-field-group--inline">
                  <label class="dv-frontmatter-toggle">
                    <input
                      type="checkbox"
                      v-model="property.promptOptions.multiline"
                      @change="updateFrontmatter"
                    />
                    <span class="dv-frontmatter-toggle-slider"></span>
                  </label>
                  <span class="dv-frontmatter-toggle-label">
                    Allow multiline input
                  </span>
                </div>
              </div>

              <!-- File Info Select -->
              <div
                class="dv-frontmatter-input-wrapper"
                v-if="property.type === 'fileInfo'"
              >
                <i class="fas fa-file-alt dv-frontmatter-input-icon"></i>
                <select
                  v-model="property.fileProperty"
                  class="dv-frontmatter-select"
                  @change="updateFrontmatter"
                  :aria-label="
                    'File information for ' +
                    (property.name || 'file info property')
                  "
                >
                  <option value="" disabled>Select file info...</option>
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

            <!-- Delete Button -->
            <div class="dv-frontmatter-property-actions">
              <button
                class="dv-frontmatter-action-button"
                @click="removeProperty(index)"
                :aria-label="'Delete ' + (property.name || 'property')"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel Actions -->
        <div class="dv-frontmatter-panel-actions">
          <button
            class="dv-frontmatter-button dv-frontmatter-button--secondary"
            @click="showTemplateModal = true"
          >
            <i class="fas fa-layer-group"></i> Templates
          </button>
          <button
            class="dv-frontmatter-button dv-frontmatter-button--destructive"
            @click="confirmClearAll"
          >
            <i class="fas fa-trash-alt"></i> Clear All
          </button>
        </div>
      </div>

      <!-- Type Selection Modal -->
      <div
        v-if="showTypeModal"
        class="dv-frontmatter-modal-overlay"
        @click="showTypeModal = false"
      >
        <div class="dv-frontmatter-modal" @click.stop>
          <div class="dv-frontmatter-modal-header">
            <h3>Select Property Type</h3>
            <button
              class="dv-frontmatter-close-button"
              @click="showTypeModal = false"
              aria-label="Close type modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="dv-frontmatter-modal-content">
            <button
              v-for="type in propertyTypes"
              :key="type.id"
              class="dv-frontmatter-type-option"
              @click="selectType(type.id)"
            >
              <i :class="['fas', type.icon]"></i>
              <div class="dv-frontmatter-type-info">
                <span class="dv-frontmatter-type-name">{{ type.name }}</span>
                <span class="dv-frontmatter-type-description">{{
                  type.description
                }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Template Modal -->
      <div
        v-if="showTemplateModal"
        class="dv-frontmatter-modal-overlay"
        @click="showTemplateModal = false"
      >
        <div
          class="dv-frontmatter-modal dv-frontmatter-modal--large"
          @click.stop
        >
          <div class="dv-frontmatter-modal-header">
            <h3>Quick Start Templates</h3>
            <button
              class="dv-frontmatter-close-button"
              @click="showTemplateModal = false"
              aria-label="Close template modal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="dv-frontmatter-modal-content">
            <div class="dv-frontmatter-template-grid">
              <button
                v-for="template in quickTemplates"
                :key="template.id"
                class="dv-frontmatter-template-option"
                @click="applyTemplate(template.id)"
              >
                <i :class="template.icon"></i>
                <div class="dv-frontmatter-template-info">
                  <span class="dv-frontmatter-template-name">{{
                    template.name
                  }}</span>
                  <span class="dv-frontmatter-template-preview">
                    {{ template.properties.map((p) => p.name).join(", ") }}
                  </span>
                </div>
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
    const rows = baseModuleRef.value?.$el.querySelectorAll(
      ".dv-frontmatter-property-row"
    );
    if (rows && rows.length > 0) {
      const newRow = rows[rows.length - 1];
      const nameInput = newRow.querySelector(
        ".dv-frontmatter-input"
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
/* --- Base & Dark Glassmorphism --- */
.dv-frontmatter {
  width: 100%;
  /* Dark glassmorphism base */
  background: rgba(21, 26, 36, 0.7); /* Dark semi-transparent */
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1); /* Light border */
  border-radius: 12px;
  padding: 20px;
  color: var(--text-normal-dark, #e1e1e6); /* Light text */
  font-family: var(--font-interface, sans-serif);
  display: flex;
  flex-direction: column;
  gap: 20px; /* Consistent gap */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* --- Empty State --- */
.dv-frontmatter-empty {
  display: flex;
  justify-content: center;
  padding: 30px 15px;
}

.dv-frontmatter-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 400px;
  background: rgba(30, 36, 50, 0.6); /* Darker section background */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 24px;
  animation: fadeIn 0.3s ease-out;
}

.dv-frontmatter-empty-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(96, 165, 250, 0.1);
  font-size: 22px;
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-frontmatter-empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title-dark, #ffffff);
  margin: 0;
}

.dv-frontmatter-empty-description {
  font-size: 14px;
  color: var(--text-muted-dark, #94a3b8);
  margin: 0;
  line-height: 1.5;
}

.dv-frontmatter-empty-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.dv-frontmatter-empty-suggestions {
  margin-top: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
}

.dv-frontmatter-suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.dv-frontmatter-suggestion {
  background: rgba(15, 20, 30, 0.7); /* Darker input background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-muted-dark, #94a3b8);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.dv-frontmatter-suggestion:hover {
  background: rgba(30, 36, 50, 0.9);
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-frontmatter-suggestion i {
  color: var(--interactive-accent-light, #60a5fa);
  font-size: 12px;
}

/* --- Panel --- */
.dv-frontmatter-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dv-frontmatter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dv-frontmatter-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-title-dark, #ffffff);
}

.dv-frontmatter-panel-title i {
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-frontmatter-panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

/* --- Property List --- */
.dv-frontmatter-property-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dv-frontmatter-property-row {
  display: grid;
  grid-template-columns: 1fr auto 2fr auto;
  gap: 12px;
  padding: 12px;
  background: rgba(30, 36, 50, 0.6); /* Darker section background */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: border-color 0.2s;
  align-items: center;
}

.dv-frontmatter-property-row:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.dv-frontmatter-property-row--error {
  border-color: #a389f4;
}

.dv-frontmatter-property-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dv-frontmatter-property-value {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* --- Type Button --- */
.dv-frontmatter-type-button {
  background: rgba(15, 20, 30, 0.7); /* Darker input background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  white-space: nowrap;
}

.dv-frontmatter-type-button:hover {
  background: rgba(30, 36, 50, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-frontmatter-type-button i {
  color: var(--interactive-accent-light, #60a5fa);
  font-size: 12px;
}

/* --- Action Buttons --- */
.dv-frontmatter-action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 20, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted-dark, #94a3b8);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.dv-frontmatter-action-button:hover {
  background: rgba(220, 38, 38, 0.2);
  color: rgba(220, 38, 38, 0.8);
  border-color: rgba(220, 38, 38, 0.3);
}

/* --- Inputs & Selects --- */
.dv-frontmatter-input,
.dv-frontmatter-select {
  padding: 9px 12px;
  background: rgba(15, 20, 30, 0.7); /* Darker input background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-normal-dark, #e1e1e6);
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease-in-out;
}

.dv-frontmatter-input:focus,
.dv-frontmatter-select:focus {
  outline: none;
  border-color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
  background: rgba(30, 36, 50, 0.9);
}

.dv-frontmatter-input::placeholder {
  color: var(--text-faint-dark, #717a8a);
}

.dv-frontmatter-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 35px;
}

.dv-frontmatter-input--number {
  width: 100px;
  text-align: center;
}

.dv-frontmatter-input--date,
.dv-frontmatter-input--datetime {
  width: auto;
}

.dv-frontmatter-input--date::-webkit-calendar-picker-indicator,
.dv-frontmatter-input--datetime::-webkit-calendar-picker-indicator {
  filter: invert(0.8); /* Make picker icon lighter on dark background */
  cursor: pointer;
}

.dv-frontmatter-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px; /* Gap between icon/input/button */
}

.dv-frontmatter-input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-color-dark, #94a3b8);
  font-size: 13px;
  pointer-events: none; /* Don't interfere with clicks */
}

.dv-frontmatter-input-wrapper .dv-frontmatter-input,
.dv-frontmatter-input-wrapper .dv-frontmatter-select {
  padding-left: 34px; /* Space for icon */
  flex-grow: 1; /* Allow input/select to grow */
}

/* --- Toggle Switch --- */
.dv-frontmatter-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0; /* Prevent toggle from shrinking */
}
.dv-frontmatter-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.dv-frontmatter-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: 0.3s;
  border-radius: 22px;
}
.dv-frontmatter-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #ccc; /* Lighter grey knob */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 50%;
}
.dv-frontmatter-toggle input:checked + .dv-frontmatter-toggle-slider {
  background-color: var(--interactive-accent-light, #60a5fa);
  border-color: var(--interactive-accent-light, #60a5fa);
}
.dv-frontmatter-toggle input:focus-visible + .dv-frontmatter-toggle-slider {
  /* Use focus-visible */
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
}
.dv-frontmatter-toggle input:checked + .dv-frontmatter-toggle-slider:before {
  transform: translateX(18px);
  background-color: #fff; /* White knob when active */
}

.dv-frontmatter-toggle-label {
  font-size: 14px;
  color: var(--text-normal-dark, #e1e1e6);
  cursor: pointer; /* Make label clickable too */
  margin-left: 8px;
}

.dv-frontmatter-recurring-icon {
  font-size: 10px;
  color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: spin 4s linear infinite;
}

.dv-frontmatter-field-group--inline {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

/* --- Tags --- */
.dv-frontmatter-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dv-frontmatter-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 32px;
}

.dv-frontmatter-tag {
  background: rgba(96, 165, 250, 0.15);
  color: var(--interactive-accent-light, #60a5fa);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dv-frontmatter-tag-remove {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dv-frontmatter-tag-remove:hover {
  opacity: 1;
}

.dv-frontmatter-input--tag {
  flex: 1;
  min-width: 120px;
}

/* --- Prompt Details --- */
.dv-frontmatter-prompt-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* --- Error Message --- */
.dv-frontmatter-error-message {
  font-size: 12px;
  color: rgba(220, 38, 38, 0.8);
  margin-top: 4px;
}

/* --- Buttons --- */
.dv-frontmatter-button {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  border: 1px solid transparent;
}

.dv-frontmatter-button--primary {
  background: var(--interactive-accent-light, #60a5fa);
  color: var(--text-on-accent, #111);
}

.dv-frontmatter-button--primary:hover {
  background: var(--interactive-accent-light, #60a5fa);
  filter: brightness(1.1);
}

.dv-frontmatter-button--secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-muted-dark, #94a3b8);
}

.dv-frontmatter-button--secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-frontmatter-button--destructive {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.2);
  color: rgba(220, 38, 38, 0.8);
}

.dv-frontmatter-button--destructive:hover {
  background: rgba(220, 38, 38, 0.2);
  color: rgb(220, 38, 38);
}

.dv-frontmatter-button--small {
  padding: 6px 10px;
  font-size: 12px;
}

.dv-frontmatter-button i {
  font-size: 12px;
}

/* --- Modals --- */
.dv-frontmatter-modal-overlay {
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

.dv-frontmatter-modal {
  background: rgba(21, 26, 36, 0.95);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.dv-frontmatter-modal--large {
  max-width: 500px;
}

.dv-frontmatter-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dv-frontmatter-modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title-dark, #ffffff);
  margin: 0;
}

.dv-frontmatter-close-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted-dark, #94a3b8);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.dv-frontmatter-close-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-frontmatter-modal-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
}

/* Type Options */
.dv-frontmatter-type-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(30, 36, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dv-frontmatter-type-option:hover {
  background: rgba(96, 165, 250, 0.15);
  border-color: rgba(96, 165, 250, 0.3);
}

.dv-frontmatter-type-option i {
  font-size: 16px;
  color: var(--interactive-accent-light, #60a5fa);
  width: 20px;
  text-align: center;
}

.dv-frontmatter-type-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dv-frontmatter-type-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-frontmatter-type-description {
  font-size: 12px;
  color: var(--text-muted-dark, #94a3b8);
  margin-top: 2px;
}

/* Template Grid */
.dv-frontmatter-template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.dv-frontmatter-template-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(30, 36, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dv-frontmatter-template-option:hover {
  background: rgba(96, 165, 250, 0.15);
  border-color: rgba(96, 165, 250, 0.3);
}

.dv-frontmatter-template-option i {
  font-size: 18px;
  color: var(--interactive-accent-light, #60a5fa);
  width: 24px;
  text-align: center;
}

.dv-frontmatter-template-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dv-frontmatter-template-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-frontmatter-template-preview {
  font-size: 12px;
  color: var(--text-muted-dark, #94a3b8);
  margin-top: 4px;
  line-height: 1.4;
  word-break: break-word;
}

/* --- Animations --- */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* --- Responsive --- */
@media (max-width: 600px) {
  .dv-frontmatter {
    padding: 16px;
  }

  .dv-frontmatter-property-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dv-frontmatter-property-name,
  .dv-frontmatter-property-type,
  .dv-frontmatter-property-value {
    width: 100%;
  }

  .dv-frontmatter-property-actions {
    justify-self: flex-end;
    margin-top: 8px;
  }

  .dv-frontmatter-empty-actions {
    flex-direction: column;
  }

  .dv-frontmatter-template-grid {
    grid-template-columns: 1fr;
  }
}
</style>

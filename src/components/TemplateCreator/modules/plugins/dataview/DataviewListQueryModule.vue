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
    <!-- Visual Builder Mode -->
    <div v-if="editorMode === 'visual'">
      <!-- Quick templates dropdown -->
      <div class="template-module-editor-line">
        <div class="template-module-editor-input-group">
          <label class="template-module-editor-label">Quick templates:</label>
          <select
            class="template-module-editor-input"
            v-model="selectedPreset"
            @change="applyPreset"
          >
            <option value="">Choose a template...</option>
            <option value="recent">Recent notes</option>
            <option value="tagged">Notes with tag</option>
            <option value="folder">Notes in folder</option>
            <option value="created">Notes created this week</option>
            <option value="modified">Recently modified notes</option>
            <option value="custom">Custom query</option>
          </select>
        </div>
      </div>

      <!-- Find notes from -->
      <div class="template-module-editor-line">
        <div class="template-module-editor-input-group">
          <label class="template-module-editor-label">Find notes from:</label>
          <div class="template-module-editor-inputs-row">
            <select
              class="template-module-editor-input source-type-select"
              v-model="selectedSourceType"
              @change="handleSourceTypeChange"
            >
              <option
                v-for="source in availableSources"
                :key="source.id"
                :value="source.id"
              >
                {{ source.label }}
              </option>
            </select>
            <input
              v-if="selectedSourceType === 'custom'"
              type="text"
              class="template-module-editor-input"
              v-model="queryConfig.source"
              :placeholder="getSourcePlaceholder()"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              :ref="isSelected && autoFocus ? setInputRef : undefined"
            />
          </div>
        </div>
      </div>

      <!-- Order by -->
      <div class="template-module-editor-line">
        <div class="template-module-editor-input-group">
          <label class="template-module-editor-label">Order by:</label>
          <div class="template-module-editor-inputs-row">
            <select
              class="template-module-editor-input"
              v-model="sortField"
              @change="updateSorting"
            >
              <option value="">Default order</option>
              <option value="file.ctime">Creation date</option>
              <option value="file.mtime">Modified date</option>
              <option value="file.name">File name</option>
            </select>
            <select
              v-if="sortField"
              class="template-module-editor-input"
              v-model="sortDirection"
              @change="updateSorting"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Show at most -->
      <div class="template-module-editor-line">
        <div class="template-module-editor-input-group">
          <label class="template-module-editor-label">Show at most:</label>
          <div class="template-module-editor-inputs-row">
            <select
              class="template-module-editor-input"
              v-model="selectedLimit"
              @change="updateLimit"
            >
              <option value="0">All notes</option>
              <option value="5">5 notes</option>
              <option value="10">10 notes</option>
              <option value="20">20 notes</option>
              <option value="50">50 notes</option>
              <option value="custom">Custom limit</option>
            </select>
            <input
              v-if="selectedLimit === 'custom'"
              type="number"
              class="template-module-editor-input"
              v-model.number="queryConfig.limit"
              placeholder="Number of results"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              min="1"
            />
          </div>
        </div>
      </div>

      <!-- Advanced Options Toggle -->
      <div class="template-module-editor-line">
        <button
          class="advanced-toggle-button"
          @click="showAdvanced = !showAdvanced"
        >
          <i
            :class="
              showAdvanced ? 'fas fa-chevron-down' : 'fas fa-chevron-right'
            "
          ></i>
          Advanced Options
        </button>
      </div>

      <!-- Advanced Options (collapsed by default) -->
      <div v-if="showAdvanced">
        <!-- Filters Section -->
        <div class="template-module-editor-section">
          <div class="template-module-editor-section-header">
            <i class="fas fa-filter"></i> Show only notes that match:
          </div>

          <div
            v-for="(filter, index) in queryConfig.filters"
            :key="filter.id"
            class="template-module-editor-line"
          >
            <div class="template-module-editor-input-group">
              <div class="template-module-editor-inputs-row">
                <input
                  type="text"
                  class="template-module-editor-input"
                  v-model="filter.field"
                  placeholder="Property"
                  @input="updateQuery"
                  @focus="setEditing(true)"
                  @blur="setEditing(false)"
                />
                <select
                  class="template-module-editor-input"
                  v-model="filter.operator"
                  @change="updateQuery"
                >
                  <option value="=">equals</option>
                  <option value="!=">doesn't equal</option>
                  <option value="contains">contains</option>
                  <option value="does not contain">doesn't contain</option>
                  <option value=">">is greater than</option>
                  <option value="<">is less than</option>
                  <option value="is empty">is empty</option>
                  <option value="is not empty">is not empty</option>
                </select>
                <input
                  v-if="
                    filter.operator !== 'is empty' &&
                    filter.operator !== 'is not empty'
                  "
                  type="text"
                  class="template-module-editor-input"
                  v-model="filter.value"
                  placeholder="Value"
                  @input="updateQuery"
                  @focus="setEditing(true)"
                  @blur="setEditing(false)"
                />
                <button
                  class="template-module-editor-line-action"
                  @click.stop="removeFilter(index)"
                  title="Remove filter"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="template-module-editor-line">
            <button class="add-filter-button" @click="addFilter()">
              <i class="fas fa-plus"></i> Add Filter
            </button>
          </div>
        </div>

        <!-- Inline query option -->
        <div class="template-module-editor-line">
          <div class="template-module-editor-checkbox-group">
            <input
              type="checkbox"
              id="inline-query-toggle"
              v-model="queryConfig.inline"
              @change="updateQuery"
            />
            <label
              for="inline-query-toggle"
              class="template-module-editor-checkbox-label"
            >
              Use as inline query
              <span
                class="tooltip-icon"
                v-tooltip="
                  'When checked, the query will be an inline query using `${dv.list(...)}` syntax rather than a code block'
                "
              >
                <i class="fas fa-info-circle"></i>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Editor Mode (for advanced users) -->
    <div v-else>
      <div class="template-module-editor-line">
        <div class="template-module-editor-code-editor">
          <textarea
            class="template-module-editor-code-textarea"
            v-model="rawQuery"
            placeholder="Enter Dataview LIST query..."
            rows="8"
            @input="validateRawQuery"
            @focus="setEditing(true)"
            @blur="setEditing(false)"
            :ref="isSelected && autoFocus ? setInputRef : undefined"
          ></textarea>

          <div
            v-if="validationError"
            class="template-module-editor-validation-error"
          >
            <i class="fas fa-exclamation-triangle"></i>
            {{ validationError }}
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Editor Mode Button -->
    <div class="template-module-editor-actions">
      <button
        class="template-module-editor-toggle-mode"
        @click="toggleEditorMode"
        title="Toggle between visual builder and code editor"
      >
        <i
          :class="editorMode === 'visual' ? 'fas fa-code' : 'fas fa-sliders-h'"
        ></i>
        {{
          editorMode === "visual"
            ? "Switch to Code Editor"
            : "Switch to Visual Builder"
        }}
      </button>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { obsidianApiService } from "@/services/obsidian";
import {
  DataviewQueryType,
  DataviewQueryConfig,
  DataviewFilterOperator,
  DataviewSortDirection,
  DataviewFilterCondition,
  DataviewSort,
  COMMON_SOURCES,
  generateDataviewQuery,
  validateDataviewQuery,
  parseDataviewQuery,
} from "@/utils/dataviewUtils";

const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

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
const inputRef = ref<HTMLInputElement | null>(null);

// State variables
const editorMode = ref<"visual" | "code">("visual");
const rawQuery = ref("");
const validationError = ref("");
const selectedSourceType = ref("current-folder");
const showAdvanced = ref(false);
const selectedLimit = ref("0");
const sortField = ref("");
const sortDirection = ref("desc");
const obsidianFolders = ref<string[]>([]);

// Default query configuration for LIST queries
const queryConfig = ref<DataviewQueryConfig>({
  type: DataviewQueryType.LIST,
  fields: [], // LIST queries typically don't specify fields
  source: '"."',
  filters: [],
  sorts: [],
  inline: false,
  limit: undefined,
});

// Fetch folders from Obsidian if possible
onMounted(async () => {
  try {
    if (obsidianApiService.isInitialized()) {
      // Try to get vault info to get available folders
      const vaultInfo = await obsidianApiService.getVaultInfo();
      if (vaultInfo.folders) {
        obsidianFolders.value = vaultInfo.folders;
      }
    }
  } catch (error) {
    console.warn("Could not fetch Obsidian folders:", error);
  }
});

// Combined sources - standard ones plus folders from Obsidian
const availableSources = computed(() => {
  // Start with the common sources
  const sources = [...COMMON_SOURCES];

  // Add folders from Obsidian if available
  if (obsidianFolders.value.length > 0) {
    // Filter out folders already in common sources
    const existingFolderPaths = sources
      .filter((s) => s.type === "folder")
      .map((s) => s.value.replace(/["']/g, ""));

    // Add each folder as a new source option
    obsidianFolders.value.forEach((folder) => {
      // Skip if this folder is already in the common sources
      if (!existingFolderPaths.includes(folder)) {
        sources.push({
          id: `folder-${folder}`,
          label: `Folder: ${folder}`,
          type: "folder",
          value: `"${folder}"`,
          placeholder: "Enter folder path",
        });
      }
    });
  }

  // Always add a custom option at the end
  sources.push({
    id: "custom",
    label: "Custom source",
    type: "custom",
    value: "",
    placeholder: "Enter custom source",
  });

  return sources;
});

// Generated query based on current configuration
const generatedQuery = computed(() => {
  try {
    return generateDataviewQuery(queryConfig.value);
  } catch (error) {
    return "# Error generating query";
  }
});

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

const setInputRef = (el: HTMLInputElement) => {
  inputRef.value = el;
  baseModuleRef.value?.setInputRef(el);
};

// Initialize from props
onMounted(() => {
  // Ensure module has correct type and plugin type
  if (
    props.module.type !== "dataviewListQuery" ||
    props.module.pluginType !== "dataview"
  ) {
    const updatedModule = {
      ...props.module,
      type: "dataviewListQuery",
      pluginType: "dataview",
    };

    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }

  initializeFromContent();
});

// Watch for content changes from parent
watch(
  () => props.module.content,
  () => {
    initializeFromContent();
  },
  { deep: true }
);

// Initialize component from content
function initializeFromContent() {
  const content = props.module.content?.join("\n") || "";

  // If it's empty, use the default configuration
  if (!content.trim()) {
    const defaultConfig: DataviewQueryConfig = {
      type: DataviewQueryType.LIST,
      fields: [],
      source: '"."',
      filters: [],
      sorts: [],
      inline: false,
    };

    queryConfig.value = defaultConfig;
    rawQuery.value = generateDataviewQuery(defaultConfig);
    return;
  }

  // Set the raw query content
  rawQuery.value = content;

  // Try to parse the content as a Dataview query
  const parsedConfig = parseDataviewQuery(content);

  if (parsedConfig) {
    // Ensure the type is LIST
    parsedConfig.type = DataviewQueryType.LIST;
    queryConfig.value = parsedConfig;

    // Set the source type based on the source
    setSourceTypeFromSource(parsedConfig.source);

    // Set the limit dropdown
    setLimitFromConfig();

    // Set the sort field
    setSortFromConfig();

    validationError.value = "";
  } else {
    // If parsing fails, keep the raw query but show a validation error
    validationError.value =
      "Could not parse the query. You can still edit it in code mode.";
    editorMode.value = "code";
  }
}

// Toggle between visual and code editor modes
function toggleEditorMode() {
  if (editorMode.value === "visual") {
    // Switching to code mode
    rawQuery.value = generateDataviewQuery(queryConfig.value);
    editorMode.value = "code";
  } else {
    // Switching to visual mode
    try {
      const parsedConfig = parseDataviewQuery(rawQuery.value);
      if (parsedConfig) {
        // Ensure the type is LIST
        parsedConfig.type = DataviewQueryType.LIST;
        queryConfig.value = parsedConfig;

        // Set the source type based on the source
        setSourceTypeFromSource(parsedConfig.source);

        // Set the limit dropdown
        setLimitFromConfig();

        // Set the sort field
        setSortFromConfig();

        validationError.value = "";
        editorMode.value = "visual";
      } else {
        // Parsing failed
        validationError.value =
          "Could not parse the query. Please check the syntax.";
      }
    } catch (error) {
      validationError.value = "Error parsing query.";
    }
  }
}

// Set limit dropdown from config value
function setLimitFromConfig() {
  const limit = queryConfig.value.limit;
  if (!limit) {
    selectedLimit.value = "0";
  } else if ([5, 10, 20, 50].includes(limit)) {
    selectedLimit.value = limit.toString();
  } else {
    selectedLimit.value = "custom";
  }
}

// Set sort field from config value
function setSortFromConfig() {
  if (queryConfig.value.sorts && queryConfig.value.sorts.length > 0) {
    const firstSort = queryConfig.value.sorts[0];
    sortDirection.value = firstSort.direction;

    // Check if it's a standard field
    if (["file.ctime", "file.mtime", "file.name"].includes(firstSort.field)) {
      sortField.value = firstSort.field;
    } else {
      // For custom fields, default to "file.name"
      sortField.value = "file.name";
    }
  } else {
    sortField.value = "";
    sortDirection.value = "desc";
  }
}

// Validate raw query input
function validateRawQuery() {
  validationError.value = "";

  // Skip validation if empty
  if (!rawQuery.value.trim()) return;

  // Validate Dataview query
  const validation = validateDataviewQuery(rawQuery.value);
  if (!validation.isValid) {
    validationError.value = validation.error || "Invalid Dataview query";
    return;
  }

  // Check if it's a LIST query
  if (!rawQuery.value.includes("LIST") && !rawQuery.value.includes("dv.list")) {
    validationError.value = "This should be a LIST query";
    return;
  }

  // If valid, update the content
  emit("update:content", [rawQuery.value]);
}

// Update content from parent
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Add a filter
function addFilter() {
  const newFilter: DataviewFilterCondition = {
    id: uuidv4(),
    field: "",
    operator: DataviewFilterOperator.EQUALS,
    value: "",
    isMetadata: true,
  };

  queryConfig.value.filters.push(newFilter);
  updateQuery();
}

// Remove a filter
function removeFilter(index: number) {
  queryConfig.value.filters.splice(index, 1);
  updateQuery();
}

// Update sorting based on selected fields
function updateSorting() {
  // Clear any existing sorts
  queryConfig.value.sorts = [];

  // If a sort field is selected, add it
  if (sortField.value) {
    queryConfig.value.sorts.push({
      field: sortField.value,
      direction: sortDirection.value as DataviewSortDirection,
      isMetadata: true,
    });
  }

  updateQuery();
}

// Update limit based on dropdown selection
function updateLimit() {
  if (selectedLimit.value === "0") {
    queryConfig.value.limit = undefined;
  } else if (selectedLimit.value === "custom") {
    // Let the user input their own limit
  } else {
    queryConfig.value.limit = parseInt(selectedLimit.value);
  }

  updateQuery();
}

// Get placeholder text based on selected source type
function getSourcePlaceholder(): string {
  const selectedSource = availableSources.value.find(
    (s) => s.id === selectedSourceType.value
  );
  return selectedSource?.placeholder || "Enter source";
}

// Handle source type change
function handleSourceTypeChange() {
  const selectedSource = availableSources.value.find(
    (s) => s.id === selectedSourceType.value
  );

  if (selectedSource) {
    queryConfig.value.source = selectedSource.value;
    updateQuery();
  }
}

// Set source type based on source value
function setSourceTypeFromSource(source: string) {
  // Try to match the source with one of the common sources
  const matchedSource = availableSources.value.find((s) => s.value === source);

  if (matchedSource) {
    selectedSourceType.value = matchedSource.id;
  } else {
    // If no match, set to custom
    selectedSourceType.value = "custom";

    // If it's a custom source, store the value
    if (source) {
      const customSource = availableSources.value.find(
        (s) => s.id === "custom"
      );
      if (customSource) {
        customSource.value = source;
      }
    }
  }
}

// Apply preset query configuration
function applyPreset() {
  if (!selectedPreset.value) return;

  // Clear filters and sorts
  queryConfig.value.filters = [];
  queryConfig.value.sorts = [];

  switch (selectedPreset.value) {
    case "recent":
      // Recent notes, sorted by creation date
      selectedSourceType.value = "current-folder";
      queryConfig.value.source = '"."';
      sortField.value = "file.ctime";
      sortDirection.value = "desc";
      selectedLimit.value = "10";
      queryConfig.value.limit = 10;
      break;

    case "tagged":
      // Notes with a specific tag
      selectedSourceType.value = "tag";
      queryConfig.value.source = '"tag"';
      sortField.value = "file.mtime";
      sortDirection.value = "desc";
      selectedLimit.value = "0";
      queryConfig.value.limit = undefined;
      break;

    case "folder":
      // Notes in a specific folder
      selectedSourceType.value = "folder";
      queryConfig.value.source = '"folder"';
      sortField.value = "file.name";
      sortDirection.value = "asc";
      selectedLimit.value = "0";
      queryConfig.value.limit = undefined;
      break;

    case "created":
      // Notes created this week
      selectedSourceType.value = "current-folder";
      queryConfig.value.source = '"."';
      // Add filter for created this week
      queryConfig.value.filters.push({
        id: uuidv4(),
        field: "file.ctime",
        operator: ">",
        value: "date(today) - dur(1 week)",
        isMetadata: true,
      });
      sortField.value = "file.ctime";
      sortDirection.value = "desc";
      selectedLimit.value = "0";
      queryConfig.value.limit = undefined;
      break;

    case "modified":
      // Recently modified notes
      selectedSourceType.value = "current-folder";
      queryConfig.value.source = '"."';
      sortField.value = "file.mtime";
      sortDirection.value = "desc";
      selectedLimit.value = "5";
      queryConfig.value.limit = 5;
      break;

    case "custom":
      // Reset to default but keep as custom
      selectedSourceType.value = "current-folder";
      queryConfig.value.source = '"."';
      sortField.value = "";
      selectedLimit.value = "0";
      queryConfig.value.limit = undefined;
      break;
  }

  updateSorting();
  updateQuery();
}

// Generate query from config and update content
function updateQuery() {
  if (editorMode.value === "visual") {
    // Ensure type is LIST
    queryConfig.value.type = DataviewQueryType.LIST;

    // Generate the updated query
    const query = generateDataviewQuery(queryConfig.value);

    // Update the raw query (useful when switching to code mode)
    rawQuery.value = query;

    // Emit the updated content
    emit("update:content", [query]);

    const updatedModules = [...props.modules];
    updatedModules[props.index] = {
      ...props.module,
      content: [query],
    };

    emit("update", updatedModules);
  }
}
</script>

<style scoped>
/* Use the application's existing styles for consistency */
.template-module-editor-line {
  margin-bottom: var(--spacing-md);
}

.template-module-editor-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.template-module-editor-label {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.9rem;
}

.template-module-editor-inputs-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.template-module-editor-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-module-editor-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.source-type-select {
  flex: 0 0 auto;
  min-width: 140px;
  max-width: 140px;
}

.template-module-editor-section {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.02);
}

.template-module-editor-section-header {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.template-module-editor-section-header i {
  color: var(--color-primary);
}

.template-module-editor-line-action {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s;
  opacity: 0.7;
}

.template-module-editor-line-action:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  opacity: 1;
}

.add-filter-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: none;
  border: 1px dashed var(--color-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-filter-button:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
  background-color: rgba(255, 171, 88, 0.05);
}

.advanced-toggle-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  padding: var(--spacing-xs) 0;
  transition: all 0.2s;
}

.advanced-toggle-button:hover {
  color: var(--color-text);
}

.advanced-toggle-button i {
  width: 16px;
  text-align: center;
}

.template-module-editor-checkbox-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.template-module-editor-checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
}

.tooltip-icon {
  color: var(--color-text-muted);
  cursor: help;
}

.template-module-editor-code-editor {
  width: 100%;
}

.template-module-editor-code-textarea {
  width: 100%;
  min-height: 180px;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-family: var(--font-monospace, monospace);
  font-size: 0.9rem;
  resize: vertical;
}

.template-module-editor-code-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-module-editor-validation-error {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.template-module-editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}

.template-module-editor-toggle-mode {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.template-module-editor-toggle-mode:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

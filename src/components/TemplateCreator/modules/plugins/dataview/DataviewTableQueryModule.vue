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
    <div class="dataview-builder">
      <!-- Title -->
      <div class="builder-header">
        <h2><i class="fas fa-table"></i> Dataview Table</h2>
      </div>

      <!-- FIELDS -->
      <section class="builder-section">
        <label class="section-label">
          Fields
          <small>(Columns)</small>
        </label>
        <div class="fields-list">
          <div
            v-for="(field, idx) in queryConfig.fields"
            :key="idx"
            class="field-item"
          >
            <input
              class="field-input"
              v-model="queryConfig.fields[idx]"
              placeholder="e.g. file.ctime"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              :ref="
                idx === 0 && isSelected && autoFocus ? setInputRef : undefined
              "
            />
            <button
              class="remove-btn"
              title="Remove field"
              @click="removeField(idx)"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="actions-row">
          <button class="add-btn" @click="addField">+ Add Field</button>
          <button class="add-btn" @click="toggleCommonFields">
            ⋮ Common Fields
          </button>
        </div>

        <!-- Common Fields Dropdown -->
        <div v-if="showCommonFields" class="common-fields-dropdown">
          <div class="dropdown-header">
            <span>Common Metadata</span>
            <button class="close-dropdown" @click="toggleCommonFields">
              ✕
            </button>
          </div>
          <div class="dropdown-list">
            <div
              v-for="field in commonFields"
              :key="field.id"
              class="dropdown-item"
              @click="addCommonField(field.id)"
            >
              <strong>{{ field.label }}</strong>
              <small>{{ field.type }}</small>
            </div>
          </div>
        </div>
      </section>

      <!-- SOURCE -->
      <section class="builder-section">
        <label class="section-label">Source</label>
        <div class="source-row">
          <select
            class="source-select"
            v-model="selectedSourceType"
            @change="handleSourceTypeChange"
          >
            <option
              v-for="source in commonSources"
              :key="source.id"
              :value="source.id"
            >
              {{ source.label }}
            </option>
          </select>
          <input
            class="source-input"
            type="text"
            v-model="queryConfig.source"
            :placeholder="sourcePlaceholder"
            @input="updateQuery"
            @focus="setEditing(true)"
            @blur="setEditing(false)"
          />
        </div>
      </section>

      <!-- FILTERS -->
      <section class="builder-section collapsible">
        <div class="section-header" @click="toggleSection('filtersOpen')">
          <span>Filters</span>
          <span class="chevron">{{ filtersOpen ? "▲" : "▼" }}</span>
        </div>
        <div v-if="filtersOpen" class="filters-body">
          <div
            v-for="(filter, idx) in queryConfig.filters"
            :key="filter.id"
            class="filter-row"
          >
            <input
              class="filter-field"
              v-model="filter.field"
              placeholder="Field"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />
            <select
              class="filter-operator"
              v-model="filter.operator"
              @change="updateQuery"
            >
              <option v-for="op in filterOperators" :key="op" :value="op">
                {{ op }}
              </option>
            </select>
            <input
              v-if="showFilterValue(filter.operator)"
              class="filter-value"
              v-model="filter.value"
              placeholder="Value"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />
            <button class="remove-btn" @click="removeFilter(idx)">✕</button>
          </div>
          <button class="add-btn" @click="addFilter">+ Add Filter</button>
        </div>
      </section>

      <!-- SORTING -->
      <section class="builder-section collapsible">
        <div class="section-header" @click="toggleSection('sortingOpen')">
          <span>Sorting</span>
          <span class="chevron">{{ sortingOpen ? "▲" : "▼" }}</span>
        </div>
        <div v-if="sortingOpen" class="sorting-body">
          <div
            v-for="(sort, idx) in queryConfig.sorts"
            :key="idx"
            class="sort-row"
          >
            <input
              class="sort-field"
              v-model="sort.field"
              placeholder="Field"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />
            <select
              class="sort-direction"
              v-model="sort.direction"
              @change="updateQuery"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <button class="remove-btn" @click="removeSort(idx)">✕</button>
          </div>
          <button class="add-btn" @click="addSort">+ Add Sort</button>
        </div>
      </section>

      <!-- ADVANCED (Group By, Limit, Inline) -->
      <section class="builder-section collapsible">
        <div class="section-header" @click="toggleSection('advancedOpen')">
          <span>Advanced</span>
          <span class="chevron">{{ advancedOpen ? "▲" : "▼" }}</span>
        </div>
        <div v-if="advancedOpen" class="advanced-body">
          <!-- Group By -->
          <div class="advanced-item">
            <label>Group By (optional)</label>
            <input
              class="group-input"
              v-model="groupField"
              placeholder="Field to group by"
              @input="updateGroupBy"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />
          </div>
          <!-- Limit -->
          <div class="advanced-item">
            <label>Limit (optional)</label>
            <input
              class="limit-input"
              type="number"
              v-model.number="queryConfig.limit"
              placeholder="Max results"
              min="1"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />
          </div>
          <!-- Inline -->
          <div class="advanced-item inline-check">
            <label>
              <input
                type="checkbox"
                v-model="queryConfig.inline"
                @change="updateQuery"
              />
              Inline Query
            </label>
          </div>
        </div>
      </section>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import {
  DataviewQueryType,
  DataviewQueryConfig,
  DataviewFilterOperator,
  DataviewSortDirection,
  DataviewFilterCondition,
  DataviewSort,
  COMMON_METADATA_FIELDS,
  COMMON_SOURCES,
  generateDataviewQuery,
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

// Refs
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// UI Toggles
const showCommonFields = ref(false);
const filtersOpen = ref(true);
const sortingOpen = ref(false);
const advancedOpen = ref(false);

// Query config
const queryConfig = ref<DataviewQueryConfig>({
  type: DataviewQueryType.TABLE,
  fields: ["file.link"], // Start simpler with just one default
  source: '"."',
  filters: [],
  sorts: [],
  inline: false,
  limit: undefined,
});

// Additional state
const groupField = ref("");
const selectedSourceType = ref("current-folder");

const commonSources = computed(() => COMMON_SOURCES);
const commonFields = COMMON_METADATA_FIELDS;
const filterOperators = Object.values(DataviewFilterOperator);

// Lifecycle
onMounted(() => {
  if (
    props.module.type !== "dataviewTableQuery" ||
    props.module.pluginType !== "dataview"
  ) {
    const updatedModule = {
      ...props.module,
      type: "dataviewTableQuery",
      pluginType: "dataview",
    };
    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }
  initFromContent();
});

watch(
  () => props.module.content,
  () => {
    initFromContent();
  },
  { deep: true }
);

// Methods
function initFromContent() {
  const content = props.module.content?.join("\n") || "";
  if (!content.trim()) {
    // If no content, ensure defaults
    queryConfig.value = {
      type: DataviewQueryType.TABLE,
      fields: ["file.link"],
      source: '"."',
      filters: [],
      sorts: [],
      inline: false,
    };
    updateQuery();
    return;
  }

  const parsed = parseDataviewQuery(content);
  if (parsed && parsed.type === DataviewQueryType.TABLE) {
    queryConfig.value = parsed;
    groupField.value = parsed.groupBy?.field || "";
    setSourceTypeFromSource(parsed.source);
  }
}

function updateQuery() {
  // Generate the raw markdown from queryConfig
  queryConfig.value.type = DataviewQueryType.TABLE;
  const query = generateDataviewQuery(queryConfig.value);
  emit("update:content", [query]);
}

function setEditing(editing: boolean) {
  baseModuleRef.value?.setEditing(editing);
}

function setInputRef(el: HTMLInputElement) {
  inputRef.value = el;
  baseModuleRef.value?.setInputRef(el);
}

// Fields
function addField() {
  queryConfig.value.fields.push("");
  updateQuery();
}

function removeField(idx: number) {
  queryConfig.value.fields.splice(idx, 1);
  updateQuery();
}

// Common Fields
function toggleCommonFields() {
  showCommonFields.value = !showCommonFields.value;
}

function addCommonField(fieldId: string) {
  queryConfig.value.fields.push(fieldId);
  showCommonFields.value = false;
  updateQuery();
}

// Filters
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

function removeFilter(idx: number) {
  queryConfig.value.filters.splice(idx, 1);
  updateQuery();
}

function showFilterValue(operator: string) {
  return operator !== "is empty" && operator !== "is not empty";
}

// Sorting
function addSort() {
  const newSort: DataviewSort = {
    field: "",
    direction: DataviewSortDirection.ASC,
    isMetadata: true,
  };
  queryConfig.value.sorts.push(newSort);
  updateQuery();
}

function removeSort(idx: number) {
  queryConfig.value.sorts.splice(idx, 1);
  updateQuery();
}

// Advanced
function updateGroupBy() {
  if (groupField.value.trim()) {
    queryConfig.value.groupBy = {
      field: groupField.value.trim(),
      isMetadata: true,
    };
  } else {
    queryConfig.value.groupBy = undefined;
  }
  updateQuery();
}

// Source
function handleSourceTypeChange() {
  const selected = commonSources.value.find(
    (s) => s.id === selectedSourceType.value
  );
  if (selected) {
    queryConfig.value.source = selected.value;
    updateQuery();
  }
}

function setSourceTypeFromSource(source: string) {
  const match = commonSources.value.find((s) => s.value === source);
  selectedSourceType.value = match ? match.id : "custom";
}

const sourcePlaceholder = computed(() => {
  const selected = commonSources.value.find(
    (s) => s.id === selectedSourceType.value
  );
  return selected?.placeholder || "Enter folder/tag/etc.";
});

function toggleSection(
  section: "filtersOpen" | "sortingOpen" | "advancedOpen"
) {
  if (section === "filtersOpen") filtersOpen.value = !filtersOpen.value;
  if (section === "sortingOpen") sortingOpen.value = !sortingOpen.value;
  if (section === "advancedOpen") advancedOpen.value = !advancedOpen.value;
}

// Forward content updates from the BaseModule
function updateContent(content: string[]) {
  emit("update:content", content);
}
</script>

<style scoped>
/* Container */
.dataview-builder {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
  background: var(--background-primary);
  border-radius: 6px;
}

/* Header */
.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.builder-header h2 {
  font-size: 1rem;
  color: var(--text-normal);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.builder-header i {
  color: var(--interactive-accent);
}

/* Section Layout */
.builder-section {
  background: var(--background-secondary);
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-normal);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.section-label small {
  color: var(--text-muted);
  font-weight: normal;
}

/* Fields */
.fields-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.field-input {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 3px;
  background: var(--background-primary);
  color: var(--text-normal);
}

.field-input:focus {
  border-color: var(--interactive-accent);
  outline: none;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--text-muted);
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  text-align: center;
  border-radius: 2px;
}

.remove-btn:hover {
  background-color: var(--background-modifier-hover);
  color: var(--text-error);
}

/* Common Fields */
.actions-row {
  display: flex;
  gap: 0.25rem;
}

.add-btn {
  background: var(--background-primary);
  border: 1px dashed var(--background-modifier-border);
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  cursor: pointer;
}

.add-btn:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
  border-color: var(--background-modifier-border-hover);
}

.common-fields-dropdown {
  position: relative;
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  padding: 0.25rem 0.5rem 0.5rem;
  margin-top: 0.25rem;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  color: var(--text-normal);
}

.close-dropdown {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
}

.dropdown-list {
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-item {
  padding: 0.25rem 0.25rem;
  border-radius: 3px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--background-modifier-hover);
}

/* Source */
.source-row {
  display: flex;
  gap: 0.25rem;
}

.source-select,
.source-input {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 3px;
  background: var(--background-primary);
  color: var(--text-normal);
}

.source-select:focus,
.source-input:focus {
  border-color: var(--interactive-accent);
  outline: none;
}

/* Collapsible Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: var(--background-primary);
  padding: 0.3rem 0.4rem;
  border-radius: 3px;
}

.section-header:hover {
  background: var(--background-modifier-hover);
}

.section-header span {
  font-size: 0.85rem;
  color: var(--text-normal);
}

.chevron {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Filters */
.filters-body,
.sorting-body,
.advanced-body {
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-row {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.filter-field,
.filter-operator,
.filter-value {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 3px;
  background: var(--background-primary);
  color: var(--text-normal);
}

/* Sorting */
.sort-row {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.sort-field,
.sort-direction {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 3px;
  background: var(--background-primary);
  color: var(--text-normal);
}

/* Advanced */
.advanced-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.advanced-item label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.group-input,
.limit-input {
  padding: 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 3px;
  background: var(--background-primary);
  color: var(--text-normal);
}

.inline-check {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.inline-check input {
  transform: scale(1.2);
  cursor: pointer;
}
</style>

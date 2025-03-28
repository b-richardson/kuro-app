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
    <div class="dataview-calendar-module">
      <!-- Module Title -->
      <div class="dataview-module-title">
        <i class="fas fa-calendar-alt"></i> Dataview Calendar Query
      </div>
      
      <!-- Visual Builder Mode -->
      <div v-if="editorMode === 'visual'" class="dataview-visual-builder">
        <!-- Date Field Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-calendar-alt"></i> Date Field
          </h3>
          <div class="dataview-date-field-container">
            <p class="dataview-info">
              <i class="fas fa-info-circle"></i>
              Calendar view requires a date field to organize notes by date. Select a field that contains dates.
            </p>
            
            <div class="dataview-date-field-input">
              <input 
                type="text" 
                v-model="dateField"
                placeholder="Field containing date (e.g. file.ctime, date, due)"
                class="dataview-input"
                @input="updateDateField"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
                :ref="isSelected && autoFocus ? setInputRef : undefined"
              />
            </div>
            
            <div class="dataview-date-field-suggestions">
              <p class="dataview-subheading">Common Date Fields:</p>
              <div class="dataview-suggestion-buttons">
                <button 
                  v-for="suggestion in commonDateFields" 
                  :key="suggestion.id"
                  class="dataview-suggestion-btn"
                  @click="selectDateField(suggestion.id)"
                >
                  {{ suggestion.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Source Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-filter"></i> Source
          </h3>
          <div class="dataview-source-container">
            <div class="dataview-source-select">
              <select 
                v-model="selectedSourceType"
                class="dataview-select"
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
            </div>
            
            <div class="dataview-source-value">
              <input 
                type="text" 
                v-model="queryConfig.source"
                :placeholder="getSourcePlaceholder()"
                class="dataview-input"
                @input="updateQuery"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
              />
            </div>
          </div>
        </div>
        
        <!-- Filters Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-filter"></i> Additional Filters
          </h3>
          <div class="dataview-filters-container">
            <div 
              v-for="(filter, index) in filters" 
              :key="filter.id"
              class="dataview-filter-row"
            >
              <div class="dataview-filter-field">
                <input 
                  type="text" 
                  v-model="filter.field"
                  placeholder="Field name"
                  class="dataview-input"
                  @input="updateFilters"
                  @focus="setEditing(true)"
                  @blur="setEditing(false)"
                />
              </div>
              
              <div class="dataview-filter-operator">
                <select 
                  v-model="filter.operator"
                  class="dataview-select"
                  @change="updateFilters"
                >
                  <option 
                    v-for="op in filterOperators"
                    :key="op"
                    :value="op"
                  >
                    {{ op }}
                  </option>
                </select>
              </div>
              
              <div 
                v-if="filter.operator !== 'is empty' && filter.operator !== 'is not empty'" 
                class="dataview-filter-value"
              >
                <input 
                  type="text" 
                  v-model="filter.value"
                  placeholder="Value"
                  class="dataview-input"
                  @input="updateFilters"
                  @focus="setEditing(true)"
                  @blur="setEditing(false)"
                />
              </div>
              
              <div class="dataview-filter-controls">
                <button 
                  class="dataview-btn-icon dataview-btn-remove"
                  @click="removeFilter(index)"
                  title="Remove filter"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <button 
              class="dataview-btn-add"
              @click="addFilter()"
            >
              <i class="fas fa-plus"></i> Add Filter
            </button>
          </div>
        </div>
        
        <!-- Limit Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-sort-numeric-down"></i> Limit 
            <span class="dataview-optional">(Optional)</span>
          </h3>
          <div class="dataview-limit-container">
            <input 
              type="number" 
              v-model.number="queryConfig.limit"
              placeholder="Number of results (leave empty for no limit)"
              class="dataview-input"
              @input="updateQuery"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              min="1"
            />
          </div>
        </div>
        
        <!-- Options Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-cog"></i> Options
          </h3>
          <div class="dataview-options-container">
            <label class="dataview-checkbox">
              <input 
                type="checkbox" 
                v-model="queryConfig.inline"
                @change="updateQuery"
              />
              <span class="dataview-checkbox-label">
                Inline Query
                <span class="dataview-tooltip" title="When checked, the query will be an inline query using `${dv.calendar(...)}` syntax rather than a code block">
                  <i class="fas fa-info-circle"></i>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Code Editor Mode -->
      <div v-else class="dataview-code-editor">
        <textarea
          v-model="rawQuery"
          class="dataview-code-textarea"
          placeholder="Enter Dataview CALENDAR query..."
          rows="10"
          @input="validateRawQuery"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :ref="isSelected && autoFocus ? setInputRef : undefined"
        ></textarea>
        
        <div v-if="validationError" class="dataview-validation-error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ validationError }}
        </div>
      </div>
      
      <!-- Preview Section -->
      <div class="dataview-section">
        <h3 class="dataview-section-title">
          <i class="fas fa-eye"></i> Preview
        </h3>
        <div class="dataview-preview-container">
          <pre class="dataview-query-preview"><code>{{ generatedQuery }}</code></pre>
        </div>
      </div>
      
      <!-- Bottom controls -->
      <div class="dataview-module-controls">
        <button 
          class="dataview-toggle-mode-btn"
          @click="toggleEditorMode"
          title="Toggle between visual builder and code editor"
        >
          <i :class="editorMode === 'visual' ? 'fas fa-code' : 'fas fa-sliders-h'"></i>
          {{ editorMode === 'visual' ? 'Code Editor' : 'Visual Builder' }}
        </button>
      </div>
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
  DataviewFilterCondition,
  COMMON_SOURCES,
  generateDataviewQuery,
  validateDataviewQuery,
  parseDataviewQuery
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
const editorMode = ref<'visual' | 'code'>('visual');
const rawQuery = ref('');
const validationError = ref('');
const selectedSourceType = ref('current-folder');
const dateField = ref('file.day');

// Default query configuration for CALENDAR queries
const queryConfig = ref<DataviewQueryConfig>({
  type: DataviewQueryType.CALENDAR,
  fields: [], // CALENDAR queries don't need fields
  source: '"."',
  filters: [],
  sorts: [],
  inline: false,
  limit: undefined
});

// Common date fields suggestions
const commonDateFields = [
  { id: 'file.day', label: 'File Date' },
  { id: 'file.cday', label: 'Creation Date' },
  { id: 'file.mday', label: 'Modified Date' },
  { id: 'date', label: 'date' },
  { id: 'due', label: 'due' },
  { id: 'created', label: 'created' },
  { id: 'birthday', label: 'birthday' }
];

// Computed properties
const commonSources = computed(() => COMMON_SOURCES);
const filterOperators = Object.values(DataviewFilterOperator);

// Track additional filters separately from date field filter
const filters = ref<DataviewFilterCondition[]>([]);

// Generated query based on current configuration
const generatedQuery = computed(() => {
  try {
    return generateDataviewQuery(queryConfig.value);
  } catch (error) {
    return '# Error generating query';
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
  if (props.module.type !== "dataviewCalendarQuery" || props.module.pluginType !== "dataview") {
    const updatedModule = {
      ...props.module,
      type: "dataviewCalendarQuery",
      pluginType: "dataview",
    };

    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }
  
  initializeFromContent();
  
  console.log('Dataview Calendar Query Module initialized', props.module.type);
});

// Watch for content changes from parent
watch(() => props.module.content, () => {
  initializeFromContent();
}, { deep: true });

// Initialize component from content
function initializeFromContent() {
  const content = props.module.content?.join('\n') || '';
  
  // If it's empty, use the default configuration
  if (!content.trim()) {
    const defaultConfig: DataviewQueryConfig = {
      type: DataviewQueryType.CALENDAR,
      fields: [],
      source: '"."',
      filters: [
        {
          id: 'calendar-date-field',
          field: 'file.day',
          operator: DataviewFilterOperator.NOT_EMPTY,
          value: '',
          isMetadata: true
        }
      ],
      sorts: [],
      inline: false
    };
    
    queryConfig.value = defaultConfig;
    dateField.value = 'file.day';
    filters.value = [];
    rawQuery.value = generateDataviewQuery(defaultConfig);
    return;
  }
  
  // Set the raw query content
  rawQuery.value = content;
  
  // Try to parse the content as a Dataview query
  const parsedConfig = parseDataviewQuery(content);
  
  if (parsedConfig) {
    // Ensure the type is CALENDAR
    parsedConfig.type = DataviewQueryType.CALENDAR;
    queryConfig.value = parsedConfig;
    
    // Look for a date field in filters or special comment
    extractDateField(parsedConfig.filters);
    
    // Set the source type based on the source
    setSourceTypeFromSource(parsedConfig.source);
    validationError.value = '';
  } else {
    // If parsing fails, keep the raw query but show a validation error
    validationError.value = 'Could not parse the query. You can still edit it in code mode.';
    editorMode.value = 'code';
  }
}

// Extract date field from filters
function extractDateField(allFilters: DataviewFilterCondition[]) {
  // Find a date-like field
  const dateFilter = allFilters.find(f => {
    const fieldLower = f.field.toLowerCase();
    return fieldLower.includes('date') || fieldLower.includes('day') || 
           fieldLower === 'due' || fieldLower === 'created' ||
           fieldLower === 'birthday';
  });
  
  if (dateFilter) {
    dateField.value = dateFilter.field;
    
    // Remove this filter from the regular filters
    filters.value = allFilters.filter(f => f.field !== dateFilter.field);
  } else {
    // Default to file.day if no date field found
    dateField.value = 'file.day';
    filters.value = [...allFilters];
  }
}

// Toggle between visual and code editor modes
function toggleEditorMode() {
  if (editorMode.value === 'visual') {
    // Switching to code mode
    rawQuery.value = generateDataviewQuery(queryConfig.value);
    editorMode.value = 'code';
  } else {
    // Switching to visual mode
    try {
      const parsedConfig = parseDataviewQuery(rawQuery.value);
      if (parsedConfig) {
        // Ensure the type is CALENDAR
        parsedConfig.type = DataviewQueryType.CALENDAR;
        queryConfig.value = parsedConfig;
        
        // Extract date field from filters
        extractDateField(parsedConfig.filters);
        
        validationError.value = '';
        editorMode.value = 'visual';
        
        // Set the source type based on the source
        setSourceTypeFromSource(parsedConfig.source);
      } else {
        // Parsing failed
        validationError.value = 'Could not parse the query. Please check the syntax.';
      }
    } catch (error) {
      validationError.value = 'Error parsing query.';
    }
  }
}

// Validate raw query input
function validateRawQuery() {
  validationError.value = '';
  
  // Skip validation if empty
  if (!rawQuery.value.trim()) return;
  
  // Validate Dataview query
  const validation = validateDataviewQuery(rawQuery.value);
  if (!validation.isValid) {
    validationError.value = validation.error || 'Invalid Dataview query';
    return;
  }
  
  // Check if it's a CALENDAR query
  if (!rawQuery.value.includes('CALENDAR') && !rawQuery.value.includes('dv.calendar')) {
    validationError.value = 'This should be a CALENDAR query';
    return;
  }
  
  // If valid, update the content
  emit("update:content", [rawQuery.value]);
}

// Update content from parent
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Update date field
function updateDateField() {
  updateAllFilters();
}

// Select a date field from suggestions
function selectDateField(field: string) {
  dateField.value = field;
  updateDateField();
}

// Add a filter
function addFilter() {
  const newFilter: DataviewFilterCondition = {
    id: uuidv4(),
    field: '',
    operator: DataviewFilterOperator.EQUALS,
    value: '',
    isMetadata: true
  };
  
  filters.value.push(newFilter);
  updateFilters();
}

// Remove a filter
function removeFilter(index: number) {
  filters.value.splice(index, 1);
  updateFilters();
}

// Update filters and combine with date field filter
function updateFilters() {
  updateAllFilters();
}

// Update all filters including date field filter
function updateAllFilters() {
  // Combine date field filter with other filters
  const allFilters: DataviewFilterCondition[] = [];
  
  // Add date field filter if specified
  if (dateField.value.trim()) {
    allFilters.push({
      id: 'calendar-date-field',
      field: dateField.value.trim(),
      operator: DataviewFilterOperator.NOT_EMPTY,
      value: '',
      isMetadata: true
    });
  }
  
  // Add other filters
  filters.value.forEach(filter => {
    if (filter.field.trim()) {
      allFilters.push(filter);
    }
  });
  
  // Update the query configuration
  queryConfig.value.filters = allFilters;
  updateQuery();
}

// Get placeholder text based on selected source type
function getSourcePlaceholder(): string {
  const selectedSource = commonSources.value.find(s => s.id === selectedSourceType.value);
  return selectedSource?.placeholder || 'Enter source';
}

// Handle source type change
function handleSourceTypeChange() {
  const selectedSource = commonSources.value.find(s => s.id === selectedSourceType.value);
  
  if (selectedSource) {
    queryConfig.value.source = selectedSource.value;
    updateQuery();
  }
}

// Set source type based on source value
function setSourceTypeFromSource(source: string) {
  // Try to match the source with one of the common sources
  const matchedSource = commonSources.value.find(s => s.value === source);
  
  if (matchedSource) {
    selectedSourceType.value = matchedSource.id;
  } else {
    // If no match, set to custom
    selectedSourceType.value = 'custom';
  }
}

// Generate query from config and update content
function updateQuery() {
  if (editorMode.value === 'visual') {
    // Ensure type is CALENDAR
    queryConfig.value.type = DataviewQueryType.CALENDAR;
    
    // Generate the updated query
    const query = generateDataviewQuery(queryConfig.value);
    
    // Update the raw query (useful when switching to code mode)
    rawQuery.value = query;
    
    // Emit the updated content
    emit("update:content", [query]);
  }
}
</script>

<style scoped>
.dataview-calendar-module {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

.dataview-module-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--background-modifier-border);
}

.dataview-module-title i {
  color: var(--interactive-accent);
}

.dataview-visual-builder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.dataview-section {
  background-color: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 6px;
  padding: 1rem;
}

.dataview-section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-normal);
}

.dataview-section-title i {
  color: var(--interactive-accent);
}

.dataview-optional {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--text-muted);
  margin-left: 0.25rem;
}

.dataview-date-field-container,
.dataview-source-container,
.dataview-filters-container,
.dataview-limit-container,
.dataview-options-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-info {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  background-color: var(--background-secondary);
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.dataview-info i {
  color: var(--interactive-accent);
  margin-top: 0.2rem;
}

.dataview-date-field-suggestions {
  margin-top: 0.5rem;
}

.dataview-subheading {
  font-size: 0.8375rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.dataview-suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dataview-suggestion-btn {
  padding: 0.375rem 0.625rem;
  background-color: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  font-size: 0.8125rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataview-suggestion-btn:hover {
  background-color: var(--background-modifier-hover);
  color: var(--text-normal);
}

.dataview-source-container {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
}

.dataview-source-select {
  width: 150px;
}

.dataview-source-value {
  flex: 1;
}

.dataview-filter-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dataview-filter-field {
  flex: 1;
}

.dataview-filter-operator {
  width: 150px;
}

.dataview-filter-value {
  flex: 1;
}

.dataview-select,
.dataview-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
  background: var(--background-secondary);
  color: var(--text-normal);
  font-size: 0.9rem;
}

.dataview-select:focus,
.dataview-input:focus {
  border-color: var(--interactive-accent);
  outline: none;
}

.dataview-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataview-btn-icon:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
}

.dataview-btn-remove:hover {
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  border-color: rgba(255, 0, 0, 0.2);
}

.dataview-btn-add {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  background: var(--background-secondary);
  border: 1px dashed var(--background-modifier-border);
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.dataview-btn-add:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
  border-color: var(--background-modifier-border-hover);
}

.dataview-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.dataview-checkbox input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.dataview-checkbox-label {
  font-size: 0.9rem;
  color: var(--text-normal);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.dataview-tooltip {
  color: var(--text-muted);
  cursor: help;
}

.dataview-code-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.dataview-code-textarea {
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
  font-family: var(--font-monospace);
  font-size: 0.9em;
  resize: vertical;
}

.dataview-validation-error {
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dataview-preview-container {
  background-color: var(--background-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.dataview-query-preview {
  margin: 0;
  padding: 0.75rem;
  font-family: var(--font-monospace);
  font-size: 0.9em;
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--text-normal);
}

.dataview-module-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.dataview-toggle-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataview-toggle-mode-btn:hover {
  background: var(--background-modifier-hover);
}
</style>
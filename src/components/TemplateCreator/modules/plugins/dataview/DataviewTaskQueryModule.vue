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
    <div class="dataview-task-module">
      <!-- Module Title -->
      <div class="dataview-module-title">
        <i class="fas fa-tasks"></i> Dataview Task Query
      </div>
      
      <!-- Visual Builder Mode -->
      <div v-if="editorMode === 'visual'" class="dataview-visual-builder">
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
                :ref="isSelected && autoFocus ? setInputRef : undefined"
              />
            </div>
          </div>
        </div>

        <!-- Task Filters Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-tasks"></i> Task Filters
          </h3>
          <div class="dataview-task-filters-container">
            <div class="dataview-checkbox-group">
              <label class="dataview-checkbox">
                <input 
                  type="checkbox" 
                  v-model="showCompleted"
                  @change="updateTaskFilters"
                />
                <span class="dataview-checkbox-label">
                  Include completed tasks
                </span>
              </label>
              
              <label class="dataview-checkbox">
                <input 
                  type="checkbox" 
                  v-model="showIncomplete"
                  @change="updateTaskFilters"
                />
                <span class="dataview-checkbox-label">
                  Include incomplete tasks
                </span>
              </label>
            </div>

            <div class="dataview-task-property-filters">
              <div class="dataview-subheading">Task Property Filters</div>
              <div 
                v-for="(filter, index) in taskPropertyFilters" 
                :key="index"
                class="dataview-property-row"
              >
                <div class="dataview-property-field">
                  <input 
                    type="text" 
                    v-model="filter.property"
                    placeholder="Property (e.g. due, priority)"
                    class="dataview-input"
                    @input="updateTaskFilters"
                    @focus="setEditing(true)"
                    @blur="setEditing(false)"
                  />
                </div>
                
                <div class="dataview-property-operator">
                  <select 
                    v-model="filter.operator"
                    class="dataview-select"
                    @change="updateTaskFilters"
                  >
                    <option value="=">equals</option>
                    <option value="!=">not equals</option>
                    <option value=">">greater than</option>
                    <option value="<">less than</option>
                    <option value=">=">greater or equal</option>
                    <option value="<=">less or equal</option>
                    <option value="exists">exists</option>
                    <option value="!exists">doesn't exist</option>
                  </select>
                </div>
                
                <div 
                  v-if="filter.operator !== 'exists' && filter.operator !== '!exists'" 
                  class="dataview-property-value"
                >
                  <input 
                    type="text" 
                    v-model="filter.value"
                    placeholder="Value"
                    class="dataview-input"
                    @input="updateTaskFilters"
                    @focus="setEditing(true)"
                    @blur="setEditing(false)"
                  />
                </div>
                
                <div class="dataview-property-controls">
                  <button 
                    class="dataview-btn-icon dataview-btn-remove"
                    @click="removeTaskProperty(index)"
                    title="Remove property filter"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <button 
                class="dataview-btn-add"
                @click="addTaskProperty"
              >
                <i class="fas fa-plus"></i> Add Property Filter
              </button>
            </div>
          </div>
        </div>
        
        <!-- Sorting Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-sort"></i> Sorting
          </h3>
          <div class="dataview-sorts-container">
            <div 
              v-for="(sort, index) in queryConfig.sorts" 
              :key="index"
              class="dataview-sort-row"
            >
              <div class="dataview-sort-field">
                <input 
                  type="text" 
                  v-model="sort.field"
                  placeholder="Field name to sort by"
                  class="dataview-input"
                  @input="updateQuery"
                  @focus="setEditing(true)"
                  @blur="setEditing(false)"
                />
              </div>
              
              <div class="dataview-sort-direction">
                <select 
                  v-model="sort.direction"
                  class="dataview-select"
                  @change="updateQuery"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              
              <div class="dataview-sort-controls">
                <button 
                  class="dataview-btn-icon dataview-btn-remove"
                  @click="removeSort(index)"
                  title="Remove sort"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <button 
              class="dataview-btn-add"
              @click="addSort()"
            >
              <i class="fas fa-plus"></i> Add Sort
            </button>
          </div>
        </div>
        
        <!-- Group By Section -->
        <div class="dataview-section">
          <h3 class="dataview-section-title">
            <i class="fas fa-layer-group"></i> Group By 
            <span class="dataview-optional">(Optional)</span>
          </h3>
          <div class="dataview-group-container">
            <div class="dataview-group-field">
              <input 
                type="text" 
                v-model="groupField"
                placeholder="Field to group by (leave empty for no grouping)"
                class="dataview-input"
                @input="updateGroupBy"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
              />
            </div>
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
                <span class="dataview-tooltip" title="When checked, the query will be an inline query using `${dv.taskList(...)}` syntax rather than a code block">
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
          placeholder="Enter Dataview TASK query..."
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
  DataviewSortDirection,
  DataviewFilterCondition,
  DataviewSort,
  DataviewGroup,
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
const groupField = ref('');

// Task-specific state
const showCompleted = ref(true);
const showIncomplete = ref(true);
const taskPropertyFilters = ref<Array<{
  property: string;
  operator: string;
  value: string;
}>>([]);

// Default query configuration for TASK queries
const queryConfig = ref<DataviewQueryConfig>({
  type: DataviewQueryType.TASK,
  fields: [], // TASK queries don't typically specify fields
  source: '"."',
  filters: [],
  sorts: [],
  inline: false,
  limit: undefined
});

// Computed properties
const commonSources = computed(() => COMMON_SOURCES);

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
  if (props.module.type !== "dataviewTaskQuery" || props.module.pluginType !== "dataview") {
    const updatedModule = {
      ...props.module,
      type: "dataviewTaskQuery",
      pluginType: "dataview",
    };

    const updatedModules = [...props.modules];
    updatedModules[props.index] = updatedModule;
    emit("update", updatedModules);
  }
  
  initializeFromContent();
  
  console.log('Dataview Task Query Module initialized', props.module.type);
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
      type: DataviewQueryType.TASK,
      fields: [],
      source: '"."',
      filters: [],
      sorts: [],
      inline: false
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
    // Ensure the type is TASK
    parsedConfig.type = DataviewQueryType.TASK;
    queryConfig.value = parsedConfig;
    
    // Set the group field if there's a groupBy in the config
    if (parsedConfig.groupBy) {
      groupField.value = parsedConfig.groupBy.field;
    } else {
      groupField.value = '';
    }
    
    // Extract task-specific filters
    extractTaskFilters(parsedConfig.filters);
    
    // Set the source type based on the source
    setSourceTypeFromSource(parsedConfig.source);
    validationError.value = '';
  } else {
    // If parsing fails, keep the raw query but show a validation error
    validationError.value = 'Could not parse the query. You can still edit it in code mode.';
    editorMode.value = 'code';
  }
}

// Extract task filters from the query configuration
function extractTaskFilters(filters: DataviewFilterCondition[]) {
  // Reset task filters
  taskPropertyFilters.value = [];
  
  // Check for completed/incomplete filters
  const completedFilter = filters.find(f => f.field === 'completed');
  if (completedFilter) {
    if (completedFilter.operator === DataviewFilterOperator.EQUALS && completedFilter.value === 'true') {
      showCompleted.value = true;
      showIncomplete.value = false;
    } else if (completedFilter.operator === DataviewFilterOperator.EQUALS && completedFilter.value === 'false') {
      showCompleted.value = false;
      showIncomplete.value = true;
    }
  } else {
    // Default to showing both
    showCompleted.value = true;
    showIncomplete.value = true;
  }
  
  // Extract other task property filters
  const taskFilters = filters.filter(f => f.field !== 'completed');
  
  taskPropertyFilters.value = taskFilters.map(f => {
    if (f.operator === DataviewFilterOperator.EMPTY) {
      return {
        property: f.field,
        operator: '!exists',
        value: ''
      };
    } else if (f.operator === DataviewFilterOperator.NOT_EMPTY) {
      return {
        property: f.field,
        operator: 'exists',
        value: ''
      };
    } else {
      return {
        property: f.field,
        operator: f.operator,
        value: f.value
      };
    }
  });
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
        // Ensure the type is TASK
        parsedConfig.type = DataviewQueryType.TASK;
        queryConfig.value = parsedConfig;
        
        // Set the group field if there's a groupBy in the config
        if (parsedConfig.groupBy) {
          groupField.value = parsedConfig.groupBy.field;
        } else {
          groupField.value = '';
        }
        
        // Extract task-specific filters
        extractTaskFilters(parsedConfig.filters);
        
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
  
  // Check if it's a TASK query
  if (!rawQuery.value.includes('TASK') && !rawQuery.value.includes('dv.taskList')) {
    validationError.value = 'This should be a TASK query';
    return;
  }
  
  // If valid, update the content
  emit("update:content", [rawQuery.value]);
}

// Update content from parent
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Add a task property filter
function addTaskProperty() {
  taskPropertyFilters.value.push({
    property: '',
    operator: '=',
    value: ''
  });
  updateTaskFilters();
}

// Remove a task property filter
function removeTaskProperty(index: number) {
  taskPropertyFilters.value.splice(index, 1);
  updateTaskFilters();
}

// Update task filters
function updateTaskFilters() {
  const newFilters: DataviewFilterCondition[] = [];
  
  // Add completed/incomplete filter if needed
  if (showCompleted.value && !showIncomplete.value) {
    newFilters.push({
      id: 'completed-filter',
      field: 'completed',
      operator: DataviewFilterOperator.EQUALS,
      value: 'true',
      isMetadata: true
    });
  } else if (!showCompleted.value && showIncomplete.value) {
    newFilters.push({
      id: 'completed-filter',
      field: 'completed',
      operator: DataviewFilterOperator.EQUALS,
      value: 'false',
      isMetadata: true
    });
  }
  // If both or neither are checked, don't add a completion filter
  
  // Add property filters
  taskPropertyFilters.value.forEach((filter, index) => {
    if (filter.property) {
      if (filter.operator === 'exists') {
        newFilters.push({
          id: `task-prop-${index}`,
          field: filter.property,
          operator: DataviewFilterOperator.NOT_EMPTY,
          value: '',
          isMetadata: true
        });
      } else if (filter.operator === '!exists') {
        newFilters.push({
          id: `task-prop-${index}`,
          field: filter.property,
          operator: DataviewFilterOperator.EMPTY,
          value: '',
          isMetadata: true
        });
      } else {
        newFilters.push({
          id: `task-prop-${index}`,
          field: filter.property,
          operator: filter.operator as DataviewFilterOperator,
          value: filter.value,
          isMetadata: true
        });
      }
    }
  });
  
  // Update the query configuration
  queryConfig.value.filters = newFilters;
  updateQuery();
}

// Add a sort
function addSort() {
  const newSort: DataviewSort = {
    field: '',
    direction: DataviewSortDirection.ASC,
    isMetadata: true
  };
  
  queryConfig.value.sorts.push(newSort);
  updateQuery();
}

// Remove a sort
function removeSort(index: number) {
  queryConfig.value.sorts.splice(index, 1);
  updateQuery();
}

// Update group by
function updateGroupBy() {
  if (groupField.value.trim()) {
    queryConfig.value.groupBy = {
      field: groupField.value.trim(),
      isMetadata: true
    };
  } else {
    queryConfig.value.groupBy = undefined;
  }
  
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
    // Ensure type is TASK
    queryConfig.value.type = DataviewQueryType.TASK;
    
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
.dataview-task-module {
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

.dataview-source-container {
  display: flex;
  gap: 0.75rem;
}

.dataview-source-select {
  width: 150px;
}

.dataview-source-value {
  flex: 1;
}

.dataview-task-filters-container,
.dataview-sorts-container,
.dataview-group-container,
.dataview-limit-container,
.dataview-options-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.dataview-subheading {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.dataview-property-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dataview-property-field,
.dataview-sort-field {
  flex: 1;
}

.dataview-property-operator,
.dataview-sort-direction {
  width: 150px;
}

.dataview-property-value {
  flex: 1;
}

.dataview-task-property-filters {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-sort-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
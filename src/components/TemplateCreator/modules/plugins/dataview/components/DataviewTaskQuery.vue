<template>
  <div class="dataview-task-query">
    <h3 class="dataview-section-title">
      <i class="fas fa-tasks"></i> Task Options
    </h3>
    <div class="dataview-task-options">
      <p class="dataview-info-text">
        <i class="fas fa-info-circle"></i>
        Task queries display tasks from matching pages. Configure task-specific filters below.
      </p>
      
      <div class="dataview-task-filters">
        <div class="dataview-checkbox-row">
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
        </div>
        
        <div class="dataview-checkbox-row">
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
        
        <div class="dataview-task-property">
          <label class="dataview-label">Task property filters:</label>
          <div class="dataview-property-rows">
            <div 
              v-for="(filter, index) in taskPropertyFilters" 
              :key="index"
              class="dataview-property-row"
            >
              <input 
                type="text" 
                v-model="filter.property"
                placeholder="Property (e.g. due, priority)"
                class="dataview-input"
                @input="updateTaskFilters"
              />
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
              <input 
                type="text" 
                v-model="filter.value"
                placeholder="Value"
                class="dataview-input"
                @input="updateTaskFilters"
                v-if="filter.operator !== 'exists' && filter.operator !== '!exists'"
              />
              <button 
                class="dataview-btn-icon dataview-btn-remove"
                @click="removeTaskProperty(index)"
                title="Remove property filter"
              >
                <i class="fas fa-times"></i>
              </button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DataviewQueryConfig, DataviewFilterCondition, DataviewFilterOperator } from '@/utils/dataviewUtils';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  queryConfig: DataviewQueryConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: Partial<DataviewQueryConfig>): void;
}>();

// Task-specific state
const showCompleted = ref(true);
const showIncomplete = ref(true);
const taskPropertyFilters = ref<Array<{
  property: string;
  operator: string;
  value: string;
}>>([]);

// Initialize from props
watch(() => props.queryConfig, initializeFromConfig, { immediate: true, deep: true });

function initializeFromConfig() {
  // Extract task-specific filters from the queryConfig
  const filters = props.queryConfig.filters || [];
  
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
  taskPropertyFilters.value = filters
    .filter(f => f.field !== 'completed')
    .map(f => ({
      property: f.field,
      operator: f.operator,
      value: f.value
    }));
}

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
  
  // Update the config
  emit('update:config', { filters: newFilters });
}
</script>

<style scoped>
.dataview-task-query {
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

.dataview-task-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-info-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  background-color: var(--background-secondary);
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.4;
}

.dataview-info-text i {
  color: var(--interactive-accent);
  margin-top: 0.2rem;
}

.dataview-task-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-checkbox-row {
  margin-bottom: 0.5rem;
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
}

.dataview-task-property {
  margin-top: 0.5rem;
}

.dataview-label {
  font-size: 0.9rem;
  color: var(--text-normal);
  margin-bottom: 0.375rem;
  display: block;
}

.dataview-property-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-property-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dataview-input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
  background: var(--background-secondary);
  color: var(--text-normal);
  font-size: 0.9rem;
}

.dataview-select {
  width: 130px;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
  background: var(--background-secondary);
  color: var(--text-normal);
  font-size: 0.9rem;
}

.dataview-input:focus,
.dataview-select:focus {
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
</style>
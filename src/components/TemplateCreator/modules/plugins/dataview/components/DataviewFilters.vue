<template>
  <div class="dataview-filters">
    <h3 class="dataview-section-title">
      <i class="fas fa-filter"></i> Filters
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { DataviewFilterCondition, DataviewFilterOperator } from '@/utils/dataviewUtils';

const props = defineProps<{
  modelValue: DataviewFilterCondition[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: DataviewFilterCondition[]): void;
}>();

// Computed property for internal reactivity
const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Computed property to get all filter operators
const filterOperators = Object.values(DataviewFilterOperator);

// Add a new filter
function addFilter() {
  const newFilter: DataviewFilterCondition = {
    id: uuidv4(),
    field: '',
    operator: DataviewFilterOperator.EQUALS,
    value: '',
    isMetadata: true
  };
  
  const updatedFilters = [...filters.value, newFilter];
  emit('update:modelValue', updatedFilters);
}

// Remove a filter
function removeFilter(index: number) {
  const updatedFilters = [...filters.value];
  updatedFilters.splice(index, 1);
  emit('update:modelValue', updatedFilters);
}

// Update filters
function updateFilters() {
  emit('update:modelValue', [...filters.value]);
}
</script>

<style scoped>
.dataview-filters {
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

.dataview-filters-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  width: 120px;
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

.dataview-filter-controls {
  display: flex;
  gap: 0.25rem;
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
<template>
  <div class="dataview-sorting">
    <h3 class="dataview-section-title">
      <i class="fas fa-sort"></i> Sorting
    </h3>
    <div class="dataview-sorting-container">
      <div 
        v-for="(sort, index) in sorts" 
        :key="index"
        class="dataview-sort-row"
      >
        <div class="dataview-sort-field">
          <input 
            type="text" 
            v-model="sort.field"
            placeholder="Field name to sort by"
            class="dataview-input"
            @input="updateSorts"
          />
        </div>
        
        <div class="dataview-sort-direction">
          <select 
            v-model="sort.direction"
            class="dataview-select"
            @change="updateSorts"
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DataviewSort, DataviewSortDirection } from '@/utils/dataviewUtils';

const props = defineProps<{
  modelValue: DataviewSort[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: DataviewSort[]): void;
}>();

// Computed property for internal reactivity
const sorts = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Add a new sort
function addSort() {
  const newSort: DataviewSort = {
    field: '',
    direction: DataviewSortDirection.ASC,
    isMetadata: true
  };
  
  const updatedSorts = [...sorts.value, newSort];
  emit('update:modelValue', updatedSorts);
}

// Remove a sort
function removeSort(index: number) {
  const updatedSorts = [...sorts.value];
  updatedSorts.splice(index, 1);
  emit('update:modelValue', updatedSorts);
}

// Update sorts
function updateSorts() {
  emit('update:modelValue', [...sorts.value]);
}
</script>

<style scoped>
.dataview-sorting {
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

.dataview-sorting-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-sort-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dataview-sort-field {
  flex: 1;
}

.dataview-sort-direction {
  width: 120px;
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

.dataview-sort-controls {
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
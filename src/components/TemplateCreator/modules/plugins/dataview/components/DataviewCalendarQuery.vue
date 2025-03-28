<template>
  <div class="dataview-calendar-query">
    <h3 class="dataview-section-title">
      <i class="fas fa-calendar-alt"></i> Calendar Options
    </h3>
    <div class="dataview-calendar-options">
      <p class="dataview-info-text">
        <i class="fas fa-info-circle"></i>
        Calendar queries display notes chronologically on a calendar view. You must specify a date field to use as the calendar basis.
      </p>
      
      <div class="dataview-date-field">
        <label class="dataview-label">Date field:</label>
        <div class="dataview-date-field-input">
          <input 
            type="text" 
            v-model="dateField"
            placeholder="Field containing date (e.g. file.ctime, date, due)"
            class="dataview-input"
            @input="updateDateField"
          />
          
          <div class="dataview-field-suggestions">
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DataviewQueryConfig } from '@/utils/dataviewUtils';

const props = defineProps<{
  queryConfig: DataviewQueryConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: Partial<DataviewQueryConfig>): void;
}>();

// Calendar-specific state
const dateField = ref('file.day');

// Common date fields suggestions
const commonDateFields = [
  { id: 'file.day', label: 'File Day' },
  { id: 'file.cday', label: 'Creation Day' },
  { id: 'file.mday', label: 'Modified Day' },
  { id: 'date', label: 'date' },
  { id: 'due', label: 'due' },
  { id: 'birthday', label: 'birthday' }
];

// Initialize from props
watch(() => props.queryConfig, initializeFromConfig, { immediate: true, deep: true });

function initializeFromConfig() {
  // For calendar view, try to find a date field in filters or metadata
  const filters = props.queryConfig.filters || [];
  
  // Look for specific filter mentioning date
  const dateFilter = filters.find(f => {
    const fieldLower = f.field.toLowerCase();
    return fieldLower.includes('date') || fieldLower.includes('day') || 
           fieldLower === 'due' || fieldLower === 'created' || fieldLower === 'modified';
  });
  
  if (dateFilter) {
    dateField.value = dateFilter.field;
  } else {
    // Default to file.day if no date field found
    dateField.value = 'file.day';
  }
}

// Update date field
function updateDateField() {
  // For calendar view, we need to ensure a date field exists in the filters
  const filters = [...(props.queryConfig.filters || [])];
  
  // Remove any existing date filter (used for calendar display)
  const dateFilterIndex = filters.findIndex(f => f.field === 'calendar-date-field');
  if (dateFilterIndex !== -1) {
    filters.splice(dateFilterIndex, 1);
  }
  
  // Add new date filter if a field is specified
  if (dateField.value) {
    filters.push({
      id: 'calendar-date-field',
      field: dateField.value,
      operator: 'is not empty',
      value: '',
      isMetadata: true
    });
  }
  
  // Update the config
  emit('update:config', { filters });
}

// Select a date field from suggestions
function selectDateField(field: string) {
  dateField.value = field;
  updateDateField();
}
</script>

<style scoped>
.dataview-calendar-query {
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

.dataview-calendar-options {
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

.dataview-date-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.dataview-label {
  font-size: 0.9rem;
  color: var(--text-normal);
}

.dataview-date-field-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dataview-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
  background: var(--background-secondary);
  color: var(--text-normal);
  font-size: 0.9rem;
}

.dataview-input:focus {
  border-color: var(--interactive-accent);
  outline: none;
}

.dataview-field-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.dataview-suggestion-btn {
  padding: 0.25rem 0.5rem;
  background-color: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataview-suggestion-btn:hover {
  background-color: var(--background-modifier-hover);
  color: var(--text-normal);
}
</style>
<template>
  <div class="dataview-query-type">
    <h3 class="dataview-section-title">
      <i class="fas fa-cube"></i> Query Type
    </h3>
    <div class="dataview-query-types">
      <button 
        v-for="type in queryTypes"
        :key="type"
        class="dataview-type-btn"
        :class="{ 'active': modelValue === type }"
        @click="$emit('update:modelValue', type)"
      >
        <i :class="getQueryTypeIcon(type)"></i>
        {{ type }}
      </button>
    </div>
    <div class="dataview-type-description">
      {{ getQueryTypeDescription(modelValue) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataviewQueryType } from '@/utils/dataviewUtils';

const props = defineProps<{
  modelValue: DataviewQueryType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: DataviewQueryType): void;
}>();

// Computed property to get all query types
const queryTypes = Object.values(DataviewQueryType);

// Helper function to get icon for query type
function getQueryTypeIcon(type: DataviewQueryType): string {
  switch (type) {
    case DataviewQueryType.TABLE:
      return 'fas fa-table';
    case DataviewQueryType.LIST:
      return 'fas fa-list';
    case DataviewQueryType.TASK:
      return 'fas fa-tasks';
    case DataviewQueryType.CALENDAR:
      return 'fas fa-calendar-alt';
    default:
      return 'fas fa-question';
  }
}

// Helper function to get description for query type
function getQueryTypeDescription(type: DataviewQueryType): string {
  switch (type) {
    case DataviewQueryType.TABLE:
      return 'Creates a table with multiple columns from your data';
    case DataviewQueryType.LIST:
      return 'Displays a simple list of matching pages';
    case DataviewQueryType.TASK:
      return 'Shows tasks from matching pages';
    case DataviewQueryType.CALENDAR:
      return 'Displays notes on a calendar by date';
    default:
      return '';
  }
}
</script>

<style scoped>
.dataview-query-type {
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

.dataview-query-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.dataview-type-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataview-type-btn:hover {
  background: var(--background-modifier-hover);
}

.dataview-type-btn.active {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border-color: var(--interactive-accent);
}

.dataview-type-description {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  font-style: italic;
}
</style>
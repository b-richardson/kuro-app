<template>
  <div class="dataview-source">
    <h3 class="dataview-section-title">
      <i class="fas fa-filter"></i> Source
    </h3>
    <div class="dataview-source-container">
      <div class="dataview-source-select">
        <select 
          :value="selectedSourceType"
          class="dataview-select"
          @change="handleSourceTypeChange($event.target.value)"
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
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="getSourcePlaceholder()"
          class="dataview-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { COMMON_SOURCES } from '@/utils/dataviewUtils';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Computed property to get common sources
const commonSources = computed(() => COMMON_SOURCES);

// State to track selected source type
const selectedSourceType = ref('current-folder');

// Initial setup: determine source type from model value
watch(() => props.modelValue, (newValue) => {
  setSourceTypeFromValue(newValue);
}, { immediate: true });

// Helper function to set source type based on value
function setSourceTypeFromValue(value: string) {
  const matchedSource = commonSources.value.find(s => s.value === value);
  if (matchedSource) {
    selectedSourceType.value = matchedSource.id;
  } else {
    selectedSourceType.value = 'custom';
  }
}

// Handle source type change
function handleSourceTypeChange(sourceTypeId: string) {
  selectedSourceType.value = sourceTypeId;
  
  // Update the source value based on the selected type
  const selectedSource = commonSources.value.find(s => s.id === sourceTypeId);
  if (selectedSource && selectedSource.value) {
    emit('update:modelValue', selectedSource.value);
  }
}

// Get placeholder text based on selected source type
function getSourcePlaceholder(): string {
  const selectedSource = commonSources.value.find(s => s.id === selectedSourceType.value);
  return selectedSource?.placeholder || 'Enter source';
}
</script>

<style scoped>
.dataview-source {
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
</style>
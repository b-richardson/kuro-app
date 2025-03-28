<template>
  <div class="dataview-list-query">
    <h3 class="dataview-section-title">
      <i class="fas fa-list"></i> List Options
    </h3>
    <div class="dataview-list-options">
      <p class="dataview-info-text">
        <i class="fas fa-info-circle"></i>
        List queries display matching pages as a bulleted list. Configure your source, filters, and sorting options to customize the results.
      </p>
      
      <div class="dataview-field-select">
        <label class="dataview-label">Display field (optional):</label>
        <input 
          type="text" 
          v-model="displayField"
          placeholder="Leave empty to show file links (e.g. title, summary, etc.)"
          class="dataview-input"
          @input="updateDisplayField"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { DataviewQueryConfig } from '@/utils/dataviewUtils';

const props = defineProps<{
  queryConfig: DataviewQueryConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: Partial<DataviewQueryConfig>): void;
}>();

// Try to extract a display field from the configuration if one exists
const displayField = ref('');

// Initialize from props
watch(() => props.queryConfig, initializeFromConfig, { immediate: true, deep: true });

function initializeFromConfig() {
  // For LIST queries, we don't typically have fields in the same way as TABLE
  // If there are fields, the first one might be used as a display field
  if (props.queryConfig.fields && props.queryConfig.fields.length > 0) {
    displayField.value = props.queryConfig.fields[0];
  } else {
    displayField.value = '';
  }
}

// Update display field
function updateDisplayField() {
  const fields = displayField.value ? [displayField.value] : [];
  emit('update:config', { fields });
}
</script>

<style scoped>
.dataview-list-query {
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

.dataview-list-options {
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

.dataview-field-select {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.dataview-label {
  font-size: 0.9rem;
  color: var(--text-normal);
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
</style>
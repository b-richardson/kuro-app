<template>
  <div class="dataview-grouping">
    <h3 class="dataview-section-title">
      <i class="fas fa-layer-group"></i> Group By
      <span class="dataview-optional">(Optional)</span>
    </h3>
    <div class="dataview-grouping-container">
      <div class="dataview-group-field">
        <input 
          type="text" 
          :value="groupField"
          @input="updateGroupField($event.target.value)"
          placeholder="Field to group by (leave empty for no grouping)"
          class="dataview-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DataviewGroup } from '@/utils/dataviewUtils';

const props = defineProps<{
  modelValue?: DataviewGroup;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: DataviewGroup | undefined): void;
}>();

// Computed property to get the group field
const groupField = computed(() => {
  return props.modelValue?.field || '';
});

// Update the group field
function updateGroupField(value: string) {
  if (value.trim()) {
    emit('update:modelValue', {
      field: value.trim(),
      isMetadata: true // Default to metadata field
    });
  } else {
    // If empty, set to undefined
    emit('update:modelValue', undefined);
  }
}

// Watch for changes in the model value
watch(() => props.modelValue, (newValue) => {
  // No need to handle this since we have a computed property
}, { deep: true });
</script>

<style scoped>
.dataview-grouping {
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

.dataview-grouping-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-group-field {
  width: 100%;
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
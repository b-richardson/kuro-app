<template>
  <div class="dataview-limit">
    <h3 class="dataview-section-title">
      <i class="fas fa-sort-numeric-down"></i> Limit
      <span class="dataview-optional">(Optional)</span>
    </h3>
    <div class="dataview-limit-container">
      <input 
        type="number" 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value ? Number($event.target.value) : undefined)"
        placeholder="Number of results (leave empty for no limit)"
        class="dataview-input"
        min="1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void;
}>();
</script>

<style scoped>
.dataview-limit {
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

.dataview-limit-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
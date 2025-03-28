<template>
  <div class="dataview-inline-toggle">
    <h3 class="dataview-section-title">
      <i class="fas fa-code"></i> Format Options
    </h3>
    <div class="dataview-inline-container">
      <label class="dataview-checkbox">
        <input 
          type="checkbox" 
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
        <span class="dataview-checkbox-label">
          Inline Query
          <span class="dataview-tooltip" title="When checked, the query will be an inline query using `${dv.list(...)}` syntax rather than a code block">
            <i class="fas fa-info-circle"></i>
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<style scoped>
.dataview-inline-toggle {
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

.dataview-inline-container {
  display: flex;
  gap: 1rem;
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
</style>
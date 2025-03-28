<template>
  <div class="dataview-table-query">
    <h3 class="dataview-section-title">
      <i class="fas fa-columns"></i> Table Fields
    </h3>
    <div class="dataview-fields-container">
      <div 
        v-for="(field, index) in fields" 
        :key="index"
        class="dataview-field-row"
      >
        <input 
          type="text" 
          v-model="fields[index]"
          placeholder="Field name (e.g. file.ctime, status, etc.)"
          class="dataview-input"
          @input="updateFields"
        />
        <button 
          class="dataview-btn-icon dataview-btn-remove"
          @click="removeField(index)"
          title="Remove field"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="dataview-add-container">
        <button 
          class="dataview-btn-add"
          @click="addField()"
        >
          <i class="fas fa-plus"></i> Add Field
        </button>
        <button 
          class="dataview-btn-add"
          @click="toggleCommonFields()"
        >
          <i class="fas fa-list"></i> Common Fields
        </button>
      </div>
      
      <!-- Common Fields Dropdown -->
      <div v-if="showCommonFields" class="dataview-common-fields">
        <div class="dataview-common-fields-header">
          <h4>Common Metadata Fields</h4>
          <button 
            class="dataview-btn-icon"
            @click="toggleCommonFields()"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dataview-common-fields-list">
          <div 
            v-for="field in commonFields"
            :key="field.id"
            class="dataview-common-field"
            @click="addCommonField(field.id)"
          >
            <div class="dataview-common-field-name">{{ field.label }}</div>
            <div class="dataview-common-field-type">{{ field.type }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DataviewQueryConfig, COMMON_METADATA_FIELDS } from '@/utils/dataviewUtils';

const props = defineProps<{
  queryConfig: DataviewQueryConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', value: Partial<DataviewQueryConfig>): void;
}>();

// State
const fields = ref<string[]>(props.queryConfig.fields || []);
const showCommonFields = ref(false);
const commonFields = COMMON_METADATA_FIELDS;

// Watch for changes in the query config
watch(() => props.queryConfig.fields, (newFields) => {
  if (newFields && !arraysEqual(newFields, fields.value)) {
    fields.value = [...newFields];
  }
}, { deep: true });

// Add field
function addField() {
  fields.value.push('');
  updateFields();
}

// Remove field
function removeField(index: number) {
  fields.value.splice(index, 1);
  updateFields();
}

// Add common field
function addCommonField(fieldId: string) {
  fields.value.push(fieldId);
  showCommonFields.value = false;
  updateFields();
}

// Toggle common fields dropdown
function toggleCommonFields() {
  showCommonFields.value = !showCommonFields.value;
}

// Update fields
function updateFields() {
  emit('update:config', {
    fields: [...fields.value]
  });
}

// Helper to compare arrays
function arraysEqual(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
</script>

<style scoped>
.dataview-table-query {
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

.dataview-fields-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
}

.dataview-field-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dataview-add-container {
  display: flex;
  gap: 0.5rem;
}

.dataview-input {
  flex: 1;
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
}

.dataview-btn-add:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
  border-color: var(--background-modifier-border-hover);
}

/* Common Fields Dropdown */
.dataview-common-fields {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background-color: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.5rem;
}

.dataview-common-fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--background-modifier-border);
}

.dataview-common-fields-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-normal);
}

.dataview-common-fields-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.dataview-common-field {
  padding: 0.625rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dataview-common-field:hover {
  background-color: var(--background-modifier-hover);
}

.dataview-common-field-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-normal);
}

.dataview-common-field-type {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
}
</style>
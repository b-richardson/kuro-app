<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    ref="baseModuleRef"
  >
    <div class="dataview-module-container">
      <!-- Visual Builder Mode -->
      <div v-if="editorMode === 'visual'" class="dataview-visual-builder">
        <!-- Query Type Selector -->
        <DataviewQueryTypeComponent 
          v-model="queryConfig.type"
          @update:modelValue="handleQueryTypeChange"
        />
        
        <!-- Source Component -->
        <DataviewSource
          v-model="queryConfig.source"
          @update:modelValue="updateQuery"
        />
        
        <!-- Query Type Specific Components -->
        <component :is="currentQueryComponent"
          v-if="currentQueryComponent"
          :query-config="queryConfig"
          @update:config="updateQueryConfig"
        />
        
        <!-- Common Components -->
        <DataviewFilters
          v-model="queryConfig.filters"
          @update:modelValue="updateQuery"
        />
        
        <DataviewSorting
          v-model="queryConfig.sorts"
          @update:modelValue="updateQuery"
        />
        
        <DataviewGrouping
          v-model="queryConfig.groupBy"
          @update:modelValue="updateQuery"
        />
        
        <DataviewLimit
          v-model="queryConfig.limit"
          @update:modelValue="updateQuery"
        />
        
        <DataviewInlineToggle
          v-model="queryConfig.inline"
          @update:modelValue="updateQuery"
        />
      </div>
      
      <!-- Code Editor Mode -->
      <div v-else class="dataview-code-editor">
        <textarea
          v-model="rawQuery"
          class="dataview-code-textarea"
          placeholder="Enter Dataview query..."
          rows="10"
          @input="validateRawQuery"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :ref="isSelected && autoFocus ? setInputRef : undefined"
        ></textarea>
        
        <div v-if="validationError" class="dataview-validation-error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ validationError }}
        </div>
      </div>
      
      <!-- Bottom controls -->
      <div class="dataview-module-controls">
        <button 
          class="dataview-toggle-mode-btn"
          @click="toggleEditorMode"
          title="Toggle between visual builder and code editor"
        >
          <i :class="editorMode === 'visual' ? 'fas fa-code' : 'fas fa-sliders-h'"></i>
          {{ editorMode === 'visual' ? 'Code Editor' : 'Visual Builder' }}
        </button>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { 
  DataviewQueryType,
  DataviewQueryConfig,
  generateDataviewQuery,
  validateDataviewQuery,
  parseDataviewQuery
} from "@/utils/dataviewUtils";

// Import components
import DataviewQueryTypeComponent from "./components/DataviewQueryType.vue";
import DataviewSource from "./components/DataviewSource.vue";
import DataviewFilters from "./components/DataviewFilters.vue";
import DataviewSorting from "./components/DataviewSorting.vue";
import DataviewGrouping from "./components/DataviewGrouping.vue";
import DataviewLimit from "./components/DataviewLimit.vue";
import DataviewInlineToggle from "./components/DataviewInlineToggle.vue";

// Import query-specific components
import DataviewListQuery from "./components/DataviewListQuery.vue";
import DataviewTableQuery from "./components/DataviewTableQuery.vue";
import DataviewTaskQuery from "./components/DataviewTaskQuery.vue";
import DataviewCalendarQuery from "./components/DataviewCalendarQuery.vue";

const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// Reference to the base module component
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

// State variables
const editorMode = ref<'visual' | 'code'>('visual');
const rawQuery = ref('');
const validationError = ref('');

// Default query configuration
const queryConfig = ref<DataviewQueryConfig>({
  type: DataviewQueryType.TABLE,
  fields: ['file.link', 'file.ctime', 'file.tags'],
  source: '"."',
  filters: [],
  sorts: [],
  inline: false
});

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

const setInputRef = (el: HTMLTextAreaElement) => {
  inputRef.value = el;
  baseModuleRef.value?.setInputRef(el);
};

// Return the appropriate component based on query type
const currentQueryComponent = computed(() => {
  switch (queryConfig.value.type) {
    case DataviewQueryType.LIST:
      return DataviewListQuery;
    case DataviewQueryType.TABLE:
      return DataviewTableQuery;
    case DataviewQueryType.TASK:
      return DataviewTaskQuery;
    case DataviewQueryType.CALENDAR:
      return DataviewCalendarQuery;
    default:
      return null;
  }
});

// Initialize from props
onMounted(() => {
  initializeFromContent();
});

// Watch for content changes from parent
watch(() => props.module.content, () => {
  initializeFromContent();
}, { deep: true });

// Initialize component from content
function initializeFromContent() {
  const content = props.module.content?.join('\n') || '';
  
  // If it's empty, use the default configuration
  if (!content.trim()) {
    const defaultConfig: DataviewQueryConfig = {
      type: DataviewQueryType.TABLE,
      fields: ['file.link', 'file.ctime', 'file.tags'],
      source: '"."',
      filters: [],
      sorts: [],
      inline: false
    };
    
    queryConfig.value = defaultConfig;
    rawQuery.value = generateDataviewQuery(defaultConfig);
    return;
  }
  
  // Set the raw query content
  rawQuery.value = content;
  
  // Try to parse the content as a Dataview query
  const parsedConfig = parseDataviewQuery(content);
  
  if (parsedConfig) {
    queryConfig.value = parsedConfig;
    validationError.value = '';
  } else {
    // If parsing fails, keep the raw query but show a validation error
    validationError.value = 'Could not parse the query. You can still edit it in code mode.';
    editorMode.value = 'code';
  }
}

// Toggle between visual and code editor modes
function toggleEditorMode() {
  if (editorMode.value === 'visual') {
    // Switching to code mode
    rawQuery.value = generateDataviewQuery(queryConfig.value);
    editorMode.value = 'code';
  } else {
    // Switching to visual mode
    try {
      const parsedConfig = parseDataviewQuery(rawQuery.value);
      if (parsedConfig) {
        queryConfig.value = parsedConfig;
        validationError.value = '';
        editorMode.value = 'visual';
      } else {
        // Parsing failed
        validationError.value = 'Could not parse the query. Please check the syntax.';
      }
    } catch (error) {
      validationError.value = 'Error parsing query.';
    }
  }
}

// Validate raw query input
function validateRawQuery() {
  validationError.value = '';
  
  // Skip validation if empty
  if (!rawQuery.value.trim()) return;
  
  // Validate Dataview query
  const validation = validateDataviewQuery(rawQuery.value);
  if (!validation.isValid) {
    validationError.value = validation.error || 'Invalid Dataview query';
    return;
  }
  
  // If valid, update the content
  emit("update:content", [rawQuery.value]);
}

// Update content from parent
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Handle query type change
function handleQueryTypeChange(type: DataviewQueryType) {
  // Reset fields if changing to/from TABLE query
  if (type === DataviewQueryType.TABLE && queryConfig.value.type !== DataviewQueryType.TABLE) {
    queryConfig.value.fields = ['file.link', 'file.ctime', 'file.tags'];
  } else if (type !== DataviewQueryType.TABLE && queryConfig.value.type === DataviewQueryType.TABLE) {
    queryConfig.value.fields = [];
  }
  
  queryConfig.value.type = type;
  updateQuery();
}

// Update query config from child components
function updateQueryConfig(config: Partial<DataviewQueryConfig>) {
  queryConfig.value = {
    ...queryConfig.value,
    ...config
  };
  updateQuery();
}

// Generate query from config and update content
function updateQuery() {
  if (editorMode.value === 'visual') {
    // Generate the updated query
    const query = generateDataviewQuery(queryConfig.value);
    
    // Update the raw query (useful when switching to code mode)
    rawQuery.value = query;
    
    // Emit the updated content
    emit("update:content", [query]);
  }
}
</script>

<style scoped>
.dataview-module-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

.dataview-visual-builder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.dataview-code-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.dataview-code-textarea {
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
  font-family: var(--font-monospace);
  font-size: 0.9em;
  resize: vertical;
}

.dataview-validation-error {
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dataview-module-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.dataview-toggle-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataview-toggle-mode-btn:hover {
  background: var(--background-modifier-hover);
}
</style>

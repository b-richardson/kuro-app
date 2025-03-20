<template>
  <div class="dataview-query-builder">
    <div class="dataview-query-builder__header">
      <div class="dataview-query-builder__title">
        <i class="fas fa-database"></i>
        Dataview Query Builder
      </div>
      <div class="dataview-query-builder__view-toggle">
        <button 
          class="dataview-query-builder__mode-btn"
          :class="{ 'active': editorMode === 'visual' }"
          @click="setEditorMode('visual')"
          title="Visual Editor"
        >
          <i class="fas fa-sliders-h"></i>
        </button>
        <button 
          class="dataview-query-builder__mode-btn"
          :class="{ 'active': editorMode === 'code' }"
          @click="setEditorMode('code')"
          title="Code Editor"
        >
          <i class="fas fa-code"></i>
        </button>
      </div>
    </div>
    
    <div v-if="validationError" class="dataview-query-builder__validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <!-- Visual Editor Mode -->
    <div v-if="editorMode === 'visual'" class="dataview-query-builder__visual-mode">
      <!-- Templates panel -->
      <div class="dataview-query-builder__templates-panel">
        <h3 class="dataview-query-builder__section-title">
          <i class="fas fa-bookmark"></i> Query Templates
        </h3>
        <div class="dataview-query-builder__templates">
          <div 
            v-for="template in templates"
            :key="template.name"
            class="dataview-query-builder__template-card"
            @click="applyTemplate(template)"
          >
            <div class="dataview-query-builder__template-name">{{ template.name }}</div>
            <div class="dataview-query-builder__template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- Main config panel -->
      <div class="dataview-query-builder__config-panel">
        <!-- Query Type -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-cube"></i> Query Type
          </h3>
          <div class="dataview-query-builder__query-types">
            <button 
              v-for="type in queryTypes"
              :key="type"
              class="dataview-query-builder__type-btn"
              :class="{ 'active': queryConfig.type === type }"
              @click="setQueryType(type)"
            >
              <i :class="getQueryTypeIcon(type)"></i>
              {{ type }}
            </button>
          </div>
          <div class="dataview-query-builder__type-description">
            {{ getQueryTypeDescription(queryConfig.type) }}
          </div>
        </div>
        
        <!-- Format Options -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-code"></i> Format Options
          </h3>
          <div class="dataview-query-builder__format-options">
            <label class="dataview-query-builder__checkbox">
              <input 
                type="checkbox" 
                v-model="queryConfig.inline"
              />
              <span class="dataview-query-builder__checkbox-label">
                Inline Query
                <span class="dataview-query-builder__tooltip" title="When checked, the query will be an inline query using `${dv.list(...)}` syntax rather than a code block">
                  <i class="fas fa-info-circle"></i>
                </span>
              </span>
            </label>
          </div>
        </div>
        
        <!-- Table Fields (only for TABLE queries) -->
        <div v-if="queryConfig.type === 'TABLE'" class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-columns"></i> Table Fields
          </h3>
          <div class="dataview-query-builder__fields">
            <div 
              v-for="(field, index) in queryConfig.fields" 
              :key="index"
              class="dataview-query-builder__field-row"
            >
              <input 
                type="text" 
                v-model="queryConfig.fields[index]"
                placeholder="Field name (e.g. file.ctime, status, etc.)"
                class="dataview-query-builder__input"
              />
              <button 
                class="dataview-query-builder__btn-icon dataview-query-builder__btn-remove"
                @click="removeField(index)"
                title="Remove field"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="dataview-query-builder__add-container">
              <button 
                class="dataview-query-builder__btn-add"
                @click="addField()"
              >
                <i class="fas fa-plus"></i> Add Field
              </button>
              <button 
                class="dataview-query-builder__btn-add"
                @click="showCommonFields = !showCommonFields"
              >
                <i class="fas fa-list"></i> Common Fields
              </button>
            </div>
            
            <!-- Common Fields Dropdown -->
            <div v-if="showCommonFields" class="dataview-query-builder__common-fields">
              <div class="dataview-query-builder__common-fields-header">
                <h4>Common Metadata Fields</h4>
                <button 
                  class="dataview-query-builder__btn-icon"
                  @click="showCommonFields = false"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="dataview-query-builder__common-fields-list">
                <div 
                  v-for="field in commonFields"
                  :key="field.id"
                  class="dataview-query-builder__common-field"
                  @click="addCommonField(field.id)"
                >
                  <div class="dataview-query-builder__common-field-name">{{ field.label }}</div>
                  <div class="dataview-query-builder__common-field-type">{{ field.type }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Source -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-filter"></i> Source
          </h3>
          <div class="dataview-query-builder__source">
            <div class="dataview-query-builder__source-select">
              <select 
                v-model="selectedSourceType"
                class="dataview-query-builder__select"
                @change="handleSourceTypeChange"
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
            
            <div class="dataview-query-builder__source-value">
              <input 
                type="text" 
                v-model="queryConfig.source"
                :placeholder="getSourcePlaceholder()"
                class="dataview-query-builder__input"
              />
            </div>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-filter"></i> Filters
          </h3>
          <div class="dataview-query-builder__filters">
            <div 
              v-for="(filter, index) in queryConfig.filters" 
              :key="filter.id"
              class="dataview-query-builder__filter-row"
            >
              <div class="dataview-query-builder__filter-field">
                <input 
                  type="text" 
                  v-model="filter.field"
                  placeholder="Field name"
                  class="dataview-query-builder__input"
                />
              </div>
              
              <div class="dataview-query-builder__filter-operator">
                <select 
                  v-model="filter.operator"
                  class="dataview-query-builder__select"
                >
                  <option 
                    v-for="op in filterOperators"
                    :key="op"
                    :value="op"
                  >
                    {{ op }}
                  </option>
                </select>
              </div>
              
              <div 
                v-if="filter.operator !== 'is empty' && filter.operator !== 'is not empty'" 
                class="dataview-query-builder__filter-value"
              >
                <input 
                  type="text" 
                  v-model="filter.value"
                  placeholder="Value"
                  class="dataview-query-builder__input"
                />
              </div>
              
              <div class="dataview-query-builder__filter-controls">
                <button 
                  class="dataview-query-builder__btn-icon dataview-query-builder__btn-remove"
                  @click="removeFilter(index)"
                  title="Remove filter"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <button 
              class="dataview-query-builder__btn-add"
              @click="addFilter()"
            >
              <i class="fas fa-plus"></i> Add Filter
            </button>
          </div>
        </div>
        
        <!-- Sorting -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-sort"></i> Sorting
          </h3>
          <div class="dataview-query-builder__sorts">
            <div 
              v-for="(sort, index) in queryConfig.sorts" 
              :key="index"
              class="dataview-query-builder__sort-row"
            >
              <div class="dataview-query-builder__sort-field">
                <input 
                  type="text" 
                  v-model="sort.field"
                  placeholder="Field name"
                  class="dataview-query-builder__input"
                />
              </div>
              
              <div class="dataview-query-builder__sort-direction">
                <select 
                  v-model="sort.direction"
                  class="dataview-query-builder__select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              
              <div class="dataview-query-builder__sort-controls">
                <button 
                  class="dataview-query-builder__btn-icon dataview-query-builder__btn-remove"
                  @click="removeSort(index)"
                  title="Remove sort"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <button 
              class="dataview-query-builder__btn-add"
              @click="addSort()"
            >
              <i class="fas fa-plus"></i> Add Sort
            </button>
          </div>
        </div>
        
        <!-- Group By -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-layer-group"></i> Group By 
            <span class="dataview-query-builder__optional">(Optional)</span>
          </h3>
          <div class="dataview-query-builder__group">
            <div class="dataview-query-builder__group-field">
              <input 
                type="text" 
                v-model="groupField"
                placeholder="Field to group by (leave empty for no grouping)"
                class="dataview-query-builder__input"
                @input="updateGroupBy"
              />
            </div>
          </div>
        </div>
        
        <!-- Limit -->
        <div class="dataview-query-builder__section">
          <h3 class="dataview-query-builder__section-title">
            <i class="fas fa-sort-numeric-down"></i> Limit 
            <span class="dataview-query-builder__optional">(Optional)</span>
          </h3>
          <div class="dataview-query-builder__limit">
            <input 
              type="number" 
              v-model.number="queryConfig.limit"
              placeholder="Number of results (leave empty for no limit)"
              class="dataview-query-builder__input"
              min="1"
            />
          </div>
        </div>
      </div>
      
      <!-- Preview panel -->
      <div class="dataview-query-builder__preview-panel">
        <h3 class="dataview-query-builder__section-title">
          <i class="fas fa-eye"></i> Preview
        </h3>
        <div class="dataview-query-builder__preview-header">
          <div class="dataview-query-builder__preview-toggle">
            <button 
              class="dataview-query-builder__preview-tab"
              :class="{ 'active': previewTab === 'query' }"
              @click="previewTab = 'query'"
            >
              Query
            </button>
            <button 
              class="dataview-query-builder__preview-tab"
              :class="{ 'active': previewTab === 'results' }"
              @click="previewTab = 'results'"
            >
              Sample Results
            </button>
          </div>
        </div>
        
        <div class="dataview-query-builder__preview-content">
          <!-- Query Preview -->
          <div v-if="previewTab === 'query'" class="dataview-query-builder__query-preview">
            <pre><code>{{ generatedQuery }}</code></pre>
          </div>
          
          <!-- Results Preview -->
          <div v-else class="dataview-query-builder__results-preview">
            <div v-if="queryConfig.type === 'TABLE'" class="dataview-query-builder__table-preview">
              <table class="dataview-query-builder__table">
                <thead>
                  <tr>
                    <th v-for="field in previewFields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in previewData" :key="idx">
                    <td v-for="field in previewFields" :key="field">
                      {{ getFieldValue(item, field) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-else-if="queryConfig.type === 'LIST'" class="dataview-query-builder__list-preview">
              <ul class="dataview-query-builder__list">
                <li v-for="(item, idx) in previewData" :key="idx">
                  {{ item.title }}
                </li>
              </ul>
            </div>
            
            <div v-else-if="queryConfig.type === 'TASK'" class="dataview-query-builder__task-preview">
              <ul class="dataview-query-builder__tasks">
                <li v-for="(task, idx) in previewTasks" :key="idx" class="dataview-query-builder__task-item">
                  <input type="checkbox" :checked="task.status === 'complete'" disabled />
                  <span>{{ task.text }}</span>
                  <span class="dataview-query-builder__task-source">
                    ({{ task.source.split('/').pop() }})
                  </span>
                </li>
              </ul>
            </div>
            
            <div v-else-if="queryConfig.type === 'CALENDAR'" class="dataview-query-builder__calendar-preview">
              <div class="dataview-query-builder__calendar-placeholder">
                <i class="fas fa-calendar-alt"></i>
                <p>Calendar view would display notes by date in Obsidian</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Code Editor Mode -->
    <div v-else class="dataview-query-builder__code-mode">
      <div class="dataview-query-builder__code-editor">
        <textarea
          v-model="rawQuery"
          class="dataview-query-builder__code-textarea"
          placeholder="Enter Dataview query..."
          rows="10"
          @input="validateRawQuery"
        ></textarea>
      </div>
      
      <div class="dataview-query-builder__code-help">
        <i class="fas fa-info-circle"></i>
        <span>
          Use <code>```dataview</code> for code blocks or <code>`${dv.list()}`</code> for inline queries.
          <a href="#" @click.prevent="showHelp = !showHelp">
            {{ showHelp ? 'Hide Help' : 'Show Help' }}
          </a>
        </span>
      </div>
      
      <div v-if="showHelp" class="dataview-query-builder__help-panel">
        <h4>Dataview Query Syntax Help</h4>
        <div class="dataview-query-builder__help-content">
          <h5>Example Queries:</h5>
          <pre><code>```dataview
TABLE file.ctime AS "Created", file.mtime AS "Modified"
FROM "folder"
WHERE file.tags contains "#tag"
SORT file.mtime DESC
LIMIT 10
```</code></pre>

          <pre><code>`${dv.list(dv.pages('#project').where(p => p.status = "In Progress"))}`</code></pre>
          
          <h5>Main Query Types:</h5>
          <ul>
            <li><strong>TABLE</strong> - Displays data in a table format with specified columns</li>
            <li><strong>LIST</strong> - Shows matching pages as a list</li>
            <li><strong>TASK</strong> - Displays tasks from matching pages</li>
            <li><strong>CALENDAR</strong> - Shows notes on a calendar view by date</li>
          </ul>
          
          <h5>Common Clauses:</h5>
          <ul>
            <li><strong>FROM</strong> - Specifies the source of pages (folder, tag, etc.)</li>
            <li><strong>WHERE</strong> - Filters pages based on conditions</li>
            <li><strong>SORT</strong> - Orders results by specified fields</li>
            <li><strong>GROUP BY</strong> - Groups results by a field</li>
            <li><strong>LIMIT</strong> - Restricts the number of results</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Bottom action panel -->
    <div class="dataview-query-builder__actions">
      <button 
        class="dataview-query-builder__btn-apply"
        @click="applyQuery"
      >
        Apply Query
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { 
  DataviewQueryType,
  DataviewFilterOperator,
  DataviewSortDirection,
  DataviewQueryConfig,
  DataviewFilterCondition,
  DataviewSort,
  COMMON_METADATA_FIELDS,
  COMMON_SOURCES,
  DATAVIEW_QUERY_TEMPLATES,
  generateDataviewQuery,
  validateDataviewQuery,
  parseDataviewQuery,
  getSampleDataviewData
} from '@/utils/dataviewUtils';

// Props and emits
const props = defineProps<{
  content: string[]
}>();

const emit = defineEmits<{
  (e: 'update:content', content: string[]): void
}>();

// State
const editorMode = ref<'visual' | 'code'>('visual');
const rawQuery = ref('');
const validationError = ref('');
const showCommonFields = ref(false);
const previewTab = ref<'query' | 'results'>('query');
const showHelp = ref(false);
const groupField = ref('');
const selectedSourceType = ref('current-folder');

// Query configuration
const queryConfig = ref<DataviewQueryConfig>({
  type: DataviewQueryType.TABLE,
  fields: ['file.link', 'file.ctime', 'file.tags'],
  source: '"."',
  filters: [],
  sorts: [
    { field: 'file.mtime', direction: DataviewSortDirection.DESC }
  ],
  inline: false
});

// Computed properties
const queryTypes = computed(() => {
  return Object.values(DataviewQueryType);
});

const filterOperators = computed(() => {
  return Object.values(DataviewFilterOperator);
});

const commonFields = computed(() => {
  return COMMON_METADATA_FIELDS;
});

const commonSources = computed(() => {
  return COMMON_SOURCES;
});

const templates = computed(() => {
  return DATAVIEW_QUERY_TEMPLATES;
});

const generatedQuery = computed(() => {
  try {
    return generateDataviewQuery(queryConfig.value);
  } catch (error) {
    return '# Error generating query';
  }
});

// Sample data for preview
const sampleData = getSampleDataviewData();

const previewData = computed(() => {
  return sampleData.notes.slice(0, 5);
});

const previewTasks = computed(() => {
  return sampleData.tasks.slice(0, 5);
});

const previewFields = computed(() => {
  if (queryConfig.value.type !== DataviewQueryType.TABLE) {
    return [];
  }
  
  // If no fields specified, use default ones
  if (!queryConfig.value.fields.length) {
    return ['file.link', 'file.ctime', 'file.tags'];
  }
  
  return queryConfig.value.fields.map(field => {
    // Handle aliases in field names (e.g., "field AS alias")
    const asMatch = field.match(/(.+)\s+[Aa][Ss]\s+"?([^"]+)"?/);
    if (asMatch) {
      return asMatch[2]; // Return the alias
    }
    
    // Handle special field names
    if (field === 'file.link') {
      return 'title';
    }
    
    // Extract the last part of the field name
    const parts = field.split('.');
    return parts[parts.length - 1];
  });
});

// Initialize from props
onMounted(() => {
  initializeFromContent();
});

// Watch for content changes from parent
watch(() => props.content, () => {
  initializeFromContent();
}, { deep: true });

// Methods
function initializeFromContent() {
  // Join the content array into a single string
  const content = props.content.join('\n');
  
  // If it's empty, use the default configuration
  if (!content.trim()) {
    const defaultConfig: DataviewQueryConfig = {
      type: DataviewQueryType.TABLE,
      fields: ['file.link', 'file.ctime', 'file.tags'],
      source: '"."',
      filters: [],
      sorts: [
        { field: 'file.mtime', direction: DataviewSortDirection.DESC }
      ],
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
    
    // Set the groupField if there's a groupBy in the config
    if (parsedConfig.groupBy) {
      groupField.value = parsedConfig.groupBy.field;
    } else {
      groupField.value = '';
    }
    
    // Set the source type based on the source
    setSourceTypeFromSource(parsedConfig.source);
  } else {
    // If parsing fails, keep the raw query but show a validation error
    validationError.value = 'Could not parse the query. You can still edit it in code mode.';
    editorMode.value = 'code';
  }
}

function setEditorMode(mode: 'visual' | 'code') {
  if (mode === 'code' && editorMode.value === 'visual') {
    // Switching to code mode, update raw query from visual config
    rawQuery.value = generatedQuery.value;
  } else if (mode === 'visual' && editorMode.value === 'code') {
    // Switching to visual mode, try to parse the raw query
    const parsedConfig = parseDataviewQuery(rawQuery.value);
    
    if (parsedConfig) {
      queryConfig.value = parsedConfig;
      
      // Set the groupField if there's a groupBy in the config
      if (parsedConfig.groupBy) {
        groupField.value = parsedConfig.groupBy.field;
      } else {
        groupField.value = '';
      }
      
      // Clear any validation errors
      validationError.value = '';
      
      // Set the source type based on the source
      setSourceTypeFromSource(parsedConfig.source);
    } else {
      // If parsing fails, show an error and stay in code mode
      validationError.value = 'Could not parse the query. Please check the syntax.';
      editorMode.value = 'code';
      return;
    }
  }
  
  editorMode.value = mode;
}

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
  emit('update:content', [rawQuery.value]);
}

function setQueryType(type: DataviewQueryType) {
  queryConfig.value.type = type;
  updateQuery();
}

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

function addField() {
  queryConfig.value.fields.push('');
  updateQuery();
}

function removeField(index: number) {
  queryConfig.value.fields.splice(index, 1);
  updateQuery();
}

function addCommonField(fieldId: string) {
  queryConfig.value.fields.push(fieldId);
  showCommonFields.value = false;
  updateQuery();
}

function addFilter() {
  const newFilter: DataviewFilterCondition = {
    id: uuidv4(),
    field: '',
    operator: DataviewFilterOperator.EQUALS,
    value: '',
    isMetadata: true
  };
  
  queryConfig.value.filters.push(newFilter);
  updateQuery();
}

function removeFilter(index: number) {
  queryConfig.value.filters.splice(index, 1);
  updateQuery();
}

function addSort() {
  const newSort: DataviewSort = {
    field: '',
    direction: DataviewSortDirection.ASC,
    isMetadata: true
  };
  
  queryConfig.value.sorts.push(newSort);
  updateQuery();
}

function removeSort(index: number) {
  queryConfig.value.sorts.splice(index, 1);
  updateQuery();
}

function updateGroupBy() {
  if (groupField.value.trim()) {
    queryConfig.value.groupBy = {
      field: groupField.value.trim(),
      isMetadata: true
    };
  } else {
    queryConfig.value.groupBy = undefined;
  }
  
  updateQuery();
}

function getSourcePlaceholder(): string {
  const selectedSource = commonSources.value.find(s => s.id === selectedSourceType.value);
  return selectedSource?.placeholder || 'Enter source';
}

function handleSourceTypeChange() {
  const selectedSource = commonSources.value.find(s => s.id === selectedSourceType.value);
  
  if (selectedSource) {
    queryConfig.value.source = selectedSource.value;
    updateQuery();
  }
}

function setSourceTypeFromSource(source: string) {
  // Try to match the source with one of the common sources
  const matchedSource = commonSources.value.find(s => s.value === source);
  
  if (matchedSource) {
    selectedSourceType.value = matchedSource.id;
  } else {
    // If no match, set to custom
    selectedSourceType.value = 'custom';
  }
}

function applyTemplate(template: DataviewQueryConfig) {
  queryConfig.value = { ...template };
  
  // Update the group field
  if (template.groupBy) {
    groupField.value = template.groupBy.field;
  } else {
    groupField.value = '';
  }
  
  // Update the source type
  setSourceTypeFromSource(template.source);
  
  updateQuery();
}

function getFieldValue(item: any, field: string): string {
  // Handle special cases
  if (field === 'title') {
    return item.title || '';
  } else if (field === 'tags') {
    return Array.isArray(item.tags) ? item.tags.join(', ') : '';
  } else if (field === 'created') {
    return item.created || '';
  } else if (field === 'modified') {
    return item.modified || '';
  }
  
  // Try to get the field directly from the item
  return item[field] !== undefined ? String(item[field]) : '';
}

function applyQuery() {
  if (editorMode.value === 'visual') {
    // Generate the query from the visual editor configuration
    const query = generateDataviewQuery(queryConfig.value);
    emit('update:content', [query]);
  } else {
    // Use the raw query from the code editor
    emit('update:content', [rawQuery.value]);
  }
}

function updateQuery() {
  if (editorMode.value === 'visual') {
    // Generate the updated query
    const query = generateDataviewQuery(queryConfig.value);
    
    // Update the raw query (useful when switching to code mode)
    rawQuery.value = query;
    
    // Emit the updated content
    emit('update:content', [query]);
  }
}
</script>

<style scoped>
.dataview-query-builder {
  width: 100%;
  font-size: 0.9375rem;
  display: flex;
  flex-direction: column;
}

.dataview-query-builder__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dataview-query-builder__title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7c3aed; /* Purple */
}

.dataview-query-builder__view-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.dataview-query-builder__mode-btn {
  padding: 0.4rem 0.75rem;
  background-color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #64748b;
}

.dataview-query-builder__mode-btn.active {
  background-color: #f5f3ff; /* Light purple */
  font-weight: 500;
  color: #7c3aed; /* Purple */
}

.dataview-query-builder__validation-error {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Visual Editor */
.dataview-query-builder__visual-mode {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  height: calc(100% - 65px); /* Account for header and actions */
  min-height: 520px;
}

@media (max-width: 1200px) {
  .dataview-query-builder__visual-mode {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
  
  .dataview-query-builder__templates-panel {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
  
  .dataview-query-builder__config-panel {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
  
  .dataview-query-builder__preview-panel {
    grid-column: 1 / 3;
    grid-row: 2 / 3;
  }
}

@media (max-width: 768px) {
  .dataview-query-builder__visual-mode {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .dataview-query-builder__templates-panel {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
  
  .dataview-query-builder__config-panel {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
  
  .dataview-query-builder__preview-panel {
    grid-column: 1 / 2;
    grid-row: 3 / 4;
  }
}

/* Templates Panel */
.dataview-query-builder__templates-panel {
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1rem;
  overflow-y: auto;
}

.dataview-query-builder__templates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-query-builder__template-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-query-builder__template-card:hover {
  border-color: #c4b5fd; /* Light purple */
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.dataview-query-builder__template-name {
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.375rem;
}

.dataview-query-builder__template-desc {
  font-size: 0.8125rem;
  color: #6b7280;
}

/* Main Configuration Panel */
.dataview-query-builder__config-panel {
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dataview-query-builder__section {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.dataview-query-builder__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.875rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dataview-query-builder__section-title i {
  color: #7c3aed; /* Purple */
  font-size: 0.875rem;
}

.dataview-query-builder__optional {
  font-weight: normal;
  color: #9ca3af;
  font-size: 0.8125rem;
  margin-left: 0.25rem;
}

/* Query Types */
.dataview-query-builder__query-types {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dataview-query-builder__type-btn {
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #4b5563;
}

.dataview-query-builder__type-btn:hover {
  border-color: #c4b5fd; /* Light purple */
  color: #7c3aed; /* Purple */
}

.dataview-query-builder__type-btn.active {
  background-color: #f5f3ff; /* Light purple */
  border-color: #c4b5fd; /* Light purple */
  color: #7c3aed; /* Purple */
  font-weight: 500;
}

.dataview-query-builder__type-description {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: #6b7280;
  font-style: italic;
}

/* Format Options */
.dataview-query-builder__format-options {
  display: flex;
  gap: 1rem;
}

.dataview-query-builder__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.dataview-query-builder__checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: #7c3aed; /* Purple */
}

.dataview-query-builder__checkbox-label {
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.dataview-query-builder__tooltip {
  color: #9ca3af;
  cursor: help;
}

/* Fields */
.dataview-query-builder__fields,
.dataview-query-builder__filters,
.dataview-query-builder__sorts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dataview-query-builder__field-row,
.dataview-query-builder__filter-row,
.dataview-query-builder__sort-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dataview-query-builder__filter-field,
.dataview-query-builder__sort-field {
  flex: 1;
}

.dataview-query-builder__filter-operator,
.dataview-query-builder__sort-direction {
  width: 150px;
}

.dataview-query-builder__filter-value {
  flex: 1;
}

.dataview-query-builder__filter-controls,
.dataview-query-builder__sort-controls {
  display: flex;
  gap: 0.25rem;
}

.dataview-query-builder__add-container {
  display: flex;
  gap: 0.5rem;
}

.dataview-query-builder__btn-add {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-query-builder__btn-add:hover {
  border-color: #a5b4fc;
  color: #7c3aed;
  background-color: #f5f3ff;
}

.dataview-query-builder__btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-query-builder__btn-icon:hover {
  border-color: #d1d5db;
  color: #4b5563;
}

.dataview-query-builder__btn-remove:hover {
  border-color: #fecaca;
  color: #ef4444;
  background-color: #fef2f2;
}

/* Common Fields Dropdown */
.dataview-query-builder__common-fields {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.5rem;
}

.dataview-query-builder__common-fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dataview-query-builder__common-fields-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  color: #4b5563;
}

.dataview-query-builder__common-fields-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.dataview-query-builder__common-field {
  padding: 0.625rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.dataview-query-builder__common-field:hover {
  background-color: #f5f3ff;
}

.dataview-query-builder__common-field-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.dataview-query-builder__common-field-type {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

/* Source */
.dataview-query-builder__source {
  display: flex;
  gap: 0.75rem;
}

.dataview-query-builder__source-select {
  width: 150px;
}

.dataview-query-builder__source-value {
  flex: 1;
}

/* Group, Limit */
.dataview-query-builder__group,
.dataview-query-builder__limit {
  display: flex;
  align-items: center;
}

/* Preview Panel */
.dataview-query-builder__preview-panel {
  background-color: #f8fafc;
  border-left: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.dataview-query-builder__preview-header {
  margin-bottom: 0.75rem;
}

.dataview-query-builder__preview-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.dataview-query-builder__preview-tab {
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: none;
  flex: 1;
  text-align: center;
  cursor: pointer;
  font-size: 0.8125rem;
  color: #6b7280;
  transition: all 0.2s;
}

.dataview-query-builder__preview-tab.active {
  background-color: #f5f3ff;
  color: #7c3aed;
  font-weight: 500;
}

.dataview-query-builder__preview-content {
  flex: 1;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: auto;
  padding: 1rem;
  height: 100%;
}

.dataview-query-builder__query-preview {
  font-family: 'Fira Code', 'Courier New', monospace;
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #334155;
}

.dataview-query-builder__query-preview pre {
  margin: 0;
}

.dataview-query-builder__query-preview code {
  display: block;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* Table Preview */
.dataview-query-builder__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.dataview-query-builder__table th,
.dataview-query-builder__table td {
  padding: 0.625rem;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.dataview-query-builder__table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #4b5563;
}

.dataview-query-builder__table tr:nth-child(even) {
  background-color: #f9fafb;
}

/* List Preview */
.dataview-query-builder__list {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0;
}

.dataview-query-builder__list li {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

/* Task Preview */
.dataview-query-builder__tasks {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dataview-query-builder__task-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: #f9fafb;
}

.dataview-query-builder__task-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #7c3aed;
}

.dataview-query-builder__task-source {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Calendar Preview */
.dataview-query-builder__calendar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  text-align: center;
}

.dataview-query-builder__calendar-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

/* Code Editor */
.dataview-query-builder__code-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dataview-query-builder__code-editor {
  width: 100%;
}

.dataview-query-builder__code-textarea {
  width: 100%;
  min-height: 250px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.dataview-query-builder__code-textarea:focus {
  outline: none;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
}

.dataview-query-builder__code-help {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.dataview-query-builder__code-help a {
  color: #7c3aed;
  text-decoration: none;
  margin-left: 0.5rem;
}

.dataview-query-builder__code-help a:hover {
  text-decoration: underline;
}

.dataview-query-builder__code-help code {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
}

/* Help Panel */
.dataview-query-builder__help-panel {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.dataview-query-builder__help-panel h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #4b5563;
}

.dataview-query-builder__help-content {
  font-size: 0.875rem;
}

.dataview-query-builder__help-content h5 {
  font-size: 0.9375rem;
  margin: 1.25rem 0 0.5rem 0;
  color: #4b5563;
}

.dataview-query-builder__help-content h5:first-child {
  margin-top: 0;
}

.dataview-query-builder__help-content ul {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}

.dataview-query-builder__help-content li {
  margin-bottom: 0.375rem;
}

.dataview-query-builder__help-content strong {
  color: #7c3aed;
}

.dataview-query-builder__help-content pre {
  background-color: #f1f5f9;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.dataview-query-builder__help-content code {
  font-family: 'Fira Code', monospace;
  font-size: 0.8125rem;
}

/* Bottom Actions */
.dataview-query-builder__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.dataview-query-builder__btn-apply {
  padding: 0.625rem 1.25rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dataview-query-builder__btn-apply:hover {
  background-color: #6d28d9;
}

/* Input controls */
.dataview-query-builder__input,
.dataview-query-builder__select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4b5563;
  background-color: white;
  transition: all 0.2s;
}

.dataview-query-builder__input:focus,
.dataview-query-builder__select:focus {
  outline: none;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
}

.dataview-query-builder__input::placeholder {
  color: #9ca3af;
}
</style>
<template>
  <div 
    class="template-section" 
    :class="[
      `template-section--${section.type}`, 
      section.pluginType ? `template-section--plugin-${section.pluginType}` : ''
    ]"
  >
    <!-- Section header with drag handle and actions -->
    <div class="template-section__header">
      <div class="template-section__handle section-handle">
        <i class="fas fa-grip-vertical"></i>
      </div>
      <div class="template-section__type">
        <i :class="sectionIcon"></i>
        <span>{{ sectionTypeLabel }}</span>
        <span v-if="section.pluginType" class="template-section__plugin-tag">
          <i :class="pluginIcon"></i>
          {{ pluginTypeLabel }}
        </span>
      </div>
      <div class="template-section__actions">
        <button 
          class="template-section__action" 
          title="Add line"
          @click="addContentLine"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button 
          class="template-section__action" 
          title="Delete section"
          @click="$emit('delete')"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <!-- Validation error alert -->
    <div v-if="validationError" class="template-section__validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <!-- Section content based on type -->
    <div class="template-section__content">
      <!-- Header section -->
      <template v-if="section.type === 'header'">
        <div 
          v-for="(line, index) in section.content" 
          :key="index"
          class="template-section__line"
        >
          <div class="template-section__input-group">
            <select 
              class="template-section__select"
              :value="getHeaderLevel(line)"
              @change="updateHeaderLevel(index, $event.target.value)"
            >
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
            </select>
            <input
              type="text"
              class="template-section__input"
              :value="getHeaderText(line)"
              @input="updateHeaderText(index, $event.target.value)"
              placeholder="Header text"
            />
            <button 
              v-if="section.content.length > 1"
              class="template-section__line-action" 
              title="Delete line"
              @click="deleteContentLine(index)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </template>
      
      <!-- Checklist section -->
      <template v-else-if="section.type === 'checklist'">
        <div 
          v-for="(line, index) in section.content" 
          :key="index"
          class="template-section__line"
        >
          <div class="template-section__input-group">
            <div class="template-section__checkbox">
              <input
                type="checkbox"
                :checked="isCheckboxChecked(line)"
                @change="toggleCheckbox(index)"
              />
            </div>
            <input
              type="text"
              class="template-section__input"
              :value="getChecklistText(line)"
              @input="updateChecklistText(index, $event.target.value)"
              placeholder="Checklist item"
            />
            <button 
              v-if="section.content.length > 1"
              class="template-section__line-action" 
              title="Delete line"
              @click="deleteContentLine(index)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </template>
      
      <!-- Table section -->
      <template v-else-if="section.type === 'table'">
        <div class="template-section__table">
          <div 
            v-for="(row, rowIndex) in tableData" 
            :key="rowIndex"
            class="template-section__table-row"
          >
            <div 
              v-for="(cell, colIndex) in row" 
              :key="colIndex"
              class="template-section__table-cell"
            >
              <input
                type="text"
                class="template-section__table-input"
                :value="cell"
                @input="updateTableCell(rowIndex, colIndex, $event.target.value)"
                :placeholder="rowIndex === 0 ? 'Header' : 'Cell'"
              />
            </div>
            
            <div class="template-section__table-actions">
              <button 
                v-if="tableData.length > 2"
                class="template-section__line-action" 
                title="Delete row"
                @click="deleteTableRow(rowIndex)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="template-section__table-controls">
            <button 
              class="template-section__table-button" 
              @click="addTableRow"
            >
              Add Row
            </button>
            <button 
              class="template-section__table-button" 
              @click="addTableColumn"
            >
              Add Column
            </button>
          </div>
        </div>
      </template>
      
      <!-- Text section -->
      <template v-else-if="section.type === 'text'">
        <div 
          v-for="(line, index) in section.content" 
          :key="index"
          class="template-section__line"
        >
          <div class="template-section__input-group">
            <textarea
              class="template-section__textarea"
              :value="line"
              @input="updateContentLine(index, $event.target.value)"
              placeholder="Enter text..."
              rows="4"
            ></textarea>
            <button 
              v-if="section.content.length > 1"
              class="template-section__line-action" 
              title="Delete line"
              @click="deleteContentLine(index)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </template>
      
      <!-- YAML Frontmatter section -->
      <template v-else-if="section.type === 'yaml'">
        <YamlEditor
          :content="section.content"
          @update:content="updateSectionContent($event)"
        />
      </template>
      
      <!-- Templater Field section -->
      <template v-else-if="section.type === 'templaterField'">
        <TemplaterFieldEditor
          :content="section.content"
          @update:content="updateSectionContent($event)"
        />
      </template>
      
      <!-- Dataview Query section -->
      <template v-else-if="section.type === 'dataviewQuery'">
        <DataviewQueryBuilder
          :content="section.content"
          @update:content="updateSectionContent($event)"
        />
      </template>
      
      <!-- Kanban Board section -->
      <template v-else-if="section.type === 'kanban'">
        <KanbanBoardBuilder
          :content="section.content"
          @update:content="updateSectionContent($event)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { TemplateSection, PluginType } from '@/types/TemplateSection';
import { TEMPLATER, DATAVIEW, KANBAN, getPluginDisplayName, getSectionIcon, validatePluginSyntax } from '@/utils/pluginTemplates';
import { v4 as uuidv4 } from 'uuid';
import YamlEditor from './YamlEditor.vue';
import TemplaterFieldEditor from './TemplaterFieldEditor.vue';
import DataviewQueryBuilder from './DataviewQueryBuilder.vue';
import KanbanBoardBuilder from './KanbanBoardBuilder.vue';

// Define props
const props = defineProps<{
  section: TemplateSection
}>();

// Define emits
const emit = defineEmits<{
  (e: 'update:content', content: string[]): void;
  (e: 'delete'): void;
}>();

// Get section type label
const sectionTypeLabel = computed(() => {
  const labels = {
    header: 'Header',
    checklist: 'Checklist',
    table: 'Table',
    text: 'Text',
    yaml: 'YAML Frontmatter',
    templaterField: 'Templater Field',
    dataviewQuery: 'Dataview Query',
    kanban: 'Kanban Board'
  };
  return labels[props.section.type] || props.section.type;
});

// Get section icon
const sectionIcon = computed(() => {
  return getSectionIcon(props.section.type);
});

// Get plugin display name and icon
const pluginTypeLabel = computed(() => {
  return props.section.pluginType ? getPluginDisplayName(props.section.pluginType) : '';
});

const pluginIcon = computed(() => {
  const icons = {
    templater: 'fas fa-calendar-alt',
    dataview: 'fas fa-database',
    kanban: 'fas fa-columns'
  };
  return icons[props.section.pluginType || ''] || '';
});

// Validation error handling
const validationError = ref<string | null>(null);

// Validate plugin syntax when content changes
watch(() => props.section.content, (newContent) => {
  if (props.section.pluginType) {
    const result = validatePluginSyntax(props.section.pluginType, newContent);
    validationError.value = result.isValid ? null : result.error || null;
  } else {
    validationError.value = null;
  }
}, { deep: true });

// Basic section methods ------------------------------------------------------

// Add a new line to the content
const addContentLine = () => {
  const newContent = [...props.section.content];
  
  switch (props.section.type) {
    case 'header':
      newContent.push('# New Header');
      break;
    case 'checklist':
      newContent.push('- [ ] New item');
      break;
    case 'text':
      newContent.push('New paragraph');
      break;
    default:
      newContent.push('');
  }
  
  emit('update:content', newContent);
};

// Delete a line from the content
const deleteContentLine = (index: number) => {
  const newContent = [...props.section.content];
  newContent.splice(index, 1);
  emit('update:content', newContent);
};

// Update a line in the content
const updateContentLine = (index: number, newValue: string) => {
  const newContent = [...props.section.content];
  newContent[index] = newValue;
  emit('update:content', newContent);
};

// Header-specific methods
const getHeaderLevel = (line: string): string => {
  const match = line.match(/^(#+)\s/);
  return match ? match[1].length.toString() : '1';
};

const getHeaderText = (line: string): string => {
  return line.replace(/^#+\s/, '');
};

const updateHeaderLevel = (index: number, level: string) => {
  const headerText = getHeaderText(props.section.content[index]);
  const newHeader = '#'.repeat(parseInt(level)) + ' ' + headerText;
  updateContentLine(index, newHeader);
};

const updateHeaderText = (index: number, text: string) => {
  const level = getHeaderLevel(props.section.content[index]);
  const newHeader = '#'.repeat(parseInt(level)) + ' ' + text;
  updateContentLine(index, newHeader);
};

// Checklist-specific methods
const isCheckboxChecked = (line: string): boolean => {
  return line.includes('- [x]');
};

const getChecklistText = (line: string): string => {
  return line.replace(/^- \[([ x])\]\s/, '');
};

const toggleCheckbox = (index: number) => {
  const text = getChecklistText(props.section.content[index]);
  const isChecked = isCheckboxChecked(props.section.content[index]);
  const newLine = isChecked ? `- [ ] ${text}` : `- [x] ${text}`;
  updateContentLine(index, newLine);
};

const updateChecklistText = (index: number, text: string) => {
  const isChecked = isCheckboxChecked(props.section.content[index]);
  const prefix = isChecked ? '- [x] ' : '- [ ] ';
  updateContentLine(index, prefix + text);
};

// Table-specific methods
const tableData = computed(() => {
  // Parse the markdown table into a 2D array
  return props.section.content.map(line => {
    // Skip separator line (the one with dashes)
    if (line.includes('---')) return [];
    
    // Split the line by pipe and remove empty elements from start/end
    const cells = line.split('|').filter(cell => cell.trim() !== '');
    return cells.map(cell => cell.trim());
  }).filter(row => row.length > 0);
});

const updateTableData = () => {
  // Convert the 2D array back to markdown table format
  const headers = tableData.value[0] || [];
  const data = tableData.value.slice(1);
  
  // Create header row
  const headerRow = '| ' + headers.join(' | ') + ' |';
  
  // Create separator row
  const separatorRow = '|' + headers.map(() => '----------|').join('') + '|';
  
  // Create data rows
  const dataRows = data.map(row => {
    // Pad the row if it has fewer cells than headers
    const paddedRow = [...row];
    while (paddedRow.length < headers.length) {
      paddedRow.push('');
    }
    return '| ' + paddedRow.join(' | ') + ' |';
  });
  
  // Combine all rows
  const newContent = [headerRow, separatorRow, ...dataRows];
  emit('update:content', newContent);
};

const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
  const newTableData = JSON.parse(JSON.stringify(tableData.value));
  newTableData[rowIndex][colIndex] = value;
  
  // Update the computed property manually since we can't directly set it
  tableData.value.forEach((row, i) => {
    row.forEach((_, j) => {
      if (newTableData[i] && newTableData[i][j] !== undefined) {
        tableData.value[i][j] = newTableData[i][j];
      }
    });
  });
  
  updateTableData();
};

const addTableRow = () => {
  const columnCount = tableData.value[0]?.length || 3;
  const newRow = Array(columnCount).fill('');
  
  // Add the row to our data structure
  const newTableData = [...tableData.value, newRow];
  
  // Convert back to markdown and update
  const headers = newTableData[0] || [];
  const data = newTableData.slice(1);
  
  const headerRow = '| ' + headers.join(' | ') + ' |';
  const separatorRow = '|' + headers.map(() => '----------|').join('') + '|';
  const dataRows = data.map(row => '| ' + row.join(' | ') + ' |');
  
  emit('update:content', [headerRow, separatorRow, ...dataRows]);
};

const addTableColumn = () => {
  const newTableData = tableData.value.map(row => [...row, '']);
  
  // Convert back to markdown and update
  const headers = newTableData[0] || [];
  const data = newTableData.slice(1);
  
  const headerRow = '| ' + headers.join(' | ') + ' |';
  const separatorRow = '|' + headers.map(() => '----------|').join('') + '|';
  const dataRows = data.map(row => '| ' + row.join(' | ') + ' |');
  
  emit('update:content', [headerRow, separatorRow, ...dataRows]);
};

const deleteTableRow = (rowIndex: number) => {
  // Make sure we don't delete the header row
  if (rowIndex === 0) return;
  
  const newTableData = [...tableData.value];
  newTableData.splice(rowIndex, 1);
  
  // Convert back to markdown and update
  const headers = newTableData[0] || [];
  const data = newTableData.slice(1);
  
  const headerRow = '| ' + headers.join(' | ') + ' |';
  const separatorRow = '|' + headers.map(() => '----------|').join('') + '|';
  const dataRows = data.map(row => '| ' + row.join(' | ') + ' |');
  
  emit('update:content', [headerRow, separatorRow, ...dataRows]);
};

// YAML Frontmatter methods --------------------------------------------------

// Update section content - used by YAML editor component
const updateSectionContent = (newContent: string[]) => {
  emit('update:content', newContent);
};

// Templater Field methods ---------------------------------------------------

// Tabs for the Templater editor
const activeTemplaterTab = ref('date');

// Templater date format options
const templaterDateFormat = ref('YYYY-MM-DD');
const templaterCustomFormat = ref('');
const templaterDateType = ref('now');

// Templater file property options
const templaterFileProperty = ref('title');

// Update templater date field
const updateTemplaterDate = () => {
  let format = templaterDateFormat.value;
  
  if (format === 'custom') {
    format = templaterCustomFormat.value || 'YYYY-MM-DD';
  }
  
  let templaterCode = '';
  
  switch (templaterDateType.value) {
    case 'now':
      templaterCode = `<% tp.date.now("${format}") %>`;
      break;
    case 'yesterday':
      templaterCode = `<% tp.date.yesterday("${format}") %>`;
      break;
    case 'tomorrow':
      templaterCode = `<% tp.date.tomorrow("${format}") %>`;
      break;
    case 'file.creation_date':
      templaterCode = `<% tp.file.creation_date("${format}") %>`;
      break;
  }
  
  emit('update:content', [templaterCode]);
};

// Update templater file property
const updateTemplaterFile = () => {
  let templaterCode = '';
  
  switch (templaterFileProperty.value) {
    case 'title':
      templaterCode = `<% tp.file.title %>`;
      break;
    case 'creation_date':
      templaterCode = `<% tp.file.creation_date() %>`;
      break;
    case 'folder':
      templaterCode = `<% tp.file.folder() %>`;
      break;
    case 'path':
      templaterCode = `<% tp.file.path() %>`;
      break;
    case 'selection':
      templaterCode = `<% tp.file.selection() %>`;
      break;
    case 'cursor':
      templaterCode = `<% tp.file.cursor() %>`;
      break;
  }
  
  emit('update:content', [templaterCode]);
};

// Update templater custom code
const updateTemplaterCustom = (value: string) => {
  emit('update:content', [value]);
};

// Initialize templater based on current content
onMounted(() => {
  if (props.section.type === 'templaterField' && props.section.content[0]) {
    const content = props.section.content[0];
    
    // Check if it's a date field
    if (content.includes('tp.date.now')) {
      activeTemplaterTab.value = 'date';
      templaterDateType.value = 'now';
      // Extract format if possible
      const formatMatch = content.match(/tp\.date\.now\("([^"]+)"\)/);
      if (formatMatch && formatMatch[1]) {
        const format = formatMatch[1];
        if (['YYYY-MM-DD', 'MM/DD/YYYY', 'DD.MM.YYYY', 'dddd, MMMM Do YYYY', 'YYYY-MM-DDTHH:mm:ssZ'].includes(format)) {
          templaterDateFormat.value = format;
        } else {
          templaterDateFormat.value = 'custom';
          templaterCustomFormat.value = format;
        }
      }
    } else if (content.includes('tp.date.yesterday')) {
      activeTemplaterTab.value = 'date';
      templaterDateType.value = 'yesterday';
    } else if (content.includes('tp.date.tomorrow')) {
      activeTemplaterTab.value = 'date';
      templaterDateType.value = 'tomorrow';
    } else if (content.includes('tp.file.creation_date')) {
      const hasFormat = content.includes('tp.file.creation_date(');
      if (hasFormat) {
        activeTemplaterTab.value = 'date';
        templaterDateType.value = 'file.creation_date';
        // Extract format if possible
        const formatMatch = content.match(/tp\.file\.creation_date\("([^"]+)"\)/);
        if (formatMatch && formatMatch[1]) {
          const format = formatMatch[1];
          if (['YYYY-MM-DD', 'MM/DD/YYYY', 'DD.MM.YYYY', 'dddd, MMMM Do YYYY', 'YYYY-MM-DDTHH:mm:ssZ'].includes(format)) {
            templaterDateFormat.value = format;
          } else {
            templaterDateFormat.value = 'custom';
            templaterCustomFormat.value = format;
          }
        }
      } else {
        activeTemplaterTab.value = 'file';
        templaterFileProperty.value = 'creation_date';
      }
    } else if (content.includes('tp.file.title')) {
      activeTemplaterTab.value = 'file';
      templaterFileProperty.value = 'title';
    } else if (content.includes('tp.file.folder')) {
      activeTemplaterTab.value = 'file';
      templaterFileProperty.value = 'folder';
    } else if (content.includes('tp.file.path')) {
      activeTemplaterTab.value = 'file';
      templaterFileProperty.value = 'path';
    } else if (content.includes('tp.file.selection')) {
      activeTemplaterTab.value = 'file';
      templaterFileProperty.value = 'selection';
    } else if (content.includes('tp.file.cursor')) {
      activeTemplaterTab.value = 'file';
      templaterFileProperty.value = 'cursor';
    } else {
      activeTemplaterTab.value = 'custom';
    }
  }
});

// Dataview Query methods have been moved to DataviewQueryBuilder component

</script>

<style scoped>
.template-section {
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.template-section:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
}

.template-section__header {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  background: rgba(250, 250, 255, 0.9);
  border-bottom: 1px solid rgba(230, 235, 245, 0.8);
}

.template-section__handle {
  cursor: grab;
  color: #94a3b8;
  margin-right: 0.75rem;
  transition: color 0.2s;
}

.template-section__handle:hover {
  color: #4f46e5;
}

.template-section__type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  color: #334155;
}

.template-section__plugin-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.template-section--plugin-templater .template-section__plugin-tag {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.template-section--plugin-dataview .template-section__plugin-tag {
  background-color: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.template-section--plugin-kanban .template-section__plugin-tag {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.template-section__actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.template-section__action {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.2s;
}

.template-section__action:hover {
  background-color: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
}

.template-section__action:last-child:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.template-section__validation-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

.template-section__content {
  padding: 1.25rem;
}

.template-section__line {
  margin-bottom: 1rem;
}

.template-section__input-group {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.template-section__input-group--indent {
  margin-left: 1.5rem;
}

.template-section__select {
  width: 80px;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.template-section__select--wide {
  width: 100%;
  min-width: 200px;
}

.template-section__select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.template-section__input {
  flex: 1;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-section__input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.template-section__line-action {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.2s;
}

.template-section__line-action:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.template-section__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-section__checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4f46e5;
}

.template-section__textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  width: 100%;
  transition: all 0.2s;
  line-height: 1.5;
}

.template-section__textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Table specific styles */
.template-section__table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.template-section__table-row {
  display: flex;
  margin-bottom: 0.625rem;
}

.template-section__table-cell {
  flex: 1;
  padding: 0 0.325rem;
}

.template-section__table-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-section__table-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.template-section__table-actions {
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
}

.template-section__table-controls {
  display: flex;
  gap: 0.625rem;
  margin-top: 1.25rem;
}

.template-section__table-button {
  padding: 0.625rem 0.875rem;
  background-color: rgba(99, 102, 241, 0.07);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-section__table-button:hover {
  background-color: rgba(99, 102, 241, 0.15);
}

/* YAML Frontmatter styles */
.template-section__yaml {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.template-section__yaml-header {
  background-color: #f8fafc;
  padding: 0.625rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.template-section__yaml-pairs {
  padding: 1rem;
}

.template-section__yaml-pair {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.template-section__yaml-key {
  width: 40%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-section__yaml-separator {
  color: #64748b;
  font-weight: 500;
}

.template-section__yaml-value {
  flex: 1;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.template-section__yaml-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background-color: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
  margin-top: 0.5rem;
}

.template-section__yaml-add:hover {
  background-color: #f1f5f9;
  color: #334155;
}

/* Plugin-specific UI components */
.template-section__plugin-editor {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.template-section__plugin-tabs {
  display: flex;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.template-section__plugin-tab {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-section__plugin-tab:hover {
  color: #334155;
  background-color: rgba(241, 245, 249, 0.6);
}

.template-section__plugin-tab--active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
  background-color: white;
}

.template-section__plugin-content {
  padding: 1.25rem;
}

.template-section__select-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.template-section__select-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.template-section__preview-field {
  margin-top: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.template-section__preview-label {
  background-color: #f8fafc;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.template-section__preview-code {
  padding: 0.75rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  background-color: #f8fafc;
  color: #334155;
  overflow-x: auto;
  white-space: pre-wrap;
}

.template-section__preview-query {
  padding: 0.75rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  background-color: #f8fafc;
  color: #334155;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0;
}

.template-section__help-text {
  font-size: 0.8125rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.template-section__help-text code {
  font-family: 'Fira Code', monospace;
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.8125rem;
}

.template-section__code-editor {
  width: 100%;
}

.template-section__code-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 160px;
  resize: vertical;
  transition: all 0.2s;
}

.template-section__code-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Kanban specific styles */
.template-section__plugin-subtitle {
  font-size: 0.9375rem;
  color: #334155;
  margin: 0 0 0.875rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.template-section__kanban-editor {
  margin-bottom: 1.25rem;
}

.template-section__kanban-settings {
  margin-bottom: 1.5rem;
}

.template-section__kanban-lanes-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.template-section__kanban-lane {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  background-color: #f8fafc;
}

.template-section__kanban-item {
  margin: 0.625rem 0;
}

.template-section__kanban-add-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px dashed #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
  margin-top: 0.875rem;
}

.template-section__kanban-add-item:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.template-section__kanban-add-lane {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px dashed #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.template-section__kanban-add-lane:hover {
  background-color: #f1f5f9;
  color: #334155;
}

/* Type-specific styles */
.template-section--header {
  border-top: 3px solid #4f46e5;
}

.template-section--checklist {
  border-top: 3px solid #10b981;
}

.template-section--table {
  border-top: 3px solid #f59e0b;
}

.template-section--text {
  border-top: 3px solid #6366f1;
}

.template-section--yaml {
  border-top: 3px solid #475569;
}

.template-section--templaterField {
  border-top: 3px solid #3b82f6;
}

.template-section--dataviewQuery {
  border-top: 3px solid #059669;
}

.template-section--kanban {
  border-top: 3px solid #8b5cf6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .template-section__plugin-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  
  .template-section__plugin-tab {
    white-space: nowrap;
    padding: 0.625rem 0.875rem;
  }
  
  .template-section__yaml-pair {
    flex-direction: column;
    align-items: stretch;
  }
  
  .template-section__yaml-key,
  .template-section__yaml-value {
    width: 100%;
  }
  
  .template-section__yaml-separator {
    display: none;
  }
}
</style>
<template>
  <div 
    class="template-section" 
    :class="`template-section--${section.type}`"
  >
    <!-- Section header with drag handle and actions -->
    <div class="template-section__header">
      <div class="template-section__handle section-handle">
        <i class="fas fa-grip-vertical"></i>
      </div>
      <div class="template-section__type">
        <i :class="sectionIcon"></i>
        {{ sectionTypeLabel }}
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';

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
    text: 'Text'
  };
  return labels[props.section.type] || props.section.type;
});

// Get section icon
const sectionIcon = computed(() => {
  const icons = {
    header: 'fas fa-heading',
    checklist: 'fas fa-check-square',
    table: 'fas fa-table',
    text: 'fas fa-align-left'
  };
  return icons[props.section.type] || 'fas fa-file-alt';
});

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
</script>

<style scoped>
.template-section {
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.2s ease;
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

.template-section__select {
  width: 80px;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: #f8fafc;
  transition: all 0.2s;
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
</style>
<template>
  <div 
    class="template-section" 
    :class="[
      `template-section--${section.type}`, 
      section.pluginType ? `template-section--plugin-${section.pluginType}` : '',
      { 'template-section--selected': isSelected },
      { 'template-section--editing': isEditing }
    ]"
    @click="handleSectionClick"
    @keydown="handleKeyboardShortcut"
    tabindex="0"
    ref="sectionRef"
  >
    <!-- Section header with drag handle and actions -->
    <div class="template-section-header">
      <div class="template-section-handle section-handle">
        <i class="fas fa-grip-vertical"></i>
      </div>
      <div class="template-section-type">
        <i :class="sectionIcon"></i>
        <span>{{ sectionTypeLabel }}</span>
        <span v-if="section.pluginType" class="template-section-plugin-tag">
          <i :class="pluginIcon"></i>
          {{ pluginTypeLabel }}
        </span>
      </div>
      <div class="template-section-actions">
        <button 
          class="template-section-action" 
          title="Add line (Alt+A)"
          @click.stop="addContentLine"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button 
          class="template-section-action template-section-action--duplicate" 
          title="Duplicate section (Alt+D)"
          @click.stop="$emit('duplicate')"
        >
          <i class="fas fa-copy"></i>
        </button>
        <button 
          class="template-section-action template-section-action--delete" 
          title="Delete section (Alt+Delete)"
          @click.stop="confirmDeleteSection"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <!-- Validation error alert -->
    <div v-if="validationError" class="template-section-validation-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <!-- Section content based on type -->
    <div class="template-section-content">
      <!-- Header section -->
      <template v-if="section.type === 'header'">
        <div 
          v-for="(line, index) in section.content" 
          :key="index"
          class="template-section-line"
        >
          <div class="template-section-input-group">
            <select 
              class="template-section-select"
              :value="getHeaderLevel(line)"
              @change="debouncedUpdateHeaderLevel(index, $event.target.value)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              :ref="el => { if (index === 0 && autoFocus) setInputRef(el) }"
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
              class="template-section-input"
              :value="getHeaderText(line)"
              @input="debouncedUpdateHeaderText(index, $event.target.value)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              placeholder="Header text"
            />
            <button 
              v-if="section.content.length > 1"
              class="template-section-line-action" 
              title="Delete line"
              @click.stop="deleteContentLine(index)"
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
          class="template-section-line"
        >
          <div class="template-section-input-group">
            <div class="template-section-checkbox">
              <input
                type="checkbox"
                :checked="isCheckboxChecked(line)"
                @change="toggleCheckbox(index)"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
              />
            </div>
            <input
              type="text"
              class="template-section-input"
              :value="getChecklistText(line)"
              @input="debouncedUpdateChecklistText(index, $event.target.value)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              placeholder="Checklist item"
              :ref="el => { if (index === 0 && autoFocus) setInputRef(el) }"
            />
            <button 
              v-if="section.content.length > 1"
              class="template-section-line-action" 
              title="Delete line"
              @click.stop="deleteContentLine(index)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </template>
      
      <!-- Table section -->
      <template v-else-if="section.type === 'table'">
        <div class="template-section-table">
          <div 
            v-for="(row, rowIndex) in tableData" 
            :key="rowIndex"
            class="template-section-table-row"
          >
            <div 
              v-for="(cell, colIndex) in row" 
              :key="colIndex"
              class="template-section-table-cell"
            >
              <input
                type="text"
                class="template-section-table-input"
                :value="cell"
                @input="debouncedUpdateTableCell(rowIndex, colIndex, $event.target.value)"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
                :placeholder="rowIndex === 0 ? 'Header' : 'Cell'"
                :ref="el => { if (rowIndex === 0 && colIndex === 0 && autoFocus) setInputRef(el) }"
              />
            </div>
            
            <div class="template-section-table-actions">
              <button 
                v-if="tableData.length > 2"
                class="template-section-line-action" 
                title="Delete row"
                @click.stop="deleteTableRow(rowIndex)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="template-section-table-controls">
            <button 
              class="template-section-table-button" 
              @click.stop="addTableRow"
              title="Add new row (Alt+R)"
            >
              <i class="fas fa-plus"></i> Add Row
            </button>
            <button 
              class="template-section-table-button" 
              @click.stop="addTableColumn"
              title="Add new column (Alt+C)"
            >
              <i class="fas fa-plus"></i> Add Column
            </button>
          </div>
        </div>
      </template>
      
      <!-- Text section -->
      <template v-else-if="section.type === 'text'">
        <div 
          v-for="(line, index) in section.content" 
          :key="index"
          class="template-section-line"
        >
          <div class="template-section-input-group">
            <textarea
              class="template-section-textarea"
              :value="line"
              @input="debouncedUpdateContentLine(index, $event.target.value)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              placeholder="Enter text..."
              rows="4"
              :ref="el => { if (index === 0 && autoFocus) setInputRef(el) }"
            ></textarea>
            <button 
              v-if="section.content.length > 1"
              class="template-section-line-action" 
              title="Delete line"
              @click.stop="deleteContentLine(index)"
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
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :auto-focus="autoFocus"
        />
      </template>
      
      <!-- Templater Field section -->
      <template v-else-if="section.type === 'templaterField'">
        <TemplaterFieldEditor
          :content="section.content"
          @update:content="updateSectionContent($event)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :auto-focus="autoFocus"
        />
      </template>
      
      <!-- Dataview Query section -->
      <template v-else-if="section.type === 'dataviewQuery'">
        <DataviewQueryBuilder
          :content="section.content"
          @update:content="updateSectionContent($event)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :auto-focus="autoFocus"
        />
      </template>
      
      <!-- Kanban Board section -->
      <template v-else-if="section.type === 'kanban'">
        <KanbanBoardBuilder
          :content="section.content"
          @update:content="updateSectionContent($event)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :auto-focus="autoFocus"
        />
      </template>
    </div>
    
    <!-- Toast for feedback messages -->
    <Transition name="toast">
      <div v-if="showToast" class="template-section-toast" :class="toastType">
        <i :class="toastIcon"></i>
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { TemplateSection, PluginType } from '@/types/TemplateSection';
import { TEMPLATER, DATAVIEW, KANBAN, getPluginDisplayName, getSectionIcon, validatePluginSyntax } from '@/utils/pluginTemplates';
import { v4 as uuidv4 } from 'uuid';
import YamlEditor from './YamlEditor.vue';
import TemplaterFieldEditor from './TemplaterFieldEditor.vue';
import DataviewQueryBuilder from './DataviewQueryBuilder.vue';
import KanbanBoardBuilder from './KanbanBoardBuilder.vue';

// Define props
const props = defineProps<{
  section: TemplateSection,
  isSelected?: boolean,
  autoFocus?: boolean
}>();

// Define emits
const emit = defineEmits<{
  (e: 'update:content', content: string[]): void;
  (e: 'delete'): void;
  (e: 'select'): void;
  (e: 'duplicate'): void;
}>();

// Component state
const isEditing = ref(false);
const sectionRef = ref<HTMLElement | null>(null);
const lastActiveElement = ref<HTMLElement | null>(null);

// Toast feedback state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error' | 'info'>('info');
const toastTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Focus management
const firstInputRef = ref<HTMLElement | null>(null);

// Set the input reference for autofocus
const setInputRef = (el: HTMLElement | null) => {
  if (el) {
    firstInputRef.value = el;
  }
};

// Focus the first input if autoFocus is true
onMounted(() => {
  // Initialize the section
  if (props.isSelected && props.autoFocus && firstInputRef.value) {
    nextTick(() => {
      firstInputRef.value?.focus();
    });
  }
  
  // Add event handler for outside clicks to deselect
  document.addEventListener('click', handleOutsideClick);
});

// Handle section selection/deselection
const handleSectionClick = () => {
  emit('select');
};

// Handle click outside the section
const handleOutsideClick = (event: MouseEvent) => {
  if (sectionRef.value && !sectionRef.value.contains(event.target as Node)) {
    // If we're not editing, we can deselect
    if (!isEditing.value) {
      // Not emitting anything here because the parent component
      // will handle the selection of the new section
    }
  }
};

// Set editing state
const setEditing = (editing: boolean) => {
  isEditing.value = editing;
  
  // Store the last active element if we're starting to edit
  if (editing) {
    lastActiveElement.value = document.activeElement as HTMLElement;
  }
};

// Keyboard shortcut handling
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  // Don't intercept shortcuts when editing text fields
  const target = event.target as HTMLElement;
  const isEditingInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  
  // Check for Alt+key shortcuts that can be used while editing
  if (event.altKey) {
    if (event.key === 'a') {
      event.preventDefault();
      addContentLine();
      displayToast('Line added', 'success');
      return;
    }
    
    if (event.key === 'd') {
      event.preventDefault();
      emit('duplicate');
      displayToast('Section duplicated', 'success');
      return;
    }
    
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      confirmDeleteSection();
      return;
    }
    
    // Table-specific shortcuts
    if (props.section.type === 'table') {
      if (event.key === 'r') {
        event.preventDefault();
        addTableRow();
        displayToast('Row added', 'success');
        return;
      }
      
      if (event.key === 'c') {
        event.preventDefault();
        addTableColumn();
        displayToast('Column added', 'success');
        return;
      }
    }
  }
  
  // Don't process other shortcuts if editing an input
  if (isEditingInput) return;
  
  // Regular shortcuts when not editing
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    confirmDeleteSection();
  }
  
  // Add more keyboard shortcuts as needed
};

// Toast management
const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Clear any existing toast timeout
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value);
  }
  
  // Set toast properties
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  
  // Auto-hide the toast after 3 seconds
  toastTimeout.value = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const toastIcon = computed(() => {
  switch (toastType.value) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-exclamation-circle';
    default: return 'fas fa-info-circle';
  }
});

// Debouncing function for input events
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debounce = (fn: Function, delay = 300) => {
  return (...args: any[]) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// Confirm section deletion
const confirmDeleteSection = () => {
  if (confirm("Are you sure you want to delete this section?")) {
    emit('delete');
  }
};

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
  
  // Focus the new item on the next tick
  nextTick(() => {
    const inputs = sectionRef.value?.querySelectorAll('input, textarea, select');
    if (inputs && inputs.length > 0) {
      (inputs[inputs.length - 1] as HTMLElement).focus();
    }
  });
};

// Delete a line from the content
const deleteContentLine = (index: number) => {
  const newContent = [...props.section.content];
  newContent.splice(index, 1);
  emit('update:content', newContent);
  displayToast('Line deleted', 'info');
};

// Update a line in the content
const updateContentLine = (index: number, newValue: string) => {
  const newContent = [...props.section.content];
  newContent[index] = newValue;
  emit('update:content', newContent);
};

// Create debounced versions of update methods
const debouncedUpdateContentLine = debounce(updateContentLine, 300);

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

// Create debounced versions of header methods
const debouncedUpdateHeaderLevel = debounce(updateHeaderLevel, 300);
const debouncedUpdateHeaderText = debounce(updateHeaderText, 300);

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

// Create debounced version of checklist text update
const debouncedUpdateChecklistText = debounce(updateChecklistText, 300);

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

// Create debounced version of table cell update
const debouncedUpdateTableCell = debounce(updateTableCell, 300);

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
  
  // Focus the new row on next tick
  nextTick(() => {
    const inputs = sectionRef.value?.querySelectorAll('.template-section-table-input');
    if (inputs && inputs.length > 0) {
      // Focus the first cell of the new row
      const index = (newTableData.length - 1) * headers.length;
      if (inputs[index]) {
        (inputs[index] as HTMLElement).focus();
      }
    }
  });
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
  
  // Focus the new column header on next tick
  nextTick(() => {
    const inputs = sectionRef.value?.querySelectorAll('.template-section-table-input');
    if (inputs && inputs.length > 0) {
      // Focus the header of the new column
      const index = headers.length - 1;
      if (inputs[index]) {
        (inputs[index] as HTMLElement).focus();
      }
    }
  });
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
  displayToast('Row deleted', 'info');
};

// Update section content - used by editor components
const updateSectionContent = (newContent: string[]) => {
  emit('update:content', newContent);
};
</script>

<style scoped>
.template-section {
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-md);
  position: relative;
  outline: none;
}

.template-section:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
}

/* Selected state styling */
.template-section--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(255, 171, 88, 0.2), 0 5px 15px rgba(0, 0, 0, 0.07);
  transform: translateY(-1px);
}

/* Editing state styling */
.template-section--editing {
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.3), 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Focus outline for keyboard navigation */
.template-section:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.template-section-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.2s ease;
}

.template-section--selected .template-section-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom-color: rgba(255, 171, 88, 0.2);
}

.template-section-handle {
  cursor: grab;
  color: var(--color-text-muted);
  margin-right: var(--spacing-sm);
  transition: color 0.2s;
}

.template-section-handle:hover {
  color: var(--color-primary);
}

.template-section--selected .template-section-handle {
  color: var(--color-primary);
}

.template-section-type {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--color-text);
}

.template-section--selected .template-section-type {
  color: var(--color-text-dark);
}

.template-section-plugin-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  padding: 2px var(--spacing-xs);
  background-color: rgba(255, 171, 88, 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  margin-left: var(--spacing-xs);
}

.template-section--plugin-templater .template-section-plugin-tag {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.template-section--plugin-dataview .template-section-plugin-tag {
  background-color: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.template-section--plugin-kanban .template-section-plugin-tag {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.template-section-actions {
  margin-left: auto;
  display: flex;
  gap: var(--spacing-xs);
}

.template-section-action {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.template-section-action:hover {
  background-color: rgba(255, 171, 88, 0.1);
  color: var(--color-primary);
}

.template-section-action--duplicate:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.template-section-action--delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.template-section-validation-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

.template-section-content {
  padding: var(--spacing-md);
}

.template-section-line {
  margin-bottom: var(--spacing-md);
}

.template-section-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.template-section-select {
  width: 80px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-section-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-section-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-section-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-section-line-action {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s;
  opacity: 0.7;
}

.template-section-line-action:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  opacity: 1;
}

.template-section-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-section-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.template-section-textarea {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
  line-height: 1.5;
}

.template-section-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

/* Table specific styles */
.template-section-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-md);
}

.template-section-table-row {
  display: flex;
  margin-bottom: var(--spacing-xs);
}

.template-section-table-cell {
  flex: 1;
  padding: 0 var(--spacing-xs);
}

.template-section-table-input {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-section-table-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-section-table-actions {
  display: flex;
  align-items: center;
  padding-left: var(--spacing-xs);
}

.template-section-table-controls {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.template-section-table-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(255, 171, 88, 0.07);
  border: 1px solid rgba(255, 171, 88, 0.1);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.template-section-table-button:hover {
  background-color: rgba(255, 171, 88, 0.15);
}

.template-section-table-button i {
  font-size: 0.75rem;
}

/* Type-specific styles */
.template-section--header {
  border-top: 3px solid var(--color-primary);
}

.template-section--checklist {
  border-top: 3px solid #10b981;
}

.template-section--table {
  border-top: 3px solid #f59e0b;
}

.template-section--text {
  border-top: 3px solid var(--color-primary-light);
}

.template-section--yaml {
  border-top: 3px solid var(--color-text-muted);
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

/* Toast notification styling */
.template-section-toast {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 80%;
  border-left: 3px solid #64748b;
}

.template-section-toast.success {
  border-left-color: #10b981;
}

.template-section-toast.success i {
  color: #10b981;
}

.template-section-toast.error {
  border-left-color: #ef4444;
}

.template-section-toast.error i {
  color: #ef4444;
}

.template-section-toast.info {
  border-left-color: #3b82f6;
}

.template-section-toast.info i {
  color: #3b82f6;
}

/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Keyboard shortcut hints in tooltips */
button[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 20;
}

/* Responsive styles */
@media (max-width: 768px) {
  .template-section-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .template-section-content {
    padding: var(--spacing-sm);
  }
  
  .template-section-action {
    width: 28px;
    height: 28px;
  }
  
  .template-section-toast {
    font-size: 0.75rem;
    padding: 6px 10px;
  }
}

/* Animation for focusing on new sections */
@keyframes highlight-new {
  0% {
    box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.8);
  }
  100% {
    box-shadow: var(--glass-shadow);
  }
}
</style>
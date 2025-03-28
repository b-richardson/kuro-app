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
    @add-line="addTableRow"
    ref="baseModuleRef"
  >
    <div class="template-module-editor-table">
      <!-- Empty table state -->
      <div v-if="tableIsEmpty" class="template-module-editor-table-empty">
        <i class="fas fa-table"></i>
        <p>Add data to create your table</p>
        <button
          class="template-module-editor-table-button template-module-editor-empty-table-button"
          @click.stop="initializeEmptyTable"
        >
          <i class="fas fa-plus"></i> Create Table
        </button>
      </div>

      <template v-else>
        <!-- Table header row with column delete buttons -->
        <div class="template-module-editor-table-header">
          <div
            v-for="(header, colIndex) in tableData[0]"
            :key="`header-${colIndex}`"
            class="template-module-editor-table-header-cell"
          >
            <div class="template-module-editor-table-cell-container">
              <input
                type="text"
                class="template-module-editor-table-header-input"
                :value="header"
                @input="updateTableCell(0, colIndex, $event.target.value)"
                @keydown="handleTableKeyboardNavigation($event, 0, colIndex)"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
                placeholder="Header"
                :ref="(el) => { if (colIndex === 0 && autoFocus) setInputRef(el); }"
              />
              <button
                v-if="tableData[0].length > 1"
                class="template-module-editor-column-delete"
                title="Delete column"
                @click.stop="deleteTableColumn(colIndex)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Table data rows -->
        <div
          v-for="(row, rowIndex) in tableData"
          :key="rowIndex"
          class="template-module-editor-table-row"
        >
          <!-- Skip rendering the header row here since we now have a separate header -->
          <template v-if="rowIndex > 0">
            <div
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              class="template-module-editor-table-cell"
            >
              <input
                type="text"
                class="template-module-editor-table-input"
                :value="cell"
                @input="updateTableCell(rowIndex, colIndex, $event.target.value)"
                @keydown="handleTableKeyboardNavigation($event, rowIndex, colIndex)"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
                placeholder="Cell"
              />
            </div>

            <div class="template-module-editor-table-actions">
              <button
                v-if="tableData.length > 2"
                class="template-module-editor-line-action"
                title="Delete row"
                @click.stop="deleteTableRow(rowIndex)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </template>
        </div>

        <div class="template-module-editor-table-controls">
          <button
            class="template-module-editor-table-button"
            @click.stop="addTableRow"
            title="Add new row (Alt+R)"
            :disabled="tableData.length >= MAX_ROWS"
          >
            <i class="fas fa-plus"></i> Add Row
          </button>
          <button
            class="template-module-editor-table-button"
            @click.stop="addTableColumn"
            title="Add new column (Alt+C)"
            :disabled="tableData[0].length >= MAX_COLUMNS"
          >
            <i class="fas fa-plus"></i> Add Column
          </button>
        </div>
      </template>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";

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
const moduleRef = ref<HTMLElement | null>(null);

// Constants for table limits
const MAX_ROWS = 200;
const MAX_COLUMNS = 50;

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

const setInputRef = (el: HTMLElement) => {
  baseModuleRef.value?.setInputRef(el);
};

// Update content in parent component
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Table-specific computed properties
const tableIsEmpty = computed(() => {
  return (
    tableData.value.length <= 1 &&
    (tableData.value.length === 0 || tableData.value[0]?.length === 0)
  );
});

const tableData = computed(() => {
  // Parse the markdown table into a 2D array
  const result = props.module.content
    .map((line) => {
      // Skip separator line (the one with dashes)
      if (line.includes("---")) return [];

      // Split the line by pipe and remove empty elements from start/end
      const cells = line.split("|").filter((cell) => cell.trim() !== "");
      return cells.map((cell) => cell.trim());
    })
    .filter((row) => row.length > 0);

  // Return at least an empty structure
  return result.length > 0 ? result : [[]];
});

// Table-specific methods
const updateTableData = () => {
  // Handle empty table case
  if (tableData.value.length === 0 || tableData.value[0].length === 0) {
    // Create a default minimal table with one empty cell
    emit("update:content", ["| Header |", "|--------|", "| |"]);
    return;
  }

  // Get headers and ensure they're not empty
  const headers = tableData.value[0].map((header) => header.trim() || "Header");
  const data = tableData.value.slice(1);

  // Create header row with consistent spacing
  const headerRow = "| " + headers.join(" | ") + " |";

  // Create separator row with proper alignment
  const separatorRow = "|" + headers.map(() => "--------|").join("");

  // Create data rows with proper padding
  const dataRows = data.map((row) => {
    // Ensure each row has the correct number of cells
    const paddedRow = [...row];
    while (paddedRow.length < headers.length) {
      paddedRow.push("");
    }
    // Trim cells and handle empty ones
    const formattedRow = paddedRow.map((cell) => cell.trim());
    return "| " + formattedRow.join(" | ") + " |";
  });

  // Combine all rows
  const newContent = [headerRow, separatorRow, ...dataRows];
  emit("update:content", newContent);
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
  // Check row limit
  if (tableData.value.length >= MAX_ROWS) {
    baseModuleRef.value?.displayToast(`Maximum of ${MAX_ROWS} rows reached`, "error");
    return;
  }

  const columnCount = tableData.value[0]?.length || 3;
  const newRow = Array(columnCount).fill("");

  // Add the row to our data structure
  const newTableData = [...tableData.value, newRow];

  // Convert back to markdown and update
  const headers = newTableData[0] || [];
  const data = newTableData.slice(1);

  const headerRow = "| " + headers.join(" | ") + " |";
  const separatorRow = "|" + headers.map(() => "--------|").join("");
  const dataRows = data.map((row) => "| " + row.join(" | ") + " |");

  emit("update:content", [headerRow, separatorRow, ...dataRows]);
  baseModuleRef.value?.displayToast("Row added", "success");

  // Focus the new row on next tick
  nextTick(() => {
    const inputs = baseModuleRef.value?.$el.querySelectorAll(
      ".template-module-editor-table-input"
    );
    if (inputs && inputs.length > 0) {
      // Focus the first cell of the new row
      const index = (data.length - 1) * headers.length;
      if (inputs[index]) {
        (inputs[index] as HTMLElement).focus();
      }
    }
  });
};

const addTableColumn = () => {
  // Check column limit
  if (tableData.value[0]?.length >= MAX_COLUMNS) {
    baseModuleRef.value?.displayToast(`Maximum of ${MAX_COLUMNS} columns reached`, "error");
    return;
  }

  const newTableData = tableData.value.map((row) => [...row, ""]);

  // Convert back to markdown and update
  const headers = newTableData[0] || [];
  const data = newTableData.slice(1);

  const headerRow = "| " + headers.join(" | ") + " |";
  const separatorRow = "|" + headers.map(() => "--------|").join("");
  const dataRows = data.map((row) => "| " + row.join(" | ") + " |");

  emit("update:content", [headerRow, separatorRow, ...dataRows]);
  baseModuleRef.value?.displayToast("Column added", "success");

  // Focus the new column header on next tick
  nextTick(() => {
    const inputs = baseModuleRef.value?.$el.querySelectorAll(
      ".template-module-editor-table-header-input"
    );
    if (inputs && inputs.length > 0) {
      // Focus the header of the new column
      const index = headers.length - 1;
      if (inputs[index]) {
        (inputs[index] as HTMLElement).focus();
      }
    }
  });
};

const deleteTableColumn = (colIndex: number) => {
  // Ensure we have more than one column
  if (tableData.value[0].length <= 1) {
    baseModuleRef.value?.displayToast("Cannot delete the last column", "error");
    return;
  }

  // Remove the column from each row
  const newTableData = tableData.value.map((row) => {
    const newRow = [...row];
    newRow.splice(colIndex, 1);
    return newRow;
  });

  // Update the table data
  // We need to manually update this since tableData is a computed property
  for (let i = 0; i < newTableData.length; i++) {
    if (tableData.value[i]) {
      tableData.value[i] = newTableData[i].slice();
    }
  }

  // Update the markdown
  updateTableData();
  baseModuleRef.value?.displayToast("Column deleted", "info");
};

const deleteTableRow = (rowIndex: number) => {
  // Make sure we don't delete the header row
  if (rowIndex === 0) return;

  // Ensure we have more than one data row
  if (tableData.value.length <= 2) {
    baseModuleRef.value?.displayToast("Cannot delete the last data row", "error");
    return;
  }

  const newTableData = [...tableData.value];
  newTableData.splice(rowIndex, 1);

  // Convert back to markdown and update
  const headers = newTableData[0] || [];
  const data = newTableData.slice(1);

  const headerRow = "| " + headers.join(" | ") + " |";
  const separatorRow = "|" + headers.map(() => "--------|").join("");
  const dataRows = data.map((row) => "| " + row.join(" | ") + " |");

  emit("update:content", [headerRow, separatorRow, ...dataRows]);
  baseModuleRef.value?.displayToast("Row deleted", "info");
};

// Method to initialize an empty table
const initializeEmptyTable = () => {
  // Create a basic 3x3 table
  const headers = ["Header 1", "Header 2", "Header 3"];
  const rows = [
    ["Cell 1", "Cell 2", "Cell 3"],
    ["Cell 4", "Cell 5", "Cell 6"],
  ];

  const headerRow = "| " + headers.join(" | ") + " |";
  const separatorRow = "|" + headers.map(() => "--------|").join("");
  const dataRows = rows.map((row) => "| " + row.join(" | ") + " |");

  emit("update:content", [headerRow, separatorRow, ...dataRows]);
  baseModuleRef.value?.displayToast("Table created", "success");
};

// Handle keyboard events if needed
const handleTableKeyboardNavigation = (
  event: KeyboardEvent,
  rowIndex: number,
  colIndex: number
) => {
  // Keyboard navigation was removed to simplify the code
};

// Helper method to focus a specific cell
const focusCell = (rowIndex: number, colIndex: number) => {
  // Simplified focus cell functionality
  nextTick(() => {
    const element = baseModuleRef.value?.$el;
    if (!element) return;
    
    // For header row
    if (rowIndex === 0) {
      const headerInputs = element.querySelectorAll(
        ".template-module-editor-table-header-input"
      );
      if (headerInputs && headerInputs[colIndex]) {
        (headerInputs[colIndex] as HTMLElement).focus();
      }
    } else {
      // For data cells - simplified approach
      const cells = element.querySelectorAll(
        ".template-module-editor-table-input"
      );
      // Find the right cell if possible
      if (cells && cells.length > 0) {
        const rowOffset = rowIndex - 1;
        const columnCount = tableData.value[0]?.length || 0;
        const cellIndex = rowOffset * columnCount + colIndex;
        
        if (cells[cellIndex]) {
          (cells[cellIndex] as HTMLElement).focus();
        }
      }
    }
  });
};
</script>

<style scoped>
/* Table specific styles */
.template-module-editor-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-md);
}

/* Table header row styling */
.template-module-editor-table-header {
  display: flex;
  margin-bottom: var(--spacing-xs);
  position: relative;
}

.template-module-editor-table-header-cell {
  flex: 1;
  padding: 0 var(--spacing-xs);
  position: relative;
}

.template-module-editor-table-cell-container {
  position: relative;
}

.template-module-editor-column-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
}

.template-module-editor-table-header-cell:hover
  .template-module-editor-column-delete {
  opacity: 0.7;
}

.template-module-editor-column-delete:hover {
  opacity: 1 !important;
  background: rgba(239, 68, 68, 0.2);
}

/* Header cell styling */
.template-module-editor-table-header-input {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-module-editor-table-header-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

/* Table rows and cells */
.template-module-editor-table-row {
  display: flex;
  margin-bottom: var(--spacing-xs);
}

.template-module-editor-table-cell {
  flex: 1;
  padding: 0 var(--spacing-xs);
}

.template-module-editor-table-input {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-module-editor-table-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-module-editor-table-actions {
  display: flex;
  align-items: center;
  padding-left: var(--spacing-xs);
}

.template-module-editor-line-action {
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

.template-module-editor-line-action:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  opacity: 1;
}

.template-module-editor-table-controls {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.template-module-editor-table-button {
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

.template-module-editor-table-button:hover {
  background-color: rgba(255, 171, 88, 0.15);
}

.template-module-editor-table-button i {
  font-size: 0.75rem;
}

.template-module-editor-table-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(255, 171, 88, 0.03);
}

.template-module-editor-table-button:disabled:hover {
  background-color: rgba(255, 171, 88, 0.03);
  transform: none;
}

/* Empty table state */
.template-module-editor-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-surface);
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.02);
}

.template-module-editor-table-empty i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.template-module-editor-table-empty p {
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

.template-module-editor-empty-table-button {
  padding: var(--spacing-xs) var(--spacing-md);
}
</style>
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
    <div class="table-builder">
      <!-- Table Grid -->
      <div class="table-grid" ref="tableGrid">
        <!-- Headers Row -->
        <div class="headers-row">
          <div
            v-for="(header, colIndex) in table.headers"
            :key="`header-${colIndex}`"
            class="header-cell"
          >
            <input
              type="text"
              v-model="table.headers[colIndex]"
              @input="updateMarkdown"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              placeholder="Header"
              :ref="
                (el) => {
                  if (colIndex === 0 && autoFocus) setFocusRef(el);
                }
              "
            />
          </div>
        </div>

        <!-- Table Body -->
        <div class="table-body">
          <div
            v-for="(row, rowIndex) in table.rows"
            :key="`row-${rowIndex}`"
            class="table-row"
          >
            <div
              v-for="(cell, colIndex) in row"
              :key="`cell-${rowIndex}-${colIndex}`"
              class="table-cell"
            >
              <input
                type="text"
                v-model="table.rows[rowIndex][colIndex]"
                @input="updateMarkdown"
                @focus="setEditing(true)"
                @blur="setEditing(false)"
                placeholder="Cell data"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="table-controls">
        <div class="column-controls">
          <button
            v-for="(_, colIndex) in table.headers"
            :key="`col-control-${colIndex}`"
            class="column-control"
            :class="{ 'can-remove': table.headers.length > 2 }"
            @click="removeColumn(colIndex)"
            :disabled="table.headers.length <= 2"
          >
            <i class="fas fa-minus"></i>
          </button>

          <button class="add-column" @click="addColumn">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <div class="row-controls">
          <button
            v-for="(_, rowIndex) in table.rows"
            :key="`row-control-${rowIndex}`"
            class="row-control"
            :class="{ 'can-remove': table.rows.length > 1 }"
            @click="removeRow(rowIndex)"
            :disabled="table.rows.length <= 1"
          >
            <i class="fas fa-minus"></i>
          </button>

          <button class="add-row" @click="addRow">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
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

// Refs
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const tableGrid = ref<HTMLElement | null>(null);

// Table data structure
const table = reactive({
  headers: ["Column 1", "Column 2", "Column 3"],
  rows: [
    ["", "", ""],
    ["", "", ""],
  ],
});

// Handle focus states
const setEditing = (editing: boolean) => {
  if (baseModuleRef.value) {
    baseModuleRef.value.setEditing(editing);
  }
};

const setFocusRef = (el: HTMLInputElement | null) => {
  if (baseModuleRef.value && el) {
    baseModuleRef.value.setInputRef(el);
  }
};

// Generate markdown table
const generateMarkdown = () => {
  // Create header row
  const headerRow = `| ${table.headers.join(" | ")} |`;

  // Create separator row (alignment can be added later if needed)
  const separatorRow = `| ${table.headers.map(() => "---").join(" | ")} |`;

  // Create content rows
  const contentRows = table.rows.map((row) => {
    return `| ${row.join(" | ")} |`;
  });

  // Combine everything
  return [headerRow, separatorRow, ...contentRows];
};

// Update markdown output
const updateMarkdown = () => {
  const markdown = generateMarkdown();
  emit("update:content", markdown);
};

// Column operations
const addColumn = () => {
  // Add new header
  table.headers.push(`Column ${table.headers.length + 1}`);

  // Add empty cell to each row
  table.rows.forEach((row) => row.push(""));

  // Update markdown
  updateMarkdown();
};

const removeColumn = (colIndex: number) => {
  // Guard - keep at least 2 columns
  if (table.headers.length <= 2) {
    return;
  }

  // Remove header
  table.headers.splice(colIndex, 1);

  // Remove corresponding cell from each row
  table.rows.forEach((row) => row.splice(colIndex, 1));

  // Update markdown
  updateMarkdown();
};

// Row operations
const addRow = () => {
  // Add new row with empty cells matching the header count
  const newRow = Array(table.headers.length).fill("");
  table.rows.push(newRow);

  // Update markdown
  updateMarkdown();
};

const removeRow = (rowIndex: number) => {
  // Guard - keep at least 1 row
  if (table.rows.length <= 1) {
    return;
  }

  // Remove row
  table.rows.splice(rowIndex, 1);

  // Update markdown
  updateMarkdown();
};

// Parse markdown table
const parseMarkdownTable = (content: string[]) => {
  if (!content || content.length < 3) {
    // Not enough content for a valid table
    return false;
  }

  // Look for table structure (lines starting with |)
  const tableLines = content.filter((line) => line.trim().startsWith("|"));
  if (tableLines.length < 3) {
    // Need at least header, separator, and one data row
    return false;
  }

  try {
    // Parse header row
    const headerLine = tableLines[0];
    const headers = headerLine
      .split("|")
      .filter((cell) => cell.trim() !== "") // Remove empty cells from split
      .map((cell) => cell.trim());

    if (headers.length < 1) {
      return false;
    }

    // Skip separator row (index 1)

    // Parse data rows (everything after separator)
    const dataRows = tableLines.slice(2).map((row) => {
      return row
        .split("|")
        .filter((cell) => cell.trim() !== "") // Remove empty cells from split
        .map((cell) => cell.trim());
    });

    // Ensure all rows have the same number of columns as headers
    // If some are shorter, pad with empty strings
    dataRows.forEach((row) => {
      while (row.length < headers.length) {
        row.push("");
      }
      // Trim extra cells if row is longer than headers
      if (row.length > headers.length) {
        row.length = headers.length;
      }
    });

    // Update our table data
    table.headers = headers;
    table.rows =
      dataRows.length > 0 ? dataRows : [Array(headers.length).fill("")];

    return true;
  } catch (error) {
    console.error("Error parsing markdown table:", error);
    return false;
  }
};

// Update content handler
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Watch for content changes
watch(
  () => props.module.content,
  (newContent) => {
    // Only parse if content looks like a table
    if (newContent && newContent.length > 0 && newContent[0].includes("|")) {
      parseMarkdownTable(newContent);
    }
  },
  { immediate: true }
);

// Initialize on mounted
onMounted(() => {
  if (
    props.module.content &&
    props.module.content.length > 0 &&
    props.module.content[0].includes("|")
  ) {
    const parsed = parseMarkdownTable(props.module.content);
    if (!parsed) {
      // If parsing failed, initialize with defaults and update
      updateMarkdown();
    }
  } else {
    // No existing content, initialize with defaults
    updateMarkdown();
  }
});

// This script runs once during component definition
// to dynamically set the grid-template-columns based on headers

// Watch for changes in the headers array
watch(
  () => table.headers.length,
  (columnsCount) => {
    // Update the CSS grid template columns
    const grid = tableGrid.value;
    if (grid) {
      // Update for headers row
      const headerRow = grid.querySelector(".headers-row");
      if (headerRow) {
        headerRow.style.gridTemplateColumns = `repeat(${columnsCount}, 1fr)`;
      }

      // Update for all data rows
      const tableRows = grid.querySelectorAll(".table-row");
      tableRows.forEach((row) => {
        row.style.gridTemplateColumns = `repeat(${columnsCount}, 1fr)`;
      });
    }
  }
);
</script>

<style scoped>
.table-builder {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  position: relative;
}

/* Table grid styling */
.table-grid {
  display: grid;
  gap: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

/* Headers row styling */
.headers-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  background-color: rgba(255, 255, 255, 0.08);
}

.header-cell {
  padding: 2px;
  background-color: var(--bg-color, rgba(20, 20, 30, 1));
}

.header-cell input {
  width: 100%;
  padding: 8px 10px;
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
}

.header-cell input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.3);
}

/* Table body styling */
.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
}

.table-cell {
  padding: 2px;
  background-color: var(--bg-color, rgba(20, 20, 30, 1));
}

.table-cell input {
  width: 100%;
  padding: 8px 10px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-size: 14px;
}

.table-cell input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}

/* Controls styling */
.table-controls {
  display: flex;
  gap: 8px;
}

.column-controls {
  display: flex;
  gap: 4px;
  flex: 1;
}

.column-control {
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.column-control.can-remove {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
}

.column-control.can-remove:hover {
  color: rgba(239, 68, 68, 0.8);
}

.add-column {
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 4px;
  color: var(--color-primary);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-column:hover {
  background-color: rgba(var(--color-primary-rgb), 0.15);
  transform: scale(1.05);
}

.row-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: stretch;
}

.row-control {
  width: 24px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.row-control.can-remove {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
}

.row-control.can-remove:hover {
  color: rgba(239, 68, 68, 0.8);
}

.add-row {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 4px;
  color: var(--color-primary);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-row:hover {
  background-color: rgba(var(--color-primary-rgb), 0.15);
  transform: scale(1.05);
}

/* Apply grid template columns dynamically */
.headers-row,
.table-row {
  grid-template-columns: repeat(3, 1fr);
}

/* Responsive styles */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
  }

  .row-controls {
    flex-direction: row;
  }
}
</style>

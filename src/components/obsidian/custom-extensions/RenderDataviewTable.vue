<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview Table</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <!-- TABLE view -->
      <div class="query-output table-result">
        <table v-if="queryResults.length > 0">
          <thead>
            <tr>
              <th v-for="column in tableColumns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIdx) in queryResults" :key="rowIdx">
              <td v-for="column in tableColumns" :key="column">
                {{ getTableCellValue(row, column) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty state -->
        <div v-if="queryResults.length === 0 && !isLoading" class="empty-state">
          No results found
        </div>
      </div>

      <node-view-content as="pre" class="content-container" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/vue-3";
import { obsidianApiService } from "@/services/obsidian";
import { debounce } from "lodash-es";

// Props for the node view
const props = defineProps<NodeViewProps>();

// State
const queryResults = ref<any[]>([]);
const isLoading = ref(false);
const lastExecutedQuery = ref("");
const error = ref("");

// Extract query from node content
const query = computed(() => {
  return props.node.textContent.trim();
});

// Determine query type
const queryType = computed(() => {
  const queryText = query.value.toUpperCase();
  if (queryText.startsWith("TABLE")) return "table";
  return "unknown";
});

// Extract table columns from query
const tableColumns = computed(() => {
  // Try to extract columns from a TABLE query
  const columnsMatch = query.value.match(
    /TABLE\s+(.+?)(?:FROM|WHERE|SORT|LIMIT|GROUP BY|$)/i
  );
  if (columnsMatch && columnsMatch[1]) {
    const columnsText = columnsMatch[1];

    // Parse out column names including aliases
    const columnRegex = /([^,]+(?:\s+AS\s+["']?([^,"']+)["']?)?)/gi;
    const columns = [];
    let match;

    while ((match = columnRegex.exec(columnsText)) !== null) {
      // Use alias if provided, otherwise use field name
      const fullColumn = match[1].trim();
      const aliasMatch = fullColumn.match(/\s+AS\s+["']?([^,"']+)["']?/i);

      if (aliasMatch) {
        columns.push(aliasMatch[1]);
      } else {
        // Use the last part of the field path as column name
        const fieldParts = fullColumn.split(".");
        columns.push(fieldParts[fieldParts.length - 1]);
      }
    }

    return columns.length > 0 ? columns : ["File"];
  }

  // If we can't extract columns from the query, check the results
  if (queryResults.value.length > 0) {
    return Object.keys(queryResults.value[0]);
  }

  // Default columns
  return ["File"];
});

// Extract query parts for API call
const queryParts = computed(() => {
  const fromMatch = query.value.match(
    /FROM\s+(["']?[^"'\s]+["']?|\[[^\]]+\])/i
  );
  const fromClause = fromMatch ? fromMatch[1] : '""';

  const whereMatch = query.value.match(/WHERE\s+([^SORT|^LIMIT|^GROUP]+)/i);
  const whereClause = whereMatch ? whereMatch[1].trim() : "";

  const sortMatch = query.value.match(/SORT\s+([^LIMIT|^WHERE|^GROUP]+)/i);
  const sortClause = sortMatch ? sortMatch[1].trim() : "";

  const limitMatch = query.value.match(/LIMIT\s+(\d+)/i);
  const limitClause = limitMatch ? parseInt(limitMatch[1]) : null;

  return { fromClause, whereClause, sortClause, limitClause };
});

// Execute the dataview query against the user's vault
const executeQuery = async () => {
  const currentQuery = query.value;

  // Skip if query is empty or unchanged
  if (!currentQuery || currentQuery === lastExecutedQuery.value) {
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";
    lastExecutedQuery.value = currentQuery;

    // For TABLE queries, we can use the query directly
    const results = await obsidianApiService.searchWithDataview(currentQuery);

    // Store the results
    queryResults.value = Array.isArray(results) ? results : [];
  } catch (err: any) {
    console.error("Error executing dataview query:", err);
    queryResults.value = [];

    // Handle specific errors
    if (err.code === "CONNECTION_ERROR") {
      error.value = "Cannot connect to Obsidian. Is it running?";
    } else if (err.code === "AUTH_ERROR") {
      error.value = "Authentication error connecting to Obsidian";
    } else {
      error.value = err.message || "Error executing query";
    }

    // Fall back to mock data
    provideMockData();
  } finally {
    isLoading.value = false;
  }
};

// Provide mock data when API call fails
const provideMockData = () => {
  // Generate mock table data based on the columns
  const mockTableData = [];
  for (let i = 1; i <= 3; i++) {
    const row: Record<string, string> = {};
    tableColumns.value.forEach((col) => {
      if (col.toLowerCase() === "file") {
        row[col] = `Sample File ${i}.md`;
      } else if (
        col.toLowerCase().includes("date") ||
        col.toLowerCase().includes("time")
      ) {
        row[col] = new Date(Date.now() - i * 86400000).toLocaleDateString();
      } else {
        row[col] = `${col} ${i}`;
      }
    });
    mockTableData.push(row);
  }
  queryResults.value = mockTableData;
};

// Create debounced version of executeQuery to avoid excessive API calls
const debouncedExecuteQuery = debounce(executeQuery, 500);

// Format cell values for display
const getTableCellValue = (row: any, column: string): string => {
  if (!row) return "";

  // Handle nested properties (e.g., file.ctime)
  if (column.includes(".") && typeof row === "object") {
    const parts = column.split(".");
    let value = row;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return "";
      }
    }

    return formatCellValue(value);
  }

  // Direct property access
  const value = row[column];
  return formatCellValue(value);
};

// Helper function to format cell values
const formatCellValue = (value: any): string => {
  if (value === undefined || value === null) {
    return "";
  }

  // Format date values
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  // Format arrays
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  // Handle objects
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  // Convert to string
  return String(value);
};

// Execute query when component mounts or query changes
onMounted(() => {
  debouncedExecuteQuery();
});

watch(
  () => query.value,
  () => {
    debouncedExecuteQuery();
  }
);
</script>

<style scoped>
.dataview-wrapper {
  display: block;
  margin: 1rem 0;
}

.content-container {
  display: none; /* Hide the actual content, but keep it in the DOM for TipTap */
}

.dataview-preview {
  background-color: transparent;
  padding: 0;
  margin: 0.5rem 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.dataview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #e53935;
  font-size: 0.9em;
  margin-left: 8px;
}

.query-output {
  padding: 8px 0;
  overflow-x: auto; /* Allow horizontal scrolling for wide tables */
}

.empty-state {
  color: #888;
  font-style: italic;
  padding: 8px 0;
}

/* Table styling */
.table-result table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  font-size: 0.9em;
}

.table-result th {
  background: rgba(0, 0, 0, 0.03);
  font-weight: 600;
  text-align: left;
  padding: 6px 8px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.table-result td {
  padding: 4px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: top;
}

.table-result tr:hover td {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Dark mode support */
:global(.dark-theme) .dataview-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-theme) .empty-state {
  color: #aaa;
}

:global(.dark-theme) .error-message {
  color: #ff6b6b;
}

:global(.dark-theme) .table-result th {
  background: rgba(255, 255, 255, 0.05);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-theme) .table-result td {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

:global(.dark-theme) .table-result tr:hover td {
  background-color: rgba(255, 255, 255, 0.03);
}
</style>

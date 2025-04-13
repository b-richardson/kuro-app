<!-- RenderDataviewTable.vue -->
<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview Table</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <div class="query-output table-result" :class="{ loading: isLoading }">
        <!-- Dataview table -->
        <table v-if="queryResults.length > 0">
          <thead>
            <tr>
              <th v-for="column in tableColumns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIdx) in queryResults" :key="rowIdx">
              <td
                v-for="column in tableColumns"
                :key="column"
                v-html="formatCell(getTableCellValue(row, column))"
              ></td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          {{ isLoading ? "Loading results..." : "No results found" }}
        </div>
      </div>

      <node-view-content as="pre" class="content-container" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/vue-3";
import { debounce } from "lodash-es";
// Import the DataviewQueryService instead of the direct API
import { dataviewQueryService } from "@/services/obsidian/dataviewQueryService";

// Debug logging for the component lifecycle
console.log("[DataviewTable] Component initializing");

const props = defineProps<NodeViewProps>();

// Log the initial node content
console.log("[DataviewTable] Initial node content:", props.node?.textContent);

const queryResults = ref<any[]>([]);
const isLoading = ref(false);
const error = ref("");

// Log whenever the node content changes directly
const nodeContentChanged = () => {
  console.log(
    "[DataviewTable] Node content changed to:",
    props.node?.textContent
  );
};

const query = computed(() => {
  const content = props.node?.textContent?.trim() || "";
  console.log("[DataviewTable] Current query computed:", content);
  return content;
});

const queryType = computed(() => {
  const upper = query.value.toUpperCase();
  if (upper.startsWith("TABLE")) return "dataview";
  if (query.value.includes("dv.table(")) return "dataviewjs";
  return "unknown";
});

// Parse column information from the query
const parsedColumns = computed(() => {
  if (queryType.value !== "dataview") return [];

  // Better regex to match the TABLE clause
  const tableRegex =
    /TABLE\s+(.*?)(?:\s+FROM|\s+WHERE|\s+SORT|\s+LIMIT|\s+GROUP BY|$)/is;
  const tableMatch = query.value.match(tableRegex);

  if (!tableMatch) return [];

  const columnText = tableMatch[1].trim();

  // Split by commas, but be careful about commas inside quotes
  const columnParts = columnText.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

  // Extract each column and its alias
  return columnParts.map((part) => {
    const asMatch = part.trim().match(/(.*?)\s+AS\s+["']([^"']+)["']/i);
    if (asMatch) {
      return {
        name: asMatch[1].trim(),
        alias: asMatch[2].trim(),
      };
    } else {
      const nameParts = part.trim().split(".");
      return {
        name: part.trim(),
        alias: nameParts[nameParts.length - 1],
      };
    }
  });
});

const tableColumns = computed(() => {
  console.log("[DataviewTable] Computing table columns");

  // For DataviewJS, use the headers from the parsed JS
  if (queryType.value === "dataviewjs") {
    return []; // Handle dataviewjs case as needed
  }

  // For Dataview queries, use our parsed columns
  if (queryType.value === "dataview" && parsedColumns.value.length > 0) {
    // Extract just the aliases for column headers
    const columns = parsedColumns.value.map((col) => col.alias);
    console.log("[DataviewTable] Using parsed columns:", columns);
    return columns;
  }

  // If we have query results but no parsed columns, extract from results
  if (queryResults.value.length > 0) {
    // Extract column keys from the first row
    const columns = Object.keys(queryResults.value[0]);
    console.log("[DataviewTable] Using columns from results:", columns);
    return columns;
  }

  // Default fallback
  console.log("[DataviewTable] Using default columns");
  return ["File"];
});

// Extract query parameters for dataviewQueryService
const extractQueryParams = () => {
  console.log("[DataviewTable] Extracting query parameters");

  // Default values
  let directory = "";
  let filter = undefined;
  let sortBy = undefined;
  let sortDirection: "asc" | "desc" = "asc";
  let columns = parsedColumns.value.map((col) => col.name);
  let limit = undefined;

  // Extract FROM clause
  const fromMatch = query.value.match(
    /FROM\s+(["']?[^"'\s]+["']?|\[[^\]]+\])/i
  );
  if (fromMatch) {
    const fromValue = fromMatch[1].trim().replace(/^["']|["']$/g, "");
    if (fromValue.startsWith("#")) {
      // It's a tag filter
      filter = fromValue;
    } else {
      // It's a directory
      directory = fromValue;
    }
  }

  // Extract SORT clause
  const sortMatch = query.value.match(/SORT\s+([^\s]+)(?:\s+(ASC|DESC))?/i);
  if (sortMatch) {
    sortBy = sortMatch[1].trim();
    if (sortMatch[2] && sortMatch[2].toUpperCase() === "DESC") {
      sortDirection = "desc";
    }
  }

  // Extract LIMIT clause
  const limitMatch = query.value.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    limit = parseInt(limitMatch[1], 10);
    console.log(`[DataviewTable] Found LIMIT in query: ${limit}`);
  }

  const result = { directory, filter, sortBy, sortDirection, columns, limit };
  console.log("[DataviewTable] Extracted params:", result);
  return result;
};

const executeQuery = async () => {
  const currentQuery = query.value;
  console.log("[DataviewTable] executeQuery called with query:", currentQuery);

  if (!currentQuery) {
    console.log("[DataviewTable] Query is empty, not executing");
    return;
  }

  try {
    console.log("[DataviewTable] Starting query execution");
    isLoading.value = true;
    error.value = "";

    // For TABLE queries, use the DataviewQueryService
    if (queryType.value === "dataview") {
      const params = extractQueryParams();
      console.log(
        "[DataviewTable] Calling dataviewQueryService.tableQuery with params:",
        JSON.stringify(params, null, 2)
      );

      // Use the tableQuery method to handle the query properly
      const results = await dataviewQueryService.tableQuery(
        params.directory,
        params.columns,
        params.filter,
        params.sortBy,
        params.sortDirection,
        params.limit
      );

      console.log(
        "[DataviewTable] Query returned results:",
        results ? results.length : 0
      );
      queryResults.value = results;
    } else if (queryType.value === "dataviewjs") {
      console.log("[DataviewTable] DataviewJS queries not directly supported");
      error.value =
        "DataviewJS queries are not directly supported in the preview";
      queryResults.value = [];
    } else {
      console.log("[DataviewTable] Unknown query type");
      error.value = "Unknown query type";
      queryResults.value = [];
    }

    // Log the columns after we get results to debug column issues
    console.log("[DataviewTable] Table columns:", tableColumns.value);
  } catch (err: any) {
    console.error("[DataviewTable] Error executing dataview query:", err);
    queryResults.value = [];
    error.value = err.message || "Error executing query";
  } finally {
    isLoading.value = false;
    console.log("[DataviewTable] Query execution completed");
  }
};

const getTableCellValue = (row: any, column: string): any => {
  if (!row) {
    console.log(
      "[DataviewTable] getTableCellValue called with empty row for column:",
      column
    );
    return "";
  }

  // Handle special case for file column that might have different formats
  if (column === "File" && row.file) {
    return row.file.name || row.file.path || "";
  }

  // Check if the column exists in the row directly
  if (column in row) {
    return row[column];
  }

  // Try to access nested properties
  if (column.includes(".")) {
    console.log("[DataviewTable] Accessing nested property:", column);
    const parts = column.split(".");
    let value = row;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value)
        value = value[part];
      else return "";
    }
    return value;
  }

  // Check if this is a formatted frontmatter property
  if (row.frontmatter && column in row.frontmatter) {
    return row.frontmatter[column];
  }

  // For debugging missing columns
  if (!(column in row)) {
    console.log(
      "[DataviewTable] Column not found in row:",
      column,
      "Available keys:",
      Object.keys(row)
    );
  }

  return row[column] !== undefined ? row[column] : "";
};

const formatCell = (value: any): string => {
  if (value === undefined || value === null) return "";

  // Handle dates
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  // Handle tags array
  if (Array.isArray(value)) {
    // Check if it looks like tags
    if (
      value.some(
        (item) =>
          typeof item === "string" &&
          (item.startsWith("#") || item.startsWith("tag:"))
      )
    ) {
      return value
        .map((tag) => {
          const cleanTag = tag.replace(/^#/, "");
          return `<span class="tag-pill">#${cleanTag}</span>`;
        })
        .join(" ");
    }
    return value.join(", ");
  }

  // Handle tag-like strings
  if (typeof value === "string" && value.startsWith("#")) {
    return `<span class="tag-pill">${value}</span>`;
  }

  // Handle file links
  if (typeof value === "string" && value.endsWith(".md")) {
    return `<span class="file-link">${value}</span>`;
  }

  // Handle status values
  if (
    typeof value === "string" &&
    ["active", "done", "in-progress", "pending"].includes(value.toLowerCase())
  ) {
    return `<span class="status-value status-${value.toLowerCase()}">${value}</span>`;
  }

  // Default handling for other values
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

// Set up watchers
onMounted(() => {
  console.log("[DataviewTable] Component mounted, executing initial query");
  executeQuery();

  // Debug logs about available node properties
  console.log("[DataviewTable] Node props:", {
    hasAttributes: !!props.node?.attrs,
    hasExtension: !!props.extension,
    editorAvailable: !!props.editor,
  });
});

// Watch for query changes
watch(
  () => query.value,
  (newQuery, oldQuery) => {
    console.log("[DataviewTable] Query changed:", {
      from: oldQuery,
      to: newQuery,
      changed: newQuery !== oldQuery,
    });

    if (newQuery) {
      console.log("[DataviewTable] Executing query due to change");
      debouncedExecuteQuery();
    }
  }
);

// Also watch node content directly
watch(
  () => props.node?.textContent,
  (newContent, oldContent) => {
    console.log("[DataviewTable] Node textContent changed:", {
      from: oldContent,
      to: newContent,
      changed: newContent !== oldContent,
    });
    nodeContentChanged();
  }
);

// Watch node attributes for changes
watch(
  () => props.node?.attrs,
  () => {
    console.log("[DataviewTable] Node attributes changed");
    debouncedExecuteQuery();
  },
  { deep: true }
);

const debouncedExecuteQuery = debounce(() => {
  console.log("[DataviewTable] Debounced query execution triggered");
  executeQuery();
}, 300);
</script>

<style>
.dataview-wrapper {
  display: block;
  margin: 1rem 0;
  border-radius: 4px;
  overflow: hidden;
}

.content-container {
  display: none;
}

.dataview-preview {
  font-family: var(
    --font-interface,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif
  );
  font-size: 0.9em;
  color: var(--text-normal, #dcddde);
  background-color: var(--background-primary, #272727);
  border-radius: 4px;
}

.dataview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--background-modifier-border, #333);
  background-color: var(--background-secondary, #1e1e1e);
  color: var(--text-normal, #dcddde);
}

.error-message {
  color: #ff5252;
  font-size: 0.85em;
  font-weight: normal;
}

.query-output {
  overflow-x: auto;
  padding: 0.5rem 0.75rem;
  position: relative;
}

/* Loading indicator */
.query-output::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--text-accent, #a389f4) 0%,
    transparent 50%,
    var(--text-accent, #a389f4) 100%
  );
  background-size: 200% 100%;
  animation: loading-animation 1.5s infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.query-output.loading::before {
  opacity: 1;
}

@keyframes loading-animation {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* Table styling to match Obsidian native */
.table-result table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.9em;
  margin: 0.5rem 0;
}

.table-result thead {
  background-color: var(--background-secondary, #1e1e1e);
  position: sticky;
  top: 0;
  z-index: 1;
}

.table-result th {
  font-weight: 600;
  text-align: left;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--background-modifier-border, #333);
  color: var(--text-muted, #999);
  white-space: nowrap;
}

.table-result td {
  padding: 0.4rem 0.75rem;
  color: var(--text-normal, #dcddde);
  border-bottom: 1px solid var(--background-modifier-border, #333);
  white-space: nowrap;
}

.table-result tr:hover td {
  background-color: var(--background-modifier-hover, #303030);
}

/* Make the first column (file links) purple */
.table-result th:first-child,
.table-result td:first-child {
  color: var(--text-accent, #a389f4);
}

/* File links */
.file-link {
  color: var(--text-accent, #a389f4);
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

/* Tags styling */
.tag-pill {
  display: inline-block;
  background-color: rgba(123, 108, 217, 0.15);
  color: var(--text-accent, #a389f4);
  padding: 0.1rem 0.4rem;
  margin-right: 0.25rem;
  border-radius: 4px;
  font-size: 0.85em;
}

/* Status values */
.status-value {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.status-active {
  color: var(--text-normal, #dcddde);
}

.status-done {
  color: #7bac5a;
}

.status-in-progress {
  color: #d2ac4c;
}

.status-pending {
  color: #888;
}

.empty-state {
  font-style: italic;
  color: var(--text-muted, #888);
  padding: 1rem;
  text-align: center;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .table-result {
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>

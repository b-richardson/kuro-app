<!-- src/components/obsidian/custom-extensions/RenderDataviewTable.vue -->
<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview Table</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="isInitializingStore" class="loading-message">
          Loading vault data: {{ initProgress }}%
        </div>
      </div>

      <div
        class="query-output table-result"
        :class="{ loading: isLoading || isInitializingStore }"
      >
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
          {{
            isLoading || isInitializingStore
              ? "Loading results..."
              : "No results found"
          }}
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

// Import the query engine components
import { QueryParser } from "@/obsidian/engine/queryParser";
import { QueryEngine } from "@/obsidian/engine/queryEngine";

// Import the DataStoreManager
import { useDataStoreManager } from "@/stores/dataStoreManager";

// Debug logging for the component lifecycle
console.log("[DataviewTable] Component initializing");

const props = defineProps<NodeViewProps>();

// Log the initial node content
console.log("[DataviewTable] Initial node content:", props.node?.textContent);

// Create query engine instances
const queryParser = new QueryParser();
const queryEngine = new QueryEngine();

// Use the DataStoreManager instead of creating a new DataStore
const dataStoreManager = useDataStoreManager();
const isInitializingStore = computed(() => dataStoreManager.isLoading);
const initProgress = computed(() => dataStoreManager.initializationProgress);

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

const tableColumns = computed(() => {
  console.log("[DataviewTable] Computing table columns");

  // If query results exist, extract column names from first result
  if (queryResults.value.length > 0) {
    const columns = Object.keys(queryResults.value[0]);
    console.log("[DataviewTable] Using columns from results:", columns);
    return columns;
  }

  // Default fallback
  console.log("[DataviewTable] Using default columns");
  return ["File"];
});

const executeQuery = async () => {
  const currentQuery = query.value;
  console.log(
    "[RenderDataviewTable] executeQuery called with query:",
    currentQuery
  );

  if (!currentQuery) {
    console.log("[RenderDataviewTable] Query is empty, not executing");
    return;
  }

  try {
    console.log("[RenderDataviewTable] Starting query execution");
    isLoading.value = true;
    error.value = "";

    // Initialize data store if needed
    if (!dataStoreManager.isInitialized) {
      console.log("[RenderDataviewTable] Initializing data store...");
      await dataStoreManager.initializeDataStore();
    }

    // Check if initialization was successful
    if (!dataStoreManager.isDataStoreReady) {
      console.log(
        "[RenderDataviewTable] Data store initialization failed or is still in progress"
      );
      error.value = "Data store is not ready. Please try again.";
      return;
    }

    // Parse the query string to a structured QueryRequest
    const queryRequest = queryParser.parseQuery(currentQuery);
    console.log("[RenderDataviewTable] Parsed query request:", queryRequest);

    // Ensure we're dealing with a TABLE query
    if (queryRequest.queryType !== "TABLE") {
      queryRequest.queryType = "TABLE"; // Force it to be a TABLE query
    }

    // Execute the query using the QueryEngine and the data store from our manager
    // In RenderDataviewTable.vue - executeQuery function
    console.log(
      "[RenderDataviewTable] DataStore debug info:\n",
      dataStoreManager.dataStore.getStoreDebugInfo()
    );

    const result = await queryEngine.execute(
      queryRequest,
      dataStoreManager.dataStore as any
    );

    console.log(
      "[RenderDataviewTable] Query execution result type:",
      result.type
    );

    // Type-safe logging based on result type
    if (result.type === "TABLE") {
      console.log("[RenderDataviewTable] TABLE result details:", {
        headers: result.headers,
        dataCount: result.data.length,
        firstRow:
          result.data.length > 0 ? JSON.stringify(result.data[0]) : "No rows",
        allData:
          result.data.length > 0
            ? JSON.stringify(result.data)
            : "Empty data array",
      });
    } else if (result.type === "LIST") {
      console.log("[RenderDataviewTable] LIST result details:", {
        dataCount: result.data.length,
        paths: result.data,
      });
    } else if (result.type === "TASK") {
      console.log("[RenderDataviewTable] TASK result details:", {
        taskCount: result.data.length,
        firstTask:
          result.data.length > 0 ? JSON.stringify(result.data[0]) : "No tasks",
      });
    } else if (result.type === "CALENDAR") {
      console.log("[RenderDataviewTable] CALENDAR result details:", {
        dateCount: Object.keys(result.data).length,
        dates: Object.keys(result.data),
      });
    } else if (result.type === "ERROR") {
      console.log("[RenderDataviewTable] ERROR result details:", {
        message: result.message,
      });
    }

    // Handle the TABLE results
    if (result.type === "TABLE") {
      console.log("[RenderDataviewTable] Processing TABLE result");

      // Log the structure of the first row to help with debugging
      if (result.data.length > 0) {
        console.log(
          "[RenderDataviewTable] First row keys:",
          Object.keys(result.data[0])
        );
        console.log(
          "[RenderDataviewTable] First row values:",
          Object.values(result.data[0])
        );
      }

      // Examine if display headers are present
      if (queryRequest.displayHeaders) {
        console.log(
          "[RenderDataviewTable] Using display headers:",
          queryRequest.displayHeaders
        );
      } else {
        console.log(
          "[RenderDataviewTable] No display headers found in query request"
        );
      }

      // Transform the result to match the component's expected format
      if (
        queryRequest.displayHeaders &&
        queryRequest.displayHeaders.length > 0
      ) {
        // Use display headers to create a transformed result with better column names
        queryResults.value = result.data.map((row) => {
          const transformedRow: Record<string, any> = {};
          result.headers.forEach((header, index) => {
            const displayName =
              index < queryRequest.displayHeaders!.length
                ? queryRequest.displayHeaders![index]
                : header;
            transformedRow[displayName] = row[header];

            // Debug log to see what's being assigned
            console.log(
              `[RenderDataviewTable] Mapping header "${header}" to display name "${displayName}", value:`,
              row[header]
            );
          });
          return transformedRow;
        });

        console.log(
          "[RenderDataviewTable] Transformed results with display headers:",
          queryResults.value
        );
      } else {
        // No display headers, use the data as-is
        queryResults.value = result.data;
        console.log(
          "[RenderDataviewTable] Using raw results:",
          queryResults.value
        );
      }

      // Log the final columns that will be used for rendering
      if (queryResults.value.length > 0) {
        console.log(
          "[RenderDataviewTable] Final columns for rendering:",
          Object.keys(queryResults.value[0])
        );
      } else {
        console.log("[RenderDataviewTable] No results to render");
      }
    } else if (result.type === "ERROR") {
      console.error(
        "[RenderDataviewTable] Query returned error:",
        result.message
      );
      error.value = result.message || "Error executing query";
      queryResults.value = [];
    } else {
      // We got a non-TABLE result - this shouldn't happen but handle it just in case
      console.warn(
        `[RenderDataviewTable] Unexpected result type: ${result.type}`
      );
      error.value = `Unexpected result type: ${result.type}`;
      queryResults.value = [];
    }
  } catch (err: any) {
    console.error("[RenderDataviewTable] Error executing dataview query:", err);
    console.error("[RenderDataviewTable] Error stack:", err.stack);
    queryResults.value = [];
    error.value = err.message || "Error executing query";
  } finally {
    isLoading.value = false;
    console.log("[RenderDataviewTable] Query execution completed");
    console.log(
      "[RenderDataviewTable] Final queryResults count:",
      queryResults.value.length
    );
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
  // Initialize the DataStore when the component mounts
  dataStoreManager.initializeDataStore().then(() => {
    // Execute the query once the data store is initialized
    executeQuery();
  });

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
  // Only execute if the data store is ready
  if (dataStoreManager.isDataStoreReady) {
    executeQuery();
  } else if (!dataStoreManager.isLoading) {
    // If it's not ready and not loading, try to initialize it first
    dataStoreManager.initializeDataStore().then(() => {
      executeQuery();
    });
  }
}, 300);
</script>

<style>
/* Add some styles for the loading indicator */
.loading-message {
  font-size: 0.85em;
  color: #666;
  margin-left: 10px;
}
</style>

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

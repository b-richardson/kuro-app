<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview Query</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <!-- LIST view -->
      <div class="query-output list-result">
        <div
          v-for="(item, index) in queryResults"
          :key="index"
          class="note-link"
        >
          • <span class="note-title">{{ getItemTitle(item) }}</span>
          <span v-if="getItemMetadata(item)" class="metadata">{{
            getItemMetadata(item)
          }}</span>
        </div>

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
  if (queryText.startsWith("LIST")) return "list";
  return "unknown";
});

// Extract FROM clause and other parts from the query
const queryParts = computed(() => {
  const fromMatch = query.value.match(
    /FROM\s+(["']?[^"'\s]+["']?|\[[^\]]+\])/i
  );
  const fromClause = fromMatch ? fromMatch[1] : '""';

  const whereMatch = query.value.match(/WHERE\s+([^SORT|^LIMIT|^GROUP]+)/i);
  const whereClause = whereMatch ? whereMatch[1].trim() : "";

  const sortMatch = query.value.match(
    /SORT\s+(.*?)(?:\s+LIMIT|\s+WHERE|\s+GROUP|$)/i
  );
  const sortClause = sortMatch ? sortMatch[1].trim() : "";

  const limitMatch = query.value.match(/LIMIT\s+(\d+)/i);
  const limitClause = limitMatch ? parseInt(limitMatch[1]) : null;

  return { fromClause, whereClause, sortClause, limitClause };
});

// Convert LIST query to equivalent TABLE query for API compatibility
const getApiCompatibleQuery = () => {
  // Extract query parts
  const { fromClause, whereClause, sortClause, limitClause } = queryParts.value;

  let tableQuery = `TABLE file.name AS "File", file.ctime AS "Created", file.mtime AS "Modified", file.size AS "Size", tags AS "Tags" `;

  // Add FROM clause
  tableQuery += `FROM ${fromClause} `;

  // Add WHERE clause if present
  if (whereClause) {
    tableQuery += `WHERE ${whereClause} `;
  }

  // Add SORT clause if present
  if (sortClause) {
    tableQuery += `SORT ${sortClause} `;
  }

  // Add LIMIT clause if present
  if (limitClause) {
    tableQuery += `LIMIT ${limitClause}`;
  }

  return tableQuery;
};

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

    // Convert to TABLE query for API compatibility
    const apiQuery = getApiCompatibleQuery();

    // Call the Obsidian API service
    const results = await obsidianApiService.searchWithDataview(apiQuery);

    // Transform results for LIST view
    if (Array.isArray(results)) {
      // Process each result to extract title and metadata
      queryResults.value = results.map((item) => {
        if (typeof item === "object" && item !== null) {
          // Use TypeScript safe property access
          const dataItem = item as Record<string, any>;
          if (dataItem.File) {
            return { title: dataItem.File, originalData: dataItem };
          }

          // Try to find a suitable title property
          for (const key of ["path", "file", "name", "title", "fileName"]) {
            if (dataItem[key]) {
              return { title: dataItem[key], originalData: dataItem };
            }
          }
        }
        console.log("Final query results:", queryResults.value);
        return item;
      });
    } else {
      queryResults.value = [];
    }
  } catch (err: any) {
    console.error("Error executing dataview query:", err);
    queryResults.value = [];

    // Handle specific errors
    if (err.message?.includes("Only TABLE dataview queries")) {
      error.value = "Error: Only TABLE queries are supported by the API";
    } else if (err.code === "CONNECTION_ERROR") {
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
  const { fromClause } = queryParts.value;
  const source = fromClause.replace(/['"]/g, "");

  queryResults.value = [
    { title: `${source}/Sample Note 1`, metadata: "Last modified 2023-09-15" },
    { title: `${source}/Sample Note 2`, metadata: "Last modified 2023-08-22" },
    { title: `${source}/Sample Note 3`, metadata: "Last modified 2023-07-10" },
  ];
};

// Create debounced version of executeQuery to avoid excessive API calls
const debouncedExecuteQuery = debounce(executeQuery, 500);

// Helper functions for formatting results
const getItemTitle = (item: any): string => {
  // Just return the filename directly
  return item?.filename || "Untitled";
};

const getItemMetadata = (item: any): string => {
  if (!item || !item.result) {
    return "";
  }

  // Extract the property names from the LIST line in the original query
  const listLine = query.value
    .split("\n")
    .find((line) => line.trim().startsWith("LIST"));
  if (!listLine || listLine === "LIST") {
    // If no specific properties were requested, show nothing
    return "";
  }

  // Get the requested properties
  const propString = listLine.replace("LIST", "").trim();
  if (!propString) return "";

  const requestedProps = propString.split(",").map((p) => p.trim());

  // Build metadata string only showing requested properties
  const metadata = [];
  const data = item.result;

  // Map from Dataview property names to API result keys
  const propertyMap: Record<string, string> = {
    "file.ctime": "Created",
    "file.mtime": "Modified",
    "file.size": "Size",
    tags: "Tags",
    // Add more mappings as needed
  };

  for (const prop of requestedProps) {
    // Look up the corresponding property in the API result
    const resultKey = propertyMap[prop] || prop;

    if (data[resultKey] !== undefined) {
      let value = data[resultKey];

      // Format arrays
      if (Array.isArray(value)) {
        value = value.join(", ");
      }

      metadata.push(`${prop}: ${value}`);
    }
  }

  return metadata.join(" | ");
};

// Execute query when component mounts or query changes
onMounted(() => {
  debouncedExecuteQuery();
});

watch(
  () => props.node.textContent,
  (newVal) => {
    console.log("Updated query:", newVal);
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
}

.empty-state {
  color: #888;
  font-style: italic;
  padding: 8px 0;
}

.note-link {
  padding: 0.15rem 0;
  line-height: 1.4;
}

.note-title {
  color: #106ba3; /* Obsidian link color in light mode */
  text-decoration: none;
  cursor: pointer;
}

.metadata {
  color: #666;
  margin-left: 8px;
  font-size: 0.9em;
}

/* Dark mode support */
:global(.dark-theme) .dataview-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-theme) .note-title {
  color: #56c8fa; /* Obsidian link color in dark mode */
}

:global(.dark-theme) .metadata {
  color: #aaa;
}

:global(.dark-theme) .empty-state {
  color: #aaa;
}

:global(.dark-theme) .error-message {
  color: #ff6b6b;
}
</style>

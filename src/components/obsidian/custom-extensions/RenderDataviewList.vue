<!-- src/components/obsidian/custom-extensions/RenderDataviewList.vue -->
<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview List</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="isInitializingStore" class="loading-message">
          Loading vault data: {{ initProgress }}%
        </div>
      </div>

      <!-- LIST view -->
      <div
        class="query-output list-result"
        :class="{ loading: isLoading || isInitializingStore }"
      >
        <ul v-if="queryResults.length > 0">
          <li
            v-for="(item, index) in queryResults"
            :key="index"
            class="note-link"
          >
            <span class="note-title">{{ getItemDisplayName(item) }}</span>
            <span v-if="hasDisplayableProperties(item)" class="note-properties">
              {{ formatProperties(item) }}
            </span>
          </li>
        </ul>

        <!-- Empty state -->
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
import { format } from "date-fns";

// Import the query engine components
import { QueryParser } from "@/obsidian/engine/queryParser";
import { QueryEngine } from "@/obsidian/engine/queryEngine";

// Import the DataStoreManager
import { useDataStoreManager } from "@/stores/dataStoreManager";

// Debug logging for the component lifecycle
console.log("[DataviewList] Component initializing");

const props = defineProps<NodeViewProps>();

// Log the initial node content
console.log("[DataviewList] Initial node content:", props.node?.textContent);

// Create query engine instances
const queryParser = new QueryParser();
const queryEngine = new QueryEngine();

// Use the DataStoreManager instead of creating a new DataStore
const dataStoreManager = useDataStoreManager();
const isInitializingStore = computed(() => dataStoreManager.isLoading);
const initProgress = computed(() => dataStoreManager.initializationProgress);

// Store both simple paths and detailed results
const queryResults = ref<any[]>([]);
const requestedProperties = ref<string[]>([]);
const isLoading = ref(false);
const error = ref("");

// Property mappings (matching the UI module)
const propertyMappings: Record<string, string> = {
  "file.name": "Title",
  "file.ctime": "Creation Date",
  "file.mtime": "Modified Date",
  "file.size": "Size",
  "file.path": "Path",
  "file.folder": "Folder",
  tags: "Tags",
};

// Log whenever the node content changes directly
const nodeContentChanged = () => {
  console.log(
    "[DataviewList] Node content changed to:",
    props.node?.textContent
  );
};

const query = computed(() => {
  const content = props.node?.textContent?.trim() || "";
  console.log("[DataviewList] Current query computed:", content);
  return content;
});

// Parse the LIST query to extract what properties to display
const parseRequestedProperties = (queryString: string): string[] => {
  // Extract properties from the LIST line
  const lines = queryString.split("\n");
  const listLine = lines.find((line) => line.trim().startsWith("LIST"));

  if (!listLine || listLine.trim() === "LIST") {
    return []; // No specific properties requested
  }

  // Get the properties after "LIST"
  const propsText = listLine.replace(/^LIST\s+/, "").trim();
  if (!propsText) return [];

  // Split by comma and clean up
  return propsText.split(",").map((p) => p.trim());
};

const executeQuery = async () => {
  const currentQuery = query.value;
  console.log(
    "[RenderDataviewList] executeQuery called with query:",
    currentQuery
  );

  if (!currentQuery) {
    console.log("[RenderDataviewList] Query is empty, not executing");
    return;
  }

  try {
    console.log("[RenderDataviewList] Starting query execution");
    isLoading.value = true;
    error.value = "";

    // Parse requested properties from the query
    requestedProperties.value = parseRequestedProperties(currentQuery);
    console.log(
      "[RenderDataviewList] Requested properties:",
      requestedProperties.value
    );

    // Initialize data store if needed
    if (!dataStoreManager.isInitialized) {
      console.log("[RenderDataviewList] Initializing data store...");
      await dataStoreManager.initializeDataStore();
    }

    // Check if initialization was successful
    if (!dataStoreManager.isDataStoreReady) {
      console.log(
        "[RenderDataviewList] Data store initialization failed or is still in progress"
      );
      error.value = "Data store is not ready. Please try again.";
      return;
    }

    // Parse the query string to a structured QueryRequest
    const queryRequest = queryParser.parseQuery(currentQuery);
    console.log("[RenderDataviewList] Parsed query request:", queryRequest);

    // Ensure we're dealing with a LIST query
    if (queryRequest.queryType !== "LIST") {
      queryRequest.queryType = "LIST"; // Force it to be a LIST query
    }

    // Execute the query using the QueryEngine and the data store from our manager
    console.log(
      "[RenderDataviewList] DataStore debug info:\n",
      dataStoreManager.dataStore.getStoreDebugInfo()
    );

    const result = await queryEngine.execute(
      queryRequest,
      dataStoreManager.dataStore as any
    );

    console.log(
      "[RenderDataviewList] Query execution result type:",
      result.type
    );

    // Handle the result based on type
    if (result.type === "LIST") {
      console.log("[RenderDataviewList] LIST result details:", {
        dataCount: result.data.length,
        firstItem: result.data.length > 0 ? result.data[0] : null,
      });

      // If result.data contains objects with the requested properties, use it directly
      if (result.data.length > 0 && typeof result.data[0] === "object") {
        queryResults.value = result.data;
      }
      // If it's just an array of strings, map them to objects with path property
      else if (result.data.length > 0 && typeof result.data[0] === "string") {
        queryResults.value = result.data.map((path) => {
          // Try to get the full note data from the data store
          const note = dataStoreManager.dataStore.getNote(path);
          if (note) {
            return {
              path,
              note: note.note, // The original note JSON
              parsed: note.parsed, // Any parsed data
              // Add additional properties for display convenience
              "file.name": path.split("/").pop() || path,
              "file.path": path,
              "file.mtime": note.note.stat?.mtime
                ? new Date(note.note.stat.mtime)
                : null,
              "file.ctime": note.note.stat?.ctime
                ? new Date(note.note.stat.ctime)
                : null,
              "file.size": note.note.stat?.size || 0,
              tags: note.note.tags || [],
            };
          } else {
            // Fallback for notes not in the data store
            return {
              path,
              "file.name": path.split("/").pop() || path,
            };
          }
        });
      }

      console.log("[RenderDataviewList] Final results:", queryResults.value);
    } else if (
      result.type === "TABLE" &&
      requestedProperties.value.length > 0
    ) {
      // If we got a TABLE result (which can happen with properties in LIST),
      // convert it to a list-friendly format
      console.log(
        "[RenderDataviewList] Converting TABLE result to LIST format"
      );
      queryResults.value = result.data;
    } else if (result.type === "ERROR") {
      console.error(
        "[RenderDataviewList] Query returned error:",
        result.message
      );
      error.value = result.message || "Error executing query";
      queryResults.value = [];
    } else {
      // Unexpected result type
      console.warn(
        `[RenderDataviewList] Unexpected result type: ${result.type}`
      );
      error.value = `Unexpected result type: ${result.type}`;
      queryResults.value = [];
    }
  } catch (err: any) {
    console.error("[RenderDataviewList] Error executing dataview query:", err);
    console.error("[RenderDataviewList] Error stack:", err.stack);
    queryResults.value = [];
    error.value = err.message || "Error executing query";
  } finally {
    isLoading.value = false;
    console.log("[RenderDataviewList] Query execution completed");
    console.log(
      "[RenderDataviewList] Final queryResults count:",
      queryResults.value.length
    );
  }
};

// Helper function to display item name (either raw path or from object)
const getItemDisplayName = (item: any): string => {
  // If item is just a string (file path), return it directly
  if (typeof item === "string") {
    return item;
  }

  // If item is an object, try to get the file name
  if (item && typeof item === "object") {
    // Try to extract name in this priority order
    if (item["file.name"]) return item["file.name"];
    if (item.File) return item.File;
    if (item.file?.name) return item.file.name;
    if (item.path) {
      const parts = item.path.split("/");
      return parts[parts.length - 1];
    }
    if (item.name) return item.name;

    // Fallback to first string property
    for (const key in item) {
      if (typeof item[key] === "string") {
        return item[key];
      }
    }
  }

  return "Untitled";
};

// Check if the item has any requested properties that should be displayed
const hasDisplayableProperties = (item: any): boolean => {
  if (!requestedProperties.value.length || typeof item !== "object") {
    return false;
  }

  return requestedProperties.value.some((prop) => {
    const value = getPropertyValue(item, prop);
    return value !== undefined && value !== null;
  });
};

// Get the value of a property from an item
const getPropertyValue = (item: any, prop: string): any => {
  // Direct property access
  if (prop in item) {
    return item[prop];
  }

  // For special properties like file.mtime, try alternative formats
  if (prop === "file.mtime") {
    return (
      item["file.mtime"] ||
      item.Modified ||
      item.file?.mtime ||
      (item.stat?.mtime ? new Date(item.stat.mtime) : null)
    );
  }

  if (prop === "file.ctime") {
    return (
      item["file.ctime"] ||
      item.Created ||
      item.file?.ctime ||
      (item.stat?.ctime ? new Date(item.stat.ctime) : null)
    );
  }

  if (prop === "file.name") {
    return (
      item["file.name"] ||
      item.File ||
      item.file?.name ||
      (item.path ? item.path.split("/").pop() : null)
    );
  }

  // Nested property access (e.g., file.size)
  if (prop.includes(".")) {
    const parts = prop.split(".");
    let value = item;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        // Try handling common cases
        if (parts[0] === "file" && parts[1] === "size" && item.stat?.size) {
          return item.stat.size;
        }
        if (parts[0] === "file" && parts[1] === "path" && item.path) {
          return item.path;
        }
        return undefined;
      }
    }
    return value;
  }

  // Check frontmatter or parsed fields
  if (item.note?.frontmatter && prop in item.note.frontmatter) {
    return item.note.frontmatter[prop];
  }

  if (item.parsed?.inlineFields && prop in item.parsed.inlineFields) {
    return item.parsed.inlineFields[prop];
  }

  return undefined;
};

// Format the properties for display
const formatProperties = (item: any): string => {
  if (!requestedProperties.value.length || !item) return "";

  const formattedProps: string[] = [];

  requestedProperties.value.forEach((prop) => {
    const value = getPropertyValue(item, prop);

    if (value !== undefined && value !== null) {
      let formattedValue = value;

      // Format based on property type
      if (value instanceof Date) {
        formattedValue = format(value, "MMM d, yyyy");
      } else if (Array.isArray(value)) {
        formattedValue = value.join(", ");
      } else if (typeof value === "object") {
        formattedValue = JSON.stringify(value);
      }

      // Get display name for the property (using mapping or just the last part)
      const displayName =
        propertyMappings[prop] || prop.split(".").pop() || prop;
      formattedProps.push(`${displayName}: ${formattedValue}`);
    }
  });

  return formattedProps.length ? `[${formattedProps.join(" | ")}]` : "";
};

// Set up watchers
onMounted(() => {
  console.log("[DataviewList] Component mounted, executing initial query");
  // Initialize the DataStore when the component mounts
  dataStoreManager.initializeDataStore().then(() => {
    // Execute the query once the data store is initialized
    executeQuery();
  });

  // Debug logs about available node properties
  console.log("[DataviewList] Node props:", {
    hasAttributes: !!props.node?.attrs,
    hasExtension: !!props.extension,
    editorAvailable: !!props.editor,
  });
});

// Watch for query changes
watch(
  () => query.value,
  (newQuery, oldQuery) => {
    console.log("[DataviewList] Query changed:", {
      from: oldQuery,
      to: newQuery,
      changed: newQuery !== oldQuery,
    });

    if (newQuery) {
      console.log("[DataviewList] Executing query due to change");
      debouncedExecuteQuery();
    }
  }
);

// Also watch node content directly
watch(
  () => props.node?.textContent,
  (newContent, oldContent) => {
    console.log("[DataviewList] Node textContent changed:", {
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
    console.log("[DataviewList] Node attributes changed");
    debouncedExecuteQuery();
  },
  { deep: true }
);

const debouncedExecuteQuery = debounce(() => {
  console.log("[DataviewList] Debounced query execution triggered");
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

/* List styling to match Obsidian native */
.list-result ul {
  margin: 0.25rem 0;
  padding-left: 1.5rem;
}

.list-result li {
  margin-bottom: 0.5rem;
  color: var(--text-normal, #dcddde);
  line-height: 1.4;
}

/* Note link styling */
.note-title {
  color: var(--text-accent, #a389f4);
  cursor: pointer;
  text-decoration: none;
}

.note-title:hover {
  text-decoration: underline;
}

.empty-state {
  font-style: italic;
  color: var(--text-muted, #888);
  padding: 1rem;
  text-align: center;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .list-result {
    max-width: 100%;
  }
}
</style>

<!-- src/components/obsidian/custom-extensions/RenderDataviewTask.vue -->
<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview Tasks</strong>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="isInitializingStore" class="loading-message">
          Loading vault data: {{ initProgress }}%
        </div>
      </div>

      <!-- Replace the template section with this updated version -->
      <div
        class="query-output task-result"
        :class="{ loading: isLoading || isInitializingStore }"
      >
        <!-- Task groups rendering if grouped and we have results -->
        <div v-if="hasGroups && flatTasks.length > 0" class="task-groups">
          <div
            v-for="(group, groupIndex) in taskResults"
            :key="groupIndex"
            class="task-group"
          >
            <div class="task-group-header">
              {{ getGroupHeader(group.groupKey) }}
            </div>
            <ul class="task-list">
              <li
                v-for="(task, taskIndex) in group.tasks"
                :key="taskIndex"
                class="task-item"
              >
                <span class="task-checkbox">
                  <i
                    :class="[
                      task.status === 'x'
                        ? 'far fa-check-square'
                        : 'far fa-square',
                    ]"
                  ></i>
                </span>
                <span
                  class="task-text"
                  v-html="formatTaskText(task.text)"
                ></span>
                <span v-if="task.path" class="task-source">{{
                  formatSourcePath(task.path)
                }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Flat task rendering if not grouped and we have results -->
        <ul v-else-if="flatTasks.length > 0" class="task-list">
          <li v-for="(task, index) in flatTasks" :key="index" class="task-item">
            <span class="task-checkbox">
              <i
                :class="[
                  task.status === 'x' ? 'far fa-check-square' : 'far fa-square',
                ]"
              ></i>
            </span>
            <span class="task-text" v-html="formatTaskText(task.text)"></span>
            <span v-if="task.path" class="task-source">{{
              formatSourcePath(task.path)
            }}</span>
          </li>
        </ul>

        <!-- Empty state -->
        <div v-else class="empty-state">
          {{
            isLoading || isInitializingStore
              ? "Loading tasks..."
              : "No tasks found matching your criteria"
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
console.log("[DataviewTask] Component initializing");

const props = defineProps<NodeViewProps>();

// Log the initial node content
console.log("[DataviewTask] Initial node content:", props.node?.textContent);

// Create query engine instances
const queryParser = new QueryParser();
const queryEngine = new QueryEngine();

// Use the DataStoreManager instead of creating a new DataStore
const dataStoreManager = useDataStoreManager();
const isInitializingStore = computed(() => dataStoreManager.isLoading);
const initProgress = computed(() => dataStoreManager.initializationProgress);

// State for task results
const taskResults = ref<Array<{ groupKey: string; tasks: any[] }>>([]);
const isLoading = ref(false);
const error = ref("");
const hasGroups = ref(false);

// Extract the flat list of tasks when not grouped
const flatTasks = computed(() => {
  if (!taskResults.value || taskResults.value.length === 0) return [];

  // Flatten all groups and filter out any undefined/null tasks
  return taskResults.value
    .flatMap((group) => group.tasks || [])
    .filter((task) => task); // Filter out undefined/null tasks
});

// Get the query string from the node content
const query = computed(() => {
  const content = props.node?.textContent?.trim() || "";
  console.log("[DataviewTask] Current query computed:", content);
  return content;
});

// Parse the TASK query to determine if tasks are grouped
const parseGroupBy = (queryString: string): string | null => {
  const lines = queryString.split("\n");
  const groupByLine = lines.find((line) => line.trim().startsWith("GROUP BY"));

  if (!groupByLine) return null;

  const match = groupByLine.match(/^GROUP BY\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

// Execute the query against the DataStore
const executeQuery = async () => {
  const currentQuery = query.value;
  console.log(
    "[RenderDataviewTask] executeQuery called with query:",
    currentQuery
  );

  if (!currentQuery) {
    console.log("[RenderDataviewTask] Query is empty, not executing");
    return;
  }

  try {
    console.log("[RenderDataviewTask] Starting query execution");
    isLoading.value = true;
    error.value = "";

    // Check for GROUP BY to determine rendering approach
    const groupByField = parseGroupBy(currentQuery);
    hasGroups.value = !!groupByField;
    console.log(
      "[RenderDataviewTask] Has groups:",
      hasGroups.value,
      "Group by:",
      groupByField
    );

    // Initialize data store if needed
    if (!dataStoreManager.isInitialized) {
      console.log("[RenderDataviewTask] Initializing data store...");
      await dataStoreManager.initializeDataStore();
    }

    // Check if initialization was successful
    if (!dataStoreManager.isDataStoreReady) {
      console.log(
        "[RenderDataviewTask] Data store initialization failed or is still in progress"
      );
      error.value = "Data store is not ready. Please try again.";
      return;
    }

    // Parse the query string to a structured QueryRequest
    const queryRequest = queryParser.parseQuery(currentQuery);
    console.log("[RenderDataviewTask] Parsed query request:", queryRequest);

    // Ensure we're dealing with a TASK query
    if (queryRequest.queryType !== "TASK") {
      queryRequest.queryType = "TASK"; // Force it to be a TASK query
    }

    // Execute the query using the QueryEngine
    console.log(
      "[RenderDataviewTask] DataStore debug info:\n",
      dataStoreManager.dataStore.getStoreDebugInfo()
    );

    const result = await queryEngine.execute(
      queryRequest,
      dataStoreManager.dataStore as any
    );

    console.log(
      "[RenderDataviewTask] Query execution result type:",
      result.type
    );

    if (result.type === "TASK") {
      console.log("[RenderDataviewTask] TASK result details:", {
        taskCount: result.data.length,
        firstTask: result.data.length > 0 ? result.data[0] : null,
      });

      // Process the tasks - if grouped, organize by group
      if (hasGroups.value && groupByField) {
        // Group tasks by the specified field
        const groupedTasks = groupTasksByField(result.data, groupByField);
        taskResults.value = groupedTasks;
      } else {
        // Single flat group with all tasks
        taskResults.value = [{ groupKey: "", tasks: result.data }];
      }

      console.log(
        "[RenderDataviewTask] Final task groups:",
        taskResults.value.length
      );
    } else if (result.type === "ERROR") {
      console.error(
        "[RenderDataviewTask] Query returned error:",
        result.message
      );
      error.value = result.message || "Error executing query";
      taskResults.value = [];
    } else {
      // Not a TASK result
      console.warn(
        `[RenderDataviewTask] Unexpected result type: ${result.type}`
      );
      error.value = `Unexpected result type: ${result.type}`;
      taskResults.value = [];
    }
  } catch (err: any) {
    console.error("[RenderDataviewTask] Error executing query:", err);
    console.error("[RenderDataviewTask] Error stack:", err.stack);
    taskResults.value = [];
    error.value = err.message || "Error executing query";
  } finally {
    isLoading.value = false;
    console.log("[RenderDataviewTask] Query execution completed");
  }
};

// Group tasks by a specified field
const groupTasksByField = (
  tasks: any[],
  field: string
): Array<{ groupKey: string; tasks: any[] }> => {
  const groups = new Map<string, any[]>();

  tasks.forEach((task) => {
    // Get the group value from the task
    let groupValue = getTaskProperty(task, field);

    // Ensure we have a string key
    const groupKey = groupValue?.toString() || "No value";

    // Add to existing group or create new one
    if (groups.has(groupKey)) {
      groups.get(groupKey)!.push(task);
    } else {
      groups.set(groupKey, [task]);
    }
  });

  // Convert map to array for rendering
  return Array.from(groups.entries()).map(([key, tasks]) => ({
    groupKey: key,
    tasks: tasks,
  }));
};

// Get a property from a task
const getTaskProperty = (task: any, field: string): any => {
  // Handle special fields
  if (field === "status") return task.status;
  if (field === "text") return task.text;
  if (field === "path" || field === "file.path") return task.path;
  if (field === "file.folder") {
    // Extract folder from path
    const pathParts = task.path?.split("/");
    return pathParts && pathParts.length > 1
      ? pathParts.slice(0, -1).join("/")
      : "";
  }

  // Handle common date fields
  if (field === "due") return task.due;
  if (field === "created") return task.created;
  if (field === "completion") return task.completion;

  // Handle other fields by accessing directly
  return task[field];
};

// Format the group header for display
const getGroupHeader = (groupKey: string): string => {
  if (!groupKey) return "Tasks";

  // Format dates if they look like dates
  if (/^\d{4}-\d{2}-\d{2}/.test(groupKey)) {
    try {
      const date = new Date(groupKey);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (e) {
      // If date parsing fails, just use the raw key
    }
  }

  // Format status
  if (groupKey === "x") return "Completed";
  if (groupKey === " " || groupKey === "-") return "Incomplete";

  return groupKey;
};

// Format the task text to highlight tags, priority, due dates
const formatTaskText = (text: string): string => {
  if (!text) return "";

  // Escape HTML
  let formattedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Highlight #tags
  formattedText = formattedText.replace(
    /#[a-zA-Z0-9_/-]+/g,
    '<span class="task-tag">$&</span>'
  );

  // Highlight due dates (📅 YYYY-MM-DD)
  formattedText = formattedText.replace(
    /📅\s*(\d{4}-\d{2}-\d{2})/g,
    '<span class="task-due">📅 $1</span>'
  );

  // Highlight priorities (P1, P2, P3 or !!, !, etc)
  formattedText = formattedText.replace(
    /\b(P1|P2|P3|\!\!\!|\!\!|\!)\b/g,
    '<span class="task-priority">$1</span>'
  );

  return formattedText;
};

// Format the source path to be more readable
const formatSourcePath = (path: string): string => {
  if (!path) return "";

  // Extract just the filename without extension
  const parts = path.split("/");
  const filename = parts[parts.length - 1].replace(/\.md$/, "");

  return filename;
};

// Set up watchers
onMounted(() => {
  console.log("[DataviewTask] Component mounted, executing initial query");
  // Initialize the DataStore when the component mounts
  dataStoreManager.initializeDataStore().then(() => {
    // Execute the query once the data store is initialized
    executeQuery();
  });
});

// Watch for query changes
watch(
  () => query.value,
  (newQuery, oldQuery) => {
    console.log("[DataviewTask] Query changed:", {
      from: oldQuery,
      to: newQuery,
      changed: newQuery !== oldQuery,
    });

    if (newQuery) {
      console.log("[DataviewTask] Executing query due to change");
      debouncedExecuteQuery();
    }
  }
);

// Also watch node content directly
watch(
  () => props.node?.textContent,
  (newContent, oldContent) => {
    console.log("[DataviewTask] Node textContent changed:", {
      from: oldContent,
      to: newContent,
      changed: newContent !== oldContent,
    });
  }
);

// Watch node attributes for changes
watch(
  () => props.node?.attrs,
  () => {
    console.log("[DataviewTask] Node attributes changed");
    debouncedExecuteQuery();
  },
  { deep: true }
);

const debouncedExecuteQuery = debounce(() => {
  console.log("[DataviewTask] Debounced query execution triggered");
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

/* Loading indicator animation */
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
</style>

<style scoped>
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

/* Task Group Styling */
.task-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-group {
  display: flex;
  flex-direction: column;
}

.task-group-header {
  font-weight: 600;
  font-size: 1.1em;
  color: var(--text-accent, #a389f4);
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--background-modifier-border, #333);
}

/* Task List Styling - matches Obsidian native */
.task-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 0.25rem 0;
  gap: 0.5rem;
  line-height: 1.4;
}

.task-checkbox {
  color: var(--text-normal, #dcddde);
  font-size: 1.1em;
  min-width: 1.2em;
  margin-top: 0.1em; /* Align with the text */
}

.task-checkbox .fa-check-square {
  color: var(--text-accent, #a389f4);
}

.task-text {
  flex-grow: 1;
  word-break: break-word;
}

.task-source {
  color: var(--text-faint, #888);
  font-size: 0.85em;
  margin-left: 0.5em;
  opacity: 0.7;
  white-space: nowrap;
}

/* Task text styling enhancements */
.task-tag {
  display: inline;
  color: var(--text-accent, #a389f4);
  font-size: 0.9em;
}

.task-due {
  display: inline;
  color: #10b981; /* Green color for due dates */
}

.task-priority {
  display: inline;
  font-weight: 600;
  color: #f87171; /* Red for priorities */
}

.empty-state {
  font-style: italic;
  color: var(--text-muted, #888);
  padding: 1rem;
  text-align: center;
}
</style>

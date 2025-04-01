<template>
  <!-- 
  IMPORTANT NOTE FOR DEVELOPERS:
  - This component should NOT implement any connection checks to Obsidian
  - This component should NOT display any toast messages
  - All connection validation and user feedback should be handled by parent components
  - Keep this component focused solely on building Dataview queries
  -->
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event as any)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    @add-line="regenerateQuery"
    ref="baseModuleRef"
  >
    <!-- Module Header -->
    <div class="dataview-task-editor">
      <!-- Source Selection Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-filter"></i>
            Source Selection
          </div>
        </div>

        <div class="dataview-task-editor__source-options">
          <button
            class="dataview-task-editor__source-option"
            :class="{ active: sourceType === 'all' }"
            @click="setSourceType('all')"
          >
            All notes
          </button>
          <button
            class="dataview-task-editor__source-option"
            :class="{ active: sourceType === 'folder' }"
            @click="setSourceType('folder')"
          >
            From folder
          </button>
          <button
            class="dataview-task-editor__source-option"
            :class="{ active: sourceType === 'tag' }"
            @click="setSourceType('tag')"
          >
            With tag
          </button>
          <button
            class="dataview-task-editor__source-option"
            :class="{ active: sourceType === 'property' }"
            @click="setSourceType('property')"
          >
            With property
          </button>
        </div>

        <!-- Folder Selection -->
        <div
          v-if="sourceType === 'folder'"
          class="dataview-task-editor__source-details"
        >
          <div class="dataview-task-editor__field">
            <select
              class="dataview-task-editor__select"
              v-model="selectedFolder"
              @change="handleSourceValueChange"
            >
              <option disabled value="">Select a folder</option>
              <option
                v-for="folder in availableFolders"
                :key="folder.path"
                :value="folder.path"
              >
                {{ folder.path || "/" }}
              </option>
            </select>
            <button
              class="dataview-task-editor__action-btn"
              title="Refresh folder list"
              @click="fetchFolders"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <!-- Tag Selection -->
        <div
          v-if="sourceType === 'tag'"
          class="dataview-task-editor__source-details"
        >
          <div class="dataview-task-editor__field">
            <select
              class="dataview-task-editor__select"
              v-model="selectedTag"
              @change="handleSourceValueChange"
            >
              <option disabled value="">Select a tag</option>
              <option v-for="tag in availableTags" :key="tag" :value="tag">
                #{{ tag }}
              </option>
            </select>
            <button
              class="dataview-task-editor__action-btn"
              title="Refresh tag list"
              @click="fetchTags"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <!-- Property Selection -->
        <div
          v-if="sourceType === 'property'"
          class="dataview-task-editor__source-details"
        >
          <div class="dataview-task-editor__property-field">
            <!-- Property name -->
            <select
              class="dataview-task-editor__select"
              v-model="selectedProperty"
              @change="handlePropertyChange"
            >
              <option disabled value="">Select a property</option>
              <option
                v-for="prop in availableProperties"
                :key="prop"
                :value="prop"
              >
                {{ prop }}
              </option>
            </select>

            <!-- Operator -->
            <select
              class="dataview-task-editor__select dataview-task-editor__operator-select"
              v-model="propertyOperator"
              @change="handlePropertyOperatorChange"
            >
              <option value="=">equals</option>
              <option value="!=">not equals</option>
              <option value=">">greater than</option>
              <option value="<">less than</option>
              <option value=">=">greater/equal</option>
              <option value="<=">less/equal</option>
              <option value="contains">contains</option>
            </select>

            <!-- Value -->
            <input
              type="text"
              class="dataview-task-editor__input"
              placeholder="Value"
              v-model="propertyValue"
              @input="handlePropertyValueChange"
            />

            <button
              class="dataview-task-editor__action-btn"
              title="Refresh property list"
              @click="fetchProperties"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Task Status Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-tasks"></i>
            Task Status
          </div>
        </div>

        <div class="dataview-task-editor__status-controls">
          <div class="dataview-task-editor__status-options">
            <button
              class="dataview-task-editor__status-option"
              :class="{ active: taskStatus === 'all' }"
              @click="setTaskStatus('all')"
            >
              All tasks
            </button>
            <button
              class="dataview-task-editor__status-option"
              :class="{ active: taskStatus === 'done' }"
              @click="setTaskStatus('done')"
            >
              Completed
            </button>
            <button
              class="dataview-task-editor__status-option"
              :class="{ active: taskStatus === 'todo' }"
              @click="setTaskStatus('todo')"
            >
              Not completed
            </button>
          </div>

          <!-- Custom Task Completion Characters (Advanced) -->
          <div
            v-if="taskStatus !== 'all'"
            class="dataview-task-editor__completion-options"
          >
            <label class="dataview-task-editor__option-toggle">
              <input
                type="checkbox"
                v-model="useCustomCompletionChars"
                @change="regenerateQuery"
              />
              <span class="dataview-task-editor__toggle-slider"></span>
              <span class="dataview-task-editor__toggle-label"
                >Use custom completion characters</span
              >
            </label>

            <div
              v-if="useCustomCompletionChars"
              class="dataview-task-editor__custom-chars"
            >
              <input
                type="text"
                class="dataview-task-editor__input"
                v-model="customCompletionChars"
                placeholder="Completion characters (e.g., xX)"
                @input="regenerateQuery"
              />
              <div class="dataview-task-editor__option-info">
                <i class="fas fa-info-circle"></i>
                <span
                  >Enter characters that mark a task as complete (default:
                  x)</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Content Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-search"></i>
            Task Content Filter
          </div>
        </div>

        <div class="dataview-task-editor__content-filter">
          <div class="dataview-task-editor__content-toggle">
            <label class="dataview-task-editor__option-toggle">
              <input
                type="checkbox"
                v-model="filterTaskText"
                @change="regenerateQuery"
              />
              <span class="dataview-task-editor__toggle-slider"></span>
              <span class="dataview-task-editor__toggle-label"
                >Filter by task text</span
              >
            </label>
          </div>

          <div
            v-if="filterTaskText"
            class="dataview-task-editor__content-input"
          >
            <input
              type="text"
              class="dataview-task-editor__input"
              v-model="taskTextFilter"
              placeholder="Task contains text..."
              @input="regenerateQuery"
            />
            <div class="dataview-task-editor__option-info">
              <i class="fas fa-info-circle"></i>
              <span>Will show tasks that contain this text</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Group By Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-layer-group"></i>
            Group Results
          </div>
        </div>

        <div class="dataview-task-editor__group-options">
          <div class="dataview-task-editor__group-toggle">
            <label class="dataview-task-editor__option-toggle">
              <input
                type="checkbox"
                v-model="groupResults"
                @change="regenerateQuery"
              />
              <span class="dataview-task-editor__toggle-slider"></span>
              <span class="dataview-task-editor__toggle-label">Group by</span>
            </label>
          </div>

          <div v-if="groupResults" class="dataview-task-editor__group-details">
            <select
              class="dataview-task-editor__select"
              v-model="groupByField"
              @change="regenerateQuery"
            >
              <option value="file">File</option>
              <option value="heading">Heading</option>
              <option value="section">Section</option>
              <option value="backlink">Backlink</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sort Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-sort"></i>
            Sort Results
          </div>
        </div>

        <div class="dataview-task-editor__sort-controls">
          <select
            class="dataview-task-editor__select"
            v-model="sortProperty"
            @change="handleSortChange"
          >
            <option disabled value="">Sort by...</option>
            <option value="text">Task text</option>
            <option value="status">Task status</option>
            <option value="path">File path</option>
            <option value="created">Created date</option>
            <option value="completion">Completion date</option>
            <option value="due">Due date</option>
          </select>

          <div class="dataview-task-editor__sort-direction">
            <button
              class="dataview-task-editor__direction-btn"
              :class="{ active: sortDirection === 'asc' }"
              @click="setSortDirection('asc')"
            >
              <i class="fas fa-sort-amount-down-alt"></i>
              Ascending
            </button>
            <button
              class="dataview-task-editor__direction-btn"
              :class="{ active: sortDirection === 'desc' }"
              @click="setSortDirection('desc')"
            >
              <i class="fas fa-sort-amount-down"></i>
              Descending
            </button>
          </div>
        </div>
      </div>

      <!-- Limit Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-sliders-h"></i>
            Limit Results
          </div>
        </div>

        <div class="dataview-task-editor__limit-controls">
          <div class="dataview-task-editor__limit-field">
            <input
              type="number"
              class="dataview-task-editor__input dataview-task-editor__number-input"
              v-model.number="limitCount"
              min="1"
              max="1000"
              @change="handleLimitChange"
              :disabled="!useLimit"
            />
            <label class="dataview-task-editor__limit-toggle">
              <input
                type="checkbox"
                v-model="useLimit"
                @change="handleLimitChange"
              />
              <span class="dataview-task-editor__toggle-slider"></span>
              <span class="dataview-task-editor__toggle-label"
                >Apply limit</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { obsidianApiService } from "@/services/obsidian";

// Define props
const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

// Define emits
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

// Source selection
const sourceType = ref("all");
const selectedFolder = ref("");
const selectedTag = ref("");
const selectedProperty = ref("");
const propertyOperator = ref("=");
const propertyValue = ref("");

// Task status options
const taskStatus = ref("all"); // all, done, todo
const useCustomCompletionChars = ref(false);
const customCompletionChars = ref("x");

// Task content filter
const filterTaskText = ref(false);
const taskTextFilter = ref("");

// Group by options
const groupResults = ref(false);
const groupByField = ref("file");

// Obsidian data
const availableFolders = ref<{ name: string; path: string; parent: string }[]>([
  { name: "Root", path: "", parent: "" },
]);
const availableTags = ref<string[]>([]);
const availableProperties = ref<string[]>([
  "file.name",
  "file.ctime",
  "file.mtime",
  "file.size",
  "file.path",
  "file.folder",
  "tags",
  "title",
  "date",
  "status",
  "priority",
  "due",
  "completed",
]);

// Sort options
const sortProperty = ref("text");
const sortDirection = ref("asc");

// Limit options
const useLimit = ref(false);
const limitCount = ref(20);

// Initialize component
onMounted(async () => {
  try {
    // Fetch initial data from API service
    await Promise.all([fetchFolders(), fetchTags(), fetchProperties()]);

    // Parse existing content if it exists
    if (props.module.content.length > 0) {
      parseExistingQuery(props.module.content[0]);
    } else {
      // Generate initial query
      regenerateQuery();
    }
  } catch (error) {
    console.error("Error initializing DataviewTaskModule:", error);
  }
});

// Fetch available folders from Obsidian
async function fetchFolders() {
  try {
    const vaultInfo = await obsidianApiService.getVaultInfo();

    // Extract folders from the files array
    if (vaultInfo && vaultInfo.files && Array.isArray(vaultInfo.files)) {
      const folderPaths = vaultInfo.files.filter(
        (path) => typeof path === "string" && path.endsWith("/")
      );

      availableFolders.value = [
        { name: "Root", path: "", parent: "" },
        ...folderPaths.map((folder) => {
          // Remove trailing slash
          const cleanPath = folder.endsWith("/") ? folder.slice(0, -1) : folder;
          return {
            name: cleanPath.split("/").pop() || cleanPath,
            path: cleanPath,
            parent: cleanPath.includes("/")
              ? cleanPath.split("/").slice(0, -1).join("/")
              : "",
          };
        }),
      ];
    }
  } catch (err) {
    console.error("Error fetching folders:", err);
  }
}

// Fetch available tags from Obsidian
async function fetchTags() {
  try {
    // Use a TABLE query instead of LIST with FLATTEN
    const dql = `TABLE file.tags AS Tags FROM "" WHERE file.tags`;
    const results = await obsidianApiService.searchWithDataview(dql);

    // Extract tag names from results
    const tags = new Set<string>();

    if (Array.isArray(results)) {
      results.forEach((result) => {
        // Safely access properties using type assertion
        const item = result as Record<string, any>;

        if (item && typeof item === "object" && "Tags" in item) {
          const tagValue = item["Tags"];

          // Tags might be an array or a string
          if (Array.isArray(tagValue)) {
            tagValue.forEach((tag: any) => {
              if (typeof tag === "string") {
                tags.add(tag.replace(/^#/, ""));
              }
            });
          } else if (typeof tagValue === "string") {
            tags.add(tagValue.replace(/^#/, ""));
          }
        }
      });
    }

    availableTags.value = Array.from(tags);

    if (availableTags.value.length === 0) {
      // Fallback if no tags found
      availableTags.value = [
        "project",
        "todo",
        "idea",
        "journal",
        "note",
        "meeting",
      ];
    }
  } catch (err) {
    console.error("Error fetching tags:", err);
    // Fallback to some example tags
    availableTags.value = [
      "project",
      "todo",
      "idea",
      "journal",
      "note",
      "meeting",
    ];
  }
}

// Fetch available properties from Obsidian
async function fetchProperties() {
  try {
    availableProperties.value = [
      "file.name",
      "file.ctime",
      "file.mtime",
      "file.size",
      "file.path",
      "file.folder",
      "tags",
      "title",
      "date",
      "status",
      "priority",
      "due",
      "completed",
    ];

    // Additional logic could be added here to extract properties from results if needed
  } catch (err) {
    console.error("Error fetching properties:", err);
  }
}

// Parse an existing Dataview query to initialize the module state
function parseExistingQuery(query: string) {
  try {
    // Remove markdown code block syntax if present
    let cleanQuery = query.replace(/```dataview\n|\n```/g, "");

    // Basic parsing for TASK queries
    // This is a simplified parser that won't handle all possible Dataview syntax
    const lines = cleanQuery.split("\n").map((line) => line.trim());

    // Parse TASK part with any filtering
    const taskLine = lines[0];
    if (taskLine.startsWith("TASK")) {
      // Check for completion status filter
      if (taskLine.includes("done")) {
        taskStatus.value = "done";

        // Check for custom completion chars
        const completionMatch = taskLine.match(/done\s*\(([^)]+)\)/i);
        if (completionMatch) {
          useCustomCompletionChars.value = true;
          customCompletionChars.value = completionMatch[1].replace(/['"]/g, "");
        }
      } else if (taskLine.includes("not done")) {
        taskStatus.value = "todo";

        // Check for custom completion chars
        const completionMatch = taskLine.match(/not done\s*\(([^)]+)\)/i);
        if (completionMatch) {
          useCustomCompletionChars.value = true;
          customCompletionChars.value = completionMatch[1].replace(/['"]/g, "");
        }
      } else {
        taskStatus.value = "all";
      }

      // Check for text filter
      const textFilterMatch = taskLine.match(
        /text includes\s*["']([^"']+)["']/i
      );
      if (textFilterMatch) {
        filterTaskText.value = true;
        taskTextFilter.value = textFilterMatch[1];
      }
    }

    // Parse FROM part (source)
    const fromLine = lines.find((line) => line.startsWith("FROM"));
    if (fromLine) {
      const fromMatch = fromLine.match(/^FROM\s+(.+)$/i);
      if (fromMatch) {
        const source = fromMatch[1];

        if (source.startsWith('"') && source.endsWith('"')) {
          // Folder source
          sourceType.value = "folder";
          selectedFolder.value = source.slice(1, -1);
        } else if (source.startsWith("#")) {
          // Tag source
          sourceType.value = "tag";
          selectedTag.value = source.slice(1);
        } else {
          // Default to all
          sourceType.value = "all";
        }
      }
    } else {
      sourceType.value = "all";
    }

    // Parse WHERE part (property filter)
    const whereLine = lines.find((line) => line.startsWith("WHERE"));
    if (whereLine) {
      const whereMatch = whereLine.match(/^WHERE\s+(.+)$/i);
      if (whereMatch) {
        const condition = whereMatch[1];

        // Try to parse a basic property condition (prop = value)
        const conditionMatch = condition.match(
          /([^=!<>]+)\s*([=!<>]+|contains)\s*(.+)/i
        );
        if (conditionMatch) {
          sourceType.value = "property";
          selectedProperty.value = conditionMatch[1].trim();
          propertyOperator.value = conditionMatch[2].trim();
          // Remove quotes from value if present
          let value = conditionMatch[3].trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          propertyValue.value = value;
        }
      }
    }

    // Parse GROUP BY part
    const groupByLine = lines.find((line) => line.startsWith("GROUP BY"));
    if (groupByLine) {
      groupResults.value = true;
      const groupByMatch = groupByLine.match(/GROUP BY\s+(\w+)/i);
      if (groupByMatch) {
        groupByField.value = groupByMatch[1].toLowerCase();
      }
    } else {
      groupResults.value = false;
    }

    // Parse SORT part
    const sortLine = lines.find((line) => line.startsWith("SORT"));
    if (sortLine) {
      const sortMatch = sortLine.match(/^SORT\s+(.+?)(\s+(ASC|DESC))?$/i);
      if (sortMatch) {
        sortProperty.value = sortMatch[1].trim();
        sortDirection.value = sortMatch[3]?.toLowerCase() || "asc";
      }
    } else {
      // Default sort
      sortProperty.value = "text";
      sortDirection.value = "asc";
    }

    // Parse LIMIT part
    const limitLine = lines.find((line) => line.startsWith("LIMIT"));
    if (limitLine) {
      const limitMatch = limitLine.match(/^LIMIT\s+(\d+)$/i);
      if (limitMatch) {
        useLimit.value = true;
        limitCount.value = parseInt(limitMatch[1], 10);
      }
    } else {
      useLimit.value = false;
      limitCount.value = 20;
    }

    // Regenerate the query to ensure it's formatted correctly
    regenerateQuery();
  } catch (error) {
    console.error("Error parsing existing query:", error);
    // If parsing fails, just generate a new default query
    regenerateQuery();
  }
}

// Event Handlers
function setSourceType(type: string) {
  sourceType.value = type;
  regenerateQuery();
}

function setTaskStatus(status: string) {
  taskStatus.value = status;
  regenerateQuery();
}

function setSortDirection(direction: "asc" | "desc") {
  sortDirection.value = direction;
  regenerateQuery();
}

function handleSourceValueChange() {
  regenerateQuery();
}

function handlePropertyChange() {
  regenerateQuery();
}

function handlePropertyOperatorChange() {
  regenerateQuery();
}

function handlePropertyValueChange() {
  regenerateQuery();
}

function handleSortChange() {
  regenerateQuery();
}

function handleLimitChange() {
  regenerateQuery();
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // TASK part with status filter
  let taskLine = "TASK";

  // Add completion status filter
  if (taskStatus.value === "done") {
    if (useCustomCompletionChars.value && customCompletionChars.value) {
      taskLine += ` done("${customCompletionChars.value}")`;
    } else {
      taskLine += " done";
    }
  } else if (taskStatus.value === "todo") {
    if (useCustomCompletionChars.value && customCompletionChars.value) {
      taskLine += ` not done("${customCompletionChars.value}")`;
    } else {
      taskLine += " not done";
    }
  }

  // Add text filter
  if (filterTaskText.value && taskTextFilter.value) {
    taskLine += ` text includes "${taskTextFilter.value}"`;
  }

  query += `${taskLine}\n`;

  // FROM part
  if (sourceType.value === "folder" && selectedFolder.value) {
    query += `FROM "${selectedFolder.value}"\n`;
  } else if (sourceType.value === "tag" && selectedTag.value) {
    query += `FROM #${selectedTag.value}\n`;
  } else if (sourceType.value === "all") {
    query += 'FROM ""\n';
  }

  // WHERE part
  if (
    sourceType.value === "property" &&
    selectedProperty.value &&
    propertyValue.value
  ) {
    let formattedValue = propertyValue.value;

    // Add quotes for string values unless using contains operator
    if (
      isNaN(Number(formattedValue)) &&
      propertyOperator.value !== "contains"
    ) {
      formattedValue = `"${formattedValue}"`;
    }

    if (propertyOperator.value === "contains") {
      query += `WHERE contains(${selectedProperty.value}, "${propertyValue.value}")\n`;
    } else {
      query += `WHERE ${selectedProperty.value} ${propertyOperator.value} ${formattedValue}\n`;
    }
  }

  // GROUP BY part
  if (groupResults.value && groupByField.value) {
    query += `GROUP BY ${groupByField.value}\n`;
  }

  // SORT part
  if (sortProperty.value) {
    query += `SORT ${
      sortProperty.value
    } ${sortDirection.value.toUpperCase()}\n`;
  }

  // LIMIT part
  if (useLimit.value && limitCount.value > 0) {
    query += `LIMIT ${limitCount.value}\n`;
  }

  query += "```";
  return query;
}

// Generate the query and update the module content
function regenerateQuery() {
  const query = generateQuery();
  updateContent([query]);
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}
</script>

<style scoped>
.dataview-task-editor {
  width: 100%;
  color: #cbd5e1;
}

.dataview-task-editor__alert {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

/* Section styling */
.dataview-task-editor__section {
  margin-bottom: 20px;
}

.dataview-task-editor__section-header {
  margin-bottom: 12px;
}

.dataview-task-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  color: #e2e8f0;
}

/* Source selection */
.dataview-task-editor__source-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.dataview-task-editor__source-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.dataview-task-editor__source-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-task-editor__source-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dataview-task-editor__source-details {
  margin-top: 12px;
}

.dataview-task-editor__field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dataview-task-editor__property-field {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}

.dataview-task-editor__select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.dataview-task-editor__select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-task-editor__operator-select {
  font-size: 0.8125rem;
}

.dataview-task-editor__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
}

.dataview-task-editor__input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-task-editor__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dataview-task-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Task status controls */
.dataview-task-editor__status-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-task-editor__status-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.dataview-task-editor__status-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.dataview-task-editor__status-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-task-editor__status-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dataview-task-editor__completion-options {
  margin-top: 8px;
}

.dataview-task-editor__custom-chars {
  margin-top: 8px;
  margin-left: 48px;
}

/* Content filter options */
.dataview-task-editor__content-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-task-editor__content-input {
  margin-left: 48px;
}

/* Group options */
.dataview-task-editor__group-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-task-editor__group-details {
  margin-left: 48px;
}

/* Help text/info */
.dataview-task-editor__option-info {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.8125rem;
}

/* Toggles */
.dataview-task-editor__option-toggle,
.dataview-task-editor__limit-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-task-editor__toggle-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: 0.3s;
}

.dataview-task-editor__toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  border-radius: 50%;
  transition: 0.3s;
}

.dataview-task-editor__option-toggle input,
.dataview-task-editor__limit-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dataview-task-editor__option-toggle
  input:checked
  + .dataview-task-editor__toggle-slider,
.dataview-task-editor__limit-toggle
  input:checked
  + .dataview-task-editor__toggle-slider {
  background-color: rgba(255, 171, 88, 0.6);
}

.dataview-task-editor__option-toggle
  input:checked
  + .dataview-task-editor__toggle-slider:before,
.dataview-task-editor__limit-toggle
  input:checked
  + .dataview-task-editor__toggle-slider:before {
  transform: translateX(20px);
}

.dataview-task-editor__toggle-label {
  font-size: 0.875rem;
  color: #e2e8f0;
}

/* Sort controls */
.dataview-task-editor__sort-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-task-editor__sort-direction {
  display: flex;
  gap: 8px;
}

.dataview-task-editor__direction-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-task-editor__direction-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-task-editor__direction-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Limit controls */
.dataview-task-editor__limit-controls {
  margin-top: 8px;
}

.dataview-task-editor__limit-field {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dataview-task-editor__number-input {
  width: 80px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-task-editor__source-options,
  .dataview-task-editor__status-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-task-editor__property-field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dataview-task-editor__sort-controls,
  .dataview-task-editor__limit-field {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

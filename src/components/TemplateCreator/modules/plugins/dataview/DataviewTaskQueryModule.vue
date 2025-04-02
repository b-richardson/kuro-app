<template>
  <!-- 
  IMPORTANT NOTE FOR DEVELOPERS:
  - This component should NOT implement any connection checks to Obsidian
  - This component should NOT display any toast messages
  - All connection validation and user feedback should be handled by parent components
  - Keep this component focused solely on building Dataview task queries
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
    <div class="dataview-task-editor">
      <!-- Module Header -->
      <div class="dataview-task-editor__header">
        <div class="dataview-task-editor__header-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="dataview-task-editor__header-title">Dataview Tasks</div>
      </div>

      <!-- Task Status Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-check-circle"></i>
            <span>Task Status</span>
          </div>
          <div class="dataview-task-editor__section-description">
            Choose which tasks to include in your query
          </div>
        </div>

        <div class="dataview-task-editor__status-selector">
          <button
            class="dataview-task-editor__status-card"
            :class="{
              'dataview-task-editor__status-card--active':
                taskStatus === 'incomplete',
            }"
            @click="setTaskStatus('incomplete')"
          >
            <div class="dataview-task-editor__status-card-icon">
              <i class="far fa-square"></i>
            </div>
            <div class="dataview-task-editor__status-card-label">
              Incomplete Tasks
            </div>
          </button>

          <button
            class="dataview-task-editor__status-card"
            :class="{
              'dataview-task-editor__status-card--active':
                taskStatus === 'complete',
            }"
            @click="setTaskStatus('complete')"
          >
            <div class="dataview-task-editor__status-card-icon">
              <i class="far fa-check-square"></i>
            </div>
            <div class="dataview-task-editor__status-card-label">
              Completed Tasks
            </div>
          </button>

          <button
            class="dataview-task-editor__status-card"
            :class="{
              'dataview-task-editor__status-card--active': taskStatus === 'all',
            }"
            @click="setTaskStatus('all')"
          >
            <div class="dataview-task-editor__status-card-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="dataview-task-editor__status-card-label">All Tasks</div>
          </button>
        </div>
      </div>

      <!-- Source Selection Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-filter"></i>
            <span>Choose Source</span>
          </div>
          <div class="dataview-task-editor__section-description">
            Select where to find tasks
          </div>
        </div>

        <div class="dataview-task-editor__source-selector">
          <button
            class="dataview-task-editor__source-card"
            :class="{
              'dataview-task-editor__source-card--active': sourceType === 'all',
            }"
            @click="setSourceType('all')"
          >
            <div class="dataview-task-editor__source-card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="dataview-task-editor__source-card-label">All Notes</div>
          </button>

          <button
            class="dataview-task-editor__source-card"
            :class="{
              'dataview-task-editor__source-card--active':
                sourceType === 'folder',
            }"
            @click="setSourceType('folder')"
          >
            <div class="dataview-task-editor__source-card-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="dataview-task-editor__source-card-label">
              From Folder
            </div>
          </button>

          <button
            class="dataview-task-editor__source-card"
            :class="{
              'dataview-task-editor__source-card--active': sourceType === 'tag',
            }"
            @click="setSourceType('tag')"
          >
            <div class="dataview-task-editor__source-card-icon">
              <i class="fas fa-hashtag"></i>
            </div>
            <div class="dataview-task-editor__source-card-label">With Tag</div>
          </button>

          <button
            class="dataview-task-editor__source-card"
            :class="{
              'dataview-task-editor__source-card--active':
                sourceType === 'current',
            }"
            @click="setSourceType('current')"
          >
            <div class="dataview-task-editor__source-card-icon">
              <i class="fas fa-file"></i>
            </div>
            <div class="dataview-task-editor__source-card-label">
              Current Note
            </div>
          </button>
        </div>

        <!-- Configuration Panel -->
        <div class="dataview-task-editor__config-panel">
          <!-- Folder Selection -->
          <div
            v-if="sourceType === 'folder'"
            class="dataview-task-editor__config-content"
          >
            <div class="dataview-task-editor__field-group">
              <label class="dataview-task-editor__label">Select Folder</label>
              <div class="dataview-task-editor__input-group">
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
              <div class="dataview-task-editor__field-tip">
                Only include tasks from notes in this folder
              </div>
            </div>
          </div>

          <!-- Tag Selection -->
          <div
            v-if="sourceType === 'tag'"
            class="dataview-task-editor__config-content"
          >
            <div class="dataview-task-editor__field-group">
              <label class="dataview-task-editor__label">Select Tag</label>
              <div class="dataview-task-editor__input-group">
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
              <div class="dataview-task-editor__field-tip">
                Only include tasks from notes with this tag
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Filtering Section -->
      <div class="dataview-task-editor__section">
        <div class="dataview-task-editor__section-header">
          <div class="dataview-task-editor__section-title">
            <i class="fas fa-search"></i>
            <span>Task Filters</span>
          </div>
          <div class="dataview-task-editor__section-description">
            Find tasks that match specific criteria
          </div>
        </div>

        <div class="dataview-task-editor__filters">
          <!-- Text Contains Filter -->
          <div class="dataview-task-editor__filter-item">
            <div class="dataview-task-editor__checkbox">
              <input
                type="checkbox"
                id="text-filter"
                v-model="filters.textEnabled"
                @change="regenerateQuery"
              />
              <label for="text-filter">Task text contains</label>
            </div>

            <div
              v-if="filters.textEnabled"
              class="dataview-task-editor__filter-content"
            >
              <input
                type="text"
                class="dataview-task-editor__text-input"
                placeholder="Filter text..."
                v-model="filters.textValue"
                @input="regenerateQuery"
              />
            </div>
          </div>

          <!-- Due Date Filter -->
          <div class="dataview-task-editor__filter-item">
            <div class="dataview-task-editor__checkbox">
              <input
                type="checkbox"
                id="due-filter"
                v-model="filters.dueEnabled"
                @change="regenerateQuery"
              />
              <label for="due-filter">Has due date</label>
            </div>

            <div
              v-if="filters.dueEnabled"
              class="dataview-task-editor__filter-content"
            >
              <div class="dataview-task-editor__radio-group">
                <label class="dataview-task-editor__radio">
                  <input
                    type="radio"
                    name="dueType"
                    value="any"
                    v-model="filters.dueType"
                    @change="regenerateQuery"
                  />
                  <span>Any due date</span>
                </label>

                <label class="dataview-task-editor__radio">
                  <input
                    type="radio"
                    name="dueType"
                    value="overdue"
                    v-model="filters.dueType"
                    @change="regenerateQuery"
                  />
                  <span>Overdue</span>
                </label>

                <label class="dataview-task-editor__radio">
                  <input
                    type="radio"
                    name="dueType"
                    value="future"
                    v-model="filters.dueType"
                    @change="regenerateQuery"
                  />
                  <span>Future</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Priority Filter -->
          <div class="dataview-task-editor__filter-item">
            <div class="dataview-task-editor__checkbox">
              <input
                type="checkbox"
                id="priority-filter"
                v-model="filters.priorityEnabled"
                @change="regenerateQuery"
              />
              <label for="priority-filter">Has priority</label>
            </div>

            <div
              v-if="filters.priorityEnabled"
              class="dataview-task-editor__filter-content"
            >
              <div class="dataview-task-editor__priority-options">
                <label class="dataview-task-editor__priority-option">
                  <input
                    type="checkbox"
                    v-model="filters.priorityValues.high"
                    @change="regenerateQuery"
                  />
                  <span
                    class="dataview-task-editor__priority-badge dataview-task-editor__priority-badge--high"
                    >P1</span
                  >
                </label>

                <label class="dataview-task-editor__priority-option">
                  <input
                    type="checkbox"
                    v-model="filters.priorityValues.medium"
                    @change="regenerateQuery"
                  />
                  <span
                    class="dataview-task-editor__priority-badge dataview-task-editor__priority-badge--medium"
                    >P2</span
                  >
                </label>

                <label class="dataview-task-editor__priority-option">
                  <input
                    type="checkbox"
                    v-model="filters.priorityValues.low"
                    @change="regenerateQuery"
                  />
                  <span
                    class="dataview-task-editor__priority-badge dataview-task-editor__priority-badge--low"
                    >P3</span
                  >
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Organization Section -->
      <div class="dataview-task-editor__section">
        <button
          class="dataview-task-editor__advanced-toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span>{{
            showAdvanced
              ? "Hide organization options"
              : "Show organization options"
          }}</span>
          <i
            :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
        </button>

        <div v-if="showAdvanced" class="dataview-task-editor__advanced-panel">
          <!-- Group By -->
          <div class="dataview-task-editor__field-group">
            <label class="dataview-task-editor__label">
              <i class="fas fa-layer-group"></i>
              Group Tasks By
            </label>

            <div class="dataview-task-editor__select-wrapper">
              <select
                class="dataview-task-editor__select"
                v-model="groupBy"
                @change="regenerateQuery"
              >
                <option value="">No Grouping</option>
                <option value="file.path">File</option>
                <option value="section">Section</option>
                <option value="status">Status</option>
                <option value="due">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div class="dataview-task-editor__field-tip">
              Organize tasks into groups based on this property
            </div>
          </div>

          <!-- Sort By -->
          <div class="dataview-task-editor__field-group">
            <label class="dataview-task-editor__label">
              <i class="fas fa-sort"></i>
              Sort Tasks By
            </label>

            <div class="dataview-task-editor__sort-property">
              <select
                class="dataview-task-editor__select"
                v-model="sortProperty"
                @change="handleSortChange"
              >
                <option value="text">Task Text</option>
                <option value="due">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Created Date</option>
                <option value="completion">Completion Date</option>
                <option value="path">File Path</option>
              </select>
            </div>

            <div class="dataview-task-editor__sort-direction">
              <div class="dataview-task-editor__radio-group">
                <label class="dataview-task-editor__radio">
                  <input
                    type="radio"
                    name="sortDirection"
                    :value="'asc'"
                    v-model="sortDirection"
                    @change="handleSortChange"
                  />
                  <span class="dataview-task-editor__radio-text">
                    <i class="fas fa-sort-amount-down-alt"></i>
                    Ascending
                  </span>
                </label>

                <label class="dataview-task-editor__radio">
                  <input
                    type="radio"
                    name="sortDirection"
                    :value="'desc'"
                    v-model="sortDirection"
                    @change="handleSortChange"
                  />
                  <span class="dataview-task-editor__radio-text">
                    <i class="fas fa-sort-amount-down"></i>
                    Descending
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Limit Section -->
          <div class="dataview-task-editor__field-group">
            <div class="dataview-task-editor__limit-field">
              <div class="dataview-task-editor__checkbox">
                <input
                  type="checkbox"
                  id="limit-toggle"
                  v-model="useLimit"
                  @change="handleLimitChange"
                />
                <label for="limit-toggle">Limit number of tasks</label>
              </div>

              <div class="dataview-task-editor__limit-value" v-if="useLimit">
                <input
                  type="number"
                  class="dataview-task-editor__text-input dataview-task-editor__number-input"
                  v-model.number="limitCount"
                  min="1"
                  max="1000"
                  @change="handleLimitChange"
                />
                <div class="dataview-task-editor__field-tip">
                  Maximum number of tasks to display
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="dataview-task-editor__tips">
        <div class="dataview-task-editor__tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Dataview Tasks</span>
        </div>
        <div class="dataview-task-editor__tips-content">
          <p>
            This creates a list of tasks from your vault based on your criteria.
            The tasks will display their text, source file, and relevant
            metadata like due dates or priorities.
          </p>
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

// Advanced toggle
const showAdvanced = ref(false);

// Task Status
const taskStatus = ref("incomplete"); // 'incomplete', 'complete', 'all'

// Source selection
const sourceType = ref("all");
const selectedFolder = ref("");
const selectedTag = ref("");

// Filters
const filters = ref({
  textEnabled: false,
  textValue: "",
  dueEnabled: false,
  dueType: "any", // 'any', 'overdue', 'future'
  priorityEnabled: false,
  priorityValues: {
    high: true,
    medium: true,
    low: true,
  },
});

// Obsidian data
const availableFolders = ref<{ name: string; path: string; parent: string }[]>([
  { name: "Root", path: "", parent: "" },
]);
const availableTags = ref<string[]>([]);

// Group By option
const groupBy = ref("");

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
    await Promise.all([fetchFolders(), fetchTags()]);

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

// Parse an existing Dataview query to initialize the module state
function parseExistingQuery(query: string) {
  try {
    // Remove markdown code block syntax if present
    let cleanQuery = query.replace(/```dataview\n|\n```/g, "");

    // Basic parsing for TASK queries
    // This is a simplified parser that won't handle all possible Dataview syntax
    const lines = cleanQuery.split("\n").map((line) => line.trim());

    // Parse task completion status
    if (lines[0].includes("TASK where !completed")) {
      taskStatus.value = "incomplete";
    } else if (lines[0].includes("TASK where completed")) {
      taskStatus.value = "complete";
    } else {
      taskStatus.value = "all";
    }

    // Parse FROM part (source)
    const fromLine = lines.find((line) => line.startsWith("FROM"));
    if (fromLine) {
      const fromMatch = fromLine.match(/^FROM\s+(.+)$/i);
      if (fromMatch) {
        const source = fromMatch[1];

        if (source === "[[]]") {
          sourceType.value = "current";
        } else if (source.startsWith('"') && source.endsWith('"')) {
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

    // Parse WHERE part (filters)
    const whereLine = lines.find((line) => line.startsWith("WHERE"));
    if (whereLine) {
      const whereClause = whereLine.replace(/^WHERE\s+/i, "");

      // Parse text filter
      if (whereClause.includes("contains(text,")) {
        filters.value.textEnabled = true;
        const textMatch = whereClause.match(/contains\(text,\s*"([^"]+)"\)/i);
        if (textMatch) {
          filters.value.textValue = textMatch[1];
        }
      }

      // Parse due date filter
      if (whereClause.includes("due")) {
        filters.value.dueEnabled = true;
        if (whereClause.includes("due < date(now)")) {
          filters.value.dueType = "overdue";
        } else if (whereClause.includes("due > date(now)")) {
          filters.value.dueType = "future";
        } else {
          filters.value.dueType = "any";
        }
      }

      // Parse priority filter
      if (whereClause.includes("priority")) {
        filters.value.priorityEnabled = true;

        // Reset all to false first
        filters.value.priorityValues.high = false;
        filters.value.priorityValues.medium = false;
        filters.value.priorityValues.low = false;

        if (
          whereClause.includes('priority = "high"') ||
          whereClause.includes("priority = 1")
        ) {
          filters.value.priorityValues.high = true;
        }

        if (
          whereClause.includes('priority = "medium"') ||
          whereClause.includes("priority = 2")
        ) {
          filters.value.priorityValues.medium = true;
        }

        if (
          whereClause.includes('priority = "low"') ||
          whereClause.includes("priority = 3")
        ) {
          filters.value.priorityValues.low = true;
        }
      }
    }

    // Parse GROUP BY part
    const groupByLine = lines.find((line) => line.startsWith("GROUP BY"));
    if (groupByLine) {
      const groupByMatch = groupByLine.match(/^GROUP BY\s+(.+)$/i);
      if (groupByMatch) {
        groupBy.value = groupByMatch[1].trim();
      }
    } else {
      groupBy.value = "";
    }

    // Parse SORT part
    const sortLine = lines.find((line) => line.startsWith("SORT"));
    if (sortLine) {
      const sortMatch = sortLine.match(/^SORT\s+(.+?)(\s+(ASC|DESC))?$/i);
      if (sortMatch) {
        let property = sortMatch[1].trim();

        // Map property names to our simplified options
        if (property === "task.text") {
          sortProperty.value = "text";
        } else if (property.includes("due")) {
          sortProperty.value = "due";
        } else if (property.includes("priority")) {
          sortProperty.value = "priority";
        } else if (property.includes("created")) {
          sortProperty.value = "created";
        } else if (property.includes("completion")) {
          sortProperty.value = "completion";
        } else if (
          property.includes("path") ||
          property.includes("file.path")
        ) {
          sortProperty.value = "path";
        } else {
          sortProperty.value = "text"; // Default
        }

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

    // Set advanced options panel state based on whether any advanced option is used
    showAdvanced.value = !!groupBy.value || !!sortLine || !!limitLine;

    // Regenerate the query to ensure it's formatted correctly
    regenerateQuery();
  } catch (error) {
    console.error("Error parsing existing query:", error);
    // If parsing fails, just generate a new default query
    regenerateQuery();
  }
}

// Event Handlers
function setTaskStatus(status: string) {
  taskStatus.value = status;
  regenerateQuery();
}

function setSourceType(type: string) {
  sourceType.value = type;
  regenerateQuery();
}

function handleSourceValueChange() {
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

  // TASK part with completion status
  if (taskStatus.value === "incomplete") {
    query += "TASK WHERE !completed";
  } else if (taskStatus.value === "complete") {
    query += "TASK WHERE completed";
  } else {
    query += "TASK";
  }
  query += "\n";

  // FROM part
  if (sourceType.value === "folder" && selectedFolder.value) {
    query += `FROM "${selectedFolder.value}"\n`;
  } else if (sourceType.value === "tag" && selectedTag.value) {
    query += `FROM #${selectedTag.value}\n`;
  } else if (sourceType.value === "current") {
    query += "FROM [[]]\n";
  } else if (sourceType.value === "all") {
    query += 'FROM ""\n';
  }

  // WHERE part (filters)
  const conditions: string[] = [];

  // Handle text filter
  if (filters.value.textEnabled && filters.value.textValue) {
    conditions.push(`contains(text, "${filters.value.textValue}")`);
  }

  // Handle due date filter
  if (filters.value.dueEnabled) {
    if (filters.value.dueType === "overdue") {
      conditions.push("due && due < date(now)");
    } else if (filters.value.dueType === "future") {
      conditions.push("due && due > date(now)");
    } else {
      conditions.push("due");
    }
  }

  // Handle priority filter
  if (filters.value.priorityEnabled) {
    const priorityConditions: string[] = [];

    if (filters.value.priorityValues.high) {
      priorityConditions.push('priority = "high"', "priority = 1");
    }

    if (filters.value.priorityValues.medium) {
      priorityConditions.push('priority = "medium"', "priority = 2");
    }

    if (filters.value.priorityValues.low) {
      priorityConditions.push('priority = "low"', "priority = 3");
    }

    if (priorityConditions.length > 0) {
      conditions.push(`(${priorityConditions.join(" OR ")})`);
    }
  }

  // Add WHERE clause if we have conditions
  if (conditions.length > 0) {
    // If we already have a WHERE clause from the TASK status
    if (taskStatus.value === "incomplete" || taskStatus.value === "complete") {
      query += `AND ${conditions.join(" AND ")}\n`;
    } else {
      query += `WHERE ${conditions.join(" AND ")}\n`;
    }
  }

  // GROUP BY part
  if (groupBy.value) {
    query += `GROUP BY ${groupBy.value}\n`;
  }

  // SORT part
  let sortField: string;
  switch (sortProperty.value) {
    case "text":
      sortField = "text";
      break;
    case "due":
      sortField = "due";
      break;
    case "priority":
      sortField = "priority";
      break;
    case "created":
      sortField = "created";
      break;
    case "completion":
      sortField = "completion";
      break;
    case "path":
      sortField = "file.path";
      break;
    default:
      sortField = "text";
  }

  query += `SORT ${sortField} ${sortDirection.value.toUpperCase()}\n`;

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
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.dataview-task-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dataview-task-editor__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.dataview-task-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Section styling */
.dataview-task-editor__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dataview-task-editor__section-header {
  margin-bottom: 4px;
}

.dataview-task-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #e2e8f0;
}

.dataview-task-editor__section-description {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

/* Task Status selection */
.dataview-task-editor__status-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.dataview-task-editor__status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.dataview-task-editor__status-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.dataview-task-editor__status-card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.dataview-task-editor__status-card-icon {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}

.dataview-task-editor__status-card-label {
  font-size: 14px;
}

/* Source selection */
.dataview-task-editor__source-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-task-editor__source-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.dataview-task-editor__source-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.dataview-task-editor__source-card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.dataview-task-editor__source-card-icon {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}

.dataview-task-editor__source-card-label {
  font-size: 14px;
}

/* Configuration Panel */
.dataview-task-editor__config-panel {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.dataview-task-editor__config-content {
  padding: 16px;
}

/* Form field groups */
.dataview-task-editor__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.dataview-task-editor__field-group:last-child {
  margin-bottom: 0;
}

.dataview-task-editor__label {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dataview-task-editor__field-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.dataview-task-editor__input-group {
  display: flex;
  gap: 8px;
}

/* Text inputs */
.dataview-task-editor__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s;
}

.dataview-task-editor__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.dataview-task-editor__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

/* Select dropdown */
.dataview-task-editor__select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.dataview-task-editor__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.dataview-task-editor__select-wrapper {
  margin-bottom: 8px;
}

/* Button styling */
.dataview-task-editor__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 38px;
  height: 38px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dataview-task-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Filters */
.dataview-task-editor__filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dataview-task-editor__filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dataview-task-editor__filter-content {
  padding-left: 26px;
  margin-top: 4px;
}

/* Priority badges */
.dataview-task-editor__priority-options {
  display: flex;
  gap: 12px;
}

.dataview-task-editor__priority-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-task-editor__priority-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.dataview-task-editor__priority-badge--high {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.dataview-task-editor__priority-badge--medium {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.dataview-task-editor__priority-badge--low {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

/* Checkbox styling */
.dataview-task-editor__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dataview-task-editor__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.dataview-task-editor__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-task-editor__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.dataview-task-editor__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

/* Radio buttons */
.dataview-task-editor__radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dataview-task-editor__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-task-editor__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.dataview-task-editor__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-task-editor__radio input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
}

.dataview-task-editor__radio-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* Advanced panel */
.dataview-task-editor__advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-task-editor__advanced-toggle:hover {
  color: #e2e8f0;
}

.dataview-task-editor__advanced-panel {
  margin-top: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Sort controls */
.dataview-task-editor__sort-property {
  margin-bottom: 12px;
}

.dataview-task-editor__sort-direction {
  margin-top: 4px;
}

/* Limit controls */
.dataview-task-editor__limit-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dataview-task-editor__limit-value {
  margin-top: 8px;
  margin-left: 26px;
}

.dataview-task-editor__number-input {
  width: 100px;
  text-align: center;
}

/* Tips section */
.dataview-task-editor__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dataview-task-editor__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dataview-task-editor__tips-content {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-task-editor__status-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-task-editor__source-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-task-editor__priority-options {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

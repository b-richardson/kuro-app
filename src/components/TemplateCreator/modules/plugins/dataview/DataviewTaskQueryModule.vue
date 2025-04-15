<!-- src/components/TemplateCreator/modules/plugins/dataview/DataviewTaskQueryModule.vue -->
<template>
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
    <div class="dv-task-builder">
      <!-- Module Header -->
      <div class="dv-task-header">
        <div class="dv-task-header-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="dv-task-header-title">Task List Builder</div>
      </div>

      <!-- Brief explanation (collapsible) -->
      <div class="dv-task-intro-wrapper">
        <button @click="showIntro = !showIntro" class="dv-task-intro-toggle">
          <i class="fas fa-info-circle"></i>
          <span>{{ showIntro ? "Hide information" : "What is this?" }}</span>
          <i
            :class="['fas', showIntro ? 'fa-chevron-up' : 'fa-chevron-down']"
          ></i>
        </button>
        <div v-if="showIntro" class="dv-task-intro">
          <p>
            This module lets you create dynamic lists of tasks from your vault,
            filtering and organizing them according to your needs.
          </p>
        </div>
      </div>

      <!-- Step 1: Task Status -->
      <div class="dv-task-section">
        <div class="dv-task-section-header">
          <span class="dv-task-step-number">1</span>
          <i class="fas fa-check-circle dv-task-section-icon"></i>
          <h3 class="dv-task-section-title">Task Status</h3>
          <span class="dv-task-section-description"
            >Which tasks to include?</span
          >
        </div>

        <div class="dv-task-section-content">
          <div class="dv-task-status-cards">
            <div
              class="dv-task-status-card"
              :class="{ active: taskStatus === 'incomplete' }"
              @click="setTaskStatus('incomplete')"
            >
              <div class="dv-task-status-icon">
                <i class="far fa-square"></i>
              </div>
              <div class="dv-task-status-info">
                <div class="dv-task-status-title">Incomplete</div>
                <div class="dv-task-status-description">
                  Tasks that haven't been checked off
                </div>
              </div>
            </div>

            <div
              class="dv-task-status-card"
              :class="{ active: taskStatus === 'complete' }"
              @click="setTaskStatus('complete')"
            >
              <div class="dv-task-status-icon">
                <i class="far fa-check-square"></i>
              </div>
              <div class="dv-task-status-info">
                <div class="dv-task-status-title">Completed</div>
                <div class="dv-task-status-description">
                  Tasks that are checked off
                </div>
              </div>
            </div>

            <div
              class="dv-task-status-card"
              :class="{ active: taskStatus === 'all' }"
              @click="setTaskStatus('all')"
            >
              <div class="dv-task-status-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="dv-task-status-info">
                <div class="dv-task-status-title">All Tasks</div>
                <div class="dv-task-status-description">
                  Both complete and incomplete tasks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Source Selection -->
      <div class="dv-task-section">
        <div class="dv-task-section-header">
          <span class="dv-task-step-number">2</span>
          <i class="fas fa-filter dv-task-section-icon"></i>
          <h3 class="dv-task-section-title">Task Source</h3>
          <span class="dv-task-section-description">Where to find tasks?</span>
        </div>

        <div class="dv-task-section-content">
          <div class="dv-task-segmented-control">
            <button
              :class="{ active: sourceType === 'all' }"
              @click="setSourceType('all')"
            >
              <i class="fas fa-globe-americas"></i> Everywhere
            </button>
            <button
              :class="{ active: sourceType === 'folder' }"
              @click="setSourceType('folder')"
            >
              <i class="fas fa-folder"></i> Folder
            </button>
            <button
              :class="{ active: sourceType === 'tag' }"
              @click="setSourceType('tag')"
            >
              <i class="fas fa-tag"></i> Tag
            </button>
            <button
              :class="{ active: sourceType === 'current' }"
              @click="setSourceType('current')"
            >
              <i class="fas fa-file"></i> Current Note
            </button>
          </div>

          <!-- Folder Selection -->
          <div
            v-if="sourceType === 'folder'"
            class="dv-task-input-wrapper dv-task-input-wrapper--select"
          >
            <i class="fas fa-folder dv-task-input-icon"></i>
            <select
              class="dv-task-select"
              v-model="selectedFolder"
              @change="handleSourceValueChange"
            >
              <option disabled value="">Select a folder...</option>
              <option value="">Root Folder ("")</option>
              <option
                v-for="folder in availableFolders"
                :key="folder.path"
                :value="folder.path"
              >
                {{ folder.path || "/" }}
              </option>
            </select>
            <button
              class="dv-task-action-btn"
              title="Refresh folder list"
              @click="fetchFolders"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>

          <!-- Tag Selection -->
          <div
            v-if="sourceType === 'tag'"
            class="dv-task-input-wrapper dv-task-input-wrapper--select"
          >
            <i class="fas fa-tag dv-task-input-icon"></i>
            <select
              class="dv-task-select"
              v-model="selectedTag"
              @change="handleSourceValueChange"
            >
              <option disabled value="">Select a tag...</option>
              <option v-for="tag in availableTags" :key="tag" :value="tag">
                #{{ tag }}
              </option>
            </select>
            <button
              class="dv-task-action-btn"
              title="Refresh tag list"
              @click="fetchTags"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>

          <!-- Current Note Message -->
          <div
            v-if="sourceType === 'current'"
            class="dv-task-current-note-message"
          >
            <i class="fas fa-info-circle"></i>
            <span
              >Tasks will be pulled from the current note when this template is
              used</span
            >
          </div>
        </div>
      </div>

      <!-- Step 3: Refinement Options -->
      <div class="dv-task-section">
        <div class="dv-task-section-header">
          <span class="dv-task-step-number">3</span>
          <i class="fas fa-search dv-task-section-icon"></i>
          <h3 class="dv-task-section-title">Refine Results</h3>
          <span class="dv-task-section-description"
            >Customize your task list</span
          >
        </div>

        <div class="dv-task-section-content">
          <!-- Filter Panel -->
          <div class="dv-task-filter-container">
            <div class="dv-task-filter-header">
              <h4>Filter Criteria</h4>
              <div class="dv-task-filter-tip">
                Choose specific criteria to narrow down your task list
              </div>
            </div>

            <div class="dv-task-filter-cards">
              <!-- Text Contains Filter -->
              <div
                class="dv-task-filter-card"
                :class="{ active: filters.textEnabled }"
              >
                <div class="dv-task-filter-card-header">
                  <label class="dv-task-toggle">
                    <input
                      type="checkbox"
                      v-model="filters.textEnabled"
                      @change="regenerateQuery"
                    />
                    <span class="dv-task-toggle-slider"></span>
                  </label>
                  <span class="dv-task-filter-title">Task Text Contains</span>
                </div>

                <div
                  v-if="filters.textEnabled"
                  class="dv-task-filter-card-content"
                >
                  <div class="dv-task-input-wrapper">
                    <i class="fas fa-font dv-task-input-icon"></i>
                    <input
                      type="text"
                      class="dv-task-input"
                      placeholder="Enter text to search for in tasks..."
                      v-model="filters.textValue"
                      @input="regenerateQuery"
                    />
                  </div>
                </div>
              </div>

              <!-- Due Date Filter -->
              <div
                class="dv-task-filter-card"
                :class="{ active: filters.dueEnabled }"
              >
                <div class="dv-task-filter-card-header">
                  <label class="dv-task-toggle">
                    <input
                      type="checkbox"
                      v-model="filters.dueEnabled"
                      @change="regenerateQuery"
                    />
                    <span class="dv-task-toggle-slider"></span>
                  </label>
                  <span class="dv-task-filter-title">Due Date</span>
                </div>

                <div
                  v-if="filters.dueEnabled"
                  class="dv-task-filter-card-content"
                >
                  <div class="dv-task-chip-selector">
                    <button
                      :class="{ active: filters.dueType === 'any' }"
                      @click="setDueType('any')"
                    >
                      Any due date
                    </button>
                    <button
                      :class="{ active: filters.dueType === 'overdue' }"
                      @click="setDueType('overdue')"
                    >
                      Overdue
                    </button>
                    <button
                      :class="{ active: filters.dueType === 'future' }"
                      @click="setDueType('future')"
                    >
                      Future
                    </button>
                  </div>
                </div>
              </div>

              <!-- Priority Filter -->
              <div
                class="dv-task-filter-card"
                :class="{ active: filters.priorityEnabled }"
              >
                <div class="dv-task-filter-card-header">
                  <label class="dv-task-toggle">
                    <input
                      type="checkbox"
                      v-model="filters.priorityEnabled"
                      @change="regenerateQuery"
                    />
                    <span class="dv-task-toggle-slider"></span>
                  </label>
                  <span class="dv-task-filter-title">Priority Level</span>
                </div>

                <div
                  v-if="filters.priorityEnabled"
                  class="dv-task-filter-card-content"
                >
                  <div class="dv-task-priority-badges">
                    <label
                      class="dv-task-priority-badge"
                      :class="{ active: filters.priorityValues.high }"
                    >
                      <input
                        type="checkbox"
                        v-model="filters.priorityValues.high"
                        @change="regenerateQuery"
                      />
                      <span class="dv-task-priority-badge-high">P1 - High</span>
                    </label>

                    <label
                      class="dv-task-priority-badge"
                      :class="{ active: filters.priorityValues.medium }"
                    >
                      <input
                        type="checkbox"
                        v-model="filters.priorityValues.medium"
                        @change="regenerateQuery"
                      />
                      <span class="dv-task-priority-badge-medium"
                        >P2 - Medium</span
                      >
                    </label>

                    <label
                      class="dv-task-priority-badge"
                      :class="{ active: filters.priorityValues.low }"
                    >
                      <input
                        type="checkbox"
                        v-model="filters.priorityValues.low"
                        @change="regenerateQuery"
                      />
                      <span class="dv-task-priority-badge-low">P3 - Low</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Organization Panel - Initially Collapsed -->
          <div class="dv-task-toggle-section">
            <button
              @click="showOrganization = !showOrganization"
              class="dv-task-toggle-section-header"
            >
              <i class="fas fa-sliders-h"></i>
              <span>Organization & Presentation</span>
              <i
                :class="[
                  'fas',
                  showOrganization ? 'fa-chevron-up' : 'fa-chevron-down',
                ]"
              ></i>
            </button>

            <div v-if="showOrganization" class="dv-task-organization-container">
              <div class="dv-task-organization-options">
                <!-- Group By Option -->
                <div class="dv-task-organization-option">
                  <label class="dv-task-label">Group tasks by:</label>
                  <div
                    class="dv-task-input-wrapper dv-task-input-wrapper--select"
                  >
                    <i class="fas fa-layer-group dv-task-input-icon"></i>
                    <select
                      class="dv-task-select"
                      v-model="groupBy"
                      @change="regenerateQuery"
                    >
                      <option value="">No grouping (flat list)</option>
                      <option value="file.path">Source File</option>
                      <option value="section">Section in File</option>
                      <option value="status">Completion Status</option>
                      <option value="due">Due Date</option>
                      <option value="priority">Priority Level</option>
                    </select>
                  </div>
                </div>

                <!-- Sort By Option -->
                <div class="dv-task-organization-option">
                  <label class="dv-task-label">Sort tasks by:</label>
                  <div
                    class="dv-task-input-wrapper dv-task-input-wrapper--select"
                  >
                    <i class="fas fa-sort dv-task-input-icon"></i>
                    <select
                      class="dv-task-select"
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

                  <div class="dv-task-direction-toggle">
                    <button
                      :class="{ active: sortDirection === 'asc' }"
                      @click="setSortDirection('asc')"
                    >
                      <i class="fas fa-sort-amount-up-alt"></i>
                      <span>A to Z / Oldest first</span>
                    </button>
                    <button
                      :class="{ active: sortDirection === 'desc' }"
                      @click="setSortDirection('desc')"
                    >
                      <i class="fas fa-sort-amount-down"></i>
                      <span>Z to A / Newest first</span>
                    </button>
                  </div>
                </div>

                <!-- Limit Option -->
                <div class="dv-task-organization-option">
                  <div class="dv-task-field-group dv-task-field-group--inline">
                    <label class="dv-task-toggle">
                      <input
                        type="checkbox"
                        v-model="useLimit"
                        @change="handleLimitChange"
                      />
                      <span class="dv-task-toggle-slider"></span>
                    </label>
                    <span
                      class="dv-task-toggle-label"
                      :class="{ 'dv-task-toggle-label--disabled': !useLimit }"
                    >
                      Limit the number of tasks shown
                    </span>
                  </div>

                  <div
                    v-if="useLimit"
                    class="dv-task-input-wrapper dv-task-limit-input"
                  >
                    <i class="fas fa-calculator dv-task-input-icon"></i>
                    <input
                      type="number"
                      class="dv-task-input dv-task-input--numeric"
                      v-model.number="limitCount"
                      min="1"
                      max="1000"
                      @change="handleLimitChange"
                    />
                    <span class="dv-task-input-suffix">tasks maximum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview & Help Section - Initially Collapsed -->
      <div class="dv-task-toggle-section dv-task-toggle-section--preview">
        <button
          @click="showPreview = !showPreview"
          class="dv-task-toggle-section-header"
        >
          <i class="fas fa-eye"></i>
          <span>Preview & Tips</span>
          <i
            :class="['fas', showPreview ? 'fa-chevron-up' : 'fa-chevron-down']"
          ></i>
        </button>

        <div v-if="showPreview" class="dv-task-preview-section">
          <div class="dv-task-preview-illustration">
            <div class="dv-task-preview-task">
              <span class="dv-task-preview-checkbox"
                ><i class="far fa-square"></i
              ></span>
              <span class="dv-task-preview-content"
                >Example incomplete task</span
              >
            </div>
            <div class="dv-task-preview-task" v-if="taskStatus !== 'complete'">
              <span class="dv-task-preview-checkbox"
                ><i class="far fa-square"></i
              ></span>
              <span class="dv-task-preview-content"
                >Task with a <span class="dv-task-preview-tag">#tag</span></span
              >
            </div>
            <div
              class="dv-task-preview-task"
              v-if="taskStatus !== 'incomplete' || filters.priorityEnabled"
            >
              <span class="dv-task-preview-checkbox"
                ><i class="far fa-check-square"></i
              ></span>
              <span class="dv-task-preview-content"
                >Completed task with
                <span class="dv-task-preview-priority">P1</span></span
              >
            </div>
            <div class="dv-task-preview-task" v-if="taskStatus !== 'complete'">
              <span class="dv-task-preview-checkbox"
                ><i class="far fa-square"></i
              ></span>
              <span class="dv-task-preview-content"
                >Due task
                <span class="dv-task-preview-due">📅 2023-12-31</span></span
              >
            </div>
          </div>

          <div class="dv-task-preview-info">
            <p>
              When inserted, this module will create a dynamic task list based
              on your configuration. Tasks will update as they're completed or
              modified elsewhere in your vault.
            </p>
            <p>
              <strong>Tips:</strong> Tasks can have priorities (P1, P2, P3) and
              due dates (📅 YYYY-MM-DD) included in their text.
            </p>
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

// UI toggle states
const showIntro = ref(false);
const showOrganization = ref(false);
const showPreview = ref(false);

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
const useLimit = ref(true);
const limitCount = ref(5);

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

    // Check if there are any advanced settings in use
    showOrganization.value =
      !!groupBy.value ||
      sortProperty.value !== "text" ||
      sortDirection.value !== "asc" ||
      useLimit.value;
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

    // Set organization panel state based on whether advanced options are used
    showOrganization.value =
      !!groupBy.value ||
      sortProperty.value !== "text" ||
      sortDirection.value !== "asc" ||
      useLimit.value;

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

function setDueType(type: string) {
  filters.value.dueType = type;
  regenerateQuery();
}

function setSortDirection(direction: "asc" | "desc") {
  sortDirection.value = direction;
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
/* --- Base & Dark Glassmorphism --- */
.dv-task-builder {
  width: 100%;
  background: rgba(21, 26, 36, 0.7);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  color: var(--text-normal-dark, #e1e1e6);
  font-family: var(--font-interface, sans-serif);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* --- Header --- */
.dv-task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-title-dark, #ffffff);
}

.dv-task-header-icon {
  font-size: 20px;
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-task-header-title {
  font-size: 18px;
  font-weight: 600;
}

/* --- Intro (Collapsible) --- */
.dv-task-intro-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dv-task-intro-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.dv-task-intro-toggle:hover {
  background: rgba(59, 130, 246, 0.15);
}

.dv-task-intro-toggle i:last-child {
  font-size: 10px;
  margin-left: auto;
}

.dv-task-intro {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  padding: 12px 15px;
  color: #a0c0ff;
  font-size: 14px;
  line-height: 1.5;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dv-task-intro p {
  margin: 0;
}

/* --- Sections --- */
.dv-task-section {
  background: rgba(30, 36, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 18px;
  transition: box-shadow 0.2s ease-in-out;
}

.dv-task-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text-title-dark, #f0f0f5);
}

.dv-task-step-number {
  background-color: var(--interactive-accent-light, #60a5fa);
  color: var(--text-on-accent, #111);
  font-size: 11px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dv-task-section-icon {
  font-size: 16px;
  color: var(--icon-color-dark, #94a3b8);
}

.dv-task-section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex-grow: 1;
}

.dv-task-section-description {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: auto;
  padding-left: 10px;
}

.dv-task-section-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* --- Status Cards --- */
.dv-task-status-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dv-task-status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 15px;
  background: rgba(15, 20, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dv-task-status-card:hover {
  background: rgba(50, 60, 80, 0.3);
}

.dv-task-status-card.active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
}

.dv-task-status-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  color: #60a5fa;
  font-size: 18px;
  flex-shrink: 0;
}

.dv-task-status-info {
  flex-grow: 1;
}

.dv-task-status-title {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 4px;
}

.dv-task-status-description {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
}

/* --- Segmented Control --- */
.dv-task-segmented-control {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
}

.dv-task-segmented-control button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-muted-dark, #94a3b8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.dv-task-segmented-control button.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dv-task-segmented-control button i {
  font-size: 13px;
}

/* --- Inputs & Selects --- */
.dv-task-input,
.dv-task-select {
  padding: 9px 12px;
  background: rgba(15, 20, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-normal-dark, #e1e1e6);
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease-in-out;
}

.dv-task-input:focus,
.dv-task-select:focus {
  outline: none;
  border-color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
  background: rgba(30, 36, 50, 0.9);
}

.dv-task-input::placeholder {
  color: var(--text-faint-dark, #717a8a);
}

.dv-task-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 35px;
}

.dv-task-input--numeric {
  width: 100px;
  text-align: center;
}

.dv-task-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dv-task-input-wrapper--field .dv-task-input,
.dv-task-input-wrapper--select .dv-task-select {
  padding-left: 34px;
  flex-grow: 1;
}

.dv-task-input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-color-dark, #94a3b8);
  font-size: 13px;
  pointer-events: none;
}

.dv-task-input-suffix {
  font-size: 14px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: 5px;
}

.dv-task-limit-input {
  margin-left: 30px;
}

/* --- Action Button --- */
.dv-task-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dv-task-action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.dv-task-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dv-task-action-btn i {
  font-size: 13px;
}

/* --- Current Note Message --- */
.dv-task-current-note-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: var(--text-muted-dark, #94a3b8);
  font-size: 13px;
}

.dv-task-current-note-message i {
  color: var(--interactive-accent-light, #60a5fa);
}

/* --- Filter Cards --- */
.dv-task-filter-container {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.dv-task-filter-header {
  margin-bottom: 12px;
}

.dv-task-filter-header h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 500;
}

.dv-task-filter-tip {
  color: var(--text-muted-dark, #94a3b8);
  font-size: 12px;
}

.dv-task-filter-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dv-task-filter-card {
  background: rgba(15, 20, 30, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
}

.dv-task-filter-card.active {
  border-color: rgba(96, 165, 250, 0.2);
  background: rgba(15, 20, 30, 0.5);
}

.dv-task-filter-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.dv-task-filter-title {
  font-weight: 500;
  font-size: 14px;
}

.dv-task-filter-card-content {
  padding: 12px 15px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* --- Toggle Switch --- */
.dv-task-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.dv-task-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dv-task-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: 0.3s;
  border-radius: 22px;
}

.dv-task-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #ccc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 50%;
}

.dv-task-toggle input:checked + .dv-task-toggle-slider {
  background-color: var(--interactive-accent-light, #60a5fa);
  border-color: var(--interactive-accent-light, #60a5fa);
}

.dv-task-toggle input:focus-visible + .dv-task-toggle-slider {
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
}

.dv-task-toggle input:checked + .dv-task-toggle-slider:before {
  transform: translateX(18px);
  background-color: #fff;
}

.dv-task-toggle-label {
  font-size: 14px;
  color: var(--text-normal-dark, #e1e1e6);
  cursor: pointer;
  transition: color 0.2s;
}

.dv-task-toggle-label--disabled {
  color: var(--text-faint-dark, #717a8a);
}

/* --- Chip Selector --- */
.dv-task-chip-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dv-task-chip-selector button {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dv-task-chip-selector button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dv-task-chip-selector button.active {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
  color: var(--interactive-accent-light, #60a5fa);
}

/* --- Priority Badges --- */
.dv-task-priority-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dv-task-priority-badge {
  position: relative;
  cursor: pointer;
}

.dv-task-priority-badge input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.dv-task-priority-badge span {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dv-task-priority-badge-high {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.dv-task-priority-badge-medium {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.dv-task-priority-badge-low {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.dv-task-priority-badge.active .dv-task-priority-badge-high {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.dv-task-priority-badge.active .dv-task-priority-badge-medium {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.3);
}

.dv-task-priority-badge.active .dv-task-priority-badge-low {
  background: rgba(52, 211, 153, 0.2);
  border-color: rgba(52, 211, 153, 0.3);
}

/* --- Toggle Sections --- */
.dv-task-toggle-section {
  border-radius: 8px;
  overflow: hidden;
  background: rgba(30, 36, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dv-task-toggle-section--preview {
  background: rgba(15, 23, 42, 0.3);
}

.dv-task-toggle-section-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px 18px;
  border: none;
  background: transparent;
  text-align: left;
  color: var(--text-normal-dark, #e1e1e6);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 10px;
}

.dv-task-toggle-section-header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.dv-task-toggle-section-header i:first-child {
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-task-toggle-section-header i:last-child {
  margin-left: auto;
  color: var(--text-muted-dark, #94a3b8);
  font-size: 12px;
  transition: transform 0.2s;
}

.dv-task-toggle-section-header i.fa-chevron-up {
  transform: rotate(180deg);
}

/* --- Organization Section --- */
.dv-task-organization-container {
  padding: 15px 18px;
  animation: slideDown 0.3s ease-out;
}

.dv-task-organization-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dv-task-organization-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dv-task-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-task-field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dv-task-field-group--inline {
  flex-direction: row;
  align-items: center;
}

/* --- Direction Toggle --- */
.dv-task-direction-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 5px;
}

.dv-task-direction-toggle button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text-muted-dark, #94a3b8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dv-task-direction-toggle button.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-task-direction-toggle button i {
  font-size: 13px;
}

/* --- Preview Section --- */
.dv-task-preview-section {
  padding: 15px 18px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: slideDown 0.3s ease-out;
}

.dv-task-preview-illustration {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dv-task-preview-task {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.dv-task-preview-checkbox {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 16px;
}

.dv-task-preview-content {
  line-height: 1.4;
}

.dv-task-preview-tag {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}

.dv-task-preview-priority {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.dv-task-preview-due {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}

.dv-task-preview-info {
  color: var(--text-muted-dark, #94a3b8);
  font-size: 13px;
  line-height: 1.5;
}

.dv-task-preview-info p {
  margin: 0 0 8px 0;
}

.dv-task-preview-info p:last-child {
  margin-bottom: 0;
}

.dv-task-preview-info strong {
  color: var(--text-normal-dark, #e1e1e6);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .dv-task-segmented-control {
    flex-wrap: wrap;
  }

  .dv-task-segmented-control button {
    flex-basis: 50%;
  }

  .dv-task-section-description {
    display: none;
  }

  .dv-task-direction-toggle {
    flex-direction: column;
    gap: 2px;
  }

  .dv-task-field-group--inline {
    flex-direction: column;
    align-items: flex-start;
  }

  .dv-task-limit-input {
    margin-left: 0;
  }

  .dv-task-priority-badges {
    flex-direction: column;
  }
}
</style>

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
    ref="baseModuleRef"
  >
    <div class="dv-cal-builder">
      <!-- Module Header -->
      <div class="dv-cal-header">
        <div class="dv-cal-header-icon">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="dv-cal-header-title">Calendar View</div>
      </div>

      <!-- Step 1: Date Field -->
      <div class="dv-cal-section dv-cal-section--date">
        <div class="dv-cal-section-header">
          <span class="dv-cal-step-number">1</span>
          <i class="fas fa-calendar-day dv-cal-section-icon"></i>
          <h3 class="dv-cal-section-title">Date Field</h3>
          <span class="dv-cal-section-description"
            >Which date places notes on the calendar?</span
          >
        </div>
        <div class="dv-cal-section-content">
          <div class="dv-cal-field-group">
            <div class="dv-cal-segmented-control">
              <button
                :class="{ active: dateField === 'file.ctime' }"
                @click="setDateField('file.ctime')"
              >
                <i class="fas fa-plus-circle"></i> Created
              </button>
              <button
                :class="{ active: dateField === 'file.mtime' }"
                @click="setDateField('file.mtime')"
              >
                <i class="fas fa-edit"></i> Modified
              </button>
              <button
                :class="{ active: dateField === 'custom' }"
                @click="setDateField('custom')"
              >
                <i class="fas fa-sliders-h"></i> Custom
              </button>
            </div>
            <div
              v-if="dateField === 'custom'"
              class="dv-cal-input-wrapper dv-cal-input-wrapper--field"
            >
              <i class="fas fa-sliders-h dv-cal-input-icon"></i>
              <input
                type="text"
                class="dv-cal-input"
                placeholder="Enter property name (e.g., due, deadline)"
                v-model="customDateField"
                @input="handleDateFieldChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Source -->
      <div class="dv-cal-section dv-cal-section--source">
        <div class="dv-cal-section-header">
          <span class="dv-cal-step-number">2</span>
          <i class="fas fa-filter dv-cal-section-icon"></i>
          <h3 class="dv-cal-section-title">Source Notes</h3>
          <span class="dv-cal-section-description"
            >Where to find notes to display?</span
          >
        </div>
        <div class="dv-cal-section-content">
          <div class="dv-cal-field-group">
            <div class="dv-cal-segmented-control">
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
                <i class="fas fa-folder"></i> In Folder
              </button>
              <button
                :class="{ active: sourceType === 'tag' }"
                @click="setSourceType('tag')"
              >
                <i class="fas fa-tag"></i> With Tag
              </button>
            </div>

            <!-- Folder Selection -->
            <div
              v-if="sourceType === 'folder'"
              class="dv-cal-input-wrapper dv-cal-input-wrapper--select"
            >
              <i class="fas fa-folder dv-cal-input-icon"></i>
              <select
                class="dv-cal-select"
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
                class="dv-cal-action-btn dv-cal-action-btn--refresh"
                title="Refresh folder list"
                @click="fetchFolders"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>

            <!-- Tag Selection -->
            <div
              v-if="sourceType === 'tag'"
              class="dv-cal-input-wrapper dv-cal-input-wrapper--select"
            >
              <i class="fas fa-tag dv-cal-input-icon"></i>
              <select
                class="dv-cal-select"
                v-model="selectedTag"
                @change="handleSourceValueChange"
              >
                <option disabled value="">Select a tag...</option>
                <option v-for="tag in availableTags" :key="tag" :value="tag">
                  #{{ tag }}
                </option>
              </select>
              <button
                class="dv-cal-action-btn dv-cal-action-btn--refresh"
                title="Refresh tag list"
                @click="fetchTags"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Date Range (Optional Filter) -->
      <div class="dv-cal-section dv-cal-section--range">
        <div
          class="dv-cal-section-header dv-cal-section-header--toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span class="dv-cal-step-number dv-cal-step-number--optional">?</span>
          <i class="fas fa-calendar-check dv-cal-section-icon"></i>
          <h3 class="dv-cal-section-title">Filter & Display Options</h3>
          <i
            :class="[
              'fas',
              showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down',
              'dv-cal-section-toggle-icon',
            ]"
          ></i>
        </div>

        <transition name="dv-cal-collapse">
          <div
            v-if="showAdvanced"
            class="dv-cal-section-content dv-cal-section-content--collapsible"
          >
            <!-- Date Filter -->
            <div class="dv-cal-field-group">
              <div class="dv-cal-field-group--inline">
                <label class="dv-cal-toggle">
                  <input
                    type="checkbox"
                    v-model="dateFilter.enabled"
                    @change="handleDateFilterChange"
                  />
                  <span class="dv-cal-toggle-slider"></span>
                </label>
                <span
                  class="dv-cal-toggle-label"
                  :class="{
                    'dv-cal-toggle-label--disabled': !dateFilter.enabled,
                  }"
                >
                  Only show notes within a specific date range
                </span>
              </div>

              <div v-if="dateFilter.enabled" class="dv-cal-date-range-inputs">
                <div class="dv-cal-input-wrapper">
                  <label
                    for="cal-start-date"
                    class="dv-cal-label dv-cal-label--inline"
                    >Start:</label
                  >
                  <input
                    id="cal-start-date"
                    type="date"
                    class="dv-cal-input dv-cal-input--date"
                    v-model="dateFilter.startDate"
                    @change="handleDateFilterChange"
                  />
                </div>
                <div class="dv-cal-input-wrapper">
                  <label
                    for="cal-end-date"
                    class="dv-cal-label dv-cal-label--inline"
                    >End:</label
                  >
                  <input
                    id="cal-end-date"
                    type="date"
                    class="dv-cal-input dv-cal-input--date"
                    v-model="dateFilter.endDate"
                    @change="handleDateFilterChange"
                  />
                </div>
              </div>
              <div v-if="dateFilter.enabled" class="dv-cal-field-tip">
                Leave start or end blank to filter only before or after a date.
              </div>
            </div>

            <!-- Display Options -->
            <div class="dv-cal-field-group">
              <div class="dv-cal-field-group--inline">
                <label class="dv-cal-toggle">
                  <input
                    type="checkbox"
                    v-model="displayOptions.showAsText"
                    @change="handleDisplayOptionsChange"
                  />
                  <span class="dv-cal-toggle-slider"></span>
                </label>
                <span
                  class="dv-cal-toggle-label"
                  :class="{
                    'dv-cal-toggle-label--disabled': !displayOptions.showAsText,
                  }"
                >
                  Show as text (instead of links)
                </span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Calendar Preview Information (Collapsible) -->
      <div class="dv-cal-section dv-cal-section--tips">
        <div
          class="dv-cal-section-header dv-cal-section-header--toggle"
          @click="showTips = !showTips"
        >
          <i class="fas fa-lightbulb dv-cal-section-icon"></i>
          <h3 class="dv-cal-section-title">About Calendar View</h3>
          <i
            :class="[
              'fas',
              showTips ? 'fa-chevron-up' : 'fa-chevron-down',
              'dv-cal-section-toggle-icon',
            ]"
          ></i>
        </div>

        <transition name="dv-cal-collapse">
          <div
            v-if="showTips"
            class="dv-cal-section-content dv-cal-section-content--collapsible"
          >
            <div class="dv-cal-tips-content">
              <p>
                This creates a monthly calendar view showing your notes on their
                corresponding dates. Notes will appear on the date matching the
                selected date field.
              </p>
              <p>
                The calendar will be generated when this template is inserted
                into your note.
              </p>
            </div>
          </div>
        </transition>
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

const showTips = ref(false); // Default to collapsed

// Reference to the base module component
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);

// Advanced toggle
const showAdvanced = ref(false);

// Date Field selection
const dateField = ref("file.ctime"); // 'file.ctime', 'file.mtime', 'custom'
const customDateField = ref("");

// Source selection
const sourceType = ref("all");
const selectedFolder = ref("");
const selectedTag = ref("");

// Date Filter
const dateFilter = ref({
  enabled: false,
  range: "future", // 'future', 'past', 'custom'
  startDate: "",
  endDate: "",
});

// Display Options
const displayOptions = ref({
  showAsText: false, // If true, uses as:text in the query
});

// Obsidian data
const availableFolders = ref<{ name: string; path: string; parent: string }[]>([
  { name: "Root", path: "", parent: "" },
]);
const availableTags = ref<string[]>([]);

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
    console.error("Error initializing DataviewCalendarModule:", error);
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

    // Basic parsing for CALENDAR queries
    // This is a simplified parser that won't handle all possible Dataview syntax
    const lines = cleanQuery.split("\n").map((line) => line.trim());

    // Parse CALENDAR part for date field
    const calendarLine = lines[0];
    if (calendarLine.startsWith("CALENDAR")) {
      const fieldPart = calendarLine.replace(/^CALENDAR\s+/, "").trim();

      // Determine the date field
      if (fieldPart === "file.ctime") {
        dateField.value = "file.ctime";
      } else if (fieldPart === "file.mtime") {
        dateField.value = "file.mtime";
      } else {
        dateField.value = "custom";
        customDateField.value = fieldPart;
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

    // Parse WHERE part for date filters and display options
    const whereLine = lines.find((line) => line.startsWith("WHERE"));
    if (whereLine) {
      const whereClause = whereLine.replace(/^WHERE\s+/, "").trim();

      // Check for date filters
      if (whereClause.includes("date(now)")) {
        dateFilter.value.enabled = true;

        if (whereClause.includes(">") && !whereClause.includes("<")) {
          dateFilter.value.range = "future";
        } else if (whereClause.includes("<") && !whereClause.includes(">")) {
          dateFilter.value.range = "past";
        } else if (whereClause.includes("between")) {
          dateFilter.value.range = "custom";

          // Try to extract custom date range
          const dateRangeMatch = whereClause.match(
            /between\s+date\("([^"]+)"\)\s+and\s+date\("([^"]+)"\)/i
          );
          if (dateRangeMatch) {
            dateFilter.value.startDate = dateRangeMatch[1];
            dateFilter.value.endDate = dateRangeMatch[2];
          }
        }
      }

      // Check for display options
      displayOptions.value.showAsText = whereClause.includes("as:text");
    }

    // Set advanced options panel state
    showAdvanced.value =
      dateFilter.value.enabled || displayOptions.value.showAsText;

    // Regenerate the query to ensure it's formatted correctly
    regenerateQuery();
  } catch (error) {
    console.error("Error parsing existing query:", error);
    // If parsing fails, just generate a new default query
    regenerateQuery();
  }
}

// Event Handlers
function setDateField(field: string) {
  dateField.value = field;
  regenerateQuery();
}

function handleDateFieldChange() {
  regenerateQuery();
}

function setSourceType(type: string) {
  sourceType.value = type;
  regenerateQuery();
}

function handleSourceValueChange() {
  regenerateQuery();
}

function handleDateFilterChange() {
  regenerateQuery();
}

function handleDisplayOptionsChange() {
  regenerateQuery();
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // CALENDAR part with date field
  if (dateField.value === "custom" && customDateField.value) {
    query += `CALENDAR ${customDateField.value}`;
  } else {
    query += `CALENDAR ${dateField.value}`;
  }
  query += "\n";

  // FROM part
  if (sourceType.value === "folder" && selectedFolder.value) {
    query += `FROM "${selectedFolder.value}"\n`;
  } else if (sourceType.value === "tag" && selectedTag.value) {
    query += `FROM #${selectedTag.value}\n`;
  } else if (sourceType.value === "all") {
    query += 'FROM ""\n';
  }

  // WHERE part for date filters and display options
  const conditions: string[] = [];

  // Date filter conditions
  if (dateFilter.value.enabled) {
    const dateFieldName = getActualDateField();

    if (dateFilter.value.range === "future") {
      conditions.push(`${dateFieldName} > date(now)`);
    } else if (dateFilter.value.range === "past") {
      conditions.push(`${dateFieldName} < date(now)`);
    } else if (
      dateFilter.value.range === "custom" &&
      dateFilter.value.startDate &&
      dateFilter.value.endDate
    ) {
      conditions.push(
        `${dateFieldName} between date("${dateFilter.value.startDate}") and date("${dateFilter.value.endDate}")`
      );
    } else if (dateFilter.value.startDate) {
      conditions.push(
        `${dateFieldName} >= date("${dateFilter.value.startDate}")`
      );
    } else if (dateFilter.value.endDate) {
      conditions.push(
        `${dateFieldName} <= date("${dateFilter.value.endDate}")`
      );
    }
  }

  // Display options
  if (displayOptions.value.showAsText) {
    conditions.push("as:text");
  }

  // Add WHERE clause if we have conditions
  if (conditions.length > 0) {
    query += `WHERE ${conditions.join(" AND ")}\n`;
  }

  query += "```";
  return query;
}

// Helper to get the actual date field name for the WHERE clause
function getActualDateField(): string {
  if (dateField.value === "custom" && customDateField.value) {
    return customDateField.value;
  } else {
    return dateField.value;
  }
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
.dv-cal-builder {
  width: 100%;
  /* Dark glassmorphism base */
  background: rgba(21, 26, 36, 0.7); /* Dark semi-transparent */
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1); /* Light border */
  border-radius: 12px;
  padding: 20px;
  color: var(--text-normal-dark, #e1e1e6); /* Light text */
  font-family: var(--font-interface, sans-serif);
  display: flex;
  flex-direction: column;
  gap: 20px; /* Slightly reduced gap */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* --- Header --- */
.dv-cal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-title-dark, #ffffff);
}

.dv-cal-header-icon {
  font-size: 20px;
  color: var(--interactive-accent-light, #60a5fa); /* Bright accent */
}

.dv-cal-header-title {
  font-size: 18px;
  font-weight: 600;
}

/* --- Sections --- */
.dv-cal-section {
  background: rgba(30, 36, 50, 0.6); /* Darker section background */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 18px;
  transition: box-shadow 0.2s ease-in-out;
}

.dv-cal-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text-title-dark, #f0f0f5);
}
.dv-cal-section-header--toggle {
  cursor: pointer;
  margin-bottom: 0; /* Remove bottom margin when toggleable */
  transition: background-color 0.15s ease-out;
  border-radius: 6px;
  padding: 5px 8px;
  margin: -5px -8px 10px -8px; /* Adjust padding/margin to make clickable area nice */
}
.dv-cal-section-header--toggle:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.dv-cal-step-number {
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
.dv-cal-step-number--optional {
  background-color: rgba(148, 163, 184, 0.5); /* Grey for optional */
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-cal-section-icon {
  font-size: 16px;
  color: var(--icon-color-dark, #94a3b8); /* Muted light icon color */
}

.dv-cal-section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex-grow: 1; /* Allow title to take space */
}
.dv-cal-section-description {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: auto; /* Push description to the right */
  padding-left: 10px;
}
.dv-cal-section-toggle-icon {
  margin-left: auto;
  color: var(--icon-color-dark, #94a3b8);
  transition: transform 0.3s ease;
}
.dv-cal-section-header--toggle i.fa-chevron-up {
  transform: rotate(0); /* Correct the rotation logic */
}
/* When section is collapsed, rotate the chevron to point down */
.dv-cal-section-header--toggle i.fa-chevron-down {
  transform: rotate(0); /* No rotation needed - icon already points down */
}

.dv-cal-section-content {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Consistent gap */
}
/* Add transition animation to collapsible sections */
/* Base styling for collapsible content - keep this */
.dv-cal-section-content--collapsible {
  padding-top: 15px;
  transform-origin: top;
}

/* Create a v-enter/v-leave animation setup */
.dv-cal-collapse-enter-active,
.dv-cal-collapse-leave-active {
  transition: max-height 0.4s ease, opacity 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.dv-cal-collapse-enter-from,
.dv-cal-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.dv-cal-collapse-enter-to,
.dv-cal-collapse-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* --- Field Groups & Labels --- */
.dv-cal-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dv-cal-field-group--inline {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.dv-cal-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted-dark, #94a3b8);
}
.dv-cal-label--inline {
  white-space: nowrap;
}

.dv-cal-field-tip {
  font-size: 12px;
  color: var(--text-faint-dark, #717a8a);
  padding-left: 5px;
}

/* --- Inputs & Selects --- */
.dv-cal-input,
.dv-cal-select {
  padding: 9px 12px;
  background: rgba(15, 20, 30, 0.7); /* Darker input background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-normal-dark, #e1e1e6);
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease-in-out;
}
.dv-cal-input:focus,
.dv-cal-select:focus {
  outline: none;
  border-color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
  background: rgba(30, 36, 50, 0.9);
}
.dv-cal-input::placeholder {
  color: var(--text-faint-dark, #717a8a);
}
.dv-cal-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 35px;
}
.dv-cal-input--date {
  min-width: 150px; /* Give date inputs some space */
  flex-grow: 1;
}
.dv-cal-input--date::-webkit-calendar-picker-indicator {
  filter: invert(0.8); /* Make picker icon lighter on dark background */
  cursor: pointer;
}

.dv-cal-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px; /* Gap between icon/input/button */
}
.dv-cal-input-wrapper--field .dv-cal-input,
.dv-cal-input-wrapper--select .dv-cal-select {
  padding-left: 34px; /* Space for icon */
  flex-grow: 1; /* Allow input/select to grow */
}
.dv-cal-input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-color-dark, #94a3b8);
  font-size: 13px;
  pointer-events: none; /* Don't interfere with clicks */
}

/* --- Action Button (Refresh) --- */
.dv-cal-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 36px; /* Match input height */
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.dv-cal-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.dv-cal-action-btn i {
  font-size: 13px;
}

/* --- Segmented Controls --- */
.dv-cal-segmented-control {
  display: flex; /* Changed to flex */
  background: rgba(0, 0, 0, 0.2); /* Darker base */
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%; /* Make it take full width */
}
.dv-cal-segmented-control button {
  flex: 1; /* Make buttons share width equally */
  padding: 7px 12px; /* Slightly more padding */
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
.dv-cal-segmented-control button.active {
  background: rgba(255, 255, 255, 0.1); /* Subtle light active state */
  color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.dv-cal-segmented-control button i {
  font-size: 13px; /* Slightly larger icons */
}

/* --- Date Range --- */
.dv-cal-date-range-inputs {
  display: flex;
  gap: 12px; /* Reduced gap between date inputs */
  margin-top: 10px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  max-width: 95%; /* Prevent overflow */
}

/* Custom Toggle Switch */
.dv-cal-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0; /* Prevent toggle from shrinking */
}
.dv-cal-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.dv-cal-toggle-slider {
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
.dv-cal-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #ccc; /* Lighter grey knob */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 50%;
}
.dv-cal-toggle input:checked + .dv-cal-toggle-slider {
  background-color: var(--interactive-accent-light, #60a5fa);
  border-color: var(--interactive-accent-light, #60a5fa);
}
.dv-cal-toggle input:focus-visible + .dv-cal-toggle-slider {
  /* Use focus-visible */
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
}
.dv-cal-toggle input:checked + .dv-cal-toggle-slider:before {
  transform: translateX(18px);
  background-color: #fff; /* White knob when active */
}
.dv-cal-toggle-label {
  font-size: 14px;
  color: var(--text-normal-dark, #e1e1e6);
  cursor: pointer; /* Make label clickable too */
  transition: color 0.2s;
}
.dv-cal-toggle-label--disabled {
  color: var(--text-faint-dark, #717a8a);
}

/* Tips section */
.dv-cal-tips {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
}

.dv-cal-tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--interactive-accent-light, #60a5fa);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dv-cal-tips-content {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  line-height: 1.5;
}

.dv-cal-tips-content p {
  margin: 0 0 8px 0;
}

.dv-cal-tips-content p:last-child {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .dv-cal-segmented-control {
    flex-wrap: wrap; /* Allow wrapping on small screens */
  }
  .dv-cal-segmented-control button {
    flex-basis: 50%; /* Two buttons per row */
  }
  .dv-cal-date-range-inputs {
    flex-direction: column;
    gap: 10px;
  }
  .dv-cal-section-description {
    display: none; /* Hide description on small screens */
  }
}
</style>

<template>
  <!-- 
  IMPORTANT NOTE FOR DEVELOPERS:
  - This component should NOT implement any connection checks to Obsidian
  - This component should NOT display any toast messages
  - All connection validation and user feedback should be handled by parent components
  - Keep this component focused solely on building Dataview calendar queries
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
    <div class="dataview-calendar-editor">
      <!-- Module Header -->
      <div class="dataview-calendar-editor__header">
        <div class="dataview-calendar-editor__header-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="dataview-calendar-editor__header-title">
          Dataview Calendar
        </div>
      </div>

      <!-- Date Field Section -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-calendar-day"></i>
            <span>Date Field</span>
          </div>
          <div class="dataview-calendar-editor__section-description">
            Choose which date property to display on the calendar
          </div>
        </div>

        <div class="dataview-calendar-editor__date-selector">
          <button
            class="dataview-calendar-editor__date-card"
            :class="{
              'dataview-calendar-editor__date-card--active':
                dateField === 'file.day',
            }"
            @click="setDateField('file.day')"
          >
            <div class="dataview-calendar-editor__date-card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="dataview-calendar-editor__date-card-label">
              Note Date
            </div>
            <div class="dataview-calendar-editor__date-card-description">
              Use the date from each note's frontmatter
            </div>
          </button>

          <button
            class="dataview-calendar-editor__date-card"
            :class="{
              'dataview-calendar-editor__date-card--active':
                dateField === 'due',
            }"
            @click="setDateField('due')"
          >
            <div class="dataview-calendar-editor__date-card-icon">
              <i class="fas fa-hourglass-end"></i>
            </div>
            <div class="dataview-calendar-editor__date-card-label">
              Due Date
            </div>
            <div class="dataview-calendar-editor__date-card-description">
              Use the due date property from each note
            </div>
          </button>

          <button
            class="dataview-calendar-editor__date-card"
            :class="{
              'dataview-calendar-editor__date-card--active':
                dateField === 'date',
            }"
            @click="setDateField('date')"
          >
            <div class="dataview-calendar-editor__date-card-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="dataview-calendar-editor__date-card-label">
              Event Date
            </div>
            <div class="dataview-calendar-editor__date-card-description">
              Use the date property from each note
            </div>
          </button>

          <button
            class="dataview-calendar-editor__date-card"
            :class="{
              'dataview-calendar-editor__date-card--active':
                dateField === 'custom',
            }"
            @click="setDateField('custom')"
          >
            <div class="dataview-calendar-editor__date-card-icon">
              <i class="fas fa-cog"></i>
            </div>
            <div class="dataview-calendar-editor__date-card-label">
              Custom Field
            </div>
            <div class="dataview-calendar-editor__date-card-description">
              Use a custom date property
            </div>
          </button>
        </div>

        <!-- Custom Date Field Selection -->
        <div
          v-if="dateField === 'custom'"
          class="dataview-calendar-editor__config-panel"
        >
          <div class="dataview-calendar-editor__config-content">
            <div class="dataview-calendar-editor__field-group">
              <label class="dataview-calendar-editor__label"
                >Custom Date Property</label
              >
              <div class="dataview-calendar-editor__input-group">
                <input
                  type="text"
                  class="dataview-calendar-editor__text-input"
                  placeholder="e.g., deadline, start, created"
                  v-model="customDateField"
                  @input="handleDateFieldChange"
                />
              </div>
              <div class="dataview-calendar-editor__field-tip">
                Enter the frontmatter property that contains date information
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Source Selection Section -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-filter"></i>
            <span>Choose Source</span>
          </div>
          <div class="dataview-calendar-editor__section-description">
            Select which notes to display on the calendar
          </div>
        </div>

        <div class="dataview-calendar-editor__source-selector">
          <button
            class="dataview-calendar-editor__source-card"
            :class="{
              'dataview-calendar-editor__source-card--active':
                sourceType === 'all',
            }"
            @click="setSourceType('all')"
          >
            <div class="dataview-calendar-editor__source-card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="dataview-calendar-editor__source-card-label">
              All Notes
            </div>
          </button>

          <button
            class="dataview-calendar-editor__source-card"
            :class="{
              'dataview-calendar-editor__source-card--active':
                sourceType === 'folder',
            }"
            @click="setSourceType('folder')"
          >
            <div class="dataview-calendar-editor__source-card-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="dataview-calendar-editor__source-card-label">
              From Folder
            </div>
          </button>

          <button
            class="dataview-calendar-editor__source-card"
            :class="{
              'dataview-calendar-editor__source-card--active':
                sourceType === 'tag',
            }"
            @click="setSourceType('tag')"
          >
            <div class="dataview-calendar-editor__source-card-icon">
              <i class="fas fa-hashtag"></i>
            </div>
            <div class="dataview-calendar-editor__source-card-label">
              With Tag
            </div>
          </button>
        </div>

        <!-- Configuration Panel -->
        <div class="dataview-calendar-editor__config-panel">
          <!-- Folder Selection -->
          <div
            v-if="sourceType === 'folder'"
            class="dataview-calendar-editor__config-content"
          >
            <div class="dataview-calendar-editor__field-group">
              <label class="dataview-calendar-editor__label"
                >Select Folder</label
              >
              <div class="dataview-calendar-editor__input-group">
                <select
                  class="dataview-calendar-editor__select"
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
                  class="dataview-calendar-editor__action-btn"
                  title="Refresh folder list"
                  @click="fetchFolders"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
              <div class="dataview-calendar-editor__field-tip">
                Only include notes from this folder
              </div>
            </div>
          </div>

          <!-- Tag Selection -->
          <div
            v-if="sourceType === 'tag'"
            class="dataview-calendar-editor__config-content"
          >
            <div class="dataview-calendar-editor__field-group">
              <label class="dataview-calendar-editor__label">Select Tag</label>
              <div class="dataview-calendar-editor__input-group">
                <select
                  class="dataview-calendar-editor__select"
                  v-model="selectedTag"
                  @change="handleSourceValueChange"
                >
                  <option disabled value="">Select a tag</option>
                  <option v-for="tag in availableTags" :key="tag" :value="tag">
                    #{{ tag }}
                  </option>
                </select>
                <button
                  class="dataview-calendar-editor__action-btn"
                  title="Refresh tag list"
                  @click="fetchTags"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
              <div class="dataview-calendar-editor__field-tip">
                Only include notes with this tag
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Range Section -->
      <div class="dataview-calendar-editor__section">
        <button
          class="dataview-calendar-editor__advanced-toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span>{{
            showAdvanced ? "Hide advanced options" : "Show advanced options"
          }}</span>
          <i
            :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
        </button>

        <div
          v-if="showAdvanced"
          class="dataview-calendar-editor__advanced-panel"
        >
          <!-- Date Filter -->
          <div class="dataview-calendar-editor__field-group">
            <div class="dataview-calendar-editor__checkbox">
              <input
                type="checkbox"
                id="date-filter-toggle"
                v-model="dateFilter.enabled"
                @change="handleDateFilterChange"
              />
              <label for="date-filter-toggle">Filter by Date Range</label>
            </div>

            <div
              v-if="dateFilter.enabled"
              class="dataview-calendar-editor__date-filter-options"
            >
              <div class="dataview-calendar-editor__radio-group">
                <label class="dataview-calendar-editor__radio">
                  <input
                    type="radio"
                    name="dateRange"
                    value="future"
                    v-model="dateFilter.range"
                    @change="handleDateFilterChange"
                  />
                  <span>Future dates only</span>
                </label>

                <label class="dataview-calendar-editor__radio">
                  <input
                    type="radio"
                    name="dateRange"
                    value="past"
                    v-model="dateFilter.range"
                    @change="handleDateFilterChange"
                  />
                  <span>Past dates only</span>
                </label>

                <label class="dataview-calendar-editor__radio">
                  <input
                    type="radio"
                    name="dateRange"
                    value="custom"
                    v-model="dateFilter.range"
                    @change="handleDateFilterChange"
                  />
                  <span>Custom range</span>
                </label>
              </div>

              <div
                v-if="dateFilter.range === 'custom'"
                class="dataview-calendar-editor__date-range"
              >
                <div class="dataview-calendar-editor__date-range-field">
                  <label class="dataview-calendar-editor__label"
                    >Start Date</label
                  >
                  <input
                    type="date"
                    class="dataview-calendar-editor__text-input"
                    v-model="dateFilter.startDate"
                    @change="handleDateFilterChange"
                  />
                </div>

                <div class="dataview-calendar-editor__date-range-field">
                  <label class="dataview-calendar-editor__label"
                    >End Date</label
                  >
                  <input
                    type="date"
                    class="dataview-calendar-editor__text-input"
                    v-model="dateFilter.endDate"
                    @change="handleDateFilterChange"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Display Options -->
          <div class="dataview-calendar-editor__field-group">
            <label class="dataview-calendar-editor__label">
              <i class="fas fa-eye"></i>
              Display Options
            </label>

            <div class="dataview-calendar-editor__display-options">
              <div class="dataview-calendar-editor__checkbox">
                <input
                  type="checkbox"
                  id="show-links"
                  v-model="displayOptions.showLinks"
                  @change="handleDisplayOptionsChange"
                />
                <label for="show-links">Show as Note Links</label>
              </div>

              <div class="dataview-calendar-editor__checkbox">
                <input
                  type="checkbox"
                  id="show-text"
                  v-model="displayOptions.showText"
                  @change="handleDisplayOptionsChange"
                />
                <label for="show-text">Show Note Title/Text</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="dataview-calendar-editor__tips">
        <div class="dataview-calendar-editor__tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Dataview Calendar</span>
        </div>
        <div class="dataview-calendar-editor__tips-content">
          <p>
            This displays your notes in a monthly calendar view based on their
            date properties. Notes will appear on the days corresponding to
            their date field.
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

// Date Field selection
const dateField = ref("file.day"); // 'file.day', 'due', 'date', 'custom'
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
  showLinks: true,
  showText: false,
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
      if (fieldPart === "file.day") {
        dateField.value = "file.day";
      } else if (fieldPart === "due") {
        dateField.value = "due";
      } else if (fieldPart === "date") {
        dateField.value = "date";
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
      displayOptions.value.showLinks = !whereClause.includes("!as:link");
      displayOptions.value.showText = whereClause.includes("as:text");
    }

    // Set advanced options panel state
    showAdvanced.value =
      dateFilter.value.enabled ||
      !displayOptions.value.showLinks ||
      displayOptions.value.showText;

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
    const dateField = getActualDateField();

    if (dateFilter.value.range === "future") {
      conditions.push(`${dateField} > date(now)`);
    } else if (dateFilter.value.range === "past") {
      conditions.push(`${dateField} < date(now)`);
    } else if (
      dateFilter.value.range === "custom" &&
      dateFilter.value.startDate &&
      dateFilter.value.endDate
    ) {
      conditions.push(
        `${dateField} between date("${dateFilter.value.startDate}") and date("${dateFilter.value.endDate}")`
      );
    }
  }

  // Display options conditions
  if (!displayOptions.value.showLinks) {
    conditions.push("!as:link");
  }

  if (displayOptions.value.showText) {
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
.dataview-calendar-editor {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.dataview-calendar-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dataview-calendar-editor__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.dataview-calendar-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Section styling */
.dataview-calendar-editor__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dataview-calendar-editor__section-header {
  margin-bottom: 4px;
}

.dataview-calendar-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #e2e8f0;
}

.dataview-calendar-editor__section-description {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

/* Date Field selection */
.dataview-calendar-editor__date-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-calendar-editor__date-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #cbd5e1;
  transition: all 0.2s;
  cursor: pointer;
}

.dataview-calendar-editor__date-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.dataview-calendar-editor__date-card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.dataview-calendar-editor__date-card-icon {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}

.dataview-calendar-editor__date-card-label {
  font-size: 14px;
  font-weight: 500;
}

.dataview-calendar-editor__date-card-description {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
  margin-top: 4px;
}

/* Source selection */
.dataview-calendar-editor__source-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-calendar-editor__source-card {
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

.dataview-calendar-editor__source-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.dataview-calendar-editor__source-card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.dataview-calendar-editor__source-card-icon {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}

.dataview-calendar-editor__source-card-label {
  font-size: 14px;
}

/* Configuration Panel */
.dataview-calendar-editor__config-panel {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.dataview-calendar-editor__config-content {
  padding: 16px;
}

/* Form field groups */
.dataview-calendar-editor__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.dataview-calendar-editor__field-group:last-child {
  margin-bottom: 0;
}

.dataview-calendar-editor__label {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dataview-calendar-editor__field-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.dataview-calendar-editor__input-group {
  display: flex;
  gap: 8px;
}

/* Text inputs */
.dataview-calendar-editor__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s;
}

.dataview-calendar-editor__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.dataview-calendar-editor__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

/* Select dropdown */
.dataview-calendar-editor__select {
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

.dataview-calendar-editor__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Button styling */
.dataview-calendar-editor__action-btn {
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

.dataview-calendar-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Advanced panel */
.dataview-calendar-editor__advanced-toggle {
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

.dataview-calendar-editor__advanced-toggle:hover {
  color: #e2e8f0;
}

.dataview-calendar-editor__advanced-panel {
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

/* Checkbox styling */
.dataview-calendar-editor__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dataview-calendar-editor__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.dataview-calendar-editor__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-calendar-editor__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.dataview-calendar-editor__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

/* Radio buttons */
.dataview-calendar-editor__radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.dataview-calendar-editor__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-calendar-editor__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.dataview-calendar-editor__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-calendar-editor__radio input[type="radio"]:checked::after {
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

.dataview-calendar-editor__display-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Date filter */
.dataview-calendar-editor__date-filter-options {
  margin-top: 8px;
  margin-left: 26px;
}

.dataview-calendar-editor__date-range {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.dataview-calendar-editor__date-range-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Tips section */
.dataview-calendar-editor__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dataview-calendar-editor__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dataview-calendar-editor__tips-content {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-calendar-editor__date-selector {
    grid-template-columns: 1fr;
  }

  .dataview-calendar-editor__source-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-calendar-editor__date-range {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

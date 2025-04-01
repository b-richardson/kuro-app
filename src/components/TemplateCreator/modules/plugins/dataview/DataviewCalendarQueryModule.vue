<template>
  <!-- 
  IMPORTANT NOTE FOR DEVELOPERS:
  - This component should NOT implement any connection checks to Obsidian
  - This component should NOT display any toast messages
  - All connection validation and user feedback should be handled by parent components
  - Keep this component focused solely on building Dataview Calendar queries
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
    <div class="dataview-calendar-editor">
      <!-- Source Selection Section -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-filter"></i>
            Source Selection
          </div>
        </div>

        <div class="dataview-calendar-editor__source-options">
          <button
            class="dataview-calendar-editor__source-option"
            :class="{ active: sourceType === 'all' }"
            @click="setSourceType('all')"
          >
            All notes
          </button>
          <button
            class="dataview-calendar-editor__source-option"
            :class="{ active: sourceType === 'folder' }"
            @click="setSourceType('folder')"
          >
            From folder
          </button>
          <button
            class="dataview-calendar-editor__source-option"
            :class="{ active: sourceType === 'tag' }"
            @click="setSourceType('tag')"
          >
            With tag
          </button>
        </div>

        <!-- Folder Selection -->
        <div
          v-if="sourceType === 'folder'"
          class="dataview-calendar-editor__source-details"
        >
          <div class="dataview-calendar-editor__field">
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
        </div>

        <!-- Tag Selection -->
        <div
          v-if="sourceType === 'tag'"
          class="dataview-calendar-editor__source-details"
        >
          <div class="dataview-calendar-editor__field">
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
        </div>
      </div>

      <!-- Date Field Selection -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-calendar"></i>
            Date Settings
          </div>
        </div>

        <div class="dataview-calendar-editor__date-settings">
          <!-- Date Field Selection -->
          <div class="dataview-calendar-editor__field-group">
            <label class="dataview-calendar-editor__label">
              Date field to use:
            </label>
            <div class="dataview-calendar-editor__field">
              <select
                class="dataview-calendar-editor__select"
                v-model="dateField"
                @change="handleDateFieldChange"
              >
                <option value="file.ctime">Creation date</option>
                <option value="file.mtime">Modified date</option>
                <option
                  v-for="prop in dateProperties"
                  :key="prop"
                  :value="prop"
                >
                  {{ prop }}
                </option>
              </select>
              <button
                class="dataview-calendar-editor__action-btn"
                title="Refresh properties"
                @click="fetchDateProperties"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <!-- Date Range Section -->
          <div class="dataview-calendar-editor__field-group">
            <label class="dataview-calendar-editor__label">Time range:</label>
            <div class="dataview-calendar-editor__range-options">
              <button
                class="dataview-calendar-editor__range-option"
                :class="{ active: dateRange === 'month' }"
                @click="setDateRange('month')"
              >
                Month
              </button>
              <button
                class="dataview-calendar-editor__range-option"
                :class="{ active: dateRange === 'week' }"
                @click="setDateRange('week')"
              >
                Week
              </button>
              <button
                class="dataview-calendar-editor__range-option"
                :class="{ active: dateRange === 'day' }"
                @click="setDateRange('day')"
              >
                Day
              </button>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div
            v-if="dateRange === 'custom'"
            class="dataview-calendar-editor__custom-range"
          >
            <div class="dataview-calendar-editor__field">
              <input
                type="text"
                class="dataview-calendar-editor__input"
                v-model="customDateRange"
                placeholder="e.g., 2025/01 or 2025/W01"
                @input="handleCustomRangeChange"
              />
              <div class="dataview-calendar-editor__help-tooltip">
                <i class="fas fa-question-circle"></i>
                <div class="dataview-calendar-editor__tooltip-content">
                  <p>Format examples:</p>
                  <ul>
                    <li>Month: 2025/01</li>
                    <li>Week: 2025/W01</li>
                    <li>Day: 2025/01/01</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar View Options -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-th-large"></i>
            Display Options
          </div>
        </div>

        <div class="dataview-calendar-editor__display-settings">
          <!-- Start of Week Selection -->
          <div class="dataview-calendar-editor__field-group">
            <label class="dataview-calendar-editor__label">
              First day of week:
            </label>
            <div class="dataview-calendar-editor__field">
              <select
                class="dataview-calendar-editor__select"
                v-model="startOfWeek"
                @change="handleStartOfWeekChange"
              >
                <option value="1">Monday</option>
                <option value="0">Sunday</option>
              </select>
            </div>
          </div>

          <!-- Show Event Time Toggle -->
          <div class="dataview-calendar-editor__field-group">
            <label class="dataview-calendar-editor__label"
              >Show event time:</label
            >
            <label class="dataview-calendar-editor__toggle">
              <input
                type="checkbox"
                v-model="showEventTime"
                @change="handleShowEventTimeChange"
              />
              <span class="dataview-calendar-editor__toggle-slider"></span>
            </label>
          </div>

          <!-- Show Hover Preview Toggle -->
          <div class="dataview-calendar-editor__field-group">
            <label class="dataview-calendar-editor__label"
              >Show hover preview:</label
            >
            <label class="dataview-calendar-editor__toggle">
              <input
                type="checkbox"
                v-model="showHoverPreview"
                @change="handleHoverPreviewChange"
              />
              <span class="dataview-calendar-editor__toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Event Content Section -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-align-left"></i>
            Event Display
          </div>
        </div>

        <div class="dataview-calendar-editor__field-group">
          <label class="dataview-calendar-editor__label">
            Text to show on calendar:
          </label>
          <div class="dataview-calendar-editor__field">
            <select
              class="dataview-calendar-editor__select"
              v-model="eventField"
              @change="handleEventFieldChange"
            >
              <option value="file.name">File name</option>
              <option value="file.link">File link</option>
              <option
                v-for="prop in availableProperties"
                :key="prop"
                :value="prop"
              >
                {{ prop }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Additional Filters Section -->
      <div class="dataview-calendar-editor__section">
        <div class="dataview-calendar-editor__section-header">
          <div class="dataview-calendar-editor__section-title">
            <i class="fas fa-sliders-h"></i>
            Additional Filters
          </div>
          <button
            v-if="!showFilters"
            class="dataview-calendar-editor__add-filter-btn"
            @click="showFilters = true"
          >
            <i class="fas fa-plus"></i>
            Add filter
          </button>
        </div>

        <div v-if="showFilters" class="dataview-calendar-editor__filters">
          <div class="dataview-calendar-editor__property-field">
            <!-- Property name -->
            <select
              class="dataview-calendar-editor__select"
              v-model="filterProperty"
              @change="handleFilterPropertyChange"
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
              class="dataview-calendar-editor__select dataview-calendar-editor__operator-select"
              v-model="filterOperator"
              @change="handleFilterOperatorChange"
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
              class="dataview-calendar-editor__input"
              placeholder="Value"
              v-model="filterValue"
              @input="handleFilterValueChange"
            />

            <div class="dataview-calendar-editor__filter-actions">
              <button
                class="dataview-calendar-editor__action-btn"
                title="Remove filter"
                @click="removeFilter"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
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

// Calendar options
const dateField = ref("file.ctime");
const dateRange = ref("month");
const customDateRange = ref("");
const startOfWeek = ref("1"); // Monday = 1, Sunday = 0
const showEventTime = ref(false);
const showHoverPreview = ref(true);
const eventField = ref("file.name");

// Filter options
const showFilters = ref(false);
const filterProperty = ref("");
const filterOperator = ref("=");
const filterValue = ref("");

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
const dateProperties = ref<string[]>([
  "date",
  "created",
  "modified",
  "due",
  "start",
  "end",
  "completion",
]);

// Initialize component
onMounted(async () => {
  try {
    // Fetch initial data from API service
    await Promise.all([
      fetchFolders(),
      fetchTags(),
      fetchProperties(),
      fetchDateProperties(),
    ]);

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

// Fetch available properties from Obsidian
async function fetchProperties() {
  try {
    // Use a TABLE query to get file properties
    const dql = `TABLE file.name AS FileName FROM "" LIMIT 10`;
    const results = await obsidianApiService.searchWithDataview(dql);

    // Standard properties since we can't easily extract all frontmatter keys with a single query
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
      "description",
      "summary",
      "content",
    ];

    // Additional logic could be added here to extract properties from results if needed
  } catch (err) {
    console.error("Error fetching properties:", err);
  }
}

// Fetch date-specific properties from Obsidian
async function fetchDateProperties() {
  try {
    // This would ideally query Obsidian to find properties that contain dates
    // But for simplicity, we'll use a common set of date fields
    dateProperties.value = [
      "date",
      "created",
      "modified",
      "due",
      "start",
      "end",
      "completion",
      "reviewed",
      "scheduled",
      "published",
      "birthdate",
      "deadline",
    ];
  } catch (err) {
    console.error("Error fetching date properties:", err);
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

    // Parse CALENDAR part
    const calendarMatch = lines[0].match(/^CALENDAR\s+(.+)$/i);
    if (calendarMatch) {
      dateField.value = calendarMatch[1].trim();
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

    // Parse WHERE part (filter)
    const whereLine = lines.find((line) => line.startsWith("WHERE"));
    if (whereLine) {
      const whereMatch = whereLine.match(/^WHERE\s+(.+)$/i);
      if (whereMatch) {
        showFilters.value = true;
        const condition = whereMatch[1];

        // Try to parse a basic property condition (prop = value)
        const conditionMatch = condition.match(
          /([^=!<>]+)\s*([=!<>]+|contains)\s*(.+)/i
        );
        if (conditionMatch) {
          filterProperty.value = conditionMatch[1].trim();
          filterOperator.value = conditionMatch[2].trim();
          // Remove quotes from value if present
          let value = conditionMatch[3].trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          filterValue.value = value;
        }
      }
    }

    // Parse ID part (event display field)
    const idLine = lines.find((line) => line.startsWith("ID"));
    if (idLine) {
      const idMatch = idLine.match(/^ID\s+(.+)$/i);
      if (idMatch) {
        eventField.value = idMatch[1].trim();
      }
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

function setDateRange(range: string) {
  dateRange.value = range;
  regenerateQuery();
}

function handleDateFieldChange() {
  regenerateQuery();
}

function handleStartOfWeekChange() {
  regenerateQuery();
}

function handleShowEventTimeChange() {
  regenerateQuery();
}

function handleHoverPreviewChange() {
  regenerateQuery();
}

function handleEventFieldChange() {
  regenerateQuery();
}

function handleSourceValueChange() {
  regenerateQuery();
}

function handleCustomRangeChange() {
  regenerateQuery();
}

function handleFilterPropertyChange() {
  regenerateQuery();
}

function handleFilterOperatorChange() {
  regenerateQuery();
}

function handleFilterValueChange() {
  regenerateQuery();
}

function removeFilter() {
  showFilters.value = false;
  filterProperty.value = "";
  filterOperator.value = "=";
  filterValue.value = "";
  regenerateQuery();
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // CALENDAR part
  query += `CALENDAR ${dateField.value}\n`;

  // FROM part
  if (sourceType.value === "folder" && selectedFolder.value) {
    query += `FROM "${selectedFolder.value}"\n`;
  } else if (sourceType.value === "tag" && selectedTag.value) {
    query += `FROM #${selectedTag.value}\n`;
  } else if (sourceType.value === "all") {
    query += 'FROM ""\n';
  }

  // WHERE part - add filter if specified
  if (showFilters.value && filterProperty.value && filterValue.value) {
    let formattedValue = filterValue.value;

    // Add quotes for string values unless using contains operator
    if (isNaN(Number(formattedValue)) && filterOperator.value !== "contains") {
      formattedValue = `"${formattedValue}"`;
    }

    if (filterOperator.value === "contains") {
      query += `WHERE contains(${filterProperty.value}, "${filterValue.value}")\n`;
    } else {
      query += `WHERE ${filterProperty.value} ${filterOperator.value} ${formattedValue}\n`;
    }
  }

  // ID part (text to show for events)
  if (eventField.value && eventField.value !== "file.link") {
    query += `ID ${eventField.value}\n`;
  }

  // Options
  const options = [];

  // Start of week
  if (startOfWeek.value === "0") {
    options.push('startOfWeek: "sunday"');
  }

  // Event time display
  options.push(`showEventTime: ${showEventTime.value}`);

  // Hover preview
  options.push(`hoverPreview: ${showHoverPreview.value}`);

  // Time range
  if (dateRange.value !== "month") {
    options.push(`timespan: "${dateRange.value}"`);
  }

  // Custom date range
  if (dateRange.value === "custom" && customDateRange.value) {
    options.push(`initialDate: "${customDateRange.value}"`);
  }

  // Add options to query if any are set
  if (options.length > 0) {
    query += `OPTIONS ${options.join(", ")}\n`;
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
.dataview-calendar-editor {
  width: 100%;
  color: #cbd5e1;
}

/* Section styling */
.dataview-calendar-editor__section {
  margin-bottom: 20px;
}

.dataview-calendar-editor__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.dataview-calendar-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  color: #e2e8f0;
}

.dataview-calendar-editor__add-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 171, 88, 0.1);
  color: #ffab58;
  border: 1px solid rgba(255, 171, 88, 0.2);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-calendar-editor__add-filter-btn:hover {
  background: rgba(255, 171, 88, 0.2);
}

/* Source selection */
.dataview-calendar-editor__source-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.dataview-calendar-editor__source-option {
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

.dataview-calendar-editor__source-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-calendar-editor__source-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dataview-calendar-editor__source-details {
  margin-top: 12px;
}

.dataview-calendar-editor__field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dataview-calendar-editor__property-field {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}

.dataview-calendar-editor__select {
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

.dataview-calendar-editor__select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-calendar-editor__operator-select {
  font-size: 0.8125rem;
}

.dataview-calendar-editor__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
}

.dataview-calendar-editor__input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-calendar-editor__action-btn {
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

.dataview-calendar-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Date settings */
.dataview-calendar-editor__date-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dataview-calendar-editor__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dataview-calendar-editor__label {
  font-size: 0.875rem;
  color: #cbd5e1;
}

.dataview-calendar-editor__range-options {
  display: flex;
  gap: 8px;
}

.dataview-calendar-editor__range-option {
  flex: 1;
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

.dataview-calendar-editor__range-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-calendar-editor__range-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

.dataview-calendar-editor__custom-range {
  margin-top: 8px;
}

.dataview-calendar-editor__help-tooltip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
}

.dataview-calendar-editor__help-tooltip:hover
  .dataview-calendar-editor__tooltip-content {
  display: block;
}

.dataview-calendar-editor__tooltip-content {
  display: none;
  position: absolute;
  bottom: 100%;
  right: 0;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px 12px;
  width: 200px;
  font-size: 0.8125rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.dataview-calendar-editor__tooltip-content p {
  margin: 0 0 4px 0;
}

.dataview-calendar-editor__tooltip-content ul {
  margin: 0;
  padding-left: 16px;
}

/* Display settings */
.dataview-calendar-editor__display-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dataview-calendar-editor__toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  align-self: flex-start;
}

.dataview-calendar-editor__toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dataview-calendar-editor__toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: 0.3s;
}

.dataview-calendar-editor__toggle-slider:before {
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

.dataview-calendar-editor__toggle
  input:checked
  + .dataview-calendar-editor__toggle-slider {
  background-color: rgba(255, 171, 88, 0.6);
}

.dataview-calendar-editor__toggle
  input:checked
  + .dataview-calendar-editor__toggle-slider:before {
  transform: translateX(20px);
}

/* Filter section */
.dataview-calendar-editor__filters {
  margin-top: 12px;
}

.dataview-calendar-editor__filter-actions {
  display: flex;
  gap: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-calendar-editor__source-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-calendar-editor__property-field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dataview-calendar-editor__range-options {
    flex-direction: column;
  }
}
</style>

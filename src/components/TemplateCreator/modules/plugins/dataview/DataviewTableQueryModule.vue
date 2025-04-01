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
    <div class="dataview-table-editor">
      <!-- Source Selection Section -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-filter"></i>
            Source Selection
          </div>
        </div>

        <div class="dataview-table-editor__source-options">
          <button
            class="dataview-table-editor__source-option"
            :class="{ active: sourceType === 'all' }"
            @click="setSourceType('all')"
          >
            All notes
          </button>
          <button
            class="dataview-table-editor__source-option"
            :class="{ active: sourceType === 'folder' }"
            @click="setSourceType('folder')"
          >
            From folder
          </button>
          <button
            class="dataview-table-editor__source-option"
            :class="{ active: sourceType === 'tag' }"
            @click="setSourceType('tag')"
          >
            With tag
          </button>
          <button
            class="dataview-table-editor__source-option"
            :class="{ active: sourceType === 'property' }"
            @click="setSourceType('property')"
          >
            With property
          </button>
        </div>

        <!-- Folder Selection -->
        <div
          v-if="sourceType === 'folder'"
          class="dataview-table-editor__source-details"
        >
          <div class="dataview-table-editor__field">
            <select
              class="dataview-table-editor__select"
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
              class="dataview-table-editor__action-btn"
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
          class="dataview-table-editor__source-details"
        >
          <div class="dataview-table-editor__field">
            <select
              class="dataview-table-editor__select"
              v-model="selectedTag"
              @change="handleSourceValueChange"
            >
              <option disabled value="">Select a tag</option>
              <option v-for="tag in availableTags" :key="tag" :value="tag">
                #{{ tag }}
              </option>
            </select>
            <button
              class="dataview-table-editor__action-btn"
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
          class="dataview-table-editor__source-details"
        >
          <div class="dataview-table-editor__property-field">
            <!-- Property name -->
            <select
              class="dataview-table-editor__select"
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
              class="dataview-table-editor__select dataview-table-editor__operator-select"
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
              class="dataview-table-editor__input"
              placeholder="Value"
              v-model="propertyValue"
              @input="handlePropertyValueChange"
            />

            <button
              class="dataview-table-editor__action-btn"
              title="Refresh property list"
              @click="fetchProperties"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Columns Section -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-table"></i>
            Table Columns
          </div>
        </div>

        <!-- Column configurations -->
        <div class="dataview-table-editor__columns">
          <div
            v-for="(column, index) in tableColumns"
            :key="index"
            class="dataview-table-editor__column-item"
          >
            <div class="dataview-table-editor__column-header">
              <div class="dataview-table-editor__column-drag">
                <i class="fas fa-grip-lines"></i>
              </div>
              <div class="dataview-table-editor__column-fields">
                <div class="dataview-table-editor__column-property">
                  <input
                    type="text"
                    class="dataview-table-editor__input"
                    placeholder="Property"
                    v-model="column.property"
                    list="available-properties"
                    @input="updateColumn(index)"
                  />
                  <datalist id="available-properties">
                    <option
                      v-for="prop in availableProperties"
                      :key="prop"
                      :value="prop"
                    ></option>
                  </datalist>
                </div>
                <div class="dataview-table-editor__column-display">
                  <input
                    type="text"
                    class="dataview-table-editor__input"
                    placeholder="Display name (optional)"
                    v-model="column.displayName"
                    @input="updateColumn(index)"
                  />
                </div>
              </div>
              <div class="dataview-table-editor__column-actions">
                <button
                  class="dataview-table-editor__action-btn"
                  title="Remove column"
                  @click="removeColumn(index)"
                  v-if="tableColumns.length > 1"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add column button -->
        <div class="dataview-table-editor__add-column">
          <button class="dataview-table-editor__add-btn" @click="addColumn">
            <i class="fas fa-plus"></i>
            Add Column
          </button>
        </div>
      </div>

      <!-- Without ID option -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-cog"></i>
            Table Options
          </div>
        </div>

        <div class="dataview-table-editor__options">
          <label class="dataview-table-editor__option-toggle">
            <input
              type="checkbox"
              v-model="withoutID"
              @change="regenerateQuery"
            />
            <span class="dataview-table-editor__toggle-slider"></span>
            <span class="dataview-table-editor__toggle-label"
              >Hide ID column</span
            >
          </label>

          <div class="dataview-table-editor__option-info">
            <i class="fas fa-info-circle"></i>
            <span>Hides the first column which is typically the filename</span>
          </div>
        </div>
      </div>

      <!-- Sort Section -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-sort"></i>
            Sort Results
          </div>
        </div>

        <div class="dataview-table-editor__sort-controls">
          <select
            class="dataview-table-editor__select"
            v-model="sortProperty"
            @change="handleSortChange"
          >
            <option disabled value="">Sort by...</option>
            <option value="file.name">File name</option>
            <option value="file.ctime">Creation time</option>
            <option value="file.mtime">Modified time</option>
            <option
              v-for="prop in availableProperties"
              :key="prop"
              :value="prop"
            >
              {{ prop }}
            </option>
          </select>

          <div class="dataview-table-editor__sort-direction">
            <button
              class="dataview-table-editor__direction-btn"
              :class="{ active: sortDirection === 'asc' }"
              @click="setSortDirection('asc')"
            >
              <i class="fas fa-sort-amount-down-alt"></i>
              Ascending
            </button>
            <button
              class="dataview-table-editor__direction-btn"
              :class="{ active: sortDirection === 'desc' }"
              @click="setSortDirection('desc')"
            >
              <i class="fas fa-sort-amount-down"></i>
              Descending
            </button>
          </div>
        </div>
      </div>

      <!-- Group By Section (Optional) -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-layer-group"></i>
            Group Results
          </div>
        </div>

        <div class="dataview-table-editor__group-controls">
          <label class="dataview-table-editor__option-toggle">
            <input
              type="checkbox"
              v-model="useGroupBy"
              @change="regenerateQuery"
            />
            <span class="dataview-table-editor__toggle-slider"></span>
            <span class="dataview-table-editor__toggle-label"
              >Group results by property</span
            >
          </label>

          <div v-if="useGroupBy" class="dataview-table-editor__group-field">
            <select
              class="dataview-table-editor__select"
              v-model="groupByProperty"
              @change="regenerateQuery"
            >
              <option disabled value="">Select property...</option>
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

      <!-- Limit Section -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-sliders-h"></i>
            Limit Results
          </div>
        </div>

        <div class="dataview-table-editor__limit-controls">
          <div class="dataview-table-editor__limit-field">
            <input
              type="number"
              class="dataview-table-editor__input dataview-table-editor__number-input"
              v-model.number="limitCount"
              min="1"
              max="1000"
              @change="handleLimitChange"
              :disabled="!useLimit"
            />
            <label class="dataview-table-editor__limit-toggle">
              <input
                type="checkbox"
                v-model="useLimit"
                @change="handleLimitChange"
              />
              <span class="dataview-table-editor__toggle-slider"></span>
              <span class="dataview-table-editor__toggle-label"
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

// Table columns
interface TableColumn {
  property: string;
  displayName: string;
}

const tableColumns = ref<TableColumn[]>([
  { property: "file.name", displayName: "File" },
  { property: "file.mtime", displayName: "Modified" },
]);

// Table options
const withoutID = ref(false);

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
const sortProperty = ref("file.name");
const sortDirection = ref("asc");

// Group by options
const useGroupBy = ref(false);
const groupByProperty = ref("");

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
    console.error("Error initializing DataviewTableModule:", error);
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

    // Basic parsing for TABLE queries
    // This is a simplified parser that won't handle all possible Dataview syntax
    const lines = cleanQuery.split("\n").map((line) => line.trim());

    // Parse TABLE part and columns
    const tableMatch = lines[0].match(/^TABLE\s+(WITHOUT\s+ID\s+)?(.+)$/i);
    if (tableMatch) {
      // Check for WITHOUT ID
      withoutID.value = !!tableMatch[1];

      // Parse columns
      const columnsStr = tableMatch[2];

      // Handle column aliases (format: property AS "Display Name")
      const columnRegex =
        /([^,]+?)(?:\s+AS\s+(?:"([^"]+)"|'([^']+)'|([^,]+)))?(?:,|$)/g;
      const columns: TableColumn[] = [];

      let match;
      while ((match = columnRegex.exec(columnsStr)) !== null) {
        const property = match[1].trim();
        // Display name could be in any of the capturing groups
        const displayName = match[2] || match[3] || match[4] || "";

        columns.push({ property, displayName });
      }

      if (columns.length > 0) {
        tableColumns.value = columns;
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
      const groupByMatch = groupByLine.match(/^GROUP BY\s+(.+)$/i);
      if (groupByMatch) {
        useGroupBy.value = true;
        groupByProperty.value = groupByMatch[1].trim();
      }
    } else {
      useGroupBy.value = false;
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
      sortProperty.value = "file.name";
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

// Column Management
function addColumn() {
  tableColumns.value.push({ property: "", displayName: "" });
}

function removeColumn(index: number) {
  if (tableColumns.value.length > 1) {
    tableColumns.value.splice(index, 1);
    regenerateQuery();
  }
}

function updateColumn(index: number) {
  regenerateQuery();
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // TABLE part with columns
  const columnDefinitions = tableColumns.value
    .filter((col) => col.property.trim()) // Skip empty columns
    .map((col) => {
      if (col.displayName) {
        return `${col.property} AS "${col.displayName}"`;
      }
      return col.property;
    })
    .join(", ");

  if (withoutID.value) {
    query += `TABLE WITHOUT ID ${columnDefinitions}\n`;
  } else {
    query += `TABLE ${columnDefinitions}\n`;
  }

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
  if (useGroupBy && groupByProperty.value) {
    query += `GROUP BY ${groupByProperty.value}\n`;
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
.dataview-table-editor {
  width: 100%;
  color: #cbd5e1;
}

.dataview-table-editor__alert {
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
.dataview-table-editor__section {
  margin-bottom: 20px;
}

.dataview-table-editor__section-header {
  margin-bottom: 12px;
}

.dataview-table-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  color: #e2e8f0;
}

/* Source selection */
.dataview-table-editor__source-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.dataview-table-editor__source-option {
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

.dataview-table-editor__source-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-table-editor__source-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dataview-table-editor__source-details {
  margin-top: 12px;
}

.dataview-table-editor__field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dataview-table-editor__property-field {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}

.dataview-table-editor__select {
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

.dataview-table-editor__select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-table-editor__operator-select {
  font-size: 0.8125rem;
}

.dataview-table-editor__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
}

.dataview-table-editor__input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-table-editor__action-btn {
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

.dataview-table-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Column management */
.dataview-table-editor__columns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-table-editor__column-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 10px;
}

.dataview-table-editor__column-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dataview-table-editor__column-drag {
  color: #64748b;
  cursor: move;
  padding: 4px;
}

.dataview-table-editor__column-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.dataview-table-editor__add-column {
  margin-top: 8px;
}

.dataview-table-editor__add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 171, 88, 0.1);
  color: #ffab58;
  border: 1px solid rgba(255, 171, 88, 0.2);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-table-editor__add-btn:hover:not(:disabled) {
  background: rgba(255, 171, 88, 0.2);
}

.dataview-table-editor__add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Table options */
.dataview-table-editor__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dataview-table-editor__option-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.8125rem;
  padding-left: 48px;
}

/* Sort controls */
.dataview-table-editor__sort-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-table-editor__sort-direction {
  display: flex;
  gap: 8px;
}

.dataview-table-editor__direction-btn {
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

.dataview-table-editor__direction-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-table-editor__direction-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Group by controls */
.dataview-table-editor__group-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-table-editor__group-field {
  margin-top: 4px;
}

/* Limit controls */
.dataview-table-editor__limit-controls {
  margin-top: 8px;
}

.dataview-table-editor__limit-field {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dataview-table-editor__number-input {
  width: 80px;
  text-align: center;
}

.dataview-table-editor__option-toggle,
.dataview-table-editor__limit-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-table-editor__toggle-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: 0.3s;
}

.dataview-table-editor__toggle-slider:before {
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

.dataview-table-editor__option-toggle input,
.dataview-table-editor__limit-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dataview-table-editor__option-toggle
  input:checked
  + .dataview-table-editor__toggle-slider,
.dataview-table-editor__limit-toggle
  input:checked
  + .dataview-table-editor__toggle-slider {
  background-color: rgba(255, 171, 88, 0.6);
}

.dataview-table-editor__option-toggle
  input:checked
  + .dataview-table-editor__toggle-slider:before,
.dataview-table-editor__limit-toggle
  input:checked
  + .dataview-table-editor__toggle-slider:before {
  transform: translateX(20px);
}

.dataview-table-editor__toggle-label {
  font-size: 0.875rem;
  color: #e2e8f0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-table-editor__source-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-table-editor__property-field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dataview-table-editor__column-fields {
    grid-template-columns: 1fr;
  }

  .dataview-table-editor__sort-controls,
  .dataview-table-editor__limit-field {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

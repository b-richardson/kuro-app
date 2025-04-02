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
    <div class="dataview-table-editor">
      <!-- Module Header -->
      <div class="dataview-table-editor__header">
        <div class="dataview-table-editor__header-icon">
          <i class="fas fa-table"></i>
        </div>
        <div class="dataview-table-editor__header-title">Dataview Table</div>
      </div>

      <!-- Source Selection Section -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-filter"></i>
            <span>Choose Source</span>
          </div>
          <div class="dataview-table-editor__section-description">
            Select where to find your notes
          </div>
        </div>

        <div class="dataview-table-editor__source-selector">
          <button
            class="dataview-table-editor__source-card"
            :class="{
              'dataview-table-editor__source-card--active':
                sourceType === 'all',
            }"
            @click="setSourceType('all')"
          >
            <div class="dataview-table-editor__source-card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="dataview-table-editor__source-card-label">
              All Notes
            </div>
          </button>

          <button
            class="dataview-table-editor__source-card"
            :class="{
              'dataview-table-editor__source-card--active':
                sourceType === 'folder',
            }"
            @click="setSourceType('folder')"
          >
            <div class="dataview-table-editor__source-card-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="dataview-table-editor__source-card-label">
              From Folder
            </div>
          </button>

          <button
            class="dataview-table-editor__source-card"
            :class="{
              'dataview-table-editor__source-card--active':
                sourceType === 'tag',
            }"
            @click="setSourceType('tag')"
          >
            <div class="dataview-table-editor__source-card-icon">
              <i class="fas fa-hashtag"></i>
            </div>
            <div class="dataview-table-editor__source-card-label">With Tag</div>
          </button>

          <button
            class="dataview-table-editor__source-card"
            :class="{
              'dataview-table-editor__source-card--active':
                sourceType === 'property',
            }"
            @click="setSourceType('property')"
          >
            <div class="dataview-table-editor__source-card-icon">
              <i class="fas fa-key"></i>
            </div>
            <div class="dataview-table-editor__source-card-label">
              With Property
            </div>
          </button>
        </div>

        <!-- Configuration Panel -->
        <div class="dataview-table-editor__config-panel">
          <!-- Folder Selection -->
          <div
            v-if="sourceType === 'folder'"
            class="dataview-table-editor__config-content"
          >
            <div class="dataview-table-editor__field-group">
              <label class="dataview-table-editor__label">Select Folder</label>
              <div class="dataview-table-editor__input-group">
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
              <div class="dataview-table-editor__field-tip">
                Only include notes from this folder
              </div>
            </div>
          </div>

          <!-- Tag Selection -->
          <div
            v-if="sourceType === 'tag'"
            class="dataview-table-editor__config-content"
          >
            <div class="dataview-table-editor__field-group">
              <label class="dataview-table-editor__label">Select Tag</label>
              <div class="dataview-table-editor__input-group">
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
              <div class="dataview-table-editor__field-tip">
                Only include notes with this tag
              </div>
            </div>
          </div>

          <!-- Property Selection -->
          <div
            v-if="sourceType === 'property'"
            class="dataview-table-editor__config-content"
          >
            <div class="dataview-table-editor__field-group">
              <label class="dataview-table-editor__label"
                >Filter by Property</label
              >

              <div class="dataview-table-editor__property-field">
                <div class="dataview-table-editor__property-name">
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
                </div>

                <div class="dataview-table-editor__property-operator">
                  <select
                    class="dataview-table-editor__select"
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
                </div>

                <div class="dataview-table-editor__property-value">
                  <input
                    type="text"
                    class="dataview-table-editor__text-input"
                    placeholder="Value"
                    v-model="propertyValue"
                    @input="handlePropertyValueChange"
                  />
                </div>

                <button
                  class="dataview-table-editor__action-btn"
                  title="Refresh property list"
                  @click="fetchProperties"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>

              <div class="dataview-table-editor__field-tip">
                Only include notes where this property matches the condition
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Columns Section -->
      <div class="dataview-table-editor__section">
        <div class="dataview-table-editor__section-header">
          <div class="dataview-table-editor__section-title">
            <i class="fas fa-columns"></i>
            <span>Table Columns</span>
          </div>
          <div class="dataview-table-editor__section-description">
            Define columns and how they should display
          </div>
        </div>

        <!-- Column configurations -->
        <div class="dataview-table-editor__columns">
          <div
            v-if="tableColumns.length === 0"
            class="dataview-table-editor__columns-empty"
          >
            <div class="dataview-table-editor__empty-message">
              <i class="fas fa-info-circle"></i>
              <span>Add at least one column to your table</span>
            </div>
          </div>

          <div
            v-for="(column, index) in tableColumns"
            :key="index"
            class="dataview-table-editor__column-item"
          >
            <div class="dataview-table-editor__column-content">
              <div class="dataview-table-editor__column-header">
                <div class="dataview-table-editor__column-drag">
                  <i class="fas fa-grip-lines"></i>
                </div>
                <div class="dataview-table-editor__column-name">
                  <input
                    type="text"
                    class="dataview-table-editor__text-input"
                    placeholder="Column header (optional)"
                    v-model="column.header"
                    @input="handleColumnChange"
                  />
                </div>
                <div class="dataview-table-editor__column-actions">
                  <button
                    class="dataview-table-editor__action-btn"
                    title="Remove column"
                    @click="removeColumn(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div class="dataview-table-editor__column-property">
                <div class="dataview-table-editor__column-property-label">
                  Property:
                </div>
                <div class="dataview-table-editor__column-property-field">
                  <select
                    class="dataview-table-editor__select"
                    v-model="column.property"
                    @change="handleColumnChange"
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Column Button -->
        <div class="dataview-table-editor__add-column">
          <button class="dataview-table-editor__add-btn" @click="addColumn">
            <i class="fas fa-plus"></i>
            <span>Add Column</span>
          </button>
        </div>
      </div>

      <!-- Advanced Options Section -->
      <div class="dataview-table-editor__section">
        <button
          class="dataview-table-editor__advanced-toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span>{{
            showAdvanced ? "Hide advanced options" : "Show advanced options"
          }}</span>
          <i
            :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
        </button>

        <div v-if="showAdvanced" class="dataview-table-editor__advanced-panel">
          <!-- Sort Section -->
          <div class="dataview-table-editor__field-group">
            <label class="dataview-table-editor__label">
              <i class="fas fa-sort"></i>
              Sort Results
            </label>

            <div class="dataview-table-editor__sort-property">
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
            </div>

            <div class="dataview-table-editor__sort-direction">
              <div class="dataview-table-editor__radio-group">
                <label class="dataview-table-editor__radio">
                  <input
                    type="radio"
                    name="sortDirection"
                    :value="'asc'"
                    v-model="sortDirection"
                    @change="handleSortChange"
                  />
                  <span class="dataview-table-editor__radio-text">
                    <i class="fas fa-sort-amount-down-alt"></i>
                    Ascending
                  </span>
                </label>

                <label class="dataview-table-editor__radio">
                  <input
                    type="radio"
                    name="sortDirection"
                    :value="'desc'"
                    v-model="sortDirection"
                    @change="handleSortChange"
                  />
                  <span class="dataview-table-editor__radio-text">
                    <i class="fas fa-sort-amount-down"></i>
                    Descending
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Limit Section -->
          <div class="dataview-table-editor__field-group">
            <div class="dataview-table-editor__limit-field">
              <div class="dataview-table-editor__checkbox">
                <input
                  type="checkbox"
                  id="limit-toggle"
                  v-model="useLimit"
                  @change="handleLimitChange"
                />
                <label for="limit-toggle">Limit number of results</label>
              </div>

              <div class="dataview-table-editor__limit-value" v-if="useLimit">
                <input
                  type="number"
                  class="dataview-table-editor__text-input dataview-table-editor__number-input"
                  v-model.number="limitCount"
                  min="1"
                  max="1000"
                  @change="handleLimitChange"
                />
                <div class="dataview-table-editor__field-tip">
                  Maximum number of results to display
                </div>
              </div>
            </div>
          </div>

          <!-- Table Formatting -->
          <div class="dataview-table-editor__field-group">
            <label class="dataview-table-editor__label">
              <i class="fas fa-paint-brush"></i>
              Table Style
            </label>

            <div class="dataview-table-editor__style-options">
              <div class="dataview-table-editor__checkbox">
                <input
                  type="checkbox"
                  id="without-id"
                  v-model="withoutId"
                  @change="handleStyleChange"
                />
                <label for="without-id">Hide ID column</label>
              </div>

              <div class="dataview-table-editor__field-tip">
                Default Dataview tables include a link to the note as the first
                column
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="dataview-table-editor__tips">
        <div class="dataview-table-editor__tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Dataview Tables</span>
        </div>
        <div class="dataview-table-editor__tips-content">
          <p>
            This creates a table view of notes based on your criteria. The
            columns you define will appear as specified in the table.
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

// Source selection
const sourceType = ref("all");
const selectedFolder = ref("");
const selectedTag = ref("");
const selectedProperty = ref("");
const propertyOperator = ref("=");
const propertyValue = ref("");

// Table columns
interface TableColumn {
  header: string;
  property: string;
}

const tableColumns = ref<TableColumn[]>([]);

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

// Limit options
const useLimit = ref(false);
const limitCount = ref(20);

// Style options
const withoutId = ref(false);

// Initialize component
onMounted(async () => {
  try {
    // Fetch initial data from API service
    await Promise.all([fetchFolders(), fetchTags(), fetchProperties()]);

    // Parse existing content if it exists
    if (props.module.content.length > 0) {
      parseExistingQuery(props.module.content[0]);
    } else {
      // Add default column if none exists
      if (tableColumns.value.length === 0) {
        tableColumns.value.push({
          header: "File",
          property: "file.name",
        });
      }

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
    const tableMatch = lines[0].match(/^TABLE(?:\s+WITHOUT\s+ID)?\s+(.+)$/i);
    if (tableMatch) {
      // Check for WITHOUT ID
      withoutId.value = lines[0].includes("WITHOUT ID");

      const columnsString = tableMatch[1];
      // Split by commas outside of parentheses to handle functions like date(file.ctime)
      const columns = columnsString.split(/,(?![^(]*\))/g).map((c) => c.trim());

      // Parse columns and headers (property AS Header syntax)
      tableColumns.value = columns.map((column) => {
        const asMatch = column.match(/(.+?)\s+AS\s+(.+)/i);
        if (asMatch) {
          return {
            property: asMatch[1].trim(),
            header: asMatch[2].trim(),
          };
        } else {
          return {
            property: column,
            header: "",
          };
        }
      });
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

    // Set advanced options panel state based on whether sort or limit is used
    showAdvanced.value = !!sortLine || !!limitLine || withoutId.value;

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

function handleStyleChange() {
  regenerateQuery();
}

// Column Management
function addColumn() {
  tableColumns.value.push({
    header: "",
    property: "file.name",
  });
  regenerateQuery();
}

function removeColumn(index: number) {
  // Don't remove if it's the last column
  if (tableColumns.value.length > 1) {
    tableColumns.value.splice(index, 1);
    regenerateQuery();
  }
}

function handleColumnChange() {
  regenerateQuery();
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // TABLE part
  query += withoutId.value ? "TABLE WITHOUT ID " : "TABLE ";

  // Add columns
  if (tableColumns.value.length > 0) {
    const columnDefinitions = tableColumns.value.map((column) => {
      if (column.header) {
        return `${column.property} AS "${column.header}"`;
      } else {
        return column.property;
      }
    });

    query += columnDefinitions.join(", ");
  } else {
    // Fallback if no columns defined
    query += "file.name";
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
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.dataview-table-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dataview-table-editor__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.dataview-table-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Section styling */
.dataview-table-editor__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dataview-table-editor__section-header {
  margin-bottom: 4px;
}

.dataview-table-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #e2e8f0;
}

.dataview-table-editor__section-description {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

/* Source selection */
.dataview-table-editor__source-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-table-editor__source-card {
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

.dataview-table-editor__source-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.dataview-table-editor__source-card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.dataview-table-editor__source-card-icon {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}

.dataview-table-editor__source-card-label {
  font-size: 14px;
}

/* Configuration Panel */
.dataview-table-editor__config-panel {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.dataview-table-editor__config-content {
  padding: 16px;
}

/* Form field groups */
.dataview-table-editor__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.dataview-table-editor__field-group:last-child {
  margin-bottom: 0;
}

.dataview-table-editor__label {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dataview-table-editor__field-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.dataview-table-editor__input-group {
  display: flex;
  gap: 8px;
}

/* Text inputs */
.dataview-table-editor__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s;
}

.dataview-table-editor__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.dataview-table-editor__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

/* Select dropdown */
.dataview-table-editor__select {
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

.dataview-table-editor__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Button styling */
.dataview-table-editor__action-btn {
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

.dataview-table-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Property fields */
.dataview-table-editor__property-field {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}

/* Table columns */
.dataview-table-editor__columns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-table-editor__columns-empty {
  padding: 20px;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dataview-table-editor__empty-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
}

.dataview-table-editor__column-item {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.dataview-table-editor__column-content {
  padding: 12px;
}

.dataview-table-editor__column-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.dataview-table-editor__column-drag {
  color: #64748b;
  cursor: move;
  padding: 4px;
}

.dataview-table-editor__column-name {
  flex: 1;
}

.dataview-table-editor__column-actions {
  display: flex;
  gap: 6px;
}

.dataview-table-editor__column-property {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dataview-table-editor__column-property-label {
  font-size: 14px;
  color: #94a3b8;
  min-width: 60px;
}

.dataview-table-editor__column-property-field {
  flex: 1;
}

.dataview-table-editor__add-column {
  display: flex;
  justify-content: center;
}

.dataview-table-editor__add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-table-editor__add-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
}

.dataview-table-editor__add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Advanced panel */
.dataview-table-editor__advanced-toggle {
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

.dataview-table-editor__advanced-toggle:hover {
  color: #e2e8f0;
}

.dataview-table-editor__advanced-panel {
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
.dataview-table-editor__sort-property {
  margin-bottom: 12px;
}

.dataview-table-editor__sort-direction {
  margin-top: 4px;
}

.dataview-table-editor__radio-group {
  display: flex;
  gap: 16px;
}

.dataview-table-editor__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-table-editor__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.dataview-table-editor__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-table-editor__radio input[type="radio"]:checked::after {
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

.dataview-table-editor__radio-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* Checkbox styling */
.dataview-table-editor__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dataview-table-editor__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.dataview-table-editor__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-table-editor__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.dataview-table-editor__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

.dataview-table-editor__limit-value {
  margin-top: 8px;
  margin-left: 26px;
}

.dataview-table-editor__number-input {
  width: 100px;
  text-align: center;
}

/* Style options */
.dataview-table-editor__style-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Tips section */
.dataview-table-editor__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dataview-table-editor__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dataview-table-editor__tips-content {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-table-editor__source-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-table-editor__property-field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dataview-table-editor__radio-group {
    flex-direction: column;
    gap: 12px;
  }

  .dataview-table-editor__column-property {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .dataview-table-editor__column-property-label {
    min-width: auto;
  }
}
</style>

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
    <div class="dv-table-builder">
      <!-- Module Header -->
      <div class="dv-table-header">
        <div class="dv-table-header-icon">
          <i class="fas fa-table"></i>
        </div>
        <div class="dv-table-header-title">Dataview Table</div>
      </div>

      <!-- Step 1: Source Selection -->
      <div class="dv-table-section">
        <div class="dv-table-section-header">
          <span class="dv-table-step-number">1</span>
          <i class="fas fa-filter dv-table-section-icon"></i>
          <h3 class="dv-table-section-title">Choose Source</h3>
          <span class="dv-table-section-description"
            >Where to find notes for the table</span
          >
        </div>

        <div class="dv-table-section-content">
          <div class="dv-table-field-group">
            <div class="dv-table-segmented-control">
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
                :class="{ active: sourceType === 'property' }"
                @click="setSourceType('property')"
              >
                <i class="fas fa-key"></i> Property
              </button>
            </div>

            <!-- Folder Selection -->
            <div
              v-if="sourceType === 'folder'"
              class="dv-table-input-wrapper dv-table-input-wrapper--select"
            >
              <i class="fas fa-folder dv-table-input-icon"></i>
              <select
                class="dv-table-select"
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
                class="dv-table-action-btn dv-table-action-btn--refresh"
                title="Refresh folder list"
                @click="fetchFolders"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>

            <!-- Tag Selection -->
            <div
              v-if="sourceType === 'tag'"
              class="dv-table-input-wrapper dv-table-input-wrapper--select"
            >
              <i class="fas fa-tag dv-table-input-icon"></i>
              <select
                class="dv-table-select"
                v-model="selectedTag"
                @change="handleSourceValueChange"
              >
                <option disabled value="">Select a tag...</option>
                <option v-for="tag in availableTags" :key="tag" :value="tag">
                  #{{ tag }}
                </option>
              </select>
              <button
                class="dv-table-action-btn dv-table-action-btn--refresh"
                title="Refresh tag list"
                @click="fetchTags"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>

            <!-- Property Selection -->
            <div
              v-if="sourceType === 'property'"
              class="dv-table-property-filter"
            >
              <div
                class="dv-table-input-wrapper dv-table-input-wrapper--select"
              >
                <i class="fas fa-key dv-table-input-icon"></i>
                <select
                  class="dv-table-select"
                  v-model="selectedProperty"
                  @change="handlePropertyChange"
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

              <div
                class="dv-table-input-wrapper dv-table-input-wrapper--select"
              >
                <select
                  class="dv-table-select"
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

              <div class="dv-table-input-wrapper">
                <input
                  type="text"
                  class="dv-table-input"
                  placeholder="Value"
                  v-model="propertyValue"
                  @input="handlePropertyValueChange"
                />

                <button
                  class="dv-table-action-btn"
                  title="Refresh property list"
                  @click="fetchProperties"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Define Table Columns -->
      <div class="dv-table-section">
        <div class="dv-table-section-header">
          <span class="dv-table-step-number">2</span>
          <i class="fas fa-columns dv-table-section-icon"></i>
          <h3 class="dv-table-section-title">Table Columns</h3>
          <span class="dv-table-section-description"
            >Data to show in your table</span
          >
        </div>

        <div class="dv-table-section-content">
          <div class="dv-table-field-group dv-table-field-group--inline">
            <label class="dv-table-toggle">
              <input
                type="checkbox"
                v-model="withoutId"
                @change="handleStyleChange"
              />
              <span class="dv-table-toggle-slider"></span>
            </label>
            <span
              class="dv-table-toggle-label"
              :class="{ 'dv-table-toggle-label--disabled': !withoutId }"
            >
              Hide default ID column
            </span>
            <span class="dv-table-field-tip dv-table-field-tip--inline">
              (Default Dataview tables include a link to each note as the first
              column)
            </span>
          </div>

          <div class="dv-table-columns">
            <div
              v-if="tableColumns.length === 0"
              class="dv-table-columns-empty"
            >
              <i class="fas fa-info-circle"></i>
              <span>Add at least one column to your table</span>
            </div>

            <div
              v-for="(column, index) in tableColumns"
              :key="index"
              class="dv-table-column-card"
            >
              <div class="dv-table-column-header">
                <div class="dv-table-column-drag">
                  <i class="fas fa-grip-lines"></i>
                </div>
                <div class="dv-table-column-tag">Column {{ index + 1 }}</div>
                <button
                  class="dv-table-column-remove"
                  @click="removeColumn(index)"
                  :disabled="tableColumns.length <= 1"
                  title="Remove column"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="dv-table-column-content">
                <div
                  class="dv-table-input-wrapper dv-table-input-wrapper--field"
                >
                  <i class="fas fa-font dv-table-input-icon"></i>
                  <input
                    type="text"
                    class="dv-table-input"
                    placeholder="Column header (optional)"
                    v-model="column.header"
                    @input="handleColumnChange"
                  />
                </div>

                <div
                  class="dv-table-input-wrapper dv-table-input-wrapper--select"
                >
                  <i class="fas fa-database dv-table-input-icon"></i>
                  <select
                    class="dv-table-select"
                    v-model="column.property"
                    @change="handleColumnChange"
                  >
                    <option disabled value="">Select property...</option>
                    <option value="file.name">File name</option>
                    <option value="file.ctime">Creation date</option>
                    <option value="file.mtime">Modified date</option>
                    <option
                      v-for="prop in availableProperties"
                      :key="prop"
                      :value="prop"
                      v-show="
                        !['file.name', 'file.ctime', 'file.mtime'].includes(
                          prop
                        )
                      "
                    >
                      {{ prop }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            class="dv-table-add-column-btn"
            @click="addColumn"
            title="Add a new column"
          >
            <i class="fas fa-plus"></i>
            <span>Add Column</span>
          </button>
        </div>
      </div>

      <!-- Step 3: Sorting & Limits -->
      <div class="dv-table-section">
        <div class="dv-table-section-header">
          <span class="dv-table-step-number">3</span>
          <i class="fas fa-sort dv-table-section-icon"></i>
          <h3 class="dv-table-section-title">Sorting & Limits</h3>
          <span class="dv-table-section-description"
            >Control result order and count</span
          >
        </div>

        <div class="dv-table-section-content">
          <!-- Sort options -->
          <div class="dv-table-field-group">
            <label class="dv-table-label">Sort Results By</label>
            <div class="dv-table-input-wrapper dv-table-input-wrapper--select">
              <i class="fas fa-sort-alpha-down dv-table-input-icon"></i>
              <select
                class="dv-table-select"
                v-model="sortProperty"
                @change="handleSortChange"
              >
                <option disabled value="">Choose property to sort by...</option>
                <option value="file.name">File name</option>
                <option value="file.ctime">Creation time</option>
                <option value="file.mtime">Modified time</option>
                <option
                  v-for="prop in availableProperties"
                  :key="prop"
                  :value="prop"
                  v-show="
                    !['file.name', 'file.ctime', 'file.mtime'].includes(prop)
                  "
                >
                  {{ prop }}
                </option>
              </select>
            </div>

            <div class="dv-table-direction-toggle">
              <button
                :class="{ active: sortDirection === 'asc' }"
                @click="setSortDirection('asc')"
                title="Sort ascending"
              >
                <i class="fas fa-sort-amount-up-alt"></i>
                <span>Ascending</span>
              </button>
              <button
                :class="{ active: sortDirection === 'desc' }"
                @click="setSortDirection('desc')"
                title="Sort descending"
              >
                <i class="fas fa-sort-amount-down"></i>
                <span>Descending</span>
              </button>
            </div>
          </div>

          <!-- Limit options -->
          <div class="dv-table-field-group dv-table-field-group--inline">
            <label class="dv-table-toggle">
              <input
                type="checkbox"
                v-model="useLimit"
                @change="handleLimitChange"
              />
              <span class="dv-table-toggle-slider"></span>
            </label>
            <span
              class="dv-table-toggle-label"
              :class="{ 'dv-table-toggle-label--disabled': !useLimit }"
            >
              Limit number of results
            </span>
          </div>

          <div
            v-if="useLimit"
            class="dv-table-input-wrapper dv-table-limit-input"
          >
            <i class="fas fa-calculator dv-table-input-icon"></i>
            <input
              type="number"
              class="dv-table-input dv-table-input--numeric"
              v-model.number="limitCount"
              min="1"
              max="1000"
              @change="handleLimitChange"
            />
            <span class="dv-table-input-suffix">rows maximum</span>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="dv-table-tips">
        <div class="dv-table-tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Dataview Tables</span>
        </div>
        <div class="dv-table-tips-content">
          <p>
            This creates a table view of notes based on your criteria. The
            columns you define will appear as specified in the table.
          </p>
          <p>
            Tip: Use clean column headers for better readability in your final
            table.
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
const useLimit = ref(true);
const limitCount = ref(5);

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
            header: asMatch[2].trim().replace(/^"|"$/g, ""), // Remove quotes if present
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

// This module dynamically generates correct markdown for Dataview or DataviewJS depending on whether `withoutId` is enabled.
//
// This is setup for `generateQuery()` to output a DataviewJS block when `withoutId` is true, since standard Dataview syntax cannot suppress the ID/File column.

function generateQuery(): string {
  // If the user chooses to hide the ID column, we must use DataviewJS
  if (withoutId.value) {
    const headers = tableColumns.value.map((c) => c.header || c.property);
    const propertyAccessors = tableColumns.value.map((c) => {
      const accessor = c.property.startsWith("file.")
        ? `p.${c.property}`
        : `p[\"${c.property}\"]`;
      return accessor;
    });

    // Build chained dv.pages() call
    let dvPagesCall = `dv.pages(\"`;
    if (sourceType.value === "folder" && selectedFolder.value) {
      dvPagesCall += selectedFolder.value;
    }
    dvPagesCall += `\")`;

    // WHERE filter
    if (
      sourceType.value === "property" &&
      selectedProperty.value &&
      propertyValue.value
    ) {
      const operator = propertyOperator.value;
      const val = JSON.stringify(propertyValue.value);
      if (operator === "contains") {
        dvPagesCall += `.where(p => p.${selectedProperty.value} && p.${selectedProperty.value}.includes(${val}))`;
      } else {
        dvPagesCall += `.where(p => p.${selectedProperty.value} ${operator} ${val})`;
      }
    }

    // SORT
    if (sortProperty.value) {
      dvPagesCall += `.sort(p => p.${sortProperty.value}, \"${sortDirection.value}\")`;
    }

    // LIMIT
    if (useLimit.value) {
      dvPagesCall += `.limit(${limitCount.value})`;
    }

    const js =
      `\`\`\`dataviewjs\n` +
      `dv.table(${JSON.stringify(headers)}, ${dvPagesCall}` +
      `.map(p => [${propertyAccessors.join(", ")}])` +
      `);\n\`\`\``;

    console.log("Generated DataviewJS query:", js);
    return js;
  }

  // Standard Dataview block
  let query = "```dataview\n";
  query += "TABLE ";

  const columnDefs = tableColumns.value.map((col) =>
    col.header ? `${col.property} AS \"${col.header}\"` : col.property
  );
  query += columnDefs.join(", ") + "\n";

  // FROM
  if (sourceType.value === "folder" && selectedFolder.value) {
    query += `FROM \"${selectedFolder.value}\"\n`;
  } else if (sourceType.value === "tag" && selectedTag.value) {
    query += `FROM #${selectedTag.value}\n`;
  } else {
    query += `FROM \"\"\n`;
  }

  // WHERE
  if (
    sourceType.value === "property" &&
    selectedProperty.value &&
    propertyValue.value
  ) {
    const formattedVal = isNaN(Number(propertyValue.value))
      ? `\"${propertyValue.value}\"`
      : propertyValue.value;
    if (propertyOperator.value === "contains") {
      query += `WHERE contains(${selectedProperty.value}, \"${propertyValue.value}\")\n`;
    } else {
      query += `WHERE ${selectedProperty.value} ${propertyOperator.value} ${formattedVal}\n`;
    }
  }

  if (sortProperty.value) {
    query += `SORT ${
      sortProperty.value
    } ${sortDirection.value.toUpperCase()}\n`;
  }

  if (useLimit.value) {
    query += `LIMIT ${limitCount.value}\n`;
  }

  query += "```";
  console.log("Generated query:", query);
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
.dv-table-builder {
  width: 100%;
  /* Dark glassmorphism base */
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
.dv-table-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-title-dark, #ffffff);
}

.dv-table-header-icon {
  font-size: 20px;
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-table-header-title {
  font-size: 18px;
  font-weight: 600;
}

/* --- Sections --- */
.dv-table-section {
  background: rgba(30, 36, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 18px;
  transition: box-shadow 0.2s ease-in-out;
}

.dv-table-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text-title-dark, #f0f0f5);
}

.dv-table-step-number {
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

.dv-table-section-icon {
  font-size: 16px;
  color: var(--icon-color-dark, #94a3b8);
}

.dv-table-section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex-grow: 1;
}

.dv-table-section-description {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: auto;
  padding-left: 10px;
}

.dv-table-section-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* --- Field Groups & Labels --- */
.dv-table-field-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dv-table-field-group--inline {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.dv-table-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-normal-dark, #e1e1e6);
  margin-bottom: 4px;
}

.dv-table-field-tip {
  font-size: 12px;
  color: var(--text-faint-dark, #717a8a);
  padding-left: 5px;
}

.dv-table-field-tip--inline {
  margin-left: 5px;
}

/* --- Inputs & Selects --- */
.dv-table-input,
.dv-table-select {
  padding: 9px 12px;
  background: rgba(15, 20, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-normal-dark, #e1e1e6);
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease-in-out;
}

.dv-table-input:focus,
.dv-table-select:focus {
  outline: none;
  border-color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
  background: rgba(30, 36, 50, 0.9);
}

.dv-table-input::placeholder {
  color: var(--text-faint-dark, #717a8a);
}

.dv-table-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 35px;
}

.dv-table-input--numeric {
  width: 100px;
  text-align: center;
}

.dv-table-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dv-table-input-wrapper--field .dv-table-input,
.dv-table-input-wrapper--select .dv-table-select {
  padding-left: 34px;
  flex-grow: 1;
}

.dv-table-input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-color-dark, #94a3b8);
  font-size: 13px;
  pointer-events: none;
}

.dv-table-input-suffix {
  font-size: 14px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: 5px;
}

.dv-table-limit-input {
  margin-left: 30px;
}

/* --- Action Button (Refresh) --- */
.dv-table-action-btn {
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

.dv-table-action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.dv-table-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dv-table-action-btn i {
  font-size: 13px;
}

/* --- Segmented Controls --- */
.dv-table-segmented-control {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
}

.dv-table-segmented-control button {
  flex: 1;
  padding: 7px 12px;
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

.dv-table-segmented-control button.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dv-table-segmented-control button i {
  font-size: 13px;
}

/* --- Direction Toggle --- */
.dv-table-direction-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 5px;
}

.dv-table-direction-toggle button {
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

.dv-table-direction-toggle button.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--interactive-accent-light, #60a5fa);
}

.dv-table-direction-toggle button i {
  font-size: 13px;
}

/* --- Property Filter --- */
.dv-table-property-filter {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr;
  gap: 8px;
  align-items: center;
  margin-top: 5px;
}

/* --- Table Columns --- */
.dv-table-columns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 5px;
}

.dv-table-columns-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-muted-dark, #94a3b8);
  font-size: 14px;
  font-style: italic;
}

.dv-table-column-card {
  background: rgba(20, 25, 35, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.dv-table-column-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dv-table-column-drag {
  color: #64748b;
  cursor: move;
  padding: 4px;
  font-size: 12px;
}

.dv-table-column-tag {
  background: rgba(96, 165, 250, 0.15);
  color: var(--interactive-accent-light, #60a5fa);
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
}

.dv-table-column-remove {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dv-table-column-remove:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.dv-table-column-remove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dv-table-column-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dv-table-add-column-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(96, 165, 250, 0.1);
  color: var(--interactive-accent-light, #60a5fa);
  border: 1px solid rgba(96, 165, 250, 0.2);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 5px;
}

.dv-table-add-column-btn:hover {
  background: rgba(96, 165, 250, 0.2);
}

/* Custom Toggle Switch */
.dv-table-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.dv-table-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dv-table-toggle-slider {
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

.dv-table-toggle-slider:before {
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

.dv-table-toggle input:checked + .dv-table-toggle-slider {
  background-color: var(--interactive-accent-light, #60a5fa);
  border-color: var(--interactive-accent-light, #60a5fa);
}

.dv-table-toggle input:focus-visible + .dv-table-toggle-slider {
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
}

.dv-table-toggle input:checked + .dv-table-toggle-slider:before {
  transform: translateX(18px);
  background-color: #fff;
}

.dv-table-toggle-label {
  font-size: 14px;
  color: var(--text-normal-dark, #e1e1e6);
  cursor: pointer;
  transition: color 0.2s;
}

.dv-table-toggle-label--disabled {
  color: var(--text-faint-dark, #717a8a);
}

/* Tips section */
.dv-table-tips {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
}

.dv-table-tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--interactive-accent-light, #60a5fa);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dv-table-tips-content {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  line-height: 1.5;
}

.dv-table-tips-content p {
  margin: 0 0 8px 0;
}

.dv-table-tips-content p:last-child {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .dv-table-segmented-control {
    flex-wrap: wrap;
  }

  .dv-table-segmented-control button {
    flex-basis: 50%;
  }

  .dv-table-property-filter {
    grid-template-columns: 1fr;
  }

  .dv-table-section-description {
    display: none;
  }

  .dv-table-direction-toggle {
    flex-direction: column;
  }

  .dv-table-field-group--inline {
    flex-direction: column;
    align-items: flex-start;
  }

  .dv-table-field-tip--inline {
    margin-left: 0;
    margin-top: 4px;
  }
}
</style>

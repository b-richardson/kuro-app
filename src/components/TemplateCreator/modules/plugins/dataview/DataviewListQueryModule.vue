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
    <div class="dataview-list-editor">
      <!-- Module Header -->
      <div class="dataview-list-editor__header">
        <div class="dataview-list-editor__header-icon">
          <i class="fas fa-database"></i>
        </div>
        <div class="dataview-list-editor__header-title">Dataview List</div>
      </div>

      <!-- Source Selection Section -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-filter"></i>
            <span>Choose Source</span>
          </div>
          <div class="dataview-list-editor__section-description">
            Select where to find your notes
          </div>
        </div>

        <div class="dataview-list-editor__source-selector">
          <button
            class="dataview-list-editor__source-card"
            :class="{
              'dataview-list-editor__source-card--active': sourceType === 'all',
            }"
            @click="setSourceType('all')"
          >
            <div class="dataview-list-editor__source-card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="dataview-list-editor__source-card-label">All Notes</div>
          </button>

          <button
            class="dataview-list-editor__source-card"
            :class="{
              'dataview-list-editor__source-card--active':
                sourceType === 'folder',
            }"
            @click="setSourceType('folder')"
          >
            <div class="dataview-list-editor__source-card-icon">
              <i class="fas fa-folder"></i>
            </div>
            <div class="dataview-list-editor__source-card-label">
              From Folder
            </div>
          </button>

          <button
            class="dataview-list-editor__source-card"
            :class="{
              'dataview-list-editor__source-card--active': sourceType === 'tag',
            }"
            @click="setSourceType('tag')"
          >
            <div class="dataview-list-editor__source-card-icon">
              <i class="fas fa-hashtag"></i>
            </div>
            <div class="dataview-list-editor__source-card-label">With Tag</div>
          </button>

          <button
            class="dataview-list-editor__source-card"
            :class="{
              'dataview-list-editor__source-card--active':
                sourceType === 'property',
            }"
            @click="setSourceType('property')"
          >
            <div class="dataview-list-editor__source-card-icon">
              <i class="fas fa-key"></i>
            </div>
            <div class="dataview-list-editor__source-card-label">
              With Property
            </div>
          </button>
        </div>

        <!-- Configuration Panel -->
        <div class="dataview-list-editor__config-panel">
          <!-- Folder Selection -->
          <div
            v-if="sourceType === 'folder'"
            class="dataview-list-editor__config-content"
          >
            <div class="dataview-list-editor__field-group">
              <label class="dataview-list-editor__label">Select Folder</label>
              <div class="dataview-list-editor__input-group">
                <select
                  class="dataview-list-editor__select"
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
                  class="dataview-list-editor__action-btn"
                  title="Refresh folder list"
                  @click="fetchFolders"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
              <div class="dataview-list-editor__field-tip">
                Only include notes from this folder
              </div>
            </div>
          </div>

          <!-- Tag Selection -->
          <div
            v-if="sourceType === 'tag'"
            class="dataview-list-editor__config-content"
          >
            <div class="dataview-list-editor__field-group">
              <label class="dataview-list-editor__label">Select Tag</label>
              <div class="dataview-list-editor__input-group">
                <select
                  class="dataview-list-editor__select"
                  v-model="selectedTag"
                  @change="handleSourceValueChange"
                >
                  <option disabled value="">Select a tag</option>
                  <option v-for="tag in availableTags" :key="tag" :value="tag">
                    #{{ tag }}
                  </option>
                </select>
                <button
                  class="dataview-list-editor__action-btn"
                  title="Refresh tag list"
                  @click="fetchTags"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
              <div class="dataview-list-editor__field-tip">
                Only include notes with this tag
              </div>
            </div>
          </div>

          <!-- Property Selection -->
          <div
            v-if="sourceType === 'property'"
            class="dataview-list-editor__config-content"
          >
            <div class="dataview-list-editor__field-group">
              <label class="dataview-list-editor__label"
                >Filter by Property</label
              >

              <div class="dataview-list-editor__property-field">
                <div class="dataview-list-editor__property-name">
                  <select
                    class="dataview-list-editor__select"
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

                <div class="dataview-list-editor__property-operator">
                  <select
                    class="dataview-list-editor__select"
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

                <div class="dataview-list-editor__property-value">
                  <input
                    type="text"
                    class="dataview-list-editor__text-input"
                    placeholder="Value"
                    v-model="propertyValue"
                    @input="handlePropertyValueChange"
                  />
                </div>

                <button
                  class="dataview-list-editor__action-btn"
                  title="Refresh property list"
                  @click="fetchProperties"
                >
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>

              <div class="dataview-list-editor__field-tip">
                Only include notes where this property matches the condition
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Display Properties Section -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-list"></i>
            <span>Display Properties</span>
          </div>
          <div class="dataview-list-editor__section-description">
            Choose what information to show for each note
          </div>
        </div>

        <!-- Properties Tags -->
        <div class="dataview-list-editor__field-group">
          <div class="dataview-list-editor__properties">
            <div
              v-for="(prop, index) in displayProperties"
              :key="index"
              class="dataview-list-editor__property-tag"
            >
              <span>{{ prop }}</span>
              <button
                class="dataview-list-editor__property-tag-remove"
                @click="removeDisplayProperty(index)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div
              v-if="displayProperties.length === 0"
              class="dataview-list-editor__properties-empty"
            >
              No properties selected (will show default list)
            </div>
          </div>

          <!-- Add property input -->
          <div class="dataview-list-editor__add-property">
            <div class="dataview-list-editor__add-property-field">
              <input
                type="text"
                class="dataview-list-editor__text-input"
                placeholder="Add property..."
                v-model="newDisplayProperty"
                list="available-properties"
                @keydown.enter.prevent="addDisplayProperty"
              />
              <datalist id="available-properties">
                <option
                  v-for="prop in availableProperties"
                  :key="prop"
                  :value="prop"
                ></option>
              </datalist>
            </div>
            <button
              class="dataview-list-editor__add-btn"
              @click="addDisplayProperty"
              :disabled="!newDisplayProperty"
            >
              <i class="fas fa-plus"></i>
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Limit Results Section (moved from advanced) -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-calculator"></i>
            <span>Limit Results</span>
          </div>
          <div class="dataview-list-editor__section-description">
            Control how many results are in your list
          </div>
        </div>
        <div class="dataview-list-editor__field-group">
          <div class="dataview-list-editor__checkbox">
            <input
              type="checkbox"
              id="limit-toggle"
              v-model="useLimit"
              @change="handleLimitChange"
            />
            <label for="limit-toggle">Limit number of results</label>
          </div>
          <div class="dataview-list-editor__limit-value" v-if="useLimit">
            <input
              type="number"
              class="dataview-list-editor__text-input dataview-list-editor__number-input"
              v-model.number="limitCount"
              min="1"
              max="1000"
              @change="handleLimitChange"
            />
            <div class="dataview-list-editor__field-tip">
              Maximum number of results to display
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Options Section -->
      <div class="dataview-list-editor__section">
        <button
          class="dataview-list-editor__advanced-toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span>{{
            showAdvanced ? "Hide advanced options" : "Show advanced options"
          }}</span>
          <i
            :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          ></i>
        </button>

        <div v-if="showAdvanced" class="dataview-list-editor__advanced-panel">
          <!-- Sort Section -->
          <div class="dataview-list-editor__field-group">
            <label class="dataview-list-editor__label">
              <i class="fas fa-sort"></i>
              Sort Results
            </label>

            <div class="dataview-list-editor__sort-property">
              <select
                class="dataview-list-editor__select"
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

            <div class="dataview-list-editor__sort-direction">
              <div class="dataview-list-editor__radio-group">
                <label class="dataview-list-editor__radio">
                  <input
                    type="radio"
                    name="sortDirection"
                    :value="'asc'"
                    v-model="sortDirection"
                    @change="handleSortChange"
                  />
                  <span class="dataview-list-editor__radio-text">
                    <i class="fas fa-sort-amount-down-alt"></i>
                    Ascending
                  </span>
                </label>

                <label class="dataview-list-editor__radio">
                  <input
                    type="radio"
                    name="sortDirection"
                    :value="'desc'"
                    v-model="sortDirection"
                    @change="handleSortChange"
                  />
                  <span class="dataview-list-editor__radio-text">
                    <i class="fas fa-sort-amount-down"></i>
                    Descending
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="dataview-list-editor__tips">
        <div class="dataview-list-editor__tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Dataview Lists</span>
        </div>
        <div class="dataview-list-editor__tips-content">
          <p>
            This creates a list of notes based on your criteria. The results
            will appear in your note as a list with the properties you've
            selected.
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

// Obsidian data
const availableFolders = ref<{ name: string; path: string; parent: string }[]>([
  { name: "Root", path: "", parent: "" },
]);
const availableTags = ref<string[]>([]);
const availableProperties = ref<string[]>([]);

// Define a mapping between user-friendly names and Dataview properties
const propertyMappings: Record<string, string> = {
  // UI-friendly name -> Dataview property
  Title: "file.name",
  "Creation Date": "file.ctime",
  "Modified Date": "file.mtime",
  Size: "file.size",
  Path: "file.path",
  Folder: "file.folder",
  Tags: "tags",
  Date: "date",
  Status: "status",
  Priority: "priority",
  "Due Date": "due",
  Completed: "completed",
};

// And the reverse mapping for display purposes
const reversePropertyMappings: Record<string, string> = Object.entries(
  propertyMappings
).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

// Display options
const displayProperties = ref<string[]>([]);
const newDisplayProperty = ref("");

// Sort options
const sortProperty = ref("file.name");
const sortDirection = ref("asc");

// Limit options
const useLimit = ref(true);
const limitCount = ref(5);

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
    console.error("Error initializing DataviewListModule:", error);
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

    // Use the keys from our propertyMappings for user-friendly property names
    availableProperties.value = Object.keys(propertyMappings);

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

    // Basic parsing for LIST queries
    // This is a simplified parser that won't handle all possible Dataview syntax
    const lines = cleanQuery.split("\n").map((line) => line.trim());

    // Parse LIST part and display properties
    const listMatch = lines[0].match(/^LIST\s+(.+)$/i);
    if (listMatch) {
      const propsString = listMatch[1];
      const props = propsString.split(/,(?![^(]*\))/g).map((p) => p.trim());
      if (props[0] !== "*") {
        // Convert Dataview properties to friendly names
        displayProperties.value = props.map(
          (prop) => reversePropertyMappings[prop] || prop
        );
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

    // Parse SORT part
    const sortLine = lines.find((line) => line.startsWith("SORT"));
    if (sortLine) {
      const sortMatch = sortLine.match(/^SORT\s+(.+?)(\s+(ASC|DESC))?$/i);
      if (sortMatch) {
        const dataviewProp = sortMatch[1].trim();
        // Convert from Dataview property to friendly name
        sortProperty.value =
          reversePropertyMappings[dataviewProp] || dataviewProp;
        sortDirection.value = sortMatch[3]?.toLowerCase() || "asc";
      }
    } else {
      // Default sort - use friendly name for file.name
      sortProperty.value = "Title"; // Instead of "file.name"
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
    showAdvanced.value = !!sortLine || !!limitLine;

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
  console.log("Sort changed to:", sortProperty.value, sortDirection.value);
  regenerateQuery();
}

function handleLimitChange() {
  regenerateQuery();
}

// Display Properties Management
function addDisplayProperty() {
  if (
    newDisplayProperty.value &&
    !displayProperties.value.includes(newDisplayProperty.value)
  ) {
    displayProperties.value.push(newDisplayProperty.value);
    console.log("Added property:", newDisplayProperty.value);
    console.log("Current displayProperties:", displayProperties.value);
    newDisplayProperty.value = "";
    regenerateQuery();
  }
}
function removeDisplayProperty(index: number) {
  displayProperties.value.splice(index, 1);
  regenerateQuery();
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // LIST part - convert friendly names to actual properties
  if (displayProperties.value.length > 0) {
    const mappedProps = displayProperties.value.map(
      (friendlyName) => propertyMappings[friendlyName] || friendlyName
    );
    query += `LIST ${mappedProps.join(", ")}\n`;
  } else {
    query += "LIST\n";
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

  // SORT part
  if (sortProperty.value) {
    const mappedSortProp =
      propertyMappings[sortProperty.value] || sortProperty.value;
    query += `SORT ${mappedSortProp} ${sortDirection.value.toUpperCase()}\n`;
  }

  // LIMIT part
  if (useLimit.value && limitCount.value > 0) {
    query += `LIMIT ${limitCount.value}\n`;
  }

  console.log("Query before this += thing", query);

  query += "```";
  console.log("Final query:", query);
  return query;
}

// Generate the query and update the module content
function regenerateQuery() {
  const query = generateQuery();
  console.log("Updating content with query:", query);
  updateContent([query]);
}

// Update content in parent component
function updateContent(content: string[]) {
  emit("update:content", content);
}
</script>

<style scoped>
.dataview-list-editor {
  width: 100%;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.dataview-list-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dataview-list-editor__header-icon {
  color: #60a5fa;
  font-size: 18px;
}

.dataview-list-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Section styling */
.dataview-list-editor__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dataview-list-editor__section-header {
  margin-bottom: 4px;
}

.dataview-list-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  color: #e2e8f0;
}

.dataview-list-editor__section-description {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

/* Source selection */
.dataview-list-editor__source-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.dataview-list-editor__source-card {
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

.dataview-list-editor__source-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.dataview-list-editor__source-card--active {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}

.dataview-list-editor__source-card-icon {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}

.dataview-list-editor__source-card-label {
  font-size: 14px;
}

/* Configuration Panel */
.dataview-list-editor__config-panel {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.dataview-list-editor__config-content {
  padding: 16px;
}

/* Form field groups */
.dataview-list-editor__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.dataview-list-editor__field-group:last-child {
  margin-bottom: 0;
}

.dataview-list-editor__label {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dataview-list-editor__field-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.dataview-list-editor__input-group {
  display: flex;
  gap: 8px;
}

/* Text inputs */
.dataview-list-editor__text-input {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s;
}

.dataview-list-editor__text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.dataview-list-editor__text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

/* Select dropdown */
.dataview-list-editor__select {
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

.dataview-list-editor__select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

/* Button styling */
.dataview-list-editor__action-btn {
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

.dataview-list-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Property fields */
.dataview-list-editor__property-field {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}

/* Properties display */
.dataview-list-editor__properties {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 38px;
  padding: 4px;
}

.dataview-list-editor__properties-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 38px;
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
}

.dataview-list-editor__property-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.dataview-list-editor__property-tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.dataview-list-editor__property-tag-remove:hover {
  opacity: 1;
}

.dataview-list-editor__add-property {
  display: flex;
  gap: 8px;
}

.dataview-list-editor__add-property-field {
  flex: 1;
}

.dataview-list-editor__add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dataview-list-editor__add-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
}

.dataview-list-editor__add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Advanced panel */
.dataview-list-editor__advanced-toggle {
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

.dataview-list-editor__advanced-toggle:hover {
  color: #e2e8f0;
}

.dataview-list-editor__advanced-panel {
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
.dataview-list-editor__sort-property {
  margin-bottom: 12px;
}

.dataview-list-editor__sort-direction {
  margin-top: 4px;
}

.dataview-list-editor__radio-group {
  display: flex;
  gap: 16px;
}

.dataview-list-editor__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-list-editor__radio input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.dataview-list-editor__radio input[type="radio"]:checked {
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-list-editor__radio input[type="radio"]:checked::after {
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

.dataview-list-editor__radio-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* Checkbox styling */
.dataview-list-editor__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dataview-list-editor__checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.dataview-list-editor__checkbox input[type="checkbox"]:checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.8);
}

.dataview-list-editor__checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.dataview-list-editor__checkbox label {
  font-size: 14px;
  cursor: pointer;
}

.dataview-list-editor__limit-value {
  margin-top: 8px;
  margin-left: 26px;
}

.dataview-list-editor__number-input {
  width: 100px;
  text-align: center;
}

/* Tips section */
.dataview-list-editor__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dataview-list-editor__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dataview-list-editor__tips-content {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-list-editor__source-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-list-editor__property-field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dataview-list-editor__radio-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

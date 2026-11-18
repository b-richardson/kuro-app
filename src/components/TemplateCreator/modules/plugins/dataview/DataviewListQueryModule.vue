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
    <div class="dv-list-builder">
      <!-- Module Header -->
      <div class="dv-list-header">
        <div class="dv-list-header-icon">
          <i class="fas fa-list-ul"></i>
        </div>
        <div class="dv-list-header-title">Dataview List</div>
      </div>

      <!-- Step 1: Source Selection -->
      <div class="dv-list-section">
        <div class="dv-list-section-header">
          <span class="dv-list-step-number">1</span>
          <i class="fas fa-filter dv-list-section-icon"></i>
          <h3 class="dv-list-section-title">Choose Source</h3>
          <span class="dv-list-section-description"
            >Where to find notes to list?</span
          >
        </div>

        <div class="dv-list-section-content">
          <div class="dv-list-field-group">
            <div class="dv-list-segmented-control">
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
              class="dv-list-input-wrapper dv-list-input-wrapper--select"
            >
              <i class="fas fa-folder dv-list-input-icon"></i>
              <select
                class="dv-list-select"
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
                class="dv-list-action-btn dv-list-action-btn--refresh"
                title="Refresh folder list"
                @click="fetchFolders"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>

            <!-- Tag Selection -->
            <div
              v-if="sourceType === 'tag'"
              class="dv-list-input-wrapper dv-list-input-wrapper--select"
            >
              <i class="fas fa-tag dv-list-input-icon"></i>
              <select
                class="dv-list-select"
                v-model="selectedTag"
                @change="handleSourceValueChange"
              >
                <option disabled value="">Select a tag...</option>
                <option v-for="tag in availableTags" :key="tag" :value="tag">
                  #{{ tag }}
                </option>
              </select>
              <button
                class="dv-list-action-btn dv-list-action-btn--refresh"
                title="Refresh tag list"
                @click="fetchTags"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>

            <!-- Property Selection -->
            <div
              v-if="sourceType === 'property'"
              class="dv-list-property-filter"
            >
              <div class="dv-list-input-wrapper dv-list-input-wrapper--select">
                <i class="fas fa-key dv-list-input-icon"></i>
                <select
                  class="dv-list-select"
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

              <div class="dv-list-input-wrapper dv-list-input-wrapper--select">
                <select
                  class="dv-list-select"
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

              <div class="dv-list-input-wrapper">
                <input
                  type="text"
                  class="dv-list-input"
                  placeholder="Value"
                  v-model="propertyValue"
                  @input="handlePropertyValueChange"
                />

                <button
                  class="dv-list-action-btn"
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

      <!-- Step 2: Display Properties -->
      <div class="dv-list-section">
        <div class="dv-list-section-header">
          <span class="dv-list-step-number">2</span>
          <i class="fas fa-table-columns dv-list-section-icon"></i>
          <h3 class="dv-list-section-title">Display Properties</h3>
          <span class="dv-list-section-description"
            >What to show in results</span
          >
        </div>

        <div class="dv-list-section-content">
          <div class="dv-list-property-tags">
            <div
              v-if="displayProperties.length === 0"
              class="dv-list-property-tags-empty"
            >
              No properties selected (will show default list)
            </div>
            <div v-else class="dv-list-property-tags-container">
              <div
                v-for="(prop, index) in displayProperties"
                :key="index"
                class="dv-list-property-tag"
              >
                <span>{{ prop }}</span>
                <button
                  class="dv-list-property-tag-remove"
                  @click="removeDisplayProperty(index)"
                  aria-label="Remove property"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="dv-list-add-property">
            <div class="dv-list-input-wrapper dv-list-input-wrapper--with-btn">
              <i class="fas fa-plus-circle dv-list-input-icon"></i>
              <input
                type="text"
                class="dv-list-input"
                placeholder="Add property..."
                v-model="newDisplayProperty"
                list="available-properties"
                @keydown.enter.prevent="addDisplayProperty"
              />
              <button
                class="dv-list-action-btn dv-list-action-btn--add"
                @click="addDisplayProperty"
                :disabled="!newDisplayProperty"
                title="Add property"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <datalist id="available-properties">
              <option
                v-for="prop in availableProperties"
                :key="prop"
                :value="prop"
              ></option>
            </datalist>
          </div>
        </div>
      </div>

      <!-- Step 3: Sorting -->
      <div class="dv-list-section">
        <div class="dv-list-section-header">
          <span class="dv-list-step-number">3</span>
          <i class="fas fa-sort dv-list-section-icon"></i>
          <h3 class="dv-list-section-title">Sort Results</h3>
          <span class="dv-list-section-description">How to order the list</span>
        </div>

        <div class="dv-list-section-content">
          <div class="dv-list-field-group">
            <div class="dv-list-input-wrapper dv-list-input-wrapper--select">
              <i class="fas fa-sort-alpha-down dv-list-input-icon"></i>
              <select
                class="dv-list-select"
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

            <div class="dv-list-direction-toggle">
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
        </div>
      </div>

      <!-- Step 4: Optional Settings -->
      <div class="dv-list-section dv-list-section--optional">
        <div
          class="dv-list-section-header dv-list-section-header--toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span class="dv-list-step-number dv-list-step-number--optional"
            >?</span
          >
          <i class="fas fa-sliders-h dv-list-section-icon"></i>
          <h3 class="dv-list-section-title">List Options</h3>
          <i
            :class="[
              'fas',
              showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down',
              'dv-list-section-toggle-icon',
            ]"
          ></i>
        </div>

        <div
          v-if="showAdvanced"
          class="dv-list-section-content dv-list-section-content--collapsible"
        >
          <div class="dv-list-field-group dv-list-field-group--inline">
            <label class="dv-list-toggle">
              <input
                type="checkbox"
                v-model="useLimit"
                @change="handleLimitChange"
              />
              <span class="dv-list-toggle-slider"></span>
            </label>
            <span
              class="dv-list-toggle-label"
              :class="{ 'dv-list-toggle-label--disabled': !useLimit }"
            >
              Limit number of results
            </span>
          </div>

          <div
            v-if="useLimit"
            class="dv-list-input-wrapper dv-list-limit-input"
          >
            <i class="fas fa-calculator dv-list-input-icon"></i>
            <input
              type="number"
              class="dv-list-input dv-list-input--numeric"
              v-model.number="limitCount"
              min="1"
              max="1000"
              @change="handleLimitChange"
            />
            <span class="dv-list-input-suffix">results</span>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="dv-list-tips">
        <div class="dv-list-tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>About Dataview Lists</span>
        </div>
        <div class="dv-list-tips-content">
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
    showAdvanced.value = !!limitLine;

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
.dv-list-builder {
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
.dv-list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-title-dark, #ffffff);
}

.dv-list-header-icon {
  font-size: 20px;
  color: var(--interactive-accent-light, #60a5fa); /* Bright accent */
}

.dv-list-header-title {
  font-size: 18px;
  font-weight: 600;
}

/* --- Sections --- */
.dv-list-section {
  background: rgba(30, 36, 50, 0.6); /* Darker section background */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 18px;
  transition: box-shadow 0.2s ease-in-out;
}

.dv-list-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text-title-dark, #f0f0f5);
}
.dv-list-section-header--toggle {
  cursor: pointer;
  margin-bottom: 0; /* Remove bottom margin when toggleable */
  transition: background-color 0.15s ease-out;
  border-radius: 6px;
  padding: 5px 8px;
  margin: -5px -8px 10px -8px; /* Adjust padding/margin to make clickable area nice */
}
.dv-list-section-header--toggle:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.dv-list-step-number {
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
.dv-list-step-number--optional {
  background-color: rgba(148, 163, 184, 0.5); /* Grey for optional */
  color: var(--text-normal-dark, #e1e1e6);
}

.dv-list-section-icon {
  font-size: 16px;
  color: var(--icon-color-dark, #94a3b8); /* Muted light icon color */
}

.dv-list-section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex-grow: 1; /* Allow title to take space */
}
.dv-list-section-description {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: auto; /* Push description to the right */
  padding-left: 10px;
}
.dv-list-section-toggle-icon {
  margin-left: auto;
  color: var(--icon-color-dark, #94a3b8);
  transition: transform 0.2s ease-out;
}
.dv-list-section-header--toggle i.fa-chevron-up {
  transform: rotate(180deg);
}

.dv-list-section-content {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Consistent gap */
}
.dv-list-section-content--collapsible {
  padding-top: 15px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Field Groups & Labels --- */
.dv-list-field-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dv-list-field-group--inline {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.dv-list-field-tip {
  font-size: 12px;
  color: var(--text-faint-dark, #717a8a);
  padding-left: 5px;
}

/* --- Inputs & Selects --- */
.dv-list-input,
.dv-list-select {
  padding: 9px 12px;
  background: rgba(15, 20, 30, 0.7); /* Darker input background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-normal-dark, #e1e1e6);
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease-in-out;
}
.dv-list-input:focus,
.dv-list-select:focus {
  outline: none;
  border-color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
  background: rgba(30, 36, 50, 0.9);
}
.dv-list-input::placeholder {
  color: var(--text-faint-dark, #717a8a);
}
.dv-list-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 35px;
}
.dv-list-input--numeric {
  width: 100px;
  text-align: center;
}

.dv-list-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px; /* Gap between icon/input/button */
}
.dv-list-input-wrapper--field .dv-list-input,
.dv-list-input-wrapper--select .dv-list-select {
  padding-left: 34px; /* Space for icon */
  flex-grow: 1; /* Allow input/select to grow */
}
.dv-list-input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-color-dark, #94a3b8);
  font-size: 13px;
  pointer-events: none; /* Don't interfere with clicks */
}
.dv-list-input-wrapper--with-btn .dv-list-input {
  padding-left: 34px;
}
.dv-list-input-suffix {
  font-size: 14px;
  color: var(--text-muted-dark, #94a3b8);
  margin-left: 5px;
}
.dv-list-limit-input {
  margin-left: 30px;
}

/* --- Action Button (Refresh/Add) --- */
.dv-list-action-btn {
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
.dv-list-action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.dv-list-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dv-list-action-btn i {
  font-size: 13px;
}
.dv-list-action-btn--add {
  color: var(--interactive-accent-light, #60a5fa);
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.2);
}
.dv-list-action-btn--add:hover:not(:disabled) {
  background: rgba(96, 165, 250, 0.2);
}

/* --- Segmented Controls --- */
.dv-list-segmented-control {
  display: flex;
  background: rgba(0, 0, 0, 0.2); /* Darker base */
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%; /* Make it take full width */
}
.dv-list-segmented-control button {
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
.dv-list-segmented-control button.active {
  background: rgba(255, 255, 255, 0.1); /* Subtle light active state */
  color: var(--interactive-accent-light, #60a5fa);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.dv-list-segmented-control button i {
  font-size: 13px; /* Slightly larger icons */
}

/* --- Direction Toggle --- */
.dv-list-direction-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.2); /* Darker base */
  border-radius: 6px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 5px;
}
.dv-list-direction-toggle button {
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
.dv-list-direction-toggle button.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--interactive-accent-light, #60a5fa);
}
.dv-list-direction-toggle button i {
  font-size: 13px;
}

/* --- Property Filter --- */
.dv-list-property-filter {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr;
  gap: 8px;
  align-items: center;
  margin-top: 5px;
}

/* --- Property Tags --- */
.dv-list-property-tags {
  background: rgba(15, 20, 30, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px;
  min-height: 60px;
}
.dv-list-property-tags-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  color: var(--text-faint-dark, #717a8a);
  font-style: italic;
  font-size: 14px;
}
.dv-list-property-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.dv-list-property-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(96, 165, 250, 0.15);
  color: var(--interactive-accent-light, #60a5fa);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
}
.dv-list-property-tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.15s;
  font-size: 11px;
}
.dv-list-property-tag-remove:hover {
  opacity: 1;
}

/* --- Add Property --- */
.dv-list-add-property {
  margin-top: 5px;
}

/* Custom Toggle Switch */
.dv-list-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0; /* Prevent toggle from shrinking */
}
.dv-list-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.dv-list-toggle-slider {
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
.dv-list-toggle-slider:before {
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
.dv-list-toggle input:checked + .dv-list-toggle-slider {
  background-color: var(--interactive-accent-light, #60a5fa);
  border-color: var(--interactive-accent-light, #60a5fa);
}
.dv-list-toggle input:focus-visible + .dv-list-toggle-slider {
  /* Use focus-visible */
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
}
.dv-list-toggle input:checked + .dv-list-toggle-slider:before {
  transform: translateX(18px);
  background-color: #fff; /* White knob when active */
}
.dv-list-toggle-label {
  font-size: 14px;
  color: var(--text-normal-dark, #e1e1e6);
  cursor: pointer; /* Make label clickable too */
  transition: color 0.2s;
}
.dv-list-toggle-label--disabled {
  color: var(--text-faint-dark, #717a8a);
}

/* Tips section */
.dv-list-tips {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
}

.dv-list-tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--interactive-accent-light, #60a5fa);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.dv-list-tips-content {
  font-size: 13px;
  color: var(--text-muted-dark, #94a3b8);
  line-height: 1.5;
}

.dv-list-tips-content p {
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .dv-list-segmented-control {
    flex-wrap: wrap;
  }
  .dv-list-segmented-control button {
    flex-basis: 50%; /* Two buttons per row */
  }
  .dv-list-property-filter {
    grid-template-columns: 1fr;
  }
  .dv-list-section-description {
    display: none; /* Hide description on small screens */
  }
  .dv-list-direction-toggle {
    flex-direction: column;
  }
}
</style>

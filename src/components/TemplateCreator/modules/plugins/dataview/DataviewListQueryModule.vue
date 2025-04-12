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
    <div class="dataview-builder">
      <!-- Header -->
      <div class="dv-header">
        <div class="dv-header-icon">
          <i class="fas fa-stream"></i>
        </div>
        <div class="dv-header-title">Dataview List Builder</div>
      </div>

      <!-- Section 1: Source -->
      <div class="dv-section">
        <div class="dv-section-header">
          <span class="dv-step-number">1</span>
          <i class="fas fa-search dv-section-icon"></i>
          <h3 class="dv-section-title">Find Notes</h3>
        </div>
        <div class="dv-section-content">
          <div class="dv-field-group">
            <label class="dv-label">Look for notes:</label>
            <div class="dv-segmented-control">
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
              <button
                :class="{ active: sourceType === 'property' }"
                @click="setSourceType('property')"
              >
                <i class="fas fa-key"></i> With Property
              </button>
            </div>
          </div>

          <!-- Folder Source -->
          <div v-if="sourceType === 'folder'" class="dv-field-group">
            <label class="dv-label">Select Folder</label>
            <div class="dv-input-wrapper">
              <i class="fas fa-folder dv-input-icon"></i>
              <select
                class="dv-input"
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
              <button class="dv-remove-button" @click="fetchFolders">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <!-- Tag Source -->
          <div v-if="sourceType === 'tag'" class="dv-field-group">
            <label class="dv-label">Select Tag</label>
            <div class="dv-input-wrapper">
              <span class="dv-tag-prefix">#</span>
              <select
                class="dv-input"
                v-model="selectedTag"
                @change="handleSourceValueChange"
              >
                <option disabled value="">Select a tag</option>
                <option v-for="tag in availableTags" :key="tag" :value="tag">
                  {{ tag }}
                </option>
              </select>
              <button class="dv-remove-button" @click="fetchTags">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <!-- Property Source -->
          <div v-if="sourceType === 'property'" class="dv-field-group">
            <label class="dv-label">Filter by Property</label>
            <div class="dv-filter-row">
              <select
                class="dv-input dv-input--filter-prop"
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
              <select
                class="dv-select dv-select--filter-op"
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
              <input
                type="text"
                class="dv-input dv-input--filter-value"
                placeholder="Value"
                v-model="propertyValue"
                @input="handlePropertyValueChange"
              />
              <button class="dv-remove-button" @click="fetchProperties">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Display Properties -->
      <div class="dv-section">
        <div class="dv-section-header">
          <span class="dv-step-number">2</span>
          <i class="fas fa-info-circle dv-section-icon"></i>
          <h3 class="dv-section-title">Show Information</h3>
        </div>
        <div class="dv-section-content">
          <div class="dv-display-fields-list">
            <div
              v-for="(prop, index) in displayProperties"
              :key="index"
              class="dv-display-field"
            >
              <i class="fas fa-sticky-note"></i>
              <span>{{ prop }}</span>
              <button
                class="dv-remove-button dv-remove-button--display"
                @click="removeDisplayProperty(index)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div
              v-if="displayProperties.length === 0"
              class="dv-display-field dv-display-field--default"
            >
              <i class="fas fa-sticky-note"></i>
              <span>No properties selected (will show default list)</span>
            </div>
          </div>
          <div class="dv-field-group">
            <div class="dv-input-wrapper">
              <input
                type="text"
                class="dv-input"
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
              <button
                class="dv-add-button"
                @click="addDisplayProperty"
                :disabled="!newDisplayProperty"
              >
                <i class="fas fa-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Arrange & Limit -->
      <div class="dv-section">
        <div class="dv-section-header">
          <span class="dv-step-number">3</span>
          <i class="fas fa-sort-amount-down dv-section-icon"></i>
          <h3 class="dv-section-title">Arrange & Limit</h3>
        </div>
        <div class="dv-section-content dv-section-content--arrange">
          <div class="dv-field-group dv-field-group--sort">
            <label class="dv-label">Sort by:</label>
            <div class="dv-sort-controls">
              <select
                class="dv-input"
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
              <div class="dv-segmented-control dv-segmented-control--sort">
                <button
                  :class="{ active: sortDirection === 'asc' }"
                  @click="setSortDirection('asc')"
                >
                  <i class="fas fa-arrow-up"></i> Asc
                </button>
                <button
                  :class="{ active: sortDirection === 'desc' }"
                  @click="setSortDirection('desc')"
                >
                  <i class="fas fa-arrow-down"></i> Desc
                </button>
              </div>
            </div>
          </div>

          <div class="dv-field-group dv-field-group--limit">
            <label class="dv-label">Limit results:</label>
            <div class="dv-limit-controls">
              <label class="dv-toggle">
                <input
                  type="checkbox"
                  v-model="useLimit"
                  @change="handleLimitChange"
                />
                <span class="dv-toggle-slider"></span>
              </label>
              <input
                v-if="useLimit"
                type="number"
                class="dv-input dv-input--limit-count"
                min="1"
                step="1"
                v-model.number="limitCount"
                @change="handleLimitChange"
              />
              <span v-if="useLimit" class="dv-limit-label">items</span>
              <span v-else class="dv-limit-label dv-limit-label--disabled"
                >Show all</span
              >
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
/* --- Base & Glassmorphism --- */
.dataview-builder {
  width: 100%;
  /* Light glassmorphism base */
  /* background: rgba(255, 255, 255, 0.3); */
  /* background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%); */
  background: var(
    --background-secondary-alt-om,
    rgba(235, 237, 242, 0.6)
  ); /* Use CSS var or fallback */
  backdrop-filter: blur(10px); /* Apply blur */
  -webkit-backdrop-filter: blur(10px); /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  color: var(--text-normal, #2e3338); /* Darker text for light background */
  font-family: var(--font-interface, sans-serif);
  display: flex;
  flex-direction: column;
  gap: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* --- Header --- */
.dv-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: var(--text-title, #1a1d21);
}

.dv-header-icon {
  font-size: 20px;
  color: var(--interactive-accent, #4a7de7);
}

.dv-header-title {
  font-size: 18px;
  font-weight: 600;
}

/* --- Sections --- */
.dv-section {
  background: rgba(255, 255, 255, 0.4); /* Slightly more opaque */
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 18px;
  transition: box-shadow 0.2s ease-in-out;
}
/* .dv-section:hover {
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
} */

.dv-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text-title, #1a1d21);
}

.dv-step-number {
  background-color: var(--interactive-accent, #4a7de7);
  color: white;
  font-size: 11px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dv-section-icon {
  font-size: 16px;
  color: var(--icon-color, #5c6166);
}

.dv-section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.dv-section-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.dv-section-content--arrange {
  flex-direction: row;
  gap: 25px;
  align-items: flex-start;
}

/* --- Field Groups & Labels --- */
.dv-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dv-field-group--sort,
.dv-field-group--limit {
  flex: 1; /* Share space in arrange section */
}

.dv-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted, #5c6166);
}

/* --- Inputs & Selects --- */
.dv-input,
.dv-select {
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  color: var(--text-normal, #2e3338);
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease-in-out;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}
.dv-input:focus,
.dv-select:focus {
  outline: none;
  border-color: var(--interactive-accent, #4a7de7);
  box-shadow: 0 0 0 2px rgba(74, 125, 231, 0.2);
  background: white;
}
.dv-input::placeholder {
  color: var(--text-faint, #989ea4);
}
.dv-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235c6166' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 35px;
}

.dv-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.dv-input-wrapper--source .dv-input {
  padding-left: 32px;
}
.dv-input-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted, #5c6166);
  font-size: 14px;
}
.dv-tag-prefix {
  position: absolute;
  left: 10px;
  color: var(--text-muted, #5c6166);
  font-size: 14px;
  font-weight: 500;
}
.dv-input-wrapper--source .dv-tag-prefix + .dv-input {
  padding-left: 25px;
}

/* --- Segmented Controls --- */
.dv-segmented-control {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.dv-segmented-control button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-muted, #5c6166);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.dv-segmented-control button.active {
  background: white;
  color: var(--interactive-accent, #4a7de7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.dv-segmented-control button i {
  font-size: 12px;
}
.dv-segmented-control--sort {
  padding: 3px;
}
.dv-segmented-control--sort button {
  padding: 4px 10px;
  font-size: 12px;
}

/* --- Filters --- */
.dv-filters-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 20px; /* Indent filters */
  border-left: 2px solid rgba(0, 0, 0, 0.08);
  margin-left: 10px;
}
.dv-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.3);
  padding: 8px 10px;
  border-radius: 6px;
}
.dv-filter-type {
  font-size: 11px;
  font-weight: bold;
  color: var(--text-accent, #4a7de7);
  background: rgba(74, 125, 231, 0.1);
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
.dv-input--filter-prop {
  width: 150px;
  flex-shrink: 0;
}
.dv-select--filter-op {
  width: 120px;
  flex-shrink: 0;
}
.dv-input--filter-value {
  flex-grow: 1;
}

.dv-filters-empty {
  font-size: 13px;
  color: var(--text-muted, #5c6166);
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  text-align: center;
  border: 1px dashed rgba(0, 0, 0, 0.08);
}

/* --- Display Fields --- */
.dv-display-fields-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  min-height: 40px;
  align-items: center;
}
.dv-display-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 4px 4px 4px 8px; /* Less padding left */
  border-radius: 6px;
  font-size: 13px;
}
.dv-display-field--default {
  background: transparent;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  color: var(--text-muted, #5c6166);
  padding: 4px 8px;
}
.dv-display-field--default i {
  color: var(--text-faint, #989ea4);
}
.dv-display-field i {
  color: var(--interactive-accent, #4a7de7);
  font-size: 12px;
  margin-right: 2px;
}
.dv-input--display-field {
  padding: 2px 6px;
  font-size: 13px;
  background: transparent;
  border: none;
  box-shadow: none;
  width: auto; /* Adjust width based on content */
  min-width: 100px;
}
.dv-input--display-field:focus {
  background: rgba(74, 125, 231, 0.05);
}

/* --- Remove Buttons --- */
.dv-remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  color: var(--text-muted, #5c6166);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  font-size: 10px;
}
.dv-remove-button:hover {
  background: var(--background-modifier-error, #da5858);
  color: white;
}
.dv-remove-button--display {
  width: 18px;
  height: 18px;
  font-size: 9px;
}

/* --- Add Button --- */
.dv-add-button {
  align-self: flex-start; /* Don't stretch full width */
  padding: 6px 12px;
  background: rgba(74, 125, 231, 0.1);
  border: 1px solid rgba(74, 125, 231, 0.2);
  color: var(--interactive-accent, #4a7de7);
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dv-add-button:hover {
  background: rgba(74, 125, 231, 0.2);
  border-color: rgba(74, 125, 231, 0.4);
}
.dv-add-button i {
  font-size: 11px;
}

/* --- Arrange & Limit --- */
.dv-sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.dv-input--sort-prop {
  flex-grow: 1;
}
.dv-limit-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dv-input--limit-count {
  width: 70px;
  text-align: center;
  padding-right: 12px; /* Adjust for number arrows */
}
.dv-limit-label {
  font-size: 13px;
  color: var(--text-muted, #5c6166);
}
.dv-limit-label--disabled {
  color: var(--text-faint, #989ea4);
}

/* Custom Toggle Switch */
.dv-toggle {
  position: relative;
  display: inline-block;
  width: 40px; /* Slightly smaller */
  height: 22px; /* Slightly smaller */
}
.dv-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.dv-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  border-radius: 22px;
}
.dv-toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px; /* Smaller knob */
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  border-radius: 50%;
}
.dv-toggle input:checked + .dv-toggle-slider {
  background-color: var(--interactive-accent, #4a7de7);
  border-color: var(--interactive-accent, #4a7de7);
}
.dv-toggle input:focus + .dv-toggle-slider {
  box-shadow: 0 0 0 2px rgba(74, 125, 231, 0.2);
}
.dv-toggle input:checked + .dv-toggle-slider:before {
  transform: translateX(18px);
}

/* --- Preview Section --- */
.dv-preview-section {
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 12px 15px;
}
.dv-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted, #5c6166);
  margin-bottom: 8px;
}
.dv-preview-code {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 10px;
  font-family: var(--font-monospace, monospace);
  font-size: 13px;
  color: var(--text-normal, #2e3338);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
.dv-preview-code code {
  background: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}
</style>

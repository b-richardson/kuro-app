<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    @add-line="regenerateQuery"
    ref="baseModuleRef"
  >
    <!-- Module Header -->
    <div class="dataview-list-editor">
      <!-- Alert for when not connected to Obsidian -->
      <div v-if="!obsidianConnected" class="dataview-list-editor__alert">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Not connected to Obsidian. Some features may be limited.</span>
      </div>

      <!-- Source Selection Section -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-filter"></i>
            Source Selection
          </div>
        </div>

        <div class="dataview-list-editor__source-options">
          <button
            class="dataview-list-editor__source-option"
            :class="{ active: sourceType === 'all' }"
            @click="setSourceType('all')"
          >
            All notes
          </button>
          <button
            class="dataview-list-editor__source-option"
            :class="{ active: sourceType === 'folder' }"
            @click="setSourceType('folder')"
          >
            From folder
          </button>
          <button
            class="dataview-list-editor__source-option"
            :class="{ active: sourceType === 'tag' }"
            @click="setSourceType('tag')"
          >
            With tag
          </button>
          <button
            class="dataview-list-editor__source-option"
            :class="{ active: sourceType === 'property' }"
            @click="setSourceType('property')"
          >
            With property
          </button>
        </div>

        <!-- Folder Selection -->
        <div
          v-if="sourceType === 'folder'"
          class="dataview-list-editor__source-details"
        >
          <div class="dataview-list-editor__field">
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
        </div>

        <!-- Tag Selection -->
        <div
          v-if="sourceType === 'tag'"
          class="dataview-list-editor__source-details"
        >
          <div class="dataview-list-editor__field">
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
        </div>

        <!-- Property Selection -->
        <div
          v-if="sourceType === 'property'"
          class="dataview-list-editor__source-details"
        >
          <div class="dataview-list-editor__property-field">
            <!-- Property name -->
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

            <!-- Operator -->
            <select
              class="dataview-list-editor__select dataview-list-editor__operator-select"
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
              class="dataview-list-editor__input"
              placeholder="Value"
              v-model="propertyValue"
              @input="handlePropertyValueChange"
            />

            <button
              class="dataview-list-editor__action-btn"
              title="Refresh property list"
              @click="fetchProperties"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Display Options Section -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-list"></i>
            Display Properties
          </div>
        </div>

        <!-- Properties Tags -->
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
        </div>

        <!-- Add property input -->
        <div class="dataview-list-editor__add-property">
          <input
            type="text"
            class="dataview-list-editor__input"
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
            class="dataview-list-editor__add-btn"
            @click="addDisplayProperty"
            :disabled="!newDisplayProperty"
          >
            <i class="fas fa-plus"></i>
            Add
          </button>
        </div>
      </div>

      <!-- Sort Section -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-sort"></i>
            Sort Results
          </div>
        </div>

        <div class="dataview-list-editor__sort-controls">
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

          <div class="dataview-list-editor__sort-direction">
            <button
              class="dataview-list-editor__direction-btn"
              :class="{ active: sortDirection === 'asc' }"
              @click="setSortDirection('asc')"
            >
              <i class="fas fa-sort-amount-down-alt"></i>
              Ascending
            </button>
            <button
              class="dataview-list-editor__direction-btn"
              :class="{ active: sortDirection === 'desc' }"
              @click="setSortDirection('desc')"
            >
              <i class="fas fa-sort-amount-down"></i>
              Descending
            </button>
          </div>
        </div>
      </div>

      <!-- Limit Section -->
      <div class="dataview-list-editor__section">
        <div class="dataview-list-editor__section-header">
          <div class="dataview-list-editor__section-title">
            <i class="fas fa-sliders-h"></i>
            Limit Results
          </div>
        </div>

        <div class="dataview-list-editor__limit-controls">
          <div class="dataview-list-editor__limit-field">
            <input
              type="number"
              class="dataview-list-editor__input dataview-list-editor__number-input"
              v-model.number="limitCount"
              min="1"
              max="1000"
              @change="handleLimitChange"
              :disabled="!useLimit"
            />
            <label class="dataview-list-editor__limit-toggle">
              <input
                type="checkbox"
                v-model="useLimit"
                @change="handleLimitChange"
              />
              <span class="dataview-list-editor__toggle-slider"></span>
              <span class="dataview-list-editor__toggle-label"
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
import { ref, onMounted, watch } from "vue";
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

// Connection state
const obsidianConnected = ref(false);

// Source selection
const sourceType = ref("all");
const selectedFolder = ref("");
const selectedTag = ref("");
const selectedProperty = ref("");
const propertyOperator = ref("=");
const propertyValue = ref("");

// Obsidian data
const availableFolders = ref<{ name: string; path: string; parent: string }[]>(
  []
);
const availableTags = ref<string[]>([]);
const availableProperties = ref<string[]>([]);

// Display options
const displayProperties = ref<string[]>([]);
const newDisplayProperty = ref("");

// Sort options
const sortProperty = ref("file.name");
const sortDirection = ref("asc");

// Limit options
const useLimit = ref(false);
const limitCount = ref(20);

// Initialize component
onMounted(async () => {
  try {
    // Check if connected to Obsidian
    obsidianConnected.value = await checkObsidianConnection();

    if (obsidianConnected.value) {
      // Fetch initial data
      await Promise.all([fetchFolders(), fetchTags(), fetchProperties()]);
    }

    // Parse existing content if it exists
    if (props.module.content.length > 0) {
      parseExistingQuery(props.module.content[0]);
    } else {
      // Generate initial query
      regenerateQuery();
    }
  } catch (error) {
    console.error("Error initializing DataviewListModule:", error);
    baseModuleRef.value?.displayToast("Failed to connect to Obsidian", "error");
  }
});

// Check if we can connect to Obsidian
async function checkObsidianConnection(): Promise<boolean> {
  try {
    if (!obsidianApiService.isInitialized()) {
      return false;
    }
    return await obsidianApiService.checkConnection();
  } catch (error) {
    console.error("Obsidian connection check failed:", error);
    return false;
  }
}

// Fetch available folders from Obsidian
async function fetchFolders() {
  if (!obsidianConnected.value) return;

  try {
    console.log("Fetching vault info...");
    const vaultInfo = await obsidianApiService.getVaultInfo();
    console.log("Vault info received:", vaultInfo);

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
    } else {
      console.log("No files found or unexpected structure, using fallback");
      availableFolders.value = [{ name: "Root", path: "", parent: "" }];
    }

    baseModuleRef.value?.displayToast("Folders updated", "success");
  } catch (err) {
    console.log("Error fetching folders:", err);
    availableFolders.value = [{ name: "Root", path: "", parent: "" }];
    baseModuleRef.value?.displayToast("Failed to fetch folders", "error");
  }
}

// Fetch available tags from Obsidian
async function fetchTags() {
  if (!obsidianConnected.value) return;

  try {
    // Use a TABLE query instead of LIST with FLATTEN
    const dql = `TABLE file.tags AS Tags FROM "" WHERE file.tags`;

    const results = await obsidianApiService.searchWithDataview(dql);
    console.log("Tags query results:", results);

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

    baseModuleRef.value?.displayToast("Tags updated", "success");
  } catch (err) {
    console.log("Error fetching tags:", err);
    // Fallback to some example tags
    availableTags.value = [
      "project",
      "todo",
      "idea",
      "journal",
      "note",
      "meeting",
    ];
    baseModuleRef.value?.displayToast("Using default tags", "info");
  }
}

// Fetch available properties from Obsidian
async function fetchProperties() {
  if (!obsidianConnected.value) return;

  try {
    // Use a TABLE query to get file properties
    const dql = `TABLE file.name AS FileName FROM "" LIMIT 10`;

    const results = await obsidianApiService.searchWithDataview(dql);
    console.log("Property query results:", results);

    // For now, use the standard properties since we can't easily extract
    // all frontmatter keys with a single query
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

    // If we get sample files, we could look up their frontmatter in a second query
    // but that would require multiple API calls

    baseModuleRef.value?.displayToast("Properties updated", "success");
  } catch (err) {
    console.log("Error fetching properties:", err);
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
    baseModuleRef.value?.displayToast("Using default properties", "info");
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
      // Split by commas outside of parentheses to handle functions like date(file.ctime)
      const props = propsString.split(/,(?![^(]*\))/g).map((p) => p.trim());
      if (props[0] !== "*") {
        displayProperties.value = props;
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

// Display Properties Management
function addDisplayProperty() {
  if (
    newDisplayProperty.value &&
    !displayProperties.value.includes(newDisplayProperty.value)
  ) {
    displayProperties.value.push(newDisplayProperty.value);
    newDisplayProperty.value = "";
    regenerateQuery();
    baseModuleRef.value?.displayToast("Property added", "success");
  }
}

function removeDisplayProperty(index: number) {
  displayProperties.value.splice(index, 1);
  regenerateQuery();
  baseModuleRef.value?.displayToast("Property removed", "info");
}

// Query generation
function generateQuery(): string {
  let query = "```dataview\n";

  // LIST part
  if (displayProperties.value.length > 0) {
    query += `LIST ${displayProperties.value.join(", ")}\n`;
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

// Watch for Obsidian connection changes
watch(obsidianConnected, async (isConnected) => {
  if (isConnected) {
    await Promise.all([fetchFolders(), fetchTags(), fetchProperties()]);
  }
});
</script>

<style scoped>
.dataview-list-editor {
  width: 100%;
  color: #cbd5e1;
}

.dataview-list-editor__alert {
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
.dataview-list-editor__section {
  margin-bottom: 20px;
}

.dataview-list-editor__section-header {
  margin-bottom: 12px;
}

.dataview-list-editor__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  color: #e2e8f0;
}

/* Source selection */
.dataview-list-editor__source-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.dataview-list-editor__source-option {
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

.dataview-list-editor__source-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-list-editor__source-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dataview-list-editor__source-details {
  margin-top: 12px;
}

.dataview-list-editor__field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dataview-list-editor__property-field {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}

.dataview-list-editor__select {
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

.dataview-list-editor__select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-list-editor__operator-select {
  font-size: 0.8125rem;
}

.dataview-list-editor__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100%;
}

.dataview-list-editor__input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.dataview-list-editor__action-btn {
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

.dataview-list-editor__action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Display properties */
.dataview-list-editor__properties {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.dataview-list-editor__property-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 171, 88, 0.15);
  color: #ffab58;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8125rem;
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

.dataview-list-editor__add-btn {
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

.dataview-list-editor__add-btn:hover:not(:disabled) {
  background: rgba(255, 171, 88, 0.2);
}

.dataview-list-editor__add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sort controls */
.dataview-list-editor__sort-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataview-list-editor__sort-direction {
  display: flex;
  gap: 8px;
}

.dataview-list-editor__direction-btn {
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

.dataview-list-editor__direction-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dataview-list-editor__direction-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Limit controls */
.dataview-list-editor__limit-controls {
  margin-top: 8px;
}

.dataview-list-editor__limit-field {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dataview-list-editor__number-input {
  width: 80px;
  text-align: center;
}

.dataview-list-editor__limit-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.dataview-list-editor__toggle-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: 0.3s;
}

.dataview-list-editor__toggle-slider:before {
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

.dataview-list-editor__limit-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dataview-list-editor__limit-toggle
  input:checked
  + .dataview-list-editor__toggle-slider {
  background-color: rgba(255, 171, 88, 0.6);
}

.dataview-list-editor__limit-toggle
  input:checked
  + .dataview-list-editor__toggle-slider:before {
  transform: translateX(20px);
}

.dataview-list-editor__toggle-label {
  font-size: 0.875rem;
  color: #e2e8f0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dataview-list-editor__source-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataview-list-editor__property-field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dataview-list-editor__sort-controls,
  .dataview-list-editor__limit-field {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

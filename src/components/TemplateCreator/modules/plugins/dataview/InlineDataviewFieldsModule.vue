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
    <!-- Connection Status Alert -->
    <div v-if="!obsidianConnected" class="connection-alert">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Not connected to Obsidian. Some features may be limited.</span>
    </div>

    <!-- Source Selection -->
    <div class="section">
      <div class="section-title">Source Selection</div>

      <div class="source-selection">
        <div class="source-option-container">
          <div class="source-radio" :class="{ active: sourceType === 'all' }">
            <input
              type="radio"
              id="source-all"
              v-model="sourceType"
              value="all"
              @change="handleSourceTypeChange"
            />
            <label for="source-all">All notes</label>
          </div>

          <div
            class="source-radio"
            :class="{ active: sourceType === 'folder' }"
          >
            <input
              type="radio"
              id="source-folder"
              v-model="sourceType"
              value="folder"
              @change="handleSourceTypeChange"
            />
            <label for="source-folder">From folder</label>
          </div>

          <div class="source-radio" :class="{ active: sourceType === 'tag' }">
            <input
              type="radio"
              id="source-tag"
              v-model="sourceType"
              value="tag"
              @change="handleSourceTypeChange"
            />
            <label for="source-tag">With tag</label>
          </div>

          <div
            class="source-radio"
            :class="{ active: sourceType === 'property' }"
          >
            <input
              type="radio"
              id="source-property"
              v-model="sourceType"
              value="property"
              @change="handleSourceTypeChange"
            />
            <label for="source-property">With property</label>
          </div>
        </div>

        <!-- Source Type Specific Controls -->
        <div v-if="sourceType === 'folder'" class="source-controls">
          <select
            v-model="selectedFolder"
            class="select-input"
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
            class="refresh-button"
            @click="fetchFolders"
            title="Refresh folders"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>

        <div v-if="sourceType === 'tag'" class="source-controls">
          <select
            v-model="selectedTag"
            class="select-input"
            @change="handleSourceValueChange"
          >
            <option disabled value="">Select a tag</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">
              #{{ tag }}
            </option>
          </select>
          <button
            class="refresh-button"
            @click="fetchTags"
            title="Refresh tags"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>

        <div
          v-if="sourceType === 'property'"
          class="source-controls property-controls"
        >
          <select
            v-model="selectedProperty"
            class="select-input property-select"
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
            v-model="propertyOperator"
            class="select-input operator-select"
            @change="handlePropertyOperatorChange"
          >
            <option value="=">equals</option>
            <option value="!=">not equals</option>
            <option value=">">greater than</option>
            <option value="<">less than</option>
            <option value=">=">greater or equal</option>
            <option value="<=">less or equal</option>
            <option value="contains">contains</option>
          </select>

          <input
            type="text"
            v-model="propertyValue"
            class="text-input"
            placeholder="Value"
            @input="handlePropertyValueChange"
          />

          <button
            class="refresh-button"
            @click="fetchProperties"
            title="Refresh properties"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Display Options -->
    <div class="section">
      <div class="section-title">Display Settings</div>

      <div>
        <div class="properties-label">Properties to display:</div>
        <div class="properties-list">
          <div
            v-for="(prop, index) in displayProperties"
            :key="index"
            class="property-tag"
          >
            {{ prop }}
            <button
              class="property-remove"
              @click="removeDisplayProperty(index)"
              title="Remove property"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="add-property">
          <input
            type="text"
            class="text-input"
            placeholder="Add property..."
            v-model="newDisplayProperty"
            list="available-properties"
          />
          <datalist id="available-properties">
            <option
              v-for="prop in availableProperties"
              :key="prop"
              :value="prop"
            >
              {{ prop }}
            </option>
          </datalist>
          <button
            class="add-button"
            @click="addDisplayProperty"
            :disabled="!newDisplayProperty"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Sort Options -->
    <div class="section">
      <div class="section-title">Sort Settings</div>

      <div class="sort-controls">
        <select
          v-model="sortProperty"
          class="select-input"
          @change="handleSortChange"
        >
          <option disabled value="">Sort by...</option>
          <option value="file.name">File name</option>
          <option value="file.ctime">Creation time</option>
          <option value="file.mtime">Modified time</option>
          <option v-for="prop in availableProperties" :key="prop" :value="prop">
            {{ prop }}
          </option>
        </select>

        <div class="sort-direction">
          <div class="sort-radio" :class="{ active: sortDirection === 'asc' }">
            <input
              type="radio"
              id="sort-asc"
              v-model="sortDirection"
              value="asc"
              @change="handleSortChange"
            />
            <label for="sort-asc">Ascending</label>
          </div>
          <div class="sort-radio" :class="{ active: sortDirection === 'desc' }">
            <input
              type="radio"
              id="sort-desc"
              v-model="sortDirection"
              value="desc"
              @change="handleSortChange"
            />
            <label for="sort-desc">Descending</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Limit Options -->
    <div class="section">
      <div class="section-title">Limit Results</div>

      <div class="limit-controls">
        <div class="limit-label">Maximum results:</div>
        <input
          type="number"
          v-model.number="limitCount"
          class="text-input number-input"
          min="1"
          max="1000"
          @change="handleLimitChange"
        />
        <div class="limit-checkbox">
          <input
            type="checkbox"
            id="use-limit"
            v-model="useLimit"
            @change="handleLimitChange"
          />
          <label for="use-limit">Apply limit</label>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
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
    const vaultInfo = await obsidianApiService.getVaultInfo();
    availableFolders.value = [
      { name: "Root", path: "", parent: "" },
      ...vaultInfo.folders.map((folder) => ({
        name: folder.split("/").pop() || folder,
        path: folder,
        parent: folder.split("/").slice(0, -1).join("/"),
      })),
    ];
    baseModuleRef.value?.displayToast("Folders updated", "success");
  } catch (error) {
    console.error("Error fetching folders:", error);
    baseModuleRef.value?.displayToast("Failed to fetch folders", "error");
  }
}

// Fetch available tags from Obsidian
async function fetchTags() {
  if (!obsidianConnected.value) return;

  try {
    // This is a simplified approach - in a real implementation,
    // you would use a Dataview query to get all available tags
    const dql = `LIST FLATTEN(tags) AS tag FROM "" WHERE tags GROUP BY tag`;
    const results = await obsidianApiService.searchWithDataview(dql);

    // Extract tag names from results
    const tags = new Set<string>();
    results.forEach((result) => {
      if (result.tag && typeof result.tag === "string") {
        tags.add(result.tag.replace(/^#/, ""));
      }
    });

    availableTags.value = Array.from(tags);
    baseModuleRef.value?.displayToast("Tags updated", "success");
  } catch (error) {
    console.error("Error fetching tags:", error);
    baseModuleRef.value?.displayToast("Failed to fetch tags", "error");

    // Fallback to some example tags
    availableTags.value = ["project", "todo", "idea", "journal"];
  }
}

// Fetch available properties from Obsidian
async function fetchProperties() {
  if (!obsidianConnected.value) return;

  try {
    // In a real implementation, use a Dataview query to get all properties
    // This is a simplified approach
    const dql = `TABLE WITHOUT ID rows.key AS Property FROM (FLATTEN(Object.entries(file.frontmatter)) as rows) GROUP BY rows.key SORT rows.key ASC`;
    const results = await obsidianApiService.searchWithDataview(dql);

    // Extract property names from results
    const props = new Set<string>();
    results.forEach((result) => {
      if (result.Property && typeof result.Property === "string") {
        props.add(result.Property);
      }
    });

    // Add common built-in properties
    [
      "file.name",
      "file.ctime",
      "file.mtime",
      "file.size",
      "file.path",
      "file.folder",
    ].forEach((prop) => {
      props.add(prop);
    });

    availableProperties.value = Array.from(props);
    baseModuleRef.value?.displayToast("Properties updated", "success");
  } catch (error) {
    console.error("Error fetching properties:", error);
    baseModuleRef.value?.displayToast("Failed to fetch properties", "error");

    // Fallback to common properties
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
function handleSourceTypeChange() {
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
    newDisplayProperty.value = ""; // Use .value to update the ref
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
/* Global styles */
.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
  color: white;
}

/* Connection alert */
.connection-alert {
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

/* Source selection */
.source-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-option-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.source-radio {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  cursor: pointer;
}

.source-radio.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.source-radio input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.source-radio label {
  cursor: pointer;
  display: block;
  width: 100%;
  font-size: 0.875rem;
}

.source-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.property-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
}

.select-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  padding: 6px 10px;
  width: 100%;
  font-size: 0.875rem;
  height: 34px;
}

.select-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.property-select,
.operator-select {
  width: 100%;
}

.text-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  padding: 6px 10px;
  width: 100%;
  font-size: 0.875rem;
  height: 34px;
}

.text-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.refresh-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.refresh-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Display settings */
.properties-label {
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.properties-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.property-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
}

.property-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.property-remove:hover {
  opacity: 1;
}

.add-property {
  display: flex;
  gap: 8px;
}

.add-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sort settings */
.sort-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.sort-direction {
  display: flex;
  gap: 8px;
}

.sort-radio {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  cursor: pointer;
}

.sort-radio.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.sort-radio input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.sort-radio label {
  cursor: pointer;
  font-size: 0.875rem;
}

/* Limit settings */
.limit-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.limit-label {
  font-size: 0.875rem;
}

.number-input {
  width: 60px;
  text-align: center;
}

.limit-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.limit-checkbox input {
  accent-color: #a855f7;
}

/* Query preview */
.query-preview {
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #ddd;
  white-space: pre-wrap;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.query-preview pre {
  margin: 0;
  padding-right: 30px; /* Space for copy button */
}

.copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
}

.copy-button:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}
</style>

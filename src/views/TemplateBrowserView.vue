<template>
  <div class="template-browser-applet">
    <!-- Applet Header -->
    <div class="browser-header glass-card">
      <h1>Template Browser</h1>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search templates..."
        class="search-input"
      />
    </div>

    <!-- Applet Content Area -->
    <div class="browser-content">
      <!-- Left Panel: Browsing (Categories + Grid) -->
      <div class="browser-main-panel">
        <!-- Category Filters -->
        <div class="category-filters">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['category-chip', { active: selectedCategory === cat }]"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Template Grid -->
        <div class="template-grid-container">
          <div v-if="filteredTemplates.length === 0" class="no-results">
            No templates found.
          </div>
          <div v-else class="template-grid">
            <div
              v-for="template in filteredTemplates"
              :key="template.path"
              class="template-card glass-card"
              :class="{ selected: selectedTemplate?.path === template.path }"
              @click="selectTemplate(template)"
            >
              <i class="fas fa-file-alt template-icon"></i>
              <!-- Optional Icon -->
              <div class="template-info">
                <h3>{{ template.title }}</h3>
                <p class="template-category">{{ template.category }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Preview & Actions -->
      <div class="browser-detail-panel glass-card">
        <template v-if="selectedTemplate">
          <div class="panel-header">
            <!-- Maybe show selected template title here too -->
            <h2>{{ selectedTemplate.title }} Preview</h2>
          </div>
          <div class="preview-content">
            <ObsidianEditor
              :content="selectedTemplate.content"
              :readOnly="true"
            />
          </div>
          <div class="detail-actions">
            <button
              class="action-button"
              :disabled="!selectedTemplate"
              @click="installTemplate"
            >
              <i class="fas fa-download"></i>
              Push to Vault
            </button>
          </div>
        </template>
        <template v-else>
          <div class="placeholder-content">
            <i class="fas fa-eye placeholder-icon"></i>
            <p>Select a template to preview it here.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ObsidianEditor from "@/components/obsidian/ObsidianEditor.vue";
import { useTemplateLibrary } from "@/utils/templateLibraryUtils";
import { useObsidianStore } from "@/stores/obsidian";
import { useUIStore } from "@/stores/ui";

// Assume FontAwesome is available or replace icons as needed
// import '@fortawesome/fontawesome-free/css/all.css'; // If needed

const { templates } = useTemplateLibrary();
const obsidianStore = useObsidianStore();
const uiStore = useUIStore();

const selectedTemplate = ref<(typeof templates.value)[0] | null>(null);
const selectedCategory = ref("All");
const searchQuery = ref("");

const categories = computed(() => {
  // Ensure 'All' is always first, even if no templates exist
  const uniqueCategories = new Set(templates.value.map((t) => t.category));
  // Filter out empty/null categories if necessary
  const sortedCategories = Array.from(uniqueCategories).filter(Boolean).sort();
  return ["All", ...sortedCategories];
});

const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  // Optional: Don't reset selected template if it still fits the category?
  // For simplicity, we reset it here.
  // if (selectedTemplate.value && selectedTemplate.value.category !== cat && cat !== 'All') {
  selectedTemplate.value = null;
  // }
};

const selectTemplate = (template: any) => {
  selectedTemplate.value = template;
};

const filteredTemplates = computed(() => {
  if (!templates.value) return []; // Guard against undefined templates
  return templates.value.filter((t) => {
    const matchesCategory =
      selectedCategory.value === "All" || t.category === selectedCategory.value;
    const matchesSearch =
      !searchQuery.value || // Show all if search is empty
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.value.toLowerCase()); // Optional: search category too
    return matchesCategory && matchesSearch;
  });
});

const installTemplate = async () => {
  if (!selectedTemplate.value || !obsidianStore.isConnected) return;
  try {
    // Suggest placing templates in a dedicated folder, maybe configurable later
    const vaultTemplatesFolder = "Templates"; // Or get from settings
    const fileName = `${selectedTemplate.value.title}.md`;
    // Basic sanitization (replace potentially problematic characters)
    const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, "_");
    const destination = `${vaultTemplatesFolder}/${safeFileName}`;

    await obsidianStore.createOrUpdateFile(
      destination,
      selectedTemplate.value.content
    );
    uiStore.showToast(
      `Pushed '${safeFileName}' to '${vaultTemplatesFolder}' in your vault`,
      "success"
    );
  } catch (err: any) {
    console.error("Failed to push template:", err);
    uiStore.showToast(
      `Failed to push template: ${err.message || "Unknown error"}`,
      "error"
    );
  }
};
</script>

<style scoped>
/* Use CSS Variables defined in your main app */
:root {
  /* Re-declare some common ones here for clarity, */
  /* but ideally inherit them from a global scope */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --color-primary: #007bff; /* Example Primary */
  --color-text: #e0e0e0;
  --color-text-secondary: #a0a0a0;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-backdrop-blur: 10px; /* Example */
}

.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
  border-radius: var(--radius-md);
}

/* Overall Applet Container */
.template-browser-applet {
  display: flex;
  flex-direction: column;
  height: 100%; /* Occupy parent's height */
  width: 100%; /* Occupy parent's width */
  overflow: hidden; /* Prevent content spill */
  background: rgba(
    0,
    0,
    0,
    0.1
  ); /* Subtle darker background to make applet pop */
  border-radius: var(--radius-lg); /* Rounded corners for the "applet" feel */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); /* Optional shadow */
}

/* Header Styling */
.browser-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  flex-shrink: 0; /* Prevent header from shrinking */
}

.browser-header h1 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--color-text);
}

.search-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) 12px;
  color: var(--color-text);
  width: 300px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(0, 0, 0, 0.3);
}

/* Main Content Area Layout */
.browser-content {
  display: flex;
  flex: 1; /* Take remaining vertical space */
  overflow: hidden; /* Important for child scrolling */
  padding: var(--spacing-md);
  gap: var(--spacing-md);
}

/* Left Panel: Browsing */
.browser-main-panel {
  display: flex;
  flex-direction: column;
  flex: 1; /* Takes up available space, adjust ratio with right panel if needed */
  min-width: 300px; /* Minimum width */
  overflow: hidden; /* Needed for child scrolling */
}

/* Category Filters Styling */
.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0; /* Prevent filters from shrinking */
}

.category-chip {
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  border: 1px solid transparent;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-lg); /* Pill shape */
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

.category-chip:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--color-text);
}

.category-chip.active {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  border-color: transparent; /* Or slightly darker primary */
}

/* Template Grid Area */
.template-grid-container {
  flex: 1; /* Allows grid to take remaining space in left panel */
  overflow-y: auto; /* Enable vertical scroll ONLY for the grid */
  padding-right: var(--spacing-sm); /* Space for scrollbar */
}

.template-grid {
  display: grid;
  /* Responsive grid: Adjust minmax as needed */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.no-results {
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--spacing-lg);
}

/* Template Card Styling */
.template-card {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center; /* Align icon and text */
  gap: var(--spacing-md);
  overflow: hidden; /* Prevent content overflow */
}

.template-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.template-card.selected {
  outline: 2px solid var(--color-primary);
  background: rgba(var(--color-primary), 0.1); /* Subtle background tint */
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.3);
}

.template-icon {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.template-info {
  overflow: hidden; /* Prevent text overflow */
}

.template-card h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Add ellipsis for long titles */
  color: var(--color-text);
}

.template-category {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Right Panel: Preview & Actions */
.browser-detail-panel {
  display: flex;
  flex-direction: column;
  flex: 1.5; /* Takes slightly more space, adjust ratio as needed */
  min-width: 350px; /* Minimum width */
  overflow: hidden; /* Contains scrolling within */
  padding: var(--spacing-md);
}

.panel-header {
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-content {
  flex: 1; /* Takes available space */
  overflow-y: auto; /* Scroll preview content */
  margin-bottom: var(--spacing-md);
  /* Style the editor container if needed */
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
}

/* Placeholder styling when no template is selected */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

/* Action Button Area */
.detail-actions {
  display: flex;
  justify-content: flex-end; /* Align button to the right */
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--glass-border);
  flex-shrink: 0; /* Prevent actions area from shrinking */
}

.action-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 20px; /* Slightly larger button */
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.action-button i {
  font-size: 0.9em;
}

.action-button:hover:not(:disabled) {
  background-color: color-mix(
    in srgb,
    var(--color-primary),
    #000 10%
  ); /* Darken primary on hover */
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: color-mix(
    in srgb,
    var(--color-primary),
    #fff 50%
  ); /* Lighter when disabled */
}

/* Custom Scrollbars (Optional but nice touch) */
.template-grid-container::-webkit-scrollbar,
.preview-content::-webkit-scrollbar {
  width: 8px;
}

.template-grid-container::-webkit-scrollbar-track,
.preview-content::-webkit-scrollbar-track {
  background: transparent;
}

.template-grid-container::-webkit-scrollbar-thumb,
.preview-content::-webkit-scrollbar-thumb {
  background-color: var(--glass-border);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.template-grid-container::-webkit-scrollbar-thumb:hover,
.preview-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-secondary);
}
</style>

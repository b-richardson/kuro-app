<template>
  <div class="template-browser-view">
    <!-- Top Toolbar -->
    <div class="top-toolbar glass-card">
      <h1>Template Browser</h1>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search templates..."
        class="search-input"
      />
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Left Panel: Categories (optional for now) -->
      <div class="left-panel">
        <h2>Categories</h2>
        <ul class="category-list">
          <li
            v-for="cat in categories"
            :key="cat"
            :class="{ active: selectedCategory === cat }"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </li>
        </ul>
      </div>

      <!-- Center Panel: Template Cards -->
      <div class="center-panel">
        <div class="template-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.path"
            class="template-card glass-card"
            :class="{ selected: selectedTemplate?.path === template.path }"
            @click="selectTemplate(template)"
          >
            <h3>{{ template.title }}</h3>
            <p class="template-category">{{ template.category }}</p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div class="right-panel glass-card">
        <div class="panel-header">
          <h2>Preview</h2>
        </div>
        <div class="preview-content">
          <ObsidianEditor
            v-if="selectedTemplate"
            :content="selectedTemplate.content"
            :readOnly="true"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Toolbar -->
    <div class="bottom-toolbar glass-card">
      <button
        class="action-button"
        :disabled="!selectedTemplate"
        @click="installTemplate"
      >
        <i class="fas fa-download"></i>
        Push to Vault
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ObsidianEditor from "@/components/obsidian/ObsidianEditor.vue";
import { useTemplateLibrary } from "@/utils/templateLibraryUtils";
import { useObsidianStore } from "@/stores/obsidian";
import { useUIStore } from "@/stores/ui";

const { templates } = useTemplateLibrary();
const obsidianStore = useObsidianStore();
const uiStore = useUIStore();

const selectedTemplate = ref<(typeof templates.value)[0] | null>(null);
const selectedCategory = ref("All");
const searchQuery = ref("");

const categories = computed(() => {
  const cats = new Set(templates.value.map((t) => t.category));
  return ["All", ...Array.from(cats)];
});

const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  selectedTemplate.value = null;
};

const selectTemplate = (template: any) => {
  selectedTemplate.value = template;
};

const filteredTemplates = computed(() => {
  return templates.value.filter((t) => {
    const matchesCategory =
      selectedCategory.value === "All" || t.category === selectedCategory.value;
    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

const installTemplate = async () => {
  if (!selectedTemplate.value || !obsidianStore.isConnected) return;
  try {
    const fileName = `${selectedTemplate.value.title}.md`;
    const destination = `Templates/${fileName}`;
    await obsidianStore.createOrUpdateFile(
      destination,
      selectedTemplate.value.content
    );
    uiStore.showToast(`Pushed '${fileName}' to your vault`, "success");
  } catch (err: any) {
    console.error(err);
    uiStore.showToast(`Failed to push template: ${err.message}`, "error");
  }
};
</script>

<style scoped>
.template-browser-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
}

.search-input {
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  color: var(--color-text);
  width: 250px;
}

.main-content {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
}

.left-panel {
  border-right: 1px solid var(--glass-border);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-list li {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.category-list li:hover,
.category-list li.active {
  background-color: rgba(255, 255, 255, 0.05);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-md);
}

.template-card {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card.selected {
  outline: 2px solid var(--color-primary);
}

.template-category {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.right-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.preview-content {
  flex: 1;
  overflow: auto;
}

.bottom-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-top: 1px solid var(--glass-border);
}

.action-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

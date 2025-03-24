<template>
  <div class="frameworks-view">
    <!-- Hero Section -->
    <section class="frameworks-hero glass-card">
      <div class="hero-content">
        <h1>Frameworks</h1>
        <p class="subtitle">Browse high-quality templates</p>
        <p class="description">
          Jumpstart your workflow or energize it, with expertly designed, ready to use templates.
        </p>
      </div>
    </section>

    <!-- Category Filters -->
    <section class="category-filters">
      <div class="filters-container">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['filter-btn', { active: selectedCategory === category.id }]"
          @click="selectedCategory = category.id"
        >
          <span class="icon">{{ category.icon }}</span>
          <span>{{ category.name }}</span>
        </button>
      </div>
    </section>

    <!-- Featured Templates Carousel -->
    <section class="featured-section">
      <h2 class="section-title">Featured Templates</h2>
      <div class="carousel-container">
        <button class="carousel-nav prev" @click="scrollCarousel('left')" aria-label="Previous">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="featured-carousel" ref="featuredCarousel">
          <div 
            v-for="template in featuredTemplates" 
            :key="template.id" 
            class="featured-card glass-card"
          >
            <div class="featured-card-content">
              <h3>{{ template.title }}</h3>
              <p>{{ template.description }}</p>
              <div class="featured-card-actions">
                <button class="btn-preview" @click="previewTemplate(template)">
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel-nav next" @click="scrollCarousel('right')" aria-label="Next">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>

    <!-- Main Template Grid -->
    <section class="templates-grid-section">
      <div class="section-header">
        <h2 class="section-title">All Templates</h2>
        <!-- Optional: Plugin Compatibility Filter -->
        <div class="compatibility-filter">
          <select v-model="selectedCompatibility">
            <option value="">Filter by Plugin Compatibility</option>
            <option value="core">Core Obsidian</option>
            <option value="dataview">Dataview</option>
            <option value="tasks">Tasks</option>
            <option value="kanban">Kanban</option>
          </select>
        </div>
      </div>

      <div class="templates-grid">
        <template-card 
          v-for="template in filteredTemplates" 
          :key="template.id"
          :template="template"
          @preview="previewTemplate"
          @push-to-vault="pushToVault"
        />
      </div>
    </section>

    <!-- Template Preview Panel (shown when a template is selected) -->
    <template-preview-panel
      v-if="previewedTemplate"
      :template="previewedTemplate"
      @close="previewedTemplate = null"
      @push-to-vault="pushToVault"
      @open-in-editor="openInEditor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TemplateCard from '@/components/Frameworks/TemplateCard.vue';
import TemplatePreviewPanel from '@/components/Frameworks/TemplatePreviewPanel.vue';
import { useObsidianStore } from '@/stores/obsidian';
import { useRouter } from 'vue-router';
import { useUIStore } from '@/stores/ui';
import { useFrameworksStore } from '@/stores/frameworks';
import type { Template } from '@/stores/frameworks';

const router = useRouter();
const obsidianStore = useObsidianStore();
const uiStore = useUIStore();

// Initialize the frameworks store
const frameworksStore = useFrameworksStore();

// Get categories from the store
const categories = computed(() => frameworksStore.categories);

// Selected filters
const selectedCategory = ref('all');
const selectedCompatibility = ref('');

// Get templates from the store
const templates = computed(() => frameworksStore.templates);

// Computed templates based on filters
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    // Filter by category
    if (selectedCategory.value !== 'all' && template.category !== selectedCategory.value) {
      return false;
    }
    
    // Filter by compatibility
    if (selectedCompatibility.value && !template.compatibility.includes(selectedCompatibility.value)) {
      return false;
    }
    
    return true;
  });
});

// Featured templates from the store
const featuredTemplates = computed(() => frameworksStore.featuredTemplates);

// Template preview state
const previewedTemplate = ref<Template | null>(null);

// Carousel reference for scrolling
const featuredCarousel = ref(null);

// Methods
const scrollCarousel = (direction) => {
  if (featuredCarousel.value) {
    const scrollAmount = direction === 'left' ? -350 : 350;
    featuredCarousel.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

// Preview a template
const previewTemplate = (template) => {
  // Get the template with content loaded
  const templateWithContent = frameworksStore.getTemplateById(template.id);
  previewedTemplate.value = templateWithContent;
};

// Push template to Obsidian vault
const pushToVault = async (template) => {
  try {
    if (!obsidianStore.isConnected) {
      uiStore.showToast('Please connect to Obsidian first', 'error');
      return;
    }
    
    // Get template with content if not already loaded
    let templateToUse = template;
    if (!template.content) {
      templateToUse = frameworksStore.getTemplateById(template.id);
    }
    
    if (!templateToUse || !templateToUse.content) {
      uiStore.showToast('Failed to load template content', 'error');
      return;
    }
    
    // Push to Obsidian vault
    await obsidianStore.pushToVault({
      filename: `${templateToUse.title}.md`,
      content: templateToUse.content
    });
    
    uiStore.showToast(`Template "${templateToUse.title}" pushed to your vault!`, 'success');
    
    // Close preview if open
    if (previewedTemplate.value?.id === templateToUse.id) {
      previewedTemplate.value = null;
    }
  } catch (error) {
    uiStore.showToast(`Error pushing to vault: ${error.message}`, 'error');
  }
};

// Open template in editor
const openInEditor = (template) => {
  // This would need to create a new template in the editor
  // For now we'll just navigate to editor
  router.push({ name: 'editor' });
  uiStore.showToast(`Opening "${template.title}" in editor`, 'info');
};
</script>

<style scoped>
.frameworks-view {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  gap: var(--spacing-xl);
  max-width: 100%;
  overflow-x: hidden;
}

/* Hero Section */
.frameworks-hero {
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-xs);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
}

.description {
  font-size: 1rem;
  max-width: 800px;
  margin: 0 auto;
  color: var(--color-text-secondary);
}

/* Category Filters */
.category-filters {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.filters-container {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text);
}

.filter-btn:hover {
  background: rgba(255, 171, 88, 0.1);
  border-color: var(--color-primary);
}

.filter-btn.active {
  background: rgba(255, 171, 88, 0.2);
  border-color: var(--color-primary);
  box-shadow: 0 0 10px rgba(255, 171, 88, 0.3);
}

.icon {
  font-size: 1.1rem;
}

/* Featured Templates Carousel */
.featured-section {
  position: relative;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
}

.featured-carousel {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding: var(--spacing-sm);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.featured-carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.featured-card {
  min-width: 300px;
  height: 200px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-fast);
}

.featured-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: var(--color-primary-light);
}

.featured-card-content {
  padding: var(--spacing-md);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.featured-card h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.2rem;
}

.featured-card p {
  flex: 1;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.featured-card-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-preview {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.btn-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(255, 171, 88, 0.4);
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all var(--transition-fast);
}

.carousel-nav:hover {
  background: rgba(255, 171, 88, 0.3);
}

.carousel-nav.prev {
  left: -20px;
}

.carousel-nav.next {
  right: -20px;
}

/* Templates Grid Section */
.templates-grid-section {
  padding: var(--spacing-md) 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.compatibility-filter select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text);
  border: 1px solid var(--glass-border);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .frameworks-hero {
    padding: var(--spacing-md);
  }
  
  .hero-content h1 {
    font-size: 1.8rem;
  }
  
  .featured-card {
    min-width: 250px;
  }
  
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
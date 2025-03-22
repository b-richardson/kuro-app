<template>
  <div class="recent-templates-section">
    <div class="section-header">
      <h3><i class="fas fa-thumbtack"></i> Recent Templates</h3>
      <button class="view-all-button" @click="viewAllTemplates">
        View All
      </button>
    </div>
    
    <div class="templates-carousel">
      <div class="carousel-container" ref="carouselContainer">
        <div 
          v-for="template in recentTemplates" 
          :key="template.id" 
          class="template-card glass-card"
        >
          <div class="template-card-content" @click="editTemplate(template.id)">
            <h4 class="template-title">{{ template.name }}</h4>
            <p class="template-description">{{ template.description || 'No description' }}</p>
            <p class="template-date">Last modified: {{ formatDate(template.lastModified) }}</p>
          </div>
          
          <div class="template-actions">
            <button class="template-action" title="Edit Template" @click="editTemplate(template.id)">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="template-action" title="Export Template" @click="exportTemplate(template.id)">
              <i class="fas fa-download"></i>
            </button>
            <button class="template-action" title="Duplicate Template" @click="duplicateTemplate(template.id)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <!-- Empty state for no templates -->
        <div v-if="recentTemplates.length === 0" class="empty-templates">
          <i class="fas fa-file-alt empty-icon"></i>
          <p>No templates yet. Create your first template to get started!</p>
          <button class="primary-action-button" @click="createNewTemplate">
            <i class="fas fa-plus"></i> Create Template
          </button>
        </div>
      </div>
      
      <!-- Navigation arrows -->
      <button 
        v-if="recentTemplates.length > 3" 
        class="carousel-nav carousel-prev" 
        @click="scrollCarousel('left')"
        :disabled="isAtStart"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <button 
        v-if="recentTemplates.length > 3" 
        class="carousel-nav carousel-next" 
        @click="scrollCarousel('right')"
        :disabled="isAtEnd"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template';
import { useUIStore } from '@/stores/ui';
import { useActivityStore } from '@/stores/activity';

const router = useRouter();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const activityStore = useActivityStore();
const carouselContainer = ref<HTMLElement | null>(null);
const isAtStart = ref(true);
const isAtEnd = ref(false);

// Get recent templates from store
const recentTemplates = computed(() => {
  return templateStore.templates
    .slice()
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 10); // Limit to 10 most recent
});

// Format date for display
const formatDate = (timestamp: number | string): string => {
  if (!timestamp) return 'Unknown date';
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// Template actions
const editTemplate = (id: string) => {
  router.push({ name: 'editor', params: { id } });
};

const exportTemplate = (id: string) => {
  const template = templateStore.templateById(id);
  if (template) {
    // In a real app, this would trigger an export workflow
    uiStore.showToast(`Exporting "${template.name}" template`, 'info');
    
    // Log activity
    activityStore.addActivity(
      'export',
      template.id,
      template.name,
      '1' // Default user ID
    );
  }
};

const duplicateTemplate = async (id: string) => {
  try {
    const template = templateStore.templateById(id);
    if (template) {
      const newId = await templateStore.duplicateTemplate(id);
      uiStore.showToast(`Duplicated "${template.name}" template`, 'success');
      
      // Log activity
      activityStore.addActivity(
        'duplicate',
        newId,
        `${template.name} (Copy)`,
        '1' // Default user ID
      );
      
      // Navigate to the new template
      router.push({ name: 'editor', params: { id: newId } });
    }
  } catch (error) {
    uiStore.showToast(`Error duplicating template: ${error}`, 'error');
  }
};

const viewAllTemplates = () => {
  router.push({ name: 'library' });
};

const createNewTemplate = () => {
  const id = templateStore.createNewTemplate();
  
  // Log activity
  activityStore.addActivity(
    'create',
    id,
    'Untitled Template',
    '1' // Default user ID
  );
  
  router.push({ name: 'editor', params: { id } });
};

// Carousel navigation
const scrollCarousel = (direction: 'left' | 'right') => {
  if (!carouselContainer.value) return;
  
  const scrollAmount = 300; // Adjust based on card width + margin
  const currentScroll = carouselContainer.value.scrollLeft;
  
  if (direction === 'left') {
    carouselContainer.value.scrollTo({
      left: currentScroll - scrollAmount,
      behavior: 'smooth'
    });
  } else {
    carouselContainer.value.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  }
  
  // Check scroll position after animation
  setTimeout(updateScrollButtons, 300);
};

const updateScrollButtons = () => {
  if (!carouselContainer.value) return;
  
  const { scrollLeft, scrollWidth, clientWidth } = carouselContainer.value;
  isAtStart.value = scrollLeft <= 10;
  isAtEnd.value = scrollLeft >= scrollWidth - clientWidth - 10;
};

// Initialize carousel and scroll buttons
onMounted(() => {
  updateScrollButtons();
  
  // Add scroll event listener
  if (carouselContainer.value) {
    carouselContainer.value.addEventListener('scroll', updateScrollButtons);
  }
});
</script>

<style scoped>
.recent-templates-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-xs);
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.view-all-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary);
  background: transparent;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-all-button:hover {
  color: var(--color-primary-light);
}

.templates-carousel {
  position: relative;
}

.carousel-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: var(--spacing-md);
  padding: var(--spacing-xs);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.carousel-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.template-card {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  height: 180px;
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.template-card-content {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.template-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-date {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin: var(--spacing-xs) 0 0;
}

.template-actions {
  display: flex;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.1);
}

.template-action {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.template-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.template-action:not(:last-child) {
  border-right: 1px solid var(--glass-border);
}

/* Carousel navigation buttons */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all var(--transition-fast);
}

.carousel-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  color: var(--color-primary);
}

.carousel-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.carousel-prev {
  left: -16px;
}

.carousel-next {
  right: -16px;
}

/* Empty state */
.empty-templates {
  flex: 1;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-templates p {
  margin: 0 0 var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.primary-action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.2);
  transition: all var(--transition-fast);
}

.primary-action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.3);
}

/* Responsive styling */
@media (max-width: 768px) {
  .template-card {
    flex: 0 0 280px;
  }
}
</style>
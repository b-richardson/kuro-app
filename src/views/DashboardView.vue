<template>
  <div class="dashboard-view">
    <!-- Welcome section with CTAs -->
    <div class="welcome-section glass-card">
      <div class="welcome-content">
        <h1>Welcome to Obsidian Template Builder</h1>
        <p class="welcome-subtitle">Create, manage, and export powerful templates for Obsidian</p>
        
        <div class="cta-buttons">
          <button class="cta-button primary" @click="createNewTemplate">
            <i class="fas fa-plus"></i> Create New Template
          </button>
          <button class="cta-button secondary" @click="browseTemplateLibrary">
            <i class="fas fa-book"></i> Browse Template Library
          </button>
        </div>
      </div>
    </div>
    
    <!-- My Templates section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>My Templates</h2>
        <button class="view-all-button" @click="viewAllTemplates" v-if="userTemplates.length > 4">
          View All <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div v-if="userTemplates.length === 0" class="empty-state glass-card">
        <div class="empty-state-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <h3>No Templates Yet</h3>
        <p>Create your first template or explore the template library to get started</p>
      </div>
      
      <div v-else class="templates-grid">
        <!-- Template cards -->
        <div 
          v-for="template in userTemplates.slice(0, 4)" 
          :key="template.id"
          class="template-card glass-card"
          @click="openTemplate(template.id)"
        >
          <div class="template-card-content">
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-description">{{ template.description || 'No description' }}</p>
            
            <div class="template-meta">
              <span class="template-date">
                <i class="fas fa-calendar-alt"></i> 
                {{ formatDate(template.lastModified) }}
              </span>
              <div v-if="template.tags && template.tags.length" class="template-tags">
                <span 
                  v-for="(tag, index) in template.tags.slice(0, 2)" 
                  :key="index"
                  class="template-tag"
                >
                  {{ tag }}
                </span>
                <span v-if="template.tags.length > 2" class="template-tag template-tag-more">
                  +{{ template.tags.length - 2 }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="template-actions">
            <button @click.stop="editTemplate(template.id)" class="template-action">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button @click.stop="exportTemplate(template.id)" class="template-action">
              <i class="fas fa-download"></i>
            </button>
            <button @click.stop="duplicateTemplate(template.id)" class="template-action">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recent Activity</h2>
      </div>
      
      <div class="activity-timeline glass-card">
        <div v-if="recentActivity.length === 0" class="empty-activity">
          <p>No recent activity</p>
        </div>
        
        <div v-else class="activity-list">
          <div 
            v-for="(activity, index) in recentActivity" 
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="`activity-${activity.type}`">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-date">{{ formatActivityDate(activity.date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Tips section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Quick Tips</h2>
      </div>
      
      <div class="tips-container">
        <div class="tip-card glass-card">
          <div class="tip-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <div class="tip-content">
            <h3>Plugin Integration</h3>
            <p>Your templates can include special syntax for Templater, Dataview, and other popular Obsidian plugins.</p>
          </div>
        </div>
        
        <div class="tip-card glass-card">
          <div class="tip-icon">
            <i class="fas fa-share-alt"></i>
          </div>
          <div class="tip-content">
            <h3>Export Options</h3>
            <p>Choose the right export format based on the plugins you use in your Obsidian vault.</p>
          </div>
        </div>
        
        <div class="tip-card glass-card">
          <div class="tip-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="tip-content">
            <h3>Learn More</h3>
            <p>Check out our documentation to learn advanced template techniques and best practices.</p>
            <a href="#" class="learn-more-link">View Documentation</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';

// Router and stores
const router = useRouter();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const authStore = useAuthStore();

// User templates - limit to 4 for dashboard
const userTemplates = computed(() => {
  return templateStore.templates
    .slice()
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 4);
});

// Mock recent activity - this would be fetched from a real activity log in production
const recentActivity = ref([
  {
    type: 'create',
    text: 'Created "Daily Notes" template',
    date: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    type: 'edit',
    text: 'Updated "Project Planning" template',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    type: 'export',
    text: 'Exported "Meeting Notes" template',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
]);

// Format dates
const formatDate = (timestamp: string | number | Date): string => {
  if (!timestamp) return 'Unknown date';
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

const formatActivityDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
};

// Get icon for activity type
const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'create': return 'fas fa-plus';
    case 'edit': return 'fas fa-pencil-alt';
    case 'export': return 'fas fa-download';
    case 'delete': return 'fas fa-trash';
    default: return 'fas fa-history';
  }
};

// Navigation methods
const createNewTemplate = () => {
  templateStore.createNewTemplate();
  router.push({ name: 'editor' });
};

const browseTemplateLibrary = () => {
  router.push({ name: 'templateLibrary' });
};

const viewAllTemplates = () => {
  router.push({ name: 'library' });
};

const openTemplate = (id: string) => {
  router.push({ name: 'editor', params: { id } });
};

const editTemplate = (id: string) => {
  router.push({ name: 'editor', params: { id } });
};

const exportTemplate = (id: string) => {
  templateStore.loadTemplate(id);
  // Normally would trigger export dialog here
  uiStore.showToast('Export dialog would open here', 'info');
};

const duplicateTemplate = async (id: string) => {
  try {
    const newId = await templateStore.duplicateTemplate(id);
    uiStore.showToast('Template duplicated successfully', 'success');
    router.push({ name: 'editor', params: { id: newId } });
  } catch (error) {
    uiStore.showToast(`Error duplicating template: ${error}`, 'error');
  }
};

// Lifecycle hooks
onMounted(async () => {
  await templateStore.loadTemplates();
});
</script>

<style scoped>
.dashboard-view {
  padding: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Welcome section */
.welcome-section {
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(255, 171, 88, 0.1), rgba(255, 204, 112, 0.05));
  z-index: -1;
}

.welcome-content {
  max-width: 800px;
}

.welcome-section h1 {
  font-size: 1.6rem;
  margin-bottom: var(--spacing-xs);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.cta-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cta-button.primary {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(255, 171, 88, 0.2);
}

.cta-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 171, 88, 0.3);
}

.cta-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Section styling */
.dashboard-section {
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

.section-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
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

/* Templates grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.template-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  height: 160px;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.template-card-content {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.template-name {
  font-size: 1rem;
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

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.template-date {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.template-tags {
  display: flex;
  gap: 4px;
}

.template-tag {
  padding: 1px 5px;
  border-radius: 100px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 500;
}

.template-tag-more {
  background: rgba(var(--color-primary-rgb), 0.2);
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

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-lg);
}

.empty-state-icon {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1.1rem;
}

.empty-state p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  max-width: 300px;
}

/* Activity timeline */
.activity-timeline {
  overflow: hidden;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.activity-create {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.activity-edit {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.activity-export {
  background: rgba(156, 39, 176, 0.1);
  color: #9C27B0;
}

.activity-delete {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.9rem;
}

.activity-date {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.empty-activity {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-tertiary);
}

/* Tips section */
.tips-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.tip-card {
  display: flex;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
  align-items: flex-start;
}

.tip-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 1.25rem;
}

.tip-content {
  flex: 1;
}

.tip-content h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1rem;
}

.tip-content p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.learn-more-link {
  display: inline-block;
  margin-top: var(--spacing-sm);
  color: var(--color-primary);
  font-size: 0.85rem;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.learn-more-link:hover {
  color: var(--color-primary-light);
}

/* Responsive styling */
@media (max-width: 768px) {
  .dashboard-view {
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }
  
  .welcome-section {
    padding: var(--spacing-md);
  }
  
  .welcome-section h1 {
    font-size: 1.4rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .tips-container {
    grid-template-columns: 1fr;
  }
}

/* Animation for entering elements */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-section {
  animation: fadeIn 0.4s ease-out both;
}

.dashboard-section:nth-child(2) {
  animation-delay: 0.1s;
}

.dashboard-section:nth-child(3) {
  animation-delay: 0.2s;
}

.dashboard-section:nth-child(4) {
  animation-delay: 0.3s;
}
</style>
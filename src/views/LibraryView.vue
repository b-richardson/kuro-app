<template>
  <div class="library-view">
    <AppHeader 
      view="library"
      :sections="[]"
      @new-template="goToNewTemplate"
    >
      <template #actions>
        <PrimaryButton 
          icon="fas fa-plus" 
          @click="goToNewTemplate"
        >
          New Template
        </PrimaryButton>
      </template>
    </AppHeader>
    
    <div class="library-view__content">
      <div class="library-header glass-card">
        <h2 class="library-header__title">Your Templates</h2>
        
        <div class="library-header__actions">
          <button class="action-button" @click="handleImportAction">
            <i class="fas fa-file-import"></i> Import
          </button>
          <button class="action-button" @click="handleExportAllAction">
            <i class="fas fa-file-export"></i> Export All
          </button>
        </div>
      </div>
      
      <div v-if="templateStore.templates.length === 0" class="empty-library glass-card">
        <div class="empty-library__icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <h3>No Templates Yet</h3>
        <p>Create your first template or add example templates to get started</p>
        <div class="empty-library__actions">
          <PrimaryButton @click="goToNewTemplate">Create New Template</PrimaryButton>
          <button class="secondary-button" @click="addExampleTemplates">
            Add Example Templates
          </button>
        </div>
      </div>
      
      <div v-else class="template-grid">
        <div 
          v-for="template in templateStore.templates" 
          :key="template.id"
          class="template-card glass-card"
          @click="loadTemplate(template.id)"
        >
          <div class="template-card__content">
            <h3 class="template-card__title">{{ template.name }}</h3>
            <p class="template-card__description">{{ template.description || 'No description' }}</p>
            
            <div class="template-card__meta">
              <span class="template-card__date">
                <i class="fas fa-calendar"></i> 
                {{ formatDate(template.lastModified) }}
              </span>
              <div v-if="template.tags && template.tags.length" class="template-card__tags">
                <span 
                  v-for="(tag, index) in template.tags?.slice(0, 2)" 
                  :key="index"
                  class="template-card__tag"
                >
                  {{ tag }}
                </span>
                <span v-if="template.tags && template.tags.length > 2" class="template-card__tag template-card__tag--more">
                  +{{ template.tags.length - 2 }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="template-card__actions">
            <button class="template-card__action" @click.stop="handleTemplateDuplicate(template.id)" aria-label="Duplicate template">
              <i class="fas fa-copy"></i>
            </button>
            <button class="template-card__action" @click.stop="confirmDeleteTemplate(template.id)" aria-label="Delete template">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <ConfirmationDialog
      v-if="uiStore.showConfirmDialog"
      :title="uiStore.confirmDialogTitle"
      :message="uiStore.confirmDialogMessage"
      :confirm-button-text="uiStore.confirmDialogConfirmText"
      :cancel-button-text="uiStore.confirmDialogCancelText"
      @confirm="uiStore.handleConfirmDialogConfirm()"
      @cancel="uiStore.handleConfirmDialogCancel()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/Layout/AppHeader.vue'
import PrimaryButton from '../components/UI/PrimaryButton.vue'
import ConfirmationDialog from '../components/UI/ConfirmationDialog.vue'
import { ExportProfileId } from '../components/TemplateCreator/ExportProfileSelector.vue'
import { useTemplateStore, useUIStore, usePreferencesStore } from '../stores'

// Setup router for navigation
const router = useRouter()

// Get stores
const templateStore = useTemplateStore()
const uiStore = useUIStore()
const preferencesStore = usePreferencesStore()

// Load data from stores
onMounted(() => {
  templateStore.loadTemplates()
  preferencesStore.loadPreferences()
  preferencesStore.setLastVisitedView('library')
})

// Get active export profile
const exportProfile = computed<ExportProfileId>(() => {
  const profileId = preferencesStore.activeExportProfileId
  if (!profileId && preferencesStore.exportProfiles.length > 0) {
    return preferencesStore.exportProfiles[0].id as ExportProfileId
  }
  return (profileId || 'full') as ExportProfileId
})

// Navigation handlers
const goToNewTemplate = () => {
  router.push('/editor')
}

const loadTemplate = (id: string) => {
  templateStore.loadTemplate(id)
  router.push(`/editor/${id}`)
}

// Format date
const formatDate = (timestamp: number | null) => {
  if (!timestamp) return 'Unknown date'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

// Implement event handlers
const handleTemplateDelete = async (id: string) => {
  templateStore.deleteTemplate(id)
  uiStore.addToast('Template deleted successfully', 'success')
}

const confirmDeleteTemplate = (id: string) => {
  const template = templateStore.templates.find(t => t.id === id)
  if (template) {
    uiStore.showConfirmationDialog(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      () => handleTemplateDelete(id),
      () => {}
    )
  }
}

const handleTemplateDuplicate = (id: string) => {
  const templateToDuplicate = templateStore.templates.find(t => t.id === id)
  if (templateToDuplicate) {
    const newId = templateStore.createTemplate(templateToDuplicate.name + ' (Copy)')
    const template = templateStore.templates.find(t => t.id === newId)
    if (template) {
      template.sections = JSON.parse(JSON.stringify(templateToDuplicate.sections))
      templateStore.saveTemplates()
      uiStore.addToast('Template duplicated successfully', 'success')
    }
  }
}

const handleImportAction = () => {
  // Will implement later - this would open the import dialog
  uiStore.addToast('Import functionality coming soon', 'info')
}

const handleExportAllAction = () => {
  // Will implement later - this would export all templates
  uiStore.addToast('Export All functionality coming soon', 'info')
}

const addExampleTemplates = () => {
  // Will implement later - this would add example templates
  uiStore.addToast('Example templates feature coming soon', 'info')
}

const handleImportComplete = (count: number) => {
  uiStore.addToast(`${count} templates imported successfully`, 'success')
}

const handleNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  uiStore.addToast(message, type as any)
}
</script>

<style scoped>
.library-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.library-view__content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.library-header__title {
  margin: 0;
  font-size: 1.25rem;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.library-header__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.secondary-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.empty-library__icon {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  opacity: 0.7;
}

.empty-library h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1.5rem;
}

.empty-library p {
  margin: 0 0 var(--spacing-lg);
  color: var(--color-text-secondary);
  max-width: 400px;
}

.empty-library__actions {
  display: flex;
  gap: var(--spacing-md);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.template-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  height: 180px;
}

.template-card__content {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.template-card__title {
  margin: 0 0 var(--spacing-xs);
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-card__description {
  margin: 0 0 var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.template-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.template-card__date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.template-card__tags {
  display: flex;
  gap: var(--spacing-xs);
}

.template-card__tag {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
}

.template-card__tag--more {
  background: rgba(255, 171, 88, 0.2);
  color: var(--color-primary-light);
}

.template-card__actions {
  display: flex;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.1);
}

.template-card__action {
  flex: 1;
  padding: var(--spacing-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.template-card__action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.template-card__action:first-child {
  border-right: 1px solid var(--glass-border);
}

@media (max-width: 640px) {
  .library-view__content {
    padding: var(--spacing-md);
  }
  
  .library-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .empty-library__actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
}

/* Entrance animations */
.template-card {
  animation: cardEnter 0.3s ease-out both;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for template cards */
.template-card:nth-child(1) { animation-delay: 0.05s; }
.template-card:nth-child(2) { animation-delay: 0.1s; }
.template-card:nth-child(3) { animation-delay: 0.15s; }
.template-card:nth-child(4) { animation-delay: 0.2s; }
.template-card:nth-child(5) { animation-delay: 0.25s; }
.template-card:nth-child(6) { animation-delay: 0.3s; }
</style>
<template>
  <div class="template-library">
    <div class="template-library__header">
      <h2 class="template-library__title">Template Library</h2>
      
      <div class="template-library__controls">
        <!-- Search and Filter -->
        <div class="template-library__search">
          <input 
            type="text" 
            placeholder="Search templates..." 
            v-model="searchQuery" 
            class="template-library__search-input"
          />
          <i class="fas fa-search template-library__search-icon"></i>
        </div>
        
        <!-- Sort Options -->
        <div class="template-library__sort">
          <label for="sort-by" class="template-library__sort-label">Sort by:</label>
          <select 
            id="sort-by" 
            v-model="sortBy" 
            class="template-library__sort-select"
          >
            <option value="updatedAt">Last Modified</option>
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
          </select>
          <button 
            class="template-library__sort-direction" 
            @click="toggleSortDirection"
            :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
          >
            <i :class="`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`"></i>
          </button>
        </div>
        
        <!-- View Options -->
        <div class="template-library__view-options">
          <button 
            class="template-library__view-toggle" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="Grid view"
          >
            <i class="fas fa-th-large"></i>
          </button>
          <button 
            class="template-library__view-toggle" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="List view"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="filteredTemplates.length === 0" class="template-library__empty">
      <div class="template-library__empty-icon">
        <i class="fas fa-folder-open"></i>
      </div>
      <h3 class="template-library__empty-title">
        {{ searchQuery ? 'No templates found' : 'No templates yet' }}
      </h3>
      <p class="template-library__empty-message">
        {{ searchQuery 
          ? 'Try adjusting your search query or create a new template.' 
          : 'Create your first template to get started or import existing templates.' 
        }}
      </p>
      <div class="template-library__empty-actions">
        <button 
          class="template-library__btn template-library__btn--primary"
          @click="createNewTemplate"
        >
          <i class="fas fa-plus"></i> Create New Template
        </button>
        <button 
          class="template-library__btn template-library__btn--secondary"
          @click="openImportDialog"
        >
          <i class="fas fa-file-import"></i> Import Templates
        </button>
      </div>
    </div>
    
    <!-- Template Grid -->
    <div 
      v-else 
      class="template-library__grid" 
      :class="{ 
        'template-library__grid--list-view': viewMode === 'list',
        'template-library__grid--grid-view': viewMode === 'grid' 
      }"
    >
      <!-- Template Card -->
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        class="template-card"
        :class="{ 
          'template-card--list-view': viewMode === 'list',
          'template-card--active': selectedTemplateId === template.id 
        }"
        @click="selectTemplate(template.id)"
      >
        <!-- Template Card Header -->
        <div class="template-card__header">
          <div class="template-card__title-wrapper">
            <h3 class="template-card__title">{{ template.name }}</h3>
            <span 
              v-if="isCurrentTemplate(template.id)"
              class="template-card__current-badge" 
              title="Currently open template"
            >Current</span>
          </div>
          
          <!-- Template Actions Menu -->
          <div class="template-card__actions">
            <button 
              class="template-card__action-btn"
              @click.stop="showTemplateActionsMenu(template.id, $event)"
              aria-label="Template options"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        
        <!-- Template Card Content -->
        <div class="template-card__content">
          <p v-if="template.description" class="template-card__description">
            {{ template.description }}
          </p>
          <div class="template-card__section-preview">
            {{ generatePreviewText(template.thumbnail || '') }}
          </div>
        </div>
        
        <!-- Template Card Footer -->
        <div class="template-card__footer">
          <div class="template-card__meta">
            <div class="template-card__date">
              <i class="fas fa-clock"></i>
              {{ formatDate(template.updatedAt) }}
            </div>
            <div v-if="template.tags && template.tags.length > 0" class="template-card__tags">
              <span 
                v-for="tag in template.tags.slice(0, 2)" 
                :key="tag" 
                class="template-card__tag"
                @click.stop="filterByTag(tag)"
              >
                {{ tag }}
              </span>
              <span v-if="template.tags.length > 2" class="template-card__tag-more">
                +{{ template.tags.length - 2 }}
              </span>
            </div>
          </div>
          <div class="template-card__actions">
            <button 
              class="template-card__btn template-card__btn--primary" 
              @click.stop="loadTemplate(template.id)"
              title="Load this template"
            >
              <i class="fas fa-edit"></i>
              <span v-if="viewMode === 'grid'">Edit</span>
            </button>
            <button 
              class="template-card__btn template-card__btn--secondary" 
              @click.stop="previewTemplate(template.id)"
              title="Preview this template"
            >
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create New Template Button (Fixed) -->
    <button 
      class="template-library__create-btn"
      @click="createNewTemplate"
      v-if="filteredTemplates.length > 0"
    >
      <i class="fas fa-plus"></i>
    </button>
    
    <!-- Template Actions Context Menu -->
    <div 
      v-if="showContextMenu"
      class="template-context-menu"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
    >
      <button class="template-context-menu__item" @click="loadTemplate(contextMenuTemplateId)">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="template-context-menu__item" @click="duplicateTemplate(contextMenuTemplateId)">
        <i class="fas fa-copy"></i> Duplicate
      </button>
      <button class="template-context-menu__item" @click="exportTemplate(contextMenuTemplateId)">
        <i class="fas fa-file-export"></i> Export
      </button>
      <button class="template-context-menu__item template-context-menu__item--danger" @click="confirmDeleteTemplate(contextMenuTemplateId)">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
    
    <!-- Template Preview Modal -->
    <div v-if="previewTemplateId" class="template-library__preview-modal">
      <div class="template-library__preview-backdrop" @click="closePreview"></div>
      <div class="template-library__preview-content">
        <div class="template-library__preview-header">
          <h3 class="template-library__preview-title">
            {{ getTemplateById(previewTemplateId)?.name || 'Template Preview' }}
          </h3>
          <button 
            class="template-library__preview-close" 
            @click="closePreview"
            aria-label="Close preview"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="template-library__preview-body">
          <MarkdownPreview 
            :sections="previewTemplateSections"
            :export-profile="exportProfile"
          />
        </div>
        <div class="template-library__preview-footer">
          <button 
            class="template-library__btn template-library__btn--secondary"
            @click="closePreview"
          >
            Close
          </button>
          <button 
            class="template-library__btn template-library__btn--primary"
            @click="loadTemplateFromPreview"
          >
            <i class="fas fa-edit"></i> Edit Template
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:show="showDeleteConfirmation"
      title="Delete Template"
      :message="`Are you sure you want to delete '${getTemplateById(templateToDelete)?.name || ''}'? This action cannot be undone.`"
      variant="danger"
      confirm-button-text="Delete"
      @confirm="deleteTemplate"
    />
    
    <!-- Import Dialog -->
    <ConfirmationDialog
      v-model:show="showImportDialog"
      title="Import Templates"
      variant="info"
      confirm-button-text="Import"
      :disabled="!importFile"
      @confirm="importTemplates"
    >
      <div class="import-form">
        <div class="import-form__group">
          <label for="import-file" class="import-form__label">Import from file:</label>
          <input 
            id="import-file" 
            type="file" 
            accept=".json" 
            @change="handleFileSelect"
            class="import-form__file"
          />
          <p class="import-form__help">Select a JSON file containing exported templates</p>
        </div>
        
        <div class="import-form__group">
          <label class="import-form__checkbox-label">
            <input 
              type="checkbox" 
              v-model="replaceExistingTemplates"
              class="import-form__checkbox"
            />
            <span>Replace all existing templates</span>
          </label>
          <p class="import-form__help import-form__help--warning" v-if="replaceExistingTemplates">
            <i class="fas fa-exclamation-triangle"></i>
            Warning: This will delete all your existing templates
          </p>
        </div>
      </div>
    </ConfirmationDialog>
    
    <!-- Unsaved Changes Confirmation -->
    <ConfirmationDialog
      v-model:show="showUnsavedChangesDialog"
      title="Unsaved Changes"
      message="You have unsaved changes that will be lost if you navigate away. Do you want to continue?"
      variant="warning"
      confirm-button-text="Continue"
      @confirm="confirmLoadTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import MarkdownPreview from './MarkdownPreview.vue';
import ConfirmationDialog from '@/components/UI/ConfirmationDialog.vue';
import { 
  getTemplateList, 
  loadTemplate, 
  deleteTemplate as deleteTemplateStorage, 
  exportTemplatesAsJson,
  importTemplatesFromJson,
  saveTemplate,
  TemplateMeta,
  TemplateStorageError
} from '@/utils/templateStorage';
import { ExportProfileId } from './ExportProfileSelector.vue';

// Define props and emits
const props = defineProps<{
  currentTemplateId: string;
  isModified: boolean;
  exportProfile: ExportProfileId;
}>();

const emit = defineEmits<{
  (e: 'create-new'): void;
  (e: 'load', templateId: string): void;
  (e: 'delete', templateId: string): void;
  (e: 'duplicate', templateId: string): void;
  (e: 'export', templateId: string): void;
  (e: 'import-complete', count: number): void;
  (e: 'notification', message: string, type: 'success' | 'error' | 'warning' | 'info'): void;
}>();

// Reactive state
const templates = ref<TemplateMeta[]>([]);
const searchQuery = ref('');
const sortBy = ref<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
const sortDirection = ref<'asc' | 'desc'>('desc');
const filterTag = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const selectedTemplateId = ref<string | null>(null);

// Context menu state
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuTemplateId = ref('');

// Preview state
const previewTemplateId = ref<string | null>(null);
const previewTemplateSections = ref<TemplateSection[]>([]);

// Delete confirmation
const showDeleteConfirmation = ref(false);
const templateToDelete = ref('');

// Import dialog
const showImportDialog = ref(false);
const importFile = ref<File | null>(null);
const replaceExistingTemplates = ref(false);

// Unsaved changes dialog
const showUnsavedChangesDialog = ref(false);
const pendingTemplateId = ref('');

// Load templates on component mount
onMounted(() => {
  loadTemplates();
  
  // Add event listener to close context menu when clicking outside
  document.addEventListener('click', handleDocumentClick);
  
  // Add event listener for keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
});

// Cleanup event listeners on component unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeyDown);
});

// Watch for changes to the currentTemplateId
watch(() => props.currentTemplateId, (newId) => {
  if (newId) {
    selectedTemplateId.value = newId;
  }
});

// Computed properties
const filteredTemplates = computed(() => {
  let result = templates.value;
  
  // Apply tag filter
  if (filterTag.value) {
    result = result.filter(template => 
      template.tags && template.tags.includes(filterTag.value!)
    );
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(template => 
      template.name.toLowerCase().includes(query) || 
      template.description.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  return [...result].sort((a, b) => {
    let comparison: number;
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
      default:
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
});

// Methods
function loadTemplates() {
  try {
    templates.value = getTemplateList(sortBy.value, sortDirection.value, filterTag.value || undefined);
  } catch (error) {
    emit('notification', `Error loading templates: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  loadTemplates();
}

function filterByTag(tag: string) {
  // Toggle tag filter
  filterTag.value = filterTag.value === tag ? null : tag;
  loadTemplates();
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // This week (within 7 days)
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // This year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Older
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    return dateString;
  }
}

function generatePreviewText(thumbnail: string): string {
  if (!thumbnail) {
    return 'No preview available';
  }
  
  // If thumbnail is longer than 100 chars, truncate
  if (thumbnail.length > 100) {
    return thumbnail.substring(0, 100) + '...';
  }
  
  return thumbnail;
}

function createNewTemplate() {
  if (props.isModified) {
    // Show confirmation dialog
    showUnsavedChangesDialog.value = true;
    pendingTemplateId.value = 'new';
  } else {
    emit('create-new');
  }
}

function loadTemplate(id: string) {
  if (props.isModified && id !== props.currentTemplateId) {
    // Show confirmation dialog
    showUnsavedChangesDialog.value = true;
    pendingTemplateId.value = id;
  } else {
    tryLoadTemplate(id);
  }
}

function tryLoadTemplate(id: string) {
  try {
    const template = loadTemplate(id);
    if (template) {
      emit('load', id);
      closePreview();
    } else {
      emit('notification', 'Template not found', 'error');
    }
  } catch (error) {
    emit('notification', `Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

function confirmLoadTemplate() {
  // Called after user confirms in unsaved changes dialog
  if (pendingTemplateId.value === 'new') {
    emit('create-new');
  } else {
    tryLoadTemplate(pendingTemplateId.value);
  }
  pendingTemplateId.value = '';
}

function selectTemplate(id: string) {
  selectedTemplateId.value = selectedTemplateId.value === id ? null : id;
}

function isCurrentTemplate(id: string): boolean {
  return id === props.currentTemplateId;
}

function showTemplateActionsMenu(id: string, event: MouseEvent) {
  // Position the context menu at the click location
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  };
  
  contextMenuTemplateId.value = id;
  showContextMenu.value = true;
  
  // Prevent the event from bubbling
  event.stopPropagation();
}

function handleDocumentClick() {
  // Close the context menu when clicking outside
  showContextMenu.value = false;
}

function handleKeyDown(event: KeyboardEvent) {
  // Close modals on escape
  if (event.key === 'Escape') {
    closePreview();
    showContextMenu.value = false;
  }
  
  // Create new template on Ctrl+N
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    createNewTemplate();
  }
}

function previewTemplate(id: string) {
  try {
    const template = loadTemplate(id);
    if (template) {
      previewTemplateId.value = id;
      previewTemplateSections.value = template.sections;
    } else {
      emit('notification', 'Template not found', 'error');
    }
  } catch (error) {
    emit('notification', `Failed to preview template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

function closePreview() {
  previewTemplateId.value = null;
}

function loadTemplateFromPreview() {
  if (previewTemplateId.value) {
    loadTemplate(previewTemplateId.value);
  }
}

function confirmDeleteTemplate(id: string) {
  templateToDelete.value = id;
  showDeleteConfirmation.value = true;
  showContextMenu.value = false;
}

function deleteTemplate() {
  try {
    if (deleteTemplateStorage(templateToDelete.value)) {
      // If the deleted template is the current one, create a new template
      if (templateToDelete.value === props.currentTemplateId) {
        emit('create-new');
      }
      
      emit('delete', templateToDelete.value);
      emit('notification', 'Template deleted successfully', 'success');
      loadTemplates();
    } else {
      emit('notification', 'Failed to delete template', 'error');
    }
  } catch (error) {
    emit('notification', `Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
  
  templateToDelete.value = '';
}

function duplicateTemplate(id: string) {
  try {
    const template = loadTemplate(id);
    if (!template) {
      emit('notification', 'Template not found', 'error');
      return;
    }
    
    // Create a copy with a new ID and name
    const newName = `${template.name} (Copy)`;
    
    // Save the duplicate
    const newId = saveTemplate(
      newName,
      template.description,
      template.sections,
      template.exportProfile,
      undefined, // No ID to generate a new one
      template.tags
    );
    
    emit('duplicate', newId);
    emit('notification', 'Template duplicated successfully', 'success');
    loadTemplates();
    
    // Close the context menu
    showContextMenu.value = false;
  } catch (error) {
    if (error instanceof TemplateStorageError) {
      emit('notification', error.message, 'error');
    } else {
      emit('notification', `Failed to duplicate template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }
}

function exportTemplate(id: string) {
  try {
    const template = loadTemplate(id);
    if (!template) {
      emit('notification', 'Template not found', 'error');
      return;
    }
    
    // Export the single template
    const jsonData = exportTemplatesAsJson([id]);
    
    // Create file for download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    emit('export', id);
    emit('notification', 'Template exported successfully', 'success');
    
    // Close the context menu
    showContextMenu.value = false;
  } catch (error) {
    emit('notification', `Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

function openImportDialog() {
  showImportDialog.value = true;
  
  // Reset import state
  importFile.value = null;
  replaceExistingTemplates.value = false;
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    importFile.value = input.files[0];
  }
}

function importTemplates() {
  if (!importFile.value) {
    emit('notification', 'Please select a file to import', 'warning');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result as string;
      const importedCount = importTemplatesFromJson(jsonString, replaceExistingTemplates.value);
      
      emit('import-complete', importedCount);
      emit('notification', `Successfully imported ${importedCount} templates`, 'success');
      loadTemplates();
      
      // Close the import dialog
      showImportDialog.value = false;
    } catch (error) {
      if (error instanceof TemplateStorageError) {
        emit('notification', error.message, 'error');
      } else {
        emit('notification', `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    }
  };
  
  reader.onerror = () => {
    emit('notification', 'Failed to read the import file', 'error');
  };
  
  reader.readAsText(importFile.value);
}

function getTemplateById(id: string | null): TemplateMeta | undefined {
  if (!id) return undefined;
  return templates.value.find(t => t.id === id);
}
</script>

<style scoped>
.template-library {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.template-library__header {
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(230, 235, 245, 0.8);
  margin-bottom: 1rem;
}

.template-library__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.template-library__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.template-library__search {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.template-library__search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: #f8fafc;
  color: #1e293b;
  transition: all 0.2s;
}

.template-library__search-input:focus {
  border-color: #4f46e5;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.template-library__search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.template-library__sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.template-library__sort-label {
  font-size: 0.875rem;
  color: #64748b;
}

.template-library__sort-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: #f8fafc;
  color: #1e293b;
  cursor: pointer;
}

.template-library__sort-select:focus {
  border-color: #4f46e5;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.template-library__sort-direction {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 6px;
  background-color: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.template-library__sort-direction:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.template-library__view-options {
  display: flex;
  gap: 0.25rem;
}

.template-library__view-toggle {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 6px;
  background-color: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.template-library__view-toggle:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.template-library__view-toggle.active {
  background-color: #e0e7ff;
  color: #4f46e5;
  border-color: #c7d2fe;
}

.template-library__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.template-library__empty-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.template-library__empty-title {
  font-size: 1.25rem;
  color: #334155;
  margin: 0 0 0.5rem 0;
}

.template-library__empty-message {
  color: #64748b;
  margin: 0 0 2rem 0;
  max-width: 26rem;
}

.template-library__empty-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.template-library__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.template-library__btn--primary {
  background-color: #4f46e5;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.template-library__btn--primary:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
}

.template-library__btn--primary:active {
  transform: translateY(0);
}

.template-library__btn--secondary {
  background-color: white;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.template-library__btn--secondary:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.template-library__grid {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  display: grid;
  gap: 1rem;
}

.template-library__grid--grid-view {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.template-library__grid--list-view {
  grid-template-columns: 1fr;
}

.template-card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  border: 1px solid rgba(230, 235, 245, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.template-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.template-card--active {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.template-card--list-view {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
}

.template-card--list-view .template-card__header {
  width: 30%;
}

.template-card--list-view .template-card__content {
  display: flex;
  flex: 1;
  padding: 0;
  border: none;
}

.template-card--list-view .template-card__description {
  width: 50%;
  margin: 0;
  padding-right: 1rem;
}

.template-card--list-view .template-card__section-preview {
  display: none;
}

.template-card--list-view .template-card__footer {
  width: 20%;
  padding: 0;
  border: none;
}

.template-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.template-card__title-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-card__current-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  background-color: #f0f9ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.template-card__actions {
  display: flex;
  gap: 0.25rem;
}

.template-card__action-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.template-card__action-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.template-card__content {
  flex: 1;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.template-card__description {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #475569;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-card__section-preview {
  font-size: 0.75rem;
  color: #94a3b8;
  background-color: #f8fafc;
  border-radius: 6px;
  padding: 0.625rem;
  max-height: 4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.template-card__footer {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.template-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.template-card__date {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.template-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.template-card__tag {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background-color: #f1f5f9;
  color: #475569;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
}

.template-card__tag:hover {
  background-color: #e2e8f0;
  color: #334155;
}

.template-card__tag-more {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background-color: #f1f5f9;
  color: #64748b;
}

.template-card__btn {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.325rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card__btn--primary {
  background-color: #4f46e5;
  color: white;
  border: none;
}

.template-card__btn--primary:hover {
  background-color: #4338ca;
}

.template-card__btn--secondary {
  background-color: white;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.template-card__btn--secondary:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.template-context-menu {
  position: fixed;
  z-index: 100;
  min-width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(203, 213, 225, 0.5);
  overflow: hidden;
  animation: fadeIn 0.15s ease-out;
}

.template-context-menu__item {
  width: 100%;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #334155;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.template-context-menu__item:last-child {
  border-bottom: none;
}

.template-context-menu__item:hover {
  background-color: #f8fafc;
}

.template-context-menu__item--danger {
  color: #ef4444;
}

.template-context-menu__item--danger:hover {
  background-color: #fef2f2;
}

.template-library__create-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  cursor: pointer;
  transition: all 0.2s;
  z-index: 50;
}

.template-library__create-btn:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.template-library__create-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.template-library__preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.template-library__preview-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease-out;
}

.template-library__preview-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  margin: 1rem;
  animation: slideUp 0.3s ease-out;
  z-index: 1001;
}

.template-library__preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.template-library__preview-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.template-library__preview-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.template-library__preview-close:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.template-library__preview-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.template-library__preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

/* Import form styles */
.import-form {
  padding: 0.5rem 0;
}

.import-form__group {
  margin-bottom: 1rem;
}

.import-form__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.import-form__file {
  width: 100%;
  padding: 0.5rem;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
}

.import-form__help {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #64748b;
}

.import-form__help--warning {
  color: #f59e0b;
}

.import-form__checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.import-form__checkbox {
  width: 16px;
  height: 16px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Responsive styles */
@media (max-width: 640px) {
  .template-library__controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .template-library__sort {
    margin-left: 0;
  }
  
  .template-library__grid--grid-view {
    grid-template-columns: 1fr;
  }
  
  .template-card--list-view {
    flex-direction: column;
  }
  
  .template-card--list-view .template-card__header,
  .template-card--list-view .template-card__content,
  .template-card--list-view .template-card__footer {
    width: 100%;
  }
  
  .template-card--list-view .template-card__description {
    width: 100%;
    padding-right: 0;
  }
  
  .template-library__preview-content {
    max-width: calc(100% - 2rem);
    margin: 1rem;
  }
  
  .template-library__preview-body {
    padding: 1rem;
  }
}
</style>
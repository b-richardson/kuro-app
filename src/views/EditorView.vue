<template>
  <div class="editor-view">
    <div class="editor-layout">
      <!-- Main content area with editor and preview -->
      <div class="editor-content">
        <div class="editor-header">
          <div class="editor-title">
            <h1>
              <input 
                type="text"
                class="template-title-input"
                v-model="templateName"
                placeholder="Untitled Template"
                @input="markAsModified"
              />
            </h1>
          </div>
          <div class="editor-actions">
            <button 
              class="action-button"
              @click="setFocusMode(uiStore.focusMode === 'editor' ? 'none' : 'editor')"
              title="Toggle editor fullscreen"
            >
              <i class="fas" :class="uiStore.focusMode === 'editor' ? 'fa-compress' : 'fa-expand'"></i>
            </button>
            <button 
              class="action-button"
              @click="setFocusMode(uiStore.focusMode === 'preview' ? 'none' : 'preview')"
              title="Toggle preview fullscreen"
            >
              <i class="fas" :class="uiStore.focusMode === 'preview' ? 'fa-compress' : 'fa-eye'"></i>
            </button>
            
            <ExportDropdown />
          </div>
        </div>
        
        <div class="editor-grid" :style="editorGridStyle">
          <!-- Template Editor -->
          <div class="editor-panel glass-card" :class="{ 'full-width': uiStore.focusMode === 'editor' }">
            <div class="panel-header">
              <div class="panel-title">
                <h2>Editor</h2>
              </div>
            </div>
            
            <DragDropEditor
              :sections="templateStore.currentSections"
              @update="updateSections"
              @delete="deleteSection"
              @section-change="markAsModified"
            />
          </div>
          
          <!-- Markdown Preview -->
          <div 
            class="preview-panel glass-card" 
            :class="{ 'full-width': uiStore.focusMode === 'preview', 'hidden': uiStore.focusMode === 'editor' }"
            v-show="uiStore.focusMode !== 'editor'"
          >
            <MarkdownPreview
              :sections="templateStore.currentSections"
              :export-profile="preferencesStore.currentExportProfile"
              @update:export-profile="preferencesStore.setCurrentExportProfile"
              @focus-mode="togglePreviewFocus"
            />
          </div>
          
          <!-- Resizer handle when both panels are visible -->
          <div 
            class="resize-handle" 
            v-show="uiStore.focusMode === 'none'"
            @mousedown="startResize"
            @touchstart="startTouchResize"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Autosave indicator -->
    <div class="autosave-indicator" v-if="autoSaving">
      <i class="fas fa-sync-alt fa-spin"></i>
      <span>Autosaving...</span>
    </div>
    
    <!-- Confirmation dialog for unsaved changes -->
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
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTemplateStore } from '@/stores/template';
import { useUIStore } from '@/stores/ui';
import { usePreferencesStore } from '@/stores/preferences';
import { debounce } from 'lodash-es';

import DragDropEditor from '@/components/TemplateCreator/DragDropEditor.vue';
import MarkdownPreview from '@/components/TemplateCreator/MarkdownPreview.vue';
import ExportDropdown from '@/components/TemplateCreator/ExportDropdown.vue';
import ConfirmationDialog from '@/components/UI/ConfirmationDialog.vue';

// Props from route
const props = defineProps<{
  id?: string
}>();

// Router and stores
const router = useRouter();
const route = useRoute();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();

// Local state
const resizing = ref(false);
const autoSaving = ref(false);
const themeMode = ref('dark'); // Get from preferences
const templateName = computed({
  get: () => templateStore.currentTemplate?.name || '',
  set: (value) => {
    if (templateStore.currentTemplate) {
      templateStore.currentTemplate.name = value;
      markAsModified();
      // Update template name in the store
      templateStore.updateTemplateName(value);
    }
  }
});

// Computed properties
const editorGridStyle = computed(() => {
  // Don't override direct style changes when in the middle of resizing
  if (resizing.value) {
    return {};
  }
  
  if (uiStore.focusMode !== 'none') {
    return {};
  }
  return {
    gridTemplateColumns: `${uiStore.editorWidth}% ${100 - uiStore.editorWidth}%`
  };
});



// Methods
const handleBack = () => {
  if (uiStore.isModified) {
    uiStore.showConfirmationDialog(
      "Unsaved Changes",
      "You have unsaved changes. Do you want to save before leaving?",
      "Save",
      "Discard",
      () => {
        saveTemplate();
        router.push({ name: "library" });
      },
      () => {
        router.push({ name: "library" });
      }
    );
  } else {
    router.push({ name: "library" });
  }
};

const saveTemplate = async () => {
  try {
    await templateStore.saveCurrentTemplate();
    uiStore.showToast("Template saved successfully", "success");
  } catch (error) {
    uiStore.showToast(`Error saving template: ${error}`, "error");
  }
};

const toggleSidebar = () => {
  uiStore.toggleSidebar();
};

const setFocusMode = (mode) => {
  uiStore.setFocusMode(mode);
};

// Toggle preview focus from MarkdownPreview component
const togglePreviewFocus = () => {
  if (uiStore.focusMode !== 'preview') {
    uiStore.setFocusMode('preview');
  } else {
    uiStore.setFocusMode('none');
  }
};

const addSection = (section) => {
  templateStore.addSection(section);
  markAsModified();
};

const updateSections = (sections) => {
  templateStore.updateSections(sections);
  markAsModified();
};

const deleteSection = (sectionId) => {
  templateStore.deleteSection(sectionId);
  markAsModified();
};

const markAsModified = () => {
  uiStore.setModified(true);
  debouncedAutosave();
};

// Autosave functionality
const debouncedAutosave = debounce(async () => {
  if (!uiStore.isModified) return;
  
  autoSaving.value = true;
  try {
    await templateStore.saveCurrentTemplate();
    uiStore.setModified(false);
    uiStore.showToast('Template autosaved', 'success', 2000);
  } catch (error) {
    console.error('Autosave failed:', error);
  } finally {
    autoSaving.value = false;
  }
}, 5000);

// Improved resize functionality
const startResize = (e) => {
  e.preventDefault();
  resizing.value = true;
  
  // Add the classes for visual feedback
  const container = document.querySelector('.editor-grid');
  if (container) {
    container.classList.add('resizing');
  }
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
};

const handleResize = (e) => {
  if (!resizing.value) return;
  
  const container = document.querySelector('.editor-grid');
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const width = e.clientX - rect.left;
  const percent = Math.min(Math.max((width / rect.width) * 100, 20), 80);
  
  // Apply the style directly to the grid element for immediate visual feedback
  container.style.gridTemplateColumns = `${percent}% ${100 - percent}%`;
  
  // Also update the store for persistence
  uiStore.setEditorWidth(percent);
  
  // Update the resize handle position
  const handle = document.querySelector('.resize-handle');
  if (handle) {
    handle.style.left = `${percent}%`;
  }
};

const stopResize = () => {
  resizing.value = false;
  
  // Remove the resizing class
  const container = document.querySelector('.editor-grid');
  if (container) {
    container.classList.remove('resizing');
  }
  
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  
  // Final sync of handle position with actual grid division
  const handle = document.querySelector('.resize-handle');
  if (handle) {
    handle.style.left = `${uiStore.editorWidth}%`;
  }
  
  // Save the preference
  preferencesStore.saveEditorWidth(uiStore.editorWidth);
};

// Touch event handlers for mobile devices
const startTouchResize = (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startResize({ clientX: touch.clientX, preventDefault: () => {} });
  
  document.addEventListener('touchmove', handleTouchResize, { passive: false });
  document.addEventListener('touchend', stopTouchResize);
};

const handleTouchResize = (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  handleResize({ clientX: touch.clientX });
};

const stopTouchResize = () => {
  document.removeEventListener('touchmove', handleTouchResize);
  document.removeEventListener('touchend', stopTouchResize);
  stopResize();
};

// Watch for changes in sections for autosave
watch(() => templateStore.currentSections, () => {
  if (!uiStore.isModified) {
    uiStore.setModified(true);
    debouncedAutosave();
  }
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
  // Load templates and preferences
  await templateStore.loadTemplates();
  preferencesStore.loadPreferences();
  uiStore.loadUIPreferences();
  
  // No longer need document-level dropdown management as it's handled in the MarkdownPreview component
  // Get theme preference
  themeMode.value = preferencesStore.theme || 'dark';
  
  // Explicitly set the initial grid template columns and resize handle position
  nextTick(() => {
    const container = document.querySelector('.editor-grid');
    const handle = document.querySelector('.resize-handle');
    
    if (container && uiStore.focusMode === 'none') {
      container.style.gridTemplateColumns = `${uiStore.editorWidth}% ${100 - uiStore.editorWidth}%`;
    }
    
    if (handle) {
      handle.style.left = `${uiStore.editorWidth}%`;
    }
  });
  
  // Set last visited view
  preferencesStore.setLastVisitedView('editor');
  
  // Load template if ID is provided, otherwise create a new template
  if (props.id) {
    try {
      await templateStore.loadTemplate(props.id);
      uiStore.setModified(false);
    } catch (error) {
      uiStore.showToast(`Error loading template: ${error}`, 'error');
      router.push({ name: 'editor' }); // Redirect to new template
    }
  } else {
    templateStore.createNewTemplate();
    uiStore.setModified(false);
  }
});

onUnmounted(() => {
  // Clean up resize event listeners
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.removeEventListener('touchmove', handleTouchResize);
  document.removeEventListener('touchend', stopTouchResize);
});
</script>

<style scoped>
.editor-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-md);
  position: relative;
  height: 100%;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
}

.editor-title h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.editor-actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.editor-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  flex: 1;
  position: relative;
  gap: var(--spacing-lg); /* Increased gap between panels */
}

.editor-panel, .preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all var(--transition-standard);
  border-radius: var(--radius-lg); /* Increased border radius */
}

/* Unique styling for the editor panel */
.editor-panel {
  background: rgba(30, 30, 46, 0.5);
  border: 1px solid rgba(76, 205, 196, 0.2);
  /* Enhanced teal tint with better shadow */
  box-shadow: 0 8px 32px rgba(76, 205, 196, 0.1);
}

/* Unique styling for the preview panel */
.preview-panel {
  background: rgba(30, 30, 46, 0.5);
  border: 1px solid rgba(52, 211, 153, 0.2);
  /* Enhanced green tint with better shadow */
  box-shadow: 0 8px 32px rgba(52, 211, 153, 0.1);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--glass-border);
  background: rgba(30, 30, 46, 0.8);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.panel-title h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.template-title-input {
  padding: 8px 12px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-size: 1.5rem;
  width: 100%;
  transition: all var(--transition-fast);
  font-weight: 600;
}

.template-title-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.25);
}

.full-width {
  grid-column: 1 / span 2;
}

.hidden {
  display: none;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 8px; /* Wider for easier grabbing */
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-full);
  cursor: col-resize;
  z-index: 10;
  transform: translateX(-50%);
  transition: background-color var(--transition-fast), opacity var(--transition-fast), width var(--transition-fast), box-shadow var(--transition-fast);
}

.resize-handle:hover {
  background: var(--color-primary);
  opacity: 0.4;
  width: 8px;
  box-shadow: 0 0 8px rgba(255, 171, 88, 0.3);
}

.resize-handle:active,
.resizing .resize-handle {
  background: var(--color-primary);
  opacity: 0.6;
  width: 10px;
  box-shadow: 0 0 12px var(--color-primary);
}

.resizing {
  cursor: col-resize !important;
}

.resizing * {
  user-select: none !important;
}

.autosave-indicator {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  animation: fadeIn 0.3s ease-out;
  z-index: 100;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
    padding: var(--spacing-sm);
  }
  
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .editor-grid {
    grid-template-columns: 1fr !important;
    grid-template-rows: 1fr 1fr;
    gap: var(--spacing-sm);
  }
  
  .editor-panel:not(.full-width),
  .preview-panel:not(.full-width) {
    grid-column: 1;
  }
  
  .editor-panel:not(.full-width) {
    grid-row: 1;
  }
  
  .preview-panel:not(.full-width) {
    grid-row: 2;
  }
  
  .resize-handle {
    display: none;
  }
  
  .template-title-input {
    font-size: 1.2rem;
  }
}
</style>
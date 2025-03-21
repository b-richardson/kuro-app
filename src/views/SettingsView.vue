<template>
  <div class="settings-view">
    <div class="settings-container">
      <div class="settings-header glass-card">
        <h1 class="settings-header__title">Settings</h1>
      </div>
      
      <div class="settings-content glass-card">
        <div class="settings-section">
          <h2 class="settings-section__title">Appearance</h2>
          <div class="settings-option">
            <label for="theme">Theme</label>
            <select id="theme" v-model="theme" @change="updateTheme">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <div class="settings-section">
          <h2 class="settings-section__title">Export Settings</h2>
          <div class="settings-option">
            <label for="export-profile">Default Export Profile</label>
            <select id="export-profile" v-model="exportProfileId" @change="updateExportProfile">
              <option v-for="profile in exportProfiles" :key="profile.id" :value="profile.id">
                {{ profile.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <div class="settings-section">
          <h2 class="settings-section__title">Editor Settings</h2>
          <div class="settings-option">
            <label for="editor-width">Default Editor Panel Width (%)</label>
            <input 
              type="range" 
              id="editor-width" 
              v-model="editorWidth" 
              min="20" 
              max="80" 
              step="5"
              @change="updateEditorWidth"
            />
            <span class="settings-value">{{ editorWidth }}%</span>
          </div>
        </div>
        
        <div class="settings-divider"></div>
        
        <div class="settings-section">
          <h2 class="settings-section__title">Storage Management</h2>
          <div class="settings-option">
            <button class="danger-button" @click="confirmClearStorage">
              <i class="fas fa-trash"></i> Clear All Templates
            </button>
            <p class="settings-description">
              This action will delete all your templates and cannot be undone.
            </p>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmationDialog from '../components/UI/ConfirmationDialog.vue';
import { useTemplateStore, useUIStore, usePreferencesStore } from '../stores';

// Get stores and router
const router = useRouter();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();

// Reactive state
const theme = ref('dark');
const exportProfileId = ref('');
const editorWidth = ref(50);

// Computed properties
const exportProfiles = computed(() => {
  return preferencesStore.exportProfiles;
});

// Lifecycle hooks
onMounted(() => {
  // Load all settings from stores
  preferencesStore.loadPreferences();
  
  // Set current values
  theme.value = preferencesStore.editorTheme || 'dark';
  exportProfileId.value = preferencesStore.activeExportProfileId || '';
  editorWidth.value = uiStore.editorWidth;
  
  // Set the last visited view to 'settings'
  preferencesStore.setLastVisitedView('settings');
});

// Methods
const updateTheme = () => {
  preferencesStore.setEditorTheme(theme.value);
  document.documentElement.setAttribute('data-theme', theme.value);
};

const updateExportProfile = () => {
  preferencesStore.setActiveExportProfile(exportProfileId.value);
  uiStore.showToast('Export profile updated', 'success');
};

const updateEditorWidth = () => {
  uiStore.setEditorWidth(Number(editorWidth.value));
  preferencesStore.saveEditorWidth(Number(editorWidth.value));
};

const confirmClearStorage = () => {
  uiStore.showConfirmationDialog(
    'Clear All Templates',
    'Are you sure you want to delete all templates? This action cannot be undone.',
    'Delete All',
    'Cancel',
    clearAllTemplates,
    () => {}
  );
};

const clearAllTemplates = () => {
  templateStore.clearAllTemplates();
  uiStore.showToast('All templates have been deleted', 'success');
};
</script>

<style scoped>
.settings-view {
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}

.settings-container {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.settings-header__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-content {
  padding: var(--spacing-lg);
}

.settings-section {
  margin-bottom: var(--spacing-lg);
}

.settings-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md);
  color: var(--color-text);
}

.settings-option {
  margin-bottom: var(--spacing-md);
}

.settings-option label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.settings-option select,
.settings-option input[type="text"],
.settings-option input[type="number"] {
  width: 100%;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xs);
}

.settings-option input[type="range"] {
  width: 100%;
  margin-bottom: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.05);
  height: 8px;
  border-radius: var(--radius-full);
  outline: none;
  -webkit-appearance: none;
}

.settings-option input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.settings-value {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.settings-description {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
}

.settings-divider {
  height: 1px;
  background: var(--glass-border);
  margin: var(--spacing-lg) 0;
}

.danger-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: rgb(244, 67, 54);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.danger-button:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .settings-container {
    padding: var(--spacing-md);
  }
  
  .settings-header {
    padding: var(--spacing-md) var(--spacing-md);
  }
  
  .settings-content {
    padding: var(--spacing-md);
  }
}
</style>
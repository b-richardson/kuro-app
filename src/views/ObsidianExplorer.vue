<template>
  <div class="obsidian-explorer">
    <!-- Connection status banner -->
    <ConnectionStatus 
      v-if="!obsidianStore.isConnected" 
      @reconnect="showReconnectModal = true" 
    />

    <div v-else class="explorer-container">
      <div class="explorer-header">
        <h2>
          <i class="fas fa-book"></i> 
          Obsidian Vault: {{ obsidianStore.vaultName || 'My Vault' }}
        </h2>
        <div class="explorer-actions">
          <button class="refresh-button" @click="refreshVault" title="Refresh vault">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          </button>
          <button class="settings-button" @click="showSettingsModal = true" title="Settings">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </div>

      <div class="explorer-layout">
        <!-- Sidebar: Folder Tree -->
        <div class="explorer-sidebar glass-card">
          <div class="sidebar-header">
            <h3>Folders</h3>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search files..." 
              class="search-input"
            />
          </div>
          
          <div class="folder-tree-container">
            <FolderTree 
              :structure="obsidianStore.folderStructure" 
              :active-path="activePath"
              @select-folder="handleFolderSelect"
              @select-file="handleFileSelect"
              :filter="searchQuery"
              :loading="isRefreshing"
            />
          </div>
        </div>

        <!-- Main: Content View -->
        <div class="explorer-content">
          <!-- Folder View -->
          <div v-if="!activeFile && activePath" class="folder-view glass-card">
            <div class="folder-header">
              <h3>
                <i class="fas fa-folder-open"></i> 
                {{ getFolderDisplayName(activePath) }}
              </h3>
              <p class="folder-path">{{ activePath }}</p>
            </div>

            <div v-if="currentFolderFiles.length === 0 && currentFolderFolders.length === 0" class="empty-folder">
              <i class="fas fa-folder-open"></i>
              <p>This folder is empty</p>
            </div>

            <div v-else class="folder-contents">
              <!-- Subfolders -->
              <div v-if="currentFolderFolders.length > 0" class="subfolders-section">
                <h4>Folders</h4>
                <div class="subfolder-grid">
                  <div 
                    v-for="folder in currentFolderFolders" 
                    :key="folder.path"
                    class="subfolder-item"
                    @click="handleFolderSelect(folder.path)"
                  >
                    <i class="fas fa-folder"></i>
                    <span>{{ folder.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Files -->
              <div v-if="currentFolderFiles.length > 0" class="files-section">
                <h4>Notes</h4>
                <div class="file-grid">
                  <div 
                    v-for="file in currentFolderFiles" 
                    :key="file.path"
                    class="file-item"
                    :class="{ 'active': file.path === activeFile?.path }"
                    @click="handleFileSelect(file.path)"
                  >
                    <div class="file-icon">
                      <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="file-details">
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-meta">{{ formatDate(file.mtime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- File Preview -->
          <div v-else-if="activeFile" class="file-preview glass-card">
            <div class="file-preview-header">
              <div class="file-info">
                <h3>
                  <i class="fas fa-file-alt"></i> 
                  {{ activeFile.name }}
                </h3>
                <p class="file-path">{{ activeFile.path }}</p>
              </div>
              <div class="file-actions">
                <button 
                  class="file-action-button" 
                  title="Use as template" 
                  @click="createTemplateFromNote(activeFile.path)"
                >
                  <i class="fas fa-magic"></i> Create Template
                </button>
                <button 
                  class="file-action-button" 
                  title="Add to selection" 
                  @click="toggleNoteSelection(activeFile.path)"
                  :class="{ 'selected': isNoteSelected(activeFile.path) }"
                >
                  <i :class="isNoteSelected(activeFile.path) ? 'fas fa-check-square' : 'fas fa-square'"></i>
                  {{ isNoteSelected(activeFile.path) ? 'Selected' : 'Select' }}
                </button>
              </div>
            </div>

            <div class="file-metadata" v-if="activeNoteMetadata && hasMetadata">
              <div class="metadata-section">
                <h4>Metadata</h4>
                <div class="metadata-tags" v-if="activeNoteMetadata.tags?.length">
                  <span 
                    v-for="tag in activeNoteMetadata.tags" 
                    :key="tag" 
                    class="metadata-tag"
                  >
                    #{{ tag }}
                  </span>
                </div>
                <div class="metadata-yaml" v-if="activeNoteMetadata.frontmatter">
                  <div 
                    v-for="(value, key) in activeNoteMetadata.frontmatter" 
                    :key="key"
                    class="metadata-item"
                  >
                    <span class="metadata-key">{{ key }}:</span>
                    <span class="metadata-value">{{ formatMetadataValue(value) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="file-content-preview">
              <!-- Loading state -->
              <div v-if="isNoteLoading" class="note-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading note content...</span>
              </div>

              <!-- Error state -->
              <div v-else-if="noteLoadError" class="note-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ noteLoadError }}</span>
                <button @click="loadFileContent(activeFile.path)">Retry</button>
              </div>

              <!-- Content preview -->
              <div v-else class="markdown-preview" v-html="renderedNoteContent"></div>
            </div>
          </div>

          <!-- No selection state -->
          <div v-else class="no-selection glass-card">
            <div class="no-selection-content">
              <i class="fas fa-folder"></i>
              <p>Select a folder or note to view</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Notes Panel -->
      <div 
        v-if="selectedNotes.length > 0" 
        class="selected-notes-panel glass-card"
      >
        <div class="selected-notes-header">
          <div class="selection-info">
            <h3>Selected Notes ({{ selectedNotes.length }})</h3>
            <p>Use these notes to create templates</p>
          </div>
          <div class="selection-actions">
            <button 
              class="clear-button" 
              @click="clearSelection"
              title="Clear selection"
            >
              <i class="fas fa-times"></i> Clear
            </button>
            <button 
              class="primary-action-button" 
              @click="analyzeSelectedNotes"
              :disabled="isAnalyzing"
            >
              <i class="fas" :class="isAnalyzing ? 'fa-spinner fa-spin' : 'fa-magic'"></i>
              {{ isAnalyzing ? 'Analyzing Notes...' : 'Analyze & Create Templates' }}
            </button>
          </div>
        </div>
        
        <div class="selected-notes-list">
          <div 
            v-for="note in selectedNotesDetails" 
            :key="note.path"
            class="selected-note-item"
          >
            <div class="selected-note-info" @click="handleFileSelect(note.path)">
              <i class="fas fa-file-alt"></i>
              <span class="selected-note-name">{{ note.name }}</span>
            </div>
            <button 
              class="remove-note-button" 
              @click="toggleNoteSelection(note.path)"
              title="Remove from selection"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reconnect Modal -->
    <ObsidianConnectModal 
      v-if="showReconnectModal" 
      @close="showReconnectModal = false" 
      @connected="handleReconnected"
    />

    <!-- Settings Modal -->
    <ObsidianSettingsModal
      v-if="showSettingsModal"
      @close="showSettingsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useObsidianStore } from '@/stores/obsidian';
import { useTemplateStore } from '@/stores/template';
import { useUIStore } from '@/stores/ui';
import { format } from 'date-fns';
import MarkdownIt from 'markdown-it';
import FolderTree from '@/components/obsidian/FolderTree.vue';
import ConnectionStatus from '@/components/obsidian/ConnectionStatus.vue';
import ObsidianConnectModal from '@/components/obsidian/ObsidianConnectModal.vue';
import ObsidianSettingsModal from '@/components/obsidian/ObsidianSettingsModal.vue';

const router = useRouter();
const obsidianStore = useObsidianStore();
const templateStore = useTemplateStore();
const uiStore = useUIStore();

// UI state
const showReconnectModal = ref(false);
const showSettingsModal = ref(false);
const isRefreshing = ref(false);
const isNoteLoading = ref(false);
const noteLoadError = ref<string | null>(null);
const isAnalyzing = ref(false);
const searchQuery = ref('');

// Navigation state
const activePath = ref('');
const activeFile = ref<{
  name: string;
  path: string;
  folder: string;
  extension: string;
  mtime?: number;
} | null>(null);
const selectedNotes = ref<string[]>([]);

// Markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Load vault data on component mount
onMounted(async () => {
  if (obsidianStore.isConnected) {
    await refreshVault();
  }
});

// Refresh vault contents
const refreshVault = async () => {
  isRefreshing.value = true;
  try {
    await obsidianStore.fetchVaultStructure();
    // Reset active selections if the paths no longer exist
    if (activePath.value && !obsidianStore.pathExists(activePath.value)) {
      activePath.value = '';
    }
    if (activeFile.value && !obsidianStore.fileExists(activeFile.value.path)) {
      activeFile.value = null;
    }
    // Update selected notes list to remove any that no longer exist
    selectedNotes.value = selectedNotes.value.filter(path => 
      obsidianStore.fileExists(path)
    );
  } catch (error: any) {
    console.error('Error refreshing vault:', error);
    uiStore.showToast(`Error refreshing vault: ${error.message}`, 'error');
  } finally {
    isRefreshing.value = false;
  }
};

// Handle reconnection
const handleReconnected = async () => {
  await refreshVault();
};

// Folder navigation
const handleFolderSelect = (folderPath: string) => {
  activePath.value = folderPath;
  activeFile.value = null;
};

// Get the display name for a folder
const getFolderDisplayName = (path: string) => {
  if (!path || path === '/') return 'Root';
  return path.split('/').pop() || path;
};

// File navigation and viewing
const handleFileSelect = async (filePath: string) => {
  if (!obsidianStore.fileExists(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }

  const fileInfo = obsidianStore.getFileInfo(filePath);
  activeFile.value = fileInfo;
  activePath.value = fileInfo.folder;
  
  await loadFileContent(filePath);
};

// Load file content
const loadFileContent = async (filePath: string) => {
  isNoteLoading.value = true;
  noteLoadError.value = null;
  
  try {
    await obsidianStore.fetchNoteContent(filePath);
  } catch (error: any) {
    console.error('Error loading note content:', error);
    noteLoadError.value = 'Failed to load note content. Please try again.';
  } finally {
    isNoteLoading.value = false;
  }
};

// Selection management
const toggleNoteSelection = (filePath: string) => {
  const index = selectedNotes.value.indexOf(filePath);
  if (index === -1) {
    selectedNotes.value.push(filePath);
  } else {
    selectedNotes.value.splice(index, 1);
  }
};

const isNoteSelected = (filePath: string) => {
  return selectedNotes.value.includes(filePath);
};

const clearSelection = () => {
  selectedNotes.value = [];
};

// Template creation
const createTemplateFromNote = async (filePath: string) => {
  try {
    // Ensure note content is loaded
    if (!obsidianStore.hasNoteContent(filePath)) {
      await obsidianStore.fetchNoteContent(filePath);
    }
    
    // Get note content and metadata
    const noteContent = obsidianStore.getNoteContent(filePath);
    const noteMetadata = obsidianStore.getNoteMetadata(filePath);
    const fileInfo = obsidianStore.getFileInfo(filePath);
    
    if (!fileInfo) {
      throw new Error('File information not found');
    }
    
    // Create a template draft in the template store
    const templateId = await templateStore.createNewTemplate({
      name: fileInfo.name.replace(/\.md$/, ''),
      content: noteContent,
      frontmatter: noteMetadata.frontmatter,
      tags: noteMetadata.tags
    });
    
    // Navigate to the template editor with the new template
    router.push({
      name: 'editor',
      params: { id: templateId }
    });
  } catch (error: any) {
    console.error('Error creating template from note:', error);
    uiStore.showToast(`Error creating template: ${error.message}`, 'error');
  }
};

const analyzeSelectedNotes = async () => {
  if (selectedNotes.value.length === 0) return;
  
  isAnalyzing.value = true;
  
  try {
    // Ensure all selected notes have their content loaded
    for (const filePath of selectedNotes.value) {
      if (!obsidianStore.hasNoteContent(filePath)) {
        await obsidianStore.fetchNoteContent(filePath);
      }
    }
    
    // Get details for all selected notes
    const selectedNotesData = selectedNotes.value.map(filePath => {
      return {
        path: filePath,
        name: obsidianStore.getFileInfo(filePath)?.name || '',
        content: obsidianStore.getNoteContent(filePath),
        metadata: obsidianStore.getNoteMetadata(filePath)
      };
    });
    
    // For now, just create a new template with a list of the notes
    // Later this would be replaced with an actual analysis feature
    const templateContent = `# Template from Multiple Notes\n\n## Selected Notes\n\n${
      selectedNotesData.map(note => `- [[${note.name}]]\n`).join('')
    }\n\n`;
    
    const templateId = await templateStore.createNewTemplate({
      name: `Combined Template (${selectedNotesData.length} notes)`,
      content: templateContent
    });
    
    // Navigate to the template editor
    router.push({
      name: 'editor',
      params: { id: templateId }
    });
    
    // Show success message
    uiStore.showToast(`Created template from ${selectedNotes.value.length} notes`, 'success');
    
    // Clear selection
    selectedNotes.value = [];
  } catch (error: any) {
    console.error('Error analyzing selected notes:', error);
    uiStore.showToast(`Error analyzing notes: ${error.message}`, 'error');
  } finally {
    isAnalyzing.value = false;
  }
};

// Computed properties

// Get files and folders for the current active path
const currentFolderContents = computed(() => {
  if (!activePath.value) return { files: [], folders: [] };
  return obsidianStore.getFolderContents(activePath.value);
});

const currentFolderFiles = computed(() => {
  return currentFolderContents.value.files || [];
});

const currentFolderFolders = computed(() => {
  return currentFolderContents.value.folders || [];
});

// Get details for selected notes
const selectedNotesDetails = computed(() => {
  return selectedNotes.value
    .map(path => obsidianStore.getFileInfo(path))
    .filter(Boolean); // Filter out undefined values
});

// Get rendered markdown content for the active note
const renderedNoteContent = computed(() => {
  if (!activeFile.value) return '';
  
  const content = obsidianStore.getNoteContent(activeFile.value.path);
  if (!content) return '';
  
  return md.render(content);
});

// Get metadata for the active note
const activeNoteMetadata = computed(() => {
  if (!activeFile.value) return null;
  return obsidianStore.getNoteMetadata(activeFile.value.path);
});

// Check if active note has any metadata
const hasMetadata = computed(() => {
  if (!activeNoteMetadata.value) return false;
  
  return (
    (activeNoteMetadata.value.tags && activeNoteMetadata.value.tags.length > 0) ||
    (activeNoteMetadata.value.frontmatter && Object.keys(activeNoteMetadata.value.frontmatter).length > 0)
  );
});

// Helper functions
const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'Unknown date';
  return format(new Date(timestamp), 'MMM d, yyyy');
};

const formatMetadataValue = (value: any) => {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
</script>

<style scoped>
.obsidian-explorer {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.explorer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.explorer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.explorer-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
}

.explorer-header h2 i {
  color: var(--color-primary);
}

.explorer-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-button, .settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover, .settings-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.explorer-layout {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden;
  min-height: 0; /* Fix for flexbox overflow */
}

.explorer-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-size: 0.9rem;
}

.folder-tree-container {
  flex: 1;
  overflow: auto;
}

.explorer-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.folder-view, .file-preview, .no-selection {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.folder-header, .file-preview-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.folder-header h3, .file-preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.folder-path, .file-path {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.empty-folder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  gap: 1rem;
  color: var(--color-text-tertiary);
}

.empty-folder i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.folder-contents {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow: auto;
}

.subfolders-section, .files-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subfolders-section h4, .files-section h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.subfolder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.subfolder-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.subfolder-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.subfolder-item i {
  color: var(--color-primary);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.file-item.active {
  background-color: rgba(var(--color-primary-rgb), 0.2);
}

.file-icon {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.file-meta {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.file-preview-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.file-action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.file-action-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.file-action-button.selected {
  background-color: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary-light);
}

.file-metadata {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.metadata-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.metadata-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.metadata-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  background-color: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary-light);
  font-size: 0.85rem;
}

.metadata-yaml {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item {
  display: flex;
  font-size: 0.9rem;
}

.metadata-key {
  font-weight: 500;
  margin-right: 0.5rem;
  min-width: 100px;
}

.metadata-value {
  color: var(--color-text-secondary);
}

.file-content-preview {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.note-loading, .note-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  gap: 1rem;
  color: var(--color-text-tertiary);
}

.note-loading i, .note-error i {
  font-size: 2rem;
}

.note-error i {
  color: #ef4444;
}

.note-error button {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.markdown-preview {
  color: var(--color-text);
  font-size: 0.95rem;
  line-height: 1.6;
}

.markdown-preview h1 {
  font-size: 1.8rem;
  margin-top: 0;
}

.markdown-preview h2 {
  font-size: 1.5rem;
}

.markdown-preview h3 {
  font-size: 1.3rem;
}

.markdown-preview h4 {
  font-size: 1.1rem;
}

.markdown-preview blockquote {
  border-left: 3px solid var(--color-primary);
  margin-left: 0;
  padding-left: 1rem;
  color: var(--color-text-secondary);
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-selection-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--color-text-tertiary);
}

.no-selection-content i {
  font-size: 3rem;
  opacity: 0.5;
}

.selected-notes-panel {
  margin-top: 1rem;
}

.selected-notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.selection-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.selection-info p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.selection-actions {
  display: flex;
  gap: 0.5rem;
}

.clear-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.primary-action-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  background-color: var(--color-primary);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.primary-action-button:hover {
  background-color: var(--color-primary-dark);
}

.primary-action-button:disabled {
  background-color: rgba(var(--color-primary-rgb), 0.5);
  cursor: not-allowed;
}

.selected-notes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-note-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  padding-right: 0.35rem;
  border-radius: 20px;
  background-color: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary-light);
  font-size: 0.85rem;
}

.selected-note-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.selected-note-name {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-note-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--color-primary-light);
  cursor: pointer;
  padding: 0;
  font-size: 0.7rem;
}

.remove-note-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.glass-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Media Queries */
@media (max-width: 768px) {
  .explorer-layout {
    flex-direction: column;
  }
  
  .explorer-sidebar {
    width: 100%;
    height: 300px;
  }
  
  .file-preview-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .file-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .file-grid, .subfolder-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .selected-notes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .selection-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
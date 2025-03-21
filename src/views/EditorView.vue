<template>
  <div class="editor-view">
    <AppHeader
      title="Template Editor"
      :show-back-button="true"
      @back="handleBack"
    >
      <template #actions>
        <div class="editor-actions">
          <button
            class="action-button save-button"
            @click="saveTemplate"
            :disabled="!uiStore.isModified"
          >
            <i class="fas fa-save"></i> Save
          </button>

          <ExportDropdown :sections="templateStore.currentSections" />

          <button class="layout-button" @click="toggleSidebar">
            <i
              class="fas"
              :class="uiStore.sidebarHidden ? 'fa-bars' : 'fa-times'"
            ></i>
          </button>
        </div>
      </template>
    </AppHeader>

    <div
      class="editor-layout"
      :class="{ 'sidebar-hidden': uiStore.sidebarHidden }"
    >
      <!-- Section Library Sidebar -->
      <div class="editor-sidebar" v-show="!uiStore.sidebarHidden">
        <SectionLibrary @add-section="addSection" />
      </div>

      <!-- Main content area with editor and preview -->
      <div class="editor-content">
        <div class="editor-grid" :style="editorGridStyle">
          <!-- Template Editor -->
          <div
            class="editor-panel"
            :class="{ 'full-width': uiStore.focusMode === 'editor' }"
          >
            <div class="panel-header">
              <div class="panel-title">
                <h2>Editor</h2>
                <input
                  v-if="uiStore.focusMode !== 'preview'"
                  type="text"
                  class="template-title-input"
                  v-model="templateName"
                  placeholder="Untitled Template"
                />
              </div>
              <div class="panel-actions">
                <button
                  class="panel-action-button"
                  @click="setFocusMode('editor')"
                  v-if="uiStore.focusMode !== 'editor'"
                  title="Expand editor"
                >
                  <i class="fas fa-expand"></i>
                </button>
                <button
                  class="panel-action-button"
                  @click="setFocusMode('none')"
                  v-else
                  title="Restore split view"
                >
                  <i class="fas fa-compress"></i>
                </button>
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
            class="preview-panel"
            :class="{
              'full-width': uiStore.focusMode === 'preview',
              hidden: uiStore.focusMode === 'editor',
            }"
            v-show="uiStore.focusMode !== 'editor'"
          >
            <div class="panel-header">
              <div class="panel-title">
                <h2>Preview</h2>
                <div class="export-profile-indicator">
                  <span
                    class="profile-badge"
                    :class="`profile-${getCurrentProfileId()}`"
                  >
                    {{ getProfileName(getCurrentProfileId()) }}
                  </span>
                </div>
              </div>
              <div class="panel-actions">
                <button
                  class="panel-action-button"
                  @click="setFocusMode('preview')"
                  v-if="uiStore.focusMode !== 'preview'"
                  title="Expand preview"
                >
                  <i class="fas fa-expand"></i>
                </button>
                <button
                  class="panel-action-button"
                  @click="setFocusMode('none')"
                  v-else
                  title="Restore split view"
                >
                  <i class="fas fa-compress"></i>
                </button>
              </div>
            </div>

            <MarkdownPreview
              :sections="templateStore.currentSections"
              :export-profile="preferencesStore.currentExportProfile"
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useUIStore } from "@/stores/ui";
import { usePreferencesStore } from "@/stores/preferences";

import AppHeader from "@/components/Layout/AppHeader.vue";
import SectionLibrary from "@/components/TemplateCreator/SectionLibrary.vue";
import DragDropEditor from "@/components/TemplateCreator/DragDropEditor.vue";
import MarkdownPreview from "@/components/TemplateCreator/MarkdownPreview.vue";
import ExportDropdown from "@/components/TemplateCreator/ExportDropdown.vue";
import ConfirmationDialog from "@/components/UI/ConfirmationDialog.vue";

// Props from route
const props = defineProps<{
  id?: string;
}>();

// Router and stores
const router = useRouter();
const route = useRoute();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();

// Computed properties
const editorGridStyle = computed(() => {
  if (uiStore.focusMode !== "none") {
    return {};
  }
  return {
    gridTemplateColumns: `${uiStore.editorWidth}% ${
      100 - uiStore.editorWidth
    }%`,
  };
});

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

// Helper functions for profiles
const getProfileName = (profileId: string): string => {
  const profiles: Record<string, string> = {
    plain: "Plain Markdown",
    templater: "Templater",
    dataview: "Dataview",
    full: "Full Plugin Suite",
  };
  return profiles[profileId] || "Unknown";
};

const getCurrentProfileId = (): "plain" | "templater" | "dataview" | "full" => {
  if (!preferencesStore.currentExportProfile) return "full";
  return preferencesStore.currentExportProfile.id || "full";
};

// This function is no longer needed as the functionality is now in the templateName computed property

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
  // We could implement autosave here if needed in the future
};

// Resize functionality with state tracking
const resizing = ref(false);

const startResize = (e) => {
  e.preventDefault();
  resizing.value = true;

  // Add resizing class for visual feedback
  const container = document.querySelector(".editor-grid");
  if (container) {
    container.classList.add("resizing");
  }

  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
};

const handleResize = (e) => {
  if (!resizing.value) return;

  const container = document.querySelector(".editor-grid");
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const width = e.clientX - rect.left;
  const percent = Math.min(Math.max((width / rect.width) * 100, 20), 80);
  uiStore.setEditorWidth(percent);
};

const stopResize = () => {
  resizing.value = false;

  // Remove resizing class
  const container = document.querySelector(".editor-grid");
  if (container) {
    container.classList.remove("resizing");
  }

  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);

  // Save preference
  preferencesStore.saveEditorWidth(uiStore.editorWidth);
};

// Touch event handlers for mobile devices
const startTouchResize = (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startResize({ clientX: touch.clientX, preventDefault: () => {} });

  // Add touch event listeners
  document.addEventListener("touchmove", handleTouchResize, { passive: false });
  document.addEventListener("touchend", stopTouchResize);
};

const handleTouchResize = (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  handleResize({ clientX: touch.clientX });
};

const stopTouchResize = () => {
  document.removeEventListener("touchmove", handleTouchResize);
  document.removeEventListener("touchend", stopTouchResize);
  stopResize();
};

// Lifecycle hooks
onMounted(async () => {
  // Load templates and preferences
  templateStore.loadTemplates();
  preferencesStore.loadPreferences();
  uiStore.loadUIPreferences();

  // Set last visited view
  preferencesStore.setLastVisitedView("editor");

  // Load template if ID is provided, otherwise create a new template
  if (props.id) {
    try {
      await templateStore.loadTemplate(props.id);
      uiStore.setModified(false);
    } catch (error) {
      uiStore.showToast(`Error loading template: ${error}`, "error");
      router.push({ name: "editor" }); // Redirect to new template
    }
  } else {
    templateStore.createNewTemplate();
    uiStore.setModified(false);
  }
});

onUnmounted(() => {
  // Clean up all event listeners
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleTouchResize);
  document.removeEventListener("touchend", stopTouchResize);
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

.editor-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-sidebar {
  width: 250px;
  border-right: 1px solid var(--glass-border);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  overflow-y: auto;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.editor-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  height: 100%;
  position: relative;
}

.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.panel-action-button {
  background: transparent;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-action-button:hover {
  background: var(--glass-background);
  color: var(--color-primary);
}

.template-title-input {
  padding: 2px 6px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: var(--glass-background);
  color: var(--color-text);
  font-size: 0.9rem;
  width: 200px;
  transition: all 0.2s ease;
}

.template-title-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.export-profile-indicator {
  display: flex;
  align-items: center;
}

.profile-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 100px;
  background: var(--glass-background);
  color: var(--color-text);
}

.profile-plain {
  background: rgba(100, 116, 139, 0.2);
  color: rgb(100, 116, 139);
}

.profile-templater {
  background: rgba(6, 182, 212, 0.2);
  color: rgb(6, 182, 212);
}

.profile-dataview {
  background: rgba(139, 92, 246, 0.2);
  color: rgb(139, 92, 246);
}

.profile-full {
  background: rgba(79, 70, 229, 0.2);
  color: rgb(79, 70, 229);
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
  width: 6px;
  background: transparent;
  cursor: col-resize;
  z-index: 10;
  transform: translateX(-50%);
  transition: background-color 0.15s ease;
}

.resize-handle:hover {
  background: var(--color-primary);
  opacity: 0.4;
}

.resize-handle:active,
.resizing .resize-handle {
  background: var(--color-primary);
  opacity: 0.6;
  width: 8px;
}

.resizing {
  cursor: col-resize !important;
}

.resizing * {
  user-select: none !important;
}

.sidebar-hidden .editor-sidebar {
  display: none;
}

.action-button {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-background);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: var(--color-surface);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-button {
  background: var(--color-primary);
  color: white;
  border: none;
}

.save-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.layout-button {
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-background);
  color: var(--color-text);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .editor-grid {
    grid-template-columns: 1fr !important;
    grid-template-rows: 1fr 1fr;
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
    top: 50%;
    left: 0;
    right: 0;
    bottom: auto;
    width: 100%;
    height: 5px;
    transform: translateY(-50%);
    cursor: row-resize;
  }

  .editor-sidebar {
    position: absolute;
    z-index: 100;
    height: 100%;
    box-shadow: var(--glass-shadow);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .editor-layout:not(.sidebar-hidden) .editor-sidebar {
    transform: translateX(0);
  }

  .template-title-input {
    width: 150px;
  }
}
</style>

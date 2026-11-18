<template>
  <div class="editor-view" :data-mobile-view="mobileView">
    <!-- Top Toolbar (Metadata) -->
    <div class="editor-toolbar top-toolbar glass-card">
      <div class="metadata-form">
        <input
          type="text"
          class="template-title-input"
          v-model="templateName"
          placeholder="Untitled Template"
          @input="markAsModified"
        />
        <input
          type="text"
          class="template-description-input"
          v-model="templateDescription"
          placeholder="Add a description (optional)"
          @input="markAsModified"
        />
      </div>

      <!-- Autosave indicator -->
      <div class="autosave-indicator" :data-status="saveStatus">
        <i
          class="fas"
          :class="{
            'fa-circle-notch': saveStatus === 'idle',
            'fa-circle-notch fa-spin': saveStatus === 'saving',
            'fa-check-circle': saveStatus === 'success',
            'fa-exclamation-triangle': saveStatus === 'error',
          }"
        />
        <span>Autosave</span>
      </div>
    </div>

    <!-- Main Content Area (Three Panels) -->
    <div
      class="editor-content"
      :class="{
        'sidebar-collapsed': isSidebarCollapsed,
        'focus-mode': isPreviewFocused,
      }"
    >
      <!-- Left Panel: Module Library (Collapsible) -->
      <div class="module-library-panel">
        <div class="panel-header">
          <h2>Module Library</h2>
          <button
            class="collapse-button"
            @click="toggleSidebar"
            title="Toggle sidebar"
          >
            <i
              class="fas"
              :class="
                isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'
              "
            ></i>
          </button>
        </div>

        <!-- Template Module Library Component -->
        <TemplateModuleLibrary
          :collapsed="isSidebarCollapsed"
          @add-module="addModuleToCanvas"
          @show-dialog="showInfoDialog"
        />
      </div>

      <!-- Middle Panel: Main Canvas Editor -->
      <div class="editor-canvas-panel glass-card">
        <div class="panel-header">
          <h2>Template Module Editor</h2>
        </div>

        <!-- Module Canvas Component -->
        <ModuleCanvas
          :modules="templateStore.currentModules"
          @update="updateModules"
          @delete="deleteModule"
          @module-change="markAsModified"
          ref="moduleCanvasRef"
        />
      </div>

      <!-- Right Panel: Markdown Preview -->
      <div
        class="preview-panel glass-card"
        :class="{ 'preview-focused': isPreviewFocused }"
      >
        <div class="panel-header">
          <h2>Preview</h2>

          <!-- Only keep focus mode button in the header -->
          <div class="panel-header-actions">
            <button
              class="panel-action-button"
              @click="togglePreviewFocus"
              title="Toggle focus mode"
            >
              <i
                class="fas"
                :class="isPreviewFocused ? 'fa-compress' : 'fa-expand'"
              ></i>
            </button>
          </div>
        </div>

        <!-- New Preview Controls Component -->
        <div class="preview-controls-bar">
          <div class="preview-controls-group">
            <!-- View Mode Dropdown -->
            <div class="dropdown">
              <button
                class="dropdown-trigger glass-button"
                @click.stop="toggleViewModeMenu"
                title="Change view mode"
              >
                <i class="fas fa-eye"></i>
                <span>Mode: {{ currentViewMode }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="dropdown-menu" v-if="showViewModeMenu">
                <div
                  class="dropdown-item"
                  :class="{ active: currentViewMode === 'Rendered' }"
                  @click="setViewMode('Rendered')"
                >
                  <i class="fas fa-eye"></i>
                  Rendered
                </div>
                <div
                  class="dropdown-item"
                  :class="{ active: currentViewMode === 'Markdown' }"
                  @click="setViewMode('Markdown')"
                >
                  <i class="fas fa-code"></i>
                  Markdown
                </div>
                <div
                  class="dropdown-item"
                  :class="{ active: currentViewMode === 'Source' }"
                  @click="setViewMode('Source')"
                >
                  <i class="fas fa-file-code"></i>
                  Source
                </div>
              </div>
            </div>

            <!-- No export profile dropdown needed with the ObsidianEditor -->
          </div>
        </div>

        <!-- Markdown Preview Component -->
        <MarkdownPreview
          :modules="templateStore.currentModules"
          :view-mode="currentViewMode"
          @update:view-mode="setViewMode"
          @generation-start="previewGenerating = true"
          @generation-complete="previewGenerating = false"
        />
      </div>
    </div>

    <!-- Bottom Toolbar (Actions) -->
    <div class="editor-toolbar bottom-toolbar glass-card">
      <div class="left-actions">
        <!-- Mobile View Toggle (only visible on small screens) -->
        <div class="mobile-view-toggle">
          <button
            class="view-toggle-button"
            :class="{ active: mobileView === 'editor' }"
            @click="setMobileView('editor')"
          >
            <i class="fas fa-edit"></i> Editor
          </button>
          <button
            class="view-toggle-button"
            :class="{ active: mobileView === 'preview' }"
            @click="setMobileView('preview')"
          >
            <i class="fas fa-eye"></i> Preview
          </button>
        </div>
      </div>

      <div class="right-actions">
        <button
          class="action-button save-button"
          @click="pushToVault"
          :disabled="!obsidianStore.isConnected || isLoading"
        >
          <i
            class="fas"
            :class="isLoading ? 'fa-spinner fa-spin' : 'fa-file-export'"
          ></i>
          {{ isLoading ? "Pushing..." : "Push to Vault" }}
        </button>

        <button
          class="action-button export-button"
          @click="downloadTemplateAsMarkdown"
        >
          <i class="fas fa-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Confirmation dialog for unsaved changes -->
    <ConfirmationDialog
      v-if="uiStore.showConfirmDialog"
      :title="uiStore.confirmDialogTitle"
      :message="uiStore.confirmDialogMessage"
      :is-HTML="uiStore.confirmDialogIsHTML"
      :confirm-button-text="uiStore.confirmDialogConfirmText"
      :cancel-button-text="uiStore.confirmDialogCancelText"
      :show-cancel-button="uiStore.confirmDialogShowCancel"
      @confirm="uiStore.handleConfirmDialogConfirm()"
      @cancel="uiStore.handleConfirmDialogCancel()"
    />

    <!-- Push to Vault Confirmation Modal -->
    <PushToVaultModal
      :is-open="showPushToVaultModal"
      :destination-path="destinationPath"
      @close="showPushToVaultModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  inject,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useUIStore } from "@/stores/ui";
import { usePreferencesStore } from "@/stores/preferences";
import { useObsidianStore } from "@/stores/obsidian";
import debounce from "lodash-es/debounce";
import { v4 as uuidv4 } from "uuid";
import { TemplateModule } from "@/types/TemplateModule";
import { ViewMode } from "@/types/Editor";
import { generateMarkdown } from "@/utils/markdownUtils";
import PushToVaultModal from "@/components/modals/PushToVaultModal.vue";

// Import components
import TemplateModuleLibrary from "@/components/ModuleLibrary/TemplateModuleLibrary.vue";
import ModuleCanvas from "@/components/Editor/ModuleCanvas.vue";
import MarkdownPreview from "@/components/MarkdownPreview/MarkdownPreview.vue";
import ConfirmationDialog from "@/components/UI/ConfirmationDialog.vue";

// Import a placeholder for showProfileMenu which is missing but referenced
const showProfileMenu = ref(false);

// Router and stores
const router = useRouter();
const route = useRoute();
const templateStore = useTemplateStore();
const uiStore = useUIStore();
const preferencesStore = usePreferencesStore();
const obsidianStore = useObsidianStore();

// Props from route
const props = defineProps<{
  id?: string;
}>();

// Local state
const isSidebarCollapsed = ref(false);
const autoSaving = ref(false);
const previewGenerating = ref(false);
const mobileView = ref("editor"); // 'editor' or 'preview' for mobile view
const showViewModeMenu = ref(false);
// Plugin options are now handled by the ObsidianEditor component
const currentViewMode = ref<ViewMode>("Rendered");
const isPreviewFocused = ref(false);
const isLoading = ref(false); // General loading state for operations
const moduleCanvasRef = ref<InstanceType<typeof ModuleCanvas> | null>(null);
const showPushToVaultModal = ref(false);
const destinationPath = ref("");

// Autosave state for indicator
const saveStatus = ref<"idle" | "saving" | "success" | "error">("idle");

// Theme
const isDarkTheme = inject("theme", ref(true));

// Template metadata
const templateName = computed({
  get: () => templateStore.currentTemplate?.name || "",
  set: (value) => {
    if (templateStore.currentTemplate) {
      templateStore.currentTemplate.name = value;
      markAsModified();
    }
  },
});

const templateDescription = computed({
  get: () => templateStore.currentTemplate?.description || "",
  set: (value) => {
    if (templateStore.currentTemplate) {
      templateStore.currentTemplate.description = value;
      markAsModified();
    }
  },
});

// UI Interaction methods
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleViewModeMenu = () => {
  showViewModeMenu.value = !showViewModeMenu.value;
  if (showViewModeMenu.value) showProfileMenu.value = false;
};

const setViewMode = (mode: ViewMode) => {
  currentViewMode.value = mode;
  showViewModeMenu.value = false;
};

const setMobileView = (view: string) => {
  mobileView.value = view;
};

const togglePreviewFocus = () => {
  isPreviewFocused.value = !isPreviewFocused.value;
};

// Module management methods
const addModuleToCanvas = (module: TemplateModule) => {
  console.log("Adding module to canvas:", module);

  if (module.type === "frontmatter") {
    // Check if frontmatter already exists
    const existingFrontmatter = templateStore.currentModules.find(
      (m) => m.type === "frontmatter"
    );

    if (existingFrontmatter) {
      // Show warning if frontmatter already exists
      uiStore.showToast(
        "Only one frontmatter module allowed per template",
        "error"
      );
      return;
    }

    // For frontmatter, explicitly create a new array with frontmatter at the start
    const updatedModules = [module, ...templateStore.currentModules];
    templateStore.updateModules(updatedModules);
  } else {
    // Regular add for other modules
    templateStore.addModule(module);
  }

  console.log("Current modules after add:", templateStore.currentModules);
  markAsModified();

  // Scroll to the appropriate location
  setTimeout(() => {
    if (moduleCanvasRef.value) {
      const container =
        moduleCanvasRef.value.$el.querySelector(".modules-list");
      if (container) {
        if (module.type === "frontmatter") {
          // For frontmatter, scroll to top
          container.scrollTop = 0;
        } else {
          // For other modules, scroll to bottom
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  }, 100);
};

/**
 * Update modules in the template store
 * Called by ModuleCanvas when modules are reordered via drag and drop
 */
const updateModules = (modules: TemplateModule[]) => {
  // Guard against invalid parameters or unmounted component
  if (!isMounted.value) {
    return;
  }

  try {
    // Validate modules parameter
    if (!modules || !Array.isArray(modules)) {
      console.error("Invalid modules array provided to updateModules", modules);
      return;
    }

    // Use nextTick to avoid Vue patching conflicts
    nextTick(() => {
      if (isMounted.value) {
        // Create a proper reactive copy of the modules before updating the store
        // This ensures reactivity is maintained throughout the whole chain
        const reactiveModules = modules.map((module) => ({
          ...module,
          // Ensure content array is properly copied for reactivity
          content: Array.isArray(module.content)
            ? [...module.content]
            : [module.content as string],
          // Ensure metadata is properly copied if it exists
          metadata: module.metadata ? { ...module.metadata } : undefined,
        }));

        // Update the modules in the store
        templateStore.updateModules(reactiveModules);

        // Mark template as modified
        markAsModified();

        console.log("Modules updated successfully with reactivity preserved");
      }
    });
  } catch (error) {
    console.error("Error updating modules:", error);
  }
};

const deleteModule = (moduleId: string) => {
  // Guard against unmounted component or invalid ID
  if (!isMounted.value || !moduleId) {
    return;
  }

  try {
    // Wrap in nextTick to avoid DOM update conflicts
    nextTick(() => {
      if (isMounted.value) {
        templateStore.deleteModule(moduleId);
        markAsModified();
      }
    });
  } catch (error) {
    console.error("Error deleting module:", error);
  }
};

const duplicateModule = (moduleId: string) => {
  // Guard against unmounted component or invalid ID
  if (!isMounted.value || !moduleId) {
    return;
  }

  try {
    const moduleToDuplicate = templateStore.currentModules.find(
      (s) => s.id === moduleId
    );
    if (!moduleToDuplicate) {
      console.warn(`Module with ID ${moduleId} not found for duplication`);
      return;
    }

    // Create a deep copy with a new ID
    const newModule = {
      ...JSON.parse(JSON.stringify(moduleToDuplicate)),
      id: uuidv4(),
    };

    // Use nextTick to avoid Vue patching conflicts
    nextTick(() => {
      if (isMounted.value) {
        templateStore.addModule(newModule);
        markAsModified();
      }
    });
  } catch (error) {
    console.error("Error duplicating module:", error);
  }
};

// Template management methods
const saveTemplate = async () => {
  // Guard against unmounted component
  if (!isMounted.value) {
    return;
  }

  try {
    // Set a flag to indicate a manual save is in progress
    autoSaving.value = true;

    // Attempt to save the template
    await templateStore.saveCurrentTemplate();

    // Only update UI if component is still mounted
    if (isMounted.value) {
      uiStore.setModified(false);
      uiStore.showToast("Template saved successfully", "success");
    }
  } catch (error) {
    // Only show error if component is still mounted
    if (isMounted.value) {
      console.error("Error saving template:", error);
      uiStore.showToast(`Error saving template: ${error}`, "error");
    }
  } finally {
    // Clear flag if component is still mounted
    if (isMounted.value) {
      autoSaving.value = false;
    }
  }
};

/**
 * Show an information dialog
 */
const showInfoDialog = (dialogData: {
  title: string;
  content: string;
  type: string;
}) => {
  uiStore.setConfirmDialog({
    title: dialogData.title,
    message: dialogData.content,
    isHTML: true,
    confirmText: "Close",
    cancelText: "",
    showCancel: false,
    onConfirm: () => {
      // Just close the dialog
      uiStore.closeConfirmDialog();
    },
    onCancel: () => {
      // No action needed
    },
  });
};

/**
 * Push the template to connected Obsidian vault
 */
const pushToVault = async () => {
  // Guard against unmounted component
  if (!isMounted.value) {
    return;
  }

  // Check if Obsidian is connected
  if (!obsidianStore.isConnected) {
    uiStore.showToast(
      "Not connected to Obsidian. Please connect first.",
      "error"
    );
    return;
  }

  try {
    // Set up loading state
    isLoading.value = true;

    // Generate markdown content - no export profile needed with ObsidianEditor
    const markdown = generateMarkdown(templateStore.currentModules);

    // Create a safe filename from the template title
    const templateTitle =
      templateStore.currentTemplate?.name || "Untitled Template";
    const safeFilename = templateTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen

    // Add .md extension
    const filename = `${safeFilename}.md`;

    // Set destination path (Templates folder in vault)
    const destinationPath = `Templates/${filename}`;

    // Push the file to Obsidian vault
    const result = await obsidianStore.createOrUpdateFile(
      destinationPath,
      markdown
    );

    if (result) {
      showPushToVaultModal.value = true;
      console.log("File pushed to vault successfully:", result);
    } else {
      throw new Error("Failed to push template to vault. Unknown error.");
    }
  } catch (error: any) {
    console.error("Error pushing template to vault:", error);
    uiStore.showToast(
      `Error pushing template to vault: ${error.message || error}`,
      "error"
    );
  } finally {
    // Clear loading state
    isLoading.value = false;
  }
};

// Download template as markdown file in browser
const downloadTemplateAsMarkdown = () => {
  const markdown = generateMarkdown(templateStore.currentModules);

  const templateTitle =
    templateStore.currentTemplate?.name || "Untitled Template";
  const safeFilename = templateTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeFilename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const markAsModified = () => {
  // Only perform updates if component is mounted
  if (!isMounted.value) {
    return;
  }

  try {
    // Mark as modified in the UI store
    uiStore.setModified(true);

    // Trigger debounced autosave
    debouncedAutosave();
  } catch (error) {
    console.error("Error marking template as modified:", error);
  }
};

// Track component mounted state for safer operations
const isMounted = ref(false);

// Handle ongoing autosave operations
const autosavePromise = ref<Promise<any> | null>(null);
const abortController = ref<AbortController | null>(null);

// Improved autosave functionality with proper error handling and debouncing
const debouncedAutosave = debounce(
  async () => {
    if (!isMounted.value || !uiStore.isModified) return;

    if (abortController.value) {
      abortController.value.abort();
    }

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    autoSaving.value = true;
    saveStatus.value = "saving"; // 👈 NEW

    try {
      autosavePromise.value = templateStore.saveCurrentTemplate();

      await Promise.race([
        autosavePromise.value,
        new Promise((_, reject) => {
          signal.addEventListener("abort", () =>
            reject(new Error("Autosave aborted"))
          );
        }),
      ]);

      if (isMounted.value && !signal.aborted) {
        uiStore.setModified(false);
        saveStatus.value = "success"; // 👈 NEW
      }
    } catch (error) {
      if (isMounted.value && !signal.aborted) {
        console.error("Autosave failed:", error);
        saveStatus.value = "error"; // 👈 NEW
      }
    } finally {
      if (isMounted.value && !signal.aborted) {
        autoSaving.value = false;
        autosavePromise.value = null;
        abortController.value = null;
      }
    }
  },
  3000,
  { maxWait: 10000 } // Max wait time of 10 seconds to make sure regular saving occurs
);

// Close dropdowns when clicking outside
const closeDropdowns = (event: MouseEvent) => {
  if (!event.target || !(event.target as Element).closest(".dropdown")) {
    showViewModeMenu.value = false;
  }
};

// Watch for changes to update mobile view data attribute
watch(mobileView, (newView) => {
  document
    .querySelector(".editor-view")
    ?.setAttribute("data-mobile-view", newView);
});

watch(saveStatus, (newStatus) => {
  if (newStatus === "success" || newStatus === "error") {
    setTimeout(() => {
      saveStatus.value = "idle";
    }, 3000);
  }
});

// Lifecycle hooks
onMounted(async () => {
  try {
    // Set component as mounted
    isMounted.value = true;

    // Add event listeners
    document.addEventListener("click", closeDropdowns);

    // Set data attribute for mobile view
    const editorViewElement = document.querySelector(".editor-view");
    if (editorViewElement) {
      editorViewElement.setAttribute("data-mobile-view", mobileView.value);
    }

    // Load template if ID is provided, otherwise create a new template
    if (props.id) {
      try {
        await templateStore.loadTemplate(props.id);

        // Only update state if still mounted
        if (isMounted.value) {
          uiStore.setModified(false);
        }
      } catch (error) {
        // Only show error and redirect if still mounted
        if (isMounted.value) {
          uiStore.showToast(`Error loading template: ${error}`, "error");
          router.push({ name: "editor" }); // Redirect to new template
        }
      }
    } else {
      templateStore.createNewTemplate();

      // Only update state if still mounted
      if (isMounted.value) {
        uiStore.setModified(false);
      }
    }
  } catch (error) {
    console.error("Error in EditorView mount:", error);
  }
});

onUnmounted(() => {
  try {
    // Set component as unmounted
    isMounted.value = false;

    // Remove event listeners
    document.removeEventListener("click", closeDropdowns);

    // Cancel any ongoing autosave
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }

    // Cancel any pending debounced operations
    if (typeof debouncedAutosave.cancel === "function") {
      debouncedAutosave.cancel();
    }
  } catch (error) {
    console.error("Error in EditorView unmount:", error);
  }
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

/* Top and Bottom Toolbars */
.editor-toolbar {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 0;
  z-index: 10;
}

.top-toolbar {
  position: relative;
  border-bottom: 1px solid var(--glass-border);
}

/* Autosave indicator */
.autosave-indicator {
  position: absolute;
  top: 50%;
  right: var(--spacing-md);
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background 0.3s ease, color 0.3s ease, opacity 0.3s ease;
  opacity: 0.8;
}

.autosave-indicator i {
  transition: transform 0.3s ease, color 0.3s ease;
}

.autosave-indicator[data-status="saving"] {
  color: var(--color-text-secondary);
  opacity: 1;
}

.autosave-indicator[data-status="success"] {
  color: #09ac56; /* green */
  opacity: 1;
}

.autosave-indicator[data-status="error"] {
  color: #f56565; /* red */
  opacity: 1;
}

.bottom-toolbar {
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metadata-form {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.template-title-input {
  font-size: 1.1rem;
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  width: 250px;
}

.template-title-input:focus {
  outline: none;
  border-color: var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
}

.template-description-input {
  font-size: 0.9rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  flex: 1;
  max-width: 400px;
}

.template-description-input:focus {
  outline: none;
  border-color: var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
}

/* Main Content Area */
.editor-content {
  display: grid;
  grid-template-columns: 250px 1fr 1fr;
  gap: var(--spacing-md);
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-md);
  transition: all 0.3s ease;
}

.editor-content.sidebar-collapsed {
  grid-template-columns: 40px 1fr 1fr;
}

/* Focus mode - expands the preview panel */
.editor-content.focus-mode {
  grid-template-columns: 0 0 1fr;
}

.editor-content.focus-mode.sidebar-collapsed {
  grid-template-columns: 0 0 1fr;
}

/* Panels */
.module-library-panel,
.editor-canvas-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.module-library-panel {
  background: rgba(30, 30, 46, 0.6);
  border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: var(--radius-md);
  transition: width var(--transition-standard);
}

/* Hide panels in focus mode */
.focus-mode .module-library-panel,
.focus-mode .editor-canvas-panel {
  width: 0;
  opacity: 0;
  transform: translateX(-20px);
  overflow: hidden;
  pointer-events: none;
}

/* Expanded preview in focus mode */
.preview-panel.preview-focused {
  grid-column: 1 / span 3;
  transform: translateX(0);
  opacity: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-bottom: 1px solid var(--glass-border);
  background: rgba(30, 30, 46, 0.7);
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.collapse-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

/* When sidebar is collapsed */
.sidebar-collapsed .section-library-panel {
  overflow: visible;
}

.sidebar-collapsed .panel-header h2,
.sidebar-collapsed .section-library-container {
  display: none;
}

.sidebar-collapsed .panel-header {
  padding: var(--spacing-xs);
  justify-content: center;
}

/* Preview panel */
/* Panel header actions (just the focus toggle) */
.panel-header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Preview controls bar - the new component below header */
.preview-controls-bar {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(26, 27, 38, 0.5);
  border-bottom: 1px solid var(--glass-border);
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.preview-controls-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

/* Panel action button (including focus toggle) */
.panel-action-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.panel-action-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  transform: translateY(-1px);
}

/* Action buttons in preview-controls-bar */
.preview-action-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.preview-action-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  transform: translateY(-1px);
}

/* Export button in preview controls */
.preview-action-button.export-button {
  width: auto;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background-color: rgba(255, 171, 88, 0.1);
  border: 1px solid rgba(255, 171, 88, 0.2);
  color: var(--color-primary);
  padding: 0 0.5rem;
}

.preview-action-button.export-button:hover {
  background-color: rgba(255, 171, 88, 0.15);
  transform: translateY(-1px);
}

.export-profile-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.9;
  line-height: 1;
}

/* Dropdown styling */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

/* Larger buttons in preview-controls-bar */
.preview-controls-bar .dropdown-trigger {
  padding: 4px 10px;
  font-size: 0.8rem;
  height: 28px;
}

.preview-controls-bar .dropdown-trigger i:first-child {
  margin-right: 4px;
}

.dropdown-trigger:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 180px;
  background: rgba(30, 30, 46, 0.95);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  opacity: 0;
  transform: translateY(2px) scale(0.98);
  animation: dropdownOpen 0.15s ease forwards;
  transform-origin: top center;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

@keyframes dropdownOpen {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  position: relative;
  font-size: 0.875rem;
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item:hover::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: var(--color-primary);
}

.dropdown-item.active {
  background: rgba(255, 171, 88, 0.15);
  color: var(--color-primary);
  font-weight: 500;
}

.toggle-indicator {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
}

/* Profile badge styling */
.profile-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
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

/* Action buttons */
.right-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.save-button {
  background: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(255, 171, 88, 0.2);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(255, 171, 88, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
}

.export-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Mobile view toggle */
.mobile-view-toggle {
  display: none;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
}

.view-toggle-button {
  padding: var(--spacing-xs) var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-toggle-button.active {
  background: var(--color-primary);
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design for smaller screens */
@media (max-width: 1024px) {
  .editor-content {
    grid-template-columns: 200px 1fr 1fr;
  }

  .sidebar-collapsed .editor-content {
    grid-template-columns: 40px 1fr 1fr;
  }

  .metadata-form {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .template-title-input,
  .template-description-input {
    width: 100%;
    max-width: none;
  }

  /* Adjust preview controls for medium screens */
  .preview-controls-bar {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .preview-controls-group {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .editor-content {
    grid-template-columns: 1fr;
    padding: var(--spacing-sm);
  }

  .section-library-panel {
    display: none;
  }

  .editor-canvas-panel,
  .preview-panel {
    grid-column: 1;
  }

  .editor-canvas-panel {
    display: flex;
  }

  .preview-panel {
    display: none;
  }

  .mobile-view-toggle {
    display: flex;
  }

  /* Show preview and hide editor when in preview mode */
  .editor-view[data-mobile-view="preview"] .editor-canvas-panel {
    display: none;
  }

  .editor-view[data-mobile-view="preview"] .preview-panel {
    display: flex;
  }

  /* Focus mode in mobile view */
  .focus-mode .preview-panel {
    display: flex;
    grid-column: 1;
  }

  /* Compact preview controls on small screens */
  .preview-controls-bar {
    padding: var(--spacing-xs);
  }

  .preview-controls-bar .dropdown-trigger {
    padding: 2px 6px;
  }

  .preview-controls-bar .dropdown-trigger span:not(.profile-badge) {
    display: none;
  }

  .preview-action-button.export-button span {
    display: none;
  }
}
</style>

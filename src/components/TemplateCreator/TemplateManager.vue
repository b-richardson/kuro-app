<template>
  <div class="template-manager">
    <!-- Template actions -->
    <div class="template-manager__actions">
      <button
        class="template-manager__save-btn"
        @click="showSaveDialog = true"
        :class="{ 'has-changes': isModified }"
      >
        <i class="fas fa-save"></i>
        <span v-if="currentTemplateId && !isModified">Saved</span>
        <span v-else-if="currentTemplateId && isModified">Save Changes</span>
        <span v-else>Save Template</span>
        <span v-if="isModified" class="modified-indicator">•</span>
      </button>

      <button
        class="template-manager__menu-btn"
        @click="isMenuOpen = !isMenuOpen"
      >
        <i class="fas fa-ellipsis-h"></i>
      </button>

      <!-- Template actions menu -->
      <div class="template-manager__menu" v-if="isMenuOpen">
        <button @click="showTemplateLibrary = true">
          <i class="fas fa-folder-open"></i> My Templates
        </button>
        <button @click="handleNewTemplate">
          <i class="fas fa-file"></i> New Template
        </button>
        <button @click="showImportDialog = true">
          <i class="fas fa-file-import"></i> Import
        </button>
        <button @click="handleExport">
          <i class="fas fa-file-export"></i> Export All
        </button>
      </div>
    </div>

    <!-- Save template dialog -->
    <div class="template-dialog" v-if="showSaveDialog">
      <div class="template-dialog__content">
        <h3>Save Template</h3>

        <div class="form-group">
          <label for="template-name">Template Name</label>
          <input
            id="template-name"
            v-model="templateName"
            placeholder="Enter template name"
            @keyup.enter="handleSave"
          />
        </div>

        <div class="form-group">
          <label for="template-description">Description (optional)</label>
          <textarea
            id="template-description"
            v-model="templateDescription"
            placeholder="Enter template description"
            rows="3"
          ></textarea>
        </div>

        <div class="dialog-buttons">
          <button class="cancel-btn" @click="showSaveDialog = false">
            Cancel
          </button>
          <button
            class="save-btn"
            @click="handleSave"
            :disabled="!templateName.trim()"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Template library dialog -->
    <div
      class="template-dialog template-dialog--large"
      v-if="showTemplateLibrary"
    >
      <div class="template-dialog__content">
        <div class="template-dialog__header">
          <h3>My Templates</h3>
          <button class="close-btn" @click="showTemplateLibrary = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="template-list">
          <div v-if="templates.length === 0" class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>No saved templates yet</p>
          </div>

          <div
            v-for="template in templates"
            :key="template.id"
            class="template-item"
            :class="{ active: currentTemplateId === template.id }"
          >
            <div
              class="template-item__details"
              @click="handleLoadTemplate(template.id)"
            >
              <h4>{{ template.name }}</h4>
              <p v-if="template.description">{{ template.description }}</p>
              <p class="template-date">
                Last updated: {{ formatDate(template.updatedAt) }}
              </p>
            </div>

            <div class="template-item__actions">
              <button class="load-btn" @click="handleLoadTemplate(template.id)">
                <i class="fas fa-download"></i>
              </button>
              <button
                class="delete-btn"
                @click="confirmDelete(template.id, template.name)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import dialog -->
    <div class="template-dialog" v-if="showImportDialog">
      <div class="template-dialog__content">
        <h3>Import Templates</h3>

        <div class="form-group">
          <label for="import-file">Import from file</label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            @change="handleFileSelect"
          />
        </div>

        <div class="import-options">
          <label>
            <input type="checkbox" v-model="replaceAllTemplates" />
            Replace all existing templates
          </label>
        </div>

        <div class="dialog-buttons">
          <button class="cancel-btn" @click="showImportDialog = false">
            Cancel
          </button>
          <button
            class="import-btn"
            @click="handleImport"
            :disabled="!importFile"
          >
            Import
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation dialog -->
    <div class="template-dialog" v-if="showConfirmDialog">
      <div class="template-dialog__content">
        <h3>{{ confirmDialogTitle }}</h3>
        <p>{{ confirmDialogMessage }}</p>

        <div class="dialog-buttons">
          <button class="cancel-btn" @click="showConfirmDialog = false">
            Cancel
          </button>
          <button class="confirm-btn" @click="handleConfirmAction">
            {{ confirmDialogAction }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notification toast -->
    <div
      class="notification-toast"
      v-if="notification.show"
      :class="notification.type"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits, watch } from "vue";
import { TemplateSection } from "@/types/TemplateSect";
import { ExportProfileId } from "./ExportProfileSelector.vue";
import {
  saveTemplate,
  getTemplateList,
  loadTemplate,
  deleteTemplate,
  exportTemplatesAsJson,
  importTemplatesFromJson,
  TemplateMeta,
} from "@/utils/templateStorage";

// Define props and emits
const props = defineProps({
  currentTemplateId: {
    type: String,
    default: "",
  },
  isModified: {
    type: Boolean,
    default: false,
  },
  sections: {
    type: Array as () => TemplateSection[],
    required: true,
  },
  exportProfile: {
    type: String as () => ExportProfileId,
    required: true,
  },
});

const emit = defineEmits(["save", "load", "new", "template-change"]);

// Local state
const templates = ref<TemplateMeta[]>([]);
const isMenuOpen = ref(false);
const showSaveDialog = ref(false);
const showTemplateLibrary = ref(false);
const showImportDialog = ref(false);
const showConfirmDialog = ref(false);
const templateName = ref("");
const templateDescription = ref("");
const importFile = ref<File | null>(null);
const replaceAllTemplates = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogAction = ref("");
const confirmDialogCallback = ref<(() => void) | null>(null);
const notification = ref({
  show: false,
  message: "",
  type: "success",
  timeoutId: null as number | null,
});

// Load saved templates on component mount
onMounted(() => {
  loadTemplateList();

  // Add keyboard shortcut for save (Ctrl+S or Command+S)
  window.addEventListener("keydown", handleKeydown);
});

// Watch for current template changes to update form
watch(
  () => props.currentTemplateId,
  (newId) => {
    if (newId) {
      const template = loadTemplate(newId);
      if (template) {
        templateName.value = template.name;
        templateDescription.value = template.description || "";
      }
    }
  }
);

// Methods
function loadTemplateList() {
  templates.value = getTemplateList();
}

function handleSave() {
  if (!templateName.value.trim()) {
    showNotification("Please enter a template name", "error");
    return;
  }

  try {
    const id = saveTemplate(
      templateName.value.trim(),
      templateDescription.value.trim(),
      props.sections,
      props.exportProfile,
      props.currentTemplateId || undefined
    );

    emit("save", id);
    showNotification("Template saved successfully");
    showSaveDialog.value = false;
    loadTemplateList();
  } catch (error) {
    showNotification(
      `Failed to save template: ${(error as Error).message}`,
      "error"
    );
  }
}

function handleLoadTemplate(id: string) {
  // If there are unsaved changes, show confirmation
  if (props.isModified) {
    confirmDialogTitle.value = "Unsaved Changes";
    confirmDialogMessage.value =
      "You have unsaved changes that will be lost. Do you want to continue?";
    confirmDialogAction.value = "Continue";
    confirmDialogCallback.value = () => {
      loadTemplateById(id);
    };
    showConfirmDialog.value = true;
    showTemplateLibrary.value = false;
  } else {
    loadTemplateById(id);
  }
}

function loadTemplateById(id: string) {
  const template = loadTemplate(id);

  if (template) {
    emit("load", {
      id: template.id,
      sections: template.sections,
      exportProfile: template.exportProfile,
    });

    showTemplateLibrary.value = false;
    showNotification("Template loaded successfully");
    templateName.value = template.name;
    templateDescription.value = template.description || "";
  } else {
    showNotification("Failed to load template", "error");
  }
}

function handleNewTemplate() {
  // If there are unsaved changes, show confirmation
  if (props.isModified) {
    confirmDialogTitle.value = "Unsaved Changes";
    confirmDialogMessage.value =
      "You have unsaved changes that will be lost. Do you want to continue?";
    confirmDialogAction.value = "Continue";
    confirmDialogCallback.value = () => {
      emit("new");
      templateName.value = "";
      templateDescription.value = "";
      isMenuOpen.value = false;
    };
    showConfirmDialog.value = true;
  } else {
    emit("new");
    templateName.value = "";
    templateDescription.value = "";
    isMenuOpen.value = false;
  }
}

function confirmDelete(id: string, name: string) {
  confirmDialogTitle.value = "Delete Template";
  confirmDialogMessage.value = `Are you sure you want to delete "${name}"? This cannot be undone.`;
  confirmDialogAction.value = "Delete";
  confirmDialogCallback.value = () => {
    if (deleteTemplate(id)) {
      showNotification("Template deleted successfully");

      // If the deleted template is the current one, reset
      if (id === props.currentTemplateId) {
        emit("new");
      }

      loadTemplateList();
    } else {
      showNotification("Failed to delete template", "error");
    }
  };
  showConfirmDialog.value = true;
}

function handleConfirmAction() {
  if (confirmDialogCallback.value) {
    confirmDialogCallback.value();
  }
  showConfirmDialog.value = false;
}

function handleExport() {
  try {
    const jsonData = exportTemplatesAsJson();

    // Create file for download
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "obsidian-templates.json";
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    isMenuOpen.value = false;

    showNotification("Templates exported successfully");
  } catch (error) {
    showNotification(
      `Failed to export templates: ${(error as Error).message}`,
      "error"
    );
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    importFile.value = input.files[0];
  }
}

function handleImport() {
  if (!importFile.value) {
    showNotification("Please select a file to import", "error");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result as string;
      const importedCount = importTemplatesFromJson(
        jsonString,
        replaceAllTemplates.value
      );

      showNotification(`Successfully imported ${importedCount} templates`);
      showImportDialog.value = false;
      loadTemplateList();

      // Reset file input
      importFile.value = null;
      replaceAllTemplates.value = false;
    } catch (error) {
      showNotification(`Import failed: ${(error as Error).message}`, "error");
    }
  };

  reader.onerror = () => {
    showNotification("Failed to read the import file", "error");
  };

  reader.readAsText(importFile.value);
}

function showNotification(
  message: string,
  type: "success" | "error" = "success"
) {
  // Clear any existing timeout
  if (notification.value.timeoutId !== null) {
    clearTimeout(notification.value.timeoutId);
  }

  // Show new notification
  notification.value = {
    show: true,
    message,
    type,
    timeoutId: setTimeout(() => {
      notification.value.show = false;
    }, 3000) as unknown as number,
  };
}

function handleKeydown(event: KeyboardEvent) {
  // Detect Ctrl+S or Command+S
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();

    if (props.isModified || !props.currentTemplateId) {
      showSaveDialog.value = true;
    }
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
}
</script>

<style scoped>
.template-manager {
  position: relative;
  display: flex;
  align-items: center;
}

.template-manager__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.template-manager__save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.template-manager__save-btn:hover {
  background: rgba(79, 70, 229, 0.15);
}

.template-manager__save-btn.has-changes {
  background: rgba(79, 70, 229, 0.2);
  animation: pulse 2s infinite;
}

.modified-indicator {
  color: #ef4444;
  font-size: 1.5rem;
  margin-left: 0.25rem;
}

.template-manager__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-manager__menu-btn:hover {
  background: rgba(230, 235, 245, 0.8);
}

.template-manager__menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
}

.template-manager__menu button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(230, 235, 245, 0.8);
  cursor: pointer;
  transition: background 0.2s;
}

.template-manager__menu button:last-child {
  border-bottom: none;
}

.template-manager__menu button:hover {
  background: rgba(230, 235, 245, 0.5);
}

.template-manager__menu i {
  width: 1rem;
  text-align: center;
}

/* Dialog styles */
.template-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 1rem;
}

.template-dialog__content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.template-dialog--large .template-dialog__content {
  max-width: 700px;
}

.template-dialog h3 {
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #4f46e5;
  font-size: 1.25rem;
}

.template-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6b7280;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background: #f9fafb;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.import-options {
  margin-bottom: 1.25rem;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.dialog-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn,
.import-btn,
.confirm-btn {
  background: #4f46e5;
  border: 1px solid #4338ca;
  color: white;
}

.save-btn:hover,
.import-btn:hover,
.confirm-btn:hover {
  background: #4338ca;
}

.save-btn:disabled,
.import-btn:disabled {
  background: #c7d2fe;
  border-color: #a5b4fc;
  cursor: not-allowed;
}

.confirm-btn.delete {
  background: #ef4444;
  border-color: #dc2626;
}

.confirm-btn.delete:hover {
  background: #dc2626;
}

/* Template list styles */
.template-list {
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.template-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background: #f9fafb;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.template-item.active {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.template-item__details {
  flex: 1;
  cursor: pointer;
}

.template-item h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #111827;
}

.template-item p {
  margin: 0 0 0.5rem 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.template-date {
  color: #6b7280;
  font-size: 0.75rem;
}

.template-item__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-item__actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.load-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #ef4444;
}

/* Notification styles */
.notification-toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  color: white;
  z-index: 1100;
  animation: slideIn 0.3s ease-out;
}

.notification-toast.success {
  background: #10b981;
}

.notification-toast.error {
  background: #ef4444;
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .template-dialog__content {
    padding: 1rem;
  }

  .template-item {
    flex-direction: column;
  }

  .template-item__actions {
    margin-top: 0.75rem;
    justify-content: flex-end;
  }
}
</style>

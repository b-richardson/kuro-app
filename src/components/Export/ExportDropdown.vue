<template>
  <div class="export-dropdown" ref="dropdownRef">
    <button
      class="export-btn"
      :class="{ active: isOpen }"
      @click="toggleDropdown"
      aria-haspopup="true"
      :aria-expanded="isOpen ? 'true' : 'false'"
    >
      <span class="export-btn__icon">
        <i class="fas fa-download"></i>
      </span>
      <span class="export-btn__text">Export</span>
      <span class="export-btn__arrow">
        <i class="fas fa-chevron-down"></i>
      </span>
    </button>

    <div v-if="isOpen" class="export-dropdown__menu" @click.stop>
      <div class="export-dropdown__header">
        <h3 class="export-dropdown__title">Export Template</h3>
      </div>

      <div class="export-dropdown__profiles">
        <div
          v-for="profile in exportProfiles"
          :key="profile.id"
          class="export-dropdown__profile"
          :class="{
            'export-dropdown__profile--active': selectedProfile === profile.id,
          }"
          @click="selectProfile(profile.id)"
        >
          <div class="export-dropdown__profile-radio">
            <div class="export-dropdown__profile-radio-button"></div>
          </div>
          <div class="export-dropdown__profile-details">
            <div class="export-dropdown__profile-name">{{ profile.name }}</div>
            <div class="export-dropdown__profile-description">
              {{ profile.description }}
            </div>
          </div>
          <div class="export-dropdown__profile-icon">
            <i :class="profile.icon"></i>
          </div>
        </div>
      </div>

      <div class="export-dropdown__actions">
        <div class="export-dropdown__filename">
          <label for="export-filename" class="export-dropdown__label"
            >Filename:</label
          >
          <input
            id="export-filename"
            v-model="filename"
            type="text"
            class="export-dropdown__input"
            placeholder="Enter filename"
          />
          <span class="export-dropdown__extension">.md</span>
        </div>

        <div class="export-dropdown__buttons">
          <button
            class="export-dropdown__copy-btn"
            @click="copyToClipboard"
            :disabled="!hasSections"
          >
            <i class="fas fa-clipboard"></i> Copy to Clipboard
          </button>
          <button
            class="export-dropdown__download-btn"
            @click="downloadMarkdown"
            :disabled="!hasSections"
            :data-profile="selectedProfile"
          >
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
// We'll use the TemplateModule type temporarily
import { TemplateModule } from "@/types/TemplateModule";
import { generateMarkdown } from "@/utils/markdownUtils";

// Define the ExportProfileId type locally to fix the build
type ExportProfileId = "plain" | "templater" | "dataview" | "full";

// Use TemplateModule as a temporary replacement for TemplateSection
type TemplateSection = TemplateModule;

// Define props
const props = defineProps<{
  sections: TemplateSection[];
  initialProfile?: ExportProfileId;
}>();

// Define emits
const emit = defineEmits<{
  (e: "profileChanged", value: ExportProfileId): void;
  (e: "close"): void;
  (
    e: "exportSuccess",
    method: "download" | "clipboard",
    profile: ExportProfileId
  ): void;
  (e: "exportError", error: string): void;
}>();

// State variables
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const filename = ref(generateDefaultFilename());
const selectedProfile = ref<ExportProfileId>(props.initialProfile || "full");
const isLoading = ref(false);

// Dropdown toggle
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) {
    emit("close");
  }
};

// Generate default filename with date
function generateDefaultFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `obsidian-template-${year}-${month}-${day}`;
}

// Export profile definitions
const exportProfiles = [
  {
    id: "plain" as ExportProfileId,
    name: "Plain Markdown",
    description:
      "Converts all plugin-specific syntax to plain markdown. Works without any plugins.",
    icon: "fas fa-file-alt",
  },
  {
    id: "templater" as ExportProfileId,
    name: "Templater-Ready",
    description:
      "Maintains Templater fields but converts other plugin syntax to plain markdown.",
    icon: "fas fa-calendar-alt",
  },
  {
    id: "dataview" as ExportProfileId,
    name: "Dataview-Compatible",
    description:
      "Preserves Dataview queries but converts other plugin syntax to plain markdown.",
    icon: "fas fa-database",
  },
  {
    id: "full" as ExportProfileId,
    name: "Full Plugin Suite",
    description:
      "Keeps all plugin-specific syntax (Templater, Dataview, Kanban) intact.",
    icon: "fas fa-puzzle-piece",
  },
];

// Check if there are sections to export
const hasSections = computed(() => props.sections.length > 0);

// Handle profile selection
const selectProfile = (profileId: ExportProfileId) => {
  selectedProfile.value = profileId;
  emit("profileChanged", profileId);
};

// Copy markdown to clipboard
const copyToClipboard = async () => {
  if (!hasSections.value) return;

  try {
    isLoading.value = true;

    // Generate markdown content with selected export profile
    const markdownContent = generateMarkdown(
      props.sections,
      selectedProfile.value
    );

    // Copy to clipboard
    await navigator.clipboard.writeText(markdownContent);

    // Notify success
    emit("exportSuccess", "clipboard", selectedProfile.value);

    // Close dropdown
    isOpen.value = false;
  } catch (error) {
    emit(
      "exportError",
      "Failed to copy to clipboard: " +
        (error instanceof Error ? error.message : String(error))
    );
  } finally {
    isLoading.value = false;
  }
};

// Download markdown as file
const downloadMarkdown = () => {
  if (!hasSections.value) return;

  try {
    isLoading.value = true;

    // Generate markdown content with selected export profile
    const markdownContent = generateMarkdown(
      props.sections,
      selectedProfile.value
    );

    // Create blob and download link
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    // Create download link element
    const link = document.createElement("a");
    link.href = url;

    // Add export profile indicator to filename for clarity (except for full)
    const profileIndicator =
      selectedProfile.value === "full" ? "" : `-${selectedProfile.value}`;
    link.download = `${
      filename.value || generateDefaultFilename()
    }${profileIndicator}.md`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the object URL to free memory
    URL.revokeObjectURL(url);

    // Notify success
    emit("exportSuccess", "download", selectedProfile.value);

    // Close dropdown
    isOpen.value = false;
  } catch (error) {
    emit(
      "exportError",
      "Failed to download markdown: " +
        (error instanceof Error ? error.message : String(error))
    );
  } finally {
    isLoading.value = false;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    isOpen.value
  ) {
    isOpen.value = false;
    emit("close");
  }
};

// Handle keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent) => {
  // Close on Escape
  if (event.key === "Escape" && isOpen.value) {
    isOpen.value = false;
    emit("close");
  }

  // Toggle on Ctrl+E or Cmd+E
  if ((event.ctrlKey || event.metaKey) && event.key === "e") {
    event.preventDefault();
    toggleDropdown();
  }
};

// Watch for profile changes
watch(selectedProfile, (newProfile) => {
  emit("profileChanged", newProfile);
});

// Setup event listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);
});

// Clean up event listeners
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});

// Expose methods for external control
defineExpose({
  open: () => {
    isOpen.value = true;
  },
  close: () => {
    isOpen.value = false;
  },
});
</script>

<style scoped>
.export-dropdown {
  position: relative;
  display: inline-block;
}

.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.3);
  white-space: nowrap;
}

.export-btn:hover {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
}

.export-btn:active,
.export-btn.active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.export-btn__arrow {
  transition: transform 0.2s ease;
  font-size: 0.75rem;
  margin-left: 0.125rem;
}

.export-btn.active .export-btn__arrow {
  transform: rotate(180deg);
}

.export-dropdown__menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 320px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(230, 235, 245, 0.8);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.export-dropdown__header {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.export-dropdown__title {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.export-dropdown__profiles {
  padding: 0.75rem;
  max-height: 240px;
  overflow-y: auto;
}

.export-dropdown__profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
}

.export-dropdown__profile:last-child {
  margin-bottom: 0;
}

.export-dropdown__profile:hover {
  background-color: #f8fafc;
}

.export-dropdown__profile--active {
  background-color: #f0f9ff;
  border-color: #bae6fd;
}

.export-dropdown__profile--active .export-dropdown__profile-radio-button {
  transform: scale(1);
}

.export-dropdown__profile-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.export-dropdown__profile--active .export-dropdown__profile-radio {
  border-color: #4f46e5;
}

.export-dropdown__profile-radio-button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4f46e5;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.export-dropdown__profile-details {
  flex: 1;
}

.export-dropdown__profile-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.export-dropdown__profile-description {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  line-height: 1.2;
}

.export-dropdown__profile-icon {
  color: #94a3b8;
  font-size: 1rem;
  flex-shrink: 0;
}

.export-dropdown__profile--active .export-dropdown__profile-icon {
  color: #4f46e5;
}

.export-dropdown__actions {
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.export-dropdown__filename {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.export-dropdown__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.export-dropdown__input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.export-dropdown__input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.export-dropdown__extension {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.export-dropdown__buttons {
  display: flex;
  gap: 0.75rem;
}

.export-dropdown__copy-btn,
.export-dropdown__download-btn {
  flex: 1;
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.export-dropdown__copy-btn {
  background-color: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.export-dropdown__copy-btn:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.export-dropdown__download-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.export-dropdown__download-btn:hover {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  transform: translateY(-1px);
}

.export-dropdown__download-btn:active {
  transform: translateY(0);
}

.export-dropdown__copy-btn:disabled,
.export-dropdown__download-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  border-color: #e2e8f0;
}

/* Add profile indicator colors */
.export-dropdown__download-btn[data-profile="plain"] {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
}

.export-dropdown__download-btn[data-profile="templater"] {
  background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
}

.export-dropdown__download-btn[data-profile="dataview"] {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.export-dropdown__download-btn[data-profile="full"] {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}

@media (max-width: 640px) {
  .export-dropdown__menu {
    width: 280px;
    right: -20px; /* Offset to align better on mobile */
  }

  .export-dropdown__profile-description {
    display: none;
  }

  .export-dropdown__filename {
    flex-wrap: wrap;
  }

  .export-dropdown__label {
    width: 100%;
    margin-bottom: 0.25rem;
  }

  .export-dropdown__buttons {
    flex-direction: column;
  }
}
</style>

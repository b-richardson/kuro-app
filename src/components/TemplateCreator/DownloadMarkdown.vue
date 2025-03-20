<template>
  <div class="download-markdown">
    <div class="download-markdown__options">
      <div class="download-markdown__filename">
        <label for="filename" class="download-markdown__label">Filename:</label>
        <input 
          id="filename"
          v-model="filename" 
          type="text" 
          class="download-markdown__input"
          placeholder="Enter filename"
        />
        <span class="download-markdown__extension">.md</span>
      </div>
      
      <!-- Export Profile Selector -->
      <div class="download-markdown__profile">
        <ExportProfileSelector v-model="exportProfile" />
      </div>
    </div>
    
    <button 
      class="download-markdown__button"
      @click="downloadMarkdown"
      :disabled="!sections.length"
      :data-profile="exportProfile"
    >
      <i class="fas fa-download"></i>
      <span class="download-markdown__button-text">
        Download as {{ getProfileDisplayName(exportProfile) }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import { generateMarkdown } from '@/utils/markdownUtils';
import ExportProfileSelector, { ExportProfileId } from './ExportProfileSelector.vue';

// Define props
const props = defineProps<{
  sections: TemplateSection[];
  initialProfile?: ExportProfileId;
}>();

// Define emits
const emit = defineEmits<{
  (e: 'profileChanged', value: ExportProfileId): void;
}>();

// Generate default filename with date
const defaultFilename = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `obsidian-template-${year}-${month}-${day}`;
});

// Filename for the download
const filename = ref(defaultFilename.value);

// Export profile selection (default to full if not provided)
const exportProfile = ref<ExportProfileId>(props.initialProfile || 'full');

// Watch for export profile changes
watch(exportProfile, (newProfile) => {
  emit('profileChanged', newProfile);
});

/**
 * Gets a display name for the profile to use in the button
 */
const getProfileDisplayName = (profile: ExportProfileId): string => {
  switch (profile) {
    case 'plain':
      return 'Plain Markdown';
    case 'templater':
      return 'Templater Format';
    case 'dataview':
      return 'Dataview Format';
    case 'full':
      return 'Full Plugin Format';
    default:
      return 'Markdown';
  }
};

/**
 * Triggers download of markdown content with the selected export profile
 */
const downloadMarkdown = () => {
  if (!props.sections.length) return;

  // Generate markdown content with selected export profile
  const markdownContent = generateMarkdown(props.sections, exportProfile.value);
  
  // Create blob and download link
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  // Create download link element
  const link = document.createElement('a');
  link.href = url;
  
  // Add export profile indicator to filename for clarity
  const profileIndicator = exportProfile.value === 'full' ? '' : `-${exportProfile.value}`;
  link.download = `${filename.value || defaultFilename.value}${profileIndicator}.md`;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the object URL to free memory
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.download-markdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.download-markdown__options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.download-markdown__filename {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.download-markdown__label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #334155;
}

.download-markdown__input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid rgba(230, 235, 245, 0.8);
  border-radius: 8px;
  font-size: 0.9375rem;
  min-width: 220px;
  background-color: white;
  color: #334155;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.download-markdown__input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.download-markdown__extension {
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
}

.download-markdown__profile {
  margin-top: 0.5rem;
}

.download-markdown__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.75rem 1.5rem;
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
  width: 100%;
}

.download-markdown__button-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-markdown__button:hover {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
}

.download-markdown__button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.download-markdown__button:disabled {
  background: linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 100%);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.download-markdown__button i {
  font-size: 1rem;
}

/* Add profile indicator colors */
.download-markdown__button[data-profile="plain"] {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
}

.download-markdown__button[data-profile="templater"] {
  background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
}

.download-markdown__button[data-profile="dataview"] {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.download-markdown__button[data-profile="full"] {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}

@media (min-width: 768px) {
  .download-markdown {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .download-markdown__options {
    flex: 1;
  }
  
  .download-markdown__button {
    align-self: flex-end;
    width: auto;
    margin-top: 2.5rem; /* Align with the profile selector bottom */
  }
}

@media (max-width: 480px) {
  .download-markdown__label {
    display: none;
  }
  
  .download-markdown__filename {
    flex-wrap: nowrap;
  }
  
  .download-markdown__input {
    min-width: 0;
  }
  
  .download-markdown__button-text {
    font-size: 0.875rem;
  }
}
</style>
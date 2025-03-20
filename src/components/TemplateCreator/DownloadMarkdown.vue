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
    </div>
    
    <button 
      class="download-markdown__button"
      @click="downloadMarkdown"
      :disabled="!sections.length"
    >
      <i class="fas fa-download"></i>
      Download Template
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TemplateSection } from '@/types/TemplateSection';
import { generateMarkdown } from '@/utils/markdownUtils';

// Define props
const props = defineProps<{
  sections: TemplateSection[]
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

/**
 * Triggers download of markdown content
 */
const downloadMarkdown = () => {
  if (!props.sections.length) return;

  // Generate markdown content
  const markdownContent = generateMarkdown(props.sections);
  
  // Create blob and download link
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  // Create download link element
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.value || defaultFilename.value}.md`;
  
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
  align-items: center;
  gap: 1rem;
}

.download-markdown__options {
  flex: 1;
}

.download-markdown__filename {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.download-markdown__label {
  font-size: 0.875rem;
  font-weight: 500;
}

.download-markdown__input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 200px;
}

.download-markdown__extension {
  color: #888;
  font-size: 0.875rem;
}

.download-markdown__button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.download-markdown__button:hover {
  background-color: #4338ca;
}

.download-markdown__button:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}
</style>
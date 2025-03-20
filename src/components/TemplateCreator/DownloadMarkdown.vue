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
  gap: 1.25rem;
}

.download-markdown__options {
  flex: 1;
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

.download-markdown__button {
  display: flex;
  align-items: center;
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

@media (max-width: 768px) {
  .download-markdown {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .download-markdown__button {
    align-self: flex-end;
    width: 100%;
    justify-content: center;
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
}
</style>
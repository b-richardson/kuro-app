<template>
  <div class="export-dialog-backdrop" @click="closeModal">
    <div class="export-dialog glass-panel" @click.stop>
      <div class="export-dialog-header">
        <h2>Export Template</h2>
        <button class="close-button" @click="closeModal" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="export-dialog-content">
        <div class="export-options">
          <h3>Export Format</h3>
          <div class="option-group">
            <label class="radio-option">
              <input type="radio" v-model="exportFormat" value="markdown" checked>
              <span class="radio-label">Markdown</span>
            </label>
            
            <label class="radio-option">
              <input type="radio" v-model="exportFormat" value="json">
              <span class="radio-label">JSON</span>
            </label>
          </div>
          
          <h3>Export Options</h3>
          <div class="option-group">
            <label class="checkbox-option">
              <input type="checkbox" v-model="includeMetadata">
              <span class="checkbox-label">Include metadata</span>
            </label>
            
            <label class="checkbox-option">
              <input type="checkbox" v-model="includeFrontmatter">
              <span class="checkbox-label">Include frontmatter</span>
            </label>
          </div>
          
          <div class="filename-input">
            <label for="filename">Filename</label>
            <input 
              type="text" 
              id="filename" 
              v-model="filename"
              placeholder="Enter filename"
            >
          </div>
        </div>
        
        <div class="export-preview glass-panel-inner">
          <h3>Preview</h3>
          <div class="preview-content">
            <pre><code>{{ previewContent }}</code></pre>
          </div>
        </div>
      </div>
      
      <div class="export-dialog-footer">
        <button 
          class="secondary-button" 
          @click="closeModal"
        >
          Cancel
        </button>
        <button 
          class="primary-button" 
          @click="handleExport"
          :disabled="!canExport"
        >
          Export
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTemplateStore } from '@/stores/template';

const props = defineProps({
  // Any props needed
});

const emit = defineEmits(['close']);

// State
const templateStore = useTemplateStore();
const exportFormat = ref('markdown');
const includeMetadata = ref(true);
const includeFrontmatter = ref(true);
const filename = ref('');

// Computed
const template = computed(() => templateStore.currentTemplate);

const previewContent = computed(() => {
  // Generate a preview based on current options
  if (exportFormat.value === 'markdown') {
    let preview = '';
    
    if (includeFrontmatter.value) {
      preview += '---\n';
      preview += `title: ${template.value?.title || 'Untitled Template'}\n`;
      preview += `created: ${new Date().toISOString()}\n`;
      preview += '---\n\n';
    }
    
    // Add sample content
    preview += `# ${template.value?.title || 'Untitled Template'}\n\n`;
    
    // Add a sample of each section type
    if (template.value?.sections?.length) {
      const sampleSection = template.value.sections[0];
      preview += `${sampleSection.content || 'Section content'}\n\n`;
      preview += '<!-- More sections would appear here -->';
    } else {
      preview += 'Template content would appear here';
    }
    
    return preview;
  } else {
    // JSON preview
    const json = {
      title: template.value?.title || 'Untitled Template',
      created: new Date().toISOString(),
      sections: template.value?.sections?.map(s => ({
        id: s.id,
        type: s.type,
        content: s.content?.substring(0, 20) + '...' // Truncated for preview
      })) || []
    };
    
    return JSON.stringify(json, null, 2);
  }
});

const canExport = computed(() => {
  return filename.value.trim().length > 0;
});

// Methods
const closeModal = () => {
  emit('close');
};

const handleExport = () => {
  let content = '';
  
  // Generate actual content for export
  if (exportFormat.value === 'markdown') {
    content = generateMarkdownExport();
  } else {
    content = generateJsonExport();
  }
  
  // Create blob and download
  const blob = new Blob([content], { type: exportFormat.value === 'markdown' ? 'text/markdown' : 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.value}.${exportFormat.value === 'markdown' ? 'md' : 'json'}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Close the dialog
  closeModal();
};

const generateMarkdownExport = () => {
  let content = '';
  
  if (includeFrontmatter.value) {
    content += '---\n';
    content += `title: ${template.value?.title || 'Untitled Template'}\n`;
    content += `created: ${new Date().toISOString()}\n`;
    
    if (includeMetadata.value && template.value?.metadata) {
      Object.entries(template.value.metadata).forEach(([key, value]) => {
        content += `${key}: ${value}\n`;
      });
    }
    
    content += '---\n\n';
  }
  
  // Add title
  content += `# ${template.value?.title || 'Untitled Template'}\n\n`;
  
  // Add sections
  if (template.value?.sections?.length) {
    template.value.sections.forEach(section => {
      content += `${section.content || ''}\n\n`;
    });
  }
  
  return content;
};

const generateJsonExport = () => {
  const exportObj = {
    title: template.value?.title || 'Untitled Template',
    created: new Date().toISOString(),
    sections: template.value?.sections || []
  };
  
  if (includeMetadata.value && template.value?.metadata) {
    exportObj.metadata = template.value.metadata;
  }
  
  return JSON.stringify(exportObj, null, 2);
};

// Lifecycle
onMounted(() => {
  // Set default filename based on template title
  filename.value = template.value?.title || 'untitled-template';
});
</script>

<style scoped>
.export-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.export-dialog {
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
}

.export-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.export-dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.export-dialog-content {
  display: flex;
  gap: var(--spacing-lg);
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .export-dialog-content {
    flex-direction: column;
  }
}

.export-options {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.export-options h3 {
  margin: var(--spacing-sm) 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.radio-option, .checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label, .checkbox-label {
  margin-left: var(--spacing-sm);
}

.filename-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filename-input input {
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--glass-border);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.export-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-content {
  flex: 1;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.preview-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
}

.export-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.secondary-button, .primary-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.secondary-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.primary-button {
  background-color: var(--color-primary);
  color: white;
}

.primary-button:disabled {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.glass-panel-inner {
  background: rgba(30, 30, 46, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}
</style>
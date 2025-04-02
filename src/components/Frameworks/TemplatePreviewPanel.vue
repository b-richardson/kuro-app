<template>
  <div class="template-preview-overlay" @click.self="$emit('close')">
    <div class="template-preview-panel glass-card">
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
      
      <div class="preview-header">
        <h2 class="preview-title">{{ template.title }}</h2>
        <div class="preview-badge" v-if="template.badge">{{ template.badge }}</div>
      </div>
      
      <div class="preview-metadata">
        <div class="metadata-item">
          <i class="fas fa-user"></i>
          <span>{{ template.author }}</span>
        </div>
        <div class="metadata-item">
          <i class="fas fa-tags"></i>
          <div class="tags-container">
            <span v-for="(tag, index) in template.tags" :key="index" class="preview-tag">
              #{{ tag }}
            </span>
          </div>
        </div>
        <div class="metadata-item">
          <i class="fas fa-plug"></i>
          <div class="compatibility-container">
            <span v-for="(comp, index) in template.compatibility" :key="index" class="preview-compatibility">
              {{ getCompatibilityName(comp) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="preview-description">
        {{ template.description }}
      </div>
      
      <div class="preview-content-container">
        <h3 class="content-header">Preview</h3>
        <div class="preview-content markdown-preview" v-html="renderedContent"></div>
      </div>
      
      <div class="preview-actions">
        <button class="btn-edit" @click="$emit('open-in-editor', template)">
          <i class="fas fa-edit"></i> Open in Editor
        </button>
        <button class="btn-push" @click="$emit('push-to-vault', template)">
          <i class="fas fa-file-export"></i> Push to Vault
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import type { Template } from '@/stores/frameworks';

// Props
const props = defineProps({
  template: {
    type: Object as () => Template,
    required: true
  }
});

// Emits
defineEmits(['close', 'push-to-vault', 'open-in-editor']);

// Computed
const renderedContent = computed(() => {
  if (!props.template.content) {
    return '<div class="loading">Loading template content...</div>';
  }
  return marked.parse(props.template.content);
});

// Methods
const getCompatibilityName = (compatibility) => {
  const names = {
    'core': 'Core Obsidian',
    'dataview': 'Dataview',
    'tasks': 'Tasks'
  };
  
  return names[compatibility] || compatibility;
};
</script>

<style scoped>
.template-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: hidden;
}

.template-preview-panel {
  width: 90%;
  max-width: 900px;
  height: 90vh;
  max-height: 800px;
  border-radius: var(--radius-lg);
  background: rgba(30, 30, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: panelSlideIn 0.3s ease;
}

.close-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: rgba(255, 171, 88, 0.2);
  color: var(--color-primary-light);
}

.preview-header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.preview-title {
  font-size: 1.8rem;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: var(--spacing-lg);
}

.preview-badge {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.preview-metadata {
  padding: 0 var(--spacing-lg) var(--spacing-md);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: var(--spacing-md);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.tags-container, .compatibility-container {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.preview-tag {
  color: var(--color-primary-light);
}

.preview-compatibility {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}

.preview-description {
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.preview-content-container {
  padding: 0 var(--spacing-lg);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-header {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--glass-border);
}

.markdown-preview {
  color: var(--color-text);
  line-height: 1.6;
}

.markdown-preview h1, 
.markdown-preview h2, 
.markdown-preview h3 {
  color: var(--color-text);
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.markdown-preview h1 {
  font-size: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: var(--spacing-xs);
}

.markdown-preview h2 {
  font-size: 1.3rem;
}

.markdown-preview h3 {
  font-size: 1.1rem;
}

.markdown-preview p {
  margin-bottom: var(--spacing-sm);
}

.markdown-preview ul, 
.markdown-preview ol {
  margin-bottom: var(--spacing-sm);
  padding-left: var(--spacing-lg);
}

.markdown-preview li {
  margin-bottom: var(--spacing-xs);
}

.markdown-preview input[type="checkbox"] {
  margin-right: var(--spacing-xs);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-style: italic;
}

.preview-actions {
  display: flex;
  padding: var(--spacing-md) var(--spacing-lg);
  gap: var(--spacing-md);
  border-top: 1px solid var(--glass-border);
}

.btn-edit, .btn-push {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.btn-edit {
  background: rgba(0, 0, 0, 0.3);
  color: var(--color-text);
  border: 1px solid var(--glass-border);
  flex: 1;
}

.btn-edit:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.btn-push {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  border: none;
  flex: 2;
}

.btn-push:hover {
  box-shadow: 0 0 15px rgba(255, 171, 88, 0.4);
  transform: translateY(-2px);
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .template-preview-panel {
    width: 95%;
    height: 95vh;
    max-height: none;
  }
  
  .preview-title {
    font-size: 1.5rem;
  }
  
  .preview-actions {
    flex-direction: column;
  }
  
  .preview-metadata {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
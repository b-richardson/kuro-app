<template>
  <div class="template-card glass-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="template-badge" v-if="template.badge">{{ template.badge }}</div>
    
    <div class="template-content">
      <h3 class="template-title">{{ template.title }}</h3>
      <p class="template-description">{{ template.description }}</p>
      
      <div class="template-metadata">
        <div class="template-author">
          <i class="fas fa-user"></i>
          <span>{{ template.author }}</span>
        </div>
        <div class="template-tags">
          <span v-for="(tag, index) in displayTags" :key="index" class="tag">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="template-compatibility">
      <span v-for="(comp, index) in template.compatibility" :key="index" 
        class="compatibility-badge" :title="`Compatible with ${comp}`">
        {{ getCompatibilityIcon(comp) }}
      </span>
    </div>
    
    <div class="template-actions" :class="{ 'actions-visible': isHovered }">
      <button class="btn-preview" @click="$emit('preview', template)">
        <i class="fas fa-eye"></i> Preview
      </button>
      <button class="btn-push" @click="$emit('push-to-vault', template)">
        <i class="fas fa-file-export"></i> Push to Vault
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Template } from '@/stores/frameworks';

// Props
const props = defineProps({
  template: {
    type: Object as () => Template,
    required: true
  }
});

// Emits
defineEmits(['preview', 'push-to-vault']);

// State
const isHovered = ref(false);

// Computed
const displayTags = computed(() => {
  // Only show up to 3 tags
  return props.template.tags.slice(0, 3);
});

// Methods
const getCompatibilityIcon = (compatibility) => {
  const icons = {
    'core': '🔵', // Core Obsidian
    'dataview': '📊', // Dataview plugin
    'tasks': '✓', // Tasks plugin
    'default': '🔌' // Default for other plugins
  };
  
  return icons[compatibility] || icons.default;
};
</script>

<style scoped>
.template-card {
  position: relative;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  transition: all var(--transition-fast);
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
}

.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: var(--color-primary-light);
}

.template-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.template-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.template-title {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.template-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  flex: 1;
}

.template-metadata {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: 0.8rem;
}

.template-author {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-tertiary);
}

.template-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag {
  color: var(--color-primary-light);
  font-size: 0.75rem;
}

.template-compatibility {
  display: flex;
  gap: 5px;
  margin-bottom: var(--spacing-md);
}

.compatibility-badge {
  font-size: 0.9rem;
  cursor: help;
}

.template-actions {
  display: flex;
  gap: var(--spacing-sm);
  opacity: 0;
  transform: translateY(10px);
  transition: all var(--transition-fast);
}

.actions-visible {
  opacity: 1;
  transform: translateY(0);
}

.btn-preview, .btn-push {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all var(--transition-fast);
}

.btn-preview {
  background: rgba(0, 0, 0, 0.3);
  color: var(--color-text);
  flex: 1;
}

.btn-preview:hover {
  background: rgba(0, 0, 0, 0.5);
}

.btn-push {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: white;
  flex: 1.5;
}

.btn-push:hover {
  box-shadow: 0 0 10px rgba(255, 171, 88, 0.4);
  transform: translateY(-2px);
}
</style>
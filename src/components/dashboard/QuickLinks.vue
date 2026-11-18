<template>
  <div class="quick-links-section">
    <div class="section-header">
      <h3><i class="fas fa-lightbulb"></i> Quick Links & Resources</h3>
    </div>
    
    <div class="resources-grid">
      <div 
        v-for="resource in resources" 
        :key="resource.id"
        class="resource-card glass-card"
        @click="openResource(resource)"
      >
        <div class="resource-icon">
          <i :class="resource.icon"></i>
        </div>
        <h4 class="resource-title">{{ resource.title }}</h4>
        <p class="resource-description">{{ resource.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useObsidianStore } from '@/stores/obsidian';

const router = useRouter();
const obsidianStore = useObsidianStore();

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  isExternal: boolean;
}

// Base resources
const baseResources = ref<Resource[]>([
  {
    id: 'docs',
    title: 'Documentation',
    description: 'Learn how to use all features and capabilities',
    icon: 'fas fa-book',
    url: '/documentation',
    isExternal: false
  },
  {
    id: 'plugins',
    title: 'Plugin Guides',
    description: 'Get the most out of Obsidian plugins',
    icon: 'fas fa-puzzle-piece',
    url: '/plugins',
    isExternal: false
  },
  {
    id: 'tips',
    title: 'Tips & Tricks',
    description: 'Advanced techniques to supercharge your templates',
    icon: 'fas fa-graduation-cap',
    url: '/tips',
    isExternal: false
  }
]);

// Add Obsidian resources if connected
const resources = computed(() => {
  const allResources = [...baseResources.value];
  
  // Add Obsidian Explorer link if connected
  if (obsidianStore.isConnected) {
    allResources.push({
      id: 'obsidian-explorer',
      title: 'Obsidian Explorer',
      description: 'Browse your connected Obsidian vault and create templates',
      icon: 'fas fa-mountain',
      url: '/obsidian-explorer',
      isExternal: false
    });
  } else {
    allResources.push({
      id: 'connect-obsidian',
      title: 'Connect Obsidian',
      description: 'Link your Obsidian vault to create templates from your notes',
      icon: 'fas fa-plug',
      url: '/obsidian-connect',
      isExternal: false
    });
  }
  
  return allResources;
});

// Open resource URL
const openResource = (resource: Resource) => {
  if (resource.isExternal) {
    window.open(resource.url, '_blank');
  } else {
    router.push(resource.url);
  }
};
</script>

<style scoped>
.quick-links-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-xs);
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.resource-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.resource-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  font-size: 1.4rem;
  margin-bottom: var(--spacing-md);
}

.resource-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
}

.resource-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Responsive styling */
@media (max-width: 768px) {
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-card {
    padding: var(--spacing-md);
  }
}
</style>
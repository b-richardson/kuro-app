<template>
  <div class="module-category">
    <h3 class="category-title">Plugin Modules</h3>
    
    <!-- Plugin categories tabs -->
    <div class="plugin-tabs">
      <button 
        v-for="plugin in plugins"
        :key="plugin.type"
        class="plugin-tab"
        :class="{ active: activePlugin === plugin.type }"
        @click="activePlugin = plugin.type"
      >
        <i :class="getPluginIcon(plugin.type)"></i>
        {{ plugin.name }}
      </button>
    </div>
    
    <!-- Plugin modules -->
    <div class="module-content">
      <!-- Templater Modules -->
      <div v-if="activePlugin === 'templater'" class="plugin-module-section">
        <!-- High Priority Modules -->
        <div class="module-grid">
          <ModuleCard
            v-for="module in highPriorityTemplaterModules"
            :key="module.id"
            :title="module.title"
            :description="module.description"
            :icon="getSectionIcon(module.sectionType)"
            :plugin-icon="getPluginIcon('templater')"
            :show-description="showDescriptions"
            @click="addPluginModule(module.id, 'templater')"
          />
        </div>
        
        <!-- Secondary Modules (togglable) -->
        <div v-if="showSecondaryModules && secondaryPriorityTemplaterModules.length > 0">
          <div class="secondary-modules-heading">
            <h4 class="module-subheading">Additional Templater Modules</h4>
            <small class="module-hint">Advanced templating options for specific needs</small>
          </div>
          
          <div class="module-grid secondary-module-grid">
            <ModuleCard
              v-for="module in secondaryPriorityTemplaterModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getSectionIcon(module.sectionType)"
              :plugin-icon="getPluginIcon('templater')"
              :show-description="showDescriptions"
              @click="addPluginModule(module.id, 'templater')"
            />
          </div>
        </div>
      </div>
      
      <!-- Dataview Modules -->
      <div v-if="activePlugin === 'dataview'" class="plugin-module-section">
        <!-- High Priority Modules -->
        <div class="module-grid">
          <ModuleCard
            v-for="module in highPriorityDataviewModules"
            :key="module.id"
            :title="module.title"
            :description="module.description"
            :icon="getSectionIcon(module.sectionType)"
            :plugin-icon="getPluginIcon('dataview')"
            :show-description="showDescriptions"
            @click="addPluginModule(module.id, 'dataview')"
          />
        </div>
        
        <!-- Secondary Modules (togglable) -->
        <div v-if="showSecondaryModules && secondaryPriorityDataviewModules.length > 0">
          <div class="secondary-modules-heading">
            <h4 class="module-subheading">Additional Dataview Modules</h4>
            <small class="module-hint">More advanced query options</small>
          </div>
          
          <div class="module-grid secondary-module-grid">
            <ModuleCard
              v-for="module in secondaryPriorityDataviewModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getSectionIcon(module.sectionType)"
              :plugin-icon="getPluginIcon('dataview')"
              :show-description="showDescriptions"
              @click="addPluginModule(module.id, 'dataview')"
            />
          </div>
        </div>
      </div>
      
      <!-- Kanban Modules -->
      <div v-if="activePlugin === 'kanban'" class="plugin-module-section">
        <!-- High Priority Modules -->
        <div class="module-grid">
          <ModuleCard
            v-for="module in highPriorityKanbanModules"
            :key="module.id"
            :title="module.title"
            :description="module.description"
            :icon="getSectionIcon(module.sectionType)"
            :plugin-icon="getPluginIcon('kanban')"
            :show-description="showDescriptions"
            @click="addPluginModule(module.id, 'kanban')"
          />
        </div>
        
        <!-- Secondary Modules (togglable) -->
        <div v-if="showSecondaryModules && secondaryPriorityKanbanModules.length > 0">
          <div class="secondary-modules-heading">
            <h4 class="module-subheading">Additional Kanban Modules</h4>
            <small class="module-hint">More advanced board configurations</small>
          </div>
          
          <div class="module-grid secondary-module-grid">
            <ModuleCard
              v-for="module in secondaryPriorityKanbanModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getSectionIcon(module.sectionType)"
              :plugin-icon="getPluginIcon('kanban')"
              :show-description="showDescriptions"
              @click="addPluginModule(module.id, 'kanban')"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toggle for Secondary Modules -->
    <button 
      v-if="hasSecondaryModules" 
      class="toggle-secondary-btn"
      @click="toggleSecondaryModules"
    >
      {{ showSecondaryModules ? 'Hide additional modules' : 'Show more plugin modules' }}
      <i :class="showSecondaryModules ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ModuleCard from './ModuleCard.vue';
import { getSectionIcon, getPluginIcon } from '@/utils/pluginTemplates';
import { usePresetStore, ModulePriority } from '@/stores/presets';
import { v4 as uuidv4 } from 'uuid';

// Define props
const props = defineProps({
  showDescriptions: {
    type: Boolean,
    default: true
  }
});

const presetStore = usePresetStore();
const activePlugin = ref('templater');
const showSecondaryModules = ref(false);

// Plugin definitions
const plugins = [
  { type: 'templater', name: 'Templater' },
  { type: 'dataview', name: 'Dataview' },
  { type: 'kanban', name: 'Kanban' }
];

// Get high priority modules
const highPriorityTemplaterModules = computed(() => {
  return presetStore.getPluginModulesByPriority('templater', ModulePriority.HIGH);
});

const highPriorityDataviewModules = computed(() => {
  return presetStore.getPluginModulesByPriority('dataview', ModulePriority.HIGH);
});

const highPriorityKanbanModules = computed(() => {
  return presetStore.getPluginModulesByPriority('kanban', ModulePriority.HIGH);
});

// Get secondary priority modules
const secondaryPriorityTemplaterModules = computed(() => {
  return presetStore.getPluginModulesByPriority('templater', ModulePriority.SECONDARY);
});

const secondaryPriorityDataviewModules = computed(() => {
  return presetStore.getPluginModulesByPriority('dataview', ModulePriority.SECONDARY);
});

const secondaryPriorityKanbanModules = computed(() => {
  return presetStore.getPluginModulesByPriority('kanban', ModulePriority.SECONDARY);
});

// Check if we have any secondary modules for the active plugin
const hasSecondaryModules = computed(() => {
  switch (activePlugin.value) {
    case 'templater':
      return secondaryPriorityTemplaterModules.value.length > 0;
    case 'dataview':
      return secondaryPriorityDataviewModules.value.length > 0;
    case 'kanban':
      return secondaryPriorityKanbanModules.value.length > 0;
    default:
      return false;
  }
});

// Toggle display of secondary modules
const toggleSecondaryModules = () => {
  showSecondaryModules.value = !showSecondaryModules.value;
};

// Define emits
const emit = defineEmits(['add-module']);

// Function to add a plugin module
const addPluginModule = (moduleId, pluginType) => {
  const module = presetStore.getPluginModuleById(moduleId, pluginType);
  if (!module) return;
  
  emit('add-module', {
    id: uuidv4(),
    type: module.sectionType,
    content: [...module.content],
    pluginType: pluginType
  });
};
</script>

<style scoped>
.module-category {
  margin-bottom: var(--spacing-lg);
}

.category-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: var(--spacing-xs) 0;
  color: var(--color-text);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-surface);
}

.plugin-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin: var(--spacing-sm) 0;
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.plugin-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.plugin-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.plugin-tab.active {
  background-color: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.module-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.plugin-module-section {
  margin-bottom: var(--spacing-sm);
}

.module-content {
  margin-top: var(--spacing-sm);
}

.secondary-modules-heading {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.module-subheading {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
  color: var(--color-text-muted);
}

.module-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.8;
  margin-top: 0.2rem;
}

.secondary-module-grid {
  opacity: 0.9;
}

.toggle-secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-top: var(--spacing-sm);
  background: transparent;
  border: 1px dashed var(--color-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-secondary-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.toggle-secondary-btn i {
  font-size: 0.7rem;
}
</style>
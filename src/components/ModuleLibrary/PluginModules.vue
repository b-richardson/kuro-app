<template>
  <div class="plugin-modules-container">
    <div class="category-header">
      <h3 class="category-title">Plugin Modules</h3>
      <div class="category-description">
        Enhance your templates with plugin-specific features
      </div>
    </div>

    <!-- Plugin categories navigation -->
    <div class="plugin-nav">
      <button
        v-for="plugin in plugins"
        :key="plugin.type"
        class="plugin-nav-btn"
        :class="{ active: activePlugin === plugin.type }"
        @click="activePlugin = plugin.type"
      >
        <i :class="resolvePluginIcon(plugin.type)"></i>
        {{ plugin.name }}
      </button>
    </div>

    <!-- Plugin modules content -->
    <div class="modules-content">
      <!-- Templater Modules -->
      <transition name="fade" mode="out-in">
        <div v-if="activePlugin === 'templater'" class="plugin-section">
          <div class="section-description">
            <div class="icon-wrapper">
              <i :class="getPluginIcon('templater')"></i>
            </div>
            <div class="description-text">
              <h4>Templater Modules</h4>
              <p>Add dynamic content with Templater's JavaScript-powered templates</p>
            </div>
          </div>

          <!-- Main Templater Modules -->
          <div class="module-collection">
            <ModuleCard
              v-for="module in highPriorityTemplaterModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getModuleIcon(module.moduleType)"
              :plugin-icon="getPluginIcon('templater')"
              :show-description="showDescriptions"
              class="module-card-enhanced"
              @click="addPluginModule(module.id, 'templater')"
            />
          </div>

          <!-- Advanced Templater Modules -->
          <transition name="expand">
            <div v-if="showSecondaryModules && secondaryPriorityTemplaterModules.length > 0" class="advanced-modules">
              <div class="advanced-heading">
                <div class="icon-badge">
                  <i class="fas fa-angle-double-up"></i>
                </div>
                <div>
                  <h4>Advanced Templater Modules</h4>
                  <p>Specialized templating options for specific needs</p>
                </div>
              </div>

              <div class="module-collection secondary">
                <ModuleCard
                  v-for="module in secondaryPriorityTemplaterModules"
                  :key="module.id"
                  :title="module.title"
                  :description="module.description"
                  :icon="getModuleIcon(module.moduleType)"
                  :plugin-icon="getPluginIcon('templater')"
                  :show-description="showDescriptions"
                  class="module-card-enhanced"
                  @click="addPluginModule(module.id, 'templater')"
                />
              </div>
            </div>
          </transition>
        </div>

        <!-- Dataview Modules -->
        <div v-else-if="activePlugin === 'dataview'" class="plugin-section">
          <div class="section-description">
            <div class="icon-wrapper">
              <i :class="getPluginIcon('dataview')"></i>
            </div>
            <div class="description-text">
              <h4>Dataview Modules</h4>
              <p>Create dynamic queries that display data from across your vault</p>
            </div>
          </div>

          <!-- Main Dataview Modules -->
          <div class="module-collection">
            <ModuleCard
              v-for="module in highPriorityDataviewModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getModuleIcon(module.moduleType)"
              :plugin-icon="getPluginIcon('dataview')"
              :show-description="showDescriptions"
              class="module-card-enhanced"
              @click="addPluginModule(module.id, 'dataview')"
            />
          </div>

          <!-- Advanced Dataview Modules -->
          <transition name="expand">
            <div v-if="showSecondaryModules && secondaryPriorityDataviewModules.length > 0" class="advanced-modules">
              <div class="advanced-heading">
                <div class="icon-badge">
                  <i class="fas fa-angle-double-up"></i>
                </div>
                <div>
                  <h4>Advanced Dataview Modules</h4>
                  <p>More powerful queries and advanced data processing options</p>
                </div>
              </div>

              <div class="module-collection secondary">
                <ModuleCard
                  v-for="module in secondaryPriorityDataviewModules"
                  :key="module.id"
                  :title="module.title"
                  :description="module.description"
                  :icon="getModuleIcon(module.moduleType)"
                  :plugin-icon="getPluginIcon('dataview')"
                  :show-description="showDescriptions"
                  class="module-card-enhanced"
                  @click="addPluginModule(module.id, 'dataview')"
                />
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>

    <!-- Toggle for Advanced Modules -->
    <button
      v-if="hasSecondaryModules"
      class="toggle-advanced-btn"
      @click="toggleSecondaryModules"
    >
      <span>{{ showSecondaryModules ? "Hide advanced modules" : "Show advanced modules" }}</span>
      <i :class="showSecondaryModules ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
    </button>

    <!-- Plugin Requirements Notice -->
    <div class="plugin-requirements">
      <i class="fas fa-info-circle"></i>
      <p>
        These modules require the respective plugins to be installed in your Obsidian vault.
        <a href="#" @click.prevent="emit('show-plugin-help')">Learn more</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ModuleCard from "./ModuleCard.vue";
import {
  getModuleIcon,
  getPluginIcon,
  isValidPluginType,
} from "@/utils/pluginTemplatesUtils";
import { usePresetStore, ModulePriority } from "@/stores/presets";
import { ModuleType, PluginType } from "@/types/TemplateModule";
import { v4 as uuidv4 } from "uuid";

// Define props
const props = defineProps({
  showDescriptions: {
    type: Boolean,
    default: true,
  },
});

const presetStore = usePresetStore();
const activePlugin = ref("templater");
const showSecondaryModules = ref(false);

// Plugin definitions with descriptions
const plugins = [
  { type: "templater", name: "Templater", description: "JavaScript-powered dynamic templates" },
  { type: "dataview", name: "Dataview", description: "Query and display data from your vault" },
];

// Get high priority modules
const highPriorityTemplaterModules = computed(() => {
  return presetStore.getPluginModulesByPriority(
    "templater",
    ModulePriority.HIGH
  );
});

const highPriorityDataviewModules = computed(() => {
  return presetStore.getPluginModulesByPriority(
    "dataview",
    ModulePriority.HIGH
  );
});

// Get secondary priority modules
const secondaryPriorityTemplaterModules = computed(() => {
  return presetStore.getPluginModulesByPriority(
    "templater",
    ModulePriority.SECONDARY
  );
});

const secondaryPriorityDataviewModules = computed(() => {
  return presetStore.getPluginModulesByPriority(
    "dataview",
    ModulePriority.SECONDARY
  );
});

// Check if we have any secondary modules for the active plugin
const hasSecondaryModules = computed(() => {
  switch (activePlugin.value) {
    case "templater":
      return secondaryPriorityTemplaterModules.value.length > 0;
    case "dataview":
      return secondaryPriorityDataviewModules.value.length > 0;
    default:
      return false;
  }
});

// Toggle display of secondary modules
const toggleSecondaryModules = () => {
  showSecondaryModules.value = !showSecondaryModules.value;
};

// Define emits
const emit = defineEmits(["add-module", "show-plugin-help"]);

// Function to add a plugin module
const addPluginModule = (moduleId: string, pluginType: PluginType) => {
  const module = presetStore.getPluginModuleById(moduleId, pluginType);
  if (!module) return;

  emit("add-module", {
    id: uuidv4(),
    type: module.moduleType,
    content: [...module.content],
    pluginType: pluginType,
  });
};

function resolvePluginIcon(type: string | null): string {
  return isValidPluginType(type) ? getPluginIcon(type) : "fas fa-puzzle-piece";
}
</script>

<style scoped>
.plugin-modules-container {
  background: linear-gradient(to bottom, var(--color-background-darker) 0%, transparent 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border);
}

.category-header {
  margin-bottom: var(--spacing-md);
}

.category-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.category-description {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}

.plugin-nav {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.plugin-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plugin-nav-btn:hover {
  background: var(--color-surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plugin-nav-btn.active {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-color: var(--color-primary-dark);
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.plugin-nav-btn i {
  font-size: 1rem;
}

.modules-content {
  min-height: 300px;
}

.section-description {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 1.5rem;
}

.description-text h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.description-text p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.module-collection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.module-collection.secondary {
  opacity: 0.9;
}

.module-card-enhanced {
  transition: all 0.2s ease;
}

.module-card-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.advanced-modules {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--color-border);
}

.advanced-heading {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-size: 0.9rem;
}

.advanced-heading h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.advanced-heading p {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.toggle-advanced-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-advanced-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.toggle-advanced-btn i {
  font-size: 0.8rem;
}

.plugin-requirements {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm);
  background: rgba(var(--color-info-rgb), 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-info);
}

.plugin-requirements i {
  color: var(--color-info);
  margin-top: 0.2rem;
}

.plugin-requirements p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.plugin-requirements a {
  color: var(--color-primary);
  text-decoration: none;
}

.plugin-requirements a:hover {
  text-decoration: underline;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .module-collection {
    grid-template-columns: 1fr;
  }
  
  .section-description {
    flex-direction: column;
    text-align: center;
  }
  
  .icon-wrapper {
    margin-bottom: var(--spacing-xs);
  }
}
</style>

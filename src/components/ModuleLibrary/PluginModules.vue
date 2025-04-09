<template>
  <div class="plugin-modules-container">
    <div class="category-header">
      <h3 class="category-title">Plugin Modules</h3>
      <div class="category-description">
        Enhance your templates with plugin-specific features
      </div>
    </div>

    <!-- Plugin tabs navigation (segmented control style) -->
    <div class="plugin-selector">
      <div class="plugin-segment-container">
        <div
          v-for="plugin in plugins"
          :key="plugin.type"
          class="plugin-segment"
          :class="{ active: activePlugin === plugin.type }"
          @click="activePlugin = plugin.type"
        >
          <i :class="resolvePluginIcon(plugin.type)"></i>
          <span>{{ plugin.name }}</span>
        </div>
      </div>
    </div>

    <!-- Plugin modules content -->
    <div class="modules-drawer">
      <!-- Templater Modules -->
      <transition name="fade" mode="out-in">
        <div v-if="activePlugin === 'templater'" class="plugin-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <i :class="getPluginIcon('templater')"></i>
            </div>
            <div class="panel-info">
              <h4>Templater</h4>
              <p>Add dynamic content with JavaScript-powered templates</p>
            </div>
          </div>

          <div class="module-grid">
            <ModuleCard
              v-for="module in templaterModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getModuleIcon(module.moduleType)"
              :plugin-icon="getPluginIcon('templater')"
              :show-description="showDescriptions"
              @click="addPluginModule(module.id, 'templater')"
            />
          </div>
        </div>

        <!-- Dataview Modules -->
        <div v-else-if="activePlugin === 'dataview'" class="plugin-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <i :class="getPluginIcon('dataview')"></i>
            </div>
            <div class="panel-info">
              <h4>Dataview</h4>
              <p>
                Create dynamic queries that display data from across your vault
              </p>
            </div>
          </div>

          <div class="module-grid">
            <ModuleCard
              v-for="module in dataviewModules"
              :key="module.id"
              :title="module.title"
              :description="module.description"
              :icon="getModuleIcon(module.moduleType)"
              :plugin-icon="getPluginIcon('dataview')"
              :show-description="showDescriptions"
              @click="addPluginModule(module.id, 'dataview')"
            />
          </div>
        </div>
      </transition>
    </div>

    <!-- Plugin Requirements Notice -->
    <div class="plugin-requirements">
      <i class="fas fa-info-circle"></i>
      <p>
        These modules require the respective plugins to be installed in your
        Obsidian vault.
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
import { usePresetStore } from "@/stores/presets";
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

// Plugin definitions
const plugins = [
  {
    type: "templater",
    name: "Templater",
    description: "JavaScript-powered dynamic templates",
  },
  {
    type: "dataview",
    name: "Dataview",
    description: "Query and display data from your vault",
  },
];

// Filter out the modules we don't need (as specified in requirements)
const templaterModules = computed(() => {
  // Get all templater modules and filter out unwanted ones
  return presetStore.getPluginModules("templater").filter((module) => {
    // Filter out conditional content, value transformation, template variables, date field, and file title
    const excludedModules = [
      "templaterConditionalContent",
      "templaterValueTransformation",
      "templaterTemplateVariables",
      "inlineFields",
    ];
    const excludedTitles = ["Date Field", "File Title"];

    return (
      !excludedModules.includes(module.moduleType) &&
      !excludedTitles.includes(module.title)
    );
  });
});

const dataviewModules = computed(() => {
  // Get all dataview modules and filter out unwanted ones
  return presetStore.getPluginModules("dataview").filter((module) => {
    // Filter out inline fields, generic query, and table of notes
    const excludedModules = ["dataviewInlineFields"];
    const excludedTitles = ["Generic Query", "Table of Notes"];

    return (
      !excludedModules.includes(module.moduleType) &&
      !excludedTitles.includes(module.title)
    );
  });
});

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
  background: var(--color-background-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
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

/* Plugin segmented control navigation */
.plugin-selector {
  margin-bottom: var(--spacing-md);
}

.plugin-segment-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.plugin-segment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-right: 1px solid var(--color-border);
}

.plugin-segment:last-child {
  border-right: none;
}

.plugin-segment i {
  font-size: 1rem;
}

.plugin-segment:hover {
  color: var(--color-text);
  background-color: rgba(0, 0, 0, 0.03);
}

.plugin-segment.active {
  color: var(--color-text-on-primary);
  background-color: var(--color-primary);
  font-weight: 500;
}

/* Modules drawer/panel */
.modules-drawer {
  min-height: 300px;
  transition: all 0.3s ease;
}

.plugin-panel {
  animation: fadeIn 0.3s ease;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(var(--color-primary-rgb), 0.05);
  border-radius: var(--radius-md);
}

.panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 1.4rem;
  flex-shrink: 0;
}

.panel-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.panel-info p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Module grid layout */
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

/* Plugin requirements notice */
.plugin-requirements {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(var(--color-info-rgb), 0.08);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-info);
}

.plugin-requirements i {
  color: var(--color-info);
  margin-top: 0.2rem;
  flex-shrink: 0;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .module-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    text-align: center;
  }

  .panel-icon {
    margin-bottom: var(--spacing-xs);
  }
}
</style>

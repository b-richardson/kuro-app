<template>
  <div class="plugin-modules-container">
    <!-- Section Header -->
    <div class="plugin-section-header">
      <div class="plugin-icon">
        <i :class="getPluginIcon('dataview')" />
      </div>

      <div class="plugin-description">
        <h3 class="plugin-title">Dataview Modules</h3>
        <p>
          Add powerful, query-based content using <strong>Dataview</strong>.
        </p>
      </div>
    </div>

    <!-- Module Grid -->
    <div class="module-grid">
      <ModuleCard
        v-for="module in dataviewModules"
        :key="module.id"
        :title="module.title"
        :description="module.description"
        :icon="getModuleIcon(module.moduleType)"
        :plugin-icon="getPluginIcon('dataview')"
        :show-description="showDescriptions"
        @click="addPluginModule(module.id)"
      />
    </div>

    <!-- Requirements Info -->
    <div class="plugin-requirements">
      <i class="fas fa-info-circle"></i>
      <p>
        These modules require the <strong>Dataview plugin</strong> to be
        installed.
        <a href="#" @click.prevent="emit('show-plugin-help')">Learn more</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ModuleCard from "./ModuleCard.vue";
import { getModuleIcon, getPluginIcon } from "@/utils/pluginTemplatesUtils";
import { usePresetStore } from "@/stores/presets";
import { PluginType, TemplateModule } from "@/types/TemplateModule";
import { v4 as uuidv4 } from "uuid";

// Props
const props = defineProps({
  showDescriptions: { type: Boolean, default: true },
});

// Emits
const emit = defineEmits(["add-module", "show-plugin-help"]);

// Store
const presetStore = usePresetStore();

// Filter relevant modules
const dataviewModules = computed(() => {
  return presetStore.getPluginModules("dataview").filter((module) => {
    const exclude = ["dataviewInlineFields"];
    const excludeTitles = ["Generic Query", "Table of Notes"];
    return (
      !exclude.includes(module.moduleType) &&
      !excludeTitles.includes(module.title)
    );
  });
});

// Module handler
const addPluginModule = (moduleId: string) => {
  const module = presetStore.getPluginModuleById(moduleId, "dataview");
  if (!module) return;

  emit("add-module", {
    id: uuidv4(),
    type: module.moduleType,
    pluginType: "dataview" as PluginType,
    content: [...module.content],
  });
};
</script>

<style scoped>
.plugin-modules-container {
  background: var(--color-background-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Section header */
.plugin-section-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: 0; /* No internal padding here — let container handle */
}

.plugin-icon {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 1rem;
  flex-shrink: 0;
}

.plugin-description {
  flex: 1;
  min-width: 0; /* Improves text wrap responsiveness */
}

.plugin-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.plugin-description p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Module cards grid */
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

/* Requirements alert */
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

/* Responsive */
@media (max-width: 768px) {
  .plugin-section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .plugin-icon {
    margin-bottom: var(--spacing-xs);
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>

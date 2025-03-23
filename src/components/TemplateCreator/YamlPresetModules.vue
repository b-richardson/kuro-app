<template>
  <div class="module-category">
    <h3 class="category-title">YAML Presets</h3>

    <!-- High Priority Presets (Always visible) -->
    <div class="module-grid">
      <ModuleCard
        v-for="preset in highPriorityPresets"
        :key="preset.id"
        :title="preset.title"
        :description="preset.description"
        :icon="getModuleIcon('yaml')"
        :show-description="showDescriptions"
        @click="addYamlPreset(preset.id)"
      />
    </div>

    <!-- Secondary Priority Presets (Only if showSecondary is true) -->
    <div v-if="showSecondaryModules">
      <div class="secondary-modules-heading">
        <h4 class="module-subheading">Additional Presets</h4>
        <small class="module-hint"
          >These presets provide additional options for specific use
          cases</small
        >
      </div>

      <div class="module-grid secondary-module-grid">
        <ModuleCard
          v-for="preset in secondaryPriorityPresets"
          :key="preset.id"
          :title="preset.title"
          :description="preset.description"
          :icon="getModuleIcon('yaml')"
          :show-description="showDescriptions"
          @click="addYamlPreset(preset.id)"
        />
      </div>
    </div>

    <!-- Toggle for Secondary Modules -->
    <button
      v-if="hasSecondaryModules"
      class="toggle-secondary-btn"
      @click="toggleSecondaryModules"
    >
      {{
        showSecondaryModules ? "Hide additional presets" : "Show more presets"
      }}
      <i
        :class="
          showSecondaryModules ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
        "
      ></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ModuleCard from "./ModuleCard.vue";
import { getModuleIcon } from "@/utils/pluginTemplates";
import { usePresetStore, ModulePriority } from "@/stores/presets";
import { v4 as uuidv4 } from "uuid";

// Define props
const props = defineProps({
  showDescriptions: {
    type: Boolean,
    default: true,
  },
});

const presetStore = usePresetStore();
const showSecondaryModules = ref(false);

// Get presets from store by priority
const highPriorityPresets = computed(() => {
  return presetStore.getYamlPresetsByPriority(ModulePriority.HIGH);
});

const secondaryPriorityPresets = computed(() => {
  return presetStore.getYamlPresetsByPriority(ModulePriority.SECONDARY);
});

// Check if we have any secondary modules
const hasSecondaryModules = computed(() => {
  return secondaryPriorityPresets.value.length > 0;
});

// Toggle display of secondary modules
const toggleSecondaryModules = () => {
  showSecondaryModules.value = !showSecondaryModules.value;
};

// Define emits
const emit = defineEmits(["add-module"]);

// Function to add a YAML preset
const addYamlPreset = (presetId) => {
  const preset = presetStore.getYamlPresetById(presetId);
  if (!preset) return;

  emit("add-module", {
    id: uuidv4(),
    type: "yaml",
    content: [...preset.content],
    pluginType: null,
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

.module-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
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

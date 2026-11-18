<template>
  <div class="template-library" :class="{ collapsed }">
    <!-- Header -->
    <div class="library-header">
      <div class="title-wrapper">
        <h2>Template Modules</h2>
        <p>Click to add modules to your template</p>
      </div>

      <button
        class="settings-btn"
        @click="toggleSettings"
        v-tooltip="'Settings'"
      >
        <i class="fas fa-sliders-h"></i>
      </button>
    </div>

    <!-- Inline Settings Panel -->
    <transition name="fade-slide">
      <div v-if="showSettings" class="settings-inline-panel">
        <div class="drawer-header">
          <h3>Module Settings</h3>
          <button
            @click="toggleSettings"
            class="close-btn"
            aria-label="Close Settings"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="drawer-options">
          <label class="setting-item">
            <input type="checkbox" v-model="showPluginModules" />
            Show Plugin Modules
          </label>

          <label class="setting-item">
            <input type="checkbox" v-model="showModuleDescriptions" />
            Show Descriptions
          </label>

          <small class="note">
            Plugin modules require the related Obsidian plugins (Templater and
            Dataview) for full functionality.
          </small>
        </div>
      </div>
    </transition>

    <!-- Module Groups -->
    <div class="drawer-stack">
      <ExpandableSection
        title="Frontmatter Modules"
        icon="fas fa-layer-group"
        :default-open="true"
      >
        <FrontmatterModule
          @add-module="handleAddModule"
          :show-descriptions="showModuleDescriptions"
        />
      </ExpandableSection>

      <ExpandableSection title="Basic Modules" icon="fas fa-puzzle-piece">
        <BasicModules
          @add-module="handleAddModule"
          :show-descriptions="showModuleDescriptions"
        />
      </ExpandableSection>

      <ExpandableSection
        title="Plugin Modules"
        icon="fas fa-plug"
        v-if="showPluginModules"
      >
        <PluginModules
          @add-module="handleAddModule"
          @show-plugin-help="showPluginHelpModal"
          :show-descriptions="showModuleDescriptions"
        />
      </ExpandableSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FrontmatterModule from "@/components/ModuleLibrary/FrontmatterModules.vue";
import BasicModules from "@/components/ModuleLibrary/BasicModules.vue";
import PluginModules from "@/components/ModuleLibrary/PluginModules.vue";
import ExpandableSection from "./ExpandableSection.vue";
import { TemplateModule } from "@/types/TemplateModule";

// Props and emits
const props = defineProps({
  collapsed: { type: Boolean, default: false },
});

const emit = defineEmits(["add-module", "show-dialog"]);

// State
const showSettings = ref(false);
const showPluginModules = ref(true);
const showModuleDescriptions = ref(true);

// Methods
const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const handleAddModule = (moduleData: TemplateModule) => {
  emit("add-module", moduleData);
  if (showSettings.value) showSettings.value = false;
};

const showPluginHelpModal = () => {
  emit("show-dialog", {
    title: "About Plugin Modules",
    content: `
      <div>
        <p>Plugin modules require specific plugins:</p>
        <h4>Templater</h4>
        <p>Advanced scripting and variables in templates.</p>
        <a href="https://github.com/SilentVoid13/Templater" target="_blank">Templater Docs</a>
        <h4>Dataview</h4>
        <p>Query and display your vault’s content.</p>
        <a href="https://github.com/blacksmithgu/obsidian-dataview" target="_blank">Dataview Docs</a>
      </div>
    `,
    type: "info",
  });
};
</script>

<style scoped>
.template-library {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
  position: relative;
  overflow-y: auto;

  scrollbar-gutter: stable;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.title-wrapper h2 {
  margin: 0;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--color-primary);
}

.title-wrapper p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.settings-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  padding: var(--spacing-xs);
  cursor: pointer;
  transition: color 0.2s;
}
.settings-btn:hover {
  color: var(--color-accent);
}

/* Inline Settings Drawer */
.settings-inline-panel {
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.drawer-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1rem;
  cursor: pointer;
}

.drawer-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
}

.note {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}

.drawer-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Collapsed */
.collapsed .library-header,
.collapsed .drawer-stack {
  display: none;
}

@supports (overflow: overlay) {
  .template-library {
    overflow-y: overlay;
  }
}

.template-library::-webkit-scrollbar {
  width: 8px;
}

.template-library::-webkit-scrollbar-track {
  background: transparent;
}

.template-library::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.2);
  border-radius: 4px;
}

.template-library::-webkit-scrollbar-thumb:hover {
  background-color: rgba(120, 120, 120, 0.4);
}

.template-library {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 100, 100, 0.3) transparent;
}
</style>

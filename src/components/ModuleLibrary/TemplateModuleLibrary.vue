<template>
  <div class="template-module-library" :class="{ collapsed: collapsed }">
    <div class="library-header">
      <div class="header-content">
        <h2 class="library-title">Template Modules</h2>
        <p class="library-description">Click to add modules to your template</p>
      </div>

      <div class="library-actions">
        <button
          class="module-settings-btn"
          @click="toggleSettings"
          v-tooltip="'Module settings'"
        >
          <i class="fas fa-sliders-h"></i>
        </button>
      </div>
    </div>

    <!-- Settings Panel (conditionally displayed) -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-header">
        <h3>Module Settings</h3>
        <button @click="toggleSettings" class="close-settings">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="settings-options">
        <div class="setting-option">
          <label class="setting-label">
            <input type="checkbox" v-model="showPluginModules" />
            <span>Show Plugin Modules</span>
          </label>
          <small class="setting-description"
            >Display modules for Obsidian plugins like Templater and
            Dataview</small
          >
        </div>

        <div class="setting-option">
          <label class="setting-label">
            <input type="checkbox" v-model="showModuleDescriptions" />
            <span>Show Descriptions</span>
          </label>
          <small class="setting-description"
            >Display detailed descriptions for each module</small
          >
        </div>
      </div>
    </div>

    <!-- Module Categories -->
    <div class="module-categories">
      <!-- Basic Modules -->
      <BasicModules
        @add-module="handleAddModule"
        :show-descriptions="showModuleDescriptions"
      />

      <!-- Plugin-aware Modules -->
      <PluginModules
        v-if="showPluginModules"
        @add-module="handleAddModule"
        @show-plugin-help="showPluginHelpModal"
        :show-descriptions="showModuleDescriptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BasicModules from "@/components/ModuleLibrary/BasicModules.vue";
import PluginModules from "@/components/ModuleLibrary/PluginModules.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { usePreferencesStore } from "@/stores/preferences";

const preferencesStore = usePreferencesStore();

// Module display settings (would typically come from a preferences store)
const showPluginModules = ref(true);
const showModuleDescriptions = ref(true);
const showSettings = ref(false);

// Toggle settings panel
const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

// Define props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

// Define emits
const emit = defineEmits(["add-module", "show-dialog"]);

// Handle module addition (emitted from child components)
const handleAddModule = (moduleData: TemplateModule) => {
  // Simply pass the event up to parent component
  emit("add-module", moduleData);

  // Automatically close settings panel if open
  if (showSettings.value) {
    showSettings.value = false;
  }
};

// Show plugin help modal
const showPluginHelpModal = () => {
  emit("show-dialog", {
    title: "About Plugin Modules",
    content: `
      <div>
        <p>Plugin modules require specific plugins to be installed in your Obsidian vault:</p>
        
        <h4>Templater</h4>
        <p>Adds JavaScript-powered templating to Obsidian. You can use variables, functions, and conditional logic in your templates.</p>
        <p><a href="https://github.com/SilentVoid13/Templater" target="_blank">Installation Guide</a></p>
        
        <h4>Dataview</h4>
        <p>Treats your Obsidian vault as a database, allowing you to query and display information from across your notes.</p>
        <p><a href="https://github.com/blacksmithgu/obsidian-dataview" target="_blank">Installation Guide</a></p>
        
        <div class="info-note">
          <p><strong>Note:</strong> If you don't have these plugins installed, the generated template will still contain the correct syntax, but it won't function until the plugin is installed.</p>
        </div>
      </div>
    `,
    type: "info",
  });
};
</script>

<style scoped>
.template-module-library {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-md);
  position: relative;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.header-content {
  flex: 1;
}

.library-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
  color: var(--color-primary);
}

.library-description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.library-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.module-settings-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.module-settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.settings-panel {
  background: var(--glass-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.settings-header h3 {
  font-size: 1rem;
  margin: 0;
  color: var(--color-text);
}

.close-settings {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.close-settings:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.setting-option {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.setting-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
}

.setting-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-left: calc(var(--spacing-xs) + 18px);
}

.module-categories {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
}

/* Collapsed state handling */
:deep(.collapsed) .library-header,
:deep(.collapsed) .module-categories {
  display: none;
}

/* When parent sidebar is collapsed, hide content */
.collapsed-sidebar .template-module-library {
  visibility: hidden;
}
</style>

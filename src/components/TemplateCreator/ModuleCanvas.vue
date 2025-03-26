<template>
  <div class="module-canvas" @click.self="clearSelection">
    <!-- Empty state - shown when no modules are present -->
    <div v-if="modules.length === 0" class="empty-template">
      <div class="empty-template-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <p class="empty-template-title">Your template is empty</p>
      <p class="empty-template-subtitle">
        Add modules from the library to build your template
      </p>
    </div>

    <!-- Modules container -->
    <div v-else class="modules-list">
      <div
        v-for="(module, index) in modules"
        :key="module.id"
        class="module-wrapper"
      >
        <TemplateModuleEditor
          :module="module"
          :index="index"
          :modules="modules"
          :is-selected="selectedModuleId === module.id"
          :auto-focus="module.id === autoFocusModuleId"
          @update:content="updateModuleContent(module.id, $event)"
          @update="emit('update', $event)"
          @delete="deleteModule(module.id)"
          @select="selectModule(module.id)"
          @duplicate="duplicateModule(module.id)"
          @module-change="emit('module-change')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { TemplateModule } from "@/types/TemplateModule";
import TemplateModuleEditor from "@/components/TemplateCreator/TemplateModuleEditor.vue";
import { v4 as uuidv4 } from "uuid";
import { useModuleOperations } from "./composables/useModuleOperations";

// Define props
const props = defineProps<{
  modules: TemplateModule[];
}>();

// Define emits
const emit = defineEmits<{
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete", moduleId: string): void;
  (e: "module-change"): void;
}>();

// UI state
const selectedModuleId = ref<string | null>(null);
const autoFocusModuleId = ref<string | null>(null);

// Use module operations composable
const { 
  adaptModuleTypes, 
} = useModuleOperations();

onMounted(() => {
  // Ensure module types are consistent on mount
  const adaptedModules = adaptModuleTypes(props.modules);
  if (adaptedModules !== props.modules) {
    emit("update", adaptedModules);
  }
});

/**
 * Updates content of a specific module
 */
const updateModuleContent = (moduleId: string, newContent: string[]) => {
  // Find the module and update its content
  const moduleIndex = props.modules.findIndex(
    (module) => module.id === moduleId
  );

  if (moduleIndex !== -1) {
    // Create an updated modules array with the content change
    const updatedModules = [...props.modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      content: [...newContent],
    };

    // Emit the update
    emit("update", updatedModules);
    emit("module-change");
  }
};

/**
 * Deletes a module by ID
 */
const deleteModule = (moduleId: string) => {
  // If we're deleting the selected module, clear selection
  if (selectedModuleId.value === moduleId) {
    selectedModuleId.value = null;
  }

  // Emit the delete event
  emit("delete", moduleId);
  emit("module-change");
};

/**
 * Selects a module for editing
 */
const selectModule = (moduleId: string) => {
  selectedModuleId.value = moduleId;
  // Clear auto-focus since we're selecting explicitly
  autoFocusModuleId.value = null;
};

/**
 * Clears the currently selected module
 */
const clearSelection = () => {
  selectedModuleId.value = null;
};

/**
 * Duplicates a module
 */
const duplicateModule = (moduleId: string) => {
  const moduleIndex = props.modules.findIndex(
    (module) => module.id === moduleId
  );
  
  if (moduleIndex === -1) return;

  // Create a copy of the module with a new ID
  const originalModule = props.modules[moduleIndex];
  const newModule: TemplateModule = {
    ...JSON.parse(JSON.stringify(originalModule)), // Deep copy
    id: uuidv4(), // Generate a new unique ID
  };

  // Create a new array and insert the new module
  const updatedModules = [...props.modules];
  updatedModules.splice(moduleIndex + 1, 0, newModule);

  // Update modules
  emit("update", updatedModules);
  emit("module-change");

  // Set selection and focus to the new module
  nextTick(() => {
    selectedModuleId.value = newModule.id;
    autoFocusModuleId.value = newModule.id;
  });
};
</script>

<style scoped>
.module-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.empty-template {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  right: var(--spacing-md);
  bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed var(--color-surface);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.empty-template:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-primary);
}

.empty-template-icon {
  font-size: 3.5rem;
  color: var(--color-primary);
  opacity: 0.4;
  margin-bottom: var(--spacing-lg);
}

.empty-template-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-sm);
}

.empty-template-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
  max-width: 90%;
}

.modules-list {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  display: block;
  scroll-behavior: smooth;
}

.modules-list > div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.module-wrapper {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: var(--spacing-md);
  z-index: 1;
  animation: fadeIn 0.3s ease forwards;
  will-change: opacity;
  transform: translate3d(0, 0, 0); /* Force GPU acceleration */
  position: static;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
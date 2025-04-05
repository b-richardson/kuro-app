<template>
  <div class="module-category">
    <h3 class="category-title">Properties & Metadata</h3>

    <div class="module-grid">
      <ModuleCard
        v-for="module in metadataModules"
        :key="module.type"
        :title="module.title"
        :description="module.description"
        :icon="getModuleIcon(module.type)"
        :show-description="showDescriptions"
        @click="addModule(module.type)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ModuleCard from "./ModuleCard.vue";
import {
  generateDefaultContent,
  getModuleIcon,
} from "@/utils/pluginTemplatesUtils";
import { v4 as uuidv4 } from "uuid";

// Define props
const props = defineProps({
  showDescriptions: {
    type: Boolean,
    default: true,
  },
});

// Define metadata modules with their priorities
const metadataModules = [
  {
    type: "frontmatter",
    title: "Frontmatter",
    description: "Add frontmatter properties to your template",
    priority: "high",
  },
  // You can add other metadata modules here as you develop them
  // For example:
  // {
  //   type: "inlineFields",
  //   title: "Inline Fields",
  //   description: "Add Dataview inline fields to your content",
  //   priority: "high",
  // },
];

// Define emits
const emit = defineEmits(["add-module"]);

// Function to add a module
const addModule = (type) => {
  const content = generateDefaultContent(type);
  emit("add-module", {
    id: uuidv4(),
    type,
    content,
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
</style>

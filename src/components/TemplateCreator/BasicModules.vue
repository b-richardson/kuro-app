<template>
  <div class="module-category">
    <h3 class="category-title">Basic Content</h3>

    <div class="module-grid">
      <ModuleCard
        v-for="module in basicModules"
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
import { generateDefaultContent, getModuleIcon } from "@/utils/pluginTemplates";
import { v4 as uuidv4 } from "uuid";
import { TemplateModule } from "@/types/TemplateModule";

// Define props
const props = defineProps({
  showDescriptions: {
    type: Boolean,
    default: true,
  },
});

// Define basic modules with their priorities
// Note: All basic modules are high priority according to the directive
const basicModules = [
  {
    type: "header",
    title: "Header",
    description: "Add a heading to structure your template",
    priority: "high",
  },
  {
    type: "text",
    title: "Text Block",
    description: "Add paragraphs of text to your template",
    priority: "high",
  },
  {
    type: "checklist",
    title: "Checklist",
    description: "Create a list of tasks or items",
    priority: "high",
  },
  {
    type: "table",
    title: "Table",
    description: "Organize information in rows and columns",
    priority: "high",
  },
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

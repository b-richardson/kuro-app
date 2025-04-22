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
import ModuleCard from "./ModuleCard.vue";
import type { ModuleType } from "@/types/TemplateModule";
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

// Define basic modules with their priorities
const basicModules: {
  type: ModuleType;
  title: string;
  description: string;
}[] = [
  {
    type: "header",
    title: "Header",
    description: "Add a heading to structure your template",
  },
  {
    type: "text",
    title: "Text Block",
    description: "Add paragraphs of text to your template",
  },
  {
    type: "checklist",
    title: "Checklist",
    description: "Create a list of tasks or items",
  },
  {
    type: "table",
    title: "Table",
    description: "Organize information in rows and columns",
  },
  {
    type: "divider",
    title: "Divider",
    description: "Add a horizontal line to separate content",
  },
  {
    type: "codeBlock",
    title: "Code Block",
    description: "Insert a block of code with syntax highlighting",
  },
];

// Define emits
const emit = defineEmits(["add-module"]);

// Function to add a module
const addModule = (type: ModuleType) => {
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

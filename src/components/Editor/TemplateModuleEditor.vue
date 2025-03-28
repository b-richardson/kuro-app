<template>
  <component
    :is="moduleComponent"
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateModuleContent"
    @update="$emit('update', $event)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TemplateModule } from "@/types/TemplateModule";

// Import module components
import HeaderModule from "@/components/TemplateCreator/modules/content/HeaderModule.vue";
import ChecklistModule from "@/components/TemplateCreator/modules/content/ChecklistModule.vue";
import TableModule from "@/components/TemplateCreator/modules/content/TableModule.vue";
import TextModule from "@/components/TemplateCreator/modules/content/TextModule.vue";
import YamlModule from "@/components/TemplateCreator/modules/plugins/yaml/YamlModule.vue";
import TemplaterModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterModule.vue";
import DataviewModule from "@/components/TemplateCreator/modules/plugins/dataview/DataviewModule.vue";
import KanbanModule from "@/components/TemplateCreator/modules/plugins/kanban/KanbanModule.vue";
import InlineDataviewFieldsModule from "@/components/TemplateCreator/modules/plugins/dataview/InlineDataviewFieldsModule.vue";

// Define props
const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// Determine which module component to use based on module type
const moduleComponent = computed(() => {
  switch (props.module.type) {
    case "header":
      return HeaderModule;
    case "checklist":
      return ChecklistModule;
    case "table":
      return TableModule;
    case "text":
      return TextModule;
    case "yaml":
      return YamlModule;
    case "templaterField":
      return TemplaterModule;
    case "dataviewQuery":
      return DataviewModule;
    case "dataviewFields":
      return InlineDataviewFieldsModule;
    case "kanban":
      return KanbanModule;
    default:
      // Default to TextModule if type is not recognized
      return TextModule;
  }
});

// Update module content - used by all module components
const updateModuleContent = (newContent: string[]) => {
  emit("update:content", newContent);
};
</script>

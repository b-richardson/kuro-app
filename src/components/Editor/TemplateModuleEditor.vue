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
import DividerModule from "@/components/TemplateCreator/modules/content/DividerModule.vue";
import YamlModule from "@/components/TemplateCreator/modules/plugins/yaml/YamlModule.vue";
// Templater modules
import TemplaterModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterModule.vue";
import TemplaterDateAndTimeModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterDateAndTimeModule.vue";
import TemplaterFilePropertyModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterFilePropertyModule.vue";
import TemplaterUserInputModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterUserInputModule.vue";
import TemplaterConditionalContentModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterConditionalContentModule.vue";
import TemplaterValueTransformationModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterValueTransformationModule.vue";
import TemplaterTemplateVariablesModule from "@/components/TemplateCreator/modules/plugins/templater/TemplaterTemplateVariablesModule.vue";
// Dataview modules
import DataviewListQueryModule from "@/components/TemplateCreator/modules/plugins/dataview/DataviewListQueryModule.vue";
import DataviewTableQueryModule from "@/components/TemplateCreator/modules/plugins/dataview/DataviewTableQueryModule.vue";
import DataviewTaskQueryModule from "@/components/TemplateCreator/modules/plugins/dataview/DataviewTaskQueryModule.vue";
import DataviewCalendarQueryModule from "@/components/TemplateCreator/modules/plugins/dataview/DataviewCalendarQueryModule.vue";
import DataviewInlineFieldsModule from "@/components/TemplateCreator/modules/plugins/dataview/DataviewInlineFieldsModule.vue";

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
    case "divider":
      return DividerModule;
    case "yaml":
      return YamlModule;
    // Templater modules
    case "templaterField":
      return TemplaterModule;
    case "templaterDateAndTime":
      return TemplaterDateAndTimeModule;
    case "templaterFileProperty":
      return TemplaterFilePropertyModule;
    case "templaterUserInput":
      return TemplaterUserInputModule;
    case "templaterConditionalContent":
      return TemplaterConditionalContentModule;
    case "templaterValueTransformation":
      return TemplaterValueTransformationModule;
    case "templaterTemplateVariables":
      return TemplaterTemplateVariablesModule;
    // Dataview modules
    case "dataviewListQuery":
      return DataviewListQueryModule;
    case "dataviewTableQuery":
      return DataviewTableQueryModule;
    case "dataviewTaskQuery":
      return DataviewTaskQueryModule;
    case "dataviewCalendarQuery":
      return DataviewCalendarQueryModule;
    case "dataviewInlineFields":
      return DataviewInlineFieldsModule;

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

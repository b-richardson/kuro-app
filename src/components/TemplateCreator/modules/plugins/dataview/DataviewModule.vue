<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    ref="baseModuleRef"
  >
    <DataviewQueryBuilder
      :content="module.content"
      @update:content="updateDataviewContent"
      @focus="setEditing(true)"
      @blur="setEditing(false)"
      :auto-focus="autoFocus"
    />
  </BaseModule>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import DataviewQueryBuilder from "@/components/TemplateCreator/DataviewQueryBuilder.vue";
import { TemplateModule } from "@/types/TemplateModule";

const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// Reference to the base module component
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

// Update content
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

const updateDataviewContent = (content: string[]) => {
  emit("update:content", content);
};
</script>

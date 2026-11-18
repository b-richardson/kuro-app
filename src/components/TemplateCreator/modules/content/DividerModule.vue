<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event as any)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    @add-line="handleAddLine"
    ref="baseModuleRef"
  >
    <div class="divider-editor">
      <!-- Module Header -->
      <div class="divider-editor__header">
        <div class="divider-editor__header-icon">
          <i class="fas fa-grip-lines"></i>
        </div>
        <div class="divider-editor__header-title">Divider</div>
      </div>

      <!-- Divider Preview -->
      <div class="divider-editor__preview">
        <div class="divider-editor__visual">
          <i class="fas fa-minus divider-editor__icon"></i>
          <hr class="divider-editor__line" />
        </div>
        <div class="divider-editor__label">
          <i class="fas fa-info-circle"></i>
          <span>Inserts a horizontal rule (---) in your document</span>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
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

// Ensure content is always "---"
const updateContent = (content: string[]) => {
  emit("update:content", ["---"]);
};

// No-op for add line - dividers should always be a single line
const handleAddLine = () => {
  // Do nothing - prevents adding additional lines
};

// Initialize with correct content
onMounted(() => {
  emit("update:content", ["---"]);
});
</script>

<style>
/* These styles are non-scoped to ensure they apply properly */
.template-module-editor--divider .template-module-editor-action[title="Add line"] {
  display: none !important;
}
</style>

<style scoped>
.divider-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.divider-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.divider-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.divider-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Preview section */
.divider-editor__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.divider-editor__visual {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.divider-editor__icon {
  position: absolute;
  color: var(--color-text-muted);
  background-color: rgba(30, 30, 46, 0.9);
  padding: 8px;
  border-radius: 50%;
  font-size: 12px;
  z-index: 1;
}

.divider-editor__line {
  width: 100%;
  border: none;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-surface),
    transparent
  );
  margin: 0;
}

.divider-editor__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.divider-editor__label i {
  color: var(--color-primary);
  opacity: 0.7;
}

/* Selected state */
:deep(.template-module-editor--selected) .divider-editor__line {
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-primary),
    transparent
  );
}

:deep(.template-module-editor--selected) .divider-editor__icon {
  color: var(--color-primary);
}
</style>
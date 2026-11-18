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
    ref="baseModuleRef"
  >
    <div class="header-editor">
      <!-- Module Header -->
      <div class="header-editor__header">
        <div class="header-editor__header-icon">
          <i class="fas fa-heading"></i>
        </div>
        <div class="header-editor__header-title">Header</div>
      </div>

      <!-- Single Header Item -->
      <div class="header-editor__items">
        <div class="header-editor__item">
          <div class="header-editor__item-inputs">
            <select
              class="header-editor__level-select"
              :value="getHeaderLevel(module.content[0])"
              @input="
                updateHeaderLevel(($event.target as HTMLSelectElement).value)
              "
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              ref="headerLevelInput"
            >
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
            </select>

            <input
              type="text"
              class="header-editor__text-input"
              :value="getHeaderText(module.content[0])"
              @input="
                updateHeaderText(($event.target as HTMLInputElement).value)
              "
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              placeholder="Header text"
            />
          </div>
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

// Reference to the base module component and header level input
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const headerLevelInput = ref<HTMLElement | null>(null);

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

const setInputRef = (el: HTMLElement) => {
  baseModuleRef.value?.setInputRef(el);
};

// Update content in parent component
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Header-specific methods
const getHeaderLevel = (line: string): string => {
  const match = line.match(/^(#+)\s/);
  return match ? match[1].length.toString() : "1";
};

const getHeaderText = (line: string): string => {
  return line.replace(/^#+\s/, "");
};

const updateHeaderLevel = (level: string) => {
  const headerText = getHeaderText(props.module.content[0]);
  const newHeader = "#".repeat(parseInt(level)) + " " + headerText;
  emit("update:content", [newHeader]);
};

const updateHeaderText = (text: string) => {
  const level = getHeaderLevel(props.module.content[0]);
  const newHeader = "#".repeat(parseInt(level)) + " " + text;
  emit("update:content", [newHeader]);
};

// Initialize with default content if empty
onMounted(() => {
  if (!props.module.content[0] || props.module.content[0] === "") {
    emit("update:content", ["# New Header"]);
  }

  if (props.autoFocus && headerLevelInput.value) {
    setInputRef(headerLevelInput.value);
  }
});
</script>

<style scoped>
.header-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.header-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.header-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Header items */
.header-editor__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-editor__item {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.header-editor__item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.header-editor__item-inputs {
  display: flex;
  flex: 1;
  gap: 8px;
}

.header-editor__level-select {
  width: 70px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.header-editor__level-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.header-editor__text-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s;
}

.header-editor__text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}

/* Responsive styles */
@media (max-width: 768px) {
  .header-editor__item {
    flex-direction: column;
  }

  .header-editor__item-inputs {
    width: 100%;
  }
}
</style>

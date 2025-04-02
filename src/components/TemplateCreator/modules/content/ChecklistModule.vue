<template>
  <!-- 
  IMPORTANT NOTE FOR DEVELOPERS:
  - This component outputs standard markdown checkboxes (- [ ] and - [x])
  - Item format is "- [ ] [emoji] Text" or "- [x] [emoji] Text" for checked items
  - All emoji and text editing is done through the UI, but stored as raw markdown
  -->
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
    @add-line="addNewItem"
    ref="baseModuleRef"
  >
    <div class="checklist-editor">
      <!-- Module Header -->
      <div class="checklist-editor__header">
        <div class="checklist-editor__header-icon">
          <i class="fas fa-check-square"></i>
        </div>
        <div class="checklist-editor__header-title">Checklist</div>
      </div>

      <!-- Checklist Items -->
      <div class="checklist-editor__items">
        <div 
          v-for="(line, idx) in module.content" 
          :key="idx"
          class="checklist-editor__item"
          :class="{'checklist-editor__item--checked': isCheckboxChecked(line)}"
        >
          <div class="checklist-editor__item-checkbox">
            <input
              type="checkbox"
              :checked="isCheckboxChecked(line)"
              @change="toggleCheckbox(idx)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
            />
          </div>
          
          <div class="checklist-editor__item-emoji" @click="openEmojiPicker(idx)">
            <span v-if="getItemEmoji(line)">{{ getItemEmoji(line) }}</span>
            <span v-else class="checklist-editor__item-emoji-placeholder">
              <i class="far fa-smile"></i>
            </span>
          </div>
          
          <input
            type="text"
            class="checklist-editor__item-input"
            :value="getItemText(line)"
            @input="updateItemText(idx, $event.target.value)"
            @focus="setEditing(true)"
            @blur="setEditing(false)"
            placeholder="Checklist item"
            :ref="(el) => { if (idx === 0 && autoFocus) setInputRef(el); }"
          />
          
          <div class="checklist-editor__item-actions">
            <button 
              class="checklist-editor__item-move-btn"
              @click="moveItem(idx, 'up')"
              :disabled="idx === 0"
              title="Move up"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
            
            <button 
              class="checklist-editor__item-move-btn"
              @click="moveItem(idx, 'down')"
              :disabled="idx === module.content.length - 1"
              title="Move down"
            >
              <i class="fas fa-arrow-down"></i>
            </button>
            
            <button
              v-if="module.content.length > 1"
              class="checklist-editor__item-delete-btn"
              title="Delete item"
              @click.stop="deleteItem(idx)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Add Item Button -->
      <div class="checklist-editor__add-section">
        <button class="checklist-editor__add-btn" @click="addNewItem">
          <i class="fas fa-plus"></i>
          <span>Add Item</span>
        </button>
      </div>
      
      <!-- Emoji Picker -->
      <Teleport to="body">
        <div v-if="showEmojiPicker" class="checklist-editor__emoji-picker-container">
          <div class="checklist-editor__emoji-picker-backdrop" @click="closeEmojiPicker"></div>
          <div class="checklist-editor__emoji-picker">
            <div class="checklist-editor__emoji-picker-header">
              <div class="checklist-editor__emoji-picker-title">
                <i class="far fa-smile"></i>
                <span>Select Emoji</span>
              </div>
              <button 
                class="checklist-editor__emoji-picker-close" 
                @click="closeEmojiPicker"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <EmojiPicker 
              @select="onEmojiSelect"
              :native="true"
            />
            
            <div class="checklist-editor__emoji-picker-footer">
              <button 
                class="checklist-editor__emoji-picker-clear"
                @click="selectEmoji('')"
              >
                Clear Emoji
              </button>
            </div>
          </div>
        </div>
      </Teleport>
      
      <!-- User Tips -->
      <div class="checklist-editor__tips">
        <div class="checklist-editor__tips-header">
          <i class="fas fa-lightbulb"></i>
          <span>Tips</span>
        </div>
        <div class="checklist-editor__tips-content">
          <p>
            Click the emoji icon to add visual context to your checklist items.
            Use the arrow buttons to reorder your checklist items.
          </p>
        </div>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { addNewContentLine, deleteContentLine, updateContentLine } from "@/components/TemplateCreator/modules/core/moduleUtils";
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

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

// Emoji picker state
const showEmojiPicker = ref(false);
const activeItemIndex = ref(0);

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

// Checklist-specific methods
const isCheckboxChecked = (line: string): boolean => {
  return line.includes("- [x]");
};

// Get emoji from checklist line (if any)
const getItemEmoji = (line: string): string => {
  // Match an emoji after the checkbox syntax
  const match = line.replace(/^- \[([ x])\]\s/, "").match(/^([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\u200d]+)\s/u);
  return match ? match[1] : '';
};

// Get text from checklist line (without checkbox and emoji)
const getItemText = (line: string): string => {
  // Remove checkbox syntax and any leading emoji
  return line.replace(/^- \[([ x])\]\s/, "")
    .replace(/^([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\u200d]+)\s/u, "");
};

// Toggle checkbox state
const toggleCheckbox = (index: number) => {
  const emoji = getItemEmoji(props.module.content[index]);
  const text = getItemText(props.module.content[index]);
  const isChecked = isCheckboxChecked(props.module.content[index]);
  
  // Construct new line with proper checkbox state
  const prefix = isChecked ? "- [ ] " : "- [x] ";
  const emojiPart = emoji ? `${emoji} ` : '';
  const newLine = `${prefix}${emojiPart}${text}`;
  
  const newContent = updateContentLine(props.module.content, index, newLine);
  emit("update:content", newContent);
};

// Update text of a checklist item
const updateItemText = (index: number, text: string) => {
  const isChecked = isCheckboxChecked(props.module.content[index]);
  const emoji = getItemEmoji(props.module.content[index]);
  
  // Construct new line preserving checkbox state and emoji
  const prefix = isChecked ? "- [x] " : "- [ ] ";
  const emojiPart = emoji ? `${emoji} ` : '';
  const newLine = `${prefix}${emojiPart}${text}`;
  
  const newContent = updateContentLine(props.module.content, index, newLine);
  emit("update:content", newContent);
};

// Add emoji to checklist item
const updateItemEmoji = (index: number, emoji: string) => {
  const isChecked = isCheckboxChecked(props.module.content[index]);
  const text = getItemText(props.module.content[index]);
  
  // Construct new line with updated emoji
  const prefix = isChecked ? "- [x] " : "- [ ] ";
  const emojiPart = emoji ? `${emoji} ` : '';
  const newLine = `${prefix}${emojiPart}${text}`;
  
  const newContent = updateContentLine(props.module.content, index, newLine);
  emit("update:content", newContent);
};

// Emoji picker methods
const openEmojiPicker = (index: number) => {
  activeItemIndex.value = index;
  showEmojiPicker.value = true;
};

const closeEmojiPicker = () => {
  showEmojiPicker.value = false;
};

// Handle keyboard events for emoji picker
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showEmojiPicker.value) {
    closeEmojiPicker();
  }
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

const selectEmoji = (emoji: string) => {
  updateItemEmoji(activeItemIndex.value, emoji);
  closeEmojiPicker();
};

const onEmojiSelect = (emoji: any) => {
  if (emoji && emoji.i) {
    selectEmoji(emoji.i);
  }
};

// Item management
const addNewItem = () => {
  const newContent = addNewContentLine(props.module.content, "checklist");
  emit("update:content", newContent);
};

// Initialize with default content if empty
onMounted(() => {
  // If module was just created with empty content from pluginTemplatesUtils, add a default item
  if (props.module.content.length === 1 && props.module.content[0] === "") {
    emit("update:content", ["- [ ] New item"]);
  }
});

const deleteItem = (index: number) => {
  if (props.module.content.length <= 1) {
    baseModuleRef.value?.displayToast("Cannot delete the last item", "error");
    return;
  }
  
  const newContent = deleteContentLine(props.module.content, index);
  emit("update:content", newContent);
};

// Move items up or down
const moveItem = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index === 0) return;
  if (direction === 'down' && index === props.module.content.length - 1) return;
  
  const newContent = [...props.module.content];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  
  // Swap items
  [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
  
  emit("update:content", newContent);
};
</script>

<style scoped>
.checklist-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.checklist-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.checklist-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.checklist-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Checklist items */
.checklist-editor__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-editor__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.checklist-editor__item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.checklist-editor__item--checked {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.05);
}

.checklist-editor__item--checked .checklist-editor__item-input {
  text-decoration: line-through;
  opacity: 0.7;
}

.checklist-editor__item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.checklist-editor__item-checkbox input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.checklist-editor__item-checkbox input[type="checkbox"]:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checklist-editor__item-checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.checklist-editor__item-emoji {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
}

.checklist-editor__item-emoji:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.checklist-editor__item-emoji-placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.checklist-editor__item-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s;
}

.checklist-editor__item-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}

.checklist-editor__item-actions {
  display: flex;
  gap: 6px;
}

.checklist-editor__item-move-btn,
.checklist-editor__item-delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.checklist-editor__item-move-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.checklist-editor__item-move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.checklist-editor__item-delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Add button */
.checklist-editor__add-section {
  margin-top: 8px;
}

.checklist-editor__add-btn {
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.3);
  border-radius: 8px;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.checklist-editor__add-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  transform: translateY(-2px);
}

/* Emoji picker */
.checklist-editor__emoji-picker-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checklist-editor__emoji-picker-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.checklist-editor__emoji-picker {
  position: relative;
  width: 350px;
  background: rgba(25, 25, 35, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 100;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.2s;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.checklist-editor__emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.checklist-editor__emoji-picker-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--color-text);
}

.checklist-editor__emoji-picker-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.checklist-editor__emoji-picker-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.checklist-editor__emoji-picker-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.checklist-editor__emoji-picker-clear {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.checklist-editor__emoji-picker-clear:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

/* Customize the embedded emoji picker */
:deep(.v3-emoji-picker) {
  background: transparent !important;
  border: none !important;
  max-height: 350px;
  overflow-y: auto;
}

:deep(.v3-emoji-picker-category-title) {
  color: var(--color-text) !important;
}

:deep(.v3-emoji-picker-search) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: var(--color-text) !important;
}

:deep(.v3-emoji-picker-search::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.v3-emoji-picker-emoji:hover) {
  background-color: rgba(var(--color-primary-rgb), 0.2) !important;
}

/* Tips section */
.checklist-editor__tips {
  margin-top: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.checklist-editor__tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.checklist-editor__tips-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .checklist-editor__emoji-picker {
    width: 90%;
    max-width: 350px;
  }
  
  .checklist-editor__item {
    flex-wrap: wrap;
  }
  
  .checklist-editor__item-input {
    flex-basis: 100%;
    order: 3;
    margin-top: 8px;
  }
  
  .checklist-editor__item-actions {
    margin-left: auto;
  }
  
  :deep(.v3-emoji-picker) {
    max-height: 250px;
  }
}
</style>
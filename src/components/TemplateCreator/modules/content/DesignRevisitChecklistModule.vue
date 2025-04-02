<template>
  <!-- 
    SIMPLIFIED CHECKLIST MODULE
    - Focused on visual interaction over verbal instruction
    - Minimal cognitive load
    - Intuitive adjustments without overwhelm
    - Real-time visual results
    -->
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
    <div class="checklist-editor" :class="{ 'is-empty': isEmpty }">
      <!-- Empty State (shows only when empty) -->
      <div v-if="isEmpty" class="checklist-empty-state" @click="addNewItem">
        <div class="checklist-empty-icon">
          <i class="fas fa-check-square"></i>
        </div>
        <div class="checklist-empty-text">Click to add checklist items</div>
      </div>

      <!-- Active State (shows when items exist) -->
      <div v-else class="checklist-content">
        <!-- Checklist Items -->
        <div class="checklist-items" ref="itemsContainer">
          <TransitionGroup name="checklist-transition">
            <div
              v-for="(item, idx) in checklistItems"
              :key="idx"
              class="checklist-item"
              :class="{ 'is-checked': item.checked }"
            >
              <!-- Drag Handle (appears on hover) -->
              <div class="checklist-drag-handle">
                <i class="fas fa-grip-lines"></i>
              </div>

              <!-- Checkbox -->
              <div class="checklist-checkbox" @click="toggleItem(idx)">
                <div class="checkbox-visual"></div>
              </div>

              <!-- Emoji (optional) -->
              <div
                class="checklist-emoji"
                :class="{ 'has-emoji': item.emoji }"
                @click="openEmojiSelector(idx)"
              >
                <span v-if="item.emoji">{{ item.emoji }}</span>
                <i v-else class="far fa-smile"></i>
              </div>

              <!-- Text Input -->
              <input
                type="text"
                class="checklist-text"
                v-model="item.text"
                @input="updateItem(idx)"
                @focus="handleFocus(idx)"
                @blur="handleBlur()"
                @keydown.enter="addItemAfter(idx)"
                @keydown.backspace="handleBackspace($event, idx)"
                :placeholder="
                  idx === 0 ? 'Enter first checklist item' : 'Add item'
                "
                :ref="
                  (el) => {
                    if (idx === 0 && autoFocus) setFocusRef(el);
                  }
                "
              />

              <!-- Remove Button (appears on hover) -->
              <button
                v-if="checklistItems.length > 1"
                class="checklist-remove"
                @click="removeItem(idx)"
                aria-label="Remove item"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </TransitionGroup>
        </div>

        <!-- Add New Item Button -->
        <button class="checklist-add-button" @click="addNewItem">
          <i class="fas fa-plus"></i>
          <span>Add Item</span>
        </button>
      </div>

      <!-- Emoji Selector (appears when needed) -->
      <Teleport to="body">
        <transition name="fade">
          <div
            v-if="showEmojiSelector"
            class="emoji-selector-overlay"
            @click.self="closeEmojiSelector"
          >
            <div class="emoji-selector">
              <div class="emoji-selector-header">
                <span>Choose an emoji</span>
                <button @click="clearEmoji" class="emoji-clear-button">
                  Clear
                </button>
              </div>

              <div class="emoji-grid">
                <button
                  v-for="emoji in commonEmojis"
                  :key="emoji"
                  class="emoji-option"
                  @click="selectEmoji(emoji)"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
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

// Refs
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const itemsContainer = ref<HTMLElement | null>(null);
const activeEmojiIndex = ref<number>(-1);
const showEmojiSelector = ref<boolean>(false);

// Common emojis for quick selection (simplified from full picker)
const commonEmojis = [
  "✅",
  "❌",
  "⭐",
  "🔥",
  "⚡",
  "🎯",
  "📌",
  "📝",
  "📚",
  "💡",
  "🔍",
  "🏆",
  "🎉",
  "👍",
  "🙌",
  "❤️",
  "🔄",
  "⏰",
  "📅",
  "🚀",
];

// Parse markdown checklist items into structured data
const checklistItems = computed(() => {
  if (!props.module.content || props.module.content.length === 0) {
    return [];
  }

  return props.module.content.map((line) => {
    // Check if the item is checked
    const isChecked = line.includes("- [x]");

    // Extract emoji if present
    const cleanLine = line.replace(/^- \[([ x])\]\s/, "");
    const emojiMatch = cleanLine.match(
      /^([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\u200d]+)\s/u
    );
    const emoji = emojiMatch ? emojiMatch[1] : "";

    // Extract text content
    const text = cleanLine.replace(
      /^([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\u200d]+)\s/u,
      ""
    );

    return {
      checked: isChecked,
      emoji,
      text,
    };
  });
});

// Calculate if the checklist is empty
const isEmpty = computed(() => {
  return (
    !props.module.content ||
    props.module.content.length === 0 ||
    (props.module.content.length === 1 && props.module.content[0] === "")
  );
});

// Convert structured data back to markdown
const updateContent = () => {
  const content = checklistItems.value.map((item) => {
    const checkmark = item.checked ? "x" : " ";
    const emojiPart = item.emoji ? `${item.emoji} ` : "";
    return `- [${checkmark}] ${emojiPart}${item.text}`;
  });

  emit("update:content", content);
};

// Initialize with empty content if needed
onMounted(() => {
  if (isEmpty.value) {
    // Don't automatically add an item - wait for user interaction
    // This follows the "make it visual" principle
  }
});

// Item management functions
const addNewItem = () => {
  // If it's the first item, emit an initial item
  if (isEmpty.value) {
    emit("update:content", ["- [ ] New item"]);
    // Focus will happen automatically due to autoFocus prop
    return;
  }

  // Otherwise add to the existing items
  const newContent = [...props.module.content, "- [ ] "];
  emit("update:content", newContent);

  // Focus the new item after render
  nextTick(() => {
    const inputs = itemsContainer.value?.querySelectorAll(
      "input.checklist-text"
    );
    if (inputs && inputs.length > 0) {
      (inputs[inputs.length - 1] as HTMLInputElement).focus();
    }
  });
};

const addItemAfter = (index: number) => {
  const newContent = [...props.module.content];
  newContent.splice(index + 1, 0, "- [ ] ");
  emit("update:content", newContent);

  // Focus the new item after render
  nextTick(() => {
    const inputs = itemsContainer.value?.querySelectorAll(
      "input.checklist-text"
    );
    if (inputs && inputs.length > index + 1) {
      (inputs[index + 1] as HTMLInputElement).focus();
    }
  });
};

const removeItem = (index: number) => {
  // Only allow removal if there's more than one item
  if (props.module.content.length <= 1) {
    return;
  }

  const newContent = [...props.module.content];
  newContent.splice(index, 1);
  emit("update:content", newContent);
};

const toggleItem = (index: number) => {
  const items = [...checklistItems.value];
  items[index].checked = !items[index].checked;

  // Convert back to markdown and update
  const newContent = items.map((item) => {
    const checkmark = item.checked ? "x" : " ";
    const emojiPart = item.emoji ? `${item.emoji} ` : "";
    return `- [${checkmark}] ${emojiPart}${item.text}`;
  });

  emit("update:content", newContent);
};

const updateItem = (index: number) => {
  const items = [...checklistItems.value];

  // Convert back to markdown and update
  const newContent = items.map((item, idx) => {
    const checkmark = item.checked ? "x" : " ";
    const emojiPart = item.emoji ? `${item.emoji} ` : "";
    return `- [${checkmark}] ${emojiPart}${item.text}`;
  });

  emit("update:content", newContent);
};

// Handle backspace on empty items (delete them)
const handleBackspace = (event: KeyboardEvent, index: number) => {
  if (
    checklistItems.value[index].text === "" &&
    props.module.content.length > 1
  ) {
    // If the item is empty and there are multiple items, prevent default and remove the item
    event.preventDefault();
    removeItem(index);

    // Focus the previous item if exists
    nextTick(() => {
      const inputs = itemsContainer.value?.querySelectorAll(
        "input.checklist-text"
      );
      const targetIndex = Math.max(0, index - 1);
      if (inputs && inputs.length > targetIndex) {
        const input = inputs[targetIndex] as HTMLInputElement;
        input.focus();
        // Place cursor at the end of text
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    });
  }
};

// Focus management
const handleFocus = (index: number) => {
  if (baseModuleRef.value) {
    baseModuleRef.value.setEditing(true);
  }
};

const handleBlur = () => {
  if (baseModuleRef.value) {
    baseModuleRef.value.setEditing(false);
  }
};

const setFocusRef = (el: HTMLInputElement) => {
  if (baseModuleRef.value && el) {
    baseModuleRef.value.setInputRef(el);
  }
};

// Emoji selector functions
const openEmojiSelector = (index: number) => {
  activeEmojiIndex.value = index;
  showEmojiSelector.value = true;
};

const closeEmojiSelector = () => {
  showEmojiSelector.value = false;
};

const selectEmoji = (emoji: string) => {
  if (activeEmojiIndex.value >= 0) {
    const items = [...checklistItems.value];
    items[activeEmojiIndex.value].emoji = emoji;

    // Convert back to markdown and update
    const newContent = items.map((item) => {
      const checkmark = item.checked ? "x" : " ";
      const emojiPart = item.emoji ? `${item.emoji} ` : "";
      return `- [${checkmark}] ${emojiPart}${item.text}`;
    });

    emit("update:content", newContent);
    closeEmojiSelector();
  }
};

const clearEmoji = () => {
  selectEmoji("");
};
</script>

<style scoped>
.checklist-editor {
  width: 100%;
  color: var(--color-text);
  min-height: 50px; /* Minimum height for empty state */
}

/* Empty state styling */
.checklist-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checklist-empty-state:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.checklist-empty-icon {
  font-size: 24px;
  color: var(--color-primary);
  margin-bottom: 12px;
  opacity: 0.7;
}

.checklist-empty-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
}

/* Active checklist styling */
.checklist-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px; /* Prevents excessive vertical growth */
  overflow-y: auto; /* Scrollable if too many items */
  padding-right: 4px; /* Space for scrollbar */
}

.checklist-transition-move {
  transition: transform 0.3s ease;
}

.checklist-transition-enter-active,
.checklist-transition-leave-active {
  transition: all 0.3s ease;
}

.checklist-transition-enter-from,
.checklist-transition-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.checklist-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  min-height: 40px;
}

.checklist-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Drag handle - appears on hover */
.checklist-drag-handle {
  width: 16px;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.checklist-item:hover .checklist-drag-handle {
  opacity: 1;
}

/* Checkbox styling */
.checklist-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-visual {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checklist-item.is-checked .checkbox-visual {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checklist-item.is-checked .checkbox-visual::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checklist-item.is-checked .checklist-text {
  text-decoration: line-through;
  opacity: 0.6;
}

/* Emoji styling */
.checklist-emoji {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
}

.checklist-emoji.has-emoji {
  color: inherit;
}

.checklist-emoji:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* Text input styling */
.checklist-text {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 14px;
  padding: 0;
  min-width: 10px;
}

.checklist-text:focus {
  outline: none;
}

.checklist-text::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* Remove button - appears on hover */
.checklist-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  margin-left: 8px;
  border-radius: 4px;
}

.checklist-item:hover .checklist-remove {
  opacity: 1;
}

.checklist-remove:hover {
  background: rgba(239, 68, 68, 0.15);
  color: rgba(239, 68, 68, 0.8);
}

/* Add button styling */
.checklist-add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(var(--color-primary-rgb), 0.08);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.2);
  border-radius: 8px;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.checklist-add-button:hover {
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

/* Emoji selector styling */
.emoji-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.emoji-selector {
  width: 300px;
  background: rgba(30, 30, 40, 0.95);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.emoji-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
}

.emoji-clear-button {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.emoji-clear-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 12px;
  gap: 10px;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.emoji-option:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Fade transition for emoji selector */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .checklist-items {
    max-height: 300px;
  }

  .emoji-selector {
    width: 280px;
  }

  .emoji-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

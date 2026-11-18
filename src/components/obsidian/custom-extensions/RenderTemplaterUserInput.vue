<template>
  <node-view-wrapper class="templater-user-input-wrapper">
    <span
      class="templater-user-input-display"
      :class="`templater-user-input-${inputTypeClass}`"
    >
      <!-- Variable name display -->
      <span
        v-if="node.attrs.variableName"
        class="templater-user-input-variable"
      >
        {{ node.attrs.variableName }}:
      </span>

      <!-- Input display with icon based on type -->
      <span class="templater-user-input-content">
        <span class="templater-user-input-icon">
          <i :class="inputTypeIcon"></i>
        </span>
        <span class="templater-user-input-prompt">{{
          node.attrs.promptText
        }}</span>
      </span>

      <!-- Optional placeholder for default values -->
      <span v-if="defaultValue" class="templater-user-input-default">
        [{{ defaultValue }}]
      </span>
    </span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/vue-3";

const props = defineProps<NodeViewProps>();

// Extract any default value from the original code
const defaultValue = computed(() => {
  const code = props.node.attrs.originalCode || "";

  // Extract default value from prompt
  const defaultMatch = code.match(/prompt\(["'][^"']+["'],\s*["']([^"']+)["']/);
  if (defaultMatch) return defaultMatch[1];

  // For multiline text, check for backtick-wrapped default
  const multilineMatch = code.match(/prompt\(["'][^"']+["'],\s*`([^`]+)`/);
  if (multilineMatch) return "Text...";

  // For select inputs, try to find the default selection
  if (
    code.includes("tp.system.suggester") ||
    code.includes("tp.system.toggle")
  ) {
    // For toggle, check for default index
    const indexMatch = code.match(/toggle\([^,]+,[^,]+,\s*(\d+)/);
    if (indexMatch) {
      const idx = parseInt(indexMatch[1]);
      // Try to extract the options array
      const optionsMatch = code.match(/\[\s*((?:"[^"]+",?\s*)+)\]/);
      if (optionsMatch) {
        const options = optionsMatch[1].match(/"([^"]+)"/g);
        if (options && idx < options.length) {
          return options[idx].replace(/"/g, "");
        }
      }
    }

    // For dropdown, just indicate selection is needed
    return "Select...";
  }

  return "";
});

// Determine the input type icon
const inputTypeIcon = computed(() => {
  const type = props.node.attrs.inputType || "text";

  switch (type) {
    case "text":
      return "fas fa-font";
    case "multiline":
      return "fas fa-align-left";
    case "select-dropdown":
      return "fas fa-caret-down";
    case "select-radio":
      return "fas fa-list-ul";
    default:
      return "fas fa-keyboard";
  }
});

// CSS class based on input type
const inputTypeClass = computed(() => {
  const type = props.node.attrs.inputType || "text";

  switch (type) {
    case "text":
      return "text";
    case "multiline":
      return "multiline";
    case "select-dropdown":
    case "select-radio":
      return "select";
    default:
      return "text";
  }
});

onMounted(() => {
  console.log("Templater user input mounted:", {
    attrs: props.node.attrs,
    defaultValue: defaultValue.value,
  });
});
</script>

<style>
.templater-user-input-wrapper {
  display: inline;
}

.templater-user-input-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  background-color: rgba(255, 213, 79, 0.15);
  color: var(--obsidian-templater-user-input-color, #ffd54f);
  border: 1px dashed var(--obsidian-templater-user-input-border, #ffd54f);
}

/* Specific styling based on input type */
.templater-user-input-text {
  background-color: rgba(255, 213, 79, 0.15);
  color: var(--obsidian-templater-user-input-color, #ffd54f);
  border-color: var(--obsidian-templater-user-input-border, #ffd54f);
}

.templater-user-input-multiline {
  background-color: rgba(179, 157, 219, 0.15);
  color: var(--obsidian-templater-multiline-color, #b39ddb);
  border-color: var(--obsidian-templater-multiline-border, #b39ddb);
}

.templater-user-input-select {
  background-color: rgba(128, 203, 196, 0.15);
  color: var(--obsidian-templater-select-color, #80cbc4);
  border-color: var(--obsidian-templater-select-border, #80cbc4);
}

.templater-user-input-variable {
  font-weight: 500;
  margin-right: 4px;
  color: var(--text-normal, inherit);
  opacity: 0.9;
}

.templater-user-input-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.templater-user-input-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 10px;
}

.templater-user-input-prompt {
  font-style: italic;
}

.templater-user-input-default {
  font-size: 0.85em;
  opacity: 0.8;
  margin-left: 4px;
}

/* Hover effect */
.templater-user-input-display:hover {
  filter: brightness(1.1);
}

/* Dark mode support */
:global(.dark-theme) .templater-user-input-display {
  opacity: 0.9;
}

:global(.dark-theme) .templater-user-input-display:hover {
  opacity: 1;
}
</style>

<template>
  <node-view-wrapper class="templater-transform-wrapper">
    <span
      class="templater-transform-display"
      :class="`templater-transform-${transformTypeClass}`"
    >
      <!-- Variable assignment display -->
      <span v-if="node.attrs.hasVariable" class="templater-transform-variable">
        {{ node.attrs.variableName }} =
      </span>

      <!-- Transformation display -->
      <span class="templater-transform-content">
        <span class="templater-transform-icon">
          <i :class="transformIcon"></i>
        </span>

        <span class="templater-transform-description">
          {{ transformDescription }}
        </span>
      </span>

      <!-- Debug info (you can remove this in production) -->
      <span
        class="templater-transform-debug"
        style="font-size: 0.7em; opacity: 0.7"
      >
        {{ displayInfo.caseType || displayInfo.formatType }}
      </span>

      <!-- Indicator for source type -->
      <span
        v-if="node.attrs.inputSource === 'variable'"
        class="templater-transform-source-badge"
      >
        Variable
      </span>
      <span v-else class="templater-transform-source-badge"> Text </span>
    </span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/vue-3";

const props = defineProps<NodeViewProps>();

// Parse the displayInfo from the node attributes
const displayInfo = computed(() => {
  // Parse the displayInfo if it's a string
  if (typeof props.node.attrs.displayInfo === "string") {
    try {
      return JSON.parse(props.node.attrs.displayInfo);
    } catch (e) {
      console.error("Error parsing displayInfo:", e);
      return {};
    }
  }

  // If it's already an object, use it directly
  return props.node.attrs.displayInfo || {};
});

// Class for styling based on transform type
const transformTypeClass = computed(() => {
  return props.node.attrs.transformType || "textCase";
});

// Icon for the transformation type
const transformIcon = computed(() => {
  const type = props.node.attrs.transformType;

  switch (type) {
    case "textCase":
      return "fas fa-font";
    case "substitution":
      return "fas fa-exchange-alt";
    case "format":
      const formatType = displayInfo.value.formatType;
      return formatType === "date"
        ? "fas fa-calendar-alt"
        : "fas fa-percentage";
    default:
      return "fas fa-magic";
  }
});

// Description of what the transformation does
const transformDescription = computed(() => {
  const type = props.node.attrs.transformType;
  const info = displayInfo.value;

  console.log("Transform info:", {
    type,
    info,
    caseType: info.caseType,
    rawAttrs: props.node.attrs,
  });

  switch (type) {
    case "textCase":
      switch (info.caseType) {
        case "uppercase":
          return "Convert to UPPERCASE";
        case "lowercase":
          return "Convert to lowercase";
        case "titlecase":
          return "Convert to Title Case";
        case "sentencecase":
          return "Convert to Sentence case";
        case "camelcase":
          return "Convert to camelCase";
        case "kebabcase":
          return "Convert to kebab-case";
        case "snakecase":
          return "Convert to snake_case";
        default:
          return "Change text case";
      }

    case "substitution":
      return "Find and replace text";

    case "format":
      if (info.formatType === "date") {
        return "Format date";
      } else {
        return "Format number";
      }

    default:
      return "Transform value";
  }
});

onMounted(() => {
  console.log("Templater transform mounted:", {
    attrs: props.node.attrs,
    type: props.node.attrs.transformType,
    displayInfo: displayInfo.value,
    rawDisplayInfo: props.node.attrs.displayInfo,
  });
});
</script>

<style>
.templater-transform-wrapper {
  display: inline;
}

.templater-transform-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  background-color: rgba(179, 157, 219, 0.15);
  color: var(--obsidian-templater-transform-color, #b39ddb);
  border: 1px dashed var(--obsidian-templater-transform-border, #b39ddb);
}

/* Specific styling based on transform type */
.templater-transform-textCase {
  background-color: rgba(179, 157, 219, 0.15);
  color: var(--obsidian-templater-transform-color, #b39ddb);
  border-color: var(--obsidian-templater-transform-border, #b39ddb);
}

.templater-transform-substitution {
  background-color: rgba(128, 203, 196, 0.15);
  color: var(--obsidian-templater-substitution-color, #80cbc4);
  border-color: var(--obsidian-templater-substitution-border, #80cbc4);
}

.templater-transform-format {
  background-color: rgba(255, 167, 38, 0.15);
  color: var(--obsidian-templater-format-color, #ffa726);
  border-color: var(--obsidian-templater-format-border, #ffa726);
}

.templater-transform-variable {
  font-weight: 500;
  margin-right: 4px;
  color: var(--text-normal, inherit);
  opacity: 0.9;
}

.templater-transform-content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.templater-transform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
}

.templater-transform-description {
  font-style: normal;
}

.templater-transform-source-badge {
  font-size: 0.75em;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 4px;
  opacity: 0.7;
}

/* Hover effect */
.templater-transform-display:hover {
  filter: brightness(1.1);
}

/* Dark mode support */
:global(.dark-theme) .templater-transform-display {
  opacity: 0.9;
}

:global(.dark-theme) .templater-transform-display:hover {
  opacity: 1;
}
</style>

<template>
  <node-view-wrapper class="templater-file-wrapper">
    <span :class="propertyClass">{{ displayValue }}</span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/vue-3";

const props = defineProps<NodeViewProps>();
const displayValue = ref("");
const propertyClass = computed(() => {
  return isRuntimeOnly.value
    ? "templater-file-runtime"
    : "templater-file-previewable";
});
const isRuntimeOnly = ref(true);

// Map of file property types to determine if they're runtime-only or can be previewed
const runtimeOnlyProperties = [
  "tp.file.path",
  "tp.file.folder",
  "tp.file.title",
  "tp.file.creation_date",
  "tp.file.last_modified_date",
  "tp.file.cursor",
  "tp.file.selection",
  "tp.file.include",
  "tp.file.rename",
  "tp.file.move",
  "tp.file.exists",
];

const previewableProperties = [
  "tp.file.content",
  "tp.file.size",
  "tp.file.tags",
  "tp.file.etags",
  "tp.file.extension",
];

const formatFileProperty = () => {
  try {
    const originalCode =
      props.node.attrs.originalCode || "<% tp.file.path() %>";

    // Decode HTML entities if they exist
    const decodedCode = originalCode
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');

    // Extract label if present
    let label = "";
    const labelMatch = decodedCode.match(/^(.*?)<%(.*?)%>/);
    if (labelMatch && labelMatch[1].trim()) {
      label = labelMatch[1].trim();
    }

    // Extract the property type and any parameters
    const propertyMatch = decodedCode.match(/tp\.file\.([a-zA-Z_]+)(\(.*?\))?/);

    const propertyType = propertyMatch[1];
    const propertyFunction = `tp.file.${propertyType}`;

    // Check if it's a runtime-only property
    isRuntimeOnly.value = !previewableProperties.includes(propertyFunction);

    if (isRuntimeOnly.value) {
      // Handle runtime-only properties with appropriate placeholders
      switch (propertyType) {
        case "path":
          // Check if relative path is requested
          const isRelative =
            originalCode.includes("true") || originalCode.includes("relative");
          const pathDisplay = isRelative
            ? "[Relative path determined at creation ⏳]"
            : "[Path determined at creation ⏳]";
          displayValue.value = label ? `${label} ${pathDisplay}` : pathDisplay;
          break;

        case "folder":
          displayValue.value = label
            ? `${label} [Folder determined at creation ⏳]`
            : `[Folder determined at creation ⏳]`;
          break;

        case "title":
          displayValue.value = label
            ? `${label} [Filename set at creation ⏳]`
            : `[Filename set at creation ⏳]`;
          break;

        case "creation_date":
        case "last_modified_date":
          const formatParam = originalCode.match(/\(["']([^"']+)["']\)/);
          const dateType =
            propertyType === "creation_date" ? "Creation" : "Modification";
          const dateDisplay = formatParam
            ? `[${dateType} date set at creation ⏳]`
            : `[${dateType} date set at creation ⏳]`;
          displayValue.value = label ? `${label} ${dateDisplay}` : dateDisplay;
          break;

        case "cursor":
          displayValue.value = label
            ? `${label} [Cursor position at runtime ⏳]`
            : `[Cursor position at runtime ⏳]`;
          break;

        case "selection":
          displayValue.value = label
            ? `${label} [Selected text at runtime ⏳]`
            : `[Selected text at runtime ⏳]`;
          break;

        default:
          displayValue.value = label
            ? `${label} [File property set at runtime ⏳]`
            : `[File property set at runtime ⏳]`;
      }
    } else {
      // Handle previewable properties with realistic examples
      switch (propertyType) {
        case "content":
          displayValue.value = label ? `${label} 250 words` : `250 words`;
          break;

        case "size":
          displayValue.value = label ? `${label} 2.5 KB` : `2.5 KB`;
          break;

        case "tags":
        case "etags":
          displayValue.value = label
            ? `${label} #journal #daily`
            : `#journal #daily`;
          break;

        case "extension":
          displayValue.value = label ? `${label} md` : `md`;
          break;

        default:
          displayValue.value = label
            ? `${label} [Example preview]`
            : `[Example preview]`;
      }
    }
  } catch (err) {
    console.error("Error formatting templater file property:", err);
    displayValue.value = "[File property ⏳]";
  }
};

onMounted(() => {
  formatFileProperty();
});

// Watch for changes to originalCode
watch(
  () => props.node.attrs.originalCode,
  () => {
    formatFileProperty();
  }
);
</script>

<style>
.templater-file-wrapper {
  display: inline;
}

.templater-file-runtime {
  display: inline;
  color: #9ca3af;
  font-style: italic;
  background-color: rgba(156, 163, 175, 0.1);
  border-radius: 3px;
  padding: 2px 4px;
  white-space: nowrap;
  border-bottom: 1px dashed #9ca3af;
}

.templater-file-previewable {
  display: inline;
  color: #34d399;
  font-weight: 500;
  background-color: rgba(52, 211, 153, 0.1);
  border-radius: 3px;
  padding: 2px 4px;
  white-space: nowrap;
}

/* Hover effects */
.templater-file-runtime:hover {
  background-color: rgba(156, 163, 175, 0.2);
}

.templater-file-previewable:hover {
  background-color: rgba(52, 211, 153, 0.2);
}

/* Dark mode support */
:global(.dark-theme) .templater-file-runtime {
  color: #d1d5db;
  background-color: rgba(209, 213, 219, 0.1);
}

:global(.dark-theme) .templater-file-previewable {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

:global(.dark-theme) .templater-file-runtime:hover {
  background-color: rgba(209, 213, 219, 0.2);
}

:global(.dark-theme) .templater-file-previewable:hover {
  background-color: rgba(16, 185, 129, 0.2);
}
</style>

<template>
  <div class="obsidian-editor" :class="{ 'read-only': readOnly }">
    <editor-content v-if="editor" :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount, watch } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { ObsidianCallout } from "./custom-extensions/obsidianCallout";
import { ObsidianLink } from "./custom-extensions/obsidianInternalLink";
import { ObsidianDataview } from "./custom-extensions/obsidianDataview";
import { ObsidianFrontmatter } from "./custom-extensions/obsidianFrontmatter";
import { ObsidianTemplateVars } from "./custom-extensions/obsidianTemplateVars";
import { Markdown } from "tiptap-markdown";

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

// Props
const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update:content"]);

// Use shallowRef for complex objects like Editor
const editor = shallowRef<Editor | undefined>(undefined);

// Helper function to preprocess dataview blocks in a safer way
const preprocessContent = (content: string): string => {
  // This helps TipTap recognize dataview blocks better
  return content.replace(/```dataview\s+([\s\S]*?)```/g, (match, query) => {
    // Replace with explicit HTML structure
    return `<div class="dataview-block-container"><pre data-language="dataview"><code>${query.trim()}</code></pre></div>`;
  });
};

// Initialize editor on component mount
onMounted(() => {
  editor.value = new Editor({
    extensions: [
      // Add ObsidianDataview first to give it priority
      ObsidianDataview,

      // Configure StarterKit without code block
      StarterKit.configure({
        codeBlock: false,
      }),

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "obsidian-link",
        },
      }),

      Placeholder.configure({
        placeholder: "Start writing...",
      }),

      // Add CodeBlockLowlight after our custom dataview handler
      CodeBlockLowlight.configure({
        lowlight,
      }),

      ObsidianCallout,
      ObsidianLink,
      ObsidianFrontmatter,
      ObsidianTemplateVars,

      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: preprocessContent(props.content),
    editable: !props.readOnly,
    onUpdate: ({ editor }) => {
      // Use markdown output if needed
      emit("update:content", editor.storage.markdown.getMarkdown());
    },
    parseOptions: {
      preserveWhitespace: "full",
    },
  });
});

// Clean up on unmount
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
    editor.value = undefined;
  }
});

// Watch for read-only status changes
watch(
  () => props.readOnly,
  (isReadOnly) => {
    if (editor.value) {
      editor.value.setEditable(!isReadOnly);
    }
  }
);

// Watch for content changes
watch(
  () => props.content,
  (newContent) => {
    // Only set content if editor exists
    if (!editor.value || editor.value.isDestroyed) return;

    // If editor doesn't have focus, we can safely update
    if (!editor.value.isFocused) {
      // Pre-process the content
      let processedContent = preprocessContent(newContent);
      editor.value.commands.setContent(processedContent, false);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.obsidian-editor {
  height: 100%;
  overflow: auto;
}

.obsidian-editor :deep(.ProseMirror) {
  height: 100%;
  outline: none;
  padding: 1rem;
}

.obsidian-editor.read-only :deep(.ProseMirror) {
  cursor: default;
}

/* Make dataview blocks visually distinct */
.obsidian-editor :deep(.dataview-block-container) {
  margin: 1rem 0;
}

.obsidian-editor :deep(.dataview-preview) {
  background-color: #e6f7ff;
  border: 2px solid #1890ff;
  border-radius: 5px;
  padding: 1rem;
  margin: 0;
}

/* Hide the actual code block content when rendered as dataview */
.obsidian-editor :deep(.dataview-wrapper pre),
.obsidian-editor :deep(.dataview-wrapper code) {
  display: none;
}

/* Support for dark theme */
:global(.dark-theme) .obsidian-editor :deep(.dataview-preview) {
  background-color: #111d2c;
  border-color: #177ddc;
}
</style>

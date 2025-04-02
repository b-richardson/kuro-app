<template>
  <div class="obsidian-editor" 
       :class="{ 
         'read-only': readOnly, 
         'obsidian-dark-theme': isDarkTheme, 
         'obsidian-light-theme': !isDarkTheme
       }"
  >
    <editor-content v-if="editor" :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount, watch, inject, ref } from "vue";
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

// Get theme from parent component (injected)
const isDarkTheme = inject("theme", ref(true));

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

// Helper function to preprocess markdown content to make it more compatible with Obsidian
const preprocessContent = (content: string): string => {
  let processedContent = content;

  // Preprocess dataview blocks
  processedContent = processedContent.replace(/```dataview\s+([\s\S]*?)```/g, (match, query) => {
    // Replace with explicit HTML structure
    return `<div class="dataview-block-container"><pre data-language="dataview"><code>${query.trim()}</code></pre></div>`;
  });
  
  // Preprocess callouts to make them more compatible with Obsidian
  processedContent = processedContent.replace(/>\s*\[!(\w+)\](?:\s*([^\n]*))?(?:\n>?\s*([^\n]*(?:\n>?\s*[^\n]*)*))?/g, 
    (match, type, title, content) => {
      const titleAttr = title ? ` data-callout-title="${title.trim()}"` : '';
      const contentStr = content ? content.replace(/^\s*>\s*/gm, '') : '';
      return `<div class="obsidian-callout obsidian-callout-${type.toLowerCase()}" data-callout-type="${type.toLowerCase()}"${titleAttr}>${contentStr.trim()}</div>`;
    }
  );
  
  // Enhance horizontal rule rendering
  processedContent = processedContent.replace(/^(\s*[*\-_]{3,}\s*)$/gm, '<hr class="obsidian-hr" />');
  
  return processedContent;
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
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
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
        HTMLAttributes: {
          class: 'obsidian-code-block',
        },
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

// Watch for theme changes
watch(
  () => isDarkTheme.value,
  () => {
    // Theme changes will automatically apply through CSS classes
  }
);
</script>

<style>
/* 
  Component-specific styling for ObsidianEditor
  Uses proper cascade and specificity without !important
*/

/* Base editor container */
.obsidian-editor {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  font-family: var(--obsidian-font-text);
  font-size: var(--obsidian-font-size-normal);
  line-height: var(--obsidian-line-height);
  color: var(--obsidian-text-normal);
  background-color: var(--obsidian-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow: auto;
  padding: 0;
  margin: 0;
}

/* Theme variations with proper cascade */
.obsidian-dark-theme {
  color: var(--obsidian-text-normal);
  background-color: var(--obsidian-background);
}

.obsidian-light-theme {
  color: var(--obsidian-text-normal);
  background-color: var(--obsidian-background);
}

/* ProseMirror core styling */
.obsidian-editor .ProseMirror {
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  outline: none;
  padding: var(--obsidian-size-24);
}

/* Add extra space at the bottom for editing */
.obsidian-editor .ProseMirror {
  padding-bottom: 200px;
}

/* Specific adjustments for read-only mode */
.obsidian-editor.read-only .ProseMirror {
  cursor: default;
  height: auto;
  min-height: 100%;
}

/* Selection styling */
.obsidian-editor .ProseMirror-selectednode {
  outline: 2px solid var(--obsidian-interactive-accent);
  border-radius: var(--obsidian-border-radius);
}

/* Node selection styles */
.obsidian-editor .node-selectedCell {
  background-color: rgba(var(--obsidian-interactive-accent-rgb, 127, 109, 242), 0.1);
}

/* For mobile and smaller screens */
@media (max-width: 768px) {
  .obsidian-editor .ProseMirror {
    padding: var(--obsidian-size-16);
  }
}
</style>

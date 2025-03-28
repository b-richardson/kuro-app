<template>
  <div class="obsidian-editor" :class="{ 'read-only': readOnly }">
    <editor-content :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { ObsidianCallout } from "../custom-extensions/obsidianCallout";
import { ObsidianLink } from "../custom-extensions/obsidianInternalLink";
import { ObsidianDataview } from "../custom-extensions/obsidianDataview";
import { ObsidianFrontmatter } from "../custom-extensions/obsidianFrontmatter";
import { ObsidianTemplateVars } from "../custom-extensions/obsidianTemplateVars";
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

// Editor instance
const editor = ref<Editor | null>(null);

// Initialize editor
const initEditor = () => {
  editor.value = new Editor({
    extensions: [
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
      CodeBlockLowlight.configure({
        lowlight,
      }),
      ObsidianCallout,
      ObsidianLink,
      ObsidianDataview,
      ObsidianFrontmatter,
      ObsidianTemplateVars,
      Markdown,
    ],
    content: props.content,
    editable: !props.readOnly,
    onUpdate: ({ editor }) => {
      // Use markdown output if needed
      emit("update:content", editor.storage.markdown.getMarkdown());
    }, // Added missing closing bracket here
  });
};

// Initialize on mount
initEditor();

// Clean up on unmount
onBeforeUnmount(() => {
  editor.value?.destroy();
});

// Only watch for read-only status changes
watch(
  () => props.readOnly,
  (isReadOnly) => {
    if (editor.value) {
      editor.value.setEditable(!isReadOnly);
    }
  }
);

// Only set content initially and when explicitly changed from outside
// NOT on every keystroke
watch(
  () => props.content,
  (newContent, oldContent) => {
    // Only set content on initialization or when changed from outside
    if (!editor.value || editor.value.isDestroyed) return;

    // If editor doesn't have focus, we can safely update
    if (!editor.value.isFocused) {
      editor.value.commands.setContent(newContent, false);
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div
    class="obsidian-editor"
    :class="{
      'read-only': readOnly,
      'obsidian-dark-theme': isDarkTheme,
      'obsidian-light-theme': !isDarkTheme,
    }"
  >
    <editor-content v-if="editor" :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import {
  shallowRef,
  onMounted,
  onBeforeUnmount,
  watch,
  inject,
  ref,
  nextTick,
} from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { common, createLowlight } from "lowlight";
import { preprocessContent } from "./custom-extensions/preprocessors.ts";
import { ObsidianCallout } from "./custom-extensions/obsidianCallout";
import { ObsidianLink } from "./custom-extensions/obsidianInternalLink";
import { ObsidianDataviewList } from "./custom-extensions/obsidianDataviewList";
import { ObsidianDataviewTable } from "./custom-extensions/obsidianDataviewTable";
import { ObsidianTemplaterDate } from "./custom-extensions/obsidianTemplaterDate";
import { ObsidianTemplaterFile } from "./custom-extensions/obsidianTemplaterFile";
import { ObsidianTemplaterTransform } from "./custom-extensions/obsidianTemplaterTransform";
import { ObsidianFrontmatter } from "./custom-extensions/obsidianFrontmatter";
import { ObsidianTemplateVars } from "./custom-extensions/obsidianTemplateVars";
import { ObsidianTemplaterUserInput } from "./custom-extensions/obsidianTemplaterUserInput";
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

// Store scroll position and selection state for restoration
const editorState = ref<{ scrollTop: number; selection?: any }>({
  scrollTop: 0,
});

// Helper to save editor state
const saveEditorState = () => {
  if (!editor.value || editor.value.isDestroyed) return;

  // Save current scroll position
  const editorDOM = document.querySelector(".obsidian-editor .ProseMirror");
  if (editorDOM) {
    editorState.value.scrollTop = (editorDOM as HTMLElement).scrollTop;
  }

  // Save selection if needed (for future use)
  if (editor.value.isFocused) {
    editorState.value.selection = editor.value.state.selection;
  }
};

// Helper to restore editor state
const restoreEditorState = () => {
  if (!editor.value || editor.value.isDestroyed) return;

  // Use nextTick to ensure DOM has updated
  nextTick(() => {
    // Restore scroll position
    const editorDOM = document.querySelector(".obsidian-editor .ProseMirror");
    if (editorDOM && editorState.value.scrollTop) {
      (editorDOM as HTMLElement).scrollTop = editorState.value.scrollTop;
    }

    // Restore selection if needed (for future use)
    if (editorState.value.selection && !props.readOnly) {
      // Only restore selection if we're not in read-only mode
      editor.value?.commands.setTextSelection(editorState.value.selection);
    }
  });
};

// Custom extension for Obsidian-style table UI
const ObsidianTable = Table.extend({
  addNodeView() {
    return ({ editor, node, getPos }) => {
      const dom = document.createElement("div");
      dom.className = "obsidian-table-wrapper";

      const table = document.createElement("table");
      table.className = "obsidian-table";

      dom.append(table);

      // Add mutation observer to enhance table cells with UI controls
      const observer = new MutationObserver(() => {
        // Add resize handles to table cells
        const cells = table.querySelectorAll("th, td");
        cells.forEach((cell) => {
          if (!cell.querySelector(".column-resize-handle")) {
            const handle = document.createElement("div");
            handle.className = "column-resize-handle";
            cell.appendChild(handle);
          }
        });

        // Add "add column" button to last cell in each row
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const lastCell = row.querySelector("th:last-child, td:last-child");
          if (lastCell && !lastCell.querySelector(".add-column-button")) {
            const button = document.createElement("div");
            button.className = "add-column-button";
            button.innerHTML = "+";
            button.title = "Add column";
            button.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (editor.isEditable) {
                editor.commands.addColumnAfter();
              }
            });
            lastCell.appendChild(button);
          }
        });

        // Add "add row" button to last row
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const middleCell = lastRow.querySelector("td:first-child");
          if (middleCell && !middleCell.querySelector(".add-row-button")) {
            const button = document.createElement("div");
            button.className = "add-row-button";
            button.innerHTML = "+";
            button.title = "Add row";
            button.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (editor.isEditable) {
                editor.commands.addRowAfter();
              }
            });
            middleCell.appendChild(button);
          }
        }
      });

      // Start observing
      observer.observe(table, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });

      return {
        dom,
        contentDOM: table,
        destroy: () => {
          observer.disconnect();
        },
      };
    };
  },
});

// Initialize editor on component mount
onMounted(() => {
  editor.value = new Editor({
    extensions: [
      ObsidianFrontmatter,
      // Add ObsidianDataview first to give it priority
      ObsidianDataviewTable,
      ObsidianDataviewList,
      ObsidianTemplaterDate,
      ObsidianTemplaterFile,
      ObsidianTemplaterUserInput,
      ObsidianTemplaterTransform,

      // Configure StarterKit without code block
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: "obsidian-bullet-list",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: "obsidian-ordered-list",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "obsidian-list-item",
          },
        },
      }),

      // Add Task List and Task Item extensions for Obsidian-style task lists
      TaskList.configure({
        itemTypeName: "taskItem",
        HTMLAttributes: {
          class: "obsidian-task-list",
        },
      }),

      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "obsidian-task-item",
        },
        onReadOnlyChecked: () => {
          // Allow toggling checkboxes even in read-only mode to match Obsidian behavior
          return true;
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

      // Add custom Obsidian-style table extension
      ObsidianTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: "obsidian-table",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "obsidian-table-row",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "obsidian-table-header",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "obsidian-table-cell",
        },
      }),

      // Add CodeBlockLowlight after our custom dataview handler
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "obsidian-code-block",
        },
      }),

      ObsidianCallout,
      ObsidianLink,
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

  nextTick(() => {
    if (editor.value) {
      console.log("🧠 TipTap Document JSON:", editor.value.getJSON());
    }
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
  (newContent, oldContent) => {
    // Only set content if editor exists
    if (!editor.value || editor.value.isDestroyed) return;

    // Skip if content hasn't actually changed
    if (newContent === oldContent) return;

    // Save the current editor state
    saveEditorState();

    // Preprocess content
    let processedContent = preprocessContent(newContent);

    // Update content in the editor, preserving history
    editor.value.commands.setContent(processedContent);

    // Restore state after content update
    restoreEditorState();

    nextTick(() => {
      if (editor.value) {
        console.log(
          "📦 TipTap Document After Frontmatter Update:",
          editor.value.getJSON()
        );
      }
    });
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

/* Adjust spacing for paragraphs in editor */
.obsidian-editor p {
  margin: 0.5em 0;
  line-height: 1.4;
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
  line-height: 1.4;
}

/* Add extra space at the bottom for editing */
.obsidian-editor .ProseMirror {
  padding-bottom: 200px;
}

/* Simplify list styling for ProseMirror to match Obsidian */
.obsidian-editor .ProseMirror ul,
.obsidian-editor .ProseMirror ol {
  /* Basic list spacing */
}

/* The most critical fix - remove paragraph margins in list items */
.obsidian-editor .ProseMirror li p {
  margin: 0;
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
  background-color: rgba(
    var(--obsidian-interactive-accent-rgb, 127, 109, 242),
    0.1
  );
}

/* 
  Focused CSS solution for task list layout issues
  Based on the exact DOM structure from the screenshot
*/

/* First, let's reset all elements to make sure there are no unexpected styles */
.tiptap.ProseMirror li.obsidian-task-item,
.tiptap.ProseMirror li.obsidian-task-item > label,
.tiptap.ProseMirror li.obsidian-task-item > div,
.tiptap.ProseMirror li.obsidian-task-item > div > p {
  margin: 0;
  padding: 0;
}

/* Force the task item to use flex layout */
.tiptap.ProseMirror li.obsidian-task-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 0.5em;
}

/* Control the label containing the checkbox */
.tiptap.ProseMirror li.obsidian-task-item > label {
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 0.25em; /* Slight adjustment to align with text */
  display: inline-flex;
  align-items: center;
}

/* Hide the empty span that might be causing layout issues */
.tiptap.ProseMirror li.obsidian-task-item > label > span {
  display: none;
}

/* Style the checkbox */
.tiptap.ProseMirror li.obsidian-task-item > label > input[type="checkbox"] {
  width: 16px;
  height: 16px;
  position: relative;
  margin: 0;
  border-radius: 3px;
  appearance: none;
  -webkit-appearance: none;
  border: 1px solid var(--obsidian-text-muted, #999);
  background-color: transparent;
  cursor: pointer;
}

/* Checked state styling */
.tiptap.ProseMirror
  li.obsidian-task-item
  > label
  > input[type="checkbox"]:checked {
  background-color: var(--obsidian-interactive-accent, #7f6df2);
  border-color: var(--obsidian-interactive-accent, #7f6df2);
}

/* Add checkmark and Adjust the checkmark position and color */
.tiptap.ProseMirror
  li.obsidian-task-item
  > label
  > input[type="checkbox"]:checked::after {
  content: "✓";
  color: black; /* Change to black to match Obsidian native */
  position: absolute;
  left: 1px; /* Adjust left position to center horizontally */
  top: -2px; /* Adjust top position to center vertically */
  font-size: 14px; /* Slightly smaller size for better fit */
  font-weight: bold;
}

/* The div container needs to be inline */
.tiptap.ProseMirror li.obsidian-task-item > div {
  flex: 1;
  min-width: 0;
  display: inline;
}

/* Make paragraph display inline */
.tiptap.ProseMirror li.obsidian-task-item > div > p {
  display: inline;
}

/* Strikethrough for completed tasks */
.tiptap.ProseMirror li.obsidian-task-item[data-checked="true"] > div,
.tiptap.ProseMirror li.obsidian-task-item[data-checked="true"] > div > p {
  color: var(--obsidian-text-muted, #999);
  text-decoration: line-through;
  opacity: 0.7;
}

/* Critical: Ensure our styles take precedence over user agent styles */
@media all {
  .tiptap.ProseMirror li.obsidian-task-item {
    display: flex !important;
  }

  .tiptap.ProseMirror li.obsidian-task-item > div {
    display: inline !important;
  }

  .tiptap.ProseMirror li.obsidian-task-item > div > p {
    display: inline !important;
  }
}

/* Table styling to match Obsidian */
.obsidian-editor .ProseMirror .obsidian-table-wrapper {
  margin: 0.5em 0;
  position: relative;
  overflow: auto;
}

.obsidian-editor .ProseMirror table {
  border-collapse: collapse;
  width: auto;
  min-width: 50%;
  max-width: 100%;
  table-layout: fixed;
  border: 1px solid var(--obsidian-background-modifier-border);
  overflow: hidden;
  position: relative;
  font-size: 0.85em;
}

.obsidian-editor .ProseMirror table th {
  background-color: var(--obsidian-background-secondary);
  font-weight: 600;
  text-align: left;
  padding: 0.25em 0.3em;
  border-bottom: 1px solid var(--obsidian-background-modifier-border);
  position: relative;
  line-height: 1.3;
  min-width: 80px;
  max-width: 200px;
}

.obsidian-editor .ProseMirror table td {
  padding: 0.25em 0.3em;
  border: 1px solid var(--obsidian-background-modifier-border);
  position: relative;
  line-height: 1.3;
  min-width: 80px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Column resize handle styling */
.obsidian-editor .ProseMirror table .column-resize-handle {
  position: absolute;
  right: -1px;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--obsidian-interactive-accent);
  cursor: col-resize;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 5;
}

.obsidian-editor .ProseMirror table th:hover .column-resize-handle,
.obsidian-editor .ProseMirror table td:hover .column-resize-handle {
  opacity: 0.3;
}

.obsidian-editor .ProseMirror table .column-resize-handle.dragging {
  opacity: 0.5;
}

/* Add column/row buttons styling */
.obsidian-editor .ProseMirror table .add-column-button,
.obsidian-editor .ProseMirror table .add-row-button {
  position: absolute;
  background-color: var(--obsidian-interactive-accent);
  color: white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.obsidian-editor .ProseMirror table .add-column-button {
  right: -7px;
  top: 50%;
  transform: translateY(-50%);
}

.obsidian-editor .ProseMirror table .add-row-button {
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
}

.obsidian-editor .ProseMirror table tr:last-child:hover .add-row-button,
.obsidian-editor .ProseMirror table th:last-child:hover .add-column-button,
.obsidian-editor .ProseMirror table td:last-child:hover .add-column-button {
  opacity: 1;
}

/* Selected table cell styling */
.obsidian-editor .ProseMirror table .selectedCell {
  background-color: rgba(
    var(--obsidian-interactive-accent-rgb, 127, 109, 242),
    0.1
  );
}

/* For mobile and smaller screens */
@media (max-width: 768px) {
  .obsidian-editor .ProseMirror {
    padding: var(--obsidian-size-16);
  }

  .obsidian-editor .ProseMirror table {
    width: 100%;
    display: block;
    overflow-x: auto;
  }
}

/* Templater syntax related css below */

/* Base styles for all Templater blocks */
.obsidian-templater {
  border-radius: 3px;
  padding: 0 4px;
  font-family: "JetBrains Mono", monospace, "Courier New", Courier;
  font-size: 0.85em;
  cursor: pointer;
}

/* Styles for different types of Templater syntax */
.obsidian-templater-output {
  background-color: rgba(128, 203, 196, 0.15);
  color: var(--obsidian-templater-output-color, #80cbc4);
  border: 1px dashed var(--obsidian-templater-output-border, #80cbc4);
}

.obsidian-templater-exec {
  background-color: rgba(179, 157, 219, 0.15);
  color: var(--obsidian-templater-exec-color, #b39ddb);
  border: 1px dashed var(--obsidian-templater-exec-border, #b39ddb);
}

.obsidian-templater-user-input {
  background-color: rgba(255, 213, 79, 0.15);
  color: var(--obsidian-templater-user-input-color, #ffd54f);
  border: 1px dashed var(--obsidian-templater-user-input-border, #ffd54f);
}

.obsidian-templater-condition-start,
.obsidian-templater-condition-end {
  background-color: rgba(244, 143, 177, 0.15);
  color: var(--obsidian-templater-condition-color, #f48fb1);
  border: 1px dashed var(--obsidian-templater-condition-border, #f48fb1);
}

.obsidian-templater-date {
  background-color: rgba(129, 199, 132, 0.15);
  color: var(--obsidian-templater-date-color, #81c784);
  border: 1px dashed var(--obsidian-templater-date-border, #81c784);
}

.obsidian-templater-file {
  background-color: rgba(144, 202, 249, 0.15);
  color: var(--obsidian-templater-file-color, #90caf9);
  border: 1px dashed var(--obsidian-templater-file-border, #90caf9);
}

/* Dark mode adjustments */
.obsidian-dark-theme .obsidian-templater {
  opacity: 0.9;
}

/* Hover effects */
.obsidian-templater:hover {
  opacity: 1;
  filter: brightness(1.1);
}
</style>

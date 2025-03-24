<template>
  <div class="editor-test-view">
    <h1>Obsidian Editor Test</h1>
    <p class="editor-description">Enhanced Live Preview - Testing Environment</p>
    <div class="editor-container">
      <ObsidianNoteEditor
        v-model="editorContent"
        :mode="editorMode"
        :isDarkTheme="true"
        placeholder="Start writing or paste content from Obsidian..."
        @ready="onEditorReady"
      />
    </div>
    <div class="editor-controls">
      <div class="mode-toggle">
        <button
          @click="editorMode = 'live-preview'"
          :class="{ active: editorMode === 'live-preview' }"
        >
          Live Preview
        </button>
        <button
          @click="editorMode = 'source'"
          :class="{ active: editorMode === 'source' }"
        >
          Source
        </button>
        <button
          @click="editorMode = 'reading'"
          :class="{ active: editorMode === 'reading' }"
        >
          Reading
        </button>
      </div>
      <div class="sample-controls">
        <button @click="loadSampleTemplate">Load Sample</button>
        <button @click="clearEditor">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ObsidianNoteEditor } from "@/components/ObsidianEditor";
import { useFrameworksStore } from "@/stores/frameworks";

// Editor state
const editorContent = ref("");
const editorMode = ref<"live-preview" | "source" | "reading">("live-preview");
const editorReady = ref(false);

// Store
const frameworksStore = useFrameworksStore();

// Initialize with a sample
onMounted(() => {
  // Pre-load with a simple example to demonstrate Obsidian syntax
  editorContent.value = `# Obsidian Editor Test

## Features Demo

This editor supports all the main Obsidian syntax features:

### WikiLinks
- Internal link: [[Some Page]]
- With alt text: [[Some Page|Custom Text]]

### Formatting
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- ==Highlighted text==
- \`Inline code\`

### Lists
- Regular list item
- [ ] Unchecked task
- [x] Checked task

### Callouts
> [!note] Note Callout
> This is a note callout block
> 
> It can have multiple lines

> [!warning] Warning Callout
> Warning! This is important.

### Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Embedding
- Date: {{date}}
- Formatted date: {{date:YYYY-MM-DD}}

### Tags
#obsidian #markdown #testing

### Comments
Text before %% This is a comment that won't show in preview %% text after.

Try copying and pasting this content between Obsidian and this editor!
`;
});

// Handle editor ready event
const onEditorReady = () => {
  editorReady.value = true;
  console.log("Editor is ready");
};

// Load a sample template
const loadSampleTemplate = () => {
  // Get a template from the frameworks store
  const dailyJournal = frameworksStore.getTemplateById("1");
  if (dailyJournal && dailyJournal.content) {
    editorContent.value = dailyJournal.content;
  }
};

// Clear the editor
const clearEditor = () => {
  editorContent.value = "";
};
</script>

<style scoped>
.editor-test-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-md);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  margin-bottom: calc(var(--spacing-sm) / 2);
  color: var(--color-primary);
}

.editor-description {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.editor-container {
  flex: 1;
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: rgba(30, 30, 46, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-height: 600px; /* Ensure a good size for testing */
}

.editor-controls {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  gap: var(--spacing-md);
}

.mode-toggle,
.sample-controls {
  display: flex;
  gap: var(--spacing-xs);
}

button {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  background: rgba(30, 30, 46, 0.7);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

button:hover {
  background: rgba(50, 50, 70, 0.7);
  transform: translateY(-1px);
}

button.active {
  background: var(--color-primary);
  color: white;
  border-color: transparent;
}

.sample-controls button {
  background: rgba(50, 50, 70, 0.7);
}

.sample-controls button:first-child:hover {
  background: rgba(137, 180, 250, 0.3);
}

.sample-controls button:last-child:hover {
  background: rgba(243, 139, 168, 0.3);
}
</style>

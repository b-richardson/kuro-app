<template>
  <div 
    class="obsidian-note-editor" 
    :class="{ 'dark-theme': isDarkTheme, 'light-theme': !isDarkTheme }"
  >
    <!-- Editor component with live preview -->
    <div 
      class="editor-container" 
      ref="editorContainerRef"
      :class="{ 'live-preview': currentMode === 'live-preview', 'source': currentMode === 'source' }"
    >
      <!-- CodeMirror editor element -->
      <div 
        ref="cmEditorRef" 
        class="cm-editor-wrapper"
      ></div>
    </div>
    
    <!-- Reading view (full preview mode) -->
    <div 
      v-if="currentMode === 'reading'" 
      class="preview-container" 
      ref="previewContainerRef"
      @scroll="handlePreviewScroll"
    >
      <div 
        class="preview" 
        v-html="renderedMarkdown"
        @click="handlePreviewClick"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount, shallowRef } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import mermaid from 'mermaid';

// Import utilities and extensions
import { EditorMode, getCoreExtensions, getSourceModeExtensions, toggleTaskInMarkdown } from './utils/editorUtils';
import { createMarkdownParser, processObsidianSyntax, postProcessHtml } from './utils/markdownProcessing';
import { createLivePreviewExtensions } from './extensions/livePreviewExtensions';

// Define props
const props = defineProps<{
  // Initial markdown content
  modelValue?: string;
  // Editor mode: 'live-preview', 'source', or 'reading'
  mode?: EditorMode;
  // Theme: true for dark, false for light
  isDarkTheme?: boolean;
  // Placeholder text for empty editor
  placeholder?: string;
}>();

// Define emits
const emit = defineEmits<{
  // Update model value when content changes
  (e: 'update:modelValue', value: string): void;
  // Notify when mode changes
  (e: 'update:mode', value: EditorMode): void;
  // Emitted when editor is ready
  (e: 'ready'): void;
}>();

// Component state
const markdownContent = ref(props.modelValue || '');
const currentMode = ref(props.mode || 'live-preview');
const editorContainerRef = ref<HTMLDivElement | null>(null);
const cmEditorRef = ref<HTMLDivElement | null>(null);
const previewContainerRef = ref<HTMLDivElement | null>(null);
const editorView = shallowRef<EditorView | null>(null);
const isScrollSyncing = ref(false);
const lastScrollPosition = ref({ editor: 0, preview: 0 });

// Initialize markdown-it parser
const md = createMarkdownParser();

// Rendered markdown for reading view
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  
  try {
    // Process the content to handle Obsidian-specific syntax
    const processedContent = processObsidianSyntax(markdownContent.value);
    
    // Render to HTML
    let html = md.render(processedContent);
    
    // Post-process the HTML for interactive elements
    html = postProcessHtml(html, md);
    
    return html;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return '<div class="error-message">Error rendering markdown</div>';
  }
});

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== markdownContent.value) {
    markdownContent.value = newValue;
    updateEditorContent(newValue);
  }
}, { immediate: true });

watch(() => props.mode, (newValue) => {
  if (newValue !== undefined && newValue !== currentMode.value) {
    switchMode(newValue);
  }
}, { immediate: true });

watch(() => props.isDarkTheme, () => {
  if (editorView.value) {
    // Update theme in CodeMirror (recreate editor with new theme)
    createEditor();
  }
}, { immediate: true });

// Create and mount the CodeMirror editor
function createEditor() {
  if (!cmEditorRef.value) return;
  
  // Clear existing editor instance if any
  if (editorView.value) {
    editorView.value.destroy();
  }
  
  // Handler for document changes
  const handleDocChange = (content: string) => {
    if (content !== markdownContent.value) {
      markdownContent.value = content;
      emit('update:modelValue', content);
    }
  };
  
  // Build up the extensions based on current mode
  const extensions = [
    // Core extensions for all modes
    ...getCoreExtensions(props.placeholder || "Start writing...", props.isDarkTheme ?? false, handleDocChange),
    
    // Mode-specific extensions
    ...(currentMode.value === 'live-preview' ? createLivePreviewExtensions(md) : []),
    ...(currentMode.value === 'source' ? getSourceModeExtensions() : []),
    
    // Handle editor scroll
    EditorView.updateListener.of(update => {
      if (update.scrollEnough && !isScrollSyncing.value) {
        // Get the current scroll position
        const scrollTop = update.view.scrollDOM.scrollTop;
        lastScrollPosition.value.editor = scrollTop;
      }
    }),
    
    // Mode switch keymaps
    EditorView.keymap.of([
      { key: "Mod-e", run: () => {
        const nextMode = currentMode.value === 'reading' ? 'live-preview' : 'reading';
        switchMode(nextMode);
        return true;
      }},
      { key: "Mod-Alt-e", run: () => {
        const nextMode = currentMode.value === 'source' ? 'live-preview' : 'source';
        switchMode(nextMode);
        return true;
      }}
    ])
  ];
  
  // Create editor state
  const state = EditorState.create({
    doc: markdownContent.value,
    extensions
  });
  
  // Create editor view
  editorView.value = new EditorView({
    state,
    parent: cmEditorRef.value
  });
  
  // Initialize Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: props.isDarkTheme ? 'dark' : 'default',
    securityLevel: 'strict',
    fontSize: 14
  });
  
  // Apply initial scroll position if available
  nextTick(() => {
    applyScrollPosition();
  });
}

// Update editor content from external changes
function updateEditorContent(content: string) {
  if (!editorView.value || editorView.value.state.doc.toString() === content) return;
  
  // Save scroll position and cursor position
  const scrollTop = editorView.value.scrollDOM.scrollTop;
  
  // Update content
  editorView.value.dispatch({
    changes: {
      from: 0,
      to: editorView.value.state.doc.length,
      insert: content
    }
  });
  
  // Restore scroll position
  if (scrollTop) {
    // Set timeout to let the DOM update first
    setTimeout(() => {
      if (editorView.value) {
        editorView.value.scrollDOM.scrollTop = scrollTop;
      }
    }, 0);
  }
}

// Toggle between editor modes
function switchMode(mode: EditorMode) {
  // Save scroll position before switching
  saveScrollPosition();
  
  // Switch mode
  currentMode.value = mode;
  emit('update:mode', mode);
  
  // Recreate editor with new mode if needed
  if (mode !== 'reading') {
    nextTick(() => {
      createEditor();
    });
  }
  
  // Wait for DOM update then restore scroll position
  nextTick(() => {
    applyScrollPosition();
  });
}

// Save current scroll position
function saveScrollPosition() {
  if (editorView.value && (currentMode.value === 'live-preview' || currentMode.value === 'source')) {
    lastScrollPosition.value.editor = editorView.value.scrollDOM.scrollTop;
  } else if (currentMode.value === 'reading' && previewContainerRef.value) {
    lastScrollPosition.value.preview = previewContainerRef.value.scrollTop;
  }
}

// Apply saved scroll position
function applyScrollPosition() {
  if ((currentMode.value === 'live-preview' || currentMode.value === 'source') && editorView.value) {
    editorView.value.scrollDOM.scrollTop = lastScrollPosition.value.editor;
  } else if (currentMode.value === 'reading' && previewContainerRef.value) {
    previewContainerRef.value.scrollTop = lastScrollPosition.value.preview;
  }
}

// Handle scroll in preview mode to sync with editor
function handlePreviewScroll() {
  if (isScrollSyncing.value || !previewContainerRef.value) return;
  
  isScrollSyncing.value = true;
  
  const { scrollTop, scrollHeight, clientHeight } = previewContainerRef.value;
  lastScrollPosition.value.preview = scrollTop;
  
  const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
  lastScrollPosition.value.editor = scrollPercentage * 100; // Save as percentage for editor
  
  setTimeout(() => {
    isScrollSyncing.value = false;
  }, 50);
}

// Handle clicks in preview mode
function handlePreviewClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  
  // Handle checkbox clicks
  if (target.tagName === 'INPUT' && target.classList.contains('task-checkbox')) {
    event.preventDefault();
    const checkbox = target as HTMLInputElement;
    
    // Find the list item containing this checkbox
    const listItem = target.closest('li');
    if (!listItem) return;
    
    // Toggle checkbox state in the DOM
    const textElement = listItem.querySelector('span');
    if (textElement) {
      textElement.classList.toggle('task-completed', checkbox.checked);
    }
    
    // Toggle the task in the markdown content
    const updatedContent = toggleTaskInMarkdown(listItem, markdownContent.value);
    if (updatedContent !== markdownContent.value) {
      markdownContent.value = updatedContent;
      emit('update:modelValue', updatedContent);
      updateEditorContent(updatedContent);
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  // Create and mount the editor
  createEditor();
  
  // Emit ready event
  emit('ready');
});

onBeforeUnmount(() => {
  // Clean up editor instance
  if (editorView.value) {
    editorView.value.destroy();
  }
});

// Public methods
defineExpose({
  // Switch between editor modes
  switchMode,
  // Focus the editor
  focus: () => {
    if (editorView.value) {
      editorView.value.focus();
    }
  },
  // Get current mode
  getMode: () => currentMode.value,
  // Get editor content
  getContent: () => markdownContent.value,
  // Set cursor position
  setCursorPosition: (position: number) => {
    if (editorView.value) {
      editorView.value.dispatch({
        selection: { anchor: position, head: position }
      });
      editorView.value.focus();
    }
  },
  // Get editor instance
  getEditorView: () => editorView.value,
  // Insert text at cursor
  insertAtCursor: (text: string) => {
    if (editorView.value) {
      const selection = editorView.value.state.selection;
      editorView.value.dispatch({
        changes: { from: selection.main.from, to: selection.main.to, insert: text }
      });
    }
  }
});
</script>

<style>
/* Base editor styles */
.obsidian-note-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Editor container */
.editor-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* CodeMirror editor wrapper */
.cm-editor-wrapper {
  height: 100%;
  overflow: hidden;
}

/* Preview container */
.preview-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

/* Preview content */
.preview {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: break-word;
}

/* Light theme */
.light-theme .cm-editor {
  background-color: #ffffff;
  color: #2e3338;
}

.light-theme .preview-container {
  background-color: #ffffff;
  color: #2e3338;
}

/* Dark theme */
.dark-theme .cm-editor {
  background-color: #1e1e2e;
  color: #d9e0ee;
}

.dark-theme .preview-container {
  background-color: #1e1e2e;
  color: #d9e0ee;
}

/* Common markdown preview styles */

/* Headings */
.preview h1 {
  font-size: 2em;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  border-bottom: 1px solid rgba(128, 128, 128, 0.33);
  padding-bottom: 0.2em;
}

.preview h2 {
  font-size: 1.5em;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
}

.preview h3 {
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
}

.preview h4 {
  font-size: 1em;
  margin-top: 1.33em;
  margin-bottom: 1.33em;
}

.preview h5 {
  font-size: 0.83em;
  margin-top: 1.67em;
  margin-bottom: 1.67em;
}

.preview h6 {
  font-size: 0.67em;
  margin-top: 2.33em;
  margin-bottom: 2.33em;
}

/* Links */
.preview a {
  color: #7aa2f7;
  text-decoration: none;
}

.light-theme .preview a {
  color: #5073de;
}

.preview a:hover {
  text-decoration: underline;
}

/* Internal links (Obsidian style) */
.preview a.internal-link,
.cm-rendered-markdown a.internal-link {
  color: #a277ff;
  text-decoration: none;
  border-bottom: 1px dotted rgba(162, 119, 255, 0.4);
}

.light-theme .preview a.internal-link,
.light-theme .cm-rendered-markdown a.internal-link {
  color: #8457d3;
  border-bottom: 1px dotted rgba(132, 87, 211, 0.4);
}

.preview a.internal-link:hover,
.cm-rendered-markdown a.internal-link:hover {
  text-decoration: none;
  border-bottom: 1px solid rgba(162, 119, 255, 0.8);
}

.light-theme .preview a.internal-link:hover,
.light-theme .cm-rendered-markdown a.internal-link:hover {
  border-bottom: 1px solid rgba(132, 87, 211, 0.8);
}

/* Text formatting */
.preview strong,
.cm-rendered-markdown strong {
  font-weight: bold;
}

.preview em,
.cm-rendered-markdown em {
  font-style: italic;
}

.preview del {
  text-decoration: line-through;
}

.preview mark,
.cm-rendered-markdown mark {
  background-color: rgba(246, 189, 96, 0.7);
  padding: 0 2px;
  border-radius: 2px;
}

.light-theme .preview mark,
.light-theme .cm-rendered-markdown mark {
  background-color: rgba(255, 204, 0, 0.4);
}

/* Code */
.preview code,
.cm-rendered-markdown code {
  font-family: 'Fira Code', 'Source Code Pro', monospace;
  background-color: rgba(128, 128, 128, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.preview pre,
.cm-rendered-markdown pre {
  background-color: rgba(40, 44, 52, 0.85);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.light-theme .preview pre,
.light-theme .cm-rendered-markdown pre {
  background-color: #f5f5f5;
}

.preview pre code,
.cm-rendered-markdown pre code {
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #d9e0ee;
}

.light-theme .preview pre code,
.light-theme .cm-rendered-markdown pre code {
  color: #333333;
}

/* Blockquotes */
.preview blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 3px solid rgba(128, 128, 128, 0.5);
  color: rgba(217, 224, 238, 0.8);
}

.light-theme .preview blockquote {
  color: rgba(46, 51, 56, 0.8);
}

/* Lists */
.preview ul, .preview ol {
  padding-left: 2em;
  margin: 1em 0;
}

.preview li {
  margin: 0.5em 0;
}

/* Nested lists */
.preview li > ul, .preview li > ol {
  margin: 0.5em 0;
}

/* Task lists */
.preview .task-list-item,
.cm-task-checkbox-wrapper {
  list-style: none;
  position: relative;
}

.preview .task-list-item {
  margin-left: -1.5em;
}

.preview .task-list-item input[type="checkbox"],
.cm-task-checkbox {
  margin-right: 0.5em;
  cursor: pointer;
}

.light-theme .preview .task-list-item input[type="checkbox"],
.light-theme .cm-task-checkbox {
  accent-color: #5073de;
}

.dark-theme .preview .task-list-item input[type="checkbox"],
.dark-theme .cm-task-checkbox {
  accent-color: #7aa2f7;
}

.preview .task-completed,
.cm-rendered-markdown .task-completed {
  text-decoration: line-through;
  color: rgba(217, 224, 238, 0.6);
}

.light-theme .preview .task-completed,
.light-theme .cm-rendered-markdown .task-completed {
  color: rgba(46, 51, 56, 0.6);
}

/* Tables */
.preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.preview th, .preview td {
  border: 1px solid rgba(128, 128, 128, 0.33);
  padding: 0.5em;
}

.preview th {
  background-color: rgba(128, 128, 128, 0.1);
  font-weight: bold;
}

/* Horizontal rule */
.preview hr {
  border: none;
  border-top: 1px solid rgba(128, 128, 128, 0.33);
  margin: 2em 0;
}

/* Images */
.preview img {
  max-width: 100%;
  height: auto;
  border-radius: 3px;
}

/* Callouts */
.preview .callout,
.cm-rendered-markdown .callout {
  margin: 1.5em 0;
  padding: 0.75em;
  border-radius: 4px;
  border-left: 4px solid;
}

.preview .callout-title,
.cm-rendered-markdown .callout-title {
  font-weight: 600;
  margin-bottom: 0.5em;
  cursor: pointer;
}

.preview .callout-content,
.cm-rendered-markdown .callout-content {
  margin-top: 0.5em;
}

.preview .callout-content.collapsed,
.cm-rendered-markdown .callout-content.collapsed {
  display: none;
}

/* Callout types */
.preview .callout.note,
.cm-rendered-markdown .callout.note {
  background-color: rgba(68, 138, 255, 0.1);
  border-left-color: #448aff;
}

.preview .callout.warning,
.cm-rendered-markdown .callout.warning {
  background-color: rgba(255, 145, 0, 0.1);
  border-left-color: #ff9100;
}

.preview .callout.danger,
.cm-rendered-markdown .callout.danger {
  background-color: rgba(255, 82, 82, 0.1);
  border-left-color: #ff5252;
}

.preview .callout.info,
.cm-rendered-markdown .callout.info {
  background-color: rgba(0, 184, 212, 0.1);
  border-left-color: #00b8d4;
}

.preview .callout.success,
.cm-rendered-markdown .callout.success {
  background-color: rgba(0, 200, 83, 0.1);
  border-left-color: #00c853;
}

/* Math styling */
.preview .katex-display {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: center;
}

.preview .math-error {
  color: #ff5252;
  font-family: monospace;
  padding: 0.5em;
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 4px;
}

/* Mermaid diagrams */
.preview .mermaid-diagram,
.cm-rendered-markdown .mermaid-diagram {
  text-align: center;
  margin: 1.5em 0;
}

.preview .mermaid-error,
.cm-rendered-markdown .mermaid-error {
  color: #ff5252;
  font-family: monospace;
  padding: 0.5em;
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 4px;
}

/* Error message */
.preview .error-message {
  color: #ff5252;
  padding: 1em;
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 4px;
  text-align: center;
  margin: 1em 0;
}

/* Obsidian-specific markdown features */
.preview .tag-link,
.cm-rendered-markdown .tag-link {
  color: #89b4fa;
  text-decoration: none;
  background-color: rgba(137, 180, 250, 0.1);
  border-radius: 3px;
  padding: 2px 4px;
}

.light-theme .preview .tag-link,
.light-theme .cm-rendered-markdown .tag-link {
  color: #0077cc;
  background-color: rgba(0, 119, 204, 0.1);
}

.preview .tag-link:hover,
.cm-rendered-markdown .tag-link:hover {
  text-decoration: none;
  background-color: rgba(137, 180, 250, 0.2);
}

.light-theme .preview .tag-link:hover,
.light-theme .cm-rendered-markdown .tag-link:hover {
  background-color: rgba(0, 119, 204, 0.2);
}

.preview .obsidian-comment,
.cm-rendered-markdown .obsidian-comment {
  color: rgba(217, 224, 238, 0.5);
  font-style: italic;
  background-color: rgba(80, 80, 80, 0.1);
  padding: 0 4px;
  border-radius: 2px;
}

.light-theme .preview .obsidian-comment,
.light-theme .cm-rendered-markdown .obsidian-comment {
  color: rgba(46, 51, 56, 0.5);
  background-color: rgba(200, 200, 200, 0.2);
}

.preview .dataview-block,
.cm-rendered-markdown .dataview-block {
  background-color: rgba(137, 180, 250, 0.05);
  border: 1px solid rgba(137, 180, 250, 0.2);
  border-radius: 4px;
  margin: 1em 0;
  overflow: hidden;
}

.preview .dataview-block-header,
.cm-rendered-markdown .dataview-block-header {
  background-color: rgba(137, 180, 250, 0.1);
  padding: 4px 8px;
  font-size: 0.8em;
  font-weight: bold;
  color: #89b4fa;
  border-bottom: 1px solid rgba(137, 180, 250, 0.2);
}

.light-theme .preview .dataview-block-header,
.light-theme .cm-rendered-markdown .dataview-block-header {
  color: #0077cc;
}

.preview .dataview-inline-query,
.cm-rendered-markdown .dataview-inline-query {
  color: #89b4fa;
  background-color: rgba(137, 180, 250, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.light-theme .preview .dataview-inline-query,
.light-theme .cm-rendered-markdown .dataview-inline-query {
  color: #0077cc;
  background-color: rgba(0, 119, 204, 0.1);
}

/* Code block styles */
.cm-rendered-markdown .code-block-wrapper {
  background-color: rgba(40, 44, 52, 0.85);
  border-radius: 5px;
  margin: 1em 0;
  overflow: hidden;
}

.light-theme .cm-rendered-markdown .code-block-wrapper {
  background-color: #f5f5f5;
}

.cm-rendered-markdown .code-block-language {
  font-size: 0.8em;
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.2);
  color: #89b4fa;
}

.light-theme .cm-rendered-markdown .code-block-language {
  color: #0077cc;
  background-color: rgba(0, 0, 0, 0.1);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .preview-container {
    padding: 12px;
  }
  
  .preview h1 {
    font-size: 1.8em;
  }
  
  .preview h2 {
    font-size: 1.4em;
  }
  
  .preview pre, .preview table {
    font-size: 0.9em;
  }
}

/* Rendered markdown in live preview */
.cm-rendered-markdown {
  display: inline-block;
  position: relative;
  pointer-events: all;
}

.cm-rendered-heading {
  font-weight: bold;
  margin: 0.5em 0;
}
.cm-heading-1 { font-size: 2em; }
.cm-heading-2 { font-size: 1.5em; }
.cm-heading-3 { font-size: 1.17em; }
.cm-heading-4 { font-size: 1em; }
.cm-heading-5 { font-size: 0.83em; }
.cm-heading-6 { font-size: 0.67em; }
</style>
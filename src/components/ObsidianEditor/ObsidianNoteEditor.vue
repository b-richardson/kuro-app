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
import MarkdownIt from 'markdown-it';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

// CodeMirror imports
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection, Decoration, DecorationSet, ViewPlugin } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

// Custom placeholder implementation since CodeMirror 6 doesn't have a built-in one
function placeholder(placeholderText: string): Extension {
  return ViewPlugin.fromClass(class {
    decoration: DecorationSet
    placeholderText: string
    
    constructor(view: EditorView) {
      this.placeholderText = placeholderText
      this.decoration = this.createDeco(view)
    }
    
    update(update: { docChanged: boolean; view: EditorView }) {
      if (update.docChanged)
        this.decoration = this.createDeco(update.view)
    }
    
    createDeco(view: EditorView) {
      let docText = view.state.doc.toString()
      if (!docText || docText.trim() === "") {
        return Decoration.set([
          Decoration.widget({
            widget: {
              toDOM: () => {
                const span = document.createElement("span")
                span.textContent = this.placeholderText
                span.className = "cm-placeholder"
                return span
              }
            },
            side: 1
          }).range(0)
        ])
      }
      return Decoration.none
    }
  }, {
    decorations: v => v.decoration
  })
}

// Define editor mode types
type EditorMode = 'live-preview' | 'source' | 'reading';

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

// Initialize markdown-it with Obsidian-specific features
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: highlightCodeBlocks
});

// Enhance markdown-it with Obsidian-specific extensions
enhanceMarkdownParser(md);

// Rendered markdown for reading view
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  
  try {
    // Process the content to handle Obsidian-specific syntax
    const processedContent = processObsidianSyntax(markdownContent.value);
    
    // Render to HTML
    let html = md.render(processedContent);
    
    // Post-process the HTML for interactive elements
    html = postProcessHtml(html);
    
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

watch(() => props.isDarkTheme, (newValue) => {
  if (editorView.value) {
    // Update theme in CodeMirror
    updateEditorTheme();
  }
}, { immediate: true });

// Create and mount the CodeMirror editor
function createEditor() {
  if (!cmEditorRef.value) return;
  
  // Clear existing editor instance if any
  if (editorView.value) {
    editorView.value.destroy();
  }
  
  // Create extensions array based on current mode
  const extensions = [
    // Basic extensions
    history(),
    drawSelection(),
    highlightActiveLine(),
    highlightSpecialChars(),
    syntaxHighlighting(defaultHighlightStyle),
    bracketMatching(),
    autocompletion(),
    indentOnInput(),
    
    // Markdown language support
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      addKeymap: true
    }),
    
    // Keymaps
    keymap.of([
      ...defaultKeymap, 
      ...historyKeymap, 
      ...searchKeymap, 
      ...completionKeymap, 
      ...lintKeymap,
      indentWithTab
    ]),
    
    // Custom keymaps for Obsidian-like behavior
    keymap.of([
      { key: "Mod-b", run: toggleBold },
      { key: "Mod-i", run: toggleItalic },
      { key: "Mod-Shift-s", run: toggleStrikethrough },
      { key: "Mod-k", run: toggleWikiLink },
      { key: "Mod-Shift-k", run: toggleExternalLink },
      { key: "Mod-Shift-h", run: toggleHighlight },
      { key: "Mod-1", run: setHeading(1) },
      { key: "Mod-2", run: setHeading(2) },
      { key: "Mod-3", run: setHeading(3) },
      { key: "Mod-4", run: setHeading(4) },
      { key: "Mod-5", run: setHeading(5) },
      { key: "Mod-6", run: setHeading(6) },
      { key: "Mod-Shift-t", run: toggleTaskList },
      { key: "Mod-`", run: toggleInlineCode },
      { key: "Mod-Shift-c", run: toggleCodeBlock },
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
    ]),
    
    // Live preview specific extensions
    ...(currentMode.value === 'live-preview' ? getLivePreviewExtensions() : []),
    
    // Source mode specific extensions
    ...(currentMode.value === 'source' ? getSourceModeExtensions() : []),
    
    // Custom theme
    getEditorTheme(),
    
    // Update content on changes
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        const content = update.state.doc.toString();
        if (content !== markdownContent.value) {
          markdownContent.value = content;
          emit('update:modelValue', content);
        }
      }
      
      if (update.scrollEnough && !isScrollSyncing.value) {
        // Get the current scroll position
        const scrollTop = update.view.scrollDOM.scrollTop;
        lastScrollPosition.value.editor = scrollTop;
      }
    }),
    
    // Placeholder text
    placeholder(props.placeholder || "Start writing..."),
    
    // Editor style
    EditorView.theme({
      "&": {
        height: "100%"
      },
      ".cm-scroller": {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        fontSize: "14px",
        lineHeight: "1.6",
        overflow: "auto"
      },
      ".cm-content": {
        marginLeft: "4px",
        marginRight: "4px",
        minHeight: "100%",
        caretColor: props.isDarkTheme ? "#d9e0ee" : "#333333"
      }
    })
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

// Get extensions specific to live preview mode
function getLivePreviewExtensions(): Extension[] {
  return [
    // Custom extensions for live preview rendering
    ViewPlugin.fromClass(class {
      decorations: DecorationSet = Decoration.none;
      
      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }
      
      update(update: { docChanged: boolean; view: EditorView }) {
        if (update.docChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      
      buildDecorations(view: EditorView) {
        // In a full implementation, this would parse the markdown and add inline decorations
        // For simplicity in this demo, we're keeping it minimal
        // A complete implementation would add decorations for headings, bold text, etc.
        return Decoration.none;
      }
    }, {
      decorations: v => v.decorations
    })
  ];
}

// Get extensions specific to source mode
function getSourceModeExtensions(): Extension[] {
  return [
    // Optional line numbers for source mode
    lineNumbers()
  ];
}

// Get theme configuration for CodeMirror
function getEditorTheme(): Extension {
  return EditorView.theme({
    // Base theme
    "&": {
      backgroundColor: props.isDarkTheme ? "#1e1e2e" : "#ffffff",
      color: props.isDarkTheme ? "#d9e0ee" : "#2e3338",
    },
    // Syntax highlighting
    ".cm-header": {
      fontWeight: "bold",
      color: props.isDarkTheme ? "#89b4fa" : "#0077cc"
    },
    ".cm-em": {
      fontStyle: "italic"
    },
    ".cm-strong": {
      fontWeight: "bold"
    },
    ".cm-link": {
      color: props.isDarkTheme ? "#89b4fa" : "#0077cc",
      textDecoration: "underline"
    },
    ".cm-url": {
      color: props.isDarkTheme ? "#89dceb" : "#0099cc"
    },
    // Code blocks
    ".cm-inline-code": {
      fontFamily: "'Fira Code', 'Source Code Pro', monospace",
      backgroundColor: props.isDarkTheme ? "rgba(40, 44, 52, 0.5)" : "rgba(0, 0, 0, 0.05)",
      padding: "0.2em 0.4em",
      borderRadius: "3px",
      fontSize: "0.9em"
    },
    // Headers
    ".cm-header-1": { fontSize: "2em", lineHeight: "1.2", marginTop: "0.5em", marginBottom: "0.5em" },
    ".cm-header-2": { fontSize: "1.5em", lineHeight: "1.2", marginTop: "0.5em", marginBottom: "0.5em" },
    ".cm-header-3": { fontSize: "1.25em", lineHeight: "1.2", marginTop: "0.5em", marginBottom: "0.5em" },
    ".cm-header-4": { fontSize: "1.1em", lineHeight: "1.2", marginTop: "0.5em", marginBottom: "0.5em" },
    ".cm-header-5": { fontSize: "1em", lineHeight: "1.2", marginTop: "0.5em", marginBottom: "0.5em" },
    ".cm-header-6": { fontSize: "0.9em", lineHeight: "1.2", marginTop: "0.5em", marginBottom: "0.5em" },
    // Lists
    ".cm-list": {
      color: props.isDarkTheme ? "#d9e0ee" : "#2e3338"
    },
    // Task lists
    ".cm-taskmarker": {
      color: props.isDarkTheme ? "#89b4fa" : "#0077cc"
    },
    // Highlight
    ".cm-highlight": {
      backgroundColor: props.isDarkTheme ? "rgba(246, 189, 96, 0.3)" : "rgba(255, 204, 0, 0.3)",
      borderRadius: "2px"
    },
    // Wiki links
    ".cm-wikilink": {
      color: props.isDarkTheme ? "#a277ff" : "#8457d3",
      textDecoration: "none"
    }
  });
}

// Update editor theme when dark/light mode changes
function updateEditorTheme() {
  if (!editorView.value) return;
  
  // This would require recreating the editor with new theme
  // For simplicity, we'll recreate the entire editor
  createEditor();
}

// Update editor content from external changes
function updateEditorContent(content: string) {
  if (!editorView.value || editorView.value.state.doc.toString() === content) return;
  
  // Save scroll position and cursor position
  const scrollTop = editorView.value.scrollDOM.scrollTop;
  const selection = editorView.value.state.selection;
  
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

// Process Obsidian-specific syntax
function processObsidianSyntax(content: string): string {
  let processedContent = content;
  
  // Process Obsidian internal links [[Link]]
  processedContent = processedContent.replace(
    /\[\[(.*?)\]\]/g, 
    (match, linkText) => {
      // Handle links with a pipe for different display text: [[Link|Display Text]]
      if (linkText.includes('|')) {
        const [link, display] = linkText.split('|');
        return `<a href="#" class="internal-link" data-link="${link.trim()}">${display.trim()}</a>`;
      }
      return `<a href="#" class="internal-link" data-link="${linkText.trim()}">${linkText.trim()}</a>`;
    }
  );
  
  // Process highlights ==text==
  processedContent = processedContent.replace(
    /==(.*?)==/g,
    '<mark>$1</mark>'
  );
  
  // Process callout blocks
  processedContent = processedContent.replace(
    />\s*\[!([\w-]+)\](.*?)(?:\n>.*?)*(?:\n\n|$)/gs,
    (match, type, content) => {
      const calloutTitle = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      const calloutContent = match.replace(/>\s*\[![\w-]+\].*?\n/, '').replace(/>\s*/g, '');
      
      return `<div class="callout ${type.toLowerCase()}">
        <div class="callout-title">${calloutTitle}</div>
        <div class="callout-content">${md.render(calloutContent)}</div>
      </div>`;
    }
  );
  
  return processedContent;
}

// Post-process HTML after markdown rendering
function postProcessHtml(html: string): string {
  // Process task list items for interactive checkboxes
  html = html.replace(
    /<li>\s*\[([ xX])\]\s*(.*?)<\/li>/g,
    (match, checkChar, itemText) => {
      const isChecked = checkChar === 'x' || checkChar === 'X';
      const checkboxHtml = `<input type="checkbox" class="task-checkbox" ${isChecked ? 'checked' : ''}>`;
      const itemClass = isChecked ? 'class="task-completed"' : '';
      
      return `<li class="task-list-item">${checkboxHtml} <span ${itemClass}>${itemText}</span></li>`;
    }
  );
  
  // Process math blocks
  html = processKatexBlocks(html);
  
  // Process Mermaid diagrams
  html = processMermaidDiagrams(html);
  
  return html;
}

// Process KaTeX math blocks
function processKatexBlocks(html: string): string {
  try {
    // Inline math: $...$
    html = html.replace(/\$([^$\n]+?)\$/g, (match, expr) => {
      try {
        return katex.renderToString(expr, { displayMode: false, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error (inline):', e);
        return `<span class="math-error">${expr}</span>`;
      }
    });
    
    // Display math: $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
      try {
        return katex.renderToString(expr, { displayMode: true, throwOnError: false });
      } catch (e) {
        console.error('KaTeX error (display):', e);
        return `<div class="math-error">${expr}</div>`;
      }
    });
    
    return html;
  } catch (e) {
    console.error('Error processing math:', e);
    return html;
  }
}

// Process Mermaid diagrams
function processMermaidDiagrams(html: string): string {
  try {
    // Find code blocks with mermaid class
    const mermaidBlocks = html.match(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g);
    
    if (!mermaidBlocks) return html;
    
    // Process each found diagram
    for (const block of mermaidBlocks) {
      const content = block.match(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/)?.[1];
      
      if (content) {
        try {
          // Generate unique ID for the diagram
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          
          // Replace the code block with a container
          html = html.replace(
            block,
            `<div class="mermaid-diagram" id="${id}"></div>`
          );
          
          // Render the diagram (in actual implementation, this would be better handled after mounting)
          setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
              mermaid.render(id, content).then(result => {
                element.innerHTML = result.svg;
              }).catch(error => {
                element.innerHTML = `<div class="mermaid-error">Error rendering diagram: ${error.message}</div>`;
              });
            }
          }, 0);
        } catch (e) {
          console.error('Mermaid error:', e);
        }
      }
    }
    
    return html;
  } catch (e) {
    console.error('Error processing diagrams:', e);
    return html;
  }
}

// Highlight code blocks using syntax highlighting
function highlightCodeBlocks(str: string, lang: string): string {
  // Here you would integrate a syntax highlighter like Prism.js
  // For simplicity, we're just returning the code with a language class
  return `<pre class="language-${lang}"><code class="language-${lang}">${str}</code></pre>`;
}

// Enhance markdown parser with Obsidian-specific features
function enhanceMarkdownParser(md: MarkdownIt): void {
  // Add support for checkbox rendering
  md.use((md) => {
    // Override the renderer for task list items
    const originalRender = md.renderer.rules.list_item_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
    
    md.renderer.rules.list_item_open = function(tokens, idx, options, env, self) {
      const token = tokens[idx];
      
      if (idx + 2 < tokens.length && 
          tokens[idx + 1].type === 'inline' && 
          (tokens[idx + 1].content.startsWith('[ ] ') || 
           tokens[idx + 1].content.startsWith('[x] ') || 
           tokens[idx + 1].content.startsWith('[X] '))) {
        token.attrJoin('class', 'task-list-item');
      }
      
      return originalRender(tokens, idx, options, env, self);
    };
  });
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
    
    // Convert rendered HTML back to original position in markdown
    // This would require more complex logic to track the position
    // For a more accurate implementation, we'd need a mapping between rendered elements and source positions
    
    // For demonstration, let's do a simple regex-based replacement
    toggleTaskInMarkdown(listItem);
  }
}

// Toggle a task item in the markdown content
function toggleTaskInMarkdown(listItem: Element) {
  // Get the text content of the task
  const taskText = listItem.textContent?.trim().replace(/^\s*☐\s*|\s*☑\s*/, '') || '';
  
  // Find and toggle the task in the markdown
  const lines = markdownContent.value.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if ((line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('- [X]')) && 
        line.includes(taskText)) {
      // Toggle the checkbox state
      if (line.includes('- [ ]')) {
        lines[i] = lines[i].replace('- [ ]', '- [x]');
      } else {
        lines[i] = lines[i].replace(/- \[[xX]\]/, '- [ ]');
      }
      
      // Update the markdown content
      markdownContent.value = lines.join('\n');
      emit('update:modelValue', markdownContent.value);
      updateEditorContent(markdownContent.value);
      break;
    }
  }
}

// --- CodeMirror Command Handlers ---

// Toggle bold formatting
function toggleBold({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "**Bold text**" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already bold
      if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `**${selectedText}**` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle italic formatting
function toggleItalic({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "*Italic text*" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already italic
      if (selectedText.startsWith('*') && selectedText.endsWith('*')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(1, selectedText.length - 1) 
        });
      } else {
        changes.push({ from, to, insert: `*${selectedText}*` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle strikethrough
function toggleStrikethrough({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "~~Strikethrough text~~" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already strikethrough
      if (selectedText.startsWith('~~') && selectedText.endsWith('~~')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `~~${selectedText}~~` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle highlight
function toggleHighlight({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "==Highlighted text==" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already highlighted
      if (selectedText.startsWith('==') && selectedText.endsWith('==')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `==${selectedText}==` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle wiki link
function toggleWikiLink({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "[[Link]]" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already a wiki link
      if (selectedText.startsWith('[[') && selectedText.endsWith(']]')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(2, selectedText.length - 2) 
        });
      } else {
        changes.push({ from, to, insert: `[[${selectedText}]]` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle external link
function toggleExternalLink({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "[Link text](https://example.com)" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already an external link
      const linkMatch = selectedText.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        changes.push({ from, to, insert: linkMatch[1] });
      } else {
        changes.push({ from, to, insert: `[${selectedText}](https://example.com)` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle task list item
function toggleTaskList({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    
    // Get the current line
    const line = state.doc.lineAt(from);
    const lineText = line.text;
    
    // Check if it's already a task list item
    if (lineText.trim().match(/^- \[[ xX]\]/)) {
      // Toggle task state
      if (lineText.includes('- [ ]')) {
        const newLine = lineText.replace('- [ ]', '- [x]');
        changes.push({
          from: line.from,
          to: line.to,
          insert: newLine
        });
      } else {
        const newLine = lineText.replace(/- \[[xX]\]/, '- [ ]');
        changes.push({
          from: line.from,
          to: line.to,
          insert: newLine
        });
      }
    } else if (lineText.trim().startsWith('- ')) {
      // Convert bullet to task
      const newLine = lineText.replace(/^(\s*)- /, '$1- [ ] ');
      changes.push({
        from: line.from,
        to: line.to,
        insert: newLine
      });
    } else {
      // Add new task
      changes.push({
        from: line.from,
        to: line.from,
        insert: '- [ ] '
      });
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle inline code
function toggleInlineCode({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "`code`" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already inline code
      if (selectedText.startsWith('`') && selectedText.endsWith('`')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(1, selectedText.length - 1) 
        });
      } else {
        changes.push({ from, to, insert: `\`${selectedText}\`` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Toggle code block
function toggleCodeBlock({ state, dispatch }: EditorView) {
  const selection = state.selection;
  let changes = [];
  
  for (const range of selection.ranges) {
    const from = range.from;
    const to = range.to;
    
    if (from === to) {
      // No selection, insert placeholders
      changes.push({ from, to, insert: "```\nCode block\n```" });
    } else {
      const selectedText = state.doc.sliceString(from, to);
      // Check if already a code block
      if (selectedText.startsWith('```') && selectedText.endsWith('```')) {
        changes.push({ 
          from, 
          to, 
          insert: selectedText.substring(3, selectedText.length - 3).trim() 
        });
      } else {
        changes.push({ from, to, insert: `\`\`\`\n${selectedText}\n\`\`\`` });
      }
    }
  }
  
  if (dispatch) {
    dispatch({ changes });
  }
  
  return true;
}

// Helper to create heading toggle functions
function setHeading(level: number) {
  return ({ state, dispatch }: EditorView) => {
    const selection = state.selection;
    let changes = [];
    
    for (const range of selection.ranges) {
      const from = range.from;
      
      // Get the current line
      const line = state.doc.lineAt(from);
      const lineText = line.text;
      
      // Check if already a heading
      const headingMatch = lineText.match(/^(#{1,6})\s/);
      
      if (headingMatch) {
        // Replace existing heading
        const newLine = lineText.replace(/^#{1,6}\s/, '#'.repeat(level) + ' ');
        changes.push({
          from: line.from,
          to: line.to,
          insert: newLine
        });
      } else {
        // Add new heading
        changes.push({
          from: line.from,
          to: line.from,
          insert: '#'.repeat(level) + ' '
        });
      }
    }
    
    if (dispatch) {
      dispatch({ changes });
    }
    
    return true;
  };
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
.preview a.internal-link {
  color: #a277ff;
  text-decoration: none;
}

.light-theme .preview a.internal-link {
  color: #8457d3;
}

.preview a.internal-link:hover {
  text-decoration: underline;
}

/* Text formatting */
.preview strong {
  font-weight: bold;
}

.preview em {
  font-style: italic;
}

.preview del {
  text-decoration: line-through;
}

.preview mark {
  background-color: rgba(246, 189, 96, 0.7);
  padding: 0 2px;
  border-radius: 2px;
}

.light-theme .preview mark {
  background-color: rgba(255, 204, 0, 0.4);
}

/* Code */
.preview code {
  font-family: 'Fira Code', 'Source Code Pro', monospace;
  background-color: rgba(128, 128, 128, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.preview pre {
  background-color: rgba(40, 44, 52, 0.85);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.light-theme .preview pre {
  background-color: #f5f5f5;
}

.preview pre code {
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #d9e0ee;
}

.light-theme .preview pre code {
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
.preview .task-list-item {
  list-style: none;
  margin-left: -1.5em;
  position: relative;
}

.preview .task-list-item input[type="checkbox"] {
  margin-right: 0.5em;
  cursor: pointer;
}

.light-theme .preview .task-list-item input[type="checkbox"] {
  accent-color: #5073de;
}

.dark-theme .preview .task-list-item input[type="checkbox"] {
  accent-color: #7aa2f7;
}

.preview .task-completed {
  text-decoration: line-through;
  color: rgba(217, 224, 238, 0.6);
}

.light-theme .preview .task-completed {
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
.preview .callout {
  margin: 1.5em 0;
  padding: 0.75em;
  border-radius: 4px;
  border-left: 4px solid;
}

.preview .callout-title {
  font-weight: 600;
  margin-bottom: 0.5em;
}

.preview .callout-content {
  margin-top: 0.5em;
}

/* Callout types */
.preview .callout.note {
  background-color: rgba(68, 138, 255, 0.1);
  border-left-color: #448aff;
}

.preview .callout.warning {
  background-color: rgba(255, 145, 0, 0.1);
  border-left-color: #ff9100;
}

.preview .callout.danger {
  background-color: rgba(255, 82, 82, 0.1);
  border-left-color: #ff5252;
}

.preview .callout.info {
  background-color: rgba(0, 184, 212, 0.1);
  border-left-color: #00b8d4;
}

.preview .callout.success {
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
.preview .mermaid-diagram {
  text-align: center;
  margin: 1.5em 0;
}

.preview .mermaid-error {
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

/* CodeMirror live preview extensions */
.editor-container.live-preview .cm-formatting {
  opacity: 0.6;
}

.editor-container.live-preview .cm-header {
  font-weight: bold;
}

.editor-container.live-preview .cm-em {
  font-style: italic;
}

.editor-container.live-preview .cm-strong {
  font-weight: bold;
}

.editor-container.live-preview .cm-strikethrough {
  text-decoration: line-through;
}

.editor-container.live-preview .cm-highlight {
  background-color: rgba(246, 189, 96, 0.3);
  border-radius: 2px;
}

/* Placeholder styling */
.cm-placeholder {
  color: #999;
  display: inline-block;
  font-style: italic;
  pointer-events: none;
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
</style>
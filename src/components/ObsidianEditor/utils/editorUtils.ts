import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection } from '@codemirror/view';
import { history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { keymap } from '@codemirror/view';
import { indentWithTab, defaultKeymap } from '@codemirror/commands';

import { placeholder } from '../extensions/placeholderExtension';
import { createLivePreviewExtensions } from '../extensions/livePreviewExtensions';
import { getEditorTheme, getEditorStyle } from '../themes/themeConfig';
import { toggleBold, toggleItalic, toggleStrikethrough, toggleWikiLink, 
         toggleExternalLink, toggleHighlight, setHeading, toggleTaskList, 
         toggleInlineCode, toggleCodeBlock } from '../commands/editorCommands';

// Type definitions
export type EditorMode = 'live-preview' | 'source' | 'reading';

// Core extensions that apply to all editor modes
export function getCoreExtensions(placeholderText: string, isDarkTheme: boolean, onDocChange: (content: string) => void): Extension[] {
  return [
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
      { key: "Mod-Shift-c", run: toggleCodeBlock }
    ]),
    
    // Editor theme
    getEditorTheme(isDarkTheme),
    
    // Editor style
    getEditorStyle(isDarkTheme, placeholderText),
    
    // Placeholder text
    placeholder(placeholderText || "Start writing..."),
    
    // Update listener for content changes
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        const content = update.state.doc.toString();
        onDocChange(content);
      }
    })
  ];
}

// Get extensions specific to source mode
export function getSourceModeExtensions(): Extension[] {
  return [
    // Line numbers for source mode
    lineNumbers()
  ];
}

// Toggle a task item in the markdown content
export function toggleTaskInMarkdown(listItem: Element, markdownContent: string): string {
  // Get the text content of the task
  const taskText = listItem.textContent?.trim().replace(/^\s*☐\s*|\s*☑\s*/, '') || '';
  
  // Find and toggle the task in the markdown
  const lines = markdownContent.split('\n');
  
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
      
      // Return the updated content
      return lines.join('\n');
    }
  }
  
  // If no match found, return the original content
  return markdownContent;
}
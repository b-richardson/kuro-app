import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';

// Get theme configuration for CodeMirror
export function getEditorTheme(isDarkTheme: boolean): Extension {
  return EditorView.theme({
    // Base theme
    "&": {
      backgroundColor: isDarkTheme ? "#1e1e2e" : "#ffffff",
      color: isDarkTheme ? "#d9e0ee" : "#2e3338",
    },
    // Syntax highlighting
    ".cm-header": {
      fontWeight: "bold",
      color: isDarkTheme ? "#89b4fa" : "#0077cc"
    },
    ".cm-em": {
      fontStyle: "italic"
    },
    ".cm-strong": {
      fontWeight: "bold"
    },
    ".cm-link": {
      color: isDarkTheme ? "#89b4fa" : "#0077cc",
      textDecoration: "underline"
    },
    ".cm-url": {
      color: isDarkTheme ? "#89dceb" : "#0099cc"
    },
    // Code blocks
    ".cm-inline-code": {
      fontFamily: "'Fira Code', 'Source Code Pro', monospace",
      backgroundColor: isDarkTheme ? "rgba(40, 44, 52, 0.5)" : "rgba(0, 0, 0, 0.05)",
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
      color: isDarkTheme ? "#d9e0ee" : "#2e3338"
    },
    // Task lists
    ".cm-taskmarker": {
      color: isDarkTheme ? "#89b4fa" : "#0077cc"
    },
    // Highlight
    ".cm-highlight": {
      backgroundColor: isDarkTheme ? "rgba(246, 189, 96, 0.3)" : "rgba(255, 204, 0, 0.3)",
      borderRadius: "2px"
    },
    // Wiki links
    ".cm-wikilink": {
      color: isDarkTheme ? "#a277ff" : "#8457d3",
      textDecoration: "none"
    }
  });
}

// Get editor style extension
export function getEditorStyle(isDarkTheme: boolean, placeholder: string): Extension {
  return EditorView.theme({
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
      caretColor: isDarkTheme ? "#d9e0ee" : "#333333"
    },
    ".cm-placeholder": {
      color: "#999",
      display: "inline-block",
      fontStyle: "italic",
      pointerEvents: "none"
    }
  });
}
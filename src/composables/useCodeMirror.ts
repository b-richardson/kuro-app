import {
  EditorView,
  keymap,
  ViewUpdate,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightSpecialChars,
} from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
} from "@codemirror/language";
import { Compartment } from "@codemirror/state";

// 🎨 Obsidian-like theme (override with theme prop if needed)
const obsidianTheme = EditorView.theme({
  "&": {
    backgroundColor: "#1e1e2e",
    color: "#dcddde",
    height: "100%",
    fontSize: "15px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    lineHeight: "1.6",
  },
  ".cm-content": {
    padding: "4px 0",
    caretColor: "#dcddde",
  },
  ".cm-line": {
    padding: "0 24px",
  },
  ".cm-cursor": {
    borderLeftWidth: "2px",
    borderLeftColor: "#dcddde",
    borderLeftStyle: "solid",
  },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(74, 98, 154, 0.3)",
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e2e",
    color: "#666",
    border: "none",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  },
  ".cm-gutterElement": {
    padding: "0 14px 0 8px",
  },
  ".tok-header": { color: "#7c90d5", fontWeight: "bold" },
  ".tok-header.tok-header-1": { fontSize: "1.8em" },
  ".tok-header.tok-header-2": { fontSize: "1.5em" },
  ".tok-header.tok-header-3": { fontSize: "1.3em" },
  ".tok-header.tok-header-4": { fontSize: "1.15em" },
  ".tok-header.tok-header-5": { fontSize: "1.08em" },
  ".tok-header.tok-header-6": { fontSize: "1.05em" },
  ".tok-strong": { color: "#ffffff", fontWeight: "bold" },
  ".tok-emphasis": { color: "#dcdcdc", fontStyle: "italic" },
  ".tok-url": { color: "#6dbedf" },
  ".tok-name": { color: "#6dbedf" },
  ".tok-monospace": {
    color: "#f98d70",
    backgroundColor: "rgba(40, 40, 40, 0.4)",
    padding: "0 3px",
    borderRadius: "3px",
  },
  ".tok-list": { color: "#f2ce6a" },
  ".tok-quote": {
    color: "#a6b4c4",
    borderLeft: "3px solid rgba(255, 255, 255, 0.2)",
    paddingLeft: "10px",
  },
  ".tok-punctuation": { color: "#888" },
});

const editableCompartment = new Compartment();

interface CodeMirrorOptions {
  container: HTMLElement;
  initialDoc: string;
  readOnly: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  height?: string;
  theme?: "obsidian" | "light" | "custom";
  onChange?: (doc: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function useCodeMirror(options: CodeMirrorOptions) {
  const {
    container,
    initialDoc,
    readOnly,
    showLineNumbers = false,
    fontSize = 15,
    height = "100%",
    theme = "obsidian",
    onChange,
    onFocus,
    onBlur,
  } = options;

  const customStyle = EditorView.theme({
    "&": {
      height,
      fontSize: `${fontSize}px`,
    },
  });

  const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
    if (vu.docChanged && onChange) {
      onChange(vu.state.doc.toString());
    }
  });

  const eventHandlers = EditorView.domEventHandlers({
    focus: () => onFocus?.(),
    blur: () => onBlur?.(),
  });

  // 🔌 Core Extensions
  const extensions: Extension[] = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle),
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    bracketMatching(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    keymap.of([...historyKeymap, indentWithTab]),
    editableCompartment.of(EditorView.editable.of(!readOnly)),
    updateListener,
    eventHandlers,
    customStyle,
  ];

  if (showLineNumbers) {
    extensions.push(lineNumbers());
  }

  // 🧠 Theme handling
  if (theme === "obsidian") {
    extensions.push(obsidianTheme);
  } else if (theme === "light") {
    // Swap in your preferred light theme here
    // extensions.push(lightTheme);
  }

  const state = EditorState.create({
    doc: initialDoc,
    extensions,
  });

  let view: EditorView;
  try {
    view = new EditorView({
      state,
      parent: container,
    });
  } catch (error) {
    console.error("Failed to mount CodeMirror editor:", error);
    throw error;
  }

  return {
    view,
    update(doc: string) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: doc },
      });
    },
    insertTextAtCursor(text: string) {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
    },
    replaceSelection(text: string) {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
    },
    scrollToLine(lineNumber: number) {
      const line = view.state.doc.line(
        Math.min(lineNumber, view.state.doc.lines)
      );
      view.dispatch({
        effects: EditorView.scrollIntoView(line.from, { y: "start" }),
      });
    },
    setReadOnly(isReadOnly: boolean) {
      view.dispatch({
        effects: editableCompartment.reconfigure(
          EditorView.editable.of(!isReadOnly)
        ),
      });
    },
    getFocus() {
      view.focus();
    },
    destroy() {
      view.destroy();
    },
  };
}

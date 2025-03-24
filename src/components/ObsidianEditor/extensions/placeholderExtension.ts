import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, ViewPlugin } from '@codemirror/view';

// Custom placeholder implementation for CodeMirror 6
export function placeholder(placeholderText: string): Extension {
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
// Create a new file: extensions/ObsidianTemplateVars.ts
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Regex to match Obsidian template variables
const TEMPLATE_VAR_REGEX = /\{\{([^}]+)\}\}/g;

export const ObsidianTemplateVars = Extension.create({
  name: "obsidianTemplateVars",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("obsidianTemplateVars"),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || "";
              let match;

              // Find all template variables in the text
              while ((match = TEMPLATE_VAR_REGEX.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const varContent = match[1];

                // Add decoration for the template variable
                decorations.push(
                  Decoration.inline(start, end, {
                    class: "obsidian-template-var",
                    style: `
                      background-color: rgba(130, 170, 255, 0.15);
                      border-radius: 3px;
                      padding: 0 2px;
                      color: #a6c1ff;
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 0.9em;
                    `,
                    "data-var-content": varContent,
                  })
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Regex to match Dataview code blocks
const DATAVIEW_REGEX = /```dataview\s*([\s\S]*?)```/g;

export const ObsidianDataview = Extension.create({
  name: "obsidianDataview",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("obsidianDataview"),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || "";
              let match;

              // Find all dataview blocks in the text
              while ((match = DATAVIEW_REGEX.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const queryContent = match[1];

                // Add decoration for the dataview block
                decorations.push(
                  Decoration.inline(start, end, {
                    class: "obsidian-dataview-block",
                    style: `
                      display: block;
                      background-color: #2d2d2d;
                      color: #7aa2f7;
                      font-family: 'JetBrains Mono', monospace;
                      padding: 1em;
                      margin: 1em 0;
                      border-radius: 4px;
                      white-space: pre-wrap;
                      overflow-x: auto;
                    `,
                    "data-dataview-query": queryContent,
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

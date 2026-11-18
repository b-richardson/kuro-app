import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Regex to match [[link]] patterns
const INTERNAL_LINK_REGEX = /\[\[(.*?)\]\]/g;

export const ObsidianLink = Extension.create({
  name: "obsidianLink",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("obsidianLink"),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || "";
              let match;

              while ((match = INTERNAL_LINK_REGEX.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const linkText = match[1];

                decorations.push(
                  Decoration.inline(start, end, {
                    class: "obsidian-internal-link",
                    style: `
                      color: var(--link-color, #7aa2f7);
                      background-color: rgba(122, 162, 247, 0.1);
                      border-radius: 3px;
                      padding: 0 2px;
                      text-decoration: none;
                    `,
                    title: `Link to "${linkText}"`,
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

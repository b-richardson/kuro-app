// Create a new file: extensions/ObsidianFrontmatter.ts
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Regex to match frontmatter
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

export const ObsidianFrontmatter = Extension.create({
  name: "obsidianFrontmatter",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("obsidianFrontmatter"),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            // Look only at the first node for frontmatter
            const firstNode = doc.firstChild;
            if (!firstNode || !firstNode.isText) return DecorationSet.empty;

            const text = firstNode.text || "";
            const match = FRONTMATTER_REGEX.exec(text);

            if (match) {
              const start = 0;
              const end = match[0].length;

              decorations.push(
                Decoration.inline(start, end, {
                  class: "obsidian-frontmatter",
                  style: `
                    display: block;
                    background-color: #2d2d2d;
                    color: #999;
                    font-family: 'JetBrains Mono', monospace;
                    padding: 0.5em;
                    margin: 0 0 1em 0;
                    border-radius: 4px;
                    white-space: pre-wrap;
                  `,
                })
              );
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// custom-extensions/obsidianDataviewTable.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderDataviewTable from "./RenderDataviewTable.vue";

export const ObsidianDataviewTable = Node.create({
  name: "obsidianDataviewTable", // Different name from obsidianDataview

  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      language: {
        default: "dataview",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (node) => {
          if (
            typeof node === "object" &&
            node !== null &&
            (node as HTMLElement).getAttribute("data-language") ===
              "dataview" &&
            // Explicitly check that this IS a TABLE query
            (node as HTMLElement).textContent
              ?.trim()
              .toUpperCase()
              .startsWith("TABLE ")
          ) {
            return { language: "dataview" };
          }
          return false;
        },
      },
      {
        tag: "div.dataview-table-container",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "dataview-table-container" },
      ["pre", { "data-language": "dataview" }, ["code", {}, 0]],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderDataviewTable);
  },

  // Custom markdown serialization
  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          state.write("```dataview\n");
          state.text(node.textContent);
          state.write("\n```");
        },
      },
    };
  },
});

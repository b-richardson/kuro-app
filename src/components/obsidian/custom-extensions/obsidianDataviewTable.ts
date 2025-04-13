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
          if (typeof node !== "object" || node === null) return false;
          const el = node as HTMLElement;
          const lang = el.getAttribute("data-language");
          const text = el.textContent?.trim();

          if (
            (lang === "dataview" && text?.toUpperCase().startsWith("TABLE ")) ||
            (lang === "dataviewjs" && text?.includes("dv.table("))
          ) {
            return { language: lang };
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

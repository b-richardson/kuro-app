import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderDataviewBlock from "./RenderDataviewBlock.vue";

export const ObsidianDataview = Node.create({
  name: "obsidianDataview",

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
            (node as HTMLElement).getAttribute("data-language") === "dataview"
          ) {
            return { language: "dataview" };
          }
          return false;
        },
      },
      {
        tag: "div.dataview-block-container",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "dataview-block-container" },
      ["pre", { "data-language": "dataview" }, ["code", {}, 0]],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderDataviewBlock);
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

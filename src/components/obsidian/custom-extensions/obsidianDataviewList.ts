import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderDataviewList from "./RenderDataviewList.vue";

export const ObsidianDataviewList = Node.create({
  name: "obsidianDataviewList",

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
            const text = (node as HTMLElement).textContent
              ?.trim()
              .toUpperCase();
            if (!text?.startsWith("TABLE") && !text?.startsWith("CALENDAR")) {
              return { language: "dataview" };
            }
          }
          return false;
        },
      },
      {
        tag: "div.dataview-list-container", // Changed class name
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "dataview-list-container" }, // Changed class name
      ["pre", { "data-language": "dataview" }, ["code", {}, 0]],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderDataviewList);
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

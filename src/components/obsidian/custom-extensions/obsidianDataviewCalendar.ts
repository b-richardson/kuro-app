import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import RenderDataviewCalendar from "./RenderDataviewCalendar.vue";

export const ObsidianDataviewCalendar = Node.create({
  name: "obsidianDataviewCalendar",

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
            (node as HTMLElement).textContent
              ?.trim()
              .toUpperCase()
              .startsWith("CALENDAR ")
          ) {
            return { language: "dataview" };
          }
          return false;
        },
      },
      {
        tag: "div.dataview-calendar-container",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "dataview-calendar-container" },
      ["pre", { "data-language": "dataview" }, ["code", {}, 0]],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderDataviewCalendar);
  },

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

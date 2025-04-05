import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import { Plugin, PluginKey } from "prosemirror-state";
import RenderTemplaterTransform from "./RenderTemplaterTransform.vue";

export const ObsidianTemplaterTransform = Node.create({
  name: "obsidianTemplaterTransform",

  group: "inline",
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      // Store the original templater code
      originalCode: {
        default: '<% tp.user.transformedValue = "defaultText".toUpperCase() %>',
        parseHTML: (element) => {
          return element.getAttribute("data-code") || element.textContent;
        },
      },
      // Store the transformation type for display
      transformType: {
        default: "textCase",
        parseHTML: (element) => {
          return element.getAttribute("data-transform-type") || "textCase";
        },
      },
      // Store whether this is a variable assignment
      hasVariable: {
        default: false,
        parseHTML: (element) => {
          return element.getAttribute("data-has-variable") === "true";
        },
      },
      // Store the variable name if applicable
      variableName: {
        default: "",
        parseHTML: (element) => {
          return element.getAttribute("data-variable-name") || "";
        },
      },
      // Store information about what's being transformed
      inputSource: {
        default: "text",
        parseHTML: (element) => {
          return element.getAttribute("data-input-source") || "text";
        },
      },
      // Store display info for rendering
      displayInfo: {
        default: {},
        parseHTML: (element) => {
          const infoStr = element.getAttribute("data-display-info");
          try {
            return infoStr ? JSON.parse(infoStr) : {};
          } catch (e) {
            return {};
          }
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.templater-transform",
        getAttrs: (node) => {
          if (typeof node === "string") return {};

          const element = node as HTMLElement;
          const hasVariable =
            element.getAttribute("data-has-variable") === "true";
          const infoStr = element.getAttribute("data-display-info");
          let displayInfo = {};

          try {
            displayInfo = infoStr ? JSON.parse(infoStr) : {};
          } catch (e) {
            displayInfo = {};
          }

          return {
            originalCode:
              element.getAttribute("data-code") || element.textContent,
            transformType:
              element.getAttribute("data-transform-type") || "textCase",
            hasVariable: hasVariable,
            variableName: element.getAttribute("data-variable-name") || "",
            inputSource: element.getAttribute("data-input-source") || "text",
            displayInfo: displayInfo,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const {
      originalCode,
      transformType,
      hasVariable,
      variableName,
      inputSource,
      displayInfo,
      ...otherAttrs
    } = HTMLAttributes;

    // Convert displayInfo object to JSON string for HTML attribute
    const displayInfoStr =
      typeof displayInfo === "object" ? JSON.stringify(displayInfo) : "{}";

    return [
      "span",
      mergeAttributes(
        {
          class: "templater-transform",
          "data-code": originalCode,
          "data-transform-type": transformType,
          "data-has-variable": hasVariable ? "true" : "false",
          "data-variable-name": variableName || "",
          "data-input-source": inputSource || "text",
          "data-display-info": displayInfoStr,
        },
        otherAttrs
      ),
      originalCode,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(RenderTemplaterTransform as any);
  },

  // Add a plugin to detect and replace Templater transform syntax
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("templaterTransformDetector"),
        appendTransaction: (transactions, oldState, newState) => {
          // Skip if no changes
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const { tr } = newState;
          let modified = false;

          // Find text nodes containing Templater transform syntax
          newState.doc.descendants((node, pos) => {
            if (!node.isText) return true;

            const text = node.text || "";

            // Match patterns for transformations
            const patterns = [
              // Variable assignment with specific transformations
              {
                regex:
                  /<%(.*?)tp\.user\.(\w+)\s*=\s*(.*?)toUpperCase\(\)(.*)%>/g,
                transformType: "textCase",
                displayInfo: { caseType: "uppercase" },
              },
              {
                regex:
                  /<%(.*?)tp\.user\.(\w+)\s*=\s*(.*?)toLowerCase\(\)(.*)%>/g,
                transformType: "textCase",
                displayInfo: { caseType: "lowercase" },
              },
              {
                regex:
                  /<%(.*?)tp\.user\.(\w+)\s*=\s*(.*?)replace\(\/\\b\\w\/g(.*)%>/g,
                transformType: "textCase",
                displayInfo: { caseType: "titlecase" },
              },
              // Add patterns for direct transformations without variable
              {
                regex: /<%(.*?)(["'].*?["']|\w+)\.toUpperCase\(\)(.*)%>/g,
                transformType: "textCase",
                displayInfo: { caseType: "uppercase" },
              },
              {
                regex: /<%(.*?)(["'].*?["']|\w+)\.toLowerCase\(\)(.*)%>/g,
                transformType: "textCase",
                displayInfo: { caseType: "lowercase" },
              },
              // Add more patterns as needed
            ];

            for (const pattern of patterns) {
              let match;

              while ((match = pattern.regex.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const codeText = match[0];

                // Determine transformation type and gather display info
                let transformType = "textCase";
                let inputSource = "text";
                let hasVariable = false;
                let variableName = "";
                let displayInfo = {};

                // Check for variable assignment
                if (match[2] && match[0].includes("tp.user.")) {
                  hasVariable = true;
                  variableName = match[2];
                }

                // Determine if input is text or variable
                if (match[0].includes('"') || match[0].includes("'")) {
                  inputSource = "text";
                } else {
                  inputSource = "variable";
                }

                // Determine transformation type and extract display info
                if (
                  match[0].includes("toUpperCase") ||
                  match[0].includes("toLowerCase") ||
                  match[0].includes("replace(/\\b\\w/g") ||
                  match[0].includes("charAt(0).toUpperCase()")
                ) {
                  transformType = "textCase";

                  // Try to determine which case transformation
                  if (match[0].includes("toUpperCase")) {
                    displayInfo = { caseType: "uppercase" };
                  } else if (match[0].includes("toLowerCase")) {
                    if (match[0].includes('replace(/\\s+/g, "-")')) {
                      displayInfo = { caseType: "kebabcase" };
                    } else if (match[0].includes('replace(/\\s+/g, "_")')) {
                      displayInfo = { caseType: "snakecase" };
                    } else {
                      displayInfo = { caseType: "lowercase" };
                    }
                  } else if (match[0].includes("replace(/\\b\\w/g")) {
                    displayInfo = { caseType: "titlecase" };
                  } else if (match[0].includes("charAt(0).toUpperCase()")) {
                    displayInfo = { caseType: "sentencecase" };
                  } else if (
                    match[0].includes(
                      "toLowerCase().replace(/[^a-zA-Z0-9]+(.)|(^[a-zA-Z])/g"
                    )
                  ) {
                    displayInfo = { caseType: "camelcase" };
                  }
                } else if (
                  match[0].includes(".replace(") ||
                  (match[0].includes(".split(") && match[0].includes(".join("))
                ) {
                  transformType = "substitution";
                } else if (
                  match[0].includes("toLocaleString") ||
                  match[0].includes("toFixed")
                ) {
                  transformType = "format";
                  displayInfo = { formatType: "number" };
                } else if (
                  match[0].includes("moment") ||
                  match[0].includes(".format(")
                ) {
                  transformType = "format";
                  displayInfo = { formatType: "date" };
                }

                // Replace with transform node
                tr.replaceWith(
                  start,
                  end,
                  newState.schema.nodes.obsidianTemplaterTransform.create({
                    originalCode: codeText,
                    transformType,
                    hasVariable,
                    variableName,
                    inputSource,
                    displayInfo,
                  })
                );

                modified = true;
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },

  // Custom markdown serialization to preserve templater syntax
  addStorage() {
    return {
      markdown: {
        serialize: (state: any, node: any) => {
          // Output the original templater code
          state.write(node.attrs.originalCode || '<% "text".toUpperCase() %>');
        },
      },
    };
  },
});

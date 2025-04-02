import { PluginType, ModuleType } from "@/types/TemplateModule";

/**
 * Basic default content for modules - used primarily for UI previews
 * Note: Consider migrating this to specific module components in the future
 */
export function generateDefaultContent(
  moduleType: ModuleType,
  pluginType: PluginType = null
): string[] {
  switch (moduleType) {
    // Basic module types
    case "header":
      return ["# New Header"];
    case "checklist":
      return [""];  // Now self-contained in ChecklistModule.vue
    case "table":
      return [
        "| Header 1 | Header 2 | Header 3 |",
        "|----------|----------|----------|",
        "| Cell 1   | Cell 2   | Cell 3   |",
        "| Cell 4   | Cell 5   | Cell 6   |",
      ];
    case "text":
      return ["Enter your text here..."];
    case "divider":
      return ["---"];
    case "yaml":
      return [
        "---",
        "title: Untitled Note",
        "created: " + new Date().toISOString().split("T")[0],
        "tags: []",
        "---",
      ];
      
    // Templater plugin modules
    case "templaterField":
      return ["<% tp.date.now() %>"];
    case "templaterDateAndTime":
      return ["<% tp.date.now() %>", "<% tp.date.yesterday() %>"];
    case "templaterFileProperty":
      return ["<% tp.file.title %>", "<% tp.file.path() %>"];
    case "templaterUserInput":
      return ['Enter your name: <% tp.system.prompt("Name") %>'];
    case "templaterConditionalContent":
      return ['<% if (condition) { %> Content when true <% } %>'];
    case "templaterValueTransformation":
      return ['<% tp.system.prompt("Value").toUpperCase() %>'];
    case "templaterTemplateVariables":
      return ['<% tp.file.include("Template Name") %>'];
      
    // Dataview plugin modules
    case "dataviewQuery":
      return ["```dataview", "LIST", 'FROM ""', "```"];
    case "dataviewListQuery":
      return ["```dataview", "LIST", "FROM #tag", "```"];
    case "dataviewTableQuery":
      return ["```dataview", "TABLE file.ctime, file.mtime", 'FROM "folder"', "```"];
    case "dataviewTaskQuery":
      return ["```dataview", "TASK", "FROM #project", "```"];
    case "dataviewCalendarQuery":
      return ["```dataview", "CALENDAR file.ctime", 'FROM "Daily Notes"', "```"];
    case "dataviewInlineFields":
      return ["Due:: 2023-12-31", "Status:: #in-progress", "Priority:: High"];
      
    default:
      return [""];
  }
}

/**
 * Gets the display name for a plugin type
 * @param pluginType The plugin type
 * @returns A user-friendly display name
 */
export function getPluginDisplayName(pluginType: PluginType): string {
  switch (pluginType) {
    case "templater":
      return "Templater";
    case "dataview":
      return "Dataview";
    default:
      return "";
  }
}

/**
 * Gets the icon class for a module type
 * @param moduleType The module type
 * @returns Font Awesome icon class
 */
export function getModuleIcon(moduleType: ModuleType): string {
  switch (moduleType) {
    // Basic module types
    case "header":
      return "fas fa-heading";
    case "checklist":
      return "fas fa-check-square";
    case "table":
      return "fas fa-table";
    case "text":
      return "fas fa-align-left";
    case "divider":
      return "fas fa-minus";
    case "yaml":
      return "fas fa-code";

    // Templater plugin modules
    case "templaterField":
      return "fas fa-calendar-alt";
    case "templaterDateAndTime":
      return "fas fa-clock";
    case "templaterUserInput":
      return "fas fa-user-edit";
    case "templaterFileProperty":
      return "fas fa-file-alt";
    case "templaterConditionalContent":
      return "fas fa-code-branch";
    case "templaterValueTransformation":
      return "fas fa-exchange-alt";
    case "templaterTemplateVariables":
      return "fas fa-cogs";

    // Dataview plugin modules
    case "dataviewQuery":
      return "fas fa-database";
    case "dataviewListQuery":
      return "fas fa-list";
    case "dataviewTableQuery":
      return "fas fa-table";
    case "dataviewTaskQuery":
      return "fas fa-tasks";
    case "dataviewCalendarQuery":
      return "fas fa-calendar";
    case "dataviewInlineFields":
      return "fas fa-list-alt";
    default:
      return "fas fa-file-alt";
  }
}

/**
 * Gets the icon class for a plugin type
 * @param pluginType The plugin type
 * @returns Font Awesome icon class
 */
export function getPluginIcon(pluginType: PluginType): string {
  switch (pluginType) {
    case "templater":
      return "fas fa-calendar-alt";
    case "dataview":
      return "fas fa-database";
    default:
      return "";
  }
}

/**
 * Validates if a value is a valid PluginType
 */
export function isValidPluginType(type: any): type is PluginType {
  return ["templater", "dataview", null].includes(type);
}

/**
 * Validates if a value is a valid ModuleType
 */
export function isValidModuleType(type: any): type is ModuleType {
  return [
    // Basic module types
    "header",
    "checklist",
    "table",
    "text",
    "divider",
    "yaml",

    // Templater plugin modules
    "templaterField",
    "templaterDateAndTime",
    "templaterFileProperty",
    "templaterUserInput",
    "templaterConditionalContent",
    "templaterValueTransformation",
    "templaterTemplateVariables",

    // Dataview plugin modules
    "dataviewQuery",
    "dataviewListQuery",
    "dataviewTableQuery",
    "dataviewTaskQuery",
    "dataviewCalendarQuery",
    "dataviewInlineFields",
  ].includes(type);
}

/**
 * Validates plugin-specific syntax (stub to maintain compatibility)
 * @deprecated Use ObsidianEditor's native validation instead
 */
export function validatePluginSyntax(
  pluginType: PluginType,
  content: string[],
  moduleType?: ModuleType
): { isValid: boolean; error?: string } {
  // Basic empty content check only
  if (!content || content.length === 0 || (content.length === 1 && content[0] === "")) {
    return { isValid: false, error: "Content cannot be empty" };
  }
  
  // Always return valid since we're using the ObsidianEditor component now
  return { isValid: true };
}

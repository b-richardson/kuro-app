import { PluginType, ModuleType } from "@/types/TemplateModule";

// WE DO NOT NEED TO BE IMPLIMENTING DEFAUKT CONTENT FOR MODULES ANYMORE! THIS SHOULD ALL BE HANDLED IN WHATEVER WAY THE MODULES NEED TO INDIVIDUALLIY INSIDE THE MODULES
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
      return [""]; // Now self-contained in ChecklistModule.vue
    case "table":
      return [""]; // Now self-contained in TableModule.vue
    case "text":
      return [""];
    case "divider":
      return [""];

    // Templater plugin modules
    case "templaterField":
      return [""];
    case "templaterDateAndTime":
      return [""];
    case "templaterFileProperty":
      return [""];
    case "templaterUserInput":
      return [];
    case "templaterConditionalContent":
      return [""];
    case "templaterValueTransformation":
      return [""];
    case "templaterTemplateVariables":
      return [""];

    // Dataview plugin modules
    case "dataviewQuery":
      return [""];
    case "dataviewListQuery":
      return [""];
    case "dataviewTableQuery":
      return [""];
    case "dataviewTaskQuery":
      return [""];
    case "dataviewCalendarQuery":
      return [""];
    case "dataviewInlineFields":
      return [""];

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
    case "codeBlock":
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
    "codeBlock",

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
  if (
    !content ||
    content.length === 0 ||
    (content.length === 1 && content[0] === "")
  ) {
    return { isValid: false, error: "Content cannot be empty" };
  }

  // Always return valid since we're using the ObsidianEditor component now
  return { isValid: true };
}

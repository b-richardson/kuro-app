import { PluginType, ModuleType } from "@/types/TemplateModule";
import { validateDataviewFields } from "./dataviewFieldsUtils";

/**
 * Constants for Templater plugin
 */
export const TEMPLATER = {
  // Common Templater date formats
  DATE_FORMATS: {
    STANDARD: "YYYY-MM-DD",
    US: "MM/DD/YYYY",
    EUROPE: "DD.MM.YYYY",
    FULL: "dddd, MMMM Do YYYY",
    ISO: "YYYY-MM-DDTHH:mm:ssZ",
  },
  // Commonly used Templater variable functions
  VARIABLES: {
    CURRENT_DATE: "<% tp.date.now() %>",
    CURRENT_DATE_FORMATTED: '<% tp.date.now("YYYY-MM-DD") %>',
    YESTERDAY: "<% tp.date.yesterday() %>",
    TOMORROW: "<% tp.date.tomorrow() %>",
    TITLE: "<% tp.file.title %>",
    CREATED_DATE: "<% tp.file.creation_date() %>",
    CURSOR_POSITION: "<% tp.file.cursor() %>",
  },
  // Common snippets
  SNIPPETS: {
    RANDOM_QUOTE: "<% tp.web.random_quote() %>",
    WEATHER: '<% tp.web.daily_weather("CITY_NAME") %>',
  },
};

/**
 * Constants for Dataview plugin
 */
export const DATAVIEW = {
  // Query types
  QUERY_TYPES: {
    LIST: "list",
    TABLE: "table",
    TASK: "task",
    CALENDAR: "calendar",
  },
  // Common dataview queries
  QUERIES: {
    RECENT_NOTES:
      '```dataview\nLIST\nFROM "" WHERE file.cday >= date(today) - dur(7 days)\nSORT file.cday DESC\n```',
    PROJECT_TASKS: "```dataview\nTASK\nFROM #project\nWHERE !completed\n```",
    LINKED_MENTIONS: "```dataview\nLIST\nFROM [[]]  \nSORT file.name ASC\n```",
    TAG_TABLE:
      "```dataview\nTABLE file.cday as Created, file.mday as Modified\nFROM #tag\nSORT file.name ASC\n```",
  },
};

/**
 * Constants for Kanban plugin
 */
export const KANBAN = {
  // Basic kanban board structure
  DEFAULT_BOARD: [
    "---",
    "kanban-plugin: basic",
    "---",
    "",
    "## Todo",
    "",
    "- [ ] Task 1",
    "- [ ] Task 2",
    "",
    "## In Progress",
    "",
    "- [ ] Task 3",
    "",
    "## Done",
    "",
    "- [x] Completed task",
  ].join("\n"),
  // Kanban settings in YAML
  SETTINGS: {
    DEFAULT: "kanban-plugin: basic",
    DETAILED: [
      "kanban-plugin: true",
      "date-display-format: MM/DD/YYYY",
      "hide-tags-in-title: true",
      "lane-width: 300",
    ].join("\n"),
  },
};

/**
 * Validates plugin-specific syntax based on plugin type and content
 * @param pluginType The plugin type to validate
 * @param content The content to validate
 * @returns An object with isValid flag and potential error message
 */
export function validatePluginSyntax(
  pluginType: PluginType,
  content: string[],
  moduleType?: ModuleType
): { isValid: boolean; error?: string } {
  if (
    !content ||
    content.length === 0 ||
    (content.length === 1 && content[0] === "")
  ) {
    return { isValid: false, error: "Content cannot be empty" };
  }

  switch (pluginType) {
    case "templater":
      // Your existing Templater validation
      break;
    case "dataview":
      // Different validation for different dataview module types
      if (
        moduleType === "dataviewQuery" ||
        moduleType === "dataviewListQuery" ||
        moduleType === "dataviewTableQuery" ||
        moduleType === "dataviewTaskQuery" ||
        moduleType === "dataviewCalendarQuery"
      ) {
        // Check for dataview code block
        const hasDataviewCodeBlock = content.some((line) =>
          line.includes("```dataview")
        );
        if (!hasDataviewCodeBlock) {
          return {
            isValid: false,
            error: "Dataview query must be inside a dataview code block",
          };
        }

        // Check for specific query type based on module type
        if (
          moduleType === "dataviewListQuery" &&
          !content.some((line) => line.trim() === "LIST")
        ) {
          return {
            isValid: false,
            error: "LIST query type required for List Query module",
          };
        }

        if (
          moduleType === "dataviewTableQuery" &&
          !content.some((line) => line.trim().startsWith("TABLE"))
        ) {
          return {
            isValid: false,
            error: "TABLE query type required for Table Query module",
          };
        }

        if (
          moduleType === "dataviewTaskQuery" &&
          !content.some((line) => line.trim() === "TASK")
        ) {
          return {
            isValid: false,
            error: "TASK query type required for Task Query module",
          };
        }

        if (
          moduleType === "dataviewCalendarQuery" &&
          !content.some((line) => line.trim().startsWith("CALENDAR"))
        ) {
          return {
            isValid: false,
            error: "CALENDAR query type required for Calendar Query module",
          };
        }
      } else if (moduleType === "dataviewFields") {
        // Use the specialized validation from utils
        return validateDataviewFields(content);
      }
      break;
    // Other plugin types...
  }

  return { isValid: true };
}

/**
 * Validates Templater syntax in content
 */
function validateTemplaterSyntax(content: string[]): {
  isValid: boolean;
  error?: string;
} {
  // Check for balanced <% and %> tags
  const fullContent = content.join("\n");
  const openTags = (fullContent.match(/<%/g) || []).length;
  const closeTags = (fullContent.match(/%>/g) || []).length;

  if (openTags !== closeTags) {
    return {
      isValid: false,
      error: `Unbalanced Templater tags: found ${openTags} opening tags and ${closeTags} closing tags`,
    };
  }

  return { isValid: true };
}

/**
 * Validates Dataview syntax in content
 */
function validateDataviewSyntax(content: string[]): {
  isValid: boolean;
  error?: string;
} {
  // Check for dataview code blocks
  const fullContent = content.join("\n");
  if (!fullContent.includes("```dataview") || !fullContent.includes("```")) {
    return {
      isValid: false,
      error: "Dataview query must be inside a dataview code block",
    };
  }

  return { isValid: true };
}

/**
 * Validates Kanban syntax in content
 */
function validateKanbanSyntax(content: string[]): {
  isValid: boolean;
  error?: string;
} {
  // Kanban requires YAML frontmatter with kanban-plugin property
  if (!content.some((line) => line.includes("kanban-plugin"))) {
    return {
      isValid: false,
      error: "Kanban board must include kanban-plugin in YAML frontmatter",
    };
  }

  // Check for at least one section header
  if (!content.some((line) => line.startsWith("## "))) {
    return {
      isValid: false,
      error: "Kanban board must have at least one section (## Section)",
    };
  }

  return { isValid: true };
}

/**
 * Generates default template content for a given module type and plugin
 * @param moduleType Type of module to generate
 * @param pluginType Associated plugin type (if applicable)
 * @returns Array of strings with default content
 */
export function generateDefaultContent(
  moduleType: ModuleType,
  pluginType: PluginType = null
): string[] {
  switch (moduleType) {
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
      return [TEMPLATER.VARIABLES.CURRENT_DATE_FORMATTED];

    case "templaterDateAndTime":
      return [
        TEMPLATER.VARIABLES.CURRENT_DATE,
        TEMPLATER.VARIABLES.YESTERDAY,
        TEMPLATER.VARIABLES.TOMORROW,
        TEMPLATER.VARIABLES.CREATED_DATE,
        TEMPLATER.VARIABLES.TITLE,
        TEMPLATER.VARIABLES.CURSOR_POSITION,
        TEMPLATER.DATE_FORMATS.STANDARD,
        TEMPLATER.DATE_FORMATS.US,
        TEMPLATER.DATE_FORMATS.EUROPE,
        TEMPLATER.DATE_FORMATS.FULL,
        TEMPLATER.DATE_FORMATS.ISO,
        TEMPLATER.SNIPPETS.RANDOM_QUOTE,
        TEMPLATER.SNIPPETS.WEATHER,
      ];

    case "templaterFileProperty":
      return [
        "<% tp.file.creation_date() %>",
        "<% tp.file.last_modified_date() %>",
        "<% tp.file.title() %>",
        "<% tp.file.cursor() %>",
        "<% tp.file.link() %>",
        "<% tp.file.path() %>",
        '<% tp.file.move("New File Name") %>',
        '<% tp.file.rename("New File Name") %>',
        "<% tp.file.delete() %>",
        '<% tp.file.append("Content to append") %>',
        '<% tp.file.prepend("Content to prepend") %>',
        '<% tp.file.create_new("New File Name") %>',
        '<% tp.file.create_new("New File Name", "Folder/Subfolder") %>',
        '<% tp.file.create_new("New File Name", "Folder/Subfolder", true) %>',
        '<% tp.file.create_new("New File Name", "Folder/Subfolder", false) %>',
      ];

    case "templaterUserInput":
      return [
        'Enter your name: <% tp.userInput("Name") %>',
        'Enter your age: <% tp.userInput("Age") %>',
        'Enter your email: <% tp.userInput("Email") %>',
      ];

    case "templaterConditionalContent":
      return [
        'If condition is true: <% if (tp.userInput("Condition")) { %> This is true <% } %>',
        'If condition is false: <% if (!tp.userInput("Condition")) { %> This is false <% } %>',
      ];

    case "templaterValueTransformation":
      return [
        'Transform a value: <% tp.userInput("Value").toUpperCase() %>',
        'Transform a value: <% tp.userInput("Value").toLowerCase() %>',
        'Transform a value: <% tp.userInput("Value").replace("old", "new") %>',
        'Transform a value: <% tp.userInput("Value").split(",") %>',
        'Transform a value: <% tp.userInput("Value").join(",") %>',
        'Transform a value: <% tp.userInput("Value").slice(0, 5) %>',
        'Transform a value: <% tp.userInput("Value").substring(0, 5) %>',
        'Transform a value: <% tp.userInput("Value").substr(0, 5) %>',
        'Transform a value: <% tp.userInput("Value").trim() %>',
        'Transform a value: <% tp.userInput("Value").charAt(0) %>',
        'Transform a value: <% tp.userInput("Value").charCodeAt(0) %>',
        'Transform a value: <% tp.userInput("Value").indexOf("search") %>',
        'Transform a value: <% tp.userInput("Value").lastIndexOf("search") %>',
        'Transform a value: <% tp.userInput("Value").includes("search") %>',
      ];

    case "templaterTemplateVariables":
      return [
        'Template variable: <% tp.template("templateName") %>',
        'Template variable: <% tp.template("templateName", "arg1", "arg2") %>',
        'Template variable: <% tp.template("templateName", { key: "value" }) %>',
        'Template variable: <% tp.template("templateName", { key1: "value1", key2: "value2" }) %>',
        'Template variable: <% tp.template("templateName", { key1: "value1", key2: "value2" }, "arg3") %>',
        'Template variable: <% tp.template("templateName", { key1: "value1", key2: "value2" }, "arg3", "arg4") %>',
        'Template variable: <% tp.template("templateName", { key1: "value1", key2: "value2" }, "arg3", "arg4", "arg5") %>',
      ];

    // Dataview plugin modules
    case "dataviewQuery":
      return DATAVIEW.QUERIES.RECENT_NOTES.split("\n");

    case "dataviewListQuery":
      return ["```dataview", "LIST", "FROM #tag", "```"];

    case "dataviewTableQuery":
      return [
        "```dataview",
        "TABLE file.ctime as Created, file.mtime as Modified",
        'FROM "folder"',
        "SORT file.mtime DESC",
        "```",
      ];

    case "dataviewTaskQuery":
      return [
        "```dataview",
        "TASK",
        "FROM #project",
        "WHERE !completed",
        "```",
      ];

    case "dataviewCalendarQuery":
      return [
        "```dataview",
        "CALENDAR file.ctime",
        'FROM "Daily Notes"',
        "```",
      ];

    case "dataviewFields":
      return ["Due:: 2023-12-31", "Status:: #in-progress", "Priority:: High"];

    case "dataviewInlineFields":
      return [
        "Due:: 2023-12-31",
        "Status:: #in-progress",
        "Priority:: High",
        "Tags:: #work #personal",
        "Created:: 2023-01-01",
        "Modified:: 2023-01-02",
      ];

    case "kanban":
      return KANBAN.DEFAULT_BOARD.split("\n");

    // Basic module types (existing types)
    case "header":
      return ["# New Header"];

    case "checklist":
      return ["- [ ] First item", "- [ ] Second item", "- [ ] Third item"];

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
    case "kanban":
      return "Kanban";
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
    case "dataviewFields":
      return "fas fa-list-alt";
    case "dataviewInlineFields":
      return "fas fa-list-alt";
    // Kanban plugin modules
    case "kanban":
      return "fas fa-columns";
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
    case "kanban":
      return "fas fa-columns";
    default:
      return "";
  }
}

/**
 * Validates if a value is a valid PluginType
 */
export function isValidPluginType(type: any): type is PluginType {
  return ["templater", "dataview", "kanban", null].includes(type);
}

/**
 * Validates if a value is a valid ModuleType
 */
export function isValidModuleType(type: any): type is ModuleType {
  return [
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
    "dataviewFields",
    "dataviewInlineFields",
    // Kanban plugin modules
    "kanban",
  ].includes(type);
}

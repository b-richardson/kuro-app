/**
 * Type definitions for template modules in the Obsidian Template Creator
 */

/**
 * Available module types in the template
 */
export type ModuleType =
  // Basic module types
  | "header"
  | "checklist"
  | "table"
  | "text"
  | "divider"
  // Plugin-specific module types
  | "yaml"
  // Templater plugin modules
  | "templaterField"
  | "templaterDateAndTime"
  | "templaterFileProperty"
  | "templaterUserInput"
  | "templaterConditionalContent"
  | "templaterValueTransformation"
  | "templaterTemplateVariables"
  // Dataview plugin modules
  | "dataviewQuery" // Generic/legacy dataview query
  | "dataviewTableQuery" // Table query
  | "dataviewListQuery" // List query
  | "dataviewTaskQuery" // Task query
  | "dataviewCalendarQuery" // Calendar query
  | "dataviewInlineFields"; // Inline dataview fields

/**
 * Obsidian plugin types supported by the template creator
 */
export type PluginType = null | "templater" | "dataview";

/**
 * Generic metadata object type for plugin-specific configuration
 */
export interface ModuleMetadata {
  [key: string]: any;
}

/**
 * Interface defining the structure of a template module
 */
export interface TemplateModule {
  /** Unique identifier for the module */
  id: string;

  /** Type of the module */
  type: ModuleType;

  /** Content of the module as string array */
  content: string[];

  /** Associated plugin type (if applicable) */
  pluginType: PluginType;

  /** Additional metadata for plugin-specific configuration */
  metadata?: ModuleMetadata;
}

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
  // Plugin-specific module types
  | "yaml"
  | "templaterField"
  | "dataviewQuery"
  | "dataviewFields"
  | "kanban";

/**
 * Obsidian plugin types supported by the template creator
 */
export type PluginType = null | "templater" | "dataview" | "kanban";

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

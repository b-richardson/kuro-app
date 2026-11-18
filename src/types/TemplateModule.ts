/**
 * Type definitions for template modules in the Obsidian Template Creator
 */

/**
 * Available module types in the template
 */
export type ModuleType =
  // Frontmatter
  | "frontmatter"
  // Basic module types
  | "header"
  | "checklist"
  | "table"
  | "text"
  | "divider"
  | "codeBlock"
  // Templater plugin modules
  | "templaterField"
  | "templaterDateAndTime"
  | "templaterFileProperty"
  | "templaterUserInput"
  | "templaterConditionalContent"
  | "templaterValueTransformation"
  | "templaterTemplateVariables"
  // Dataview plugin modules
  | "dataviewQuery"
  | "dataviewTableQuery"
  | "dataviewListQuery"
  | "dataviewTaskQuery"
  | "dataviewCalendarQuery"
  | "dataviewInlineFields";

/**
 * Obsidian plugin types supported by the template creator
 */
export type PluginType = null | "templater" | "dataview";

/**
 * Generic metadata object type for plugin-specific configuration
 */
export interface ModuleMetadata {
  level?: number;
  columns?: number;
  delimiter?: string;
  [key: string]: any;
}

/**
 * Interface defining the structure of a template module
 */
export interface TemplateModule {
  id: string;
  type: ModuleType;
  content: string[];
  pluginType: PluginType;
  metadata?: ModuleMetadata;
}

/**
 * Props expected by components representing individual modules
 */
export interface ModuleComponentProps {
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}

/**
 * Emit events used by module components
 */
export interface ModuleComponentEmits {
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}

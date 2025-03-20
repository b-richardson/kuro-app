/**
 * Type definitions for template sections in the Obsidian Template Creator
 */

/**
 * Available section types in the template
 */
export type SectionType = 
  // Basic section types
  | 'header' 
  | 'checklist' 
  | 'table' 
  | 'text'
  // Plugin-specific section types
  | 'yaml'
  | 'templaterField'
  | 'dataviewQuery'
  | 'kanban';

/**
 * Obsidian plugin types supported by the template creator
 */
export type PluginType = null | 'templater' | 'dataview' | 'kanban';

/**
 * Generic metadata object type for plugin-specific configuration
 */
export interface SectionMetadata {
  [key: string]: any;
}

/**
 * Interface defining the structure of a template section
 */
export interface TemplateSection {
  /** Unique identifier for the section */
  id: string;
  
  /** Type of the section */
  type: SectionType;
  
  /** Content of the section as string array */
  content: string[];
  
  /** Associated plugin type (if applicable) */
  pluginType: PluginType;
  
  /** Additional metadata for plugin-specific configuration */
  metadata?: SectionMetadata;
}
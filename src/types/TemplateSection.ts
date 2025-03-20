/**
 * Type definitions for template sections in the Obsidian Template Creator
 */

/**
 * Available section types in the template
 */
export type SectionType = 'header' | 'checklist' | 'table' | 'text';

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
}
/**
 * Type definitions for Dataview query results and parameters
 * These types represent the structure of data returned by the custom query service
 */

import { NoteJson } from "@/types/obsidian";

/**
 * Represents a function or string for filtering notes in queries
 * - String format is typically a tag like "#project"
 * - Function takes a note and returns boolean for inclusion
 */
export type DataviewQueryFilter = string | ((note: NoteJson) => boolean);

/**
 * Sort direction for query results
 */
export type DataviewSortOption = "asc" | "desc";

/**
 * File information included in query results
 */
export interface DataviewFileInfo {
  /** Full path to the file */
  path: string;
  /** Filename with extension */
  name: string;
  /** Filename without extension */
  basename: string;
}

/**
 * Base interface for all Dataview query results
 */
export interface DataviewBaseResult {
  file: DataviewFileInfo;
}

/**
 * Result format for LIST queries
 */
export interface DataviewListResult extends DataviewBaseResult {
  /** The content of the note */
  content: string;
  /** YAML frontmatter parsed as an object */
  frontmatter: Record<string, any>;
  /** Array of tags found in the note */
  tags: string[];
}

/**
 * Result format for TABLE queries
 * The interface is extended at runtime with the requested columns
 */
export interface DataviewTableResult extends DataviewBaseResult {
  /** Dynamic properties based on requested columns */
  [column: string]: any;
}

/**
 * Task information for TASK queries
 */
export interface DataviewTaskResult {
  /** Task text content */
  text: string;
  /** Whether the task is completed */
  completed: boolean;
  /** Character position in the note */
  position: number;
  /** Line number in the note */
  line: number;
  /** Source information for the task */
  source: {
    /** File information */
    file: DataviewFileInfo;
    /** YAML frontmatter of the source note */
    frontmatter: Record<string, any>;
    /** Tags from the source note */
    tags: string[];
  };
}

/**
 * Result format for CALENDAR queries
 * Organizes notes by date in YYYY-MM-DD format
 */
export interface DataviewCalendarResult {
  /** Date string in YYYY-MM-DD format as key */
  [date: string]: Array<{
    /** File information */
    file: DataviewFileInfo;
    /** YAML frontmatter */
    frontmatter: Record<string, any>;
    /** Tags from the note */
    tags: string[];
  }>;
}

/**
 * Options for a Dataview query
 */
export interface DataviewQueryOptions {
  /** Directory to search in */
  directory?: string;
  /** Filter to apply */
  filter?: DataviewQueryFilter;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortDirection?: DataviewSortOption;
  /** Columns for TABLE queries */
  columns?: string[];
  /** Date field for CALENDAR queries */
  dateField?: string;
}

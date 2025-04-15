// src/obsidian/types/index.ts

// Configuration for the API client
export interface ApiConfig {
  baseUrl: string; // e.g., "https://127.0.0.1:27124" or "http://127.0.0.1:27123"
  apiKey: string;
}

// Response from the root '/' endpoint
export interface ApiStatusResponse {
  authenticated: boolean;
  ok: string; // Should be 'OK'
  service: string; // Should be 'Obsidian Local REST API'
  versions: {
    obsidian: string;
    self: string; // Plugin version
  };
}

// Response from GET /vault/ (or other directory listing)
export interface VaultInfo {
  files: string[]; // Array of file and directory names (dirs end with '/')
}

// Detailed Note structure from GET /vault/{filename} with Accept header
// Based on the schema provided in the initial prompt
export interface NoteJson {
  content: string;
  frontmatter: Record<string, any>; // YAML frontmatter parsed as JSON object
  path: string; // Path relative to vault root
  stat: {
    ctime: number; // Creation time (Unix timestamp)
    mtime: number; // Modification time (Unix timestamp)
    size: number; // File size in bytes
  };
  tags: string[]; // Array of tags (includes frontmatter & inline)
}

// Represents a command available in Obsidian
export interface CommandInfo {
  id: string;
  name: string;
}

// Response from GET /commands/
export interface CommandListResponse {
  commands: CommandInfo[];
}

// Allowed periods for periodic notes
export type PeriodicNotePeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

// Operations for PATCH requests
export type PatchOperation = "append" | "prepend" | "replace";

// Target types for PATCH requests
export type PatchTargetType = "heading" | "block" | "frontmatter";

// Represents the headers needed for a PATCH request
export interface PatchRequestHeaders {
  Operation: PatchOperation;
  "Target-Type": PatchTargetType;
  Target: string; // The specific heading, block ID, or frontmatter key
  "Target-Delimiter"?: string; // Optional, defaults to '::'
  "Content-Type"?: "text/markdown" | "application/json"; // Optional, defaults likely to text/markdown
  "Create-Target-If-Missing"?: "true" | "false"; // Optional, for frontmatter
  "Trim-Target-Whitespace"?: "true" | "false"; // Optional
}

// Match details for simple search
export interface SearchMatch {
  context: string;
  match: {
    start: number;
    end: number;
  };
}

// Result item for POST /search/simple/
export interface SimpleSearchResult {
  filename: string;
  score: number;
  matches: SearchMatch[];
}

// Base result item for POST /search/ with Dataview or JsonLogic
// The 'result' structure depends heavily on the specific query
export interface StructuredQueryResult {
  filename: string;
  result: any; // Could be an object, array, string, number, boolean
}

/**
 * Represents extracted information about a single task item.
 */
export interface TaskInfo {
  text: string; // The main text of the task
  status: string; // Character inside brackets: ' ', 'x', '>', '/', '-', etc.
  rawLine: string; // The original markdown line
  lineNumber: number; // Line number within the source file (useful for context/linking)
  path: string; // Path of the source file
  tags: string[]; // Tags found within the task line (e.g., #project)
  dueDate?: string; // Optional: Parsed from 📅 YYYY-MM-DD format (store as ISO string)
  completionDate?: string; // Optional: Parsed from ✅ YYYY-MM-DD format (store as ISO string)
  // Add other potential metadata you might parse, e.g., priority, links
  links?: string[]; // Links found within the task line [[link]]
}

/**
 * Holds data extracted from parsing the markdown content of a note.
 */
export interface ParsedData {
  inlineFields: Record<string, any>; // Key:: Value pairs found in the note body
  tasks: TaskInfo[]; // List of all tasks found in the note
  // You could add other parsed elements here if needed, e.g.,
  // extractedTables: any[];
  // codeBlocks: { lang?: string; content: string }[];
}

/**
 * Combines the raw NoteJson from the API with the data parsed from its content.
 * This is the main data structure stored in our index/cache.
 */
export interface CombinedNoteData {
  note: NoteJson;
  parsed: ParsedData;
}

// --- NEW: Types for Defining and Returning Queries ---

/**
 * Defines the source criteria for a query (FROM clause).
 * More complex logic might require combining these (e.g., tag AND folder).
 */
export type QuerySource =
  | { type: "TAG"; value: string } // e.g., #project
  | { type: "FOLDER"; value: string } // e.g., Meetings/
  | { type: "PATH"; value: string } // e.g., Specific/File.md
  | { type: "ALL" }; // Represents FROM ""

/**
 * Defines a single filter condition (WHERE clause).
 */
export interface FilterCriterion {
  field: string; // e.g., 'frontmatter.status', 'tags', 'path', 'stat.mtime', 'parsed.inlineFields.priority', 'parsed.tasks.status', 'parsed.tasks.dueDate'
  operator: // Common operators
  | "=="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    // String operators
    | "contains"
    | "startsWith"
    | "endsWith"
    // Array operators
    | "includes"
    | "not includes"
    // Task specific?
    | "is complete"
    | "is incomplete";
  // Date specific? (might be handled by comparing ISO strings with > <)
  value: any; // The value to compare against
}

/**
 * Defines sorting criteria (SORT BY clause).
 */
export interface SortCriterion {
  field: string; // Field to sort by (same sources as FilterCriterion)
  direction: "asc" | "desc";
}

/**
 * Represents the complete query definition coming from the UI.
 */
export interface QueryRequest {
  queryType: "LIST" | "TABLE" | "TASK" | "CALENDAR";
  // Source logic might need enhancement for complex FROM clauses (e.g., FROM #tag AND "Folder")
  sources: QuerySource[]; // Array to allow combining sources (e.g., FROM #tag OR "Folder") - needs careful handling in engine
  filters?: FilterCriterion[]; // WHERE clauses (combined with AND logic by default)
  // For TABLE queries:
  selectFields?: string[]; // Fields/columns to display
  // For CALENDAR queries:
  calendarDateField?: string; // Field containing the date (e.g., frontmatter.date, parsed.inlineFields.eventDate)
  // For TASK queries (might have task-specific filters/grouping)
  // groupBy?: string; // e.g., 'path' to group tasks by note
  // General options:
  sortBy?: SortCriterion[];
  limit?: number;
  displayHeaders?: string[];
}

/**
 * Represents the results returned by the Query Engine.
 * This is a union type based on the QueryRequest.queryType.
 */
export type QueryResult =
  | { type: "LIST"; data: string[] } // Array of file paths
  | { type: "TABLE"; headers: string[]; data: Record<string, any>[] } // Array of objects, keys match headers
  | { type: "TASK"; data: TaskInfo[] } // Array of TaskInfo objects matching criteria
  | { type: "CALENDAR"; data: Record<string, CombinedNoteData[]> } // Object where keys are dates (YYYY-MM-DD) and values are arrays of notes for that date
  | { type: "ERROR"; message: string }; // For query execution errors

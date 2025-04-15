// src/obsidian/engine/queryEngine.ts

import type { DataStore } from "../store/dataStore";
import type {
  QueryRequest,
  QueryResult,
  CombinedNoteData,
  FilterCriterion,
  SortCriterion,
  QuerySource,
  TaskInfo,
} from "../types/queryEngine";
import { parseISO, compareAsc, compareDesc, isValid } from "date-fns"; // Date utility library

// Helper function for getting nested properties safely
// Example: getProperty(note, 'frontmatter.status')
function getProperty(obj: any, path: string): any {
  // Special handling for common Dataview properties
  if (path.startsWith("file.")) {
    // Handle file.xxx properties that need special mapping from the API data
    const fileProp = path.substring(5); // Remove "file." prefix

    // Handle CombinedNoteData objects (most common case)
    if (obj && typeof obj === "object" && "note" in obj) {
      const note = obj.note;

      // Map common file properties to their API equivalents
      switch (fileProp) {
        case "name":
          // Extract filename from path
          if (note.path) {
            const pathParts = note.path.split("/");
            return pathParts[pathParts.length - 1];
          }
          return undefined;

        case "path":
          return note.path;

        case "folder":
          // Extract folder from path
          if (note.path) {
            const lastSlashIndex = note.path.lastIndexOf("/");
            return lastSlashIndex >= 0
              ? note.path.substring(0, lastSlashIndex)
              : "";
          }
          return "";

        case "size":
          return note.stat?.size;

        case "ctime":
          return note.stat?.ctime;

        case "mtime":
          return note.stat?.mtime;

        case "tags":
          return note.tags;

        // Add more mappings as needed for other file properties
        default:
          console.warn(`Unmapped file property: ${fileProp}`);
          return undefined;
      }
    }

    // Handle direct access to NoteJson objects
    if (obj && typeof obj === "object" && "path" in obj && "stat" in obj) {
      const note = obj;

      switch (fileProp) {
        case "name":
          if (note.path) {
            const pathParts = note.path.split("/");
            return pathParts[pathParts.length - 1];
          }
          return undefined;

        case "path":
          return note.path;

        case "folder":
          if (note.path) {
            const lastSlashIndex = note.path.lastIndexOf("/");
            return lastSlashIndex >= 0
              ? note.path.substring(0, lastSlashIndex)
              : "";
          }
          return "";

        case "size":
          return note.stat?.size;

        case "ctime":
          return note.stat?.ctime;

        case "mtime":
          return note.stat?.mtime;

        case "tags":
          return note.tags;

        default:
          console.warn(`Unmapped file property: ${fileProp}`);
          return undefined;
      }
    }

    return undefined;
  }

  // Standard path handling for non-file properties
  return path.split(".").reduce((o, key) => {
    // Handle direct access vs accessing nested 'note' or 'parsed'
    if (key === "note" && o && typeof o === "object" && "note" in o) {
      return o.note;
    }
    if (key === "parsed" && o && typeof o === "object" && "parsed" in o) {
      return o.parsed;
    }
    // Handle potential nested keys within frontmatter or inlineFields
    if (key === "frontmatter" && o?.frontmatter) return o.frontmatter;
    if (key === "stat" && o?.stat) return o.stat;
    if (key === "tags" && o?.tags) return o.tags;
    if (key === "path" && o?.path) return o.path;
    if (key === "inlineFields" && o?.inlineFields) return o.inlineFields;
    if (key === "tasks" && o?.tasks) return o.tasks; // Returns array of tasks

    // Access nested property
    return o && typeof o === "object" ? o[key] : undefined;
  }, obj); // Start reduction with the root object (CombinedNoteData or TaskInfo)
}

// Helper to check if a value matches a filter criterion
function checkFilter(
  value: any,
  operator: FilterCriterion["operator"],
  filterValue: any
): boolean {
  // Handle null/undefined comparisons robustly
  const valueExists = value !== null && value !== undefined;
  const filterValueExists = filterValue !== null && filterValue !== undefined;

  // Handle specific task statuses
  if (operator === "is complete") {
    return value === "x" || value === "X"; // Adjust if other completed statuses exist
  }
  if (operator === "is incomplete") {
    return value !== "x" && value !== "X"; // Assumes ' ' or other chars are incomplete
  }

  // If operator expects values to exist, return false if they don't
  const requiresValue = [
    ">",
    "<",
    ">=",
    "<=",
    "contains",
    "startsWith",
    "endsWith",
    "includes",
    "not includes",
  ];
  if (requiresValue.includes(operator) && !valueExists) {
    return false;
  }

  switch (operator) {
    case "==":
      return value == filterValue; // Use loose equality like Dataview often does? Or strict ===? Let's start loose.
    case "!=":
      return value != filterValue;
    case ">":
      return valueExists && filterValueExists && value > filterValue;
    case "<":
      return valueExists && filterValueExists && value < filterValue;
    case ">=":
      return valueExists && filterValueExists && value >= filterValue;
    case "<=":
      return valueExists && filterValueExists && value <= filterValue;
    case "contains":
      return (
        typeof value === "string" &&
        typeof filterValue === "string" &&
        value.toLowerCase().includes(filterValue.toLowerCase())
      );
    case "startsWith":
      return (
        typeof value === "string" &&
        typeof filterValue === "string" &&
        value.toLowerCase().startsWith(filterValue.toLowerCase())
      );
    case "endsWith":
      return (
        typeof value === "string" &&
        typeof filterValue === "string" &&
        value.toLowerCase().endsWith(filterValue.toLowerCase())
      );
    case "includes":
      return Array.isArray(value) && value.some((item) => item == filterValue); // Loose comparison within array
    case "not includes":
      return (
        !Array.isArray(value) || !value.some((item) => item == filterValue)
      ); // Loose comparison
    default:
      console.warn(`Unsupported filter operator: ${operator}`);
      return false;
  }
}

export class QueryEngine {
  /**
   * Executes a defined query against the data available in the DataStore.
   * @param query - The QueryRequest object defining the query parameters.
   * @param dataStore - The instance of the DataStore containing the cached vault data.
   * @returns A Promise resolving to the QueryResult.
   */
  async execute(
    query: QueryRequest,
    dataStore: DataStore
  ): Promise<QueryResult> {
    try {
      // 1. Get initial set of notes from the store
      // For in-memory, we get all and filter. For IndexedDB, this step might involve querying the DB.
      let candidateNotes: CombinedNoteData[] = Array.from(
        dataStore.getAllNotes()
      );

      // 2. Apply Source Filtering (FROM clause)
      const sourceFilteredNotes: CombinedNoteData[] = [];
      if (query.sources.some((s) => s.type === "ALL")) {
        // If FROM "", start with all notes
        sourceFilteredNotes.push(...candidateNotes);
      } else {
        // Apply specific sources (OR logic between sources for now)
        const sourcePaths = new Set<string>();
        for (const source of query.sources) {
          for (const note of candidateNotes) {
            let match = false;
            switch (source.type) {
              case "TAG":
                // Check both NoteJson.tags and parsed task tags? Decide scope.
                // Let's check NoteJson.tags for note-level filtering first.
                match = note.note.tags?.includes(
                  source.value.replace(/^#/, "")
                ); // Remove leading # if present
                break;
              case "FOLDER":
                const folderPath = source.value.endsWith("/")
                  ? source.value
                  : source.value + "/";
                match = note.note.path.startsWith(folderPath);
                break;
              case "PATH":
                match = note.note.path === source.value;
                break;
            }
            if (match) {
              sourcePaths.add(note.note.path);
            }
          }
        }
        // Filter notes based on matched paths
        candidateNotes.forEach((note) => {
          if (sourcePaths.has(note.note.path)) {
            sourceFilteredNotes.push(note);
          }
        });
      }

      candidateNotes = sourceFilteredNotes; // Update candidate notes after source filtering

      // 3. Apply WHERE Filters (FilterCriterion)
      let filteredData: Array<CombinedNoteData | TaskInfo> = candidateNotes; // Start with notes

      if (query.queryType === "TASK") {
        // If it's a TASK query, expand notes into individual tasks *before* applying WHERE filters
        // that might target task properties. Note-level filters can still be applied first.
        const allTasks: TaskInfo[] = [];
        candidateNotes.forEach((note) => {
          // Apply note-level filters first (e.g., path, note tags, frontmatter)
          const notePassesFilters = (query.filters ?? []).every((filter) => {
            // Only apply filters that don't target task-specific fields
            if (filter.field.startsWith("parsed.tasks.")) return true;
            const value = getProperty(note, filter.field);
            return checkFilter(value, filter.operator, filter.value);
          });

          if (notePassesFilters && note.parsed?.tasks) {
            note.parsed.tasks.forEach((task) => {
              allTasks.push(task); // Collect all tasks from passing notes
            });
          }
        });
        // Now apply task-specific filters to the collected tasks
        filteredData = allTasks.filter((task) => {
          return (query.filters ?? []).every((filter) => {
            // Only apply task-specific filters here
            if (!filter.field.startsWith("parsed.tasks.")) return true;
            const taskField = filter.field.replace("parsed.tasks.", ""); // e.g., 'status', 'dueDate'
            const value = getProperty(task, taskField); // Get property directly from TaskInfo
            return checkFilter(value, filter.operator, filter.value);
          });
        });
      } else {
        // For LIST, TABLE, CALENDAR, apply all filters to the CombinedNoteData
        if (query.filters && query.filters.length > 0) {
          filteredData = candidateNotes.filter((note) => {
            return query.filters!.every((filter) => {
              // Get value using helper
              // Path needs careful handling: root is 'note', nested is 'note.prop', 'parsed.prop' etc.
              const value = getProperty(note, filter.field);
              return checkFilter(value, filter.operator, filter.value);
            });
          });
        }
      }

      // 4. Apply Sorting (SortCriterion)
      if (query.sortBy && query.sortBy.length > 0) {
        // Apply sorts sequentially
        filteredData.sort((a, b) => {
          for (const sortRule of query.sortBy!) {
            const fieldA = getProperty(a, sortRule.field);
            const fieldB = getProperty(b, sortRule.field);

            // Basic comparison, handle undefined/nulls? Maybe push them to end?
            const valA =
              fieldA ?? (sortRule.direction === "asc" ? Infinity : -Infinity);
            const valB =
              fieldB ?? (sortRule.direction === "asc" ? Infinity : -Infinity);

            let comparison = 0;
            // Potential Date comparison
            if (
              (sortRule.field.includes("date") ||
                sortRule.field.includes("time")) &&
              typeof valA === "string" &&
              typeof valB === "string"
            ) {
              try {
                const dateA = parseISO(valA);
                const dateB = parseISO(valB);
                if (isValid(dateA) && isValid(dateB)) {
                  comparison = compareAsc(dateA, dateB);
                } else {
                  // Fallback to string compare if dates invalid
                  comparison = String(valA).localeCompare(String(valB));
                }
              } catch {
                comparison = String(valA).localeCompare(String(valB));
              }
            } else if (typeof valA === "number" && typeof valB === "number") {
              comparison = valA - valB;
            } else {
              // Default to locale string comparison
              comparison = String(valA).localeCompare(String(valB));
            }

            if (comparison !== 0) {
              return sortRule.direction === "desc"
                ? comparison * -1
                : comparison;
            }
          }
          return 0; // Items are equal according to all sort rules
        });
      }

      // 5. Apply Limit
      if (query.limit && query.limit > 0) {
        filteredData = filteredData.slice(0, query.limit);
      }

      // 6. Format Output (QueryResult) based on queryType
      switch (query.queryType) {
        case "LIST": {
          // Expecting CombinedNoteData here
          const listData = (filteredData as CombinedNoteData[]).map(
            (item) => item.note.path
          );
          return { type: "LIST", data: listData };
        }
        case "TABLE": {
          // Expecting CombinedNoteData here
          const tableData: Record<string, any>[] = [];
          const headers = query.selectFields || []; // Determine headers
          if (headers.length === 0) {
            // Default headers if none selected? Maybe file path?
            headers.push("note.path");
          }

          (filteredData as CombinedNoteData[]).forEach((item) => {
            const row: Record<string, any> = {};
            headers.forEach((field) => {
              // Use a display name for the header (e.g., 'status' from 'frontmatter.status')
              const headerName = field.split(".").pop() || field;
              row[headerName] = getProperty(item, field);
            });
            tableData.push(row);
          });
          // Extract unique header names from the keys of the first row if dynamic
          const finalHeaders =
            tableData.length > 0
              ? Object.keys(tableData[0])
              : headers.map((f) => f.split(".").pop() || f);
          return { type: "TABLE", headers: finalHeaders, data: tableData };
        }
        case "TASK": {
          // Expecting TaskInfo[] here
          return { type: "TASK", data: filteredData as TaskInfo[] };
        }
        case "CALENDAR": {
          // Expecting CombinedNoteData here
          const calendarData: Record<string, CombinedNoteData[]> = {};
          const dateField = query.calendarDateField;
          if (!dateField) {
            throw new Error(
              "Calendar query requires 'calendarDateField' to be specified."
            );
          }

          (filteredData as CombinedNoteData[]).forEach((item) => {
            const dateValue = getProperty(item, dateField);
            if (dateValue && typeof dateValue === "string") {
              try {
                // Attempt to parse date - assumes YYYY-MM-DD or ISO format mostly
                const parsedDate = parseISO(dateValue.substring(0, 10)); // Use only date part
                if (isValid(parsedDate)) {
                  const dateKey = parsedDate.toISOString().substring(0, 10); // Format as YYYY-MM-DD
                  if (!calendarData[dateKey]) {
                    calendarData[dateKey] = [];
                  }
                  calendarData[dateKey].push(item);
                } else {
                  console.warn(
                    `Invalid date format for calendar key in field "${dateField}" for note "${item.note.path}": ${dateValue}`
                  );
                }
              } catch (e) {
                console.warn(
                  `Error parsing date for calendar key in field "${dateField}" for note "${item.note.path}": ${dateValue}`,
                  e
                );
              }
            }
          });
          return { type: "CALENDAR", data: calendarData };
        }
        default:
          console.error(`Unsupported query type: ${query.queryType}`);
          return {
            type: "ERROR",
            message: `Unsupported query type: ${query.queryType}`,
          };
      }
    } catch (error: any) {
      console.error("Error during query execution:", error);
      return {
        type: "ERROR",
        message:
          error.message || "An unknown error occurred in the query engine.",
      };
    }
  }
}

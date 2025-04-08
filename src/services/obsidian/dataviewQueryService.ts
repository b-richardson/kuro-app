/**
 * DataviewQueryService
 *
 * Extends the ObsidianApiService to provide custom implementations of Dataview query types
 * that aren't directly supported by the Local REST API (List, Calendar, Task).
 *
 * This service transforms data from the API's TABLE queries and file content
 * to simulate the full range of Dataview functionality.
 */

import { obsidianApiService, ObsidianApiService } from "./obsidianApiService";
import {
  DataviewCalendarResult,
  DataviewListResult,
  DataviewTableResult,
  DataviewTaskResult,
  DataviewQueryFilter,
  DataviewSortOption,
} from "@/types/dataview";
import { NoteJson } from "@/types/obsidian";

export class DataviewQueryService {
  private apiService: ObsidianApiService;

  constructor(apiService: ObsidianApiService = obsidianApiService) {
    this.apiService = apiService;
  }

  /**
   * Simulates a Dataview LIST query by fetching and processing notes
   *
   * @param directory - Directory to search within (leave empty for whole vault)
   * @param filter - Optional filter function or tag string (e.g. "#project")
   * @param sortBy - Optional field to sort by
   * @param sortDirection - Sort direction ('asc' or 'desc')
   * @returns Formatted list of notes matching the criteria
   */
  public async listQuery(
    directory: string = "",
    filter?: DataviewQueryFilter,
    sortBy?: string,
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<DataviewListResult[]> {
    // Fetch all files in the directory
    const files = await this.getAllFilesInDirectory(directory);

    // Fetch note data for all files
    const notes: NoteJson[] = [];
    for (const file of files) {
      try {
        const note = (await this.apiService.getFileContent(
          file,
          true
        )) as NoteJson;
        notes.push(note);
      } catch (error) {
        console.error(`Error fetching file ${file}:`, error);
      }
    }

    // Apply filter
    let filteredNotes = this.applyFilter(notes, filter);

    // Apply sorting
    if (sortBy) {
      filteredNotes = this.sortNotes(filteredNotes, sortBy, sortDirection);
    }

    // Transform to list format
    return filteredNotes.map((note) => ({
      file: {
        path: note.path,
        name: this.getFilename(note.path),
        basename: this.getBasename(note.path),
      },
      content: note.content,
      frontmatter: note.frontmatter || {},
      tags: note.tags || [],
    }));
  }

  /**
   * Simulates a Dataview TABLE query by fetching and processing notes
   *
   * @param directory - Directory to search within (leave empty for whole vault)
   * @param columns - Array of column fields to include
   * @param filter - Optional filter function or tag string
   * @param sortBy - Optional field to sort by
   * @param sortDirection - Sort direction ('asc' or 'desc')
   * @returns Formatted table data from notes matching the criteria
   */
  public async tableQuery(
    directory: string = "",
    columns: string[] = [],
    filter?: DataviewQueryFilter,
    sortBy?: string,
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<DataviewTableResult[]> {
    // Try to use native API if possible (only for simple tag filters)
    if (typeof filter === "string" && filter.startsWith("#")) {
      try {
        // The API supports TABLE queries with tags directly
        let queryString = `TABLE ${columns.join(", ")} FROM ${filter}`;
        if (sortBy) {
          queryString += ` SORT ${sortBy} ${sortDirection.toUpperCase()}`;
        }

        const results = await this.apiService.searchWithDataview(queryString);
        return results.map((item) => {
          const result: Record<string, any> = {
            file: {
              path: item.filename,
              name: this.getFilename(item.filename),
              basename: this.getBasename(item.filename),
            },
          };

          // Parse the string result into columns
          try {
            const resultObj = JSON.parse(item.result);
            columns.forEach((col, index) => {
              result[col] = resultObj[index];
            });
          } catch (e) {
            console.error("Error parsing result:", e);
          }

          return result as DataviewTableResult;
        });
      } catch (error) {
        console.warn(
          "Native table query failed, falling back to manual implementation:",
          error
        );
        // Fall back to manual implementation
      }
    }

    // Implement manually if native query failed or for complex filters
    const notes = await this.listQuery(
      directory,
      filter,
      sortBy,
      sortDirection
    );

    return notes.map((note) => {
      const row: Record<string, any> = {
        file: note.file,
      };

      // Extract values for each requested column
      columns.forEach((column) => {
        row[column] = this.extractValueByPath(note, column);
      });

      return row as DataviewTableResult;
    });
  }

  /**
   * Simulates a Dataview TASK query by extracting tasks from notes
   *
   * @param directory - Directory to search within (leave empty for whole vault)
   * @param filter - Optional filter function or tag string
   * @param sortBy - Optional field to sort by
   * @param sortDirection - Sort direction ('asc' or 'desc')
   * @returns List of tasks extracted from notes matching the criteria
   */
  public async taskQuery(
    directory: string = "",
    filter?: DataviewQueryFilter,
    sortBy?: string,
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<DataviewTaskResult[]> {
    // Get all notes first
    const notes = await this.listQuery(directory, filter);
    const allTasks: DataviewTaskResult[] = [];

    // Extract tasks from each note
    for (const note of notes) {
      const tasks = this.extractTasksFromContent(note.content);
      tasks.forEach((task) => {
        allTasks.push({
          ...task,
          source: {
            file: note.file,
            frontmatter: note.frontmatter,
            tags: note.tags,
          },
        });
      });
    }

    // Apply sorting if specified
    if (sortBy) {
      return this.sortTasks(allTasks, sortBy, sortDirection);
    }

    return allTasks;
  }

  /**
   * Simulates a Dataview CALENDAR query by organizing notes by date
   * With added timeout protection to prevent hanging
   */
  public async calendarQuery(
    directory: string = "",
    dateField: string = "file.ctime",
    filter?: DataviewQueryFilter
  ): Promise<DataviewCalendarResult> {
    console.log("[DataviewQueryService] Starting calendar query:", {
      directory,
      dateField,
      filter,
    });

    try {
      // Create a promise that will timeout after 5 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Calendar query timed out after 5 seconds")),
          5000
        );
      });

      // Create the actual query promise but don't await it yet
      const queryPromise = this.executeCalendarQuery(
        directory,
        dateField,
        filter
      );

      // Race the timeout against the actual query
      return await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      console.error("[DataviewQueryService] Calendar query failed:", error);

      // Return an empty result to prevent UI from hanging
      return {};
    }
  }

  /**
   * Clean implementation of executeCalendarQuery that works directly with available metadata
   */
  private async executeCalendarQuery(
    directory: string = "",
    dateField: string = "file.ctime",
    filter?: DataviewQueryFilter
  ): Promise<DataviewCalendarResult> {
    try {
      console.log("[DataviewQueryService] Executing calendar query:", {
        directory,
        dateField,
        filter,
      });

      // Get notes based on filter/directory
      let notes: NoteJson[] = [];

      // Case 1: Tag filter
      if (typeof filter === "string" && filter.startsWith("#")) {
        const tag = filter.substring(1);
        console.log(`[DataviewQueryService] Fetching notes with tag #${tag}`);

        try {
          // Use the API's TABLE query for tags
          const query = `TABLE file.path FROM #${tag}`;
          const results = await this.apiService.searchWithDataview(query);

          // Fetch full note data
          const maxNotes = Math.min(results.length, 50);
          for (let i = 0; i < maxNotes; i++) {
            try {
              const note = (await this.apiService.getFileContent(
                results[i].filename,
                true
              )) as NoteJson;
              notes.push(note);
            } catch (err) {
              console.warn(
                `[DataviewQueryService] Could not fetch note: ${results[i].filename}`
              );
            }
          }
        } catch (err) {
          console.warn(`[DataviewQueryService] Tag query failed:`, err);
        }
      }
      // Case 2: Directory filter
      else if (directory) {
        console.log(
          `[DataviewQueryService] Fetching notes from directory: ${directory}`
        );

        try {
          const result = await this.apiService.listFiles(directory);
          const files = (result.files || [])
            .filter((item) => typeof item === "string" && item.endsWith(".md"))
            .map((item) => (directory ? `${directory}/${item}` : item));

          // Fetch note data
          const maxFiles = Math.min(files.length, 50);
          for (let i = 0; i < maxFiles; i++) {
            try {
              const note = (await this.apiService.getFileContent(
                files[i],
                true
              )) as NoteJson;
              notes.push(note);
            } catch (err) {
              console.warn(
                `[DataviewQueryService] Could not fetch note: ${files[i]}`
              );
            }
          }
        } catch (err) {
          console.warn(`[DataviewQueryService] Directory listing failed:`, err);
        }
      }
      // Case 3: Sample from vault
      else {
        console.log(`[DataviewQueryService] Sampling notes from vault`);

        try {
          // Get root files
          const result = await this.apiService.listFiles("");
          const mdFiles = (result.files || []).filter(
            (item) => typeof item === "string" && item.endsWith(".md")
          );

          // Sample a reasonable number
          const sampleFiles = mdFiles.slice(0, 50);

          // Fetch notes
          for (const file of sampleFiles) {
            try {
              const note = (await this.apiService.getFileContent(
                file,
                true
              )) as NoteJson;
              notes.push(note);
            } catch (err) {
              console.warn(
                `[DataviewQueryService] Could not fetch note: ${file}`
              );
            }
          }
        } catch (err) {
          console.warn(`[DataviewQueryService] Sampling failed:`, err);
        }
      }

      console.log(`[DataviewQueryService] Processing ${notes.length} notes`);

      // Build calendar data from notes
      const calendar: DataviewCalendarResult = {};

      for (const note of notes) {
        // Extract date value based on field
        let dateValue;

        if (dateField === "file.ctime") {
          dateValue = note.stat?.ctime;
        } else if (dateField === "file.mtime") {
          dateValue = note.stat?.mtime;
        } else if (dateField.startsWith("frontmatter.")) {
          const key = dateField.substring("frontmatter.".length);
          dateValue = note.frontmatter?.[key];
        }

        if (!dateValue) continue;

        // Format date to YYYY-MM-DD
        let dateString;
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) continue;
          dateString = date.toISOString().split("T")[0];
        } catch (e) {
          continue; // Skip if date is invalid
        }

        // Add to calendar
        if (!calendar[dateString]) {
          calendar[dateString] = [];
        }

        calendar[dateString].push({
          file: {
            path: note.path,
            name: this.getFilename(note.path),
            basename: this.getBasename(note.path),
          },
          frontmatter: note.frontmatter || {},
          tags: note.tags || [],
        });
      }

      console.log(
        `[DataviewQueryService] Built calendar with ${
          Object.keys(calendar).length
        } dates`
      );

      // Return calendar data or fallback
      if (Object.keys(calendar).length === 0) {
        return this.createFallbackCalendarData();
      }

      return calendar;
    } catch (error) {
      console.error("[DataviewQueryService] Calendar query failed:", error);
      return this.createFallbackCalendarData();
    }
  }

  // ------ HELPER METHODS ------

  /**
   * Recursively fetches all markdown files in a directory and its subdirectories
   * @param directory - Starting directory path
   * @returns Array of file paths
   */
  private async getAllFilesInDirectory(
    directory: string = ""
  ): Promise<string[]> {
    const result = await this.apiService.listFiles(directory);
    const files: string[] = [];

    if (!result.files) return files;

    for (const item of result.files) {
      const path = directory ? `${directory}/${item}` : item;

      if (item.endsWith("/")) {
        // It's a directory, recurse
        const subFiles = await this.getAllFilesInDirectory(path.slice(0, -1));
        files.push(...subFiles);
      } else if (item.endsWith(".md")) {
        // It's a markdown file
        files.push(path);
      }
    }

    return files;
  }

  /**
   * Filters notes based on a filter function or tag string
   * @param notes - Array of notes to filter
   * @param filter - Filter function or tag string
   * @returns Filtered array of notes
   */
  private applyFilter(
    notes: NoteJson[],
    filter?: DataviewQueryFilter
  ): NoteJson[] {
    if (!filter) return notes;

    if (typeof filter === "string") {
      // It's a tag filter (e.g., "#project")
      const tag = filter.startsWith("#") ? filter.substring(1) : filter;
      return notes.filter((note) => note.tags && note.tags.includes(tag));
    } else if (typeof filter === "function") {
      // It's a custom filter function
      return notes.filter((note) => filter(note));
    }

    return notes;
  }

  /**
   * Sorts notes based on a field
   * @param notes - Array of notes to sort
   * @param sortBy - Field to sort by
   * @param direction - Sort direction
   * @returns Sorted array of notes
   */
  private sortNotes(
    notes: NoteJson[],
    sortBy: string,
    direction: "asc" | "desc" = "asc"
  ): NoteJson[] {
    return [...notes].sort((a, b) => {
      const aValue = this.extractValueByPath(a, sortBy);
      const bValue = this.extractValueByPath(b, sortBy);

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === "asc" ? 1 : -1;
      if (bValue === undefined) return direction === "asc" ? -1 : 1;

      const comparison = this.compareValues(aValue, bValue);
      return direction === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Sorts tasks based on a field
   * @param tasks - Array of tasks to sort
   * @param sortBy - Field to sort by
   * @param direction - Sort direction
   * @returns Sorted array of tasks
   */
  private sortTasks(
    tasks: DataviewTaskResult[],
    sortBy: string,
    direction: "asc" | "desc" = "asc"
  ): DataviewTaskResult[] {
    return [...tasks].sort((a, b) => {
      const aValue = this.extractValueByPath(a, sortBy);
      const bValue = this.extractValueByPath(b, sortBy);

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === "asc" ? 1 : -1;
      if (bValue === undefined) return direction === "asc" ? -1 : 1;

      const comparison = this.compareValues(aValue, bValue);
      return direction === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Generic value comparison function
   * @param a - First value
   * @param b - Second value
   * @returns Comparison result (-1, 0, 1)
   */
  private compareValues(a: any, b: any): number {
    if (a === b) return 0;

    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b);
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }

    // Convert to strings for comparison if types don't match
    return String(a).localeCompare(String(b));
  }

  /**
   * Extracts tasks from note content using regex
   * @param content - Note content
   * @returns Array of extracted tasks
   */
  private extractTasksFromContent(
    content: string
  ): Omit<DataviewTaskResult, "source">[] {
    const tasks: Omit<DataviewTaskResult, "source">[] = [];
    const taskRegex = /- \[([ x])\] (.+)(?:\n|$)/g;
    let match;

    while ((match = taskRegex.exec(content)) !== null) {
      tasks.push({
        text: match[2],
        completed: match[1] === "x",
        position: match.index,
        line: this.getLineNumber(content, match.index),
      });
    }

    return tasks;
  }

  /**
   * Gets the line number for a position in text
   * @param text - Text content
   * @param position - Character position
   * @returns Line number (1-based)
   */
  private getLineNumber(text: string, position: number): number {
    const textBeforePosition = text.substring(0, position);
    return (textBeforePosition.match(/\n/g) || []).length + 1;
  }

  /**
   * Extracts a value from an object using a path string
   * @param obj - Object to extract from
   * @param path - Path string (e.g., 'frontmatter.date')
   * @returns Extracted value
   */
  private extractValueByPath(obj: any, path: string): any {
    if (!path) return undefined;

    // Handle special path prefixes
    if (path.startsWith("frontmatter.")) {
      const frontmatterKey = path.substring("frontmatter.".length);
      return obj.frontmatter ? obj.frontmatter[frontmatterKey] : undefined;
    }

    if (path.startsWith("file.")) {
      const fileProperty = path.substring("file.".length);

      if (fileProperty === "name") {
        return obj.file ? obj.file.name : this.getFilename(obj.path);
      }

      if (fileProperty === "path") {
        return obj.file ? obj.file.path : obj.path;
      }

      if (fileProperty === "basename") {
        return obj.file ? obj.file.basename : this.getBasename(obj.path);
      }

      if (
        fileProperty === "ctime" ||
        fileProperty === "mtime" ||
        fileProperty === "size"
      ) {
        return obj.stat ? obj.stat[fileProperty] : undefined;
      }
    }

    // Handle tags
    if (path === "tags") {
      return obj.tags || [];
    }

    // General path traversal
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Formats a date value to YYYY-MM-DD string
   * @param value - Date value (Date, number, string)
   * @returns Formatted date string or undefined if invalid
   */
  private formatDateString(value: any): string | undefined {
    if (!value) return undefined;

    try {
      let date: Date;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === "number") {
        date = new Date(value);
      } else if (typeof value === "string") {
        // Try to parse the date string
        date = new Date(value);
      } else {
        return undefined;
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return undefined;
      }

      // Format as YYYY-MM-DD
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return undefined;
    }
  }

  /**
   * Gets the filename from a path
   * @param path - File path
   * @returns Filename
   */
  private getFilename(path: string): string {
    return path.split("/").pop() || "";
  }

  /**
   * Gets the basename (filename without extension) from a path
   * @param path - File path
   * @returns Basename
   */
  private getBasename(path: string): string {
    const filename = this.getFilename(path);
    return filename.replace(/\.[^.]+$/, "");
  }

  /**
   * Helper method to get files from a directory (non-recursive)
   * @param directory - Directory path
   * @returns Array of file paths
   */
  private async getFilesInDirectoryNonRecursive(
    directory: string
  ): Promise<string[]> {
    try {
      console.log(
        `[DataviewQueryService] Listing files in directory: ${
          directory || "root"
        }`
      );
      const result = await this.apiService.listFiles(directory);
      return (result.files || [])
        .filter((item) => typeof item === "string" && item.endsWith(".md"))
        .map((item) => (directory ? `${directory}/${item}` : item));
    } catch (err) {
      console.error(
        `[DataviewQueryService] Error listing directory ${directory}:`,
        err
      );
      return [];
    }
  }

  /**
   * Helper method to fetch a sample of notes
   * @param directory - Base directory
   * @param limit - Maximum number of notes to fetch
   * @returns Array of notes
   */
  private async fetchSampleNotes(
    directory: string,
    limit: number
  ): Promise<NoteJson[]> {
    try {
      // Get a list of directories to sample from
      const directoryList = directory
        ? [directory]
        : await this.getSampleDirectories();

      console.log(
        `[DataviewQueryService] Sampling from ${directoryList.length} directories`
      );

      const notes: NoteJson[] = [];
      const notesPerDirectory = Math.ceil(limit / directoryList.length);

      // Fetch some notes from each directory
      for (const dir of directoryList) {
        try {
          const files = await this.getFilesInDirectoryNonRecursive(dir);
          const sampleFiles = files.slice(0, notesPerDirectory);
          console.log(
            `[DataviewQueryService] Sampling ${sampleFiles.length} files from ${
              dir || "root"
            }`
          );

          for (const file of sampleFiles) {
            try {
              const note = (await this.apiService.getFileContent(
                file,
                true
              )) as NoteJson;
              notes.push(note);
            } catch (err) {
              console.warn(
                `[DataviewQueryService] Could not fetch note ${file}:`,
                err
              );
            }
          }
        } catch (err) {
          console.warn(
            `[DataviewQueryService] Error sampling directory ${dir}:`,
            err
          );
        }

        // Stop if we've reached our limit
        if (notes.length >= limit) break;
      }

      return notes;
    } catch (err) {
      console.error("[DataviewQueryService] Error fetching sample notes:", err);
      return [];
    }
  }

  /**
   * Helper to get a sample of directories
   * @returns Array of directory paths
   */
  private async getSampleDirectories(): Promise<string[]> {
    try {
      console.log("[DataviewQueryService] Getting sample directories");
      const rootContents = await this.apiService.listFiles("");
      const directories = (rootContents.files || [])
        .filter((item) => typeof item === "string" && item.endsWith("/"))
        .map((item) => item.slice(0, -1));

      // Use root plus up to 4 other directories
      return ["", ...directories.slice(0, 4)];
    } catch (err) {
      console.error(
        "[DataviewQueryService] Error getting sample directories:",
        err
      );
      return [""];
    }
  }

  /**
   * Creates fallback calendar data when no real data is available
   * @returns Sample calendar data
   */
  private createFallbackCalendarData(): DataviewCalendarResult {
    console.log("[DataviewQueryService] Creating fallback calendar data");
    const calendar: DataviewCalendarResult = {};
    const today = new Date();

    // Add some entries for today and adjacent days
    for (let i = -2; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      calendar[dateString] = [
        {
          file: {
            path: `sample/note${i}.md`,
            name: `note${i}.md`,
            basename: `note${i}`,
          },
          frontmatter: { sample: true },
          tags: ["sample"],
        },
      ];
    }

    return calendar;
  }
}

// Export a singleton instance for easy import
export const dataviewQueryService = new DataviewQueryService();

export default dataviewQueryService;

// src/obsidian/parser/contentParser.ts

import type { ParsedData, TaskInfo } from "../types";

// Regular Expressions for parsing
// Explanation:
// - Starts with optional whitespace, then '- '
// - Captures the character inside brackets ([ ]) - status
// - Captures the rest of the line - text
const TASK_REGEX = /^\s*-\s+\[(.)\]\s+(.*)/;

// Explanation:
// - Starts at the beginning of the line (^) potentially after whitespace (\s*)
// - Captures one or more non-colon characters lazily ([^:]+?) - key
// - Matches '::'
// - Captures the rest of the line after optional whitespace (.*) - value
// - Uses 'i' flag for case-insensitive key matching (optional, adjust if needed)
// - Uses 'm' flag if processing multi-line content at once, but we'll likely process line-by-line
const INLINE_FIELD_REGEX = /^\s*([^:]+?)::\s*(.*)/i;

// Regex for extracting tags within task text
const TAG_REGEX = /#([a-zA-Z0-9_\-\/]+)/g; // Matches #tag-name or #tag/subtag

// Regex for extracting dataview dates within task text (adapt format if needed)
const DUE_DATE_REGEX = /📅\s*(\d{4}-\d{2}-\d{2})/g; // Matches 📅 YYYY-MM-DD
const COMPLETION_DATE_REGEX = /✅\s*(\d{4}-\d{2}-\d{2})/g; // Matches ✅ YYYY-MM-DD

// Regex for extracting wikilinks within task text
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g; // Matches [[Link Name]]

export class ContentParser {
  /**
   * Parses the markdown content of a note to extract inline fields and tasks.
   * @param markdownContent - The raw markdown string.
   * @param filePath - The path of the source file (used for TaskInfo).
   * @returns A Promise resolving to the ParsedData object.
   *          (Made async to allow for potential future async parsing libs or heavy work)
   */
  async parse(markdownContent: string, filePath: string): Promise<ParsedData> {
    const lines = markdownContent.split("\n");
    const inlineFields: Record<string, any> = {};
    const tasks: TaskInfo[] = [];

    lines.forEach((line, index) => {
      // 1. Check for Tasks
      const taskMatch = line.match(TASK_REGEX);
      if (taskMatch) {
        const status = taskMatch[1].trim();
        let taskText = taskMatch[2].trim();

        // Extract metadata *from the task text itself*
        const tags = this.extractMatches(taskText, TAG_REGEX, 1);
        const dueDates = this.extractMatches(taskText, DUE_DATE_REGEX, 1);
        const completionDates = this.extractMatches(
          taskText,
          COMPLETION_DATE_REGEX,
          1
        );
        const links = this.extractMatches(taskText, WIKILINK_REGEX, 1);

        // Optional: Remove metadata from the main task text for cleaner display?
        // taskText = taskText.replace(TAG_REGEX, '').replace(DUE_DATE_REGEX, '')... .trim();

        tasks.push({
          text: taskText,
          status: status,
          rawLine: line,
          lineNumber: index + 1, // 1-based line number
          path: filePath,
          tags: tags,
          // Take the *last* found date if multiple exist (common pattern)
          dueDate:
            dueDates.length > 0 ? dueDates[dueDates.length - 1] : undefined,
          completionDate:
            completionDates.length > 0
              ? completionDates[completionDates.length - 1]
              : undefined,
          links: links,
        });
        // Don't check for inline fields if it's a task line (usually mutually exclusive)
        return; // Move to next line
      }

      // 2. Check for Inline Fields (only if not a task)
      // Avoid parsing frontmatter block as inline fields
      // A simple check: assume inline fields don't appear before the second '---' if frontmatter exists
      // A more robust check would parse frontmatter boundaries properly.
      // For now, we'll parse all lines that match the pattern outside of tasks.
      const fieldMatch = line.match(INLINE_FIELD_REGEX);
      if (fieldMatch) {
        const key = fieldMatch[1].trim();
        const value = fieldMatch[2].trim();

        // Basic type inference (can be expanded)
        let parsedValue: any = value;
        if (value.toLowerCase() === "true") {
          parsedValue = true;
        } else if (value.toLowerCase() === "false") {
          parsedValue = false;
        } else if (!isNaN(Number(value)) && value.trim() !== "") {
          // Check for numbers
          parsedValue = Number(value);
        } else if (value.startsWith("[") && value.endsWith("]")) {
          // Potential JSON array?
          try {
            parsedValue = JSON.parse(value);
          } catch (e) {
            /* ignore parse error, treat as string */
          }
        } else if (value.startsWith("{") && value.endsWith("}")) {
          // Potential JSON object?
          try {
            parsedValue = JSON.parse(value);
          } catch (e) {
            /* ignore parse error, treat as string */
          }
        }
        // TODO: Handle multi-value keys? Dataview sometimes allows multiple lines with the same key.
        // This simple approach overwrites previous keys. Could convert to array if key repeats.
        // Or normalize key casing? e.g., inlineFields[key.toLowerCase()] = ...
        inlineFields[key] = parsedValue;
      }
    });

    return {
      inlineFields,
      tasks,
    };
  }

  /**
   * Helper function to extract all matching groups from a string using a regex.
   * @param text - The text to search within.
   * @param regex - The regular expression (must have the 'g' flag).
   * @param groupIndex - The index of the capture group to extract.
   * @returns An array of extracted strings.
   */
  private extractMatches(
    text: string,
    regex: RegExp,
    groupIndex: number
  ): string[] {
    const matches: string[] = [];
    let match;
    // Ensure regex has 'g' flag for iterative matching
    if (!regex.global) {
      console.warn("Regex passed to extractMatches needs the global 'g' flag.");
      return [];
    }
    // Important: Reset lastIndex before iterating if the regex instance is reused.
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match[groupIndex]) {
        matches.push(match[groupIndex].trim());
      }
      // Prevent infinite loops with zero-width matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    return matches;
  }
}

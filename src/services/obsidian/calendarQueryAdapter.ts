/**
 * Quick debugging fix for CalendarQueryAdapter.ts
 *
 * Add this version to catch issues that might be causing the loading state to persist
 */

import { dataviewQueryService } from "./dataviewQueryService";

/**
 * Fix for the TypeScript error in parseCalendarQuery function
 * The issue is that we're defining sortDirection with a const type assertion of "asc"
 * but then trying to assign "desc" to it
 */

export function parseCalendarQuery(query: string) {
  console.log("[DEBUG] Original query to parse:", query);

  // Default values in case parsing fails
  const result = {
    dateField: "file.ctime", // Default to creation time
    directory: "",
    filter: undefined as string | undefined,
    whereClause: "",
    sortBy: undefined as string | undefined,
    // Change this line to allow both "asc" and "desc"
    sortDirection: "asc" as "asc" | "desc",
  };

  try {
    // Extract the date field (what comes after CALENDAR)
    const dateFieldMatch = query.match(/^CALENDAR\s+([^\s]+)/i);
    if (dateFieldMatch) {
      const parsedField = dateFieldMatch[1].trim();
      // Map file.day to file.ctime, keep other fields as-is
      result.dateField =
        parsedField === "file.day" ? "file.ctime" : parsedField;
    }

    // Extract the source/filter (what comes after FROM)
    const sourceMatch = query.match(/FROM\s+(\"[^\"]+\"|#[^\s]+|\S+)/i);
    if (sourceMatch) {
      const source = sourceMatch[1].trim();

      if (source.startsWith("#")) {
        // Tag source
        result.filter = source;
      } else if (source.startsWith('"') && source.endsWith('"')) {
        // Folder source
        result.directory = source.slice(1, -1);
      } else {
        // Treat as directory if not a tag
        result.directory = source;
      }
    }

    // Extract any WHERE clause
    const whereMatch = query.match(/WHERE\s+(.+?)(?:$|\s+SORT\s+)/i);
    if (whereMatch) {
      result.whereClause = whereMatch[1].trim();
    }

    // Extract any SORT clause
    const sortMatch = query.match(/SORT\s+(.+)$/i);
    if (sortMatch) {
      const sortParts = sortMatch[1].split(/\s+/);
      result.sortBy = sortParts[0];
      if (sortParts.length > 1 && sortParts[1].toUpperCase() === "DESC") {
        result.sortDirection = "desc";
      }
    }
  } catch (error) {
    console.error("[DEBUG] Error parsing calendar query:", error);
  }

  console.log("[DEBUG] Parsed query parameters:", result);
  return result;
}

export async function executeCalendarQuery(queryString: string) {
  console.log("[CalendarQueryAdapter] Executing calendar query:", queryString);

  try {
    // Parse the query parameters
    const { dateField, directory, filter } = parseCalendarQuery(queryString);
    console.log("[CalendarQueryAdapter] Query parameters:", {
      dateField,
      directory,
      filter,
    });

    console.log(
      "[CalendarQueryAdapter] Calling dataviewQueryService.calendarQuery..."
    );
    const startTime = performance.now();

    // Execute the query using our custom service
    const calendarData = await dataviewQueryService.calendarQuery(
      directory,
      dateField,
      filter
    );

    const endTime = performance.now();
    console.log(
      `[CalendarQueryAdapter] Query execution took ${(
        endTime - startTime
      ).toFixed(2)}ms`
    );
    console.log("[CalendarQueryAdapter] Query results:", calendarData);
    console.log(
      "[CalendarQueryAdapter] Number of dates returned:",
      Object.keys(calendarData).length
    );

    // Transform the data to match the Calendar component's expected format
    const notesByDate: Record<string, { title: string }[]> = {};

    // Process each date in the calendar data
    Object.entries(calendarData).forEach(([dateStr, entries]) => {
      console.log(
        `[CalendarQueryAdapter] Processing date ${dateStr} with ${entries.length} entries`
      );

      const date = new Date(dateStr);

      // Skip invalid dates
      if (isNaN(date.getTime())) {
        console.warn(`[CalendarQueryAdapter] Invalid date: ${dateStr}`);
        return;
      }

      // Use date-fns to format the date as a string key
      const key = date.toDateString();

      // Map entries to the expected format
      notesByDate[key] = entries.map((entry) => ({
        title: entry.file.basename,
      }));
    });

    console.log("[CalendarQueryAdapter] Final processed data:", notesByDate);
    console.log(
      "[CalendarQueryAdapter] Number of processed dates:",
      Object.keys(notesByDate).length
    );
    return notesByDate;
  } catch (error) {
    console.error(
      "[CalendarQueryAdapter] Error executing calendar query:",
      error
    );
    throw error;
  }
}

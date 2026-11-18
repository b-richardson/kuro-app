/**
 * Utility functions for working with Dataview queries in Obsidian templates
 */

/**
 * Dataview query types enum
 */
export enum DataviewQueryType {
  TABLE = "TABLE",
  LIST = "LIST",
  TASK = "TASK",
  CALENDAR = "CALENDAR",
}

/**
 * Field type for Dataview queries
 */
export enum DataviewFieldType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  BOOLEAN = "boolean",
  LINK = "link",
  TAGS = "tags",
  LIST = "list",
}

/**
 * Sort direction for Dataview queries
 */
export enum DataviewSortDirection {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Filter operator types for Dataview queries
 */
export enum DataviewFilterOperator {
  EQUALS = "=",
  NOT_EQUALS = "!=",
  GREATER_THAN = ">",
  LESS_THAN = "<",
  GREATER_THAN_EQUAL = ">=",
  LESS_THAN_EQUAL = "<=",
  CONTAINS = "contains",
  NOT_CONTAINS = "!contains",
  STARTS_WITH = "startswith",
  ENDS_WITH = "endswith",
  REGEX = "regex",
  EMPTY = "is empty",
  NOT_EMPTY = "is not empty",
}

/**
 * Filter for Dataview queries
 */
export interface DataviewFilterCondition {
  id: string;
  field: string;
  operator: DataviewFilterOperator;
  value: string;
  isMetadata?: boolean;
}

/**
 * Sort configuration for Dataview queries
 */
export interface DataviewSort {
  field: string;
  direction: DataviewSortDirection;
  isMetadata?: boolean;
}

/**
 * Group configuration for Dataview queries
 */
export interface DataviewGroup {
  field: string;
  isMetadata?: boolean;
}

/**
 * Complete Dataview query configuration
 */
export interface DataviewQueryConfig {
  type: DataviewQueryType;
  fields: string[];
  source: string;
  filters: DataviewFilterCondition[];
  sorts: DataviewSort[];
  groupBy?: DataviewGroup;
  limit?: number;
  flatten?: boolean;
  inline?: boolean;
  name?: string;
  description?: string;
}

/**
 * Common Dataview metadata fields
 */
export const COMMON_METADATA_FIELDS = [
  { id: "title", label: "Title", type: DataviewFieldType.TEXT },
  { id: "file.name", label: "File Name", type: DataviewFieldType.TEXT },
  { id: "file.path", label: "File Path", type: DataviewFieldType.TEXT },
  { id: "file.folder", label: "Folder", type: DataviewFieldType.TEXT },
  { id: "file.ext", label: "Extension", type: DataviewFieldType.TEXT },
  { id: "file.link", label: "File Link", type: DataviewFieldType.LINK },
  { id: "file.size", label: "File Size", type: DataviewFieldType.NUMBER },
  { id: "file.ctime", label: "Creation Time", type: DataviewFieldType.DATE },
  { id: "file.cday", label: "Creation Day", type: DataviewFieldType.DATE },
  { id: "file.mtime", label: "Modified Time", type: DataviewFieldType.DATE },
  { id: "file.mday", label: "Modified Day", type: DataviewFieldType.DATE },
  { id: "file.tags", label: "Tags", type: DataviewFieldType.TAGS },
  { id: "file.etags", label: "Explicit Tags", type: DataviewFieldType.TAGS },
  { id: "file.inlinks", label: "Inlinks", type: DataviewFieldType.LIST },
  { id: "file.outlinks", label: "Outlinks", type: DataviewFieldType.LIST },
  { id: "file.tasks", label: "Tasks", type: DataviewFieldType.LIST },
];

/**
 * Common source types for Dataview queries
 */
export const COMMON_SOURCES = [
  { id: "current-folder", label: "Current Folder", value: '"."' },
  { id: "all-notes", label: "All Notes", value: '"/"' },
  { id: "tag", label: "Tag", value: "#tag", placeholder: "Enter tag name" },
  {
    id: "folder",
    label: "Folder",
    value: '"folder"',
    placeholder: "Enter folder path",
  },
  { id: "linked-to", label: "Linked to current", value: "[[{{title}}]]" },
  {
    id: "outgoing-links",
    label: "Outgoing Links",
    value: "outgoing([[{{title}}]])",
  },
  {
    id: "custom",
    label: "Custom",
    value: "",
    placeholder: "Enter custom source",
  },
];

/**
 * Predefined query templates
 */
export const DATAVIEW_QUERY_TEMPLATES: DataviewQueryConfig[] = [
  {
    name: "Recent Notes",
    description: "Shows the most recently modified notes",
    type: DataviewQueryType.TABLE,
    fields: ["file.link", "file.mtime"],
    source: '"/"',
    filters: [],
    sorts: [{ field: "file.mtime", direction: DataviewSortDirection.DESC }],
    limit: 10,
    inline: false,
  },
  {
    name: "Tasks Due This Week",
    description: "List all tasks due in the next 7 days",
    type: DataviewQueryType.TASK,
    fields: [],
    source: '"/"',
    filters: [
      {
        id: "due-this-week",
        field: "due",
        operator: DataviewFilterOperator.LESS_THAN_EQUAL,
        value: 'date(today) + dur("1 week")',
        isMetadata: true,
      },
      {
        id: "not-completed",
        field: "completed",
        operator: DataviewFilterOperator.EQUALS,
        value: "false",
        isMetadata: true,
      },
    ],
    sorts: [
      { field: "due", direction: DataviewSortDirection.ASC, isMetadata: true },
    ],
    inline: false,
  },
  {
    name: "Notes by Tag",
    description: "Lists all notes with a specific tag",
    type: DataviewQueryType.LIST,
    fields: [],
    source: "#example-tag",
    filters: [],
    sorts: [{ field: "file.name", direction: DataviewSortDirection.ASC }],
    inline: false,
  },
  {
    name: "Project Board",
    description: "Shows project notes grouped by status",
    type: DataviewQueryType.TABLE,
    fields: ["file.link", "project-due", "priority"],
    source: '"Projects"',
    filters: [],
    sorts: [
      {
        field: "priority",
        direction: DataviewSortDirection.DESC,
        isMetadata: true,
      },
    ],
    groupBy: { field: "status", isMetadata: true },
    inline: false,
  },
  {
    name: "Calendar View",
    description: "Shows notes on a calendar by date",
    type: DataviewQueryType.CALENDAR,
    fields: [],
    source: '"/"',
    filters: [
      {
        id: "has-date",
        field: "date",
        operator: DataviewFilterOperator.NOT_EMPTY,
        value: "",
        isMetadata: true,
      },
    ],
    sorts: [],
    inline: false,
  },
  {
    name: "Inline List",
    description: "Simple inline list of notes",
    type: DataviewQueryType.LIST,
    fields: [],
    source: '"/"',
    filters: [
      {
        id: "has-tag",
        field: "file.tags",
        operator: DataviewFilterOperator.CONTAINS,
        value: "#example",
      },
    ],
    sorts: [{ field: "file.name", direction: DataviewSortDirection.ASC }],
    limit: 5,
    inline: true,
  },
];

/**
 * Generates a Dataview query string from a query configuration
 * @param config The query configuration
 * @returns The generated Dataview query
 */
export function generateDataviewQuery(config: DataviewQueryConfig): string {
  const query: string[] = [];
  const indent = config.inline ? "" : "  ";

  // Start with query type
  if (config.inline) {
    query.push(`\`$\{dv.${config.type.toLowerCase()}`);
  } else {
    query.push("```dataview");
    query.push(`${config.type}`);
  }

  // Add fields for TABLE queries
  if (config.type === DataviewQueryType.TABLE && config.fields.length > 0) {
    if (config.inline) {
      query[0] += `(${config.fields.map(formatField).join(", ")})`;
    } else {
      query.push(`${indent}${config.fields.map(formatField).join(", ")}`);
    }
  }

  // Add source
  if (config.inline) {
    query[0] += ` FROM ${config.source}`;
  } else {
    query.push(`${indent}FROM ${config.source}`);
  }

  // Add WHERE clause if there are filters
  if (config.filters.length > 0) {
    const whereClause = config.filters
      .map((filter) => {
        const field = filter.isMetadata ? filter.field : `file.${filter.field}`;

        // Handle special cases
        if (filter.operator === DataviewFilterOperator.EMPTY) {
          return `!${field}`;
        } else if (filter.operator === DataviewFilterOperator.NOT_EMPTY) {
          return field;
        }

        // Handle string values that need quotes
        let value = filter.value;
        if (
          filter.value &&
          !filter.value.startsWith("date(") &&
          !filter.value.includes("(")
        ) {
          if (
            ![DataviewFieldType.NUMBER, DataviewFieldType.BOOLEAN].includes(
              field as DataviewFieldType
            )
          ) {
            if (!value.startsWith('"') && !value.startsWith("'")) {
              value = `"${value}"`;
            }
          }
        }

        return `${field} ${filter.operator} ${value}`;
      })
      .join(" AND ");

    if (config.inline) {
      query[0] += ` WHERE ${whereClause}`;
    } else {
      query.push(`${indent}WHERE ${whereClause}`);
    }
  }

  // Add GROUP BY
  if (config.groupBy) {
    const field = config.groupBy.isMetadata
      ? config.groupBy.field
      : `file.${config.groupBy.field}`;

    if (config.inline) {
      query[0] += ` GROUP BY ${field}`;
    } else {
      query.push(`${indent}GROUP BY ${field}`);
    }
  }

  // Add SORT
  if (config.sorts.length > 0) {
    const sortClause = config.sorts
      .map((sort) => {
        const field = sort.isMetadata ? sort.field : `file.${sort.field}`;
        const direction =
          sort.direction === DataviewSortDirection.DESC ? "DESC" : "ASC";
        return `${field} ${direction}`;
      })
      .join(", ");

    if (config.inline) {
      query[0] += ` SORT ${sortClause}`;
    } else {
      query.push(`${indent}SORT ${sortClause}`);
    }
  }

  // Add LIMIT
  if (config.limit) {
    if (config.inline) {
      query[0] += ` LIMIT ${config.limit}`;
    } else {
      query.push(`${indent}LIMIT ${config.limit}`);
    }
  }

  // Add FLATTEN
  if (config.flatten) {
    if (config.inline) {
      query[0] += " FLATTEN";
    } else {
      query.push(`${indent}FLATTEN`);
    }
  }

  // Close the query
  if (config.inline) {
    query[0] += "}`";
  } else {
    query.push("```");
  }

  return query.join("\n");
}

/**
 * Formats a field for use in a Dataview query
 * @param field The field name
 * @returns The formatted field
 */
function formatField(field: string): string {
  // Check if the field is already properly formatted or has an alias
  if (field.includes(" AS ") || field.includes(" as ")) {
    return field;
  }

  // Handle metadata fields
  if (field.includes(".")) {
    return field;
  }

  // Special fields handling
  switch (field) {
    case "file.link":
    case "link":
      return "file.link";
    default:
      return field;
  }
}

/**
 * Validates a Dataview query
 * @param query The query to validate
 * @returns Validation result and error message if invalid
 */
export function validateDataviewQuery(query: string): {
  isValid: boolean;
  error?: string;
} {
  if (!query.trim()) {
    return { isValid: false, error: "Query cannot be empty" };
  }

  // Check if the query starts with the right syntax for Dataview
  const isInline = query.trim().startsWith("`${dv.");
  const isCodeBlock = query.trim().startsWith("```dataview");

  if (!isInline && !isCodeBlock) {
    return {
      isValid: false,
      error: "Query must start with ```dataview or `${dv.",
    };
  }

  // Check for required clauses
  if (isCodeBlock) {
    const lines = query.trim().split("\n");

    // Must have at least 3 lines (opening, content, closing)
    if (lines.length < 3) {
      return { isValid: false, error: "Incomplete query block" };
    }

    // Check if it has a FROM clause
    const hasFrom = lines.some((line) => line.trim().startsWith("FROM "));

    if (!hasFrom) {
      return { isValid: false, error: "Query must have a FROM clause" };
    }

    // Check if code block is properly closed
    if (lines[lines.length - 1].trim() !== "```") {
      return { isValid: false, error: "Query block must end with ```" };
    }

    // Check query type
    const queryType = lines[1].trim();
    if (
      !Object.values(DataviewQueryType).includes(queryType as DataviewQueryType)
    ) {
      return {
        isValid: false,
        error: "Invalid query type. Must be TABLE, LIST, TASK, or CALENDAR",
      };
    }
  } else if (isInline) {
    // Check for required inline syntax
    if (!query.includes("FROM ")) {
      return { isValid: false, error: "Inline query must have a FROM clause" };
    }

    if (!query.endsWith("}`")) {
      return { isValid: false, error: "Inline query must end with }`" };
    }

    // Check query type
    const match = query.match(/\`\$\{dv\.(table|list|task|calendar)/i);
    if (!match) {
      return { isValid: false, error: "Invalid inline query format" };
    }
  }

  return { isValid: true };
}

/**
 * Parses a Dataview query string into a query configuration object
 * Note: This is a simplified parser and may not handle all complex queries
 * @param query The query string to parse
 * @returns The parsed query configuration or null if parsing failed
 */
export function parseDataviewQuery(query: string): DataviewQueryConfig | null {
  try {
    const isInline = query.trim().startsWith("`${dv.");
    const lines = query.trim().split("\n");

    const config: DataviewQueryConfig = {
      type: DataviewQueryType.LIST,
      fields: [],
      source: "",
      filters: [],
      sorts: [],
      inline: isInline,
    };

    if (isInline) {
      // Parse inline query
      const content = query.slice(4, -2); // Remove `${ and }`

      // Get query type
      const typeMatch = content.match(/^dv\.(table|list|task|calendar)/i);
      if (typeMatch) {
        config.type = typeMatch[1].toUpperCase() as DataviewQueryType;
      }

      // Get fields for TABLE queries
      if (config.type === DataviewQueryType.TABLE) {
        const fieldsMatch = content.match(/dv\.table\(([^)]+)\)/);
        if (fieldsMatch && fieldsMatch[1]) {
          config.fields = fieldsMatch[1].split(",").map((f) => f.trim());
        }
      }

      // Get FROM source
      const fromMatch = content.match(
        /FROM\s+([^WHERE|GROUP|SORT|LIMIT|FLATTEN]+)/i
      );
      if (fromMatch && fromMatch[1]) {
        config.source = fromMatch[1].trim();
      }

      // Get WHERE clause
      const whereMatch = content.match(
        /WHERE\s+([^GROUP|SORT|LIMIT|FLATTEN]+)/i
      );
      if (whereMatch && whereMatch[1]) {
        // Simple parsing of conditions (doesn't handle complex logic)
        const conditions = whereMatch[1].split("AND").map((c) => c.trim());
        config.filters = parseFilterConditions(conditions);
      }

      // Get SORT clause
      const sortMatch = content.match(/SORT\s+([^GROUP|LIMIT|FLATTEN]+)/i);
      if (sortMatch && sortMatch[1]) {
        const sorts = sortMatch[1].split(",").map((s) => s.trim());
        config.sorts = parseSortClauses(sorts);
      }

      // Get LIMIT
      const limitMatch = content.match(/LIMIT\s+(\d+)/i);
      if (limitMatch && limitMatch[1]) {
        config.limit = parseInt(limitMatch[1]);
      }

      // Get GROUP BY
      const groupMatch = content.match(/GROUP BY\s+([^SORT|LIMIT|FLATTEN]+)/i);
      if (groupMatch && groupMatch[1]) {
        const field = groupMatch[1].trim();
        config.groupBy = { field, isMetadata: !field.startsWith("file.") };
      }

      // Check for FLATTEN
      config.flatten = content.includes("FLATTEN");
    } else {
      // Parse code block query
      if (lines.length < 3 || !lines[0].startsWith("```dataview")) {
        return null;
      }

      // Get query type
      const queryType = lines[1].trim();
      config.type = queryType as DataviewQueryType;

      // Process each line
      for (let i = 2; i < lines.length - 1; i++) {
        const line = lines[i].trim();

        // Skip empty lines and the closing ```
        if (!line || line === "```") continue;

        // Get fields for TABLE queries
        if (
          i === 2 &&
          config.type === DataviewQueryType.TABLE &&
          !line.startsWith("FROM")
        ) {
          config.fields = line.split(",").map((f) => f.trim());
          continue;
        }

        // Get FROM source
        if (line.startsWith("FROM ")) {
          config.source = line.substring(5).trim();
          continue;
        }

        // Get WHERE clause
        if (line.startsWith("WHERE ")) {
          const conditions = line
            .substring(6)
            .split("AND")
            .map((c) => c.trim());
          config.filters = parseFilterConditions(conditions);
          continue;
        }

        // Get SORT clause
        if (line.startsWith("SORT ")) {
          const sorts = line
            .substring(5)
            .split(",")
            .map((s) => s.trim());
          config.sorts = parseSortClauses(sorts);
          continue;
        }

        // Get LIMIT
        if (line.startsWith("LIMIT ")) {
          config.limit = parseInt(line.substring(6).trim());
          continue;
        }

        // Get GROUP BY
        if (line.startsWith("GROUP BY ")) {
          const field = line.substring(9).trim();
          config.groupBy = { field, isMetadata: !field.startsWith("file.") };
          continue;
        }

        // Check for FLATTEN
        if (line === "FLATTEN") {
          config.flatten = true;
          continue;
        }
      }
    }

    return config;
  } catch (error) {
    console.error("Error parsing Dataview query:", error);
    return null;
  }
}

/**
 * Parse filter conditions from string array into DataviewFilterCondition objects
 * @param conditions Array of condition strings
 * @returns Array of parsed filter conditions
 */
function parseFilterConditions(
  conditions: string[]
): DataviewFilterCondition[] {
  return conditions.map((condition, index) => {
    // Handle special cases
    if (condition.startsWith("!") && !condition.includes(" ")) {
      // Empty check: !field
      return {
        id: `filter-${index}`,
        field: condition.substring(1).trim(),
        operator: DataviewFilterOperator.EMPTY,
        value: "",
        isMetadata: !condition.substring(1).trim().startsWith("file."),
      };
    } else if (!condition.includes(" ")) {
      // Not empty check: field
      return {
        id: `filter-${index}`,
        field: condition.trim(),
        operator: DataviewFilterOperator.NOT_EMPTY,
        value: "",
        isMetadata: !condition.trim().startsWith("file."),
      };
    }

    // Regular conditions with operators
    for (const op of Object.values(DataviewFilterOperator)) {
      if (condition.includes(` ${op} `)) {
        const [field, value] = condition.split(` ${op} `);
        return {
          id: `filter-${index}`,
          field: field.trim(),
          operator: op as DataviewFilterOperator,
          value: value.trim().replace(/^["'](.*)["']$/, "$1"), // Remove quotes
          isMetadata: !field.trim().startsWith("file."),
        };
      }
    }

    // Default fallback
    return {
      id: `filter-${index}`,
      field: "unknown",
      operator: DataviewFilterOperator.EQUALS,
      value: "",
      isMetadata: false,
    };
  });
}

/**
 * Parse sort clauses from string array into DataviewSort objects
 * @param sorts Array of sort strings
 * @returns Array of parsed sort configurations
 */
function parseSortClauses(sorts: string[]): DataviewSort[] {
  return sorts.map((sort, index) => {
    const parts = sort.trim().split(" ");
    const field = parts[0].trim();
    const direction =
      parts.length > 1 && parts[1].toUpperCase() === "DESC"
        ? DataviewSortDirection.DESC
        : DataviewSortDirection.ASC;

    return {
      field,
      direction,
      isMetadata: !field.startsWith("file."),
    };
  });
}

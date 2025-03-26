// src/utils/DataviewFieldsUtils.ts

import { v4 as uuidv4 } from "uuid";

/**
 * Interface for a Dataview field
 */
export interface DataviewField {
  id: string;
  name: string;
  value: string;
}

/**
 * Layout types for Dataview fields
 */
export type DataviewFieldLayout = "inline" | "block";

/**
 * Parse Dataview fields from content array
 * @param content Array of content strings
 * @returns Array of DataviewField objects
 */
export function parseFieldsFromContent(content: string[]): DataviewField[] {
  if (!content || content.length === 0 || content[0] === "") {
    return [];
  }

  const fields: DataviewField[] = [];

  // Detect if we're using block format (each field on a new line)
  const isBlockFormat =
    content.length > 1 || (content.length === 1 && !content[0].includes("  "));

  if (isBlockFormat) {
    // Process each line as a separate field
    content.forEach((line) => {
      const match = line.match(/^(.*?)::\s*(.*)$/);
      if (match) {
        fields.push({
          id: uuidv4(),
          name: match[1].trim(),
          value: match[2].trim(),
        });
      }
    });
  } else {
    // Process inline format (fields separated by double spaces)
    const inlineFields = content[0].split(/\s{2,}/);
    inlineFields.forEach((field) => {
      const match = field.match(/^(.*?)::\s*(.*)$/);
      if (match) {
        fields.push({
          id: uuidv4(),
          name: match[1].trim(),
          value: match[2].trim(),
        });
      }
    });
  }

  return fields;
}

/**
 * Generate content array from Dataview fields
 * @param fields Array of DataviewField objects
 * @param layout Layout format (inline or block)
 * @returns Array of content strings
 */
export function generateContentFromFields(
  fields: DataviewField[],
  layout: DataviewFieldLayout
): string[] {
  // Filter out completely empty fields
  const nonEmptyFields = fields.filter((field) => field.name || field.value);

  if (nonEmptyFields.length === 0) {
    return [""];
  }

  if (layout === "inline") {
    // Inline format: Field1:: Value1  Field2:: Value2
    const inlineContent = nonEmptyFields
      .map((field) => `${field.name}:: ${field.value}`)
      .join("  ");
    return inlineContent ? [inlineContent] : [""];
  } else {
    // Block format: one field per line
    return nonEmptyFields.map((field) => `${field.name}:: ${field.value}`);
  }
}

/**
 * Determine field type based on value content
 * @param value Field value
 * @returns Field type as string
 */
export function getFieldType(value: string): string {
  if (!value) return "empty";

  if (/^-?\d+(\.\d+)?$/.test(value)) return "number";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
  if (/^[\p{Emoji}]/u.test(value)) return "emoji";
  if (/^#\w+/.test(value)) return "tag";
  if (/\[\[.*\]\]/.test(value)) return "link";

  return "text";
}

/**
 * Get an icon class for a field type
 * @param value Field value
 * @returns FontAwesome icon class
 */
export function getFieldTypeIcon(value: string): string {
  const type = getFieldType(value);

  switch (type) {
    case "number":
      return "fas fa-hashtag";
    case "date":
      return "fas fa-calendar-alt";
    case "emoji":
      return "far fa-smile";
    case "tag":
      return "fas fa-tag";
    case "link":
      return "fas fa-link";
    case "text":
      return "fas fa-font";
    case "empty":
      return "fas fa-question";
    default:
      return "fas fa-question";
  }
}

/**
 * Get a CSS class for styling based on field type
 * @param value Field value
 * @returns CSS class name
 */
export function getFieldTypeClass(value: string): string {
  const type = getFieldType(value);
  return `type-${type}`;
}

/**
 * Validate Dataview field syntax
 * @param content Array of content strings
 * @returns Validation result
 */
export function validateDataviewFields(content: string[]): {
  isValid: boolean;
  error?: string;
} {
  if (!content || content.length === 0) {
    return { isValid: false, error: "Content cannot be empty" };
  }

  // If content is just an empty string, it's technically valid (new field)
  if (content.length === 1 && content[0] === "") {
    return { isValid: true };
  }

  // Check that each non-empty line has proper field syntax
  const invalidLines = content.filter((line) => {
    return line.trim() !== "" && !line.includes("::");
  });

  if (invalidLines.length > 0) {
    return {
      isValid: false,
      error: "Each dataview field must use Field:: Value syntax",
    };
  }

  return { isValid: true };
}

/**
 * Get default field suggestions
 * @returns Array of common field names
 */
export function getDefaultFieldSuggestions(): string[] {
  return [
    "Mood",
    "Energy",
    "Sleep",
    "Productivity",
    "Exercise",
    "Water",
    "Meals",
    "Notes",
    "Weather",
    "Location",
    "Tags",
    "Priority",
    "Status",
    "Due",
    "Completed",
  ];
}

/**
 * Create a new empty Dataview field
 * @returns DataviewField object
 */
export function createEmptyField(): DataviewField {
  return {
    id: uuidv4(),
    name: "",
    value: "",
  };
}

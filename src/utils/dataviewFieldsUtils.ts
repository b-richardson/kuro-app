/**
 * Utility functions for working with Dataview fields in Obsidian templates
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a Dataview field with name and value
 */
export interface DataviewField {
  id: string;
  name: string;
  value: string;
}

/**
 * Represents the layout type for Dataview fields
 */
export type DataviewFieldLayout = 'inline' | 'block';

/**
 * Represents the data type for Dataview field values
 */
export type DataviewFieldValueType = 'text' | 'number' | 'boolean' | 'date' | 'link' | 'list';

/**
 * Creates a new empty Dataview field with a unique ID
 * @returns A new empty DataviewField object
 */
export function createEmptyField(): DataviewField {
  return {
    id: uuidv4(),
    name: '',
    value: ''
  };
}

/**
 * Parses Dataview fields from content string array
 * @param content Array of strings containing field syntax
 * @returns Array of parsed DataviewField objects
 */
export function parseFieldsFromContent(content: string[]): DataviewField[] {
  const fields: DataviewField[] = [];

  // Process each line to extract fields
  content.forEach(line => {
    if (!line.trim()) return;

    // Look for key:: value pattern
    const match = line.match(/^([^:]+)::(.*)$/);
    if (match) {
      fields.push({
        id: uuidv4(),
        name: match[1].trim(),
        value: match[2].trim()
      });
    }
  });

  return fields;
}

/**
 * Generates content string array from Dataview fields
 * @param fields Array of DataviewField objects
 * @param layout Layout type ('inline' or 'block')
 * @returns Array of strings with field syntax
 */
export function generateContentFromFields(fields: DataviewField[], layout: DataviewFieldLayout): string[] {
  if (fields.length === 0) {
    return [''];
  }

  if (layout === 'inline') {
    // Create single line with fields separated by spaces
    const fieldStrings = fields.map(field => `${field.name}:: ${field.value}`);
    return [fieldStrings.join(' ')];
  } else {
    // Create one line per field
    return fields.map(field => `${field.name}:: ${field.value}`);
  }
}

/**
 * Get the appropriate icon for a field value type
 * @param value The field value
 * @returns CSS class string for the icon
 */
export function getFieldTypeIcon(value: string): string {
  const type = detectFieldValueType(value);
  
  switch (type) {
    case 'number':
      return 'fas fa-hashtag';
    case 'boolean':
      return 'fas fa-toggle-on';
    case 'date':
      return 'fas fa-calendar-alt';
    case 'link':
      return 'fas fa-link';
    case 'list':
      return 'fas fa-list';
    default:
      return 'fas fa-font';
  }
}

/**
 * Get the CSS class for a field value type
 * @param value The field value
 * @returns CSS class string
 */
export function getFieldTypeClass(value: string): string {
  const type = detectFieldValueType(value);
  return `type-${type}`;
}

/**
 * Detects the type of a field value
 * @param value The field value
 * @returns The detected type
 */
function detectFieldValueType(value: string): DataviewFieldValueType {
  // Empty field is considered text
  if (!value.trim()) return 'text';

  // Check for number
  if (/^-?\d+(\.\d+)?$/.test(value.trim())) {
    return 'number';
  }

  // Check for boolean
  const lowerValue = value.trim().toLowerCase();
  if (lowerValue === 'true' || lowerValue === 'false') {
    return 'boolean';
  }

  // Check for date (simple check)
  if (/^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return 'date';
  }

  // Check for Obsidian link
  if (value.includes('[[') && value.includes(']]')) {
    return 'link';
  }

  // Check for list (comma separated values)
  if (value.includes(',')) {
    return 'list';
  }

  // Default to text
  return 'text';
}

/**
 * Get default field name suggestions
 * @returns Array of common field names
 */
export function getDefaultFieldSuggestions(): string[] {
  return [
    'type',
    'status',
    'date',
    'due',
    'priority',
    'tags',
    'category',
    'author',
    'project',
    'created',
    'updated',
    'completed',
    'assignee',
    'duration',
    'effort',
    'rating',
    'topic',
    'source',
    'link',
    'area',
    'mood'
  ];
}

/**
 * Validates Dataview field syntax in content
 * @param content Array of strings containing field syntax
 * @returns An object with isValid flag and potential error message
 */
export function validateDataviewFields(content: string[]): { isValid: boolean; error?: string } {
  if (!content || content.length === 0 || (content.length === 1 && content[0] === '')) {
    return { isValid: false, error: 'Content cannot be empty' };
  }

  // Check if all non-empty lines follow the field syntax: key:: value
  for (const line of content) {
    if (line.trim() === '') continue; // Skip empty lines
    
    if (!line.includes('::')) {
      return { 
        isValid: false, 
        error: `Invalid field format: "${line}". Fields should use the format "key:: value"` 
      };
    }
    
    // Check if the field name is present
    const parts = line.split('::');
    if (!parts[0].trim()) {
      return { 
        isValid: false, 
        error: 'Field names cannot be empty' 
      };
    }
  }

  return { isValid: true };
}
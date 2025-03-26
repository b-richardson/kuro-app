/**
 * Utility functions for validating module content
 */

/**
 * Validates header content format
 * @param {string[]} content Header content
 * @returns {{isValid: boolean, error: string|null}} Validation result with error message if invalid
 */
export function validateHeaderContent(content) {
  if (!content || content.length === 0) {
    return { isValid: false, error: "Header cannot be empty" };
  }

  // Check that all lines follow header format
  for (const line of content) {
    if (!line.match(/^#+\s+.+/)) {
      return { 
        isValid: false, 
        error: "Header format is invalid. Must start with '#' followed by text" 
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validates checklist content format
 * @param {string[]} content Checklist content
 * @returns {{isValid: boolean, error: string|null}} Validation result with error message if invalid
 */
export function validateChecklistContent(content) {
  if (!content || content.length === 0) {
    return { isValid: false, error: "Checklist cannot be empty" };
  }

  // Check that all lines follow checklist format
  for (const line of content) {
    if (!line.match(/^-\s\[([ x])\]\s+.*/)) {
      return { 
        isValid: false, 
        error: "Checklist item format is invalid. Must be '- [ ] text' or '- [x] text'" 
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validates table content format
 * @param {string[]} content Table content
 * @returns {{isValid: boolean, error: string|null}} Validation result with error message if invalid
 */
export function validateTableContent(content) {
  if (!content || content.length < 3) {
    return { 
      isValid: false, 
      error: "Table must have at least a header row, separator row, and one data row" 
    };
  }

  // Check for header row (should have pipe characters)
  if (!content[0].includes('|')) {
    return { isValid: false, error: "Table header row must contain pipe characters" };
  }

  // Check for separator row (should have dashes and pipes)
  if (!content[1].match(/\|[\-\|\s]+\|/)) {
    return { 
      isValid: false, 
      error: "Table must have a separator row with dashes between pipes" 
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates text content
 * @param {string[]} content Text content
 * @returns {{isValid: boolean, error: string|null}} Validation result with error message if invalid
 */
export function validateTextContent(content) {
  if (!content || content.length === 0) {
    return { isValid: false, error: "Text content cannot be empty" };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates content based on module type
 * @param {string} moduleType Type of the module
 * @param {string[]} content Module content
 * @returns {{isValid: boolean, error: string|null}} Validation result with error message if invalid
 */
export function validateModuleContent(moduleType, content) {
  switch (moduleType) {
    case "header":
      return validateHeaderContent(content);
    case "checklist":
      return validateChecklistContent(content);
    case "table":
      return validateTableContent(content);
    case "text":
      return validateTextContent(content);
    default:
      return { isValid: true, error: null };
  }
}
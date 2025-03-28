/**
 * Core utility functions for working with module content
 */

import { TemplateModule } from "@/types/TemplateModule";

/**
 * Update a specific line of content at the given index
 */
export function updateContentLine(
  content: string[],
  index: number,
  newValue: string
): string[] {
  if (index < 0 || index >= content.length) {
    console.error("Invalid content index:", index);
    return content;
  }

  const newContent = [...content];
  newContent[index] = newValue;
  return newContent;
}

/**
 * Add a new line of content
 * @param content Current content array
 * @param type Type of module (used for generating default content)
 * @param position Where to add the new line (defaults to end)
 */
export function addNewContentLine(
  content: string[],
  type: string,
  position: number = content.length
): string[] {
  // Special case for divider - should always remain a single line
  if (type === "divider") {
    return content;
  }
  
  // Default content based on module type
  let newLine = "";
  
  switch (type) {
    case "header":
      newLine = "# New Header";
      break;
    case "text":
      newLine = "New paragraph";
      break;
    case "checklist":
      newLine = "[ ] New item";
      break;
    case "table":
      newLine = "| Column 1 | Column 2 |";
      break;
    default:
      newLine = "";
  }

  const newContent = [...content];
  newContent.splice(position, 0, newLine);
  return newContent;
}

/**
 * Delete a content line at the given index
 */
export function deleteContentLine(
  content: string[],
  index: number,
  type?: string
): string[] {
  if (index < 0 || index >= content.length) {
    console.error("Invalid content index for deletion:", index);
    return content;
  }

  // For divider, always keep at least one line
  if (type === "divider") {
    return content;
  }

  const newContent = [...content];
  newContent.splice(index, 1);
  return newContent;
}

/**
 * Duplicate a module with a new ID
 */
export function duplicateModule(
  module: TemplateModule,
  modules: TemplateModule[],
  index: number
): TemplateModule[] {
  // Create deep copy of the module
  const newModule: TemplateModule = {
    ...JSON.parse(JSON.stringify(module)),
    id: generateModuleId(),
  };

  // Insert at the position right after the current module
  const newModules = [...modules];
  newModules.splice(index + 1, 0, newModule);
  return newModules;
}

/**
 * Generate a unique ID for a new module
 */
export function generateModuleId(): string {
  return `module-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Create a toast message placeholder
 * This will be replaced with actual toast implementation later
 */
export function createToastPlaceholder(
  message: string,
  type: "success" | "error" | "info" = "info"
): void {
  // For now, just log to console with a prefix showing this is a toast
  console.log(`[TOAST-${type.toUpperCase()}]: ${message}`);
}
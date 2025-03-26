/**
 * Utility functions for template modules
 */

/**
 * Adds a new content line to a module based on its type
 * @param {string[]} content Current module content
 * @param {string} moduleType Type of the module
 * @returns {string[]} Updated content with new line added
 */
export function addNewContentLine(content, moduleType) {
  const newContent = [...content];

  switch (moduleType) {
    case "header":
      newContent.push("# New Header");
      break;
    case "checklist":
      newContent.push("- [ ] New item");
      break;
    case "text":
      newContent.push("New paragraph");
      break;
    default:
      newContent.push("");
  }

  return newContent;
}

/**
 * Deletes a content line at the specified index
 * @param {string[]} content Current module content
 * @param {number} index Index of the line to delete
 * @returns {string[]} Updated content with line removed
 */
export function deleteContentLine(content, index) {
  const newContent = [...content];
  newContent.splice(index, 1);
  return newContent;
}

/**
 * Updates a specific line in the content
 * @param {string[]} content Current module content
 * @param {number} index Index of the line to update
 * @param {string} newValue New line value
 * @returns {string[]} Updated content with modified line
 */
export function updateContentLine(content, index, newValue) {
  const newContent = [...content];
  newContent[index] = newValue;
  return newContent;
}

/**
 * Creates a deep copy of modules array to avoid direct mutation
 * @param {Array} modules Array of modules to copy
 * @returns {Array} Deep copy of the modules array
 */
export function cloneModules(modules) {
  return modules.map(module => ({...module}));
}

/**
 * Moves a module up or down in the modules array
 * @param {Array} modules Array of modules
 * @param {number} index Current index of the module
 * @param {string} direction Direction to move ('up' or 'down')
 * @returns {Array} Updated modules array with the module moved
 */
export function moveModule(modules, index, direction) {
  // Guard against invalid operations
  if (
    (direction === "up" && index === 0) ||
    (direction === "down" && index === modules.length - 1)
  ) {
    return modules;
  }

  // Create a fresh copy of the modules array
  const updatedModules = cloneModules(modules);

  // Calculate the new index
  const newIndex = direction === "up" ? index - 1 : index + 1;

  // Store references to the modules we're swapping
  const moduleA = updatedModules[index];
  const moduleB = updatedModules[newIndex];

  // Perform the swap
  updatedModules[newIndex] = moduleA;
  updatedModules[index] = moduleB;

  return updatedModules;
}
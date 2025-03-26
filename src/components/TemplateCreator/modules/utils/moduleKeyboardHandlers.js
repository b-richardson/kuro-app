/**
 * Utility functions for keyboard handling in modules
 */

/**
 * Handle table keyboard navigation
 * @param {KeyboardEvent} event Keyboard event
 * @param {number} rowIndex Current row index
 * @param {number} colIndex Current column index
 * @param {Array} tableData Table data structure
 * @param {Function} focusCell Function to focus a specific cell
 * @param {Function} addTableRow Function to add a new row
 * @returns {boolean} Whether the event was handled
 */
export function handleTableKeyboardNavigation(
  event,
  rowIndex,
  colIndex,
  tableData,
  focusCell,
  addTableRow
) {
  // Get current dimensions
  const maxRow = tableData.length - 1;
  const maxCol = tableData[rowIndex].length - 1;

  switch (event.key) {
    case "Tab":
      // Handle tab navigation
      if (!event.shiftKey) {
        // Move right
        if (colIndex < maxCol) {
          event.preventDefault();
          focusCell(rowIndex, colIndex + 1);
          return true;
        } else if (rowIndex < maxRow) {
          // End of row, move to next row
          event.preventDefault();
          focusCell(rowIndex + 1, 0);
          return true;
        }
      } else {
        // Move left with shift+tab
        if (colIndex > 0) {
          event.preventDefault();
          focusCell(rowIndex, colIndex - 1);
          return true;
        } else if (rowIndex > 0) {
          // Beginning of row, move to previous row
          event.preventDefault();
          focusCell(rowIndex - 1, tableData[rowIndex - 1].length - 1);
          return true;
        }
      }
      break;

    case "ArrowDown":
      if (rowIndex < maxRow) {
        event.preventDefault();
        focusCell(rowIndex + 1, colIndex);
        return true;
      }
      break;

    case "ArrowUp":
      if (rowIndex > 0) {
        event.preventDefault();
        focusCell(rowIndex - 1, colIndex);
        return true;
      }
      break;

    case "ArrowRight":
      if (
        event.ctrlKey ||
        event.metaKey ||
        (event.target.selectionStart === event.target.value.length)
      ) {
        if (colIndex < maxCol) {
          event.preventDefault();
          focusCell(rowIndex, colIndex + 1);
          return true;
        }
      }
      break;

    case "ArrowLeft":
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.target.selectionStart === 0
      ) {
        if (colIndex > 0) {
          event.preventDefault();
          focusCell(rowIndex, colIndex - 1);
          return true;
        }
      }
      break;

    case "Enter":
      if (event.ctrlKey || event.metaKey) {
        // Create new row with Ctrl/Cmd+Enter
        event.preventDefault();
        addTableRow();
        return true;
      }
      break;
  }

  return false;
}

/**
 * Handle module keyboard shortcuts
 * @param {KeyboardEvent} event Keyboard event
 * @param {Function} addLine Function to add a new line
 * @param {Function} duplicateModule Function to duplicate the module
 * @param {Function} deleteModule Function to delete the module
 * @param {Function} moveUp Function to move the module up
 * @param {Function} moveDown Function to move the module down
 * @returns {boolean} Whether the event was handled
 */
export function handleModuleShortcuts(
  event,
  addLine,
  duplicateModule,
  deleteModule,
  moveUp,
  moveDown
) {
  // Don't process when editing text fields unless Alt key is used
  const target = event.target;
  const isEditingInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
    target.tagName
  );

  // Alt key shortcuts (can be used while editing)
  if (event.altKey) {
    if (event.key === "a") {
      event.preventDefault();
      addLine();
      return true;
    }

    if (event.key === "d") {
      event.preventDefault();
      duplicateModule();
      return true;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteModule();
      return true;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveUp();
      return true;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveDown();
      return true;
    }
  }

  // Other shortcuts when not editing
  if (!isEditingInput) {
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteModule();
      return true;
    }
  }

  return false;
}
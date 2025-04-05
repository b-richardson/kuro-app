/**
 * Collection of preprocessor functions for different Obsidian syntax elements
 */

/**
 * Preprocesses basic Markdown syntax
 */
export function preprocessMarkdown(content: string): string {
  let processedContent = content;

  // Process bold, italic, and bold-italic
  // Important: Process bold-italic first because it's a combination
  processedContent = processedContent.replace(
    /\*\*\*([^*]+)\*\*\*/g,
    "<strong><em>$1</em></strong>"
  );
  processedContent = processedContent.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong>$1</strong>"
  );
  processedContent = processedContent.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Also handle underscore style italics
  processedContent = processedContent.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Pre-process task list items to ensure consistent formatting
  processedContent = processedContent.replace(
    /^(\s*)- \[([ xX])\]\s+(.+)$/gm,
    (match, indent, checked, content) => {
      // This formats task items in a way TipTap can reliably parse
      return `${indent}- [${checked}] ${content}`;
    }
  );

  // Pre-process tables to ensure proper parsing
  processedContent = processedContent.replace(
    /^\|(.*)\|$/gm,
    (match, content) => {
      return `|${content}|`;
    }
  );

  // Enhance horizontal rule rendering
  processedContent = processedContent.replace(
    /^(\s*[*\-_]{3,}\s*)$/gm,
    '<hr class="obsidian-hr" />'
  );

  return processedContent;
}

/**
 * Preprocesses Dataview blocks
 */
export function preprocessDataview(content: string): string {
  let processedContent = content;

  // Preprocess dataview blocks
  processedContent = processedContent.replace(
    /```dataview\s+([\s\S]*?)```/g,
    (match, query) => {
      // Replace with explicit HTML structure
      return `<div class="dataview-block-container"><pre data-language="dataview"><code>${query.trim()}</code></pre></div>`;
    }
  );

  return processedContent;
}

/**
 * Preprocesses Obsidian callouts
 */
export function preprocessCallouts(content: string): string {
  let processedContent = content;

  // Preprocess callouts to make them more compatible with Obsidian
  processedContent = processedContent.replace(
    />\s*\[!(\w+)\](?:\s*([^\n]*))?(?:\n>?\s*([^\n]*(?:\n>?\s*[^\n]*)*))?/g,
    (match, type, title, content) => {
      const titleAttr = title ? ` data-callout-title="${title.trim()}"` : "";
      const contentStr = content ? content.replace(/^\s*>\s*/gm, "") : "";
      return `<div class="obsidian-callout obsidian-callout-${type.toLowerCase()}" data-callout-type="${type.toLowerCase()}"${titleAttr}>${contentStr.trim()}</div>`;
    }
  );

  return processedContent;
}

/**
 * Preprocesses Templater date/time syntax
 */
export function preprocessTemplaterDate(content: string): string {
  let processedContent = content;

  // Process both tp.date.* AND tp.file.*_date
  processedContent = processedContent.replace(
    /(<%(.*?)(tp\.date\.|tp\.file\.(creation_date|last_modified_date))(\(.*?\))?(.*?)%>)/g,
    (match) => {
      const escapedMatch = match
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `<span class="templater-date" data-code="${escapedMatch}">${escapedMatch}</span>`;
    }
  );

  return processedContent;
}

/**
 * Preprocesses Templater file property syntax
 */
export function preprocessTemplaterFile(content: string): string {
  let processedContent = content;

  // Preprocess templater file properties, EXCLUDING date-related ones
  processedContent = processedContent.replace(
    /(<%(.*?)tp\.file\.(path|folder|title|cursor|selection|content|size|tags|etags|extension|include|rename|move|exists)(\(.*?\))?(.*?)%>)/g,
    (match) => {
      // Notice we removed creation_date and last_modified_date from the regex

      // Rest of the function remains the same
      const propertyMatch = match.match(/tp\.file\.([a-zA-Z_]+)/);
      const propertyType = propertyMatch ? propertyMatch[1] : "unknown";

      const escapedMatch = match
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `<span class="templater-file" data-code="${escapedMatch}">${escapedMatch}</span>`;
    }
  );

  return processedContent;
}

/**
 * Preprocesses Templater user input syntax
 */
export function preprocessTemplaterUserInput(content: string): string {
  let processedContent = content;

  // Preprocess templater user input patterns
  processedContent = processedContent.replace(
    /<%(.*?)(?:tp\.user\.(\w+)\s*=\s*)?await\s*tp\.system\.(prompt|suggester|toggle)\((.*?)%>/g,
    (match, prefix, varName, funcType, params) => {
      // Extract prompt text for display
      let promptText = "User input";
      let inputType = "text";

      // Determine input type
      if (funcType === "suggester") {
        inputType = "select-dropdown";
      } else if (funcType === "toggle") {
        inputType = "select-radio";
      } else if (params.includes("multi: true")) {
        inputType = "multiline";
      }

      // Try to extract prompt text
      const promptMatch = params.match(/["']([^"']+)["']/);
      if (promptMatch) {
        promptText = promptMatch[1];
      }

      return `<span class="templater-user-input" 
        data-code="${match.replace(/"/g, "&quot;")}"
        data-prompt="${promptText.replace(/"/g, "&quot;")}"
        data-variable="${varName || ""}"
        data-input-type="${inputType}">${match}</span>`;
    }
  );

  // Also handle tp.userInput syntax (add this for compatibility)
  processedContent = processedContent.replace(
    /<%(.*?)tp\.userInput\(["']([^"']+)["'](.*?)%>/g,
    (match, prefix, promptText, suffix) => {
      return `<span class="templater-user-input" 
        data-code="${match.replace(/"/g, "&quot;")}"
        data-prompt="${promptText.replace(/"/g, "&quot;")}"
        data-variable=""
        data-input-type="text">${match}</span>`;
    }
  );

  return processedContent;
}

/**
 * Preprocesses Templater transform syntax
 */
export function preprocessTemplaterTransform(content: string): string {
  let processedContent = content;

  // Match patterns for transformations
  const patterns = [
    // Variable assignment with transformation
    /<%(.*?)tp\.user\.(\w+)\s*=\s*(.*?)(toUpperCase|toLowerCase|replace|format|toLocaleString|toFixed|moment)(.*)%>/g,
    // Direct transformation without variable
    /<%(.*?)(["'].*?["']|\w+)\.(toUpperCase|toLowerCase|replace|format|toLocaleString|toFixed|moment)(.*)%>/g,
  ];

  for (const pattern of patterns) {
    processedContent = processedContent.replace(pattern, (match) => {
      console.log("Matched transform pattern:", match);

      // Determine transformation type
      let transformType = "textCase";

      // Determine if input is text or variable
      const inputSource =
        match.includes('"') || match.includes("'") ? "text" : "variable";

      // Check if it's a variable assignment
      const hasVariable = match.includes("tp.user.") && match.includes("=");

      // Try to extract variable name
      let variableName = "";
      if (hasVariable) {
        const varMatch = match.match(/tp\.user\.(\w+)\s*=/);
        if (varMatch) variableName = varMatch[1];
      }

      // Create display info object
      let displayInfo = {};

      // Determine transformation type and specific info
      if (match.includes("toUpperCase()")) {
        transformType = "textCase";
        displayInfo = { caseType: "uppercase" };
      } else if (match.includes(".toLowerCase()")) {
        transformType = "textCase";

        if (match.includes('replace(/\\s+/g, "-")')) {
          displayInfo = { caseType: "kebabcase" };
        } else if (match.includes('replace(/\\s+/g, "_")')) {
          displayInfo = { caseType: "snakecase" };
        } else {
          displayInfo = { caseType: "lowercase" };
        }
      } else if (match.includes("replace(/\\b\\w/g")) {
        transformType = "textCase";
        displayInfo = { caseType: "titlecase" };
      } else if (match.includes("charAt(0).toUpperCase()")) {
        transformType = "textCase";
        displayInfo = { caseType: "sentencecase" };
      } else if (
        match.includes("toLowerCase().replace(/[^a-zA-Z0-9]+(.)|(^[a-zA-Z])/g")
      ) {
        transformType = "textCase";
        displayInfo = { caseType: "camelcase" };
      } else if (
        match.includes(".replace(") ||
        (match.includes(".split(") && match.includes(".join("))
      ) {
        transformType = "substitution";
      } else if (
        match.includes("toLocaleString") ||
        match.includes("toFixed")
      ) {
        transformType = "format";
        displayInfo = { formatType: "number" };
      } else if (match.includes("moment") || match.includes(".format(")) {
        transformType = "format";
        displayInfo = { formatType: "date" };
      }

      console.log("Transformation details:", {
        transformType,
        displayInfo,
        hasVariable,
        variableName,
        inputSource,
      });

      return `<span class="templater-transform" 
          data-code="${match.replace(/"/g, "&quot;")}"
          data-transform-type="${transformType}"
          data-has-variable="${hasVariable ? "true" : "false"}"
          data-variable-name="${variableName}"
          data-input-source="${inputSource}"
          data-display-info='${JSON.stringify(displayInfo)}'>${match}</span>`;
    });
  }

  return processedContent;
}

/**
 * Preprocesses HTML entities
 */
export function preprocessHtmlEntities(content: string): string {
  let processedContent = content;

  // Convert HTML entities to actual characters for templater syntax
  processedContent = processedContent.replace(/&lt;%/g, "<%");
  processedContent = processedContent.replace(/%&gt;/g, "%>");

  return processedContent;
}

/**
 * Main preprocessing function that combines all individual preprocessors
 */
export function preprocessContent(content: string): string {
  let processedContent = content;

  // First handle HTML entities
  processedContent = preprocessHtmlEntities(processedContent);

  // Apply each preprocessor in sequence
  processedContent = preprocessMarkdown(processedContent);
  processedContent = preprocessDataview(processedContent);
  processedContent = preprocessCallouts(processedContent);
  processedContent = preprocessTemplaterDate(processedContent);
  processedContent = preprocessTemplaterFile(processedContent);
  processedContent = preprocessTemplaterUserInput(processedContent);
  processedContent = preprocessTemplaterTransform(processedContent);

  return processedContent;
}

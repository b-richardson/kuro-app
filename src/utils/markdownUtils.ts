import { TemplateSection } from "@/types/TemplateSect";

/**
 * Error class for markdown generation errors
 */
export class MarkdownGenerationError extends Error {
  constructor(
    message: string,
    public sectionType?: string,
    public details?: string
  ) {
    super(message);
    this.name = "MarkdownGenerationError";
  }
}

/**
 * Generates markdown text from an array of template sections
 * @param sections Array of template sections
 * @returns Markdown string
 * @throws {MarkdownGenerationError} When there's an error generating markdown
 */
export function generateMarkdown(
  sections: TemplateSection[]
): string {
  if (!sections || !sections.length) return "";

  try {
    // First look for YAML front matter to place at the beginning
    const yamlSection = sections.find((section) => section.type === "yaml");

    // Process all other sections (excluding YAML if present)
    const processedSections = sections
      .filter((section) => (yamlSection ? section !== yamlSection : true))
      .map((section, index) => {
        try {
          return processSection(section);
        } catch (error) {
          // Add context about which section failed
          throw new MarkdownGenerationError(
            `Error processing ${section.type} section at position ${index + 1}`,
            section.type,
            error instanceof Error ? error.message : String(error)
          );
        }
      });

    // If there's a YAML section, add it at the beginning
    if (yamlSection) {
      try {
        return (
          processSection(yamlSection) +
          "\n\n" +
          processedSections.join("\n\n")
        );
      } catch (error) {
        throw new MarkdownGenerationError(
          "Error processing YAML frontmatter section",
          "yaml",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Otherwise just join all sections
    return processedSections.join("\n\n");
  } catch (error) {
    // Re-throw MarkdownGenerationError as is
    if (error instanceof MarkdownGenerationError) {
      throw error;
    }

    // Otherwise wrap in our error class
    throw new MarkdownGenerationError(
      "Failed to generate markdown",
      "unknown",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Processes a single section
 * @param section The section to process
 * @returns Processed markdown content
 */
function processSection(
  section: TemplateSection
): string {
  // Handle basic sections
  if (["header", "checklist", "table", "text"].includes(section.type)) {
    return section.content.join(section.type === "text" ? "\n\n" : "\n");
  }
  
  // Handle divider sections - should output "---"
  if (section.type === "divider") {
    return "---";
  }

  // Special handling for YAML to ensure it has proper --- delimiters
  if (section.type === "yaml") {
    const content = [...section.content];

    // Make sure the content starts and ends with ---
    if (content.length > 0 && content[0].trim() !== "---") {
      content.unshift("---");
    }
    if (content.length > 0 && content[content.length - 1].trim() !== "---") {
      content.push("---");
    }

    // If it's empty or only has delimiters, add a placeholder
    if (content.length <= 2) {
      content.splice(1, 0, "title: Untitled");
    }

    return content.join("\n");
  }

  // Handle plugin-specific sections - now all syntax is preserved
  switch (section.type) {
    case "templaterField":
    case "dataviewQuery":
    case "kanban":
      return section.content.join("\n");
    default:
      return "";
  }
}

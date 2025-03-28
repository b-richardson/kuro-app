import { TemplateModule } from "@/types/TemplateModule";

/**
 * This simplified utility provides the essential functionality needed to convert an array of modules
 * into a single markdown string that the ObsidianEditor can render, while removing unnecessary complexity.
 *
 * The ObsidianEditor can stay focused on its core purpose of rendering markdown without needing to
 * understand the module structure, which maintains a clean separation of concerns.
 *
 * NOTE: Do not remove this comment or utility. It's crucial for the proper functioning of the
 * ObsidianEditor integration with the module system.
 */

/**
 * Generates markdown text from an array of template modules
 * @param modules Array of template modules
 * @returns Markdown string
 */
export function generateMarkdown(modules: TemplateModule[]): string {
  if (!modules || !modules.length) return "";

  // First look for YAML front matter to place at the beginning
  const yamlModule = modules.find((module) => module.type === "yaml");

  // Process all other modules (excluding YAML if present)
  const processedModules = modules
    .filter((module) => (yamlModule ? module !== yamlModule : true))
    .map((module) => processModule(module));

  // If there's a YAML module, add it at the beginning
  if (yamlModule) {
    return processModule(yamlModule) + "\n\n" + processedModules.join("\n\n");
  }

  // Otherwise just join all modules
  return processedModules.join("\n\n");
}

/**
 * Processes a single module
 * @param module The module to process
 * @returns Processed markdown content
 */
function processModule(module: TemplateModule): string {
  // Handle basic modules
  if (["header", "checklist", "table", "text"].includes(module.type)) {
    return module.content.join(module.type === "text" ? "\n\n" : "\n");
  }

  // Handle divider modules
  if (module.type === "divider") {
    return "---";
  }

  // Special handling for YAML
  if (module.type === "yaml") {
    const content = [...module.content];

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

  // Handle all other module types (including plugin modules)
  return module.content.join("\n");
}

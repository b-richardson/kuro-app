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
  const frontmatterModule = modules.find(
    (module) => module.type === "frontmatter"
  );

  // Process all other modules (excluding YAML if present)
  const processedModules = modules
    .filter((module) =>
      frontmatterModule ? module !== frontmatterModule : true
    )
    .map((module) => processModule(module));

  // If there's a YAML module, add it at the beginning
  if (frontmatterModule) {
    return (
      processModule(frontmatterModule) + "\n\n" + processedModules.join("\n\n")
    );
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

  // Handle code block module
  if (module.type === "codeBlock") {
    const language = module.metadata?.language || "plaintext";
    return `\`\`\`${language}\n${module.content.join("\n")}\n\`\`\``;
  }

  // Handle divider modules
  if (module.type === "divider") {
    return "---";
  }

  // DOBLE CHECK THIS TO SEE IF THIS IS CAUSING THE BUGS WITH PROPERTIES/FRONTMATTER NOT WORK RIGHT IN OBSIDIAN NATIVE
  // Special handling for YAML or Frontmatter module
  if (module.type === "frontmatter") {
    return module.content.join("\n");
  }

  // Handle all other module types (including plugin modules)
  return module.content.join("\n");
}

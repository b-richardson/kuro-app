import { TemplateModule } from "@/types/TemplateModule";
import { v4 as uuidv4 } from "uuid";

/**
 * Composable for module operations
 * Contains all the logic for manipulating modules
 */
export function useModuleOperations() {
  /**
   * Ensures all modules have the correct type format
   * (Converts legacy section types to module types if needed)
   */
  const adaptModuleTypes = (modules: TemplateModule[]): TemplateModule[] => {
    if (!modules || modules.length === 0) return modules;

    // Create a mapping between older types and expected types
    const typeMap: Record<string, string> = {
      heading: "header",
      list: "checklist",
      text: "text",
      table: "table",
      code: "text",
      frontmatter: "yaml",
    };

    // Check if any module needs adaptation
    let needsAdaptation = false;

    modules.forEach((module) => {
      // Type-safe check
      const moduleType = module.type as string;
      if (typeMap[moduleType] && moduleType !== typeMap[moduleType]) {
        needsAdaptation = true;
      }

      // Also ensure content is an array (store might use string)
      if (typeof module.content === "string") {
        needsAdaptation = true;
      }
    });

    if (!needsAdaptation) return modules;

    // Create adapted modules with proper types
    const adaptedModules = modules.map((module) => {
      // Create a new object to avoid mutating props directly
      const adapted = { ...module };

      // Type-safe adaptation
      const moduleType = module.type as string;
      if (typeMap[moduleType]) {
        adapted.type = typeMap[moduleType] as any;
      }

      // Ensure content is an array
      if (typeof module.content === "string") {
        adapted.content = [module.content];
      }

      // Ensure pluginType exists
      if (adapted.pluginType === undefined) {
        adapted.pluginType = null;
      }

      return adapted;
    });

    return adaptedModules;
  };

  /**
   * Creates a duplicated module with a new ID
   * Prevents duplication of frontmatter modules
   */
  const duplicateModule = (
    module: TemplateModule,
    insertAfterIndex?: number
  ): { module: TemplateModule; insertAtIndex: number } | null => {
    // Prevent duplication of frontmatter modules
    if (module.type === "frontmatter") {
      return null; // Return null to indicate duplication should not proceed
    }

    // Create a deep copy with a new ID
    const duplicatedModule: TemplateModule = {
      ...JSON.parse(JSON.stringify(module)),
      id: uuidv4(),
    };

    const insertAtIndex =
      insertAfterIndex !== undefined ? insertAfterIndex + 1 : -1;

    return { module: duplicatedModule, insertAtIndex };
  };

  /**
   * Moves a module up or down in the array
   * Prevents moving frontmatter modules
   */
  const moveModule = (
    modules: TemplateModule[],
    moduleId: string,
    direction: "up" | "down"
  ): TemplateModule[] => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);

    // Guard against invalid operations
    if (
      moduleIndex === -1 ||
      (direction === "up" && moduleIndex === 0) ||
      (direction === "down" && moduleIndex === modules.length - 1)
    ) {
      return modules;
    }

    // Prevent moving frontmatter modules
    if (modules[moduleIndex].type === "frontmatter") {
      return modules;
    }

    // Check if we're trying to move something to the position of a frontmatter module
    const newIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1;
    if (modules[newIndex].type === "frontmatter") {
      return modules; // Don't allow swapping with frontmatter
    }

    // Create a fresh copy of the modules array
    const updatedModules = [...modules];

    // Store references to the modules we're swapping
    const moduleA = updatedModules[moduleIndex];
    const moduleB = updatedModules[newIndex];

    // Perform the swap
    updatedModules[newIndex] = moduleA;
    updatedModules[moduleIndex] = moduleB;

    return updatedModules;
  };

  /**
   * Updates content of a specific module
   */
  const updateModuleContent = (
    modules: TemplateModule[],
    moduleId: string,
    newContent: string[]
  ): TemplateModule[] => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);

    if (moduleIndex === -1) return modules;

    // Create a new array with the updated module
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      content: [...newContent],
    };

    return updatedModules;
  };

  /**
   * Deletes a module from the array
   * Frontmatter modules remain deletable as specified
   */
  const deleteModule = (
    modules: TemplateModule[],
    moduleId: string
  ): TemplateModule[] => {
    return modules.filter((m) => m.id !== moduleId);
  };

  return {
    adaptModuleTypes,
    duplicateModule,
    moveModule,
    updateModuleContent,
    deleteModule,
  };
}

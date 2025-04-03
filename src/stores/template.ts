import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useUIStore } from "./ui";
import { useActivityStore } from "./activity";
import { useAuthStore } from "./auth";

// Import the types directly from the type definitions file
import {
  TemplateModule,
  ModuleType,
  PluginType,
  ModuleMetadata,
} from "@/types/TemplateModule";

/**
 * Interface defining the structure of a template
 */
export interface Template {
  /** Unique identifier for the template */
  id: string;

  /** Name of the template */
  name: string;

  /** Description of the template */
  description: string;

  /** Modules that make up the template */
  modules: TemplateModule[];

  /** Tags for categorizing the template */
  tags: string[];

  /** Last modified timestamp */
  lastModified: number;

  /** Creation timestamp */
  createdAt: number;

  /** Whether the template is public or private */
  isPublic: boolean;

  /** User ID of the template creator */
  userId: string | null;
}

/**
 * Pinia store for managing templates
 */
export const useTemplateStore = defineStore("template", () => {
  // State
  const templates = ref<Template[]>([]);
  const currentTemplate = ref<Template | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentTemplateId = ref<string>("");

  // Get UI store for status updates
  const uiStore = useUIStore();

  // Get activity store for logging actions
  const activityStore = useActivityStore();

  // Getters
  const templateById = computed(() => {
    return (id: string) => templates.value.find((t) => t.id === id) || null;
  });

  // Computed property for current modules
  const currentModules = computed((): TemplateModule[] => {
    return currentTemplate.value?.modules || [];
  });

  /**
   * Ensures a module conforms to the TemplateModule interface
   */
  const normalizemodule = (module: Partial<TemplateModule>): TemplateModule => {
    // Ensure content is always a string array
    const content = Array.isArray(module.content)
      ? module.content
      : module.content
      ? [module.content as unknown as string]
      : [""];

    return {
      id: module.id || uuidv4(),
      // Default to 'text' if no type is provided or type is invalid
      type:
        module.type && isValidModuleType(module.type) ? module.type : "text",
      content,
      // Default to null if no plugin type is provided or type is invalid
      pluginType:
        module.pluginType && isValidPluginType(module.pluginType)
          ? module.pluginType
          : null,
      // Include metadata if provided
      ...(module.metadata ? { metadata: module.metadata } : {}),
    };
  };

  /**
   * Validates if a module type is one of the allowed ModuleType values
   */
  const isValidModuleType = (type: any): type is ModuleType => {
    const validTypes: ModuleType[] = [
      // Basic module types
      "header",
      "checklist",
      "table",
      "text",
      "divider",
      "codeBlock",
      // Templater plugin modules
      "templaterField",
      "templaterDateAndTime",
      "templaterFileProperty",
      "templaterUserInput",
      "templaterConditionalContent",
      "templaterValueTransformation",
      "templaterTemplateVariables",
      // Dataview plugin modules
      "dataviewQuery", // Generic/legacy dataview query
      "dataviewTableQuery", // Table query
      "dataviewListQuery", // List query
      "dataviewTaskQuery", // Task query
      "dataviewCalendarQuery", // Calendar query
      "dataviewInlineFields", // Inline dataview fields
    ];
    return validTypes.includes(type as ModuleType);
  };

  /**
   * Validates if a plugin type is one of the allowed PluginType values
   */
  const isValidPluginType = (type: any): type is PluginType => {
    const validTypes: PluginType[] = [null, "templater", "dataview"];
    return validTypes.includes(type as PluginType);
  };

  /**
   * Loads templates from localStorage and Supabase if user is authenticated
   */
  const loadTemplates = async (forceSupabaseSync = false) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Check localStorage for any saved templates first
      let localTemplatesLoaded = false;
      const savedTemplates = localStorage.getItem("templates");

      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);

        // Normalize all templates and modules to ensure type consistency
        templates.value = parsed.map((template: any) => ({
          ...template,
          modules: Array.isArray(template.modules)
            ? template.modules.map(normalizemodule)
            : [],
        }));

        localTemplatesLoaded = true;
      }

      // Check if user is authenticated to potentially load from Supabase
      const authStore = useAuthStore();
      if (authStore.isAuthenticated && authStore.userId) {
        try {
          // Import loadTemplatesFromSupabase dynamically to prevent circular dependency
          const { loadTemplatesFromSupabase } = await import(
            "@/services/supabase"
          );
          const { data: supabaseTemplates, error: supabaseError } =
            await loadTemplatesFromSupabase(authStore.userId);

          if (supabaseError) {
            console.error(
              "Error loading templates from Supabase:",
              supabaseError
            );

            // If local templates were loaded, just show a warning but continue
            if (localTemplatesLoaded) {
              console.warn(
                "Using local templates instead of Supabase templates due to error"
              );
              uiStore.showToast(
                "Using local templates - couldn't connect to cloud",
                "info"
              );
            } else {
              throw new Error("Failed to load templates from Supabase");
            }
          } else if (supabaseTemplates.length > 0 || forceSupabaseSync) {
            // If we got templates from Supabase or force sync is enabled, use them
            // If forceSupabaseSync is true, we prefer server templates even if empty

            // Merge local and remote templates by ID, preferring remote (newer) versions
            const mergedTemplates = new Map();

            // First add all local templates
            templates.value.forEach((template) => {
              // Only add local templates if they belong to this user
              if (template.userId === authStore.userId) {
                mergedTemplates.set(template.id, template);
              }
            });

            // Then add or overwrite with Supabase templates
            supabaseTemplates.forEach((template) => {
              mergedTemplates.set(template.id, template);
            });

            // Convert map back to array
            templates.value = Array.from(mergedTemplates.values());

            // Save the merged templates back to localStorage
            saveTemplates();

            console.log(
              `Loaded ${supabaseTemplates.length} templates from Supabase`
            );
          } else if (!localTemplatesLoaded) {
            // If we didn't get templates from Supabase and didn't have local templates
            templates.value = [];
          }
        } catch (err) {
          console.error(
            "Error importing or using loadTemplatesFromSupabase:",
            err
          );

          // If we don't have local templates, show an error
          if (!localTemplatesLoaded) {
            uiStore.showToast("Failed to load templates", "error");
            throw err;
          }
        }
      }

      return true;
    } catch (err) {
      error.value = "Failed to load templates";
      console.error("Error loading templates:", err);
      uiStore.showToast("Failed to load templates", "error");
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Loads a specific template by ID
   */
  const loadTemplate = (id: string) => {
    if (!id) {
      createNewTemplate();
      return null;
    }

    const template = templateById.value(id);
    if (template) {
      // Create a reactive copy that maintains reactivity
      // Properly copy nested objects to avoid breaking reactivity
      currentTemplate.value = {
        ...template,
        // Create fresh copies of arrays and objects to maintain reactivity
        modules: template.modules.map((module) => ({
          ...module,
          // Create a fresh copy of the content array
          content: [...module.content],
          // Create a fresh copy of metadata if it exists
          metadata: module.metadata ? { ...module.metadata } : undefined,
        })),
        tags: [...template.tags],
      };
      currentTemplateId.value = id;
      return true;
    }

    uiStore.showToast(`Template with ID ${id} not found`, "error");
    return false;
  };

  /**
   * Creates a new template with default content
   * Self-protective against duplicate creation
   */
  const createNewTemplate = () => {
    // If we already have a current template that hasn't been modified,
    // just return it instead of creating a new one
    if (
      currentTemplate.value && 
      currentTemplate.value.name === "Untitled Template" && 
      currentTemplate.value.modules.length <= 1 &&
      currentTemplate.value.modules[0]?.content?.join('') === "# Untitled Template"
    ) {
      // Return the ID of the existing fresh template
      return currentTemplate.value.id;
    }
    
    // Otherwise create a new template
    const newTemplate: Template = {
      id: uuidv4(),
      name: "Untitled Template",
      description: "",
      modules: [
        {
          id: uuidv4(),
          type: "header",
          content: ["# Untitled Template"],
          pluginType: null,
        },
      ],
      tags: [],
      lastModified: Date.now(),
      createdAt: Date.now(),
      isPublic: false,
      userId: "1", // Default user ID
    };

    currentTemplate.value = newTemplate;
    currentTemplateId.value = newTemplate.id;
    templates.value.push(newTemplate);
    saveTemplates();

    // Log activity
    activityStore.addActivity(
      "create",
      newTemplate.id,
      newTemplate.name,
      newTemplate.userId || "1"
    );

    return newTemplate.id;
  };

  /**
   * Creates a template with custom name and description
   */
  const createTemplate = (
    name: string = "New Template",
    description: string = ""
  ) => {
    const id = uuidv4();
    const now = Date.now();

    const newTemplate: Template = {
      id,
      name,
      description,
      modules: [],
      tags: [],
      lastModified: now,
      createdAt: now,
      isPublic: false,
      userId: "1", // Default user ID
    };

    templates.value.push(newTemplate);
    currentTemplate.value = newTemplate;
    currentTemplateId.value = id;
    saveTemplates();

    return id;
  };

  /**
   * Updates an existing template
   */
  const updateTemplate = (template: Template) => {
    const index = templates.value.findIndex((t) => t.id === template.id);

    if (index !== -1) {
      // Update timestamp
      template.lastModified = Date.now();

      // Normalize modules to ensure type consistency but do it in a reactive way
      const normalizedmodules = template.modules.map((module) =>
        normalizemodule(module)
      );

      // Update the template in the templates array
      templates.value[index] = {
        ...template,
        modules: normalizedmodules,
      };

      // Update current template if it's the same one
      if (currentTemplate.value?.id === template.id) {
        // Update properties individually to maintain proper reactivity
        // Instead of using Object.assign which can break reactivity with nested objects
        Object.keys(template).forEach((key) => {
          if (key === "modules") {
            if (!currentTemplate.value) return;
            // Create a deep reactive copy of modules
            currentTemplate.value.modules = normalizedmodules.map((module) => ({
              ...module,
              content: [...module.content],
              metadata: module.metadata ? { ...module.metadata } : undefined,
            }));
          } else if (key === "tags") {
            if (!currentTemplate.value) return;
            // Create a fresh copy of the tags array
            currentTemplate.value.tags = [...template.tags];
          } else {
            // For primitive values, direct assignment is fine
            // @ts-ignore - Dynamic property assignment
            currentTemplate.value[key] = template[key];
          }
        });
      }

      // Log activity - but only for significant updates
      // We don't want to log every single keystroke
      // The lastModified check helps avoid duplicate logging
      const lastUpdateTime = parseInt(
        localStorage.getItem(`last-update-log-${template.id}`) || "0"
      );
      if (Date.now() - lastUpdateTime > 60000) {
        // Only log once per minute
        activityStore.addActivity(
          "update",
          template.id,
          template.name,
          template.userId || "1"
        );
        localStorage.setItem(
          `last-update-log-${template.id}`,
          Date.now().toString()
        );
      }

      saveTemplates();
      return true;
    }

    return false;
  };

  /**
   * Updates the name of the current template
   */
  const updateTemplateName = (name: string) => {
    if (currentTemplate.value) {
      currentTemplate.value.name = name;
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  /**
   * Updates the description of the current template
   */
  const updateTemplateDescription = (description: string) => {
    if (currentTemplate.value) {
      currentTemplate.value.description = description;
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  /**
   * Deletes a template by ID
   */
  const deleteTemplate = (id: string) => {
    const index = templates.value.findIndex((t) => t.id === id);

    if (index !== -1) {
      const templateName = templates.value[index].name;
      const templateUserId = templates.value[index].userId || "1";

      templates.value.splice(index, 1);

      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null;
        currentTemplateId.value = "";
      }

      // Log activity
      activityStore.addActivity("delete", id, templateName, templateUserId);

      saveTemplates();

      // Sync deletion with Supabase if user is authenticated
      const authStore = useAuthStore();
      if (authStore.isAuthenticated && authStore.userId) {
        try {
          // Import deleteTemplateFromSupabase dynamically to prevent circular dependency
          import("@/services/supabase")
            .then(({ deleteTemplateFromSupabase }) => {
              // Make sure userId is a string (not null) before passing it
              const userId = authStore.userId;
              if (userId) {
                deleteTemplateFromSupabase(id, userId)
                  .then((result) => {
                    if (!result.success) {
                      console.error(
                        "Error deleting template from Supabase:",
                        result.error
                      );
                    }
                  })
                  .catch((err) => {
                    console.error(
                      "Exception deleting template from Supabase:",
                      err
                    );
                  });
              } else {
                console.error(
                  "User ID is null, cannot delete template from Supabase"
                );
              }
            })
            .catch((err) => {
              console.error("Error importing deleteTemplateFromSupabase:", err);
            });
        } catch (err) {
          // Don't let Supabase sync errors prevent local deletion
          console.error(
            "Error synchronizing template deletion with Supabase:",
            err
          );
        }
      }

      return true;
    }

    return false;
  };

  /**
   * Duplicates a template
   */
  const duplicateTemplate = async (id: string) => {
    const template = templateById.value(id);

    if (template) {
      // Create a reactive copy without using JSON.parse/stringify
      const newTemplate: Template = {
        // Use shallow spread for the main template properties
        ...template,
        id: uuidv4(),
        name: `${template.name} (Copy)`,
        lastModified: Date.now(),
        createdAt: Date.now(),
      };

      // Create a deep copy of modules while maintaining reactivity
      newTemplate.modules = template.modules.map((module) => ({
        ...module, // Copy all properties of the module
        id: uuidv4(), // Assign new ID
        // Create a fresh copy of the content array to maintain reactivity
        content: module.content ? [...module.content] : [],
        // Create a fresh copy of metadata if it exists
        metadata: module.metadata ? { ...module.metadata } : undefined,
      }));

      templates.value.push(newTemplate);

      // Log activity
      activityStore.addActivity(
        "duplicate",
        newTemplate.id,
        newTemplate.name,
        newTemplate.userId || "1"
      );

      saveTemplates();

      return newTemplate.id;
    }

    throw new Error("Template not found");
  };

  /**
   * Saves templates to localStorage
   */
  const saveTemplates = () => {
    try {
      localStorage.setItem("templates", JSON.stringify(templates.value));
    } catch (error) {
      console.error("Failed to save templates:", error);
      uiStore.showToast("Failed to save templates", "error");
    }
  };

  /**
   * Clears all templates
   */
  const clearAllTemplates = () => {
    templates.value = [];
    currentTemplate.value = null;
    currentTemplateId.value = "";
    saveTemplates();
  };

  /**
   * Adds a module to the current template
   */
  const addModule = (module: Partial<TemplateModule>) => {
    // If no current template, create one
    if (!currentTemplate.value && currentTemplateId.value === "") {
      createTemplate();
    }

    if (currentTemplate.value) {
      // Normalize module to ensure type consistency
      const normalizedmodule = normalizemodule(module);

      // Add module to the template
      currentTemplate.value.modules.push(normalizedmodule);
      currentTemplate.value.lastModified = Date.now();
      updateTemplate(currentTemplate.value);
    }
  };

  /**
   * Updates a module in the current template
   */
  const updateModule = (
    moduleId: string,
    updatedmodule: Partial<TemplateModule>
  ) => {
    if (currentTemplate.value) {
      const index = currentTemplate.value.modules.findIndex(
        (s) => s.id === moduleId
      );
      if (index !== -1) {
        // Merge the existing module with the updates
        const mergedmodule = {
          ...currentTemplate.value.modules[index],
          ...updatedmodule,
          // Special handling for content to ensure it's always an array
          content: updatedmodule.content
            ? Array.isArray(updatedmodule.content)
              ? updatedmodule.content
              : [updatedmodule.content as unknown as string]
            : currentTemplate.value.modules[index].content,
        };

        // Normalize to ensure type consistency
        currentTemplate.value.modules[index] = normalizemodule(mergedmodule);
        currentTemplate.value.lastModified = Date.now();
        updateTemplate(currentTemplate.value);
      }
    }
  };

  /**
   * Deletes a module from the current template
   */
  const deleteModule = (moduleId: string) => {
    if (currentTemplate.value) {
      const index = currentTemplate.value.modules.findIndex(
        (s) => s.id === moduleId
      );
      if (index !== -1) {
        currentTemplate.value.modules.splice(index, 1);
        currentTemplate.value.lastModified = Date.now();
        updateTemplate(currentTemplate.value);
      }
    }
  };

  /**
   * Updates all modules in the current template
   */
  const updateModules = (newmodules: Partial<TemplateModule>[]) => {
    if (currentTemplate.value) {
      // Create normalized modules with proper reactivity
      const normalizedmodules = newmodules.map((module) => {
        const normalized = normalizemodule(module);
        // Ensure content array is properly copied for reactivity
        return {
          ...normalized,
          content: [...normalized.content],
          metadata: normalized.metadata
            ? { ...normalized.metadata }
            : undefined,
        };
      });

      // Update the modules array with the normalized modules
      currentTemplate.value.modules = normalizedmodules;
      currentTemplate.value.lastModified = Date.now();

      // Update the template in the templates array
      const index = templates.value.findIndex(
        (t) => t.id === currentTemplate.value?.id
      );
      if (index !== -1) {
        // Create a reactive copy of the current template
        templates.value[index] = {
          ...currentTemplate.value,
          // Ensure modules array is properly copied
          modules: normalizedmodules.map((module) => ({
            ...module,
            content: [...module.content],
            metadata: module.metadata ? { ...module.metadata } : undefined,
          })),
        };
        saveTemplates();
      }
    }
  };

  /**
   * Saves the current template
   */
  const saveCurrentTemplate = async () => {
    try {
      if (!currentTemplate.value) {
        // No template loaded, create a new one if there are modules
        if (currentModules.value.length > 0) {
          const id = createTemplate();
          return id;
        }
        throw new Error("No template to save");
      }

      // Update timestamp
      currentTemplate.value.lastModified = Date.now();

      // Return early if the update fails
      if (!updateTemplate(currentTemplate.value)) {
        throw new Error("Failed to update template");
      }

      // Sync with Supabase if user is authenticated
      const authStore = useAuthStore();
      if (
        authStore.isAuthenticated &&
        authStore.userId &&
        currentTemplate.value
      ) {
        try {
          // Import here to avoid circular dependency
          const { syncTemplateWithSupabase } = await import(
            "@/services/supabase"
          );

          // Use a non-blocking promise
          syncTemplateWithSupabase(currentTemplate.value, authStore.userId)
            .then((result) => {
              if (!result.success) {
                console.error(
                  "Error syncing template with Supabase:",
                  result.error
                );
              }
            })
            .catch((err) => {
              console.error("Exception syncing template with Supabase:", err);
            });
        } catch (err) {
          // Don't let Supabase sync errors prevent local save
          console.error(
            "Error importing or calling syncTemplateWithSupabase:",
            err
          );
        }
      }

      return currentTemplate.value.id;
    } catch (error) {
      console.error("Error in saveCurrentTemplate:", error);
      throw error; // Re-throw for proper error handling upstream
    }
  };

  // Initialize by loading templates
  loadTemplates();

  return {
    // State
    templates,
    currentTemplate,
    currentTemplateId,
    isLoading,
    error,

    // Getters
    templateById,
    currentModules,

    // Actions
    loadTemplates,
    loadTemplate,
    createNewTemplate,
    createTemplate,
    updateTemplate,
    updateTemplateName,
    updateTemplateDescription,
    deleteTemplate,
    duplicateTemplate,
    saveTemplates,
    clearAllTemplates,

    // Module manipulation
    addModule,
    updateModule,
    deleteModule,
    updateModules,
    saveCurrentTemplate,
  };
});

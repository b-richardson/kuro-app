import { defineStore } from "pinia";
import { ref, computed, onUnmounted } from "vue";
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
  userId: string;
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
  const hasUnsavedChanges = ref(false);
  const lastSavedAt = ref<number>(0);

  // Auto-save settings
  const autoSaveEnabled = ref(true);
  const autoSaveInterval = ref(60000); // 60 seconds
  let autoSaveTimer: number | null = null;

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
      // Frontmatter Module
      "frontmatter",
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
   * Schedules an auto-save operation
   */
  const scheduleAutoSave = () => {
    // Clear any existing timer
    if (autoSaveTimer !== null) {
      window.clearTimeout(autoSaveTimer);
    }

    if (autoSaveEnabled.value && hasUnsavedChanges.value) {
      autoSaveTimer = window.setTimeout(async () => {
        await syncCurrentTemplateToSupabase();
      }, autoSaveInterval.value);
    }
  };

  /**
   * Syncs the current template to Supabase
   * This is the single point of truth for Supabase persistence
   */
  const syncCurrentTemplateToSupabase = async () => {
    if (!currentTemplate.value || !hasUnsavedChanges.value) return;

    const authStore = useAuthStore();
    if (!authStore.isAuthenticated || !authStore.userId) return;

    try {
      const { syncTemplateWithSupabase } = await import("@/services/supabase");
      await syncTemplateWithSupabase(currentTemplate.value, authStore.userId);

      // Mark as saved
      hasUnsavedChanges.value = false;
      lastSavedAt.value = Date.now();
    } catch (err) {
      console.error("Error syncing template to Supabase:", err);
      uiStore.showToast("Failed to save template to cloud", "error");
      throw err;
    }
  };

  /**
   * Loads templates from Supabase for authenticated users
   */
  const loadTemplates = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.userId) {
        templates.value = [];
        return true;
      }

      // Load templates from Supabase
      const { loadTemplatesFromSupabase } = await import("@/services/supabase");
      const { data: supabaseTemplates, error: supabaseError } =
        await loadTemplatesFromSupabase(authStore.userId);

      if (supabaseError) {
        console.error("Error loading templates from Supabase:", supabaseError);
        throw new Error("Failed to load templates from Supabase");
      }

      // Update state with templates from Supabase
      templates.value = supabaseTemplates.map((template: any) => ({
        ...template,
        modules: Array.isArray(template.modules)
          ? template.modules.map(normalizemodule)
          : [],
      }));

      console.log(`Loaded ${supabaseTemplates.length} templates from Supabase`);
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
      hasUnsavedChanges.value = false;
      return true;
    }

    uiStore.showToast(`Template with ID ${id} not found`, "error");
    return false;
  };

  /**
   * Creates a new template with default content
   * Self-protective against duplicate creation
   */
  const createNewTemplate = async () => {
    // If we already have a current template that hasn't been modified,
    // just return it instead of creating a new one
    if (
      currentTemplate.value &&
      currentTemplate.value.name === "Untitled Template" &&
      currentTemplate.value.modules.length <= 1 &&
      currentTemplate.value.modules[0]?.content?.join("") ===
        "# Untitled Template"
    ) {
      // Return the ID of the existing fresh template
      return currentTemplate.value.id;
    }

    const authStore = useAuthStore();
    const userId = authStore.userId;
    if (!userId) {
      throw new Error("Cannot create template without authentication");
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
      userId: userId,
    };

    // Update local state
    currentTemplate.value = newTemplate;
    currentTemplateId.value = newTemplate.id;
    templates.value.push(newTemplate);

    // Mark as having unsaved changes
    hasUnsavedChanges.value = true;

    // Sync to Supabase immediately for new templates
    await syncCurrentTemplateToSupabase();

    // Log activity
    activityStore.addActivity(
      "create",
      newTemplate.id,
      newTemplate.name,
      newTemplate.userId
    );

    return newTemplate.id;
  };

  /**
   * Creates a template with custom name and description
   */
  const createTemplate = async (
    name: string = "New Template",
    description: string = ""
  ) => {
    const authStore = useAuthStore();
    const userId = authStore.userId;
    if (!userId) {
      throw new Error("Cannot create template without authentication");
    }

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
      userId: userId,
    };

    // Update local state
    templates.value.push(newTemplate);
    currentTemplate.value = newTemplate;
    currentTemplateId.value = id;

    // Mark as having unsaved changes
    hasUnsavedChanges.value = true;

    // Sync to Supabase immediately for new templates
    await syncCurrentTemplateToSupabase();

    return id;
  };

  /**
   * Updates an existing template
   * Only updates state, doesn't sync to Supabase
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
      // Use a timer-based approach instead of localStorage
      const lastUpdateTime = parseInt(
        sessionStorage.getItem(`last-update-log-${template.id}`) || "0"
      );
      if (Date.now() - lastUpdateTime > 60000) {
        // Only log once per minute
        activityStore.addActivity(
          "update",
          template.id,
          template.name,
          template.userId
        );
        sessionStorage.setItem(
          `last-update-log-${template.id}`,
          Date.now().toString()
        );
      }

      // Mark as having unsaved changes and schedule auto-save
      hasUnsavedChanges.value = true;
      scheduleAutoSave();

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
  const deleteTemplate = async (id: string) => {
    const index = templates.value.findIndex((t) => t.id === id);

    if (index !== -1) {
      const templateName = templates.value[index].name;
      const templateUserId = templates.value[index].userId;

      // Remove from local state
      templates.value.splice(index, 1);

      if (currentTemplate.value?.id === id) {
        currentTemplate.value = null;
        currentTemplateId.value = "";
        hasUnsavedChanges.value = false;
      }

      // Log activity
      activityStore.addActivity("delete", id, templateName, templateUserId);

      // Delete from Supabase (deletion should be immediate)
      const authStore = useAuthStore();
      if (authStore.isAuthenticated && authStore.userId) {
        try {
          const { deleteTemplateFromSupabase } = await import(
            "@/services/supabase"
          );
          const userId = authStore.userId;
          if (userId) {
            const result = await deleteTemplateFromSupabase(id, userId);
            if (!result.success) {
              console.error(
                "Error deleting template from Supabase:",
                result.error
              );
              uiStore.showToast(
                "Failed to delete template from cloud",
                "error"
              );
            }
          }
        } catch (err) {
          console.error("Error deleting template from Supabase:", err);
          uiStore.showToast("Failed to delete template from cloud", "error");
        }
      }

      return true;
    }

    return false;
  };

  /**
   * Duplicates a template
   * Ensures frontmatter module stays at the top
   */
  const duplicateTemplate = async (id: string) => {
    const template = templateById.value(id);

    if (template) {
      const authStore = useAuthStore();
      const userId = authStore.userId;
      if (!userId) {
        throw new Error("Cannot duplicate template without authentication");
      }

      // Create a reactive copy without using JSON.parse/stringify
      const newTemplate: Template = {
        // Use shallow spread for the main template properties
        ...template,
        id: uuidv4(),
        name: `${template.name} (Copy)`,
        lastModified: Date.now(),
        createdAt: Date.now(),
        userId: userId,
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

      // Ensure frontmatter module stays at the top
      if (newTemplate.modules.some((m) => m.type === "frontmatter")) {
        // Sort modules to ensure frontmatter is at the top
        newTemplate.modules.sort((a, b) => {
          if (a.type === "frontmatter") return -1;
          if (b.type === "frontmatter") return 1;
          return 0;
        });
      }

      // Update local state
      templates.value.push(newTemplate);

      // Log activity
      activityStore.addActivity(
        "duplicate",
        newTemplate.id,
        newTemplate.name,
        newTemplate.userId
      );

      // Mark as having unsaved changes
      hasUnsavedChanges.value = true;

      // Sync to Supabase immediately for new templates
      await syncCurrentTemplateToSupabase();

      return newTemplate.id;
    }

    throw new Error("Template not found");
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
   * Ensures frontmatter module remains at the top
   */
  const updateModules = (newModules: Partial<TemplateModule>[]) => {
    if (currentTemplate.value) {
      // Create normalized modules with proper reactivity
      const normalizedModules = newModules.map((module) => {
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

      // Special handling to ensure frontmatter module stays at the top
      const frontmatterIndex = normalizedModules.findIndex(
        (m) => m.type === "frontmatter"
      );

      // If frontmatter exists and is not at the top, move it to the top
      if (frontmatterIndex > 0) {
        // Remove frontmatter from its current position
        const frontmatterModule = normalizedModules.splice(
          frontmatterIndex,
          1
        )[0];
        // Insert it at the beginning
        normalizedModules.unshift(frontmatterModule);
      }

      // Update the modules array with the normalized modules
      currentTemplate.value.modules = normalizedModules;
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
          modules: normalizedModules.map((module) => ({
            ...module,
            content: [...module.content],
            metadata: module.metadata ? { ...module.metadata } : undefined,
          })),
        };

        // Mark as having unsaved changes and schedule auto-save
        hasUnsavedChanges.value = true;
        scheduleAutoSave();
      }
    }
  };

  /**
   * Saves the current template to Supabase manually
   * This is called on explicit user action (save button)
   */
  const saveCurrentTemplate = async () => {
    try {
      if (!currentTemplate.value) {
        // No template loaded, create a new one if there are modules
        if (currentModules.value.length > 0) {
          const id = await createTemplate();
          return id;
        }
        throw new Error("No template to save");
      }

      // Update timestamp
      currentTemplate.value.lastModified = Date.now();

      // Mark as needing save
      hasUnsavedChanges.value = true;

      // Sync to Supabase
      await syncCurrentTemplateToSupabase();

      return currentTemplate.value.id;
    } catch (error) {
      console.error("Error in saveCurrentTemplate:", error);
      throw error; // Re-throw for proper error handling upstream
    }
  };

  /**
   * Cleanup function to clear auto-save timer
   */
  const cleanup = () => {
    if (autoSaveTimer !== null) {
      window.clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
  };

  // Initialize by loading templates
  loadTemplates();

  // Cleanup on store disposal
  onUnmounted(() => {
    cleanup();
  });

  return {
    // State
    templates,
    currentTemplate,
    currentTemplateId,
    isLoading,
    error,
    hasUnsavedChanges,
    lastSavedAt,
    autoSaveEnabled,
    autoSaveInterval,

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

    // Module manipulation
    addModule,
    updateModule,
    deleteModule,
    updateModules,

    // Saving
    saveCurrentTemplate,
    syncCurrentTemplateToSupabase,
  };
});

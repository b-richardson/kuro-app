import { supabase } from "./index";
import { encryptData, decryptData } from "@/utils/encryptionUtils";
import type { Template } from "@/stores/template";

/** Save Obsidian Integration to Supabase */
export async function saveObsidianIntegration(
  userId: string,
  apiKey: string,
  port: string
) {
  console.log("saveObsidianIntegration called with userId:", userId);

  try {
    const encryptedKey = await encryptData(apiKey, userId);
    const encryptedPort = await encryptData(port, userId);

    console.log("Data encrypted successfully");

    // Add onConflict parameter to specify how to handle conflicts
    const result = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        encrypted_obsidian_api_key: encryptedKey,
        encrypted_obsidian_port: encryptedPort,
      },
      { onConflict: "user_id" } // Specify which column to check for conflicts
    );

    console.log("Supabase result:", result);

    return result;
  } catch (error) {
    console.error("Error in saveObsidianIntegration:", error);
    return { error };
  }
}

/** Retrieve Obsidian Integration from Supabase */
export async function getObsidianIntegration(userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("encrypted_obsidian_api_key, encrypted_obsidian_port")
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error };

  const decryptedKey = await decryptData(
    data.encrypted_obsidian_api_key,
    userId
  );

  const decryptedPort = await decryptData(data.encrypted_obsidian_port, userId);

  return {
    data: {
      obsidian_api_key: decryptedKey,
      obsidian_port: decryptedPort,
    },
    error: null,
  };
}

/** Delete Obsidian Integration from Supabase */
export async function deleteObsidianIntegration(userId: string) {
  const { error } = await supabase
    .from("user_settings")
    .delete()
    .eq("user_id", userId);
  return { success: !error, error };
}

/**
 * Sync template with Supabase
 * This function handles adding or updating a template in Supabase
 */
export async function syncTemplateWithSupabase(
  template: Template,
  userId: string
) {
  if (!userId) {
    console.warn("Cannot sync template without userId");
    return { success: false, error: "No userId provided" };
  }

  try {
    // Save the template itself
    const { data: templateData, error: templateError } = await supabase
      .from("templates")
      .upsert(
        {
          id: template.id,
          user_id: userId,
          name: template.name,
          description: template.description,
          created_at: new Date(template.createdAt).toISOString(),
          last_modified: new Date(template.lastModified).toISOString(),
          is_public: template.isPublic,
        },
        { onConflict: "id" }
      )
      .select("id");

    if (templateError) {
      console.error("Error syncing template:", templateError);
      return { success: false, error: templateError };
    }

    // Delete existing modules for this template
    const { error: deleteError } = await supabase
      .from("template_modules")
      .delete()
      .eq("template_id", template.id);

    if (deleteError) {
      console.error("Error removing existing modules:", deleteError);
      return { success: false, error: deleteError };
    }

    // Insert updated modules
    const moduleInserts = template.modules.map((module, index) => ({
      id: module.id,
      template_id: template.id,
      type: module.type,
      plugin_type: module.pluginType,
      content: module.content,
      metadata: module.metadata || null,
      order: index,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    }));

    const { error: modulesError } = await supabase
      .from("template_modules")
      .upsert(moduleInserts);

    if (modulesError) {
      console.error("Error syncing modules:", modulesError);
      return { success: false, error: modulesError };
    }

    return { success: true, data: templateData };
  } catch (error) {
    console.error("Error in syncTemplateWithSupabase:", error);
    return { success: false, error };
  }
}

/**
 * Load all templates for a user from Supabase
 */
export async function loadTemplatesFromSupabase(userId: string) {
  if (!userId) {
    return { data: [], error: "No userId provided" };
  }

  try {
    // Fetch templates for the user
    const { data: templateData, error: templateError } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", userId);

    if (templateError) {
      return { data: [], error: templateError };
    }

    const templates: Template[] = [];

    for (const template of templateData) {
      // Fetch associated modules
      const { data: moduleData, error: moduleError } = await supabase
        .from("template_modules")
        .select("*")
        .eq("template_id", template.id)
        .order("order", { ascending: true });

      if (moduleError) {
        console.error(
          `Error fetching modules for template ${template.id}:`,
          moduleError
        );
        continue;
      }

      // Format into our Template shape
      const formattedTemplate: Template = {
        id: template.id,
        name: template.name,
        description: template.description || "",
        modules: moduleData.map((module) => ({
          id: module.id,
          type: module.type as any,
          content: Array.isArray(module.content) ? module.content : [],
          pluginType: module.plugin_type as any,
          metadata: module.metadata || undefined,
        })),
        tags: [], // Tags support removed
        lastModified: new Date(template.last_modified).getTime(),
        createdAt: new Date(template.created_at).getTime(),
        isPublic: template.is_public || false,
        userId: template.user_id,
      };

      templates.push(formattedTemplate);
    }

    return { data: templates, error: null };
  } catch (error) {
    console.error("Error in loadTemplatesFromSupabase:", error);
    return { data: [], error };
  }
}

/**
 * Delete a template and all its related data from Supabase
 */
export async function deleteTemplateFromSupabase(
  templateId: string,
  userId: string
) {
  if (!userId || !templateId) {
    return { success: false, error: "Missing templateId or userId" };
  }

  try {
    // Delete template (cascading foreign key constraints should handle modules and tags)
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", templateId)
      .eq("user_id", userId); // Ensure user owns this template

    if (error) {
      console.error("Error deleting template:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteTemplateFromSupabase:", error);
    return { success: false, error };
  }
}

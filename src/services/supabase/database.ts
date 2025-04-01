import { supabase } from "./client";
import { encryptData, decryptData } from "@/utils/encryptionUtils";

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

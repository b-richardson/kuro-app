// src/utils/obsidianUtils.ts
import { useObsidianStore } from "@/stores/obsidian";
import { useAuthStore } from "@/stores/auth";
import { getObsidianIntegration } from "@/services/supabase"; // Make sure this path is correct

/**
 * Restores Obsidian connection using credentials from Supabase
 * Call this function after user authentication
 */
export async function restoreObsidianConnection(): Promise<boolean> {
  const authStore = useAuthStore();
  const obsidianStore = useObsidianStore();

  // Skip if already connected or integration was explicitly skipped
  if (obsidianStore.isConnected || obsidianStore.integrationSkipped) {
    return obsidianStore.isConnected;
  }

  // Only try to restore if the user is authenticated
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    return false;
  }

  try {
    // Get the encrypted credentials from Supabase
    const { data, error } = await getObsidianIntegration(authStore.user.id);

    // If there's an error or no data, we can't restore
    if (error || !data) {
      console.log("No saved Obsidian integration found");
      return false;
    }

    // Attempt to connect with the retrieved credentials
    await obsidianStore.connectToVault(
      data.obsidian_api_key,
      data.obsidian_port
    );

    // If we get here, connection was successful
    return true;
  } catch (error) {
    console.error("Failed to restore Obsidian connection:", error);
    return false;
  }
}

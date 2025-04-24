import { useAuthStore } from "@/stores/auth";
import { useObsidianStore } from "@/stores/obsidian";
import { getObsidianIntegration } from "@/services/supabase/database";

// export async function fetchUserSettings(): Promise<void> {
//   const authStore = useAuthStore();
//   const obsidianStore = useObsidianStore();

//   if (!authStore.isAuthenticated || !authStore.user?.id) return;

//   const { data, error } = await getObsidianIntegration(authStore.user.id);

//   if (error || !data) {
//     console.warn("Could not fetch Obsidian integration:", error);
//     return;
//   }

//   await obsidianStore.connectToVault(data.obsidian_api_key, data.obsidian_port);
// }

export async function fetchUserSettings(): Promise<void> {
  const authStore = useAuthStore();
  const obsidianStore = useObsidianStore();

  console.log("Auth initialized:", authStore.initialized);
  console.log("Authenticated:", authStore.isAuthenticated);
  console.log("User ID:", authStore.user?.id);

  if (!authStore.isAuthenticated || !authStore.user?.id) {
    console.warn("Skipping Obsidian fetch — not authenticated.");
    return;
  }

  const { data, error } = await getObsidianIntegration(authStore.user.id);

  if (error || !data) {
    console.warn("Could not fetch Obsidian integration:", error || "No data");
    return;
  }

  console.log("Fetched Obsidian integration:", data);

  await obsidianStore.connectToVault(data.obsidian_api_key, data.obsidian_port);
}

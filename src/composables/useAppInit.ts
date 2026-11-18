import { useAuthStore } from "@/stores/auth";
import { fetchUserSettings } from "@/utils/userSettingsUtils";

let hasInitialized = false;

// export async function useAppInit() {
//   if (hasInitialized) return;
//   hasInitialized = true;

//   const authStore = useAuthStore();

//   if (!authStore.initialized) {
//     await authStore.initialize();
//   }

//   if (authStore.isAuthenticated) {
//     await fetchUserSettings();
//   }

//   // Future:
//   // await initFeatureFlags();
//   // await trackSessionStart();
// }

export async function useAppInit() {
  if (hasInitialized) return;
  hasInitialized = true;

  const authStore = useAuthStore();
  console.log("[AppInit] Running...");

  if (!authStore.initialized) {
    console.log("[AppInit] Waiting on authStore.initialize...");
    await authStore.initialize();
    console.log("[AppInit] Auth initialized.");
  }

  console.log("[AppInit] Authenticated:", authStore.isAuthenticated);
  console.log("[AppInit] User ID:", authStore.user?.id);

  if (authStore.isAuthenticated) {
    await fetchUserSettings();
  }
}

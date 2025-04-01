import { useAuthStore } from "@/stores/auth";

let initializationPromise: Promise<boolean> | null = null;

/**
 * Initialize the auth store if it hasn't been initialized yet
 * This ensures we only initialize once, even if called from multiple places
 */
export const initializeAuth = async (): Promise<boolean> => {
  const authStore = useAuthStore();

  // If already initialized, return immediately
  if (authStore.initialized) {
    return true;
  }

  // If initialization is in progress, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Otherwise, initialize the auth store
  console.log("Initializing auth store...");
  initializationPromise = authStore.initialize();

  try {
    const result = await initializationPromise;
    console.log("Auth store initialized:", {
      isAuthenticated: authStore.isAuthenticated,
      userId: authStore.userId,
      hasSession: !!authStore.session,
    });
    return result;
  } catch (error) {
    console.error("Failed to initialize auth store:", error);
    return false;
  } finally {
    initializationPromise = null;
  }
};

/**
 * Ensure authentication is initialized and user is logged in
 * Returns whether user is authenticated
 */
export const ensureAuth = async (): Promise<boolean> => {
  await initializeAuth();
  const authStore = useAuthStore();
  return authStore.isAuthenticated;
};

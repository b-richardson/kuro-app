// stores/userStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userProfilesService } from "@/services/supabase/userProfiles";
import { subscriptionService } from "@/services/supabase/subscriptions";
import { useAuthStore } from "./auth";
import type { UserProfile, PlanId } from "@/services/supabase/types";

export const useUserStore = defineStore("user", () => {
  // State
  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const isSubscribed = computed(() => {
    // Check both status AND plan type
    return (
      profile.value?.subscription_status === "active" &&
      profile.value?.subscription_plan?.startsWith("pro")
    );
  });

  const subscriptionPlan = computed(() => {
    return (profile.value?.subscription_plan as PlanId) || "free";
  });

  const canAccessFeature = computed(() => {
    return (featureId: string): boolean => {
      return subscriptionService.canAccessFeature(
        subscriptionPlan.value,
        featureId
      );
    };
  });

  // Actions
  const fetchUserProfile = async () => {
    const authStore = useAuthStore();
    if (!authStore.user) return;

    loading.value = true;
    try {
      const userProfile = await userProfilesService.getUserProfile(
        authStore.user.id
      );
      profile.value = userProfile;
    } catch (err) {
      error.value = err as Error;
      console.error("Error fetching user profile:", err);
    } finally {
      loading.value = false;
    }
  };

  const clearUserProfile = () => {
    profile.value = null;
    error.value = null;
  };

  return {
    // State
    profile,
    loading,
    error,

    // Getters
    isSubscribed,
    subscriptionPlan,
    canAccessFeature,

    // Actions
    fetchUserProfile,
    clearUserProfile,
  };
});

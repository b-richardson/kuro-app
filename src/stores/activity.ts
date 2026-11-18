import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Activity {
  id: string;
  type: "create" | "update" | "export" | "duplicate" | "delete";
  templateId: string;
  templateName: string;
  timestamp: number;
  userId: string;
}

export const useActivityStore = defineStore("activity", () => {
  // State
  const activities = ref<Activity[]>([]);
  const isLoading = ref(false);

  // Generate a unique ID for activities
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Add a new activity
  const addActivity = (
    type: Activity["type"],
    templateId: string,
    templateName: string,
    userId: string
  ) => {
    const newActivity: Activity = {
      id: generateId(),
      type,
      templateId,
      templateName,
      timestamp: Date.now(),
      userId,
    };

    activities.value.unshift(newActivity); // Add to beginning of array
    saveActivities();

    // Limit to last 100 activities
    if (activities.value.length > 100) {
      activities.value = activities.value.slice(0, 100);
      saveActivities();
    }

    return newActivity;
  };

  // Get activities for a specific user
  const getUserActivities = computed(() => {
    return (userId: string) =>
      activities.value.filter((activity) => activity.userId === userId);
  });

  // Get activities for a specific template
  const getTemplateActivities = computed(() => {
    return (templateId: string) =>
      activities.value.filter((activity) => activity.templateId === templateId);
  });

  // Load activities from localStorage
  const loadActivities = () => {
    isLoading.value = true;
    try {
      const savedActivities = localStorage.getItem("activities");
      if (savedActivities) {
        activities.value = JSON.parse(savedActivities);
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Save activities to localStorage
  const saveActivities = () => {
    try {
      localStorage.setItem("activities", JSON.stringify(activities.value));
    } catch (error) {
      console.error("Failed to save activities:", error);
    }
  };

  // Clear all activities
  const clearActivities = () => {
    activities.value = [];
    saveActivities();
  };

  // Initialize by loading activities
  loadActivities();

  // Add some mock activity data if none exists
  if (activities.value.length === 0) {
    // Add mock activities for development
    const now = Date.now();

    saveActivities();
  }

  return {
    activities,
    isLoading,
    addActivity,
    getUserActivities,
    getTemplateActivities,
    loadActivities,
    saveActivities,
    clearActivities,
  };
});

import { supabase } from "./index";
import type { UserSettings } from "./types";

export const userSettingsService = {
  /**
   * Fetch user settings by user ID
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }

    return data;
  },

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      return null;
    }

    return data;
  },
};

export default userSettingsService;

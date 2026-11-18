// services/supabase/userProfiles.ts
import { supabase } from "./index";
import type { UserProfile } from "./types";

export const userProfilesService = {
  /**
   * Fetch a user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  },

  /**
   * Update last login time for a user
   */
  async updateLastLogin(userId: string): Promise<void> {
    const { error } = await supabase
      .from("user_profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating last login:", error);
    }
  },
};

export default userProfilesService;

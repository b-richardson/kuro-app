import { supabase } from "./index";

interface WaitlistEntry {
  email: string;
  name?: string;
}

/**
 * Adds a user to the waitlist table in Supabase
 */
export const addToWaitlist = async ({ email, name }: WaitlistEntry) => {
  const { data, error } = await supabase.from("waitlist").insert([
    {
      email,
      name,
      status: "waitlisted", // optional since it's the default, but explicit is nice
    },
  ]);

  if (error) {
    // You can log this or transform into a user-friendly message
    throw new Error(error.message);
  }

  return data;
};

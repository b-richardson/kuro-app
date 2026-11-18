import { resetPassword } from "./../services/supabase/auth";
// composables/useAuthForm.ts
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

export function useAuthForm() {
  const email = ref("");
  const password = ref("");

  const auth = useAuthStore();

  const login = async () => {
    return await auth.login(email.value, password.value);
  };

  const register = async () => {
    return await auth.register(email.value, password.value);
  };

  const resetPassword = async () => {
    return await auth.resetPassword(email.value);
  };

  return {
    email,
    password,
    login,
    register,
    resetPassword,
    auth, // gives you isLoading, error, isAuthenticated
  };
}

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  const code = route.query.code as string | undefined;

  if (code) {
    const success = await auth.handleMagicLinkOrPasswordRecovery(code);
    if (success) {
      router.replace("/dashboard"); // or whatever default post-login route you want
    } else {
      // Redirect to login with error state, or show a toast / modal
      router.replace({ name: "login", query: { error: "invalid-magic-link" } });
    }
  } else {
    router.replace("/login");
  }
});
</script>

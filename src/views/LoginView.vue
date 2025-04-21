<template>
  <div class="auth-page">
    <div class="container auth-container">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import LoginForm from "@/components/auth/LoginForm.vue";
import ResetForm from "@/components/auth/ResetForm.vue";
import EmailSent from "@/components/auth/EmailSent.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";

const route = useRoute();

const formType = computed(() => route.query.type || "login");

const currentComponent = computed(() => {
  switch (formType.value) {
    case "register":
      return RegisterForm;
    case "reset-password":
      return ResetForm;
    case "email-sent":
      return EmailSent;
    default:
      return LoginForm;
  }
});
</script>

<style scoped>
.auth-page {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: 6rem 0;
  display: flex;
  align-items: center;
}
.auth-container {
  max-width: 80%;
  height: 70vh;
}
</style>

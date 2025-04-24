<template>
  <div class="app theme-dark">
    <GradientBackground />

    <GlobalSidebar v-if="isSidebarVisible" />

    <main class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAppInit } from "@/composables/useAppInit";

import GradientBackground from "@/components/UI/GradientBackground.vue";
import GlobalSidebar from "@/components/Layout/GlobalSidebar.vue";

// Stores & router
const authStore = useAuthStore();
const router = useRouter();

// Sidebar visibility based on route meta
const isSidebarVisible = computed(() => {
  const route = router.currentRoute.value;
  return authStore.isAuthenticated && route.meta?.hideSidebar !== true;
});

// App boot logic after mount
onMounted(async () => {
  await useAppInit();
});
</script>

<style>
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.theme-dark {
  --color-bg: #1e1e2e;
  --color-text: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.75);
  --color-text-tertiary: rgba(255, 255, 255, 0.5);
}

.theme-light {
  --color-bg: #f8f9fa;
  --color-text: #333;
  --color-text-secondary: #555;
  --color-text-tertiary: #777;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

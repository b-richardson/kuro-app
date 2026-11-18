import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Public views
import EarlyAccessLandingPage from "@/views/EarlyAccessLandingPage.vue";

// Routes definition
const routes: RouteRecordRaw[] = [
  // Public Route (Early Access Landing Page Only)
  {
    path: "/early-access",
    name: "early-access",
    component: EarlyAccessLandingPage,
    meta: { requiresAuth: false, hideSidebar: true },
  },

  // Catch-all route → redirect to early-access
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "early-access" },
    meta: { hideSidebar: true },
  },
];

// Router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_, __, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initialize();
  }

  next();
});

export default router;

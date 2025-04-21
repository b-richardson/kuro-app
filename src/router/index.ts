import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Public views
import LandingPage from "@/views/LandingPage.vue";
import KuroLandingPage from "@/views/KuroLandingPage.vue";
import LoginView from "@/views/LoginView.vue";
import PricingPageView from "@/views/PricingPageView.vue";
import SubscriptionSuccessView from "@/views/SubscriptionSuccessView.vue";
import SubscriptionCancelView from "@/views/SubscriptionCancelView.vue";
import SubscribePageView from "@/views/SubscribePageView.vue";
import MagicLinkHandler from "@/views/MagicLinkView.vue";
import EarlyAccessLandingPage from "@/views/EarlyAccessLandingPage.vue";

// Authenticated views
import DashboardView from "@/views/DashboardView.vue";
import MyTemplatesView from "@/views/MyTemplatesView.vue";
import EditorView from "@/views/EditorView.vue";
import SettingsView from "@/views/SettingsView.vue";
import ObsidianOnboarding from "@/views/ObsidianOnboarding.vue";
import ObsidianExplorer from "@/views/ObsidianExplorer.vue";
import TemplateBrowserView from "@/views/TemplateBrowserView.vue";

// Optional non-auth utility
import DesignView from "@/views/DesignView.vue";

// Routes definition
const routes: RouteRecordRaw[] = [
  // Public Routes
  {
    path: "/",
    name: "home",
    component: KuroLandingPage,
    meta: { requiresAuth: false, hideSidebar: true },
  },
  {
    path: "/landing",
    name: "landing",
    component: LandingPage,
    meta: { requiresAuth: false, hideSidebar: true },
  },
  {
    path: "/early-access",
    name: "early-access",
    component: EarlyAccessLandingPage,
    meta: { requiresAuth: false, hideSidebar: true },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false, onlyWhenLoggedOut: true, hideSidebar: true },
  },

  {
    path: "/magic-link",
    name: "magic-link-handler",
    component: MagicLinkHandler,
    meta: { requiresAuth: false, hideSidebar: true },
  },

  {
    path: "/pricing",
    name: "pricing",
    component: PricingPageView,
    meta: { requiresAuth: false, hideSidebar: true },
  },
  {
    path: "/subscription/success",
    name: "subscription-success",
    component: SubscriptionSuccessView,
    meta: { requiresAuth: false, hideSidebar: true },
  },
  {
    path: "/subscription/cancel",
    name: "subscription-cancel",
    component: SubscriptionCancelView,
    meta: { requiresAuth: false, hideSidebar: true },
  },
  {
    path: "/subscribe/:plan",
    name: "subscribe",
    component: SubscribePageView,
    props: true,
    meta: { requiresAuth: false, hideSidebar: true },
  },

  // Optional utility view
  {
    path: "/design",
    name: "design",
    component: DesignView,
    meta: { requiresAuth: false, hideSidebar: true },
  },

  // Authenticated Routes (Sidebar visible)
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/my-templates",
    name: "my-templates",
    component: MyTemplatesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/editor/:id?",
    name: "editor",
    component: EditorView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/obsidian-connect",
    name: "obsidian-connect",
    component: ObsidianOnboarding,
    meta: { requiresAuth: true },
  },
  {
    path: "/obsidian-explorer",
    name: "obsidian-explorer",
    component: ObsidianExplorer,
    meta: { requiresAuth: true },
  },
  {
    path: "/templates",
    name: "template-browser",
    component: TemplateBrowserView,
    meta: { requiresAuth: true },
  },

  // Catch-all route → redirect to home
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "home" },
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

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  if (to.meta.onlyWhenLoggedOut && authStore.isAuthenticated) {
    return next({ name: "dashboard" });
  }

  next();
});

export default router;

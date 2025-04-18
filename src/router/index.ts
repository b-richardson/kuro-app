import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from "vue-router";

/**
 * Router Configuration
 *
 * This file defines the application routes without complex navigation guards.
 * Auth is handled directly by Supabase and the auth store.
 */

// Import view components
import LandingPage from "../views/LandingPage.vue";
import KuroLandingPage from "@/views/KuroLandingPage.vue";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import MyTemplatesView from "../views/MyTemplatesView.vue";
import EditorView from "../views/EditorView.vue";
import SettingsView from "../views/SettingsView.vue";
import DesignView from "../views/DesignView.vue";
import ObsidianOnboarding from "../views/ObsidianOnboarding.vue";
import ObsidianExplorer from "../views/ObsidianExplorer.vue";
import TemplateBrowserView from "@/views/TemplateBrowserView.vue";
import PricingPageView from "@/views/PricingPageView.vue";
import SubscriptionSuccessView from "@/views/SubscriptionSuccessView.vue";
import SubscriptionCancelView from "@/views/SubscriptionCancelView.vue";
import SubscribePageView from "@/views/SubscribePageView.vue";

// Route definitions
const routes = [
  // Public routes
  {
    path: "/",
    name: "home",
    component: KuroLandingPage,
  },
  {
    path: "/landing",
    name: "landing",
    component: LandingPage,
  },
  {
    path: "/kuro-landing-page",
    name: "kuro-landing-page",
    component: KuroLandingPage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/signup",
    name: "signup",
    component: LoginView,
    props: { isSignup: true },
  },
  {
    path: "/reset-password",
    name: "resetPassword",
    component: LoginView,
    props: (route: RouteLocationNormalized) => ({
      isResetPassword: true,
      token: route.query.token,
      isUpdate: route.query.update === "true",
    }),
  },
  {
    path: "/design",
    name: "design",
    component: DesignView,
  },

  // New subscription routes
  {
    path: "/pricing",
    name: "pricing",
    component: PricingPageView,
  },
  {
    path: "/subscription/success",
    name: "subscription-success",
    component: SubscriptionSuccessView,
  },
  {
    path: "/subscription/cancel",
    name: "subscription-cancel",
    component: SubscriptionCancelView,
  },
  {
    path: "/subscribe/:plan",
    name: "subscribe",
    component: SubscribePageView,
    props: true,
  },

  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
  },
  {
    path: "/my-templates",
    name: "my-templates",
    component: MyTemplatesView,
  },

  {
    path: "/editor/:id?",
    name: "editor",
    component: EditorView,
    props: true,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
  {
    path: "/obsidian-connect",
    name: "obsidian-connect",
    component: ObsidianOnboarding,
  },
  {
    path: "/obsidian-explorer",
    name: "obsidian-explorer",
    component: ObsidianExplorer,
  },
  {
    path: "/templates",
    name: "template-browser",
    component: TemplateBrowserView,
  },

  // Catch-all route - redirect to home
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: { name: "home" },
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Scroll behavior for navigations
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Simple logging for debugging
router.afterEach((to) => {
  console.log("Navigation completed to:", to.path);
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Import view components
import LandingPage from "../views/LandingPage.vue";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import LibraryView from "../views/LibraryView.vue";
import TemplateLibraryView from "../views/TemplateLibraryView.vue";
import EditorView from "../views/EditorView.vue";
import SettingsView from "../views/SettingsView.vue";
import DesignView from "../views/DesignView.vue";
import ObsidianOnboarding from "../views/ObsidianOnboarding.vue";
import ObsidianExplorer from "../views/ObsidianExplorer.vue";

const routes = [
  {
    path: "/",
    name: "landing",
    component: LandingPage,
    meta: {
      requiresAuth: false,
      hideForAuth: true, // Hide for authenticated users
    },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: {
      requiresAuth: false,
      hideForAuth: true, // Hide for authenticated users
    },
  },
  {
    path: "/signup",
    name: "signup",
    component: LoginView, // Reuse login view with a prop to indicate signup mode
    props: { isSignup: true },
    meta: {
      requiresAuth: false,
      hideForAuth: true, // Hide for authenticated users
    },
  },
  {
    path: "/reset-password",
    name: "resetPassword",
    component: LoginView, // Reuse login view with a prop to indicate reset mode
    props: { isResetPassword: true },
    meta: {
      requiresAuth: false,
      hideForAuth: false, // Allow authenticated users to reset password
    },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
  {
    path: "/template-library",
    name: "templateLibrary",
    component: TemplateLibraryView,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
  {
    path: "/editor/:id?",
    name: "editor",
    component: EditorView,
    props: true,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
  {
    path: "/design",
    name: "design",
    component: DesignView,
    meta: {
      requiresAuth: false, // Available without authentication
    },
  },
  {
    path: "/obsidian-connect",
    name: "obsidian-connect",
    component: ObsidianOnboarding,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
  {
    path: "/obsidian-explorer",
    name: "obsidian-explorer",
    component: ObsidianExplorer,
    meta: {
      requiresAuth: true, // Requires authentication
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes,
});

// Navigation guards - strictly enforce auth requirements
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const hideForAuth = to.matched.some((record) => record.meta.hideForAuth);
  
  // Always check auth status before proceeding
  await authStore.checkAuth();
  
  // Check if the route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    // Store the intended destination for post-login redirect
    next({ 
      name: "login", 
      query: { redirect: to.fullPath } 
    });
  } 
  // Check if the route should be hidden for authenticated users
  else if (hideForAuth && authStore.isAuthenticated) {
    next({ name: "dashboard" });
  }
  else {
    next();
  }
});

export default router;
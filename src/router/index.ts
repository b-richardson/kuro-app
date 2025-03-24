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

// Navigation guards - simplified to avoid conflicts with auth store
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Log what we're trying to do
  console.log('Router guard running for:', to.path, {
    from: from.path,
    isAuthenticated: authStore.isAuthenticated,
    sessionChecked: authStore.sessionChecked
  });
  
  // If the session hasn't been checked yet, let's do it
  if (!authStore.sessionChecked) {
    console.log('Session not checked yet, checking auth status...');
    await authStore.checkAuth();
  }
  
  // Let the authStore's reactive system handle the redirects
  // This reduces the risk of redirect loops and state inconsistencies
  if (authStore.sessionChecked) {
    console.log('Session checked, proceeding with navigation');
    next();
    
    // After navigation completes successfully, sync auth state with router
    // This ensures that any subsequent navigation will be properly handled
    // based on updated auth state
    setTimeout(() => {
      authStore.syncAuthStateWithRouter();
    }, 0);
  } else {
    // If the session check is still pending, continue navigation
    // The auth state watcher will handle redirects later if needed
    console.log('Session check still pending, continuing navigation');
    next();
  }
});

// After each navigation, sync auth state if needed
router.afterEach((to) => {
  console.log('Navigation completed to:', to.path);
});

export default router;
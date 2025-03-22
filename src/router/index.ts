import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/auth';

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

// Check if dev mode is enabled
const isDevMode = localStorage.getItem('devMode') === 'true' || import.meta.env.DEV;

const routes = [
  {
    path: "/",
    name: "landing",
    component: LandingPage,
    meta: {
      requiresAuth: false,
      hideForAuth: true  // Hide for authenticated users
    }
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: {
      requiresAuth: false,
      hideForAuth: true  // Hide for authenticated users
    }
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  },
  {
    path: "/template-library",
    name: "templateLibrary",
    component: TemplateLibraryView,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  },
  {
    path: "/editor/:id?",
    name: "editor",
    component: EditorView,
    props: true,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  },
  {
    path: "/design",
    name: "design",
    component: DesignView,
    meta: {
      requiresAuth: false  // Available in all modes for development
    }
  },
  {
    path: "/obsidian-connect",
    name: "obsidian-connect",
    component: ObsidianOnboarding,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  },
  {
    path: "/obsidian-explorer",
    name: "obsidian-explorer",
    component: ObsidianExplorer,
    meta: {
      requiresAuth: true  // Requires authentication
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes,
});

// Add dev mode toggle function to window (can be called in browser console)
window.toggleDevMode = () => {
  const current = localStorage.getItem('devMode') === 'true';
  localStorage.setItem('devMode', (!current).toString());
  console.log(`Dev mode ${!current ? 'enabled' : 'disabled'}. Refresh the page for changes to take effect.`);
};

// Helper function to check if we should bypass auth checks
const shouldBypassAuth = () => {
  return isDevMode || localStorage.getItem('devMode') === 'true';
};

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const hideForAuth = to.matched.some(record => record.meta.hideForAuth);
  
  // Bypass auth checks in dev mode
  if (shouldBypassAuth()) {
    console.log('Dev mode: Bypassing authentication checks');
    next();
    return;
  }
  
  // Check if the route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } 
  // Check if the route should be hidden for authenticated users
  else if (hideForAuth && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  }
  else {
    next();
  }
});

// Add console message about dev mode during development
if (import.meta.env.DEV) {
  console.log(`
    🛠️ Development mode detected
    
    To toggle authentication bypass:
    - Run 'toggleDevMode()' in the browser console
    - Current status: ${shouldBypassAuth() ? 'ENABLED' : 'DISABLED'}
  `);
}

export default router;

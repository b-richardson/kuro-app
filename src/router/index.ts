import { createRouter, createWebHistory } from "vue-router";

// Import view components - using relative paths to ensure they're found
import HomeView from "../views/HomeView.vue";
import LibraryView from "../views/LibraryView.vue";
import EditorView from "../views/EditorView.vue";
import DesignView from "../views/DesignView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/home",
    name: "home-page",
    component: HomeView,
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
  },
  {
    path: "/editor/:id?",
    name: "editor",
    component: EditorView,
    props: true, // Pass route params as props
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
  {
    path: "/design",
    name: "design",
    component: DesignView,
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

export default router;

import { createRouter, createWebHistory } from 'vue-router'

// Import view components - using relative paths to ensure they're found
import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import EditorView from '../views/EditorView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/library',
    name: 'library',
    component: LibraryView
  },
  {
    path: '/editor/:id?',
    name: 'editor',
    component: EditorView,
    props: true // Pass route params as props
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
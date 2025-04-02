import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// Import Font Awesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css'

// Import Obsidian theme globally
import './components/obsidian/obsidian-theme.css'

// Add debug flag to help with navigation debugging
console.log('📝 Obsidian Template Creator Debug: Application starting...');
console.log('📝 If you see navigation issues, check the console for detailed logs');

const app = createApp(App)
const pinia = createPinia()

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')

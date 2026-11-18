import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { setAuthRouter } from "@/stores/auth";

// Import Font Awesome CSS
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import Obsidian theme globally
import "./components/obsidian/obsidian-theme.css";

console.log("📝 App started");

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // ✅ Register Pinia first
app.use(router); // ✅ Then router
setAuthRouter(router); // ✅ Then inject router into auth store (after stores exist)

app.mount("#app");

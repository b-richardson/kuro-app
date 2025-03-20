import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Keep only this alias, as you're using vue-draggable-next
      "vue-draggable-next": path.resolve(
        __dirname,
        "node_modules/vue-draggable-next/dist/vue-draggable-next.esm-bundler.js"
      ),
      // Remove the vuedraggable alias as you don't have this package installed
    },
  },
  optimizeDeps: {
    include: ["sortablejs", "vue-draggable-next"],
    // Remove 'vuedraggable' from here as well
  },
});

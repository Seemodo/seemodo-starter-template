import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/ fix
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true, // fail if port in use (e.g. after restart in Seemodo/[ctrl]) instead of switching to 5174, 5175
    allowedHosts: true as const,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

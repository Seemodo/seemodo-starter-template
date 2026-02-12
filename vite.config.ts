import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// IMPORTANT: Do NOT modify this file. The sandbox pre-configures it.
// Port 5173 is used by the Modal sandbox tunnel.
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 5173,
    allowedHosts: true,
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

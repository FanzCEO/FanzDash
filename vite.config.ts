import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Simple plugin loading for local development
const getPlugins = () => {
  const plugins = [react()];
  
  // Only load Replit plugins in Replit environment
  if (process.env.REPL_ID) {
    try {
      const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");
      plugins.push(runtimeErrorOverlay());
    } catch (e) {
      console.log("Replit runtime error overlay not available");
    }
  }
  
  return plugins;
};

export default defineConfig({
  plugins: getPlugins(),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

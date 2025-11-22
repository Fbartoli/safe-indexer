import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  optimizeDeps: {
    include: ["drizzle-orm"],
  },
  server: {
    port: 3000,
    proxy: {
      "/sql": {
        target: "http://localhost:42069",
        changeOrigin: true,
      },
    },
  },
});

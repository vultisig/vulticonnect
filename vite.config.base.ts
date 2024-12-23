import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), nodePolyfills({ exclude: ["fs"] })],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~variables" as *;`,
        api: "modern-compiler",
      },
    },
  },
  resolve: {
    alias: {
      "~variables": path.resolve(__dirname, "src/styles/_variables"),
    },
  },
  server: { port: 3000 },
});

import { defineConfig } from "vite";
import path from "path";

import { manifest } from "./package.json";

export default defineConfig({
  build: {
    emptyOutDir: true,
    manifest: true,
    outDir: "dist/relay",
    assetsDir: "",
    copyPublicDir: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, manifest.relay),
      },
    },
  },
});

/** @type {import('vite').UserConfig} */

import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5432,
  },
  plugins: [
    legacy({
      targets: ["Safari >= 9"],
      modernPolyfills: true,
      renderLegacyChunks: true,
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
  ],
});

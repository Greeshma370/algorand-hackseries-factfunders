import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Override the default polyfills for specific modules.
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        fs: 'memfs',
      },
      // Exclude specific modules from being polyfilled.
      exclude: [
        'http', // Excludes the polyfill for `http` and `node:http`.
        'https', // Excludes the polyfill for `https` and `node:https`.
      ]
    })
  ],
  base: "./",
  optimizeDeps: {
    exclude: ["lucide-react", "@noble/ed25519", "@perawallet/connect", "@txnlab/use-wallet", "@txnlab/use-wallet-react", "@txnlab/use-wallet-ui-react"],
    include: ["buffer", "process"],
  },
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

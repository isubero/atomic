import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Atomic",
      fileName: "index",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: [],
      output: {
        // Provide global variables for externalized deps
        globals: {},
        // For UMD build, expose Atomic globally
        name: "Atomic",
      },
    },
    sourcemap: true,
    minify: true,
    // Don't clean the dist directory to preserve TypeScript declarations
    emptyOutDir: false,
  },
});

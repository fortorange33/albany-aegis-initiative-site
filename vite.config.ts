import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: "/src/aai-risk-widget.tsx",
      output: { entryFileNames: "risk-widget.js" },
    },
    outDir: "assets/dist", // Specify output directory here
  },
});

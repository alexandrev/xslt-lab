import { readFileSync } from "fs";
import { execSync } from "child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

let gitCommit = "";
try {
  gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
} catch {}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_COMMIT__: JSON.stringify(gitCommit),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          codemirror: ["@uiw/react-codemirror", "@codemirror/lang-xml", "@codemirror/theme-one-dark"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});

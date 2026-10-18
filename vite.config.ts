import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf-8"),
);

const getCommit = (): string => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
};

const commit = getCommit();
// Timestamp guarantees a new build is a new service worker even when
// redeploying the same commit (e.g. with uncommitted local changes).
const buildId = `${commit}-${Date.now()}`;

// sw.js is served from /public as-is, so Vite never touches its contents.
// This plugin stamps a fresh build id into it after the build so the
// browser sees different bytes and actually installs the new worker.
const stampServiceWorker = (): Plugin => ({
  name: "stamp-service-worker",
  apply: "build",
  writeBundle() {
    const swPath = path.resolve(__dirname, "./dist/sw.js");
    const contents = fs.readFileSync(swPath, "utf-8");
    fs.writeFileSync(swPath, contents.replace(/__BUILD_ID__/g, buildId));
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(commit),
  },
});

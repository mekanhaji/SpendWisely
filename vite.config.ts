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

/** Every file under `dir` as a root-relative URL, e.g. "/assets/index-abc.js". */
const listFiles = (dir: string, urlPrefix: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const url = `${urlPrefix}/${entry.name}`;
    return entry.isDirectory()
      ? listFiles(path.join(dir, entry.name), url)
      : [url];
  });

/**
 * Files the service worker caches up front so the app opens offline on the
 * very first visit to any route. Inter ships one file per script; only latin
 * and latin-ext are kept (latin-ext holds the rupee sign), the rest cover
 * characters this app never shows.
 */
const getPrecacheUrls = (distDir: string): string[] => {
  const assets = listFiles(path.join(distDir, "assets"), "/assets").filter(
    (url) => !/\.woff2?$/.test(url) || /-latin(-ext)?-wght-normal/.test(url),
  );
  const icons = listFiles(path.join(distDir, "icons"), "/icons");
  return ["/", "/index.html", "/manifest.json", ...icons, ...assets];
};

// sw.js is served from /public as-is, so Vite never touches its contents.
// This plugin stamps a fresh build id and the precache list into it after the
// build so the browser sees different bytes and actually installs the new
// worker.
const stampServiceWorker = (): Plugin => ({
  name: "stamp-service-worker",
  apply: "build",
  writeBundle() {
    const distDir = path.resolve(__dirname, "./dist");
    const swPath = path.join(distDir, "sw.js");
    const contents = fs.readFileSync(swPath, "utf-8");
    fs.writeFileSync(
      swPath,
      contents
        .replace(/__BUILD_ID__/g, buildId)
        .replace(
          /"__PRECACHE__"/g,
          JSON.stringify(getPrecacheUrls(distDir)),
        ),
    );
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

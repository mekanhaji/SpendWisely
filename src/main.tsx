import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.tsx";
import { usePwaUpdateStore } from "./store";

// BASE_URL has no trailing slash when `base` is set, so normalise it before
// joining the service worker path.
const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${baseUrl}sw.js`)
      .then((registration) => {
        const notifyIfUpdate = (worker: ServiceWorker | null) => {
          // A controller already exists only once this isn't the very
          // first install, so the banner never fires on a fresh install.
          if (worker && navigator.serviceWorker.controller) {
            usePwaUpdateStore.getState().setWaitingWorker(worker);
          }
        };

        // Covers an update that finished downloading in a previous visit
        // but was never applied.
        notifyIfUpdate(registration.waiting);

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              notifyIfUpdate(installingWorker);
            }
          });
        });

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        });

        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

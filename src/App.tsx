import { useEffect } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home";
import Settings from "./pages/settings";
import {
  type BeforeInstallPromptEvent,
  usePwaInstallStore,
  useUserSettingsStore,
} from "./store";

const router = createHashRouter([
  {
    path: "/*",
    element: <Home />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <div>About page</div>,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);

function App() {
  const theme = useUserSettingsStore((state) => state.theme);
  const markInstallAvailable = usePwaInstallStore(
    (state) => state.markInstallAvailable,
  );
  const markInstallUnsupported = usePwaInstallStore(
    (state) => state.markInstallUnsupported,
  );
  const markInstalled = usePwaInstallStore((state) => state.markInstalled);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      markInstalled();
    } else if (!("onbeforeinstallprompt" in window)) {
      markInstallUnsupported();
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      markInstallAvailable(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      markInstalled();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [markInstallAvailable, markInstallUnsupported, markInstalled]);

  return <RouterProvider router={router} />;
}

export default App;

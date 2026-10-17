import { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/home";
import { TAB_PATHS } from "./layout";
import {
  type BeforeInstallPromptEvent,
  usePwaInstallStore,
  useUserSettingsStore,
} from "./store";

const router = createBrowserRouter([
  {
    path: TAB_PATHS.home,
    element: <Home />,
  },
  {
    path: TAB_PATHS.analytics,
    element: <Home />,
  },
  {
    path: TAB_PATHS.settings,
    element: <Home />,
  },
  {
    path: "/about",
    element: <div>About page</div>,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
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
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && systemPrefersDark.matches);
      // Toggled rather than assigned so any other class on <html> survives.
      document.documentElement.classList.toggle("dark", isDark);
    };

    applyTheme();

    if (theme !== "system") return;

    systemPrefersDark.addEventListener("change", applyTheme);
    return () => systemPrefersDark.removeEventListener("change", applyTheme);
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

import { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/home";
import AddIntentRoute from "./pages/add";
import Categories from "./pages/categories";
import { TAB_PATHS } from "./layout/tabs";
import {
  type BeforeInstallPromptEvent,
  useExpenseStore,
  usePwaInstallStore,
  useUserSettingsStore,
} from "./store";
import { getDailyTotals, getDayBudgetStatus } from "./lib/expense-analytics";
import {
  isStandalone,
  requestPersistentStorage,
  setLaunchHandler,
  updateAppBadge,
} from "./lib/pwa";

/**
 * Hex mirrors of --background in index.css; Chrome paints the PWA's status
 * bar from the theme-color meta, which only updates when the page sets it.
 */
const THEME_COLORS = {
  light: "#F5F3ED",
  dark: "#191b18",
} as const;

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
    path: "/add",
    element: <AddIntentRoute />,
  },
  {
    path: "/settings/categories",
    element: <Categories />,
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
  const expenseRecords = useExpenseStore((state) => state.expenseRecords);
  const dailyLimit = useUserSettingsStore((state) => state.dailyLimit);
  const warningLimit = useUserSettingsStore((state) => state.warningLimit);

  // Launches into an open window (the "Add expense" shortcut, shared text).
  useEffect(() => {
    setLaunchHandler((url) => {
      void router.navigate(`${url.pathname}${url.search}${url.hash}`);
    });
  }, []);

  // Dot on the home-screen icon while today is over the limit. Re-checked when
  // the app comes back to the foreground so it clears after midnight.
  useEffect(() => {
    const refreshBadge = () => {
      const todayTotal = getDailyTotals(expenseRecords, {
        mode: "today",
      }).reduce((sum, day) => sum + day.total, 0);
      updateAppBadge(
        getDayBudgetStatus(todayTotal, dailyLimit, warningLimit) === "over",
      );
    };

    refreshBadge();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshBadge();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [expenseRecords, dailyLimit, warningLimit]);

  useEffect(() => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && systemPrefersDark.matches);
      // Toggled rather than assigned so any other class on <html> survives.
      document.documentElement.classList.toggle("dark", isDark);
      // Also matches the initial set from the inline script in index.html.
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", isDark ? THEME_COLORS.dark : THEME_COLORS.light);
    };

    applyTheme();

    if (theme !== "system") return;

    systemPrefersDark.addEventListener("change", applyTheme);
    return () => systemPrefersDark.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    if (isStandalone()) {
      markInstalled();
      // Installed users keep their expenses only in localStorage.
      void requestPersistentStorage();
    } else if (!("onbeforeinstallprompt" in window)) {
      markInstallUnsupported();
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      markInstallAvailable(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      markInstalled();
      void requestPersistentStorage();
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

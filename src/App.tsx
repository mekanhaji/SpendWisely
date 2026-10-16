import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home";
import Settings from "./pages/settings";
import { useUserSettingsStore } from "./store";

const router = createBrowserRouter([
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

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return <RouterProvider router={router} />;
}

export default App;

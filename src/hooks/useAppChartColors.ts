import { useEffect, useState } from "react";
import { useUserSettingsStore } from "@/store";

export type AppChartColors = {
  spend: string;
  limit: string;
  over: string;
  gridText: string;
};

const readVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const readColors = (): AppChartColors => ({
  spend: `rgb(${readVar("--app-500")})`,
  limit: `rgb(${readVar("--app-warning-500")})`,
  over: `rgb(${readVar("--app-error-500")})`,
  gridText: `hsl(${readVar("--muted-foreground")})`,
});

export const useAppChartColors = (): AppChartColors => {
  const theme = useUserSettingsStore((state) => state.theme);
  const [colors, setColors] = useState<AppChartColors>(readColors);

  useEffect(() => {
    setColors(readColors());

    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, [theme]);

  return colors;
};

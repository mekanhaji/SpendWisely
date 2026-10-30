import { ChartPie, House, Settings, type LucideIcon } from "lucide-react";
import type { TabValue } from "./tabs";

/** Shared by the phone tab bar and the tablet/desktop sidebar. */
export const NAV_ITEMS: { tab: TabValue; label: string; icon: LucideIcon }[] = [
  { tab: "home", label: "Home", icon: House },
  { tab: "analytics", label: "Analytics", icon: ChartPie },
  { tab: "settings", label: "Settings", icon: Settings },
];

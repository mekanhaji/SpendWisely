import type { ThemePreference, UserSettings } from "@/store";

export type SettingId = "theme" | "currency" | "dailyLimit" | "warningLimit";

export type SettingDefinition = {
  id: SettingId;
  title: string;
  /** Takes current settings so per-mode copy (theme) can react. */
  description: (userSettings: UserSettings) => string;
  /** Width classes handed to SettingsCard's control slot. */
  bodyClassName?: string;
};

export const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const themeDescription: Record<ThemePreference, string> = {
  light: "Don't Burn your eyes, enable dark mode 🌚",
  dark: "Let's see the light, disable the dark mode 🌞",
  system: "Following your device, and switching along with it 🖥️",
};

export const settingList: SettingDefinition[] = [
  {
    id: "theme",
    title: "Theme",
    bodyClassName: "w-auto",
    description: (userSettings) => themeDescription[userSettings.theme],
  },
  {
    id: "currency",
    title: "Currency",
    description: () => "What symbol do you use to represent your money? 🤑",
  },
  {
    id: "dailyLimit",
    title: "Daily Expense Limit",
    description: () => "What is enough for the day? 🤔",
  },
  {
    id: "warningLimit",
    title: "Daily Expense Warning",
    description: () => "When should I warn you? 🚨",
  },
];

import type { ThemePreference } from "@/store";

export type SettingId =
  | "dailyLimit"
  | "warningLimit"
  | "currency"
  | "theme"
  | "categories";

export const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** Row titles and helper text, kept in one place so the copy stays consistent. */
export const settingCopy: Record<
  SettingId,
  { title: string; description: string }
> = {
  dailyLimit: {
    title: "Daily limit",
    description: "What is enough for a day.",
  },
  warningLimit: {
    title: "Warn me at",
    description: "Spending turns amber from this amount.",
  },
  currency: {
    title: "Currency",
    description: "The symbol shown next to amounts.",
  },
  theme: {
    title: "Theme",
    // The switcher says it all, and the control is too wide for a caption.
    description: "",
  },
  categories: {
    title: "Categories",
    description: "Add, rename or remove them.",
  },
};

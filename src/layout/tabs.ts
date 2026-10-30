/** Route each nav tab lives on, so the URL decides which one is active. */
export const TAB_PATHS = {
  home: "/",
  analytics: "/analytics",
  settings: "/settings",
} as const;

export type TabValue = keyof typeof TAB_PATHS;

const TAB_VALUES = Object.keys(TAB_PATHS) as TabValue[];

/** Longest matching path wins, so /settings/categories still lights up Settings. */
export const tabFromPath = (pathname: string): TabValue => {
  const match = TAB_VALUES.filter((tab) =>
    TAB_PATHS[tab] === "/"
      ? pathname === "/"
      : pathname.startsWith(TAB_PATHS[tab]),
  ).sort((a, b) => TAB_PATHS[b].length - TAB_PATHS[a].length)[0];
  return match ?? "home";
};

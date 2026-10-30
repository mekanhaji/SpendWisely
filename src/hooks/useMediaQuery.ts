import { useCallback, useSyncExternalStore } from "react";

/** Tailwind's `md` breakpoint: where the sidebar and centered dialogs start. */
export const DESKTOP_QUERY = "(min-width: 768px)";

/** Live `matchMedia` result; re-renders when the query starts or stops matching. */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};

/**
 * Small wrappers around browser APIs that only exist on some platforms
 * (installed Chromium, Android, iOS). Each one checks for support first and
 * quietly does nothing elsewhere, so callers never need their own guard.
 */

type BadgeNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

type LaunchParams = { targetURL?: string };

type LaunchQueue = {
  setConsumer: (consumer: (params: LaunchParams) => void) => void;
};

/** True when the app runs from the home screen / app window, not a browser tab. */
export const isStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;

/** iPhone, iPod and iPad (iPadOS reports itself as a Mac with a touch screen). */
export const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** Short buzz for confirmations. Ignored on desktop and iOS. */
export const haptic = (pattern: number | number[] = 10): void => {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
};

/**
 * Ask the browser not to evict localStorage under storage pressure. Expenses
 * only live there, so this is what keeps them safe. Chromium grants it to
 * installed apps; Firefox shows a prompt; Safari decides on its own.
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (!navigator.storage?.persist) return false;
  try {
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
};

export const isStoragePersisted = async (): Promise<boolean> => {
  if (!navigator.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
};

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/**
 * Share text through the system share sheet, or copy it where there is none
 * (most desktop browsers).
 */
export const shareText = async (
  text: string,
  title?: string,
): Promise<ShareResult> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
};

/**
 * Hand a file to the user: the share sheet on phones (save to Files, send to
 * Drive, WhatsApp...), a normal download everywhere else. Desktop browsers
 * that can share files still get a download, since a share popup is an odd
 * way to save a backup.
 */
export const shareOrDownloadFile = async (
  file: File,
): Promise<"shared" | "downloaded" | "cancelled"> => {
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (isTouchDevice && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: file.name });
      return "shared";
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return "cancelled";
      // Any other failure falls back to a download below.
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
};

/** Dot on the home-screen icon while today is over the daily limit. */
export const updateAppBadge = (isOverBudget: boolean): void => {
  const nav = navigator as BadgeNavigator;
  const apply = isOverBudget ? nav.setAppBadge?.() : nav.clearAppBadge?.();
  apply?.catch(() => {});
};

/**
 * Called for launches into an already open app window (shortcuts, share
 * target; the manifest uses launch_handler focus-existing). The first call in a
 * fresh window repeats the URL the router already loaded, so it is skipped.
 */
export const setLaunchHandler = (handler: (url: URL) => void): void => {
  const launchQueue = (window as Window & { launchQueue?: LaunchQueue })
    .launchQueue;
  if (!launchQueue) return;

  const loadedHref = window.location.href;
  let isFirstCall = true;

  launchQueue.setConsumer((params) => {
    const isInitialLaunch = isFirstCall && params.targetURL === loadedHref;
    isFirstCall = false;
    if (!params.targetURL || isInitialLaunch) return;

    const url = new URL(params.targetURL);
    if (url.origin === window.location.origin) handler(url);
  });
};

// Dates (12/10/2025, 2025-10-12), clock times and long digit runs (phone
// numbers, account and UPI reference ids) are never the amount.
const NOISE =
  /\b\d{1,4}[/-]\d{1,2}[/-]\d{1,4}\b|\b\d{1,2}:\d{2}(?::\d{2})?\b|\d{7,}/g;

const NUMBER = String.raw`(\d[\d,]*(?:\.\d{1,2})?)`;
// The lookbehind keeps "rs" inside words ("hours 5") from counting as a symbol.
const WITH_CURRENCY = new RegExp(
  String.raw`(?<![a-z])(?:₹|rs\.?|inr|\$|usd|€|eur|£|gbp)\s*${NUMBER}`,
  "i",
);
// A bare number must stand alone: not "XX1234", not "5th".
const BARE = new RegExp(String.raw`(?<![\w.])${NUMBER}(?!\w)`);

const MAX_SHARED_AMOUNT = 10_000_000;

/**
 * Best guess at the amount in shared text such as a bank or UPI message.
 * Prefers a number next to a currency symbol; falls back to the first
 * standalone number. Returns undefined when nothing looks like an amount.
 */
export const parseSharedAmount = (text: string): number | undefined => {
  const cleaned = text.replace(NOISE, " ");
  const match = WITH_CURRENCY.exec(cleaned) ?? BARE.exec(cleaned);
  if (!match) return undefined;

  const amount = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 && amount <= MAX_SHARED_AMOUNT
    ? amount
    : undefined;
};

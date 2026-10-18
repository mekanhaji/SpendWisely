export type ExpenseFilterMode =
  | "all"
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "custom";

export type ExpenseFilter = {
  mode: ExpenseFilterMode;
  /** yyyy-mm-dd local, only for custom */
  from?: string;
  /** yyyy-mm-dd local, only for custom */
  to?: string;
};

export const toLocalISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseLocalISODate = (s: string): Date | null => {
  const parts = s.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
};

export const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const endOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const getMondayOfThisWeek = (now: Date = new Date()): Date => {
  const day = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - day);
  return monday;
};

export const getFirstOfThisMonth = (now: Date = new Date()): Date =>
  new Date(now.getFullYear(), now.getMonth(), 1);

export const matchesFilter = (
  datetime: string,
  filter: ExpenseFilter,
): boolean => {
  const recordDate = new Date(datetime);
  const today = new Date();

  switch (filter.mode) {
    case "all":
      return true;
    case "today":
      return (
        recordDate.toLocaleDateString("en-IN") ===
        today.toLocaleDateString("en-IN")
      );
    case "yesterday": {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      return (
        recordDate.toLocaleDateString("en-IN") ===
        yesterday.toLocaleDateString("en-IN")
      );
    }
    case "week": {
      const monday = getMondayOfThisWeek(today);
      return recordDate >= monday;
    }
    case "month": {
      const first = getFirstOfThisMonth(today);
      return recordDate >= first;
    }
    case "custom": {
      const from = filter.from ? parseLocalISODate(filter.from) : null;
      const to = filter.to ? parseLocalISODate(filter.to) : null;
      if (!from && !to) return true;
      if (from && !to) {
        return (
          recordDate >= startOfDay(from) && recordDate <= endOfDay(from)
        );
      }
      if (!from && to) {
        return recordDate >= startOfDay(to) && recordDate <= endOfDay(to);
      }
      // both present (from/to are Date here)
      let start = startOfDay(from!);
      let end = endOfDay(to!);
      if (start > end) {
        start = startOfDay(to!);
        end = endOfDay(from!);
      }
      return recordDate >= start && recordDate <= end;
    }
  }
};

/**
 * Resolves a filter to a concrete [start, end] range.
 * Returns null only for "all" (unbounded) or an empty custom range.
 */
export const resolveFilterRange = (
  filter: ExpenseFilter,
  now: Date = new Date(),
): { start: Date; end: Date } | null => {
  switch (filter.mode) {
    case "all":
      return null;
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    case "week":
      return { start: getMondayOfThisWeek(now), end: endOfDay(now) };
    case "month":
      return { start: getFirstOfThisMonth(now), end: endOfDay(now) };
    case "custom": {
      const from = filter.from ? parseLocalISODate(filter.from) : null;
      const to = filter.to ? parseLocalISODate(filter.to) : null;
      if (!from && !to) return null;
      if (from && !to) return { start: startOfDay(from), end: endOfDay(from) };
      if (!from && to) return { start: startOfDay(to), end: endOfDay(to) };
      let start = startOfDay(from!);
      let end = endOfDay(to!);
      if (start > end) {
        start = startOfDay(to!);
        end = endOfDay(from!);
      }
      return { start, end };
    }
  }
};

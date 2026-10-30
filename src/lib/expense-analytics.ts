import type { ExpenseRecord } from "@/store";
import { UNCATEGORIZED_CATEGORY } from "@/lib/migrations/expense-migrations";
import {
  matchesFilter,
  resolveFilterRange,
  startOfDay,
  toLocalISODate,
  type ExpenseFilter,
} from "@/lib/expense-filter";

export const TOP_EXPENSES_LIMIT = 5;
/** Defensive cap on how many day-buckets getDailyTotals will ever build. */
const MAX_BUCKET_DAYS = 366;

export type DailyTotal = { date: string; total: number };

export const getFilteredRecords = (
  records: ExpenseRecord[],
  filter: ExpenseFilter,
): ExpenseRecord[] => records.filter((r) => matchesFilter(r.datetime, filter));

export const getDailyTotals = (
  records: ExpenseRecord[],
  filter: ExpenseFilter,
  now: Date = new Date(),
): DailyTotal[] => {
  const filtered = getFilteredRecords(records, filter);
  const range = resolveFilterRange(filter, now);

  let start: Date;
  let end: Date;
  if (range) {
    start = range.start;
    end = range.end;
  } else if (filtered.length > 0) {
    const earliest = filtered.reduce(
      (min, r) => (new Date(r.datetime) < new Date(min.datetime) ? r : min),
      filtered[0],
    );
    start = startOfDay(new Date(earliest.datetime));
    end = startOfDay(now);
  } else {
    start = startOfDay(now);
    end = startOfDay(now);
  }

  const totals = new Map<string, number>();
  const cursor = new Date(start);
  let iterations = 0;
  while (cursor <= end && iterations < MAX_BUCKET_DAYS) {
    totals.set(toLocalISODate(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
    iterations += 1;
  }

  for (const record of filtered) {
    const key = toLocalISODate(new Date(record.datetime));
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + record.amount);
    }
  }

  return Array.from(totals, ([date, total]) => ({ date, total }));
};

export type SummaryStats = {
  total: number;
  averagePerDay: number;
  highestDay: DailyTotal | null;
  transactionCount: number;
};

export const getSummaryStats = (
  dailyTotals: DailyTotal[],
  filteredRecords: ExpenseRecord[],
): SummaryStats => {
  const total = dailyTotals.reduce((sum, d) => sum + d.total, 0);
  const highestDay = dailyTotals.length
    ? dailyTotals.reduce((max, d) => (d.total > max.total ? d : max))
    : null;

  return {
    total,
    averagePerDay: dailyTotals.length ? total / dailyTotals.length : 0,
    highestDay,
    transactionCount: filteredRecords.length,
  };
};

export const getTopExpenses = (
  filteredRecords: ExpenseRecord[],
  limit: number = TOP_EXPENSES_LIMIT,
): ExpenseRecord[] =>
  [...filteredRecords].sort((a, b) => b.amount - a.amount).slice(0, limit);

export type CategoryTotal = {
  category: string;
  total: number;
  count: number;
  /** Fraction of the grand total, 0 to 1. */
  share: number;
};

/**
 * Spend per category, biggest first. Names are matched case-insensitively and
 * keep the casing of the first record seen.
 */
export const getCategoryTotals = (
  records: ExpenseRecord[],
): CategoryTotal[] => {
  const byCategory = new Map<string, Omit<CategoryTotal, "share">>();

  for (const record of records) {
    const name = record.category.trim() || UNCATEGORIZED_CATEGORY;
    const key = name.toLowerCase();
    const entry = byCategory.get(key) ?? { category: name, total: 0, count: 0 };
    entry.total += record.amount;
    entry.count += 1;
    byCategory.set(key, entry);
  }

  const grandTotal = records.reduce((sum, record) => sum + record.amount, 0);

  return Array.from(byCategory.values())
    .sort((a, b) => b.total - a.total)
    .map((entry) => ({
      ...entry,
      share: grandTotal > 0 ? entry.total / grandTotal : 0,
    }));
};

export type DayBudgetStatus = "ok" | "warning" | "over";

export const percentageOfLimit = (current: number, limit: number): number => {
  if (limit <= 0) return 0;
  if (current > limit) return 100;
  return (current / limit) * 100;
};

export const getDayBudgetStatus = (
  total: number,
  dailyLimit: number,
  warningLimit: number,
): DayBudgetStatus => {
  if (dailyLimit <= 0) return "ok";
  if (total >= dailyLimit) return "over";
  if (total >= warningLimit) return "warning";
  return "ok";
};

export type DayBudgetComparison = {
  date: string;
  total: number;
  status: DayBudgetStatus;
  percentage: number;
};

export const getBudgetComparison = (
  dailyTotals: DailyTotal[],
  dailyLimit: number,
  warningLimit: number,
): DayBudgetComparison[] =>
  dailyTotals.map((d) => ({
    date: d.date,
    total: d.total,
    status: getDayBudgetStatus(d.total, dailyLimit, warningLimit),
    percentage: percentageOfLimit(d.total, dailyLimit),
  }));

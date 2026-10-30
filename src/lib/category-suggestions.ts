import type { ExpenseRecord } from "@/store";
import { UNCATEGORIZED_CATEGORY } from "@/lib/migrations/expense-migrations";

/**
 * Category suggestions for the add-expense dialog.
 *
 * Each guess is a weighted count of how often the category has been used
 * lately (frecency), at around this hour, and at around this amount. The
 * amount factor is skipped until the user types one, so the chips can settle
 * before the amount is known.
 */

export const SUGGESTION_COUNT = 4;
/** Below this many categorised records, ranking is plain frequency. */
export const MIN_SCORED_ENTRIES = 15;
/** Records older than this are irrelevant once the decay is applied. */
export const MAX_HISTORY_DAYS = 365;
export const HALF_LIFE_DAYS = 30;
export const TIME_SIGMA_HOURS = 1.5;
export const AMOUNT_SIGMA = 0.5;
/** A strong match needs a clear lead, real support, and a non-trivial score. */
export const STRONG_MIN_SHARE = 0.5;
export const STRONG_MIN_SCORE = 1;
export const STRONG_MIN_SUPPORT = 3;

const MS_PER_DAY = 86_400_000;
const HOURS_PER_DAY = 24;
const UNCATEGORIZED_KEY = UNCATEGORIZED_CATEGORY.trim().toLowerCase();

export type CategorySuggestion = {
  category: string;
  /** Weighted count; in frequency mode this is simply the usage count. */
  score: number;
  /** Share of the displayed candidates' scores, 0..1. */
  share: number;
  /** Only true when the guess is confident enough to be labelled. */
  isStrong: boolean;
  support: number;
};

type ProfileEntry = {
  /** Clamped to `now` so a future-dated record cannot gain extra weight. */
  ts: number;
  /** Local hour of day as a fraction, e.g. 13.5 for 13:30. */
  hour: number;
  amount: number;
};

export type CategoryProfile = {
  /** Display name per normalised key, in the store's order. */
  names: Map<string, string>;
  /** Normalised keys in the store's order. */
  order: string[];
  entries: Map<string, ProfileEntry[]>;
  totalEntries: number;
};

export type CategorySuggestionOptions = {
  records: ExpenseRecord[];
  categories: string[];
  now?: Date;
  amount?: number;
  limit?: number;
};

const normalizeKey = (name: string): string => name.trim().toLowerCase();

const hoursOfDay = (date: Date): number =>
  date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

/**
 * Shortest distance between two hours on a 24-hour clock, so 23:00 and 00:00
 * are one hour apart rather than twenty-three.
 */
export const circularHourDistance = (a: number, b: number): number => {
  const direct = Math.abs(a - b) % HOURS_PER_DAY;
  return Math.min(direct, HOURS_PER_DAY - direct);
};

/** Gathers the history the ranker needs, once per records/categories change. */
export const buildCategoryProfile = (
  records: ExpenseRecord[],
  categories: string[],
  now: Date = new Date(),
): CategoryProfile => {
  const nowMs = now.getTime();
  const horizonStart = nowMs - MAX_HISTORY_DAYS * MS_PER_DAY;

  const names = new Map<string, string>();
  const order: string[] = [];

  for (const raw of categories) {
    const key = normalizeKey(raw);
    if (!key || key === UNCATEGORIZED_KEY || names.has(key)) continue;
    names.set(key, raw.trim());
    order.push(key);
  }

  const entries = new Map<string, ProfileEntry[]>();
  let totalEntries = 0;

  for (const record of records) {
    const key = normalizeKey(record.category ?? "");
    if (!names.has(key)) continue;

    const ts = Date.parse(record.datetime);
    if (!Number.isFinite(ts) || ts < horizonStart) continue;

    const parsedAmount = Number(record.amount);
    const entry: ProfileEntry = {
      ts: Math.min(ts, nowMs),
      hour: hoursOfDay(new Date(ts)),
      amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    };

    const bucket = entries.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      entries.set(key, [entry]);
    }
    totalEntries += 1;
  }

  return { names, order, entries, totalEntries };
};

/** `1` when the amount is unknown, so typing one only adds information. */
export const amountFit = (entryAmount: number, amount?: number): number => {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return 1;
  if (!Number.isFinite(entryAmount) || entryAmount <= 0) return 1;

  const ratio = Math.log(amount / entryAmount);
  return Math.exp(-(ratio * ratio) / (2 * AMOUNT_SIGMA * AMOUNT_SIGMA));
};

const scoreEntry = (
  entry: ProfileEntry,
  nowMs: number,
  nowHour: number,
  amount?: number,
): number => {
  const ageDays = Math.max(0, (nowMs - entry.ts) / MS_PER_DAY);
  const decay = Math.exp((-Math.LN2 * ageDays) / HALF_LIFE_DAYS);

  const distance = circularHourDistance(nowHour, entry.hour);
  const timeFit = Math.exp(
    -(distance * distance) / (2 * TIME_SIGMA_HOURS * TIME_SIGMA_HOURS),
  );

  return decay * timeFit * amountFit(entry.amount, amount);
};

/**
 * Ranks categories and pads the list to `limit` with the most-used remaining
 * categories. The first slot is always the current best guess, so the tap
 * target stays predictable even as the amount changes.
 */
export const rankCategorySuggestions = (
  profile: CategoryProfile,
  options: Omit<CategorySuggestionOptions, "records" | "categories"> = {},
): CategorySuggestion[] => {
  const limit = Math.max(0, options.limit ?? SUGGESTION_COUNT);
  if (limit === 0 || profile.names.size === 0) return [];

  const now = options.now ?? new Date();
  const nowMs = now.getTime();
  const nowHour = hoursOfDay(now);
  const scoring = profile.totalEntries >= MIN_SCORED_ENTRIES;

  const candidates = profile.order.map((key, index) => {
    const bucket = profile.entries.get(key) ?? [];
    const lastUsed = bucket.reduce((latest, e) => Math.max(latest, e.ts), 0);
    const score = scoring
      ? bucket.reduce(
          (sum, entry) => sum + scoreEntry(entry, nowMs, nowHour, options.amount),
          0,
        )
      : bucket.length;

    return {
      key,
      name: profile.names.get(key) ?? key,
      index,
      score,
      support: bucket.length,
      lastUsed,
    };
  });

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      b.support - a.support ||
      b.lastUsed - a.lastUsed ||
      a.index - b.index,
  );

  // Sorting alone handles padding: categories with no history score 0 and
  // fall to the end, keeping stored order among themselves. That means a
  // fresh install still gets a full row of choices.
  const shown = candidates.slice(0, limit);

  const totalScore = shown.reduce((sum, candidate) => sum + candidate.score, 0);
  const top = shown[0];

  return shown.map((candidate) => {
    const share = totalScore > 0 ? candidate.score / totalScore : 0;
    return {
      category: candidate.name,
      score: candidate.score,
      share,
      isStrong:
        scoring &&
        candidate.key === top.key &&
        candidate.score >= STRONG_MIN_SCORE &&
        share >= STRONG_MIN_SHARE &&
        candidate.support >= STRONG_MIN_SUPPORT,
      support: candidate.support,
    };
  });
};

export const getCategorySuggestions = ({
  records,
  categories,
  now = new Date(),
  amount,
  limit,
}: CategorySuggestionOptions): CategorySuggestion[] =>
  rankCategorySuggestions(buildCategoryProfile(records, categories, now), {
    now,
    amount,
    limit,
  });

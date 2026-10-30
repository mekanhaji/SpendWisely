import type { ExpenseRecord, ExpenseStore } from "@/store";

/**
 * Current persisted shape of the expense store. Bump this whenever
 * `ExpenseRecord` changes so `persist` runs the matching migrate step once.
 *
 * - v1: renamed `discretion` -> `description`
 * - v2: replaced `description` with `category` + `notes`
 */
export const EXPENSE_STORE_VERSION = 2;

export const UNCATEGORIZED_CATEGORY = "Uncategorized";

export const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
];

type LegacyExpenseRecord = Partial<ExpenseRecord> & {
  discretion?: string;
  description?: string;
};

type PersistedExpenseState = Omit<Partial<ExpenseStore>, "expenseRecords"> & {
  expenseRecords?: LegacyExpenseRecord[];
};

/** Trimmed category name, or an empty string when there is nothing usable. */
export const normalizeCategoryName = (name: string): string => name.trim();

/**
 * Appends categories that are not already present, comparing
 * case-insensitively so "food" cannot sneak in beside "Food".
 */
export const mergeCategoryNames = (
  existing: string[],
  incoming: string[],
): string[] => {
  const seen = new Set(existing.map((name) => name.toLowerCase()));
  const merged = [...existing];

  for (const candidate of incoming) {
    const name = normalizeCategoryName(candidate);
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    merged.push(name);
  }

  return merged;
};

/**
 * One-time client-side migration of the persisted expense store.
 *
 * Runs inside zustand's `persist` middleware, which only invokes it when the
 * stored version is older than `EXPENSE_STORE_VERSION` — so this executes once
 * per browser and the migrated state is written back to localStorage.
 *
 * Steps are chained rather than branched so a user still on v0 lands on the
 * current shape in a single pass.
 */
export const migrateExpenseState = (
  persisted: unknown,
  version: number,
): Partial<ExpenseStore> => {
  const state = (persisted ?? {}) as PersistedExpenseState;
  let records: LegacyExpenseRecord[] = Array.isArray(state.expenseRecords)
    ? state.expenseRecords
    : [];

  if (version < 1) {
    records = records.map(({ discretion, ...rest }) => ({
      ...rest,
      description: discretion ?? rest.description ?? "",
    }));
  }

  if (version < 2) {
    const discoveredCategories: string[] = [];

    records = records.map((record) => {
      const description =
        typeof record.description === "string" ? record.description : "";
      const category =
        normalizeCategoryName(description) || UNCATEGORIZED_CATEGORY;

      discoveredCategories.push(category);

      return {
        datetime: record.datetime ?? new Date().toISOString(),
        amount: typeof record.amount === "number" ? record.amount : 0,
        category,
        // The old description is the only free text we have, so it is kept
        // verbatim as the note.
        notes: description,
      };
    });

    state.expenseRecords = records;
    state.categories = mergeCategoryNames(
      Array.isArray(state.categories) && state.categories.length > 0
        ? state.categories
        : DEFAULT_CATEGORIES,
      discoveredCategories,
    );
  } else {
    state.expenseRecords = records;
  }

  if (!Array.isArray(state.categories) || state.categories.length === 0) {
    state.categories = [...DEFAULT_CATEGORIES];
  }

  // Every record is in the current shape by now: either rewritten above, or
  // already at v2+. The legacy fields were only ever read, never returned.
  return state as Partial<ExpenseStore>;
};

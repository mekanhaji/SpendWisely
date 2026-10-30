import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_CATEGORIES,
  EXPENSE_STORE_VERSION,
  UNCATEGORIZED_CATEGORY,
  mergeCategoryNames,
  migrateExpenseState,
} from "@/lib/migrations/expense-migrations";

export type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export type ExpenseRecord = {
  datetime: string;
  amount: number;
  category: string;
  notes: string;
};

export type ExpenseStore = {
  currentExpense: number;
  expenseRecords: ExpenseRecord[];
  /** Categories the user can pick from; extended whenever they create one. */
  categories: string[];
  /**
   * Set the current expense
   *
   * @param expense
   * @returns
   */
  setCurrentExpense: (expense: number) => void;
  /**
   * Get expense record by timestamp
   *
   * @param timestamp
   * @returns
   */
  getExpenseRecord: (timestamp: string) => ExpenseRecord | undefined;
  /**
   * Add expense to the total expense
   *
   * @param expense
   * @param category - falls back to "Uncategorized" when blank
   * @param notes - optional free text
   * @param datetime - ISO string; defaults to now. Used to record expense on filter-selected day.
   * @returns
   */
  addExpense: (
    expense: number,
    category?: string,
    notes?: string,
    datetime?: string,
  ) => void;
  /**
   * Add a category to the picker if it does not exist yet (case-insensitive).
   *
   * @param category
   * @returns
   */
  addCategory: (category: string) => void;
  renameCategory: (from: string, to: string) => void;
  removeCategory: (category: string) => void;
  /**
   * Update the total expense
   *
   * @param expense
   * @returns
   */
  updateExpense: (timestamp: string, record: ExpenseRecord) => void;
  /**
   * Remove expense from the total expense
   *
   * @param timestamp
   * @returns
   */
  removeExpense: (timestamp: string) => void;
};

const createExpenseRecord = (
  amount: number,
  category: string,
  notes: string,
  datetime?: string,
): ExpenseRecord => {
  return {
    datetime: datetime ?? new Date().toISOString(),
    amount,
    category: category.trim() || UNCATEGORIZED_CATEGORY,
    notes: notes.trim(),
  };
};

const useExpenseStore = create(
  persist<ExpenseStore>(
    (set, get) => ({
      currentExpense: 0,
      expenseRecords: [],
      categories: [...DEFAULT_CATEGORIES],
      setCurrentExpense: (expense) => set({ currentExpense: expense }),
      getExpenseRecord: (timestamp) =>
        get().expenseRecords.find((record) => record.datetime === timestamp),
      addExpense: (expense, category = "", notes = "", datetime) =>
        set((state) => {
          const expenseRecord = createExpenseRecord(
            expense,
            category,
            notes,
            datetime,
          );
          return {
            expenseRecords: [...state.expenseRecords, expenseRecord],
            categories: mergeCategoryNames(state.categories, [
              expenseRecord.category,
            ]),
          };
        }),
      addCategory: (category) =>
        set((state) => {
          const categories = mergeCategoryNames(state.categories, [category]);
          return categories.length === state.categories.length
            ? state
            : { categories };
        }),
      renameCategory: (from, to) =>
        set((state) => {
          const previous = from.trim();
          const next = to.trim();
          if (!previous || !next) return state;
          const previousLower = previous.toLowerCase();
          const nextLower = next.toLowerCase();
          if (previousLower === nextLower) return state;

          // Renaming onto an existing category merges both sets of records.
          const target =
            state.categories.find((c) => c.toLowerCase() === nextLower) ?? next;

          const records = state.expenseRecords.map((record) =>
            record.category.trim().toLowerCase() === previousLower
              ? { ...record, category: target }
              : record,
          );

          const categories = state.categories.filter(
            (c) => c.trim().toLowerCase() !== previousLower,
          );
          if (!categories.some((c) => c.trim().toLowerCase() === nextLower)) {
            categories.push(target);
          }

          return { expenseRecords: records, categories };
        }),
      removeCategory: (category) =>
        set((state) => {
          const name = category.trim();
          // The fallback category is always available for uncategorised records.
          if (name.toLowerCase() === UNCATEGORIZED_CATEGORY.toLowerCase()) {
            return state;
          }

          return {
            categories: state.categories.filter(
              (c) => c.trim().toLowerCase() !== name.toLowerCase(),
            ),
            expenseRecords: state.expenseRecords.map((record) =>
              record.category.trim().toLowerCase() === name.toLowerCase()
                ? { ...record, category: UNCATEGORIZED_CATEGORY }
                : record,
            ),
          };
        }),
      updateExpense: (timestamp, record) =>
        set((state) => {
          const index = state.expenseRecords.findIndex(
            (expense) => expense.datetime === timestamp,
          );
          if (index === -1) return state;

          const expenseRecords = [...state.expenseRecords];
          expenseRecords[index] = record;

          return {
            expenseRecords,
            categories: mergeCategoryNames(state.categories, [
              record.category,
            ]),
          };
        }),
      removeExpense: (timestamp) => {
        set((state) => {
          const index = state.expenseRecords.findIndex(
            (record) => record.datetime === timestamp,
          );
          if (index !== -1) {
            const updatedRecords = [...state.expenseRecords];
            updatedRecords.splice(index, 1);
            return {
              expenseRecords: updatedRecords,
            };
          }
          return state;
        });
      },
    }),
    {
      name: "expense-store",
      storage: createJSONStorage(() => localStorage),
      version: EXPENSE_STORE_VERSION,
      // Runs once per browser, on the client, when the stored version is
      // older than EXPENSE_STORE_VERSION. See the migration module for the
      // description -> category/notes step.
      migrate: (persisted, version) =>
        migrateExpenseState(persisted, version) as ExpenseStore,
    },
  ),
);
// -----------------------------------------------------------------

export type ThemePreference = "light" | "dark" | "system";

export type UserSettings = {
  dailyLimit: number;
  warningLimit: number;
  currency: string;
  theme: ThemePreference;

  updateDailyLimit: (dailyLimit: number) => void;
  updateCurrency: (currency: string) => void;
  updateWarningLimit: (warningLimit: number) => void;
  setTheme: (theme: ThemePreference) => void;
};

const useUserSettingsStore = create(
  persist<UserSettings>(
    (set) => ({
      dailyLimit: 100,
      currency: "₹",
      warningLimit: 80,
      theme: "system",
      updateDailyLimit: (dailyLimit) => set({ dailyLimit }),
      updateCurrency: (currency) => set({ currency }),
      updateWarningLimit: (warningLimit) => set({ warningLimit }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "user-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export type PwaInstallStatus =
  | "idle"
  | "available"
  | "unsupported"
  | "installed"
  | "dismissed";

export type PwaInstallStore = {
  installPrompt: BeforeInstallPromptEvent | null;
  installStatus: PwaInstallStatus;
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void;
  markInstallAvailable: (event: BeforeInstallPromptEvent) => void;
  markInstallUnsupported: () => void;
  markInstalled: () => void;
  markInstallDismissed: () => void;
  clearInstallPrompt: () => void;
  promptInstall: () => Promise<void>;
};

const usePwaInstallStore = create<PwaInstallStore>((set, get) => ({
  installPrompt: null,
  installStatus: "idle",
  setInstallPrompt: (event) => set({ installPrompt: event }),
  markInstallAvailable: (event) =>
    set({ installPrompt: event, installStatus: "available" }),
  markInstallUnsupported: () =>
    set((state) =>
      state.installStatus === "installed"
        ? state
        : { installPrompt: null, installStatus: "unsupported" },
    ),
  markInstalled: () => set({ installPrompt: null, installStatus: "installed" }),
  markInstallDismissed: () =>
    set({ installPrompt: null, installStatus: "dismissed" }),
  clearInstallPrompt: () => set({ installPrompt: null }),
  promptInstall: async () => {
    const deferredPrompt = get().installPrompt;

    if (!deferredPrompt) {
      return;
    }

    // Cleared up front so a rapid second tap cannot reuse the same prompt.
    set({ installPrompt: null });

    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      set({
        installStatus: outcome === "accepted" ? "installed" : "dismissed",
      });
    } catch {
      set({ installPrompt: deferredPrompt, installStatus: "available" });
    }
  },
}));

/** Prefill for the add-expense sheet, e.g. from the Web Share Target. */
export type AddExpenseIntent = { amount?: string; notes?: string };

export type AddIntentStore = {
  intent: AddExpenseIntent | null;
  request: (intent: AddExpenseIntent) => void;
  consume: () => void;
};

/**
 * Hand-off between the /add route (shortcut or share target) and Home, which
 * owns the sheet. Home is re-created by the redirect, so the request has to
 * live outside it.
 */
const useAddIntentStore = create<AddIntentStore>((set) => ({
  intent: null,
  request: (intent) => set({ intent }),
  consume: () => set({ intent: null }),
}));

export type PwaUpdateStore = {
  waitingWorker: ServiceWorker | null;
  setWaitingWorker: (worker: ServiceWorker | null) => void;
  applyUpdate: () => void;
};

const usePwaUpdateStore = create<PwaUpdateStore>((set, get) => ({
  waitingWorker: null,
  setWaitingWorker: (worker) => set({ waitingWorker: worker }),
  applyUpdate: () => {
    const waitingWorker = get().waitingWorker;
    if (!waitingWorker) return;

    // Only fires once the new worker actually takes control, which only
    // happens because of the postMessage below (asked for by the user).
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  },
}));

export {
  useAddIntentStore,
  useExpenseStore,
  usePwaInstallStore,
  usePwaUpdateStore,
  useUserSettingsStore,
};

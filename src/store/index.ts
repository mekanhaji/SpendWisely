import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  description: string;
};

export type ExpenseStore = {
  currentExpense: number;
  expenseRecords: ExpenseRecord[];
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
   * @param description
   * @param datetime - ISO string; defaults to now. Used to record expense on filter-selected day.
   * @returns
   */
  addExpense: (expense: number, description?: string, datetime?: string) => void;
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
  description: string,
  datetime?: string,
): ExpenseRecord => {
  return {
    datetime: datetime ?? new Date().toISOString(),
    amount,
    description,
  };
};

const useExpenseStore = create(
  persist<ExpenseStore>(
    (set, get) => ({
      currentExpense: 0,
      expenseRecords: [],
      setCurrentExpense: (expense) => set({ currentExpense: expense }),
      getExpenseRecord: (timestamp) =>
        get().expenseRecords.find((record) => record.datetime === timestamp),
      addExpense: (expense, description, datetime) =>
        set(() => {
          const expenseRecord = createExpenseRecord(
            expense,
            description || "Expense",
            datetime,
          );
          return {
            expenseRecords: [...get().expenseRecords, expenseRecord],
          };
        }),
      updateExpense: (timestamp, record) =>
        set((state) => {
          const index = state.expenseRecords.findIndex(
            (record) => record.datetime === timestamp,
          );
          if (index !== -1) {
            state.expenseRecords[index] = record;
          }
          return state;
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
      version: 1,
      migrate: (persisted, version) => {
        // TODO: this v0 -> v1 step only exists to rename `discretion` -> `description`
        // in old persisted data. Safe to delete once version 1 has shipped long
        // enough that no users are realistically still on pre-migration data.
        const state = persisted as Omit<ExpenseStore, "expenseRecords"> & {
          expenseRecords: (Partial<ExpenseRecord> & { discretion?: string })[];
        };
        if (version < 1) {
          state.expenseRecords = state.expenseRecords?.map(
            ({ discretion, ...rest }) => ({
              ...rest,
              description: discretion ?? "",
            }),
          );
        }
        return state as ExpenseStore;
      },
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
  useExpenseStore,
  usePwaInstallStore,
  usePwaUpdateStore,
  useUserSettingsStore,
};

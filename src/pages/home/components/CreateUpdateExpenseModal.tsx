import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  useExpenseStore,
  useUserSettingsStore,
  type AddExpenseIntent,
} from "@/store";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { haptic, requestPersistentStorage } from "@/lib/pwa";
import CategoryCombobox from "@/components/CategoryCombobox";
import CategorySuggestionChips from "@/components/CategorySuggestionChips";
import {
  buildCategoryProfile,
  rankCategorySuggestions,
} from "@/lib/category-suggestions";
import { UNCATEGORIZED_CATEGORY } from "@/lib/migrations/expense-migrations";
import {
  getFirstOfThisMonth,
  getMondayOfThisWeek,
  parseLocalISODate,
  type ExpenseFilter,
} from "./ExpenseRecordsFilter";

const expenseRecordForm = z.object({
  amount: z.string(),
  category: z.string(),
  notes: z.string().optional(),
});

type ExpenseRecordForm = z.infer<typeof expenseRecordForm>;

type CreateUpdateExpenseModalProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateId: string | null;
  setUpdateId: React.Dispatch<React.SetStateAction<string | null>>;
  filter: ExpenseFilter;
  /** Amount and note to start a new expense with (shortcut / share target). */
  prefill?: AddExpenseIntent | null;
  /** Whether the floating add button shows (hidden on the Settings tab). */
  showTrigger?: boolean;
};

const getCreateTargetDate = (filter: ExpenseFilter): Date => {
  const today = new Date();
  switch (filter.mode) {
    case "yesterday": {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      return y;
    }
    case "custom": {
      // Single past day (from == to) or range -> use `to` so the new
      // record is visible inside the selected range.
      const to = filter.to ? parseLocalISODate(filter.to) : null;
      if (to) return to;
      const from = filter.from ? parseLocalISODate(filter.from) : null;
      if (from) return from;
      return today;
    }
    case "all":
    case "today":
    case "week":
    case "month":
    default:
      return today;
  }
};

const formatShortDate = (d: Date): string =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const getCreateTitle = (filter: ExpenseFilter): string => {
  switch (filter.mode) {
    case "today":
    case "all":
      return "How much did you spend this time?";
    case "yesterday":
      return "Forgot to record yesterday's spend?";
    case "week":
      return "Add to this week's spends?";
    case "month":
      return "Add to this month's spends?";
    case "custom": {
      if (filter.from && filter.to && filter.from === filter.to) {
        const d = parseLocalISODate(filter.to);
        if (d) return `Forgot to record ${formatShortDate(d)}'s spend?`;
      }
      if (filter.from && filter.to) return "Add spend to this range?";
      return "How much did you spend this time?";
    }
  }
};

const getCreateDescription = (filter: ExpenseFilter): string => {
  const today = new Date();
  switch (filter.mode) {
    case "today":
      return `Today • ${today.toLocaleDateString("en-IN")}`;
    case "yesterday": {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      return `Yesterday • ${y.toLocaleDateString("en-IN")}`;
    }
    case "all":
      return "All Spends";
    case "week": {
      const monday = getMondayOfThisWeek(today);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `This Week • ${formatShortDate(monday)} - ${formatShortDate(sunday)}`;
    }
    case "month": {
      const first = getFirstOfThisMonth(today);
      return `This Month • ${first.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
    }
    case "custom": {
      if (filter.from && filter.to && filter.from === filter.to) {
        const d = parseLocalISODate(filter.to);
        if (d) return `${d.toLocaleDateString("en-IN")}`;
      }
      if (filter.from && filter.to) {
        const from = parseLocalISODate(filter.from);
        const to = parseLocalISODate(filter.to);
        if (from && to)
          return `${from.toLocaleDateString("en-IN")} - ${to.toLocaleDateString("en-IN")}`;
      }
      return "Custom range";
    }
  }
};

const buildDatetimeForFilter = (filter: ExpenseFilter): string => {
  const now = new Date();
  const base = getCreateTargetDate(filter);
  base.setHours(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  return base.toISOString();
};

const CreateUpdateExpenseModal = (props: CreateUpdateExpenseModalProps) => {
  const {
    isDialogOpen,
    setIsDialogOpen,
    setUpdateId,
    updateId,
    filter,
    prefill,
    showTrigger = true,
  } = props;
  const {
    addExpense,
    updateExpense,
    getExpenseRecord,
    categories,
    addCategory,
    expenseRecords,
  } = useExpenseStore();
  const currency = useUserSettingsStore((state) => state.currency);
  const deleteExpense = useDeleteExpense();
  const [showNotes, setShowNotes] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [frozenAmount, setFrozenAmount] = useState<string | null>(null);
  const [suggestionNow, setSuggestionNow] = useState(() => new Date());

  const form = useForm<ExpenseRecordForm>({
    resolver: zodResolver(expenseRecordForm),
  });

  const category = form.watch("category") ?? "";
  const amount = form.watch("amount") ?? "";

  // Rank after a pause instead of on every keystroke, so the chips do not
  // flicker while the amount is being typed.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedAmount(amount), 250);
    return () => window.clearTimeout(timer);
  }, [amount]);

  const currentAmount = Number(amount);
  const hasValidAmount = Number.isFinite(currentAmount) && currentAmount > 0;

  const rankingAmount = frozenAmount ?? debouncedAmount;
  const parsedRankingAmount = Number(rankingAmount);
  const suggestionAmount =
    Number.isFinite(parsedRankingAmount) && parsedRankingAmount > 0
      ? parsedRankingAmount
      : undefined;

  // Refresh the clock each time the dialog opens so decay and time-of-day
  // weights are not frozen from a session that has been idle for hours.
  useEffect(() => {
    if (isDialogOpen) setSuggestionNow(new Date());
  }, [isDialogOpen]);

  const categoryProfile = useMemo(
    () => buildCategoryProfile(expenseRecords, categories, suggestionNow),
    [expenseRecords, categories, suggestionNow],
  );

  const suggestions = useMemo(
    () =>
      rankCategorySuggestions(categoryProfile, {
        now: suggestionNow,
        amount: suggestionAmount,
      }),
    [categoryProfile, suggestionAmount, suggestionNow],
  );

  useEffect(() => {
    if (!isDialogOpen) return;
    setFrozenAmount(null);

    if (updateId) {
      const record = getExpenseRecord(updateId);
      if (record) {
        form.setValue("amount", String(record.amount));
        form.setValue("category", record.category);
        form.setValue("notes", record.notes);
        setDebouncedAmount(String(record.amount));
        setShowNotes(Boolean(record.notes));
      } else {
        setUpdateId(null);
      }
    } else {
      form.reset();
      setDebouncedAmount("");
      setShowNotes(false);

      if (prefill?.amount) {
        form.setValue("amount", prefill.amount);
        setDebouncedAmount(prefill.amount);
      }
      if (prefill?.notes) {
        form.setValue("notes", prefill.notes);
        setShowNotes(true);
      }
    }
  }, [updateId, isDialogOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setUpdateId(null);
      setShowNotes(false);
      form.reset();
    }
  };

  const persistExpense = (data: ExpenseRecordForm): boolean => {
    try {
      expenseRecordForm.parse(data);

      const resolvedCategory =
        data.category?.trim() || UNCATEGORIZED_CATEGORY;
      const notes = data.notes?.trim() ?? "";

      // Whatever the user typed becomes a category they can pick next time.
      addCategory(resolvedCategory);

      if (updateId) {
        updateExpense(updateId, {
          datetime: updateId,
          amount: Number(data.amount),
          category: resolvedCategory,
          notes,
        });
        setUpdateId(null);
      } else {
        // Expenses only live in this browser's storage, so ask it to keep
        // them once there is something worth keeping.
        if (expenseRecords.length === 0) void requestPersistentStorage();

        addExpense(
          Number(data.amount),
          resolvedCategory,
          notes,
          buildDatetimeForFilter(filter)
        );
      }
      haptic(10);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const closeAfterSave = () => {
    form.reset();
    setShowNotes(false);
    setIsDialogOpen(false);
  };

  const onSubmit = form.handleSubmit((data) => {
    if (!persistExpense(data)) return;
    closeAfterSave();
  });

  const handleSuggestionPick = (nextCategory: string) => {
    form.setValue("category", nextCategory, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // Editing an existing record still goes through the explicit save button.
    if (updateId) return;

    if (!hasValidAmount) {
      form.setFocus("amount");
      return;
    }

    if (!persistExpense({ ...form.getValues(), category: nextCategory })) {
      return;
    }
    closeAfterSave();
  };

  const handleDelete = () => {
    if (!updateId) return;
    const record = getExpenseRecord(updateId);
    if (record) deleteExpense(record);
    setUpdateId(null);
    closeAfterSave();
  };

  return (
    <Drawer open={isDialogOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        // Docked above the tab bar, on the thumb side, inside the app column.
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[625px] justify-end px-4">
          <DrawerTrigger
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-float transition duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            title="Add Expense"
            aria-label="Add expense"
            onClick={() => {
              setUpdateId(null);
              setShowNotes(false);
              setFrozenAmount(null);
              setDebouncedAmount("");
              form.reset();
            }}
          >
            <Plus className="h-7 w-7" />
          </DrawerTrigger>
        </div>
      )}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {updateId ? "Update your expense" : getCreateTitle(filter)}
          </DrawerTitle>
          <DrawerDescription>
            {updateId ? (
              "Edit the details of your spending"
            ) : (
              <>
                Recording expense for{" "}
                <span className="font-medium text-foreground">
                  {getCreateDescription(filter)}
                </span>
              </>
            )}
          </DrawerDescription>
        </DrawerHeader>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col items-center gap-1 py-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-muted-foreground"
            >
              Amount
            </label>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-semibold text-muted-foreground">
                {currency}
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                enterKeyHint="done"
                step="any"
                min="0"
                autoComplete="off"
                autoFocus
                placeholder="0"
                {...form.register("amount")}
                // Digits are tabular, so 1ch is one digit wide: the field
                // hugs what is typed and the currency stays next to it.
                style={{ width: `${Math.max(amount.length, 1) + 1}ch` }}
                className="max-w-[70vw] bg-transparent text-left text-5xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <CategorySuggestionChips
            suggestions={suggestions}
            selectedCategory={category}
            canRecord={hasValidAmount}
            recordsOnTap={!updateId}
            onPick={handleSuggestionPick}
            onInteractionStart={() => setFrozenAmount(debouncedAmount)}
            onInteractionEnd={() => setFrozenAmount(null)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <CategoryCombobox
              id="category"
              value={category}
              onChange={(next) =>
                form.setValue("category", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onCreate={addCategory}
              categories={categories}
              placeholder="e.g. Food"
            />
          </div>

          {showNotes ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="notes" className="text-sm font-medium">
                  Note
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowNotes(false);
                    form.setValue("notes", "");
                  }}
                >
                  <X className="h-3 w-3" />
                  Remove note
                </button>
              </div>
              <Input
                id="notes"
                type="text"
                {...form.register("notes")}
                placeholder="e.g. Lunch with the team"
              />
            </div>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowNotes(true);
                // After the field renders. Not autoFocus, which would also
                // steal focus from the amount when a share pre-fills a note.
                window.setTimeout(() => form.setFocus("notes"), 0);
              }}
            >
              <Plus className="h-4 w-4" />
              Add note
            </button>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" size="lg" disabled={!hasValidAmount}>
              {updateId ? "Save changes" : "Record Expense"}
            </Button>
            {updateId && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete expense
              </Button>
            )}
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateUpdateExpenseModal;

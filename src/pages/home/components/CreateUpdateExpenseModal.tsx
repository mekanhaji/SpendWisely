import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExpenseStore } from "@/store";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import CategoryCombobox from "@/components/CategoryCombobox";
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
  const { isDialogOpen, setIsDialogOpen, setUpdateId, updateId, filter } =
    props;
  const { addExpense, updateExpense, getExpenseRecord, categories, addCategory } =
    useExpenseStore();
  const [showNotes, setShowNotes] = useState(false);

  const form = useForm<ExpenseRecordForm>({
    resolver: zodResolver(expenseRecordForm),
  });

  const category = form.watch("category") ?? "";

  useEffect(() => {
    if (updateId && isDialogOpen) {
      const record = getExpenseRecord(updateId);
      if (record) {
        form.setValue("amount", String(record.amount));
        form.setValue("category", record.category);
        form.setValue("notes", record.notes);
        setShowNotes(Boolean(record.notes));
      } else {
        setUpdateId(null);
      }
    } else if (!updateId && isDialogOpen) {
      form.reset();
      setShowNotes(false);
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

  const onSubmit = form.handleSubmit(async (data) => {
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
        addExpense(
          Number(data.amount),
          resolvedCategory,
          notes,
          buildDatetimeForFilter(filter)
        );
      }
      form.reset();
      setShowNotes(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="p-4 rounded-full bg-primary text-primary-foreground flex gap-1 items-center w-fit fixed bottom-8 left-1/2 transform -translate-x-1/2"
        title="Add Expense"
        onClick={() => {
          setUpdateId(null);
          setShowNotes(false);
          form.reset();
        }}
      >
        <Plus className="h-6 w-6" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {updateId ? "Update your expense" : getCreateTitle(filter)}
          </DialogTitle>
          <DialogDescription>
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
          </DialogDescription>
          <form className="flex flex-col items-center" onSubmit={onSubmit}>
            <div className="flex flex-col w-full">
              <label htmlFor="amount">Amount</label>
              <Input
                type="number"
                {...form.register("amount")}
                placeholder={"e.g. 10"}
                className="p-2 my-2 border border-input rounded-md"
              />
              {form.formState.errors.amount && (
                <p className="text-app-error-500 text-sm">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="category">Category</label>
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

            <div className="flex flex-col w-full">
              {showNotes ? (
                <>
                  <div className="flex items-center justify-between">
                    <label htmlFor="notes">Note</label>
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
                    className="p-2 my-2 border border-input rounded-md"
                    autoFocus
                  />
                </>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-1 self-start my-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNotes(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add note
                </button>
              )}
            </div>

            <button className="p-2 mt-4 rounded-lg bg-primary text-primary-foreground w-full text-center">
              Record Expense
            </button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdateExpenseModal;

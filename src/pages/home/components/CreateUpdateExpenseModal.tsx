import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExpenseStore } from "@/store";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import type { DaysListItem } from "./ExpenseRecordsFilter";

const expenseRecordForm = z.object({
  amount: z.string(),
  discretion: z.string().optional(),
});

type ExpenseRecordForm = z.infer<typeof expenseRecordForm>;

type CreateUpdateExpenseModalProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateId: string | null;
  setUpdateId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedDate: DaysListItem;
};

const getCreateTitle = (selected: DaysListItem): string => {
  if (selected.label === "Today") return "How much did you spend this time?";
  if (selected.label === "Yesterday")
    return "Forgot to record yesterday's spend?";
  const day = selected.label.charAt(0).toLowerCase() + selected.label.slice(1);
  return `Forgot to record ${day}'s spend?`;
};

const buildDatetimeForSelectedDay = (selected: DaysListItem): string => {
  const now = new Date();
  const base = new Date(selected.date);
  base.setHours(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  return base.toISOString();
};

const CreateUpdateExpenseModal = (props: CreateUpdateExpenseModalProps) => {
  const { isDialogOpen, setIsDialogOpen, setUpdateId, updateId, selectedDate } =
    props;
  const { addExpense, updateExpense, getExpenseRecord } = useExpenseStore();

  const form = useForm<ExpenseRecordForm>({
    resolver: zodResolver(expenseRecordForm),
  });

  useEffect(() => {
    if (updateId && isDialogOpen) {
      const record = getExpenseRecord(updateId);
      if (record) {
        form.setValue("amount", String(record.amount));
        form.setValue("discretion", record.discretion);
      } else {
        setUpdateId(null);
      }
    } else if (!updateId && isDialogOpen) {
      form.reset();
    }
  }, [updateId, isDialogOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setUpdateId(null);
      form.reset();
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      expenseRecordForm.parse(data);
      if (updateId) {
        updateExpense(updateId, {
          datetime: updateId,
          amount: Number(data.amount),
          discretion: String(data.discretion),
        });
        setUpdateId(null);
      } else {
        addExpense(
          Number(data.amount),
          data.discretion,
          buildDatetimeForSelectedDay(selectedDate)
        );
      }
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="p-4 rounded-full bg-app-500 text-white flex gap-1 items-center w-fit fixed bottom-8 left-1/2 transform -translate-x-1/2"
        title="Add Expense"
        onClick={() => {
          setUpdateId(null);
          form.reset();
        }}
      >
        <Plus className="h-6 w-6" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {updateId ? "Update your expense" : getCreateTitle(selectedDate)}
          </DialogTitle>
          <DialogDescription>
            {updateId ? (
              "Edit the details of your spending"
            ) : (
              <>
                Recording expense for{" "}
                <span className="font-medium text-foreground">
                  {selectedDate.label} • {selectedDate.value}
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
                className="p-2 my-2 border border-gray-300 rounded-md"
              />
              {form.formState.errors.amount && (
                <p className="text-app-error-500 text-sm">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="discretion">Description</label>
              <Input
                type="text"
                {...form.register("discretion")}
                placeholder={"e.g. Lunch"}
                className="p-2 my-2 border border-gray-300 rounded-md"
              />
              {form.formState.errors.amount && (
                <p className="text-app-error-500 text-sm">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <button className="p-2 mt-4 rounded-lg bg-app-500 text-white w-full text-center">
              Record Expense
            </button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdateExpenseModal;

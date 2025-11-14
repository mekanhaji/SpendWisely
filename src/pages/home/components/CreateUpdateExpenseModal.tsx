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
};

const CreateUpdateExpenseModal = (props: CreateUpdateExpenseModalProps) => {
  const { isDialogOpen, setIsDialogOpen, setUpdateId, updateId } = props;
  const { addExpense, updateExpense, getExpenseRecord } = useExpenseStore();

  const form = useForm<ExpenseRecordForm>({
    resolver: zodResolver(expenseRecordForm),
  });

  useEffect(() => {
    if (updateId) {
      const record = getExpenseRecord(updateId);
      if (record) {
        form.setValue("amount", String(record.amount));
        form.setValue("discretion", record.discretion);
      } else {
        setUpdateId(null);
      }
    }
  }, [updateId]);

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
        addExpense(Number(data.amount), data.discretion);
      }
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger
        className="p-4 rounded-full bg-app-500 text-white flex gap-1 items-center w-fit fixed bottom-8 left-1/2 transform -translate-x-1/2"
        title="Add Expense"
      >
        <Plus className="h-6 w-6" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How much did you spend this time?</DialogTitle>
          <DialogDescription>
            Enter the details of your spending
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

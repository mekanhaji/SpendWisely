import ItemCardLayout from "@/layout/ItemCardLayout";
import type { ExpenseRecord } from "@/store";
import { Pencil, Trash2 } from "lucide-react";

type TopExpensesListProps = {
  expenses: ExpenseRecord[];
  currency: string;
  onEdit: (datetime: string) => void;
  onDelete: (datetime: string) => void;
};

const formatDateTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const TopExpensesList = ({
  expenses,
  currency,
  onEdit,
  onDelete,
}: TopExpensesListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-app-100 dark:bg-app-800 rounded-lg p-3 w-full">
        <p className="text-sm text-muted-foreground text-center">
          No expenses yet in this period
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {expenses.map((record, index) => (
        <ItemCardLayout key={record.datetime} className="w-full">
          <div className="flex flex-col justify-between">
            <div className="flex gap-3 items-center">
              <span className="text-muted-foreground font-bold">
                {index + 1}.
              </span>
              <h2 className="text-xl">{record.description}</h2>
              <div className="flex gap-3">
                <Pencil
                  className="h-4 w-4 text-app-700 cursor-pointer"
                  onClick={() => onEdit(record.datetime)}
                />
                <Trash2
                  className="h-4 w-4 text-app-error-700 cursor-pointer"
                  onClick={() => onDelete(record.datetime)}
                />
              </div>
            </div>
            <span className="uppercase text-sm text-muted-foreground">
              {formatDateTime(record.datetime)}
            </span>
          </div>
          <h1 className="text-3xl">
            {currency}
            {record.amount}
          </h1>
        </ItemCardLayout>
      ))}
    </div>
  );
};

export default TopExpensesList;

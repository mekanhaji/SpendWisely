import ItemCardLayout from "@/layout/ItemCardLayout";
import { useExpenseStore, useUserSettingsStore } from "@/store";
import { Clock12Icon, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { matchesFilter, type ExpenseFilter } from "@/lib/expense-filter";
import ExpenseRecordsFilter from "./ExpenseRecordsFilter";

const formatTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
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

type ExpenseRecordsListProps = {
  setIsDialogOpen: (isOpen: boolean) => void;
  setUpdateId: (id: string | null) => void;
  updateId: string | null;
  filter: ExpenseFilter;
  setFilter: (filter: ExpenseFilter) => void;
};

const ExpenseRecordsList = (props: ExpenseRecordsListProps) => {
  const { setIsDialogOpen, setUpdateId, updateId, filter, setFilter } = props;
  const { expenseRecords, removeExpense, setCurrentExpense } = useExpenseStore();
  const currency = useUserSettingsStore((state) => state.currency);

  const showDate =
    filter.mode === "all" ||
    filter.mode === "week" ||
    filter.mode === "month" ||
    filter.mode === "custom";

  const expenseRecordsMemoized = useMemo(() => {
    const filtered = expenseRecords.filter((record) =>
      matchesFilter(record.datetime, filter)
    ).reverse();

    // update the current expense
    setCurrentExpense(
      filtered.reduce((acc, record) => acc + record.amount, 0)
    );

    return filtered;
  }, [expenseRecords, updateId, filter]);

  return (
    <>
      <ExpenseRecordsFilter filter={filter} setFilter={setFilter} />
      {expenseRecordsMemoized.map((record) => (
        <ItemCardLayout key={record.datetime} className="w-full">
          <div className="flex flex-col justify-between">
            <div className="flex gap-5 items-center">
              <h2 className="text-2xl">{record.description}</h2>
              <div className="flex gap-3">
                <Pencil
                  className="h-4 w-4 text-app-700 cursor-pointer"
                  onClick={() => {
                    setUpdateId(record.datetime);
                    setIsDialogOpen(true);
                  }}
                />
                <Trash2
                  className="h-4 w-4 text-app-error-700 cursor-pointer"
                  onClick={() => removeExpense(record.datetime)}
                />
              </div>
            </div>
            <span className="flex items-center gap-2 uppercase">
              <Clock12Icon className="h-4 w-4" />{" "}
              {showDate ? formatDateTime(record.datetime) : formatTime(record.datetime)}
            </span>
          </div>
          <h1 className="text-4xl">
            {currency}
            {record.amount}
          </h1>
        </ItemCardLayout>
      ))}
    </>
  );
};

export default ExpenseRecordsList;

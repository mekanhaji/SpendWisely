import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseRow from "@/components/ExpenseRow";
import SwipeableRow from "@/components/SwipeableRow";
import type { ExpenseRecord } from "@/store";

type TopExpensesListProps = {
  expenses: ExpenseRecord[];
  currency: string;
  onEdit: (datetime: string) => void;
  onDelete: (record: ExpenseRecord) => void;
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
      <Card className="w-full p-4">
        <p className="text-center text-sm text-muted-foreground">
          No expenses yet in this period
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Top expenses</CardTitle>
      </CardHeader>
      <div className="divide-y border-t">
        {expenses.map((record, index) => (
          <SwipeableRow
            key={record.datetime}
            onSwipeDelete={() => onDelete(record)}
          >
            <ExpenseRow
              record={record}
              currency={currency}
              meta={formatDateTime(record.datetime)}
              rank={index + 1}
              onEdit={() => onEdit(record.datetime)}
            />
          </SwipeableRow>
        ))}
      </div>
    </Card>
  );
};

export default TopExpensesList;

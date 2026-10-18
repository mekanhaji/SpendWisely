import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useExpenseStore, useUserSettingsStore } from "@/store";
import { getDayBudgetStatus, percentageOfLimit } from "@/lib/expense-analytics";

const ExpenseProgressHeader = () => {
  const { currentExpense: expense } = useExpenseStore();
  const { currency, dailyLimit, warningLimit } = useUserSettingsStore();
  const status = getDayBudgetStatus(expense, dailyLimit, warningLimit);

  return (
    <div
      className={cn("flex flex-col gap-2 p-2 rounded-lg w-full", {
        "bg-app-error-100 dark:bg-app-error-800": status === "over",
        "bg-app-warning-100 dark:bg-app-warning-800": status === "warning",
        "bg-app-100 dark:bg-app-800": status === "ok",
      })}
    >
      <Progress
        value={percentageOfLimit(expense, dailyLimit)}
        className={cn({
          "[&>div]:bg-app-error-500": status === "over",
          "[&>div]:bg-app-warning-500": status === "warning",
          "[&>div]:bg-app-500": status === "ok",
        })}
      />

      <h1
        className={cn("text-center text-2xl", {
          "text-app-error-500": status === "over",
          "text-app-warning-500": status === "warning",
        })}
      >
        {currency} {expense} / {dailyLimit}
      </h1>
    </div>
  );
};

export default ExpenseProgressHeader;

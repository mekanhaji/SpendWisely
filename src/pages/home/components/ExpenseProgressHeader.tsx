import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useExpenseStore, useUserSettingsStore } from "@/store";
import {
  getDailyTotals,
  getDayBudgetStatus,
  percentageOfLimit,
} from "@/lib/expense-analytics";
import type { ExpenseFilter } from "@/lib/expense-filter";

/** Today/Yesterday presets and a custom From = To pick cover exactly one day. */
const isSingleDayFilter = (filter: ExpenseFilter): boolean =>
  filter.mode === "today" ||
  filter.mode === "yesterday" ||
  (filter.mode === "custom" &&
    Boolean(filter.from) &&
    filter.from === filter.to);

/**
 * Budget header scoped to the active filter. Single days keep the
 * spent-vs-limit read; a multi-day range compares the average day against the
 * daily limit (same calendar-day math the Analytics "Average / day" tile uses,
 * zero-spend days included) and surfaces the range total below.
 */
const ExpenseProgressHeader = ({ filter }: { filter: ExpenseFilter }) => {
  const { expenseRecords } = useExpenseStore();
  const { currency, dailyLimit, warningLimit } = useUserSettingsStore();

  // One bucket per day in the range (zeroes included), totals precomputed.
  const dailyTotals = useMemo(
    () => getDailyTotals(expenseRecords, filter),
    [expenseRecords, filter],
  );

  const singleDay = isSingleDayFilter(filter);
  const total = dailyTotals.reduce((sum, day) => sum + day.total, 0);
  const dayCount = dailyTotals.length;
  /** Days a self-respecting average divides by; single days budget as 1. */
  const averagePerDay = dayCount ? total / dayCount : 0;
  const tracked = singleDay ? total : Math.round(averagePerDay);
  const status = getDayBudgetStatus(tracked, dailyLimit, warningLimit);

  return (
    <div
      className={cn("flex flex-col gap-2 p-2 rounded-lg w-full", {
        "bg-app-error-100 dark:bg-app-error-800": status === "over",
        "bg-app-warning-100 dark:bg-app-warning-800": status === "warning",
        "bg-app-100 dark:bg-app-800": status === "ok",
      })}
    >
      <Progress
        value={percentageOfLimit(tracked, dailyLimit)}
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
        {currency} {tracked} / {dailyLimit}
        {singleDay ? null : (
          <span className="text-sm font-medium text-muted-foreground">
            {" "}
            avg/day
          </span>
        )}
      </h1>

      {singleDay ? null : (
        <p className="text-center text-sm text-muted-foreground">
          Total spent {currency}
          {total} across {dayCount} {dayCount === 1 ? "day" : "days"}
        </p>
      )}
    </div>
  );
};

export default ExpenseProgressHeader;

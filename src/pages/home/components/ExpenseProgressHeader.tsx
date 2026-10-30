import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useExpenseStore, useUserSettingsStore } from "@/store";
import {
  getDailyTotals,
  getDayBudgetStatus,
  getFilteredRecords,
  percentageOfLimit,
} from "@/lib/expense-analytics";
import {
  describeFilter,
  isSingleDayFilter,
  type ExpenseFilter,
} from "@/lib/expense-filter";

/**
 * Budget hero scoped to the active filter. Single days show what is left of
 * the daily limit (or how far over it you are). A multi-day range compares the
 * average day against the daily limit (same calendar-day math the Analytics
 * "Average / day" tile uses, zero-spend days included) and surfaces the range
 * total underneath.
 */
const ExpenseProgressHeader = ({ filter }: { filter: ExpenseFilter }) => {
  const { expenseRecords } = useExpenseStore();
  const { currency, dailyLimit, warningLimit } = useUserSettingsStore();

  // One bucket per day in the range (zeroes included), totals precomputed.
  const dailyTotals = useMemo(
    () => getDailyTotals(expenseRecords, filter),
    [expenseRecords, filter],
  );
  const expenseCount = useMemo(
    () => getFilteredRecords(expenseRecords, filter).length,
    [expenseRecords, filter],
  );

  const singleDay = isSingleDayFilter(filter);
  const total = dailyTotals.reduce((sum, day) => sum + day.total, 0);
  const dayCount = dailyTotals.length;
  /** Days a self-respecting average divides by; single days budget as 1. */
  const averagePerDay = dayCount ? total / dayCount : 0;
  const tracked = singleDay ? total : Math.round(averagePerDay);
  const status = getDayBudgetStatus(tracked, dailyLimit, warningLimit);
  const hasLimit = dailyLimit > 0;

  // Single day: what is left (or over). Multi-day: the average itself.
  const headline = singleDay && hasLimit ? Math.abs(dailyLimit - tracked) : tracked;
  const caption = !hasLimit
    ? singleDay
      ? "spent"
      : "average per day"
    : singleDay
      ? tracked > dailyLimit
        ? `over your ${currency}${dailyLimit} limit`
        : `left of ${currency}${dailyLimit}`
      : `average per day · limit ${currency}${dailyLimit}`;

  const details = [
    hasLimit && singleDay
      ? `${Math.round(percentageOfLimit(tracked, dailyLimit))}% used`
      : null,
    singleDay ? null : `${currency}${total} over ${dayCount} ${dayCount === 1 ? "day" : "days"}`,
    `${expenseCount} ${expenseCount === 1 ? "expense" : "expenses"}`,
  ].filter(Boolean);

  return (
    <Card
      className={cn("w-full border-transparent p-5", {
        "bg-app-error-100 dark:bg-app-error-800": status === "over",
        "bg-app-warning-100 dark:bg-app-warning-800": status === "warning",
        "bg-app-100 dark:bg-app-800": status === "ok",
      })}
    >
      <p className="text-sm font-medium text-muted-foreground">
        {describeFilter(filter)}
      </p>

      <p
        className={cn(
          "mt-1 text-4xl font-semibold tracking-tight tabular-nums",
          {
            "text-app-error-500": status === "over",
            "text-app-warning-500": status === "warning",
          },
        )}
      >
        {currency}
        {headline}
      </p>
      <p className="text-sm text-muted-foreground">{caption}</p>

      {hasLimit && (
        <Progress
          value={percentageOfLimit(tracked, dailyLimit)}
          aria-label="Share of the daily limit used"
          className={cn("mt-4 h-2.5 bg-foreground/10", {
            "[&>div]:bg-app-error-500": status === "over",
            "[&>div]:bg-app-warning-500": status === "warning",
            "[&>div]:bg-app-500": status === "ok",
          })}
        />
      )}

      <p className="mt-3 text-sm tabular-nums text-muted-foreground">
        {details.join(" · ")}
      </p>
    </Card>
  );
};

export default ExpenseProgressHeader;

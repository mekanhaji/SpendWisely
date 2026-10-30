import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { parseLocalISODate } from "@/lib/expense-filter";
import type { DayBudgetComparison } from "@/lib/expense-analytics";

type BudgetComparisonCardProps = {
  dailyTotals: DayBudgetComparison[];
  dailyLimit: number;
  currency: string;
};

const PER_DAY_ROW_LIMIT = 10;

const formatShortDate = (iso: string): string => {
  const d = parseLocalISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const statusBarClass = (status: DayBudgetComparison["status"]) =>
  cn("h-2 bg-foreground/10", {
    "[&>div]:bg-app-error-500": status === "over",
    "[&>div]:bg-app-warning-500": status === "warning",
    "[&>div]:bg-app-500": status === "ok",
  });

const statusTextClass = (status: DayBudgetComparison["status"]) =>
  cn("tabular-nums", {
    "font-medium text-app-error-500": status === "over",
    "font-medium text-app-warning-500": status === "warning",
  });

const BudgetComparisonCard = ({
  dailyTotals,
  dailyLimit,
  currency,
}: BudgetComparisonCardProps) => {
  if (dailyLimit <= 0) {
    return (
      <Card className="w-full p-4">
        <p className="text-sm text-muted-foreground">
          Set a daily limit in Settings to see budget comparison.
        </p>
      </Card>
    );
  }

  if (dailyTotals.length <= PER_DAY_ROW_LIMIT) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Budget by day</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {dailyTotals.map((day) => (
            <div key={day.date} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span>{formatShortDate(day.date)}</span>
                <span className={statusTextClass(day.status)}>
                  {currency}
                  {day.total} / {dailyLimit}
                </span>
              </div>
              <Progress
                value={day.percentage}
                className={statusBarClass(day.status)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = dailyTotals.reduce((sum, d) => sum + d.total, 0);
  const periodLimit = dailyLimit * dailyTotals.length;
  const overCount = dailyTotals.filter((d) => d.status === "over").length;
  const warningCount = dailyTotals.filter((d) => d.status === "warning").length;
  const aggregateStatus =
    total >= periodLimit ? "over" : overCount > 0 ? "warning" : "ok";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Period budget</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent of limit</span>
          <span className={statusTextClass(aggregateStatus)}>
            {currency}
            {total} / {periodLimit}
          </span>
        </div>
        <Progress
          value={Math.min((total / periodLimit) * 100, 100)}
          className={statusBarClass(aggregateStatus)}
        />
        <p className="text-sm text-muted-foreground">
          {overCount} of {dailyTotals.length} days over budget, {warningCount}{" "}
          in warning range
        </p>
      </CardContent>
    </Card>
  );
};

export default BudgetComparisonCard;

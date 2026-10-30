import "@/lib/chart-setup";
import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useExpenseStore, useToastStore, useUserSettingsStore } from "@/store";
import ExpenseRecordsFilter from "./components/ExpenseRecordsFilter";
import { describeFilter, type ExpenseFilter } from "@/lib/expense-filter";
import { shareText } from "@/lib/pwa";
import {
  getBudgetComparison,
  getCategoryTotals,
  getDailyTotals,
  getFilteredRecords,
  getSummaryStats,
  getTopExpenses,
} from "@/lib/expense-analytics";
import AnalyticsSummaryStats from "./components/analytics/AnalyticsSummaryStats";
import SpendingTrendChart from "./components/analytics/SpendingTrendChart";
import CategoryBreakdownCard from "./components/analytics/CategoryBreakdownCard";
import BudgetComparisonCard from "./components/analytics/BudgetComparisonCard";
import TopExpensesList from "./components/analytics/TopExpensesList";

type AnalyticsProps = {
  setIsDialogOpen: (isOpen: boolean) => void;
  setUpdateId: (id: string | null) => void;
  updateId: string | null;
};

const ANALYTICS_FILTER_MODES: ExpenseFilter["mode"][] = [
  "today",
  "yesterday",
  "week",
  "month",
];

const Analytics = (props: AnalyticsProps) => {
  const { setIsDialogOpen, setUpdateId } = props;
  const expenseRecords = useExpenseStore((state) => state.expenseRecords);
  const deleteExpense = useDeleteExpense();
  const showToast = useToastStore((state) => state.show);
  const { currency, dailyLimit, warningLimit } = useUserSettingsStore();
  const [filter, setFilter] = useState<ExpenseFilter>({ mode: "today" });

  const filteredRecords = useMemo(
    () => getFilteredRecords(expenseRecords, filter),
    [expenseRecords, filter],
  );

  const dailyTotals = useMemo(
    () => getDailyTotals(expenseRecords, filter),
    [expenseRecords, filter],
  );

  const summaryStats = useMemo(
    () => getSummaryStats(dailyTotals, filteredRecords),
    [dailyTotals, filteredRecords],
  );

  const categoryTotals = useMemo(
    () => getCategoryTotals(filteredRecords),
    [filteredRecords],
  );

  const topExpenses = useMemo(
    () => getTopExpenses(filteredRecords),
    [filteredRecords],
  );

  const budgetComparison = useMemo(
    () => getBudgetComparison(dailyTotals, dailyLimit, warningLimit),
    [dailyTotals, dailyLimit, warningLimit],
  );

  const handleShare = async () => {
    const lines = [
      `Spend Wisely: ${describeFilter(filter)}`,
      `Spent ${currency}${summaryStats.total} across ${dailyTotals.length} ${dailyTotals.length === 1 ? "day" : "days"} (avg ${currency}${summaryStats.averagePerDay.toFixed(0)}/day)`,
      categoryTotals[0]
        ? `Top category: ${categoryTotals[0].category} ${currency}${categoryTotals[0].total}`
        : null,
      `${summaryStats.transactionCount} ${summaryStats.transactionCount === 1 ? "expense" : "expenses"}`,
    ].filter(Boolean);

    const result = await shareText(lines.join("\n"), "Spend Wisely summary");
    if (result === "copied") showToast({ message: "Summary copied" });
    if (result === "failed") showToast({ message: "Could not share the summary" });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <ExpenseRecordsFilter
        filter={filter}
        setFilter={setFilter}
        modes={ANALYTICS_FILTER_MODES}
      />

      <div className="-mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{describeFilter(filter)}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2"
          disabled={summaryStats.transactionCount === 0}
          onClick={() => void handleShare()}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <AnalyticsSummaryStats stats={summaryStats} currency={currency} />

      <SpendingTrendChart
        dailyTotals={dailyTotals}
        dailyLimit={dailyLimit}
        currency={currency}
      />

      <CategoryBreakdownCard categories={categoryTotals} currency={currency} />

      <BudgetComparisonCard
        dailyTotals={budgetComparison}
        dailyLimit={dailyLimit}
        currency={currency}
      />

      <TopExpensesList
        expenses={topExpenses}
        currency={currency}
        onEdit={(datetime) => {
          setUpdateId(datetime);
          setIsDialogOpen(true);
        }}
        onDelete={deleteExpense}
      />
    </div>
  );
};

export default Analytics;

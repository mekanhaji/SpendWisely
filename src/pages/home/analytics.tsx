import "@/lib/chart-setup";
import { useMemo, useState } from "react";
import { useExpenseStore, useUserSettingsStore } from "@/store";
import ExpenseRecordsFilter from "./components/ExpenseRecordsFilter";
import type { ExpenseFilter } from "@/lib/expense-filter";
import {
  getBudgetComparison,
  getDailyTotals,
  getFilteredRecords,
  getSummaryStats,
  getTopExpenses,
} from "@/lib/expense-analytics";
import AnalyticsSummaryStats from "./components/analytics/AnalyticsSummaryStats";
import SpendingTrendChart from "./components/analytics/SpendingTrendChart";
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
  const { expenseRecords, removeExpense } = useExpenseStore();
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

  const topExpenses = useMemo(
    () => getTopExpenses(filteredRecords),
    [filteredRecords],
  );

  const budgetComparison = useMemo(
    () => getBudgetComparison(dailyTotals, dailyLimit, warningLimit),
    [dailyTotals, dailyLimit, warningLimit],
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <ExpenseRecordsFilter
        filter={filter}
        setFilter={setFilter}
        modes={ANALYTICS_FILTER_MODES}
      />

      <AnalyticsSummaryStats stats={summaryStats} currency={currency} />

      <SpendingTrendChart dailyTotals={dailyTotals} dailyLimit={dailyLimit} />

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
        onDelete={removeExpense}
      />
    </div>
  );
};

export default Analytics;

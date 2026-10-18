import { Chart } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { parseLocalISODate } from "@/lib/expense-filter";
import type { DailyTotal } from "@/lib/expense-analytics";
import { useAppChartColors } from "@/hooks/useAppChartColors";

type SpendingTrendChartProps = {
  dailyTotals: DailyTotal[];
  dailyLimit: number;
};

const formatTickLabel = (iso: string): string => {
  const d = parseLocalISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const SpendingTrendChart = ({
  dailyTotals,
  dailyLimit,
}: SpendingTrendChartProps) => {
  const colors = useAppChartColors();
  const isEmpty = dailyTotals.every((d) => d.total === 0);
  const maxValue = Math.max(dailyLimit, ...dailyTotals.map((d) => d.total));

  const data: ChartData<"bar" | "line"> = {
    labels: dailyTotals.map((d) => formatTickLabel(d.date)),
    datasets: [
      {
        type: "bar" as const,
        label: "Spent",
        data: dailyTotals.map((d) => d.total),
        backgroundColor: colors.spend,
        borderRadius: 4,
      },
      ...(dailyLimit > 0
        ? [
            {
              type: "line" as const,
              label: "Daily limit",
              data: dailyTotals.map(() => dailyLimit),
              borderColor: colors.limit,
              borderDash: [6, 4],
              pointRadius: 0,
              borderWidth: 2,
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: colors.gridText } },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: colors.gridText, autoSkip: true, maxRotation: 0 },
        grid: { display: false },
      },
      y: {
        ticks: { color: colors.gridText },
        beginAtZero: true,
        suggestedMax: maxValue > 0 ? maxValue * 1.15 : undefined,
      },
    },
  };

  return (
    <div className="relative w-full h-64">
      <Chart type="bar" data={data} options={options} />
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm text-muted-foreground">
            No expenses in this period
          </span>
        </div>
      )}
    </div>
  );
};

export default SpendingTrendChart;

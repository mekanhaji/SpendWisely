import { Chart } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseLocalISODate } from "@/lib/expense-filter";
import type { DailyTotal } from "@/lib/expense-analytics";
import { useAppChartColors } from "@/hooks/useAppChartColors";

type SpendingTrendChartProps = {
  dailyTotals: DailyTotal[];
  dailyLimit: number;
  currency: string;
};

const formatTickLabel = (iso: string): string => {
  const d = parseLocalISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const SpendingTrendChart = ({
  dailyTotals,
  dailyLimit,
  currency,
}: SpendingTrendChartProps) => {
  const colors = useAppChartColors();
  const isEmpty = dailyTotals.every((d) => d.total === 0);
  const maxValue = Math.max(dailyLimit, ...dailyTotals.map((d) => d.total));
  const showLimit = dailyLimit > 0;

  const data: ChartData<"bar" | "line"> = {
    labels: dailyTotals.map((d) => formatTickLabel(d.date)),
    datasets: [
      {
        type: "bar" as const,
        label: "Spent",
        data: dailyTotals.map((d) => d.total),
        // Days at or over the limit stand out without needing a legend.
        backgroundColor: dailyTotals.map((d) =>
          showLimit && d.total >= dailyLimit ? colors.over : colors.spend,
        ),
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 36,
      },
      ...(showLimit
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
    font: { family: '"Inter Variable", system-ui, sans-serif' },
    plugins: {
      // The dashed line is explained in the card header instead.
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (item) => `${item.dataset.label}: ${currency}${item.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.gridText,
          autoSkip: true,
          maxRotation: 0,
          maxTicksLimit: 7,
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { color: colors.gridText, maxTicksLimit: 5 },
        grid: { color: colors.grid },
        border: { display: false },
        beginAtZero: true,
        suggestedMax: maxValue > 0 ? maxValue * 1.15 : undefined,
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-baseline justify-between gap-2">
        <CardTitle>Daily spending</CardTitle>
        {showLimit && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-0 w-4 border-t-2 border-dashed"
              style={{ borderColor: colors.limit }}
            />
            Limit {currency}
            {dailyLimit}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative h-56 w-full">
          <Chart type="bar" data={data} options={options} />
          {isEmpty && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                No expenses in this period
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingTrendChart;

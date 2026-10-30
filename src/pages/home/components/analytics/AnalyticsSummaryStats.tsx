import { Card } from "@/components/ui/card";
import { parseLocalISODate } from "@/lib/expense-filter";
import type { SummaryStats } from "@/lib/expense-analytics";

type AnalyticsSummaryStatsProps = {
  stats: SummaryStats;
  currency: string;
};

const formatShortDate = (iso: string): string => {
  const d = parseLocalISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const Tile = ({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) => (
  <Card className="flex min-w-0 flex-col gap-1 p-4">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="truncate text-2xl font-semibold tabular-nums">{value}</span>
    {subvalue && (
      <span className="text-xs text-muted-foreground">{subvalue}</span>
    )}
  </Card>
);

const AnalyticsSummaryStats = ({
  stats,
  currency,
}: AnalyticsSummaryStatsProps) => {
  const hasData = stats.transactionCount > 0;

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <Tile label="Total spent" value={`${currency}${stats.total}`} />
      <Tile
        label="Average / day"
        value={`${currency}${stats.averagePerDay.toFixed(0)}`}
      />
      <Tile
        label="Highest day"
        value={
          hasData && stats.highestDay
            ? `${currency}${stats.highestDay.total}`
            : "--"
        }
        subvalue={
          hasData && stats.highestDay
            ? formatShortDate(stats.highestDay.date)
            : undefined
        }
      />
      <Tile label="Transactions" value={String(stats.transactionCount)} />
    </div>
  );
};

export default AnalyticsSummaryStats;

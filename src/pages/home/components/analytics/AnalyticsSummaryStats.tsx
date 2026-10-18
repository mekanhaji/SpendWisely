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
  <div className="bg-app-100 dark:bg-app-800 rounded-lg p-3 flex flex-col gap-1 min-w-0">
    <span className="text-sm text-muted-foreground uppercase">{label}</span>
    <span className="text-xl font-bold truncate">{value}</span>
    {subvalue && (
      <span className="text-xs text-muted-foreground">{subvalue}</span>
    )}
  </div>
);

const AnalyticsSummaryStats = ({
  stats,
  currency,
}: AnalyticsSummaryStatsProps) => {
  const hasData = stats.transactionCount > 0;

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
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

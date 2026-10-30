import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import ExpenseRow from "@/components/ExpenseRow";
import SwipeableRow from "@/components/SwipeableRow";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useExpenseStore, useUserSettingsStore, type ExpenseRecord } from "@/store";
import {
  isSingleDayFilter,
  matchesFilter,
  toLocalISODate,
  type ExpenseFilter,
} from "@/lib/expense-filter";
import ExpenseRecordsFilter from "./ExpenseRecordsFilter";

const formatTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

type DayGroup = {
  /** yyyy-mm-dd, local */
  date: string;
  records: ExpenseRecord[];
  total: number;
};

/** "Today", "Yesterday", otherwise e.g. "Mon, 27 Oct". */
const formatDayLabel = (isoDate: string): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isoDate === toLocalISODate(now)) return "Today";
  if (isoDate === toLocalISODate(yesterday)) return "Yesterday";

  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

type ExpenseRecordsListProps = {
  setIsDialogOpen: (isOpen: boolean) => void;
  setUpdateId: (id: string | null) => void;
  updateId: string | null;
  filter: ExpenseFilter;
  setFilter: (filter: ExpenseFilter) => void;
};

const ExpenseRecordsList = (props: ExpenseRecordsListProps) => {
  const { setIsDialogOpen, setUpdateId, filter, setFilter } = props;
  const expenseRecords = useExpenseStore((state) => state.expenseRecords);
  const currency = useUserSettingsStore((state) => state.currency);
  const deleteExpense = useDeleteExpense();

  // A single day needs no day headers; anything longer is grouped by day.
  const grouped = !isSingleDayFilter(filter);

  // Newest first. Records are keyed by insertion order in the store, which is
  // not always chronological (yesterday's spend added today), so sort here.
  const days = useMemo<DayGroup[]>(() => {
    const byDay = new Map<string, DayGroup>();
    const sorted = expenseRecords
      .filter((record) => matchesFilter(record.datetime, filter))
      .sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
      );

    for (const record of sorted) {
      const key = toLocalISODate(new Date(record.datetime));
      const day = byDay.get(key) ?? { date: key, records: [], total: 0 };
      day.records.push(record);
      day.total += record.amount;
      byDay.set(key, day);
    }
    return Array.from(byDay.values());
  }, [expenseRecords, filter]);

  const edit = (record: ExpenseRecord) => {
    setUpdateId(record.datetime);
    setIsDialogOpen(true);
  };

  return (
    <>
      <ExpenseRecordsFilter filter={filter} setFilter={setFilter} />

      {days.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-2 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Wallet className="h-6 w-6" />
          </span>
          <p className="font-medium">
            {filter.mode === "today"
              ? "No spends yet today"
              : "No spends in this period"}
          </p>
          <p className="text-sm text-muted-foreground">
            Tap + to record one.
          </p>
        </div>
      ) : (
        days.map((day) => (
          <section key={day.date} className="w-full">
            {grouped && (
              <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-1 flex items-baseline justify-between bg-background/90 px-1 py-2 backdrop-blur-md">
                <h2 className="text-sm font-semibold">
                  {formatDayLabel(day.date)}
                </h2>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {currency}
                  {day.total}
                </span>
              </header>
            )}
            <Card className="divide-y overflow-hidden">
              {day.records.map((record) => (
                <SwipeableRow
                  key={record.datetime}
                  onSwipeDelete={() => deleteExpense(record)}
                >
                  <ExpenseRow
                    record={record}
                    currency={currency}
                    meta={formatTime(record.datetime)}
                    onEdit={() => edit(record)}
                  />
                </SwipeableRow>
              ))}
            </Card>
          </section>
        ))
      )}
    </>
  );
};

export default ExpenseRecordsList;

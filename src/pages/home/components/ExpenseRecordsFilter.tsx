import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays } from "lucide-react";

export type ExpenseFilterMode =
  | "all"
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "custom";

export type ExpenseFilter = {
  mode: ExpenseFilterMode;
  /** yyyy-mm-dd local, only for custom */
  from?: string;
  /** yyyy-mm-dd local, only for custom */
  to?: string;
};

export type ExpenseRecordsFilterProps = {
  filter: ExpenseFilter;
  setFilter: (filter: ExpenseFilter) => void;
};

export const toLocalISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseLocalISODate = (s: string): Date | null => {
  const parts = s.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
};

export const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const endOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const getMondayOfThisWeek = (now: Date = new Date()): Date => {
  const day = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - day);
  return monday;
};

export const getFirstOfThisMonth = (now: Date = new Date()): Date =>
  new Date(now.getFullYear(), now.getMonth(), 1);

const formatShort = (iso?: string): string => {
  if (!iso) return "";
  const d = parseLocalISODate(iso);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const QUICK_MODES: { mode: ExpenseFilterMode; label: string }[] = [
  { mode: "all", label: "All Spends" },
  { mode: "today", label: "Today" },
  { mode: "yesterday", label: "Yesterday" },
  { mode: "week", label: "This Week" },
  { mode: "month", label: "This Month" },
];

const pillClass = (active: boolean) =>
  cn(
    "h-9 px-3 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    active
      ? "bg-primary text-primary-foreground border-primary shadow-sm"
      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
  );

const ExpenseRecordsFilter = (props: ExpenseRecordsFilterProps) => {
  const { filter, setFilter } = props;
  const [customOpen, setCustomOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  const openCustomDialog = () => {
    const today = new Date();
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(today.getDate() - 6);
    setDraftFrom(filter.from ?? toLocalISODate(sixDaysAgo));
    setDraftTo(filter.to ?? toLocalISODate(today));
    setCustomOpen(true);
  };

  const applyPreset = (
    preset: "today" | "yesterday" | "week" | "month" | "last7"
  ) => {
    const today = new Date();
    if (preset === "today") {
      const iso = toLocalISODate(today);
      setDraftFrom(iso);
      setDraftTo(iso);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      const iso = toLocalISODate(y);
      setDraftFrom(iso);
      setDraftTo(iso);
    } else if (preset === "week") {
      setDraftFrom(toLocalISODate(getMondayOfThisWeek(today)));
      setDraftTo(toLocalISODate(today));
    } else if (preset === "month") {
      setDraftFrom(toLocalISODate(getFirstOfThisMonth(today)));
      setDraftTo(toLocalISODate(today));
    } else {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(today.getDate() - 6);
      setDraftFrom(toLocalISODate(sixDaysAgo));
      setDraftTo(toLocalISODate(today));
    }
  };

  const rangeError =
    draftFrom && draftTo && draftFrom > draftTo
      ? "From date must be before To date."
      : null;

  const applyCustom = () => {
    if (!draftFrom || !draftTo || rangeError) return;
    setFilter({ mode: "custom", from: draftFrom, to: draftTo });
    setCustomOpen(false);
  };

  const customLabel =
    filter.mode === "custom" && filter.from && filter.to
      ? filter.from === filter.to
        ? formatShort(filter.from)
        : `${formatShort(filter.from)} - ${formatShort(filter.to)}`
      : "Custom";

  return (
    <section className="flex flex-col gap-2 w-full">
      <div
        role="group"
        aria-label="Expense range"
        className="flex gap-2 flex-wrap items-center w-full"
      >
        {QUICK_MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            aria-pressed={filter.mode === m.mode}
            onClick={() => setFilter({ mode: m.mode })}
            className={pillClass(filter.mode === m.mode)}
          >
            {m.label}
          </button>
        ))}

        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-pressed={filter.mode === "custom"}
              onClick={openCustomDialog}
              className={cn(
                pillClass(filter.mode === "custom"),
                "flex items-center gap-1.5"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              {customLabel}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Custom range</DialogTitle>
              <DialogDescription>
                Pick a single day (From = To) or a range. Quick presets below.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "week", label: "This week" },
                  { key: "month", label: "This month" },
                  { key: "last7", label: "Last 7 days" },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key)}
                  className="h-8 px-3 rounded-full border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="custom-from"
                  className="text-sm font-medium leading-none"
                >
                  From
                </label>
                <Input
                  id="custom-from"
                  type="date"
                  value={draftFrom}
                  max={draftTo || toLocalISODate(new Date())}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="custom-to"
                  className="text-sm font-medium leading-none"
                >
                  To
                </label>
                <Input
                  id="custom-to"
                  type="date"
                  value={draftTo}
                  min={draftFrom}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </div>
            </div>
            {rangeError ? (
              <p className="text-sm text-destructive">{rangeError}</p>
            ) : (
              draftFrom &&
              draftTo && (
                <p className="text-sm text-muted-foreground">
                  {draftFrom === draftTo
                    ? `Single day: ${formatShort(draftFrom)}`
                    : `${formatShort(draftFrom)} - ${formatShort(draftTo)}`}
                </p>
              )
            )}

            <DialogFooter>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                onClick={applyCustom}
                disabled={!draftFrom || !draftTo || !!rangeError}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Apply
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ExpenseRecordsFilter;

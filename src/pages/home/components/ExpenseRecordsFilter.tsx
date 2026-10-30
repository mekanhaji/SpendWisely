import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CalendarDays } from "lucide-react";
import {
  getFirstOfThisMonth,
  getMondayOfThisWeek,
  parseLocalISODate,
  toLocalISODate,
  type ExpenseFilter,
  type ExpenseFilterMode,
} from "@/lib/expense-filter";

export type { ExpenseFilter, ExpenseFilterMode };
export {
  toLocalISODate,
  parseLocalISODate,
  startOfDay,
  endOfDay,
  getMondayOfThisWeek,
  getFirstOfThisMonth,
  matchesFilter,
} from "@/lib/expense-filter";

export type ExpenseRecordsFilterProps = {
  filter: ExpenseFilter;
  setFilter: (filter: ExpenseFilter) => void;
  /** Restricts which quick-pill modes render; "custom" dialog always renders. Default: all QUICK_MODES. */
  modes?: ExpenseFilterMode[];
};

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

const chipClass = (active: boolean) =>
  cn(
    "h-9 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input bg-card hover:bg-accent hover:text-accent-foreground",
  );

const ExpenseRecordsFilter = (props: ExpenseRecordsFilterProps) => {
  const { filter, setFilter, modes } = props;
  const visibleModes = modes
    ? QUICK_MODES.filter((m) => modes.includes(m.mode))
    : QUICK_MODES;
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
    <section className="w-full">
      {/* One scrollable line instead of wrapping onto several rows. The
          negative margin lets chips scroll to the screen edge. */}
      <div
        role="group"
        aria-label="Expense range"
        className="-mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {visibleModes.map((m) => (
          <button
            key={m.mode}
            type="button"
            aria-pressed={filter.mode === m.mode}
            onClick={() => setFilter({ mode: m.mode })}
            className={chipClass(filter.mode === m.mode)}
          >
            {m.label}
          </button>
        ))}

        <button
          type="button"
          aria-pressed={filter.mode === "custom"}
          onClick={openCustomDialog}
          className={cn(
            chipClass(filter.mode === "custom"),
            "flex items-center gap-1.5"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          {customLabel}
        </button>
      </div>

      <Drawer open={customOpen} onOpenChange={setCustomOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Custom range</DrawerTitle>
            <DrawerDescription>
              Pick a single day (From = To) or a range. Quick presets below.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-wrap gap-2">
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
                className="h-9 rounded-full border border-input bg-card px-4 text-sm hover:bg-accent hover:text-accent-foreground"
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

          <DrawerFooter>
            <Button
              size="lg"
              onClick={applyCustom}
              disabled={!draftFrom || !draftTo || !!rangeError}
            >
              Apply
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="lg">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
};

export default ExpenseRecordsFilter;

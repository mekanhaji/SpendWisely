import CategoryAvatar from "@/components/CategoryAvatar";
import { cn } from "@/lib/utils";
import type { ExpenseRecord } from "@/store";

type ExpenseRowProps = {
  record: ExpenseRecord;
  currency: string;
  /** Muted detail after the note, e.g. the time or a date. */
  meta: string;
  /** Tap target: opens the record for editing. */
  onEdit: () => void;
  /** Position shown before the avatar, for ranked lists. */
  rank?: number;
  className?: string;
};

/**
 * One expense as a full-width, tappable row: avatar, category, note and time,
 * amount on the right. Meant to sit inside a Card (rows are flat and divided).
 */
const ExpenseRow = ({
  record,
  currency,
  meta,
  onEdit,
  rank,
  className,
}: ExpenseRowProps) => {
  // Migrated records have the old description as both category and note, so
  // skip the duplicate.
  const note =
    record.notes && record.notes !== record.category ? record.notes : "";

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`Edit ${record.category}, ${currency}${record.amount}`}
      className={cn(
        "flex w-full items-center gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50 active:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        className,
      )}
    >
      {rank !== undefined && (
        <span className="w-4 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
          {rank}
        </span>
      )}
      <CategoryAvatar category={record.category} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{record.category}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {note ? `${note} · ${meta}` : meta}
        </span>
      </span>
      <span className="shrink-0 text-lg font-semibold tabular-nums">
        {currency}
        {record.amount}
      </span>
    </button>
  );
};

export default ExpenseRow;

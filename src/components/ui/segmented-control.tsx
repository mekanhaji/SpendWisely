import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  /** Spoken name of the group, e.g. "Theme". */
  ariaLabel: string;
  className?: string;
};

/**
 * Pill switcher for a small, fixed set of choices (theme, analytics range).
 * Options share the width equally; the active one lifts onto a card surface.
 */
const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) => (
  <div
    role="group"
    aria-label={ariaLabel}
    className={cn("flex gap-1 rounded-xl bg-muted p-1", className)}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 min-w-0 flex-1 truncate rounded-lg px-2 text-sm font-medium transition duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;

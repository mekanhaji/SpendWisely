import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategorySuggestion } from "@/lib/category-suggestions";

type CategorySuggestionChipsProps = {
  suggestions: CategorySuggestion[];
  selectedCategory: string;
  /** True when the amount is valid, so a tap would actually record. */
  canRecord: boolean;
  onPick: (category: string) => void;
  /** Called when the pointer or keyboard focus enters the row (freezes ranking). */
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

/**
 * One-tap category chips for the add-expense dialog. The first slot always
 * holds the current top guess; the rest keep their slots as the amount changes
 * so the row does not shuffle under a finger.
 *
 * A chip only gets the "likely match" mark above a confidence threshold. A
 * weak guess looks exactly like an ordinary option.
 */
const CategorySuggestionChips = ({
  suggestions,
  selectedCategory,
  canRecord,
  onPick,
  onInteractionStart,
  onInteractionEnd,
}: CategorySuggestionChipsProps) => {
  if (suggestions.length === 0) return null;

  const selectedKey = selectedCategory.trim().toLowerCase();

  return (
    <div
      className="flex w-full flex-col gap-1.5"
      onPointerEnter={onInteractionStart}
      onPointerLeave={onInteractionEnd}
      onFocus={onInteractionStart}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onInteractionEnd?.();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">Suggested</span>
        <span className="text-xs text-muted-foreground">
          {canRecord ? "Tap to record" : "Enter an amount to record"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Category suggestions">
        {suggestions.map((suggestion) => {
          const isSelected =
            suggestion.category.trim().toLowerCase() === selectedKey;

          return (
            <button
              key={suggestion.category}
              type="button"
              aria-pressed={isSelected}
              aria-label={
                suggestion.isStrong
                  ? `${suggestion.category}, likely match`
                  : suggestion.category
              }
              title={suggestion.isStrong ? "Likely match" : undefined}
              onClick={() => onPick(suggestion.category)}
              className={cn(
                "flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                !isSelected && suggestion.isStrong && "border-primary/60 font-medium",
              )}
            >
              {suggestion.category}
              {suggestion.isStrong && (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySuggestionChips;

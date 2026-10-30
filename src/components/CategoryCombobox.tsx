import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryComboboxProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called when the user picks "Create ..."; should persist the new name. */
  onCreate: (name: string) => void;
  categories: string[];
  placeholder?: string;
  className?: string;
};

/**
 * Small type-to-filter category picker. Deliberately dependency-free: it is an
 * Input plus an absolutely positioned list, so it can host free-text entry
 * (which a plain select cannot) without pulling in a new package.
 */
const CategoryCombobox = ({
  id,
  value,
  onChange,
  onCreate,
  categories,
  placeholder = "e.g. Food",
  className,
}: CategoryComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the input in sync when the form value changes from outside
  // (opening the dialog for an existing record).
  useEffect(() => {
    if (!open) setQuery(value);
  }, [value, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const trimmedQuery = query.trim();

  const { matches, canCreate } = useMemo(() => {
    const lower = trimmedQuery.toLowerCase();
    return {
      matches: categories.filter((category) =>
        category.toLowerCase().includes(lower),
      ),
      canCreate:
        trimmedQuery.length > 0 &&
        !categories.some((category) => category.toLowerCase() === lower),
    };
  }, [categories, trimmedQuery]);

  const optionCount = matches.length + (canCreate ? 1 : 0);

  const select = (name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const create = () => {
    if (!trimmedQuery) return;
    onCreate(trimmedQuery);
    select(trimmedQuery);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((prev) =>
          optionCount === 0 ? -1 : (prev + 1) % optionCount,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((prev) =>
          optionCount === 0 ? -1 : prev <= 0 ? optionCount - 1 : prev - 1,
        );
        break;
      case "Enter":
        // Only swallow Enter when a suggestion is highlighted; otherwise let
        // the form submit normally.
        if (!open || activeIndex < 0) return;
        event.preventDefault();
        if (activeIndex < matches.length) {
          select(matches[activeIndex]);
        } else {
          create();
        }
        break;
      case "Escape":
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const showList = open && optionCount > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        value={open ? query : value}
        placeholder={placeholder}
        className={cn("p-2 my-2 border border-input rounded-md", className)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />

      {showList && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-50 -mt-1 max-h-52 overflow-y-auto rounded-md border bg-background py-1 shadow-md"
        >
          {matches.map((category, index) => (
            <li key={category}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent",
                  index === activeIndex && "bg-accent",
                )}
                // Keeps focus in the input so the list does not close before
                // the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(category)}
              >
                {category}
              </button>
            </li>
          ))}

          {canCreate && (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === matches.length}
                className={cn(
                  "flex w-full items-center gap-1 px-3 py-2 text-left text-sm text-app-700 dark:text-app-300 hover:bg-accent",
                  activeIndex === matches.length && "bg-accent",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(matches.length)}
                onClick={create}
              >
                <Plus className="h-4 w-4" />
                Create “{trimmedQuery}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CategoryCombobox;

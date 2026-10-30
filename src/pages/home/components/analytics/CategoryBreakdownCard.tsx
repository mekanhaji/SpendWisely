import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryAvatar from "@/components/CategoryAvatar";
import type { CategoryTotal } from "@/lib/expense-analytics";

type CategoryBreakdownCardProps = {
  categories: CategoryTotal[];
  currency: string;
};

/** Beyond this the tail is folded into one "Others" row. */
const MAX_ROWS = 6;

const toRows = (categories: CategoryTotal[]): CategoryTotal[] => {
  if (categories.length <= MAX_ROWS) return categories;

  const head = categories.slice(0, MAX_ROWS - 1);
  const tail = categories.slice(MAX_ROWS - 1);
  return [
    ...head,
    {
      category: "Others",
      total: tail.reduce((sum, c) => sum + c.total, 0),
      count: tail.reduce((sum, c) => sum + c.count, 0),
      share: tail.reduce((sum, c) => sum + c.share, 0),
    },
  ];
};

/** Where the money went: one bar per category, sized by its share of the total. */
const CategoryBreakdownCard = ({
  categories,
  currency,
}: CategoryBreakdownCardProps) => {
  if (categories.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>By category</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {toRows(categories).map((row) => {
          const percent = Math.round(row.share * 100);
          return (
            <div key={row.category} className="flex items-center gap-3">
              <CategoryAvatar category={row.category} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{row.category}</span>
                  <span className="shrink-0 tabular-nums">
                    {currency}
                    {row.total}
                    <span className="ml-1.5 text-muted-foreground">
                      {percent}%
                    </span>
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`${row.category}: ${percent}% of spending`}
                  className="h-1.5 overflow-hidden rounded-full bg-foreground/10"
                >
                  <div
                    className="h-full rounded-full bg-app-500"
                    style={{ width: `${Math.max(row.share * 100, 2)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownCard;

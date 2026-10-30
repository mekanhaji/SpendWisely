import { useMemo, useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import CategoryAvatar from "@/components/CategoryAvatar";
import SwipeableRow from "@/components/SwipeableRow";
import AppLayout from "@/layout";
import { UNCATEGORIZED_CATEGORY } from "@/lib/migrations/expense-migrations";
import { useExpenseStore } from "@/store";

const isFallback = (name: string) =>
  name.trim().toLowerCase() === UNCATEGORIZED_CATEGORY.toLowerCase();

const Categories = () => {
  const {
    categories,
    expenseRecords,
    addCategory,
    renameCategory,
    removeCategory,
  } = useExpenseStore();

  const [newCategory, setNewCategory] = useState("");
  const [addError, setAddError] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of expenseRecords) {
      const key = record.category.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [expenseRecords]);

  const sortedCategories = [...categories].sort((a, b) =>
    a.trim().toLowerCase().localeCompare(b.trim().toLowerCase()),
  );

  const deletingUsage =
    deletingCategory != null
      ? usageCounts.get(deletingCategory.trim().toLowerCase()) ?? 0
      : 0;

  // Renaming onto another category merges the two; say so before it happens.
  const mergeTarget =
    editingCategory != null
      ? categories.find(
          (c) =>
            c !== editingCategory &&
            c.trim().toLowerCase() === editValue.trim().toLowerCase(),
        )
      : undefined;

  const handleAddCategory = (event: React.FormEvent) => {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return;

    if (categories.some((c) => c.trim().toLowerCase() === name.toLowerCase())) {
      setAddError(`A category called "${name}" already exists.`);
      return;
    }

    addCategory(name);
    setNewCategory("");
    setAddError("");
  };

  const startRename = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const saveRename = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCategory || !editValue.trim()) return;
    renameCategory(editingCategory, editValue);
    setEditingCategory(null);
  };

  const askDeleteFromSheet = () => {
    if (!editingCategory) return;
    setDeletingCategory(editingCategory);
    setEditingCategory(null);
  };

  const confirmRemove = () => {
    if (deletingCategory) removeCategory(deletingCategory);
    setDeletingCategory(null);
  };

  return (
    <TabsContent value="settings" className="w-full">
      <main className="mt-2 flex flex-col gap-4">
        <Card className="p-4">
          <form className="flex flex-col gap-2" onSubmit={handleAddCategory}>
            <label htmlFor="new-category" className="text-sm font-medium">
              New category
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="new-category"
                value={newCategory}
                onChange={(event) => {
                  setNewCategory(event.target.value);
                  setAddError("");
                }}
                placeholder="e.g. Groceries"
              />
              <Button type="submit" disabled={!newCategory.trim()}>
                Add
              </Button>
            </div>
            {addError && (
              <p className="text-sm text-app-error-500" role="alert">
                {addError}
              </p>
            )}
          </form>
        </Card>

        <Card className="divide-y overflow-hidden">
          {sortedCategories.map((category) => {
            const usage = usageCounts.get(category.trim().toLowerCase()) ?? 0;

            const row = (
              <button
                type="button"
                onClick={() => startRename(category)}
                aria-label={`Edit ${category}, ${usage} expense${usage === 1 ? "" : "s"}`}
                className="flex w-full items-center gap-3 bg-card px-4 py-3 text-left transition-colors active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <CategoryAvatar category={category} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{category}</span>
                  <span className="block text-sm text-muted-foreground">
                    {usage} expense{usage === 1 ? "" : "s"}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );

            // The fallback category cannot be removed, so it cannot be swiped.
            return isFallback(category) ? (
              <div key={category}>{row}</div>
            ) : (
              <SwipeableRow
                key={category}
                snapBack
                onSwipeDelete={() => setDeletingCategory(category)}
              >
                {row}
              </SwipeableRow>
            );
          })}
        </Card>
      </main>

      <Drawer
        open={editingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit category</DrawerTitle>
            <DrawerDescription>
              Expenses in this category follow the new name.
            </DrawerDescription>
          </DrawerHeader>
          <form className="flex flex-col gap-4" onSubmit={saveRename}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rename-category" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="rename-category"
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
              />
              {mergeTarget && (
                <p className="text-sm text-muted-foreground">
                  “{mergeTarget}” already exists, so the two will be merged.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={!editValue.trim()}
              >
                Save
              </Button>
              {editingCategory && !isFallback(editingCategory) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="text-destructive"
                  onClick={askDeleteFromSheet}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete category
                </Button>
              )}
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={deletingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Delete category?</DrawerTitle>
            <DrawerDescription>
              {deletingCategory
                ? `"${deletingCategory}" is used by ${deletingUsage} expense${
                    deletingUsage === 1 ? "" : "s"
                  }. They will move to "${UNCATEGORIZED_CATEGORY}".`
                : ""}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" size="lg" onClick={confirmRemove}>
              Delete
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="lg">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </TabsContent>
  );
};

const CategoriesPage = () => {
  return (
    <AppLayout headerOptions={{ title: "Categories", back: "/settings" }}>
      <Categories />
    </AppLayout>
  );
};

export default CategoriesPage;

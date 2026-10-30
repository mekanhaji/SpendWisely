import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SettingsCard from "@/pages/settings/components/SettingsCard";
import { ItemCardBody, ItemCardHeaderTitle } from "@/layout/ItemCardLayout";
import ItemCardLayout from "@/layout/ItemCardLayout";
import AppLayout from "@/layout";
import { UNCATEGORIZED_CATEGORY } from "@/lib/migrations/expense-migrations";
import { useExpenseStore } from "@/store";

const Categories = () => {
  const navigate = useNavigate();
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

  const saveRename = () => {
    if (!editingCategory) return;
    renameCategory(editingCategory, editValue);
    setEditingCategory(null);
  };

  const handleRenameKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") saveRename();
    if (event.key === "Escape") setEditingCategory(null);
  };

  const confirmRemove = () => {
    if (deletingCategory) removeCategory(deletingCategory);
    setDeletingCategory(null);
  };

  return (
    <TabsContent value="settings">
      <main className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground self-start"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Settings
        </button>

        <SettingsCard
          title="Add category"
          description="Create a new category to file expenses under."
          bodyClassName="w-full"
        >
          <form className="flex items-center gap-2" onSubmit={handleAddCategory}>
            <Input
              value={newCategory}
              onChange={(event) => {
                setNewCategory(event.target.value);
                setAddError("");
              }}
              placeholder="e.g. Food"
              className="p-2 my-0 border border-input rounded-md"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-primary text-primary-foreground w-fit px-3"
            >
              Add
            </button>
          </form>
        </SettingsCard>
        {addError && (
          <p className="text-app-error-500 text-sm" role="alert">
            {addError}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {sortedCategories.map((category) => {
            const usage = usageCounts.get(category.trim().toLowerCase()) ?? 0;
            const isEditing = editingCategory === category;

            return (
              <ItemCardLayout
                key={category}
                className="flex-col items-stretch gap-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={editValue}
                        onChange={(event) => setEditValue(event.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        className="p-2 my-0 border border-input rounded-md"
                      />
                      <button
                        type="button"
                        onClick={saveRename}
                        className="p-2 rounded-lg bg-primary text-primary-foreground w-fit px-3"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="p-2 rounded-lg border border-input text-foreground w-fit px-3"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <ItemCardHeaderTitle>{category}</ItemCardHeaderTitle>
                  )}

                  <ItemCardBody className="mt-0 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {usage} expense{usage === 1 ? "" : "s"}
                    </span>
                    {!isEditing && (
                      <div className="flex gap-3">
                        <Pencil
                          className="h-4 w-4 text-app-700 cursor-pointer"
                          onClick={() => startRename(category)}
                        />
                        <Trash2
                          className="h-4 w-4 text-app-error-700 cursor-pointer"
                          onClick={() => setDeletingCategory(category)}
                        />
                      </div>
                    )}
                  </ItemCardBody>
                </div>
              </ItemCardLayout>
            );
          })}
        </div>
      </main>

      <Dialog
        open={deletingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              {deletingCategory
                ? `"${deletingCategory}" is used by ${deletingUsage} expense${
                    deletingUsage === 1 ? "" : "s"
                  }. They will move to "${UNCATEGORIZED_CATEGORY}".`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeletingCategory(null)}
              className="p-2 mt-4 rounded-lg border border-input text-foreground w-full text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              className="p-2 mt-4 rounded-lg bg-destructive text-destructive-foreground w-full text-center"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

const CategoriesPage = () => {
  return (
    <AppLayout headerOptions={{ title: "Categories" }}>
      <Categories />
    </AppLayout>
  );
};

export default CategoriesPage;

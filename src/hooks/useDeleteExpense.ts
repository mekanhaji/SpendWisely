import { useCallback } from "react";
import { haptic } from "@/lib/pwa";
import {
  useExpenseStore,
  useToastStore,
  useUserSettingsStore,
  type ExpenseRecord,
} from "@/store";

/**
 * Delete an expense and offer a few seconds to take it back. Every delete in
 * the app goes through this, so nothing is ever one mis-tap from gone.
 */
export const useDeleteExpense = () => {
  const removeExpense = useExpenseStore((state) => state.removeExpense);
  const restoreExpense = useExpenseStore((state) => state.restoreExpense);
  const currency = useUserSettingsStore((state) => state.currency);
  const showToast = useToastStore((state) => state.show);

  return useCallback(
    (record: ExpenseRecord) => {
      removeExpense(record.datetime);
      haptic(15);
      showToast({
        message: `Deleted ${record.category} ${currency}${record.amount}`,
        actionLabel: "Undo",
        onAction: () => restoreExpense(record),
      });
    },
    [removeExpense, restoreExpense, currency, showToast],
  );
};

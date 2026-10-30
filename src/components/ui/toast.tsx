import { useEffect } from "react";
import { useToastStore, type Toast } from "@/store";
import { Button } from "@/components/ui/button";

const ToastItem = ({ toast }: { toast: Toast }) => {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-popover px-4 py-2 text-popover-foreground shadow-float animate-in fade-in-0 slide-in-from-bottom-2"
    >
      <p className="min-w-0 flex-1 text-sm">{toast.message}</p>
      {toast.actionLabel && (
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2 text-primary"
          onClick={() => {
            toast.onAction?.();
            dismiss(toast.id);
          }}
        >
          {toast.actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Renders the toast queue. It sits above the bottom tab bar and leaves the
 * right edge free for the add button. z-[60] keeps it above open sheets.
 */
const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-[625px] flex-col gap-2 pl-4 pr-[5.5rem] md:inset-x-auto md:bottom-6 md:right-6 md:mx-0 md:w-96 md:max-w-none md:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toaster;

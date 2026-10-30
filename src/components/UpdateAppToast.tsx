import { useEffect } from "react";
import { usePwaUpdateStore, useToastStore } from "@/store";

const UPDATE_TOAST_DURATION = 15000;

// Layouts remount on every route change; remembering the worker keeps it to
// one toast per update. A fresh launch shows it again if it was ignored.
let notifiedWorker: ServiceWorker | null = null;

/** Headless: raises a "Reload" toast once a new service worker is waiting. */
const UpdateAppToast = () => {
  const waitingWorker = usePwaUpdateStore((state) => state.waitingWorker);
  const applyUpdate = usePwaUpdateStore((state) => state.applyUpdate);
  const showToast = useToastStore((state) => state.show);

  useEffect(() => {
    if (!waitingWorker || waitingWorker === notifiedWorker) return;
    notifiedWorker = waitingWorker;

    showToast({
      message: "A new version of Spend Wisely is ready.",
      actionLabel: "Reload",
      onAction: applyUpdate,
      duration: UPDATE_TOAST_DURATION,
    });
  }, [waitingWorker, applyUpdate, showToast]);

  return null;
};

export default UpdateAppToast;

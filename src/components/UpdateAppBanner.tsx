import { usePwaUpdateStore } from "@/store";
import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeader,
  ItemCardHeaderDescription,
  ItemCardHeaderTitle,
} from "@/layout/ItemCardLayout";
import { RefreshCw } from "lucide-react";

const UpdateAppBanner = () => {
  const waitingWorker = usePwaUpdateStore((state) => state.waitingWorker);
  const applyUpdate = usePwaUpdateStore((state) => state.applyUpdate);

  if (!waitingWorker) {
    return null;
  }

  return (
    <ItemCardLayout className="w-full flex-col items-stretch gap-3 border border-app-200/80 dark:border-app-700">
      <ItemCardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-app-200/80 text-app-foreground dark:bg-app-700 flex h-9 w-9 items-center justify-center rounded-full">
            <RefreshCw className="h-4 w-4" />
          </div>

          <div className="flex flex-col">
            <ItemCardHeaderTitle className="text-lg">
              Update available
            </ItemCardHeaderTitle>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
              New version ready
            </p>
          </div>
        </div>

        <ItemCardHeaderDescription className="w-full">
          A new version of Spend Wisely is ready.
        </ItemCardHeaderDescription>
      </ItemCardHeader>

      <ItemCardBody className="mt-0 flex justify-end gap-2">
        <a
          href="https://github.com/mekanhaji/SpendWisely/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-app-200 text-app-foreground dark:bg-app-700 rounded-full px-3 py-1 text-sm font-medium"
        >
          What's new
        </a>
        <button
          type="button"
          onClick={applyUpdate}
          className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium"
        >
          Reload
        </button>
      </ItemCardBody>
    </ItemCardLayout>
  );
};

export default UpdateAppBanner;

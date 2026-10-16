import { cn } from "@/lib/utils";
import { usePwaInstallStore } from "@/store";
import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeader,
  ItemCardHeaderDescription,
  ItemCardHeaderTitle,
} from "@/layout/ItemCardLayout";
import { Download } from "lucide-react";

const InstallAppBanner = () => {
  const installStatus = usePwaInstallStore((state) => state.installStatus);
  const promptInstall = usePwaInstallStore((state) => state.promptInstall);

  // Only Chromium fires beforeinstallprompt, so there is nothing to show elsewhere.
  if (installStatus !== "available") {
    return null;
  }

  return (
    <ItemCardLayout
      className={cn(
        "w-full flex-col items-stretch gap-3 border border-app-200/80 dark:border-app-700",
        "cursor-pointer transition-transform duration-200 active:scale-[0.99]",
      )}
      onClick={() => void promptInstall()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void promptInstall();
        }
      }}
    >
      <ItemCardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-app-200/80 text-app-foreground dark:bg-app-700 flex h-9 w-9 items-center justify-center rounded-full">
            <Download className="h-4 w-4" />
          </div>

          <div className="flex flex-col">
            <ItemCardHeaderTitle className="text-lg">
              Install this app
            </ItemCardHeaderTitle>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
              Install now
            </p>
          </div>
        </div>

        <ItemCardHeaderDescription className="w-full">
          Tap this banner to add Spend Wisely to your home screen for faster
          access.
        </ItemCardHeaderDescription>
      </ItemCardHeader>

      <ItemCardBody className="mt-0 flex justify-end">
        <span className="bg-app-200 text-app-foreground dark:bg-app-700 rounded-full px-3 py-1 text-sm font-medium">
          Tap to install
        </span>
      </ItemCardBody>
    </ItemCardLayout>
  );
};

export default InstallAppBanner;

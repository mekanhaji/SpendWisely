import { cn } from "@/lib/utils";
import { type PwaInstallStatus, usePwaInstallStore } from "@/store";
import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeader,
  ItemCardHeaderDescription,
  ItemCardHeaderTitle,
} from "@/layout/ItemCardLayout";
import { Download, Smartphone } from "lucide-react";

const copyByStatus: Record<
  Exclude<PwaInstallStatus, "idle" | "installed" | "dismissed">,
  {
    title: string;
    description: string;
    actionLabel: string;
  }
> = {
  available: {
    title: "Install this app",
    description:
      "Tap this banner to add Spend Wisely to your home screen for faster access.",
    actionLabel: "Install now",
  },
  unsupported: {
    title: "Install this app",
    description:
      "Your browser does not support the one-tap install prompt. Use the browser menu or share sheet to install this app.",
    actionLabel: "Browser install",
  },
};

const InstallAppBanner = () => {
  const installStatus = usePwaInstallStore((state) => state.installStatus);
  const promptInstall = usePwaInstallStore((state) => state.promptInstall);

  if (installStatus !== "available" && installStatus !== "unsupported") {
    return null;
  }

  const bannerCopy = copyByStatus[installStatus];
  const isActionable = installStatus === "available";

  const handleInstall = () => {
    if (!isActionable) {
      return;
    }

    void promptInstall();
  };

  return (
    <ItemCardLayout
      className={cn(
        "w-full flex-col items-stretch gap-3 border border-app-200/80 dark:border-app-700",
        {
          "cursor-pointer transition-transform duration-200 active:scale-[0.99]":
            isActionable,
        },
      )}
      onClick={handleInstall}
      role={isActionable ? "button" : undefined}
      tabIndex={isActionable ? 0 : -1}
      onKeyDown={(event) => {
        if (!isActionable) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleInstall();
        }
      }}
      aria-disabled={!isActionable}
    >
      <ItemCardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-app-200/80 text-app-foreground dark:bg-app-700 flex h-9 w-9 items-center justify-center rounded-full">
            {isActionable ? (
              <Download className="h-4 w-4" />
            ) : (
              <Smartphone className="h-4 w-4" />
            )}
          </div>

          <div className="flex flex-col">
            <ItemCardHeaderTitle className="text-lg">
              {bannerCopy.title}
            </ItemCardHeaderTitle>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
              {bannerCopy.actionLabel}
            </p>
          </div>
        </div>

        <ItemCardHeaderDescription className="w-full">
          {bannerCopy.description}
        </ItemCardHeaderDescription>
      </ItemCardHeader>

      {isActionable && (
        <ItemCardBody className="mt-0 flex justify-end">
          <span className="bg-app-200 text-app-foreground dark:bg-app-700 rounded-full px-3 py-1 text-sm font-medium">
            Tap to install
          </span>
        </ItemCardBody>
      )}
    </ItemCardLayout>
  );
};

export default InstallAppBanner;

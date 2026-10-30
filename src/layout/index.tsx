import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChartPie,
  ChevronLeft,
  House,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Toaster from "@/components/ui/toast";
import UpdateAppToast from "@/components/UpdateAppToast";
import { cn } from "@/lib/utils";
import { TAB_PATHS, tabFromPath, type TabValue } from "./tabs";

const NAV_ITEMS: { tab: TabValue; label: string; icon: LucideIcon }[] = [
  { tab: "home", label: "Home", icon: House },
  { tab: "analytics", label: "Analytics", icon: ChartPie },
  { tab: "settings", label: "Settings", icon: Settings },
];

const TAB_TITLES: Record<TabValue, string> = {
  home: "Spend Wisely",
  analytics: "Analytics",
  settings: "Settings",
};

type HeaderProps = {
  /**
   * Title of the header. Defaults to the title of the active tab.
   * @example
   * title="Categories"
   */
  title?: string;
  /**
   * If true, a back button will be shown and on click it will go to previous page from browser history.
   * If a string is provided, it will be used as back url.
   * @default false
   * @example
   * back={true}
   *
   * back="/"
   * back="/settings"
   */
  back?: boolean | string;
};

type AppLayoutProps = {
  children: React.ReactNode;
  headerOptions?: HeaderProps;
};

const TopBar = ({ title, back }: Required<Pick<HeaderProps, "title">> & Pick<HeaderProps, "back">) => {
  const navigate = useNavigate();

  return (
    <header
      // Own transition group, so the bar stays put while the page cross-fades.
      style={{ viewTransitionName: "app-header" }}
      className="sticky top-0 z-30 bg-background/80 pt-safe-top backdrop-blur-md"
    >
      <div className="flex h-14 items-center gap-1 px-4">
        {back ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            className="-ml-3"
            onClick={() =>
              typeof back === "string"
                ? navigate(back, { viewTransition: true })
                : navigate(-1)
            }
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        ) : null}
        <h1 className="cursor-default select-none truncate text-xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
};

const BottomNav = ({ current }: { current: TabValue }) => (
  <nav
    aria-label="Primary"
    style={{ viewTransitionName: "app-nav" }}
    className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[625px] border-t bg-background/90 pb-safe-bottom backdrop-blur-md"
  >
    <ul className="flex h-16 items-stretch">
      {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
        const active = tab === current;
        return (
          <li key={tab} className="flex-1">
            <Link
              to={TAB_PATHS[tab]}
              viewTransition
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                  active && "bg-brand/20",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

const AppLayout = ({ children, headerOptions }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const tab = tabFromPath(pathname);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[625px] flex-col">
      <TopBar
        title={headerOptions?.title ?? TAB_TITLES[tab]}
        back={headerOptions?.back}
      />
      <UpdateAppToast />
      {/* Bottom padding clears the tab bar and the add button above it. */}
      <div className="flex-1 px-4 pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <Tabs value={tab}>{children}</Tabs>
      </div>
      <BottomNav current={tab} />
      <Toaster />
    </div>
  );
};

export default AppLayout;

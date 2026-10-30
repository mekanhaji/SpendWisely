import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddIntentStore } from "@/store";
import { NAV_ITEMS } from "./nav-items";
import { TAB_PATHS, type TabValue } from "./tabs";

/** Routes where Home is mounted, and so where the add sheet exists. */
const HOME_HOSTED_PATHS: string[] = Object.values(TAB_PATHS);

const labelClass = "text-[11px] font-medium leading-none";

/**
 * Slim icon rail for tablets and desktops (md and up). It sits right beside
 * the centered content instead of at the window edge, and follows the same
 * icon-over-label pattern as the phone's bottom bar.
 */
const Sidebar = ({ current }: { current: TabValue }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const requestAdd = useAddIntentStore((state) => state.request);

  const handleAdd = () => {
    requestAdd({});
    // Home opens the sheet. Sub-pages such as Categories do not render Home,
    // so go there first or the request would wait and pop open later.
    if (!HOME_HOSTED_PATHS.includes(pathname)) navigate("/");
  };

  return (
    <aside
      // Own transition group, so the rail stays put while the page fades.
      style={{ viewTransitionName: "app-sidebar" }}
      // 5rem lines the rail up with the top of the first card, below the
      // sticky title bar, and keeps it there while the page scrolls.
      className="sticky top-20 mt-20 hidden w-[4.5rem] shrink-0 flex-col items-center gap-5 self-start rounded-2xl border bg-card py-4 shadow-card md:flex"
    >
      <img
        src={`${import.meta.env.BASE_URL}icons/android-chrome-192x192.png`}
        alt=""
        className="h-9 w-9 rounded-xl"
      />

      <button
        type="button"
        onClick={handleAdd}
        aria-label="Add expense"
        className={cn(
          "group flex w-full flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
          "focus-visible:outline-none",
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-brand-foreground",
            "shadow-[0_6px_14px_-5px_rgb(var(--brand)/0.7)] transition duration-150 group-hover:-translate-y-px group-active:scale-95",
            "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card",
          )}
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className={labelClass}>Add</span>
      </button>

      <nav aria-label="Primary" className="w-full">
        <ul className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
            const active = tab === current;
            return (
              <li key={tab}>
                <Link
                  to={TAB_PATHS[tab]}
                  viewTransition
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 py-1 transition-colors",
                    "focus-visible:outline-none",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                      "group-focus-visible:ring-2 group-focus-visible:ring-ring",
                      active ? "bg-brand/20" : "group-hover:bg-accent",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span className={cn(labelClass, active && "font-semibold")}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

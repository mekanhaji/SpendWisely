import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useUserSettingsStore } from "@/store";
import InstallAppBanner from "./components/InstallAppBanner";
import SettingsCard from "./components/SettingsCard";
import { settingList, themeOptions, type SettingId } from "./setting";

const Settings = () => {
  const navigate = useNavigate();
  const userSettings = useUserSettingsStore();

  const controls: Record<SettingId, React.ReactNode> = {
    theme: (
      <div
        role="group"
        aria-label="Theme"
        className="flex overflow-hidden rounded-lg border border-border"
      >
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={userSettings.theme === option.value}
            onClick={() => userSettings.setTheme(option.value)}
            className={cn("px-3 py-1 text-sm transition-colors", {
              "bg-primary text-primary-foreground":
                userSettings.theme === option.value,
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground":
                userSettings.theme !== option.value,
            })}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
    currency: (
      <Input
        type="text"
        value={userSettings.currency}
        className="w-full text-center"
        placeholder="ex. $"
        onChange={(e) => userSettings.updateCurrency(e.target.value)}
      />
    ),
    dailyLimit: (
      <Input
        type="number"
        value={userSettings.dailyLimit || ""}
        className="w-full text-center"
        placeholder="ex. 10"
        onChange={(e) => userSettings.updateDailyLimit(Number(e.target.value))}
      />
    ),
    warningLimit: (
      <Input
        type="number"
        value={userSettings.warningLimit || ""}
        className="w-full text-center"
        placeholder="ex. 5"
        onChange={(e) => userSettings.updateWarningLimit(Number(e.target.value))}
      />
    ),
    categories: (
      <button
        type="button"
        onClick={() => navigate("/settings/categories")}
        className="px-3 py-1 text-sm rounded-md border border-border text-foreground transition-colors hover:bg-accent"
      >
        Manage
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    ),
  };

  return (
    <main className="flex flex-col gap-2 mt-2">
      <InstallAppBanner />

      {settingList.map((setting) => (
        <SettingsCard
          key={setting.id}
          title={setting.title}
          description={setting.description(userSettings)}
          bodyClassName={setting.bodyClassName}
        >
          {controls[setting.id]}
        </SettingsCard>
      ))}

      <p className="text-center text-xs text-muted-foreground mt-4">
        v{__APP_VERSION__} ({__APP_COMMIT__})
      </p>
    </main>
  );
};

export default Settings;
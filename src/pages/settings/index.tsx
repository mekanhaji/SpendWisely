import { Input } from "@/components/ui/input";
import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeaderDescription,
  ItemCardHeaderTitle,
} from "@/layout/ItemCardLayout";
import { cn } from "@/lib/utils";
import { type ThemePreference, useUserSettingsStore } from "@/store";
import InstallAppBanner from "./components/InstallAppBanner";

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const themeDescription: Record<ThemePreference, string> = {
  light: "Don't Burn your eyes, enable dark mode 🌚",
  dark: "Let's see the light, disable the dark mode 🌞",
  system: "Following your device, and switching along with it 🖥️",
};

const Settings = () => {
  const userSettings = useUserSettingsStore();

  return (
    <main className="flex flex-col gap-2 mt-2">
      <InstallAppBanner />

      <ItemCardLayout className="flex-col items-stretch gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <ItemCardHeaderTitle>Theme</ItemCardHeaderTitle>
          <ItemCardBody className="mt-0">
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
          </ItemCardBody>
        </div>

        <ItemCardHeaderDescription className="w-full">
          {themeDescription[userSettings.theme]}
        </ItemCardHeaderDescription>
      </ItemCardLayout>

      <ItemCardLayout className="flex-col items-stretch gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <ItemCardHeaderTitle>Currency</ItemCardHeaderTitle>
          <ItemCardBody className="mt-0 w-2/6">
            <Input
              type="text"
              value={userSettings.currency}
              className="w-full text-center"
              placeholder="ex. $"
              onChange={(e) => userSettings.updateCurrency(e.target.value)}
              autoComplete="off"
            />
          </ItemCardBody>
        </div>

        <ItemCardHeaderDescription className="w-full">
          What symbol do you use to represent your money? 🤑
        </ItemCardHeaderDescription>
      </ItemCardLayout>

      <ItemCardLayout className="flex-col items-stretch gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <ItemCardHeaderTitle>Daily Expense Limit</ItemCardHeaderTitle>
          <ItemCardBody className="mt-0 w-2/6">
            <Input
              type="number"
              value={userSettings.dailyLimit || ""}
              className="w-full text-center"
              placeholder="ex. 10"
              onChange={(e) =>
                userSettings.updateDailyLimit(Number(e.target.value))
              }
            />
          </ItemCardBody>
        </div>

        <ItemCardHeaderDescription className="w-full">
          What is enough for the day? 🤔
        </ItemCardHeaderDescription>
      </ItemCardLayout>

      <ItemCardLayout className="flex-col items-stretch gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <ItemCardHeaderTitle>Daily Expense Warning</ItemCardHeaderTitle>
          <ItemCardBody className="mt-0 w-2/6">
            <Input
              type="number"
              value={userSettings.warningLimit || ""}
              className="w-full text-center"
              placeholder="ex. 5"
              onChange={(e) =>
                userSettings.updateWarningLimit(Number(e.target.value))
              }
            />
          </ItemCardBody>
        </div>

        <ItemCardHeaderDescription className="w-full">
          When should i warn you? 🚨
        </ItemCardHeaderDescription>
      </ItemCardLayout>
    </main>
  );
};

export default Settings;

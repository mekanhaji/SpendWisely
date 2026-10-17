import { Input } from "@/components/ui/input";
import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeader,
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

      <ItemCardLayout>
        <ItemCardHeader>
          <ItemCardHeaderTitle>Theme</ItemCardHeaderTitle>
          <ItemCardHeaderDescription>
            {themeDescription[userSettings.theme]}
          </ItemCardHeaderDescription>
        </ItemCardHeader>
        <ItemCardBody>
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
      </ItemCardLayout>

      <ItemCardLayout>
        <ItemCardHeader>
          <ItemCardHeaderTitle>Currency</ItemCardHeaderTitle>
          <ItemCardHeaderDescription>
            What you symbol do you use to represent your money? 🤑
          </ItemCardHeaderDescription>
        </ItemCardHeader>
        <ItemCardBody className="w-2/6">
          <Input
            type="text"
            value={userSettings.currency}
            className="w-full text-center"
            placeholder="ex. $"
            onChange={(e) => userSettings.updateCurrency(e.target.value)}
          />
        </ItemCardBody>
      </ItemCardLayout>

      <ItemCardLayout>
        <ItemCardHeader>
          <ItemCardHeaderTitle>Daily Expense Limit</ItemCardHeaderTitle>
          <ItemCardHeaderDescription>
            What is enough for the day? 🤔
          </ItemCardHeaderDescription>
        </ItemCardHeader>
        <ItemCardBody className="w-2/6">
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
      </ItemCardLayout>

      <ItemCardLayout>
        <ItemCardHeader>
          <ItemCardHeaderTitle>Daily Expense Warning</ItemCardHeaderTitle>
          <ItemCardHeaderDescription>
            When should i warn you? 🚨
          </ItemCardHeaderDescription>
        </ItemCardHeader>
        <ItemCardBody className="w-2/6">
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
      </ItemCardLayout>
    </main>
  );
};

export default Settings;

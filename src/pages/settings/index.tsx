import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import SegmentedControl from "@/components/ui/segmented-control";
import { useExpenseStore, useUserSettingsStore } from "@/store";
import { AppRows } from "./components/AppRows";
import { DataRows } from "./components/DataRows";
import { SettingsRow, SettingsSection } from "./components/SettingsSection";
import { settingCopy, themeOptions } from "./setting";

const Settings = () => {
  const navigate = useNavigate();
  const userSettings = useUserSettingsStore();
  const categoryCount = useExpenseStore((state) => state.categories.length);

  return (
    <div className="mt-2 flex flex-col gap-6">
      <SettingsSection title="Budget">
        <SettingsRow {...settingCopy.dailyLimit} htmlFor="daily-limit">
          <Input
            id="daily-limit"
            type="number"
            inputMode="numeric"
            min="0"
            value={userSettings.dailyLimit || ""}
            className="h-10 w-28 text-right"
            placeholder="ex. 500"
            onChange={(e) =>
              userSettings.updateDailyLimit(Number(e.target.value))
            }
          />
        </SettingsRow>
        <SettingsRow {...settingCopy.warningLimit} htmlFor="warning-limit">
          <Input
            id="warning-limit"
            type="number"
            inputMode="numeric"
            min="0"
            value={userSettings.warningLimit || ""}
            className="h-10 w-28 text-right"
            placeholder="ex. 400"
            onChange={(e) =>
              userSettings.updateWarningLimit(Number(e.target.value))
            }
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow {...settingCopy.currency} htmlFor="currency">
          <Input
            id="currency"
            type="text"
            maxLength={4}
            value={userSettings.currency}
            className="h-10 w-20 text-center"
            placeholder="ex. $"
            onChange={(e) => userSettings.updateCurrency(e.target.value)}
          />
        </SettingsRow>
        <SettingsRow {...settingCopy.theme}>
          <SegmentedControl
            ariaLabel="Theme"
            value={userSettings.theme}
            onChange={userSettings.setTheme}
            options={themeOptions}
            className="w-60"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsRow
          title={settingCopy.categories.title}
          description={`${categoryCount} ${categoryCount === 1 ? "category" : "categories"}. ${settingCopy.categories.description}`}
          onClick={() =>
            navigate("/settings/categories", { viewTransition: true })
          }
        />
        <DataRows />
      </SettingsSection>

      <SettingsSection title="App">
        <AppRows />
      </SettingsSection>

      <p className="text-center text-xs text-muted-foreground">
        v{__APP_VERSION__} ({__APP_COMMIT__})
      </p>
    </div>
  );
};

export default Settings;

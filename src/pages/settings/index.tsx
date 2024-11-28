import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import AppLayout from "@/layout";
import { useUserSettingsStore } from "@/store";
import { useState } from "react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const userSettings = useUserSettingsStore();

  return (
    <AppLayout>
      <main className="flex flex-col gap-2 mt-2">
        <div className="bg-app-100 flex justify-between p-2 items-center rounded-lg">
          <div>
            <h2 className="text-xl font-bold">Dark Theme</h2>
            <p className="text-muted-foreground text-sm w-5/6">
              {darkMode
                ? "Let's see the light, disable the dark mode 🌞"
                : "Don't Burn your eyes, enable dark mode 🌚"}
            </p>
          </div>
          <div>
            <Switch
              checked={darkMode}
              onCheckedChange={() => setDarkMode(!darkMode)}
            />
          </div>
        </div>

        <div className="bg-app-100 flex justify-between p-2 items-center rounded-lg">
          <div>
            <h2 className="text-xl font-bold">Currency</h2>
            <p className="text-muted-foreground text-sm w-4/6">
              What you symbol do you use to represent your money? 🤑
            </p>
          </div>

          <Input
            type="text"
            value={userSettings.currency}
            className="w-1/6 text-center"
            min={1}
            max={2}
            onChange={(e) => userSettings.updateCurrency(e.target.value)}
          />
        </div>
      </main>
    </AppLayout>
  );
};

export default Settings;

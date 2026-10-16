import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ItemCardLayout, {
  ItemCardBody,
  ItemCardHeader,
  ItemCardHeaderDescription,
  ItemCardHeaderTitle,
} from "@/layout/ItemCardLayout";
import { useUserSettingsStore } from "@/store";
import InstallAppBanner from "./components/InstallAppBanner";

type SettingsProps = {
  showInstallBanner?: boolean;
};

const Settings = ({ showInstallBanner = false }: SettingsProps) => {
  const userSettings = useUserSettingsStore();

  return (
    <main className="flex flex-col gap-2 mt-2">
      {showInstallBanner && <InstallAppBanner />}

      <ItemCardLayout>
        <ItemCardHeader>
          <ItemCardHeaderTitle>Dark Theme</ItemCardHeaderTitle>
          <ItemCardHeaderDescription>
            {userSettings.theme === "dark"
              ? "Let's see the light, disable the dark mode 🌞"
              : "Don't Burn your eyes, enable dark mode 🌚"}
          </ItemCardHeaderDescription>
        </ItemCardHeader>
        <ItemCardBody>
          <Switch
            checked={userSettings.theme === "dark"}
            onCheckedChange={() => userSettings.toggleTheme()}
          />
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

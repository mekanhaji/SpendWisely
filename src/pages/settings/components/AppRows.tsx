import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { isIOS } from "@/lib/pwa";
import { usePwaInstallStore, usePwaUpdateStore } from "@/store";
import { SettingsRow } from "./SettingsSection";

const RELEASES_URL = "https://github.com/mekanhaji/SpendWisely/releases/latest";

const IOS_STEPS = [
  "Tap the Share button in Safari's toolbar.",
  "Scroll down and choose “Add to Home Screen”.",
  "Tap “Add”.",
];

/**
 * Install row. Chromium offers a real install prompt; iOS has none, so it gets
 * step-by-step instructions instead. Hidden once installed or where neither
 * route exists.
 */
const InstallRow = () => {
  const installStatus = usePwaInstallStore((state) => state.installStatus);
  const promptInstall = usePwaInstallStore((state) => state.promptInstall);
  const [showSteps, setShowSteps] = useState(false);

  if (installStatus === "available") {
    return (
      <SettingsRow
        title="Install app"
        description="Add Spend Wisely to your home screen for faster access."
      >
        <Button size="sm" onClick={() => void promptInstall()}>
          Install
        </Button>
      </SettingsRow>
    );
  }

  if (isIOS() && installStatus !== "installed") {
    return (
      <>
        <SettingsRow
          title="Add to Home Screen"
          description="Open it like any other app."
          onClick={() => setShowSteps(true)}
        />
        <Drawer open={showSteps} onOpenChange={setShowSteps}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add to Home Screen</DrawerTitle>
              <DrawerDescription>
                Safari on iPhone and iPad installs apps from the Share menu.
              </DrawerDescription>
            </DrawerHeader>
            <ol className="flex flex-col gap-3">
              {IOS_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <DrawerFooter>
              <Button size="lg" onClick={() => setShowSteps(false)}>
                Got it
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  if (installStatus === "installed") {
    return (
      <SettingsRow
        title="App installed"
        description="You are using the installed app."
      >
        <Check className="h-5 w-5 text-primary" aria-hidden="true" />
      </SettingsRow>
    );
  }

  return null;
};

/** Shows when a new version is waiting, so a dismissed toast is not the last chance. */
const UpdateRow = () => {
  const waitingWorker = usePwaUpdateStore((state) => state.waitingWorker);
  const applyUpdate = usePwaUpdateStore((state) => state.applyUpdate);

  if (!waitingWorker) return null;

  return (
    <SettingsRow
      title="Update available"
      description="A new version of Spend Wisely is ready."
    >
      <Button size="sm" onClick={applyUpdate}>
        Reload
      </Button>
    </SettingsRow>
  );
};

/** Install, update and release notes, in one group. */
export const AppRows = () => (
  <>
    <InstallRow />
    <UpdateRow />
    <SettingsRow title="What's new" description="Release notes" href={RELEASES_URL} />
  </>
);

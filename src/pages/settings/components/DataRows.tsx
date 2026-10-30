import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  BackupError,
  backupFileName,
  createBackup,
  parseBackup,
  toCsv,
  type BackupData,
} from "@/lib/backup";
import {
  isStoragePersisted,
  requestPersistentStorage,
  shareOrDownloadFile,
} from "@/lib/pwa";
import { useExpenseStore, useToastStore, useUserSettingsStore } from "@/store";
import { SettingsRow } from "./SettingsSection";

/** A backup is a few KB per thousand expenses; anything this big is not one. */
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

const formatShort = (datetime: string) =>
  new Date(datetime).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const describeRange = (records: BackupData["expenseRecords"]): string => {
  if (records.length === 0) return "";
  const times = records.map((record) => new Date(record.datetime).getTime());
  const first = formatShort(new Date(Math.min(...times)).toISOString());
  const last = formatShort(new Date(Math.max(...times)).toISOString());
  return first === last ? ` from ${first}` : ` from ${first} to ${last}`;
};

/**
 * Backup, restore and storage rows. Expenses live only in this browser, so
 * getting a copy out (and back in) is the only protection against a cleared
 * browser or a lost phone.
 */
export const DataRows = () => {
  const expenseRecords = useExpenseStore((state) => state.expenseRecords);
  const categories = useExpenseStore((state) => state.categories);
  const replaceAll = useExpenseStore((state) => state.replaceAll);
  const settings = useUserSettingsStore();
  const showToast = useToastStore((state) => state.show);

  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  const storageSupported = Boolean(navigator.storage?.persist);

  useEffect(() => {
    if (storageSupported) void isStoragePersisted().then(setPersisted);
  }, [storageSupported]);

  const exportFile = async (file: File) => {
    const result = await shareOrDownloadFile(file);
    if (result === "downloaded") showToast({ message: `Saved ${file.name}` });
  };

  const exportBackup = () =>
    exportFile(
      new File(
        [
          createBackup(expenseRecords, categories, {
            dailyLimit: settings.dailyLimit,
            warningLimit: settings.warningLimit,
            currency: settings.currency,
            theme: settings.theme,
          }),
        ],
        backupFileName("json"),
        { type: "application/json" },
      ),
    );

  const exportCsv = () =>
    exportFile(
      new File([toCsv(expenseRecords)], backupFileName("csv"), {
        type: "text/csv",
      }),
    );

  const handleFileChosen = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_BACKUP_BYTES) {
      showToast({ message: "That file is too large to be a backup." });
      return;
    }

    try {
      setPendingImport(parseBackup(await file.text()));
    } catch (error) {
      showToast({
        message:
          error instanceof BackupError
            ? error.message
            : "Could not read that file.",
      });
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    replaceAll(pendingImport);
    useUserSettingsStore.setState(pendingImport.settings);
    showToast({
      message: `Imported ${pendingImport.expenseRecords.length} expenses`,
    });
    setPendingImport(null);
  };

  const protectStorage = async () => {
    const granted = await requestPersistentStorage();
    setPersisted(granted);
    if (!granted) {
      showToast({
        message:
          "The browser said no. Installing the app usually allows it.",
      });
    }
  };

  const hasExpenses = expenseRecords.length > 0;

  return (
    <>
      <SettingsRow
        title="Export backup"
        description="Everything in one JSON file."
        onClick={() => void exportBackup()}
      />
      <SettingsRow
        title="Export as CSV"
        description="For a spreadsheet."
        onClick={() => void exportCsv()}
        disabled={!hasExpenses}
      />
      <SettingsRow
        title="Import backup"
        description="Replaces what is on this device."
        onClick={() => fileInput.current?.click()}
      />
      {/* The hidden attribute also keeps it out of the card's dividers. */}
      <input
        ref={fileInput}
        hidden
        type="file"
        accept=".json,application/json"
        onChange={(event) => void handleFileChosen(event)}
      />

      {storageSupported && persisted !== null && (
        <SettingsRow
          title="Protect my data"
          description={
            persisted
              ? "The browser keeps your expenses when space runs low."
              : "Ask the browser to keep your expenses when space runs low."
          }
        >
          {persisted ? (
            <Check className="h-5 w-5 text-primary" aria-label="Protected" />
          ) : (
            <Button size="sm" onClick={() => void protectStorage()}>
              Turn on
            </Button>
          )}
        </SettingsRow>
      )}

      <Drawer
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Replace your data?</DrawerTitle>
            <DrawerDescription>
              {pendingImport
                ? `This backup has ${pendingImport.expenseRecords.length} expenses${describeRange(pendingImport.expenseRecords)}. `
                : ""}
              {hasExpenses
                ? `Your current ${expenseRecords.length} expenses will be replaced. Export a backup first if you want to keep them.`
                : "You have no expenses on this device yet."}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" size="lg" onClick={confirmImport}>
              Replace data
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="lg">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

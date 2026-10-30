import { z } from "zod";
import {
  EXPENSE_STORE_VERSION,
  UNCATEGORIZED_CATEGORY,
  mergeCategoryNames,
  migrateExpenseState,
} from "@/lib/migrations/expense-migrations";
import { toLocalISODate } from "@/lib/expense-filter";
import type { ExpenseRecord, UserSettings } from "@/store";

/** Bump when the backup file layout changes, not when the expense shape does. */
const BACKUP_FORMAT = 1;
const BACKUP_APP = "spend-wisely";

export type BackupSettings = Pick<
  UserSettings,
  "dailyLimit" | "warningLimit" | "currency" | "theme"
>;

export type BackupData = {
  expenseRecords: ExpenseRecord[];
  categories: string[];
  settings: Partial<BackupSettings>;
};

const settingsSchema = z
  .object({
    dailyLimit: z.number().finite().nonnegative(),
    warningLimit: z.number().finite().nonnegative(),
    currency: z.string().max(8),
    theme: z.enum(["light", "dark", "system"]),
  })
  .partial();

// Records are checked loosely on purpose: a backup from an older app version
// has the old shape, and migrateExpenseState brings it up to date afterwards.
const looseRecordSchema = z
  .object({
    datetime: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Invalid date",
    }),
    amount: z.number().finite(),
  })
  .passthrough();

const backupSchema = z.object({
  app: z.literal(BACKUP_APP),
  format: z.number().int().positive(),
  expenseStoreVersion: z.number().int().nonnegative(),
  expenseRecords: z.array(looseRecordSchema),
  categories: z.array(z.string()).optional(),
  settings: settingsSchema.optional(),
});

export const createBackup = (
  expenseRecords: ExpenseRecord[],
  categories: string[],
  settings: BackupSettings,
): string =>
  JSON.stringify(
    {
      app: BACKUP_APP,
      format: BACKUP_FORMAT,
      expenseStoreVersion: EXPENSE_STORE_VERSION,
      exportedAt: new Date().toISOString(),
      expenseRecords,
      categories,
      settings,
    },
    null,
    2,
  );

export class BackupError extends Error {}

/** Parse and validate a backup file; throws BackupError with a readable reason. */
export const parseBackup = (text: string): BackupData => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupError("That file is not valid JSON.");
  }

  const parsed = backupSchema.safeParse(json);
  if (!parsed.success) {
    throw new BackupError("That file is not a Spend Wisely backup.");
  }
  if (parsed.data.format > BACKUP_FORMAT) {
    throw new BackupError(
      "This backup comes from a newer version of Spend Wisely. Update the app first.",
    );
  }

  const migrated = migrateExpenseState(
    {
      expenseRecords: parsed.data.expenseRecords,
      categories: parsed.data.categories,
    },
    parsed.data.expenseStoreVersion,
  );

  // Drop duplicates by timestamp: it doubles as the record id, so a repeat
  // would make edit and delete hit the wrong row.
  const seen = new Set<string>();
  const expenseRecords: ExpenseRecord[] = [];
  for (const record of migrated.expenseRecords ?? []) {
    if (seen.has(record.datetime)) continue;
    seen.add(record.datetime);
    expenseRecords.push({
      datetime: record.datetime,
      amount: record.amount,
      category: record.category?.trim() || UNCATEGORIZED_CATEGORY,
      notes: record.notes?.trim() ?? "",
    });
  }

  return {
    expenseRecords,
    categories: mergeCategoryNames(
      migrated.categories ?? [],
      expenseRecords.map((record) => record.category),
    ),
    settings: parsed.data.settings ?? {},
  };
};

/**
 * Spreadsheets run text that starts with = + - @ as a formula, which a note
 * like "-5 refund" or a pasted "=HYPERLINK(...)" would trigger. A leading
 * apostrophe keeps it as plain text.
 */
const csvCell = (value: string): string => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

const UTF8_BOM = String.fromCharCode(0xfeff);

export const toCsv = (records: ExpenseRecord[]): string => {
  const rows = [...records]
    .sort((a, b) => a.datetime.localeCompare(b.datetime))
    .map((record) => {
      const date = new Date(record.datetime);
      return [
        toLocalISODate(date),
        date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        csvCell(record.category),
        csvCell(record.notes),
        String(record.amount),
      ].join(",");
    });

  // BOM so Excel reads the file as UTF-8 (the rupee sign, accents in notes).
  return `${UTF8_BOM}date,time,category,notes,amount\n${rows.join("\n")}\n`;
};

export const backupFileName = (extension: "json" | "csv"): string =>
  `spend-wisely-${extension === "json" ? "backup" : "expenses"}-${toLocalISODate(new Date())}.${extension}`;

# Changelog

All notable changes to Spend Wisely are documented here.

## Unreleased

### Changed

- **New look.** Inter replaces the monospace font, with tabular numbers for amounts. Screens use cards and grouped lists, the clay accent is now used, and dark mode keeps the same structure.
- **App-style navigation.** A slim top bar and a bottom tab bar replace the large title and top tabs. The add button sits above the tab bar, on the thumb side. Tab and page changes cross-fade.
- **Home.** The budget header now shows what is left of the daily limit (or how far over). Filters are one scrollable row. Expenses are grouped by day with sticky day headers and day totals.
- **Add and edit** open as a bottom sheet with a large amount field. Save stays disabled until the amount is valid, so an empty amount can no longer be saved as 0.
- **Analytics.** New "By category" breakdown, over-limit days are highlighted in the chart, and a Share button sends a text summary (or copies it where sharing is not available).
- **Settings** is grouped into Budget, Preferences, Data and App. Categories are renamed and deleted from sheets.

### Added

- **Swipe to delete, with Undo.** Swipe an expense left to delete it. Every delete (swipe or button) shows an Undo toast.
- **Backup and restore.** Export everything as JSON, export expenses as CSV, and import a backup. Imports are validated, older backups are migrated, and you confirm before anything is replaced.
- **Works offline from the first visit.** The app shell is cached on install, so every screen opens offline even if you never visited it online.
- **Add expense shortcut** (long-press the app icon) and **share target**: share a payment message to the app and the add sheet opens with the amount and note filled in (Android).
- **App badge** on the home-screen icon while today is over the daily limit.
- **Protect my data.** Asks the browser to keep your expenses when storage runs low; also requested automatically for installed apps and after the first expense.
- **Maskable app icon**, iOS home-screen meta tags and edge-to-edge layout with safe-area support.
- Update notice is now a toast with a Reload button, plus an "Update available" row in Settings.

## 0.5.2

### Added

- **Category suggestions.** The add-expense dialog now shows up to four category chips ranked from your history: how recently and often you used a category, the time of day, and the amount once you type one. Tapping a chip with an amount filled in records the expense immediately; with no amount it selects the category and focuses the amount field. Under 15 recorded expenses the chips use plain frequency order, and a chip is marked as a likely match only when the lead is clear.

## 0.5.0

### Added

- **Categories.** Expenses are now filed under a category instead of a free-text description. Pick one from the list or type a new name and create it inline — new categories are saved for next time.
- **Notes.** An optional note can be attached to an expense via the "Add note" button in the add/edit dialog. Notes show under the category in the expense lists.

### Added

- **Category management page.** The Settings screen now links to a categories page where you can add, rename or delete the categories you file expenses under. Deleting a category moves its expenses to "Uncategorized".

### Changed

- Existing expenses are migrated automatically, once, in the browser: each old description becomes that expense's category, and is copied into its note. No action needed and nothing is lost.
- Sample seed data now uses categories and notes.

## 0.4.0

### Added

- **Real Analytics tab.** Replaced the placeholder Analytics view with an actual analytics dashboard:
  - Spending trend chart (daily totals) with your daily limit shown as a reference line
  - Summary stats: total spent, average per day, highest spending day, transaction count
  - Budget comparison against your daily limit and warning threshold, per day or aggregated for longer periods
  - Top 5 expenses for the selected period, with quick edit/delete

### Fixed

- The daily spending progress bar no longer shows `NaN` when the daily limit is set to 0.
- The floating "Add expense" button could overlap content at the bottom of longer pages (most noticeable on mobile, on the new Analytics tab). It now always has clear space below it.
- A couple of minor mobile layout rough edges: the "highest day" summary stat no longer wraps awkwardly, and the spending chart's limit line no longer sits flush against the top edge.

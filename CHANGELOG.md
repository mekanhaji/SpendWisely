# Changelog

All notable changes to Spend Wisely are documented here.

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

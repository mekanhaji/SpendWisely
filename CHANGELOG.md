# Changelog

All notable changes to Spend Wisely are documented here.

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

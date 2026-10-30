// run in dev console to seed three weeks of sample data for screenshots
(() => {
  const today = new Date();

  const at = (hours, minutes) => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  /** Date `daysBack` days ago, at the given local time. */
  const daysAgoAt = (daysBack, hours, minutes) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysBack);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  /**
   * Small seeded PRNG (mulberry32) so re-running the seed reproduces the
   * exact same three weeks instead of reshuffling everything.
   */
  let seed = 20261020;
  const random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** Pick an item, cheap first, weighted so small stuff happens more often. */
  const pick = (items) => items[Math.floor(random() * items.length)];
  const between = (min, max) => Math.round(min + random() * (max - min));

  /** Everyday catalogue, kept ₹-flavour consistent with the original seed. */
  const LIGHT = [
    { category: "Food", notes: "Morning Chai", amount: [20, 20] },
    { category: "Transport", notes: "Metro", amount: [30, 40] },
    { category: "Transport", notes: "Auto", amount: [40, 70] },
    { category: "Food", notes: "Snacks", amount: [40, 70] },
    { category: "Food", notes: "Coffee", amount: [45, 60] },
  ];
  const MEDIUM = [
    { category: "Food", notes: "Lunch", amount: [100, 150] },
    { category: "Food", notes: "Groceries", amount: [120, 260] },
    { category: "Food", notes: "Fruits", amount: [80, 120] },
  ];
  const SPLURGE = [
    { category: "Food", notes: "Dinner out", amount: [220, 350] },
    { category: "Entertainment", notes: "Movie", amount: [250, 320] },
    { category: "Shopping", notes: "Shopping", amount: [200, 450] },
  ];

  /** Today's records stay the original curated set so the header reads nicely. */
  const expenseRecords = [
    { datetime: at(8, 15), amount: 20, category: "Food", notes: "Morning Chai" },
    { datetime: at(9, 30), amount: 30, category: "Transport", notes: "Metro" },
    { datetime: at(13, 5), amount: 120, category: "Food", notes: "Lunch" },
    { datetime: at(16, 45), amount: 50, category: "Food", notes: "Snacks" },
    { datetime: at(19, 20), amount: 100, category: "Food", notes: "Groceries" },
  ];

  // The previous 20 days: 1–3 light items everywhere, lunch on most weekdays,
  // an occasional no-spend day (33%), and a guaranteed splurge each past
  // Saturday so analytics has real top expenses to rank.
  const pastSaturdays = [];
  for (let daysBack = 1; daysBack <= 20; daysBack++) {
    const weekday = new Date(today);
    weekday.setDate(weekday.getDate() - daysBack);
    if (weekday.getDay() === 6) pastSaturdays.push(daysBack);
  }
  for (let daysBack = 1; daysBack <= 20; daysBack++) {
    const weekday = new Date(today);
    weekday.setDate(weekday.getDate() - daysBack);
    const isWeekend = weekday.getDay() === 0 || weekday.getDay() === 6;

    if (random() < 0.33) continue; // no-spend day

    let count = isWeekend ? between(2, 4) : between(1, 3);
    if (pastSaturdays.includes(daysBack)) {
      const splurge = pick(SPLURGE);
      expenseRecords.push({
        datetime: daysAgoAt(daysBack, 20, 30),
        amount: between(...splurge.amount),
        category: splurge.category,
        notes: splurge.notes,
      });
      count -= 1;
    }

    const hadLunch = !isWeekend && random() < 0.75;
    for (let i = 0; i < count; i++) {
      const item = pick(hadLunch ? [...MEDIUM, ...LIGHT] : LIGHT);
      expenseRecords.push({
        datetime: daysAgoAt(daysBack, 8 + i * 4 % 12, between(0, 55)),
        amount: between(...item.amount),
        category: item.category,
        notes: item.notes,
      });
    }
  }

  // Keep records chronological (oldest first) like the app adds them.
  expenseRecords.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const currentExpense = expenseRecords
    .filter((record) => new Date(record.datetime).toDateString() === today.toDateString())
    .reduce((sum, record) => sum + record.amount, 0);

  localStorage.setItem(
    "expense-store",
    JSON.stringify({
      state: {
        currentExpense,
        expenseRecords,
        categories: [
          "Food",
          "Transport",
          "Bills",
          "Shopping",
          "Entertainment",
          "Health",
          "Other",
        ],
      },
      // Keep in sync with EXPENSE_STORE_VERSION so reseeding does not trigger
      // the description -> category migration.
      version: 2,
    }),
  );

  const existingSettings = JSON.parse(
    localStorage.getItem("user-settings") ?? "null",
  );

  localStorage.setItem(
    "user-settings",
    JSON.stringify({
      state: {
        dailyLimit: 500,
        currency: "₹",
        warningLimit: existingSettings?.state?.warningLimit ?? 80,
        theme: existingSettings?.state?.theme ?? "system",
      },
      version: 0,
    }),
  );

  const total = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
  console.log(
    `Seeded ${expenseRecords.length} expenses across three weeks totalling ₹${total} (today: ₹${currentExpense}). Reload the page.`,
  );
})();

// run in dev console to seed sample data for screenshots
(() => {
  const today = new Date();

  const at = (hours, minutes) => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const expenseRecords = [
    { datetime: at(8, 15), amount: 20, description: "Morning Chai" },
    { datetime: at(9, 30), amount: 30, description: "Metro" },
    { datetime: at(13, 5), amount: 120, description: "Lunch" },
    { datetime: at(16, 45), amount: 50, description: "Snacks" },
    { datetime: at(19, 20), amount: 100, description: "Groceries" },
  ];

  const currentExpense = expenseRecords.reduce(
    (sum, record) => sum + record.amount,
    0,
  );

  localStorage.setItem(
    "expense-store",
    JSON.stringify({
      state: { currentExpense, expenseRecords },
      version: 1,
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

  console.log(
    `Seeded ${expenseRecords.length} expenses totalling ₹${currentExpense}. Reload the page.`,
  );
})();

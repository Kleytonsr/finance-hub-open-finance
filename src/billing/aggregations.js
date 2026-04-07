export function aggregateRoots(transactions, totalBill) {
  const roots = new Map();

  transactions.forEach((transaction) => {
    if (!roots.has(transaction.group)) {
      roots.set(transaction.group, {
        key: transaction.group,
        root: transaction.group,
        total: 0,
        count: 0,
        categories: new Map(),
        merchants: new Map(),
        subgroups: new Map(),
      });
    }

    const row = roots.get(transaction.group);
    row.total += transaction.amount;
    row.count += 1;
    row.categories.set(
      transaction.category,
      (row.categories.get(transaction.category) || 0) + transaction.amount,
    );
    row.merchants.set(
      transaction.merchant,
      (row.merchants.get(transaction.merchant) || 0) + transaction.amount,
    );
    row.subgroups.set(
      transaction.subgroup,
      (row.subgroups.get(transaction.subgroup) || 0) + transaction.amount,
    );
  });

  return [...roots.values()]
    .map((row) => {
      const categories = [...row.categories.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, total]) => ({
          name,
          total,
          sharePct: (total / row.total) * 100,
        }));

      const merchants = [...row.merchants.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, total]) => ({ name, total }));

      const subgroups = [...row.subgroups.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, total]) => ({
          name,
          total,
          sharePct: (total / row.total) * 100,
        }));

      return {
        key: row.key,
        root: row.root,
        total: row.total,
        count: row.count,
        sharePct: (row.total / totalBill) * 100,
        categories,
        merchants,
        subgroups,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function aggregateCategories(transactions, totalBill) {
  const categories = new Map();

  transactions.forEach((transaction) => {
    if (!categories.has(transaction.category)) {
      categories.set(transaction.category, {
        key: transaction.category,
        category: transaction.category,
        total: 0,
        count: 0,
      });
    }

    const row = categories.get(transaction.category);
    row.total += transaction.amount;
    row.count += 1;
  });

  return [...categories.values()]
    .map((row) => ({
      ...row,
      sharePct: (row.total / totalBill) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}

export function aggregateMerchants(transactions, totalBill) {
  const merchants = new Map();

  transactions.forEach((transaction) => {
    const key = `${transaction.group}::${transaction.merchant}`;
    if (!merchants.has(key)) {
      merchants.set(key, {
        key,
        root: transaction.group,
        merchant: transaction.merchant,
        category: transaction.category,
        subgroup: transaction.subgroup,
        total: 0,
        count: 0,
        samples: new Set(),
        cards: new Map(),
        channels: new Map(),
      });
    }

    const row = merchants.get(key);
    row.total += transaction.amount;
    row.count += 1;
    row.samples.add(transaction.description);
    row.cards.set(
      transaction.card_last4,
      (row.cards.get(transaction.card_last4) || 0) + transaction.amount,
    );
    row.channels.set(
      transaction.channel,
      (row.channels.get(transaction.channel) || 0) + 1,
    );
  });

  return [...merchants.values()]
    .map((row) => ({
      ...row,
      sharePct: (row.total / totalBill) * 100,
      samples: [...row.samples].slice(0, 3),
      cards: [...row.cards.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, total]) => ({ name, total })),
      channels: [...row.channels.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    }))
    .sort((a, b) => b.total - a.total);
}

export function aggregateDays(transactions, totalBill) {
  const days = new Map();

  transactions.forEach((transaction) => {
    if (!days.has(transaction.date)) {
      days.set(transaction.date, {
        key: transaction.date,
        date: transaction.date,
        total: 0,
        count: 0,
      });
    }

    const row = days.get(transaction.date);
    row.total += transaction.amount;
    row.count += 1;
  });

  return [...days.values()]
    .map((row) => ({
      ...row,
      sharePct: (row.total / totalBill) * 100,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

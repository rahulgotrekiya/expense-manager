// Transactions Module

const Transactions = {
  // Get all transactions
  getAll() {
    return Storage.get(Storage.KEYS.TRANSACTIONS) || [];
  },

  // Get transaction by ID
  getById(id) {
    const transactions = this.getAll();
    return transactions.find((t) => t.id === id);
  },

  // Add new transaction
  add(transaction) {
    const transactions = this.getAll();
    const newTransaction = {
      id: generateId(),
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      category: transaction.category,
      date: transaction.date,
      description: transaction.description || "",
      notes: transaction.notes || "",
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    Storage.set(Storage.KEYS.TRANSACTIONS, transactions);
    return newTransaction;
  },

  // Update transaction
  update(id, updates) {
    const transactions = this.getAll();
    const index = transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        ...updates,
        amount: parseFloat(updates.amount),
        updatedAt: new Date().toISOString(),
      };
      Storage.set(Storage.KEYS.TRANSACTIONS, transactions);
      return transactions[index];
    }
    return null;
  },

  // Delete transaction
  delete(id) {
    const transactions = this.getAll();
    const filtered = transactions.filter((t) => t.id !== id);
    Storage.set(Storage.KEYS.TRANSACTIONS, filtered);
    return true;
  },

  // Get transactions by date range
  getByDateRange(startDate, endDate) {
    const transactions = this.getAll();
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  },

  // Get transactions by type
  getByType(type) {
    const transactions = this.getAll();
    return transactions.filter((t) => t.type === type);
  },

  // Get transactions by category
  getByCategory(category) {
    const transactions = this.getAll();
    return transactions.filter((t) => t.category === category);
  },

  // Get recent transactions
  getRecent(limit = 5) {
    const transactions = this.getAll();
    return sortBy(transactions, "date", "desc").slice(0, limit);
  },

  // Calculate totals
  calculateTotals(transactions) {
    const income = sumBy(
      transactions.filter((t) => t.type === "income"),
      "amount"
    );
    const expenses = sumBy(
      transactions.filter((t) => t.type === "expense"),
      "amount"
    );
    const balance = income - expenses;

    return {
      income,
      expenses,
      balance,
    };
  },

  // Get statistics for period
  getStatistics(period = "thisMonth") {
    const range = getDateRange(period);
    const transactions = this.getAll().filter((t) =>
      isDateInRange(t.date, range)
    );

    const totals = this.calculateTotals(transactions);

    // Get previous period for comparison
    const prevRange = this.getPreviousPeriodRange(period);
    const prevTransactions = this.getAll().filter((t) =>
      isDateInRange(t.date, prevRange)
    );
    const prevTotals = this.calculateTotals(prevTransactions);

    return {
      current: totals,
      previous: prevTotals,
      changes: {
        balance: calculatePercentageChange(totals.balance, prevTotals.balance),
        income: calculatePercentageChange(totals.income, prevTotals.income),
        expenses: calculatePercentageChange(
          totals.expenses,
          prevTotals.expenses
        ),
      },
      transactions,
      transactionCount: transactions.length,
    };
  },

  // Get previous period range
  getPreviousPeriodRange(period) {
    const today = new Date();
    const ranges = {
      thisMonth: {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth(), 0),
      },
      lastMonth: {
        start: new Date(today.getFullYear(), today.getMonth() - 2, 1),
        end: new Date(today.getFullYear(), today.getMonth() - 1, 0),
      },
      last30Days: {
        start: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      thisYear: {
        start: new Date(today.getFullYear() - 1, 0, 1),
        end: new Date(today.getFullYear() - 1, 11, 31),
      },
    };

    return ranges[period] || ranges.thisMonth;
  },

  // Get weekly data for chart
  getWeeklyData(period = "thisMonth") {
    const range = getDateRange(period);
    const transactions = this.getAll().filter((t) =>
      isDateInRange(t.date, range)
    );

    // Calculate number of weeks in period
    const days = Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(days / 7);

    const weeklyData = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(
        range.start.getTime() + i * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

      const weekTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date >= weekStart && date <= weekEnd;
      });

      const income = sumBy(
        weekTransactions.filter((t) => t.type === "income"),
        "amount"
      );
      const expenses = sumBy(
        weekTransactions.filter((t) => t.type === "expense"),
        "amount"
      );

      weeklyData.push({
        week: `Week ${i + 1}`,
        income,
        expenses,
      });
    }

    return weeklyData;
  },

  // Search transactions
  search(searchTerm) {
    const transactions = this.getAll();
    return searchInArray(transactions, searchTerm, [
      "description",
      "notes",
      "category",
      "amount",
    ]);
  },

  // Filter transactions
  filter(filters) {
    let transactions = this.getAll();

    // Date range filter
    if (filters.period && filters.period !== "all") {
      const range = getDateRange(filters.period);
      transactions = transactions.filter((t) => isDateInRange(t.date, range));
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      transactions = transactions.filter((t) => t.type === filters.type);
    }

    // Category filter
    if (filters.category) {
      transactions = transactions.filter(
        (t) => t.category === filters.category
      );
    }

    // Search filter
    if (filters.search) {
      transactions = searchInArray(transactions, filters.search, [
        "description",
        "notes",
      ]);
    }

    return transactions;
  },
};

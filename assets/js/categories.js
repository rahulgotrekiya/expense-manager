// Categories Module

const Categories = {
  // Get all categories
  getAll() {
    return Storage.get(Storage.KEYS.CATEGORIES) || [];
  },

  // Get categories by type
  getByType(type) {
    const categories = this.getAll();
    return categories.filter((cat) => cat.type === type || cat.type === "both");
  },

  // Get expense categories
  getExpenseCategories() {
    return this.getByType("expense");
  },

  // Get income categories
  getIncomeCategories() {
    return this.getByType("income");
  },

  // Get category by ID
  getById(id) {
    const categories = this.getAll();
    return categories.find((cat) => cat.id === id);
  },

  // Add new category
  add(category) {
    const categories = this.getAll();
    const newCategory = {
      id: category.id || generateId(),
      name: category.name,
      type: category.type,
      color: category.color || getCategoryColor(category.name),
      icon: category.icon || getCategoryIcon(category.name),
    };
    categories.push(newCategory);
    Storage.set(Storage.KEYS.CATEGORIES, categories);
    return newCategory;
  },

  // Update category
  update(id, updates) {
    const categories = this.getAll();
    const index = categories.findIndex((cat) => cat.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      Storage.set(Storage.KEYS.CATEGORIES, categories);
      return categories[index];
    }
    return null;
  },

  // Delete category
  delete(id) {
    const categories = this.getAll();
    const filtered = categories.filter((cat) => cat.id !== id);
    Storage.set(Storage.KEYS.CATEGORIES, filtered);
    return true;
  },

  // Get category statistics
  getStats(transactions, categoryId) {
    const categoryTransactions = transactions.filter(
      (t) => t.category === categoryId
    );
    const total = sumBy(categoryTransactions, "amount");
    const count = categoryTransactions.length;
    const average = count > 0 ? total / count : 0;

    return {
      total,
      count,
      average,
      transactions: categoryTransactions,
    };
  },

  // Get spending by category
  getSpendingByCategory(transactions) {
    const expenses = transactions.filter((t) => t.type === "expense");
    const grouped = groupBy(expenses, "category");
    const categories = this.getAll();

    return Object.keys(grouped)
      .map((categoryId) => {
        const category = this.getById(categoryId);
        const total = sumBy(grouped[categoryId], "amount");
        return {
          id: categoryId,
          name: category ? category.name : "Unknown",
          color: category ? category.color : "#e5e7eb",
          amount: total,
          count: grouped[categoryId].length,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  },
};

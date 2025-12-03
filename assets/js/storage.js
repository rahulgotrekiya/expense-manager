// Storage Module - Handles localStorage operations

const Storage = {
  // Keys
  KEYS: {
    TRANSACTIONS: "expenseManager_transactions",
    CATEGORIES: "expenseManager_categories",
    BUDGETS: "expenseManager_budgets",
    SETTINGS: "expenseManager_settings",
  },

  // Get item from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  // Set item in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      return false;
    }
  },

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },

  // Clear all data
  clear() {
    try {
      Object.values(this.KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },

  // Initialize default data
  initDefaults() {
    // Initialize transactions if not exists
    if (!this.get(this.KEYS.TRANSACTIONS)) {
      this.set(this.KEYS.TRANSACTIONS, []);
    }

    // Initialize categories if not exists
    if (!this.get(this.KEYS.CATEGORIES)) {
      const defaultCategories = [
        {
          id: "groceries",
          name: "Groceries",
          type: "expense",
          color: "#A9BCF5",
          icon: "shopping_cart",
        },
        {
          id: "food",
          name: "Food & Dining",
          type: "expense",
          color: "#FFD6A5",
          icon: "restaurant",
        },
        {
          id: "transport",
          name: "Transportation",
          type: "expense",
          color: "#C3E2FF",
          icon: "directions_bus",
        },
        {
          id: "utilities",
          name: "Utilities",
          type: "expense",
          color: "#dbeafe",
          icon: "bolt",
        },
        {
          id: "entertainment",
          name: "Entertainment",
          type: "expense",
          color: "#f3e8ff",
          icon: "theaters",
        },
        {
          id: "shopping",
          name: "Shopping",
          type: "expense",
          color: "#fecaca",
          icon: "shopping_bag",
        },
        {
          id: "health",
          name: "Health",
          type: "expense",
          color: "#fce7f3",
          icon: "favorite",
        },
        {
          id: "education",
          name: "Education",
          type: "expense",
          color: "#e0e7ff",
          icon: "school",
        },
        {
          id: "salary",
          name: "Salary",
          type: "income",
          color: "#dcfce7",
          icon: "work",
        },
        {
          id: "freelance",
          name: "Freelance",
          type: "income",
          color: "#d1fae5",
          icon: "work",
        },
        {
          id: "investment",
          name: "Investment",
          type: "income",
          color: "#cffafe",
          icon: "trending_up",
        },
        {
          id: "other",
          name: "Other",
          type: "both",
          color: "#e5e7eb",
          icon: "category",
        },
      ];
      this.set(this.KEYS.CATEGORIES, defaultCategories);
    }

    // Initialize budgets if not exists
    if (!this.get(this.KEYS.BUDGETS)) {
      this.set(this.KEYS.BUDGETS, []);
    }

    // Initialize settings if not exists
    if (!this.get(this.KEYS.SETTINGS)) {
      const defaultSettings = {
        currency: "INR",
        dateFormat: "MMM DD, YYYY",
        firstDayOfWeek: "sunday",
        theme: "light",
      };
      this.set(this.KEYS.SETTINGS, defaultSettings);
    }
  },

  // Export data
  exportData() {
    return {
      transactions: this.get(this.KEYS.TRANSACTIONS),
      categories: this.get(this.KEYS.CATEGORIES),
      budgets: this.get(this.KEYS.BUDGETS),
      settings: this.get(this.KEYS.SETTINGS),
      exportDate: new Date().toISOString(),
    };
  },

  // Import data
  importData(data) {
    try {
      if (data.transactions)
        this.set(this.KEYS.TRANSACTIONS, data.transactions);
      if (data.categories) this.set(this.KEYS.CATEGORIES, data.categories);
      if (data.budgets) this.set(this.KEYS.BUDGETS, data.budgets);
      if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  },
};

// Initialize defaults on load
Storage.initDefaults();

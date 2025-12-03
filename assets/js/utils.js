// Utility Functions

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-IN", options);
}

// Format date for input
function formatDateForInput(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get date range for period
function getDateRange(period) {
  const today = new Date();
  const ranges = {
    thisMonth: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    },
    lastMonth: {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    },
    last30Days: {
      start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: today,
    },
    last7Days: {
      start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: today,
    },
    thisYear: {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(today.getFullYear(), 11, 31),
    },
    all: {
      start: new Date(2000, 0, 1),
      end: new Date(2100, 11, 31),
    },
  };

  return ranges[period] || ranges.thisMonth;
}

// Check if date is in range
function isDateInRange(date, range) {
  const d = new Date(date);
  return d >= range.start && d <= range.end;
}

// Calculate percentage change
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Format percentage
function formatPercentage(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    groceries: "shopping_cart",
    food: "restaurant",
    transport: "directions_bus",
    utilities: "bolt",
    entertainment: "theaters",
    salary: "work",
    income: "work",
    shopping: "shopping_bag",
    health: "favorite",
    education: "school",
    other: "category",
  };
  return icons[category.toLowerCase()] || "category";
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    groceries: "#A9BCF5",
    food: "#FFD6A5",
    transport: "#C3E2FF",
    utilities: "#dbeafe",
    entertainment: "#f3e8ff",
    salary: "#dcfce7",
    income: "#dcfce7",
    shopping: "#fecaca",
    health: "#fce7f3",
    education: "#e0e7ff",
    other: "#e5e7eb",
  };
  return colors[category.toLowerCase()] || "#e5e7eb";
}

// Sort array by key
function sortBy(array, key, order = "asc") {
  return array.sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    // Handle date strings
    if (key === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Handle strings and dates
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// Group array by key
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

// Sum array values by key
function sumBy(array, key) {
  return array.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

// Filter array by multiple conditions
function filterBy(array, filters) {
  return array.filter((item) => {
    return Object.keys(filters).every((key) => {
      const filterValue = filters[key];
      if (!filterValue || filterValue === "" || filterValue === "all") {
        return true;
      }
      return item[key] === filterValue;
    });
  });
}

// Search in array
function searchInArray(array, searchTerm, keys) {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return array;

  return array.filter((item) => {
    return keys.some((key) => {
      const value = item[key];
      if (typeof value === "string") {
        return value.toLowerCase().includes(term);
      }
      if (typeof value === "number") {
        return value.toString().includes(term);
      }
      return false;
    });
  });
}

// Paginate array
function paginate(array, page, perPage) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    data: array.slice(start, end),
    totalPages: Math.ceil(array.length / perPage),
    currentPage: page,
    totalItems: array.length,
  };
}

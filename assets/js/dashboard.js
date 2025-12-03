// Dashboard Module

const Dashboard = {
  currentPeriod: "thisMonth",
  charts: {},

  // Initialize dashboard
  init() {
    this.loadStats();
    this.loadCharts();
    this.loadRecentTransactions();
    this.attachEventListeners();
  },

  // Attach event listeners
  attachEventListeners() {
    const periodSelector = document.getElementById("periodSelector");
    if (periodSelector) {
      periodSelector.addEventListener("change", (e) => {
        this.currentPeriod = e.target.value;
        this.loadStats();
        this.loadCharts();
        this.loadRecentTransactions();
      });
    }
  },

  // Load statistics
  loadStats() {
    const stats = Transactions.getStatistics(this.currentPeriod);

    // Update total balance
    document.getElementById("totalBalance").textContent = formatCurrency(
      stats.current.balance
    );
    document.getElementById("balanceChange").textContent = formatPercentage(
      stats.changes.balance
    );
    document.getElementById("balanceChange").className = `stat-change ${
      stats.changes.balance >= 0 ? "positive" : "negative"
    }`;

    // Update total income
    document.getElementById("totalIncome").textContent = formatCurrency(
      stats.current.income
    );
    document.getElementById("incomeChange").textContent = formatPercentage(
      stats.changes.income
    );
    document.getElementById("incomeChange").className = `stat-change ${
      stats.changes.income >= 0 ? "positive" : "negative"
    }`;

    // Update total expenses
    document.getElementById("totalExpenses").textContent = formatCurrency(
      stats.current.expenses
    );
    document.getElementById("expenseChange").textContent = formatPercentage(
      stats.changes.expenses
    );
    document.getElementById("expenseChange").className = `stat-change ${
      stats.changes.expenses <= 0 ? "positive" : "negative"
    }`;

    // Update net amount
    document.getElementById("netAmount").textContent = formatCurrency(
      stats.current.balance
    );
    document.getElementById("netChange").textContent = formatPercentage(
      stats.changes.balance
    );
    document.getElementById("netChange").className = `subtitle-change ${
      stats.changes.balance >= 0 ? "positive" : "negative"
    }`;
  },

  // Load charts
  loadCharts() {
    this.loadIncomeExpenseChart();
    this.loadCategoryChart();
  },

  // Load income vs expense chart
  loadIncomeExpenseChart() {
    const canvas = document.getElementById("incomeExpenseChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const weeklyData = Transactions.getWeeklyData(this.currentPeriod);

    // Clear previous chart
    if (this.charts.incomeExpense) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Simple line chart implementation
    this.drawLineChart(ctx, canvas, weeklyData);
  },

  // Draw simple line chart
  drawLineChart(ctx, canvas, data) {
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find max value
    const maxIncome = Math.max(...data.map((d) => d.income));
    const maxExpense = Math.max(...data.map((d) => d.expenses));
    const maxValue = Math.max(maxIncome, maxExpense) || 100;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw lines
    const drawLine = (values, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      values.forEach((value, index) => {
        const x = padding + (index / (values.length - 1)) * chartWidth;
        const y = height - padding - (value / maxValue) * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    // Draw income line
    drawLine(
      data.map((d) => d.income),
      "#C3E2FF"
    );

    // Draw expenses line
    drawLine(
      data.map((d) => d.expenses),
      "#FFB0B0"
    );
  },

  // Load category chart
  loadCategoryChart() {
    const canvas = document.getElementById("categoryChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const range = getDateRange(this.currentPeriod);
    const transactions = Transactions.getAll().filter((t) =>
      isDateInRange(t.date, range)
    );

    const spending = Categories.getSpendingByCategory(transactions);

    // Clear previous chart
    if (this.charts.category) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw donut chart
    this.drawDonutChart(ctx, canvas, spending);

    // Update category list
    this.updateCategoryList(spending);

    // Update total
    const total = sumBy(spending, "amount");
    document.getElementById("categoryTotal").textContent =
      formatCurrency(total);
  },

  // Draw donut chart
  drawDonutChart(ctx, canvas, data) {
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.6;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      // Draw empty circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = radius - innerRadius;
      ctx.stroke();
      return;
    }

    const total = sumBy(data, "amount");
    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.amount / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.strokeStyle = item.color;
      ctx.lineWidth = radius - innerRadius;
      ctx.stroke();

      currentAngle += sliceAngle;
    });
  },

  // Update category list
  updateCategoryList(spending) {
    const container = document.getElementById("categoryList");
    if (!container) return;

    container.innerHTML = spending
      .map(
        (item) => `
            <div class="category-item">
                <div class="category-color" style="background-color: ${
                  item.color
                }"></div>
                <p class="category-name">${item.name}</p>
                <p class="category-amount">${formatCurrency(item.amount)}</p>
            </div>
        `
      )
      .join("");
  },

  // Load recent transactions
  loadRecentTransactions() {
    const range = getDateRange(this.currentPeriod);
    const transactions = Transactions.getAll()
      .filter((t) => isDateInRange(t.date, range))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const container = document.getElementById("recentTransactions");
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">receipt_long</span>
                    <p>No transactions found</p>
                </div>
            `;
      return;
    }

    container.innerHTML = transactions
      .map((transaction) => {
        const category = Categories.getById(transaction.category);
        const icon = category ? category.icon : "category";

        return `
                <div class="transaction-row">
                    <div class="transaction-info">
                        <div class="transaction-icon ${transaction.type}">
                            <span class="material-symbols-outlined">${icon}</span>
                        </div>
                        <div class="transaction-details">
                            <p class="transaction-description">${
                              transaction.description || "No description"
                            }</p>
                            <p class="transaction-category">${
                              category ? category.name : "Unknown"
                            }</p>
                        </div>
                    </div>
                    <div class="transaction-date">${formatDate(
                      transaction.date
                    )}</div>
                    <div class="transaction-amount ${transaction.type}">
                        ${
                          transaction.type === "income" ? "+" : "-"
                        }${formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
      })
      .join("");
  },
};

// Initialize dashboard when DOM is loaded
if (document.getElementById("totalBalance")) {
  Dashboard.init();
}

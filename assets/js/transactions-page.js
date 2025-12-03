// Transactions Page Module

const TransactionsPage = {
  currentFilters: {
    period: "all",
    type: "all",
    category: "",
    search: "",
  },
  currentSort: {
    key: "date",
    order: "desc",
  },
  currentPage: 1,
  perPage: 10,
  transactionToDelete: null,

  // Initialize
  init() {
    this.loadCategoryFilters();
    this.loadTransactions();
    this.attachEventListeners();
  },

  // Attach event listeners
  attachEventListeners() {
    // Filter pills - FIXED: Using correct period keys
    document.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".filter-pill")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");

        // Map data-period to correct period keys
        const periodMap = {
          all: "all",
          "7days": "last7Days",
          thisMonth: "thisMonth",
          lastMonth: "lastMonth",
        };

        this.currentFilters.period =
          periodMap[e.target.dataset.period] || e.target.dataset.period;
        this.currentPage = 1;
        this.loadTransactions();
      });
    });

    // Type buttons
    document.querySelectorAll(".filter-type-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".filter-type-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.currentFilters.type = e.target.dataset.type;
        this.currentPage = 1;
        this.loadTransactions();
      });
    });

    // Apply filters
    document.getElementById("btnApplyFilters").addEventListener("click", () => {
      this.currentFilters.category =
        document.getElementById("filterCategory").value;
      this.currentPage = 1;
      this.loadTransactions();
    });

    // Reset filters
    document.getElementById("btnResetFilters").addEventListener("click", () => {
      this.resetFilters();
    });

    // Search
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        this.currentFilters.search = e.target.value;
        this.currentPage = 1;
        this.loadTransactions();
      }, 300)
    );

    // Sort
    document.querySelectorAll(".sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const sortKey = th.dataset.sort;
        if (this.currentSort.key === sortKey) {
          this.currentSort.order =
            this.currentSort.order === "asc" ? "desc" : "asc";
        } else {
          this.currentSort.key = sortKey;
          this.currentSort.order = "desc";
        }
        this.loadTransactions();
      });
    });

    // Pagination
    document.getElementById("btnPrevPage").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadTransactions();
      }
    });

    document.getElementById("btnNextPage").addEventListener("click", () => {
      const totalPages = Math.ceil(
        this.getFilteredTransactions().length / this.perPage
      );
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.loadTransactions();
      }
    });

    // Delete confirmation
    document.getElementById("btnCancelDelete").addEventListener("click", () => {
      this.closeDeleteModal();
    });

    document
      .getElementById("btnCloseDeleteModal")
      .addEventListener("click", () => {
        this.closeDeleteModal();
      });

    document
      .getElementById("btnConfirmDelete")
      .addEventListener("click", () => {
        if (this.transactionToDelete) {
          Transactions.delete(this.transactionToDelete);
          this.closeDeleteModal();
          this.loadTransactions();
        }
      });
  },

  // Load category filters
  loadCategoryFilters() {
    const select = document.getElementById("filterCategory");
    const categories = Categories.getAll();

    select.innerHTML =
      '<option value="">All Categories</option>' +
      categories
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join("");
  },

  // Get filtered transactions
  getFilteredTransactions() {
    return Transactions.filter(this.currentFilters);
  },

  // Load transactions
  loadTransactions() {
    let transactions = this.getFilteredTransactions();

    // Sort
    transactions = sortBy(
      transactions,
      this.currentSort.key,
      this.currentSort.order
    );

    // Paginate
    const paginated = paginate(transactions, this.currentPage, this.perPage);

    // Render
    this.renderTransactions(paginated.data);
    this.renderPagination(paginated);
  },

  // Render transactions
  renderTransactions(transactions) {
    const tbody = document.getElementById("transactionsTableBody");

    if (transactions.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <div class="empty-state">
                            <span class="material-symbols-outlined">receipt_long</span>
                            <p>No transactions found</p>
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = transactions
      .map((transaction) => {
        const category = Categories.getById(transaction.category);

        return `
                <tr>
                    <td class="td-date">${formatDate(transaction.date)}</td>
                    <td class="transaction-desc-cell">${
                      transaction.description || "No description"
                    }</td>
                    <td>
                        <span class="category-badge ${transaction.category}">
                            ${category ? category.name : "Unknown"}
                        </span>
                    </td>
                    <td>${
                      transaction.type === "expense" ? "Expense" : "Income"
                    }</td>
                    <td class="td-amount ${transaction.type} text-right">
                        ${
                          transaction.type === "income" ? "+" : "-"
                        }${formatCurrency(transaction.amount)}
                    </td>
                    <td class="td-actions text-right">
                        <button class="btn-icon" onclick="TransactionsPage.editTransaction('${
                          transaction.id
                        }')">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn-icon" onclick="TransactionsPage.confirmDelete('${
                          transaction.id
                        }')">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                </tr>
            `;
      })
      .join("");
  },

  // Render pagination
  renderPagination(paginated) {
    const { currentPage, totalPages, totalItems } = paginated;
    const start = (currentPage - 1) * this.perPage + 1;
    const end = Math.min(currentPage * this.perPage, totalItems);

    document.getElementById("showingFrom").textContent =
      totalItems > 0 ? start : 0;
    document.getElementById("showingTo").textContent = end;
    document.getElementById("totalTransactions").textContent = totalItems;

    // Update button states
    document.getElementById("btnPrevPage").disabled = currentPage === 1;
    document.getElementById("btnNextPage").disabled =
      currentPage === totalPages || totalPages === 0;

    // Render page numbers
    const numbersContainer = document.getElementById("paginationNumbers");
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }

    numbersContainer.innerHTML = pages
      .map((page) => {
        if (page === "...") {
          return '<span class="page-number">...</span>';
        }
        return `
                <button class="page-number ${
                  page === currentPage ? "active" : ""
                }" 
                        onclick="TransactionsPage.goToPage(${page})">
                    ${page}
                </button>
            `;
      })
      .join("");
  },

  // Go to page
  goToPage(page) {
    this.currentPage = page;
    this.loadTransactions();
  },

  // Reset filters
  resetFilters() {
    this.currentFilters = {
      period: "all",
      type: "all",
      category: "",
      search: "",
    };

    document
      .querySelectorAll(".filter-pill")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector('.filter-pill[data-period="all"]')
      .classList.add("active");

    document
      .querySelectorAll(".filter-type-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector('.filter-type-btn[data-type="all"]')
      .classList.add("active");

    document.getElementById("filterCategory").value = "";
    document.getElementById("searchInput").value = "";

    this.currentPage = 1;
    this.loadTransactions();
  },

  // Edit transaction
  editTransaction(id) {
    const transaction = Transactions.getById(id);
    if (transaction) {
      window.TransactionModal.openForEdit(transaction);
    }
  },

  // Confirm delete
  confirmDelete(id) {
    this.transactionToDelete = id;
    document.getElementById("deleteModal").classList.add("active");
    document.body.style.overflow = "hidden";
  },

  // Close delete modal
  closeDeleteModal() {
    this.transactionToDelete = null;
    document.getElementById("deleteModal").classList.remove("active");
    document.body.style.overflow = "";
  },
};

// Initialize when DOM is loaded
if (document.getElementById("transactionsTableBody")) {
  document.addEventListener("DOMContentLoaded", () => {
    TransactionsPage.init();
  });
}

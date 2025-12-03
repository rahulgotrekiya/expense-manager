// Main App Module - Transaction Modal

const TransactionModal = {
  isEditMode: false,
  editingId: null,
  currentAmount: "0",
  currentOperation: null,
  previousValue: null,

  // Initialize
  init() {
    this.attachEventListeners();
    this.loadCategories();
  },

  // Attach event listeners
  attachEventListeners() {
    // Open modal buttons
    const openButtons = [
      document.getElementById("btnAddTransaction"),
      document.getElementById("btnAddTransactionHeader"),
    ].filter((btn) => btn !== null);

    openButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.open());
    });

    // Close modal
    const closeButtons = [document.getElementById("btnCloseModal")].filter(
      (btn) => btn !== null
    );

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    // Click outside to close
    const modal = document.getElementById("transactionModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    }

    // Transaction type toggle
    document
      .querySelectorAll('input[name="transactionType"]')
      .forEach((radio) => {
        radio.addEventListener("change", (e) => {
          document
            .querySelectorAll(".type-option")
            .forEach((opt) => opt.classList.remove("active"));
          e.target.closest(".type-option").classList.add("active");
          this.loadCategories();
        });
      });

    // Calculator buttons
    document.querySelectorAll(".calc-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const value = btn.dataset.value;
        const action = btn.dataset.action;

        if (value !== undefined) {
          this.handleNumberInput(value);
        } else if (action) {
          this.handleAction(action);
        }
      });
    });

    // Save transaction
    const saveBtn = document.getElementById("btnSaveTransaction");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.save());
    }

    // Set default date
    const dateInput = document.getElementById("transactionDate");
    if (dateInput && !dateInput.value) {
      dateInput.value = getTodayDate();
    }
  },

  // Open modal
  open() {
    this.isEditMode = false;
    this.editingId = null;
    this.reset();

    const modal = document.getElementById("transactionModal");
    const modalTitle = document.getElementById("modalTitle");

    if (modalTitle) modalTitle.textContent = "Add Transaction";
    if (modal) modal.classList.add("active");

    document.body.style.overflow = "hidden";
  },

  // Open for edit
  openForEdit(transaction) {
    this.isEditMode = true;
    this.editingId = transaction.id;
    this.reset();

    // Set transaction type
    const typeRadio = document.querySelector(
      `input[name="transactionType"][value="${transaction.type}"]`
    );
    if (typeRadio) {
      typeRadio.checked = true;
      document
        .querySelectorAll(".type-option")
        .forEach((opt) => opt.classList.remove("active"));
      typeRadio.closest(".type-option").classList.add("active");
    }

    // Set amount
    this.currentAmount = transaction.amount.toString();
    this.updateDisplay();

    // Set other fields
    document.getElementById("categorySelect").value = transaction.category;
    document.getElementById("transactionDate").value = transaction.date;
    document.getElementById("transactionDescription").value =
      transaction.description || "";
    document.getElementById("transactionNotes").value = transaction.notes || "";
    document.getElementById("editTransactionId").value = transaction.id;

    // Update modal title
    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.textContent = "Edit Transaction";

    // Open modal
    const modal = document.getElementById("transactionModal");
    if (modal) modal.classList.add("active");

    document.body.style.overflow = "hidden";

    // Load categories for the selected type
    this.loadCategories();
  },

  // Close modal
  close() {
    const modal = document.getElementById("transactionModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
    this.reset();
  },

  // Reset modal
  reset() {
    this.currentAmount = "0";
    this.currentOperation = null;
    this.previousValue = null;
    this.updateDisplay();

    // Reset form
    document.querySelectorAll(
      'input[name="transactionType"]'
    )[0].checked = true;
    document
      .querySelectorAll(".type-option")
      .forEach((opt) => opt.classList.remove("active"));
    document.querySelector(".type-option.expense").classList.add("active");

    document.getElementById("categorySelect").value = "";
    document.getElementById("transactionDate").value = getTodayDate();
    document.getElementById("transactionDescription").value = "";
    document.getElementById("transactionNotes").value = "";
    document.getElementById("editTransactionId").value = "";
  },

  // Handle number input
  handleNumberInput(value) {
    if (value === "." && this.currentAmount.includes(".")) return;

    if (this.currentAmount === "0" && value !== ".") {
      this.currentAmount = value;
    } else {
      this.currentAmount += value;
    }

    this.updateDisplay();
  },

  // Handle calculator actions
  handleAction(action) {
    switch (action) {
      case "clear":
        this.currentAmount = "0";
        this.currentOperation = null;
        this.previousValue = null;
        break;

      case "backspace":
        if (this.currentAmount.length > 1) {
          this.currentAmount = this.currentAmount.slice(0, -1);
        } else {
          this.currentAmount = "0";
        }
        break;

      case "negate":
        if (this.currentAmount !== "0") {
          this.currentAmount = this.currentAmount.startsWith("-")
            ? this.currentAmount.slice(1)
            : "-" + this.currentAmount;
        }
        break;

      case "percent":
        this.currentAmount = (parseFloat(this.currentAmount) / 100).toString();
        break;

      case "add":
      case "subtract":
      case "multiply":
        this.performOperation();
        this.currentOperation = action;
        this.previousValue = this.currentAmount;
        this.currentAmount = "0";
        break;

      case "done":
        this.performOperation();
        break;
    }

    this.updateDisplay();
  },

  // Perform calculation
  performOperation() {
    if (this.currentOperation && this.previousValue !== null) {
      const prev = parseFloat(this.previousValue);
      const current = parseFloat(this.currentAmount);
      let result;

      switch (this.currentOperation) {
        case "add":
          result = prev + current;
          break;
        case "subtract":
          result = prev - current;
          break;
        case "multiply":
          result = prev * current;
          break;
        default:
          result = current;
      }

      this.currentAmount = result.toString();
      this.currentOperation = null;
      this.previousValue = null;
    }
  },

  // Update amount display
  updateDisplay() {
    const display = document.getElementById("amountDisplay");
    if (display) {
      const amount = parseFloat(this.currentAmount) || 0;
      display.textContent = formatCurrency(Math.abs(amount));
    }
  },

  // Load categories based on transaction type
  loadCategories() {
    const type = document.querySelector(
      'input[name="transactionType"]:checked'
    ).value;
    const select = document.getElementById("categorySelect");

    const categories =
      type === "expense"
        ? Categories.getExpenseCategories()
        : Categories.getIncomeCategories();

    select.innerHTML =
      '<option value="">Select a category</option>' +
      categories
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join("");

    // Restore selected value if editing
    if (this.isEditMode) {
      const editId = document.getElementById("editTransactionId").value;
      if (editId) {
        const transaction = Transactions.getById(editId);
        if (transaction) {
          select.value = transaction.category;
        }
      }
    }
  },

  // Save transaction
  save() {
    const type = document.querySelector(
      'input[name="transactionType"]:checked'
    ).value;
    const amount = Math.abs(parseFloat(this.currentAmount));
    const category = document.getElementById("categorySelect").value;
    const date = document.getElementById("transactionDate").value;
    const description = document.getElementById("transactionDescription").value;
    const notes = document.getElementById("transactionNotes").value;

    // Validation
    if (amount === 0 || isNaN(amount)) {
      alert("Please enter a valid amount");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!date) {
      alert("Please select a date");
      return;
    }

    const transactionData = {
      type,
      amount,
      category,
      date,
      description,
      notes,
    };

    if (this.isEditMode) {
      Transactions.update(this.editingId, transactionData);
    } else {
      Transactions.add(transactionData);
    }

    // Reload data if on dashboard or transactions page
    if (typeof Dashboard !== "undefined" && Dashboard.loadStats) {
      Dashboard.loadStats();
      Dashboard.loadCharts();
      Dashboard.loadRecentTransactions();
    }

    if (
      typeof TransactionsPage !== "undefined" &&
      TransactionsPage.loadTransactions
    ) {
      TransactionsPage.loadTransactions();
    }

    this.close();
  },
};

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  TransactionModal.init();
});

// Make TransactionModal globally accessible
window.TransactionModal = TransactionModal;

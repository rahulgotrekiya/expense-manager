// Settings Module

const Settings = {
  // Initialize settings page
  init() {
    this.loadSettings();
    this.attachEventListeners();
  },

  // Load current settings
  loadSettings() {
    const settings = Storage.get(Storage.KEYS.SETTINGS) || {
      currency: "INR",
      dateFormat: "MMM DD, YYYY",
      firstDayOfWeek: "sunday",
      theme: "light",
      userName: "Expense Manager",
      userEmail: "Personal Finance",
    };

    // Populate form fields
    const userNameInput = document.getElementById("settingsUserName");
    const userEmailInput = document.getElementById("settingsUserEmail");

    if (userNameInput) userNameInput.value = settings.userName;
    if (userEmailInput) userEmailInput.value = settings.userEmail;

    // Update sidebar display
    this.updateSidebarInfo(settings);
  },

  // Update sidebar user info
  updateSidebarInfo(settings) {
    const userName = document.querySelector(".user-name");
    const userEmail = document.querySelector(".user-email");

    if (userName) userName.textContent = settings.userName;
    if (userEmail) userEmail.textContent = settings.userEmail;
  },

  // Attach event listeners
  attachEventListeners() {
    // Save profile
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener("click", () => this.saveProfile());
    }

    // Export data
    const exportDataBtn = document.getElementById("exportDataBtn");
    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", () => this.exportData());
    }

    // Import data
    const importDataBtn = document.getElementById("importDataBtn");
    const importFileInput = document.getElementById("importFileInput");

    if (importDataBtn && importFileInput) {
      importDataBtn.addEventListener("click", () => {
        importFileInput.click();
      });

      importFileInput.addEventListener("change", (e) => {
        this.importData(e.target.files[0]);
      });
    }

    // Clear data
    const clearDataBtn = document.getElementById("clearDataBtn");
    if (clearDataBtn) {
      clearDataBtn.addEventListener("click", () => this.clearData());
    }
  },

  // Save profile settings
  saveProfile() {
    const userName = document.getElementById("settingsUserName").value.trim();
    const userEmail = document.getElementById("settingsUserEmail").value.trim();

    if (!userName) {
      alert("Please enter your name");
      return;
    }

    const settings = Storage.get(Storage.KEYS.SETTINGS) || {};
    settings.userName = userName;
    settings.userEmail = userEmail;

    Storage.set(Storage.KEYS.SETTINGS, settings);
    this.updateSidebarInfo(settings);

    alert("Profile saved successfully!");
  },

  // Export data
  exportData() {
    const data = Storage.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expense-manager-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("Data exported successfully!");
  },

  // Import data
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.transactions && !data.categories) {
          alert("Invalid backup file format");
          return;
        }

        if (confirm("This will replace all existing data. Are you sure?")) {
          const success = Storage.importData(data);

          if (success) {
            alert("Data imported successfully! Refreshing page...");
            window.location.reload();
          } else {
            alert("Failed to import data");
          }
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("Error reading backup file");
      }
    };

    reader.readAsText(file);

    // Reset file input
    document.getElementById("importFileInput").value = "";
  },

  // Clear all data
  clearData() {
    if (
      confirm(
        "Are you sure you want to delete ALL data? This cannot be undone!"
      )
    ) {
      if (confirm("Really delete everything? This is your last warning!")) {
        Storage.clear();
        alert("All data cleared! Refreshing page...");
        window.location.reload();
      }
    }
  },
};

// Initialize settings when DOM is loaded
if (document.getElementById("saveProfileBtn")) {
  document.addEventListener("DOMContentLoaded", () => {
    Settings.init();
  });
}

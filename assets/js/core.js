/**
 * ============================================================================
 * DAILY ADMIN - CORE JAVASCRIPT (REFACTORED & MODULAR)
 * ============================================================================
 * Struktur:
 * 1. UTILITIES  : Toast, Helper Functions (Global)
 * 2. LAYOUT     : Sidebar, Theme, Search, Header Dropdowns
 * 3. COMPONENTS : Modal, Drawer, Tabs, Accordion, Tree, Custom Select (Global Listeners)
 * 4. FORMS      : Validation Logic
 * 5. PAGES      : Logika spesifik per halaman (Profil, Settings, dll)
 * ============================================================================
 */

"use strict";

/* =========================================
   1. UTILITIES & HELPER FUNCTIONS
   ========================================= */

const DailyUI = {
  // --- TOAST ENGINE ---
  toast: {
    containers: {},
    fire: function (options) {
      const config = {
        title: options.title || "Notification",
        message: options.message || "",
        type: options.type || "default",
        position: options.position || "top-right",
        duration: options.duration || 3000,
        icon: options.icon || this.getIcon(options.type),
        action: options.action || null,
      };

      let container = document.querySelector(
        `.toast-container.toast-${config.position}`
      );
      if (!container) {
        container = document.createElement("div");
        container.className = `toast-container toast-${config.position}`;
        document.body.appendChild(container);
      }

      const toastEl = document.createElement("div");
      toastEl.className = `toast-card ${config.type}`;

      let actionHTML = "";
      if (config.action) {
        actionHTML = `<button class="btn btn-sm btn-light toast-btn">${config.action.text}</button>`;
      }

      toastEl.innerHTML = `
            <div class="toast-icon">${config.icon}</div>
            <div class="toast-body">
                <h5>${config.title}</h5>
                <p>${config.message}</p>
                ${actionHTML}
            </div>
            <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
            <div class="toast-progress"></div>
        `;

      if (config.position.includes("bottom")) {
        container.prepend(toastEl);
      } else {
        container.appendChild(toastEl);
      }

      setTimeout(() => {
        toastEl.classList.add("show");
        const progressBar = toastEl.querySelector(".toast-progress");
        if (progressBar && config.duration > 0) {
          progressBar.style.transitionDuration = `${config.duration}ms`;
          progressBar.style.width = "0%";
        }
      }, 10);

      if (config.action) {
        const btn = toastEl.querySelector(".toast-btn");
        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            config.action.onClick();
            this.dismiss(toastEl);
          });
        }
      }

      const closeBtn = toastEl.querySelector(".toast-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.dismiss(toastEl);
        });
      }

      if (config.duration > 0) {
        setTimeout(() => this.dismiss(toastEl), config.duration);
      }
    },

    dismiss: function (element) {
      if (!element) return;
      element.classList.remove("show");
      setTimeout(() => {
        if (element.parentNode) element.parentNode.removeChild(element);
      }, 300);
    },

    getIcon: function (type) {
      if (type === "success") return '<i class="fa-solid fa-check"></i>';
      if (type === "error") return '<i class="fa-solid fa-bug"></i>';
      if (type === "info") return '<i class="fa-solid fa-bell"></i>';
      if (type === "glass")
        return '<i class="fa-solid fa-wand-magic-sparkles"></i>';
      return '<i class="fa-solid fa-info"></i>';
    },
  },

  // --- SIMPLE TOAST HELPER ---
  showToast: function (message = "Copied to clipboard!") {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-notification";
      toast.className = "toast-box";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  },

  // --- LAYOUT SWITCHER ---
  changeLayout: function (mode) {
    localStorage.setItem("layout", mode);
    location.reload();
  },

  // --- PURE TREE HELPERS ---
  pureSelectAll: function () {
    document
      .querySelectorAll("#pure-tree .pure-tree-checkbox")
      .forEach((cb) => {
        cb.checked = true;
        cb.indeterminate = false;
      });
  },

  pureDeselectAll: function () {
    document
      .querySelectorAll("#pure-tree .pure-tree-checkbox")
      .forEach((cb) => {
        cb.checked = false;
        cb.indeterminate = false;
      });
  },
};

// Expose Global Toast agar bisa dipanggil dari HTML/Console
window.Toast = DailyUI.toast;
window.showToast = DailyUI.showToast;
window.changeLayout = DailyUI.changeLayout;
window.pureSelectAll = DailyUI.pureSelectAll;
window.pureDeselectAll = DailyUI.pureDeselectAll;

/* =========================================
   2. LAYOUT MANAGER (Sidebar, Navbar, Theme)
   ========================================= */

const DailyLayout = {
  init: function () {
    this.initLayoutMode();
    this.initSettingsPanel();
    this.initThemeSwitcher();
    this.initHeaderLogic();
    this.initSearchOverlay();
  },

  initLayoutMode: function () {
    const savedLayout = localStorage.getItem("layout") || "default";
    document.body.classList.remove(
      "layout-horizontal",
      "layout-collapsed",
      "layout-compact",
      "layout-boxed"
    );
    if (savedLayout !== "default") {
      document.body.classList.add(`layout-${savedLayout}`);
    }

    if (savedLayout === "horizontal") {
      const navContainer = document.getElementById("horizontal-menu-container");
      if (navContainer) {
        fetch("components/navbar.html")
          .then((res) => res.text())
          .then((data) => {
            navContainer.innerHTML = data;
            const sideContainer = document.getElementById("sidebar-container");
            if (sideContainer) sideContainer.style.display = "none";
          })
          .catch((err) => console.error("Error loading navbar:", err));
      }
    } else {
      const sideContainer = document.getElementById("sidebar-container");
      if (sideContainer) {
        fetch("components/sidebar.html")
          .then((res) => res.text())
          .then((data) => {
            sideContainer.innerHTML = data;
            this.initSidebarLogic(); // Callback logic sidebar
          })
          .catch((err) => console.error("Error loading sidebar:", err));
      }
    }
  },

  initSidebarLogic: function () {
    const mobileBtn = document.getElementById("mobileToggle");
    const collapseBtn = document.getElementById("collapseBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const mainContent = document.getElementById("mainContent");

    if (!sidebar) return;

    if (collapseBtn && mainContent) {
      const newCollapseBtn = collapseBtn.cloneNode(true);
      collapseBtn.parentNode.replaceChild(newCollapseBtn, collapseBtn);
      newCollapseBtn.addEventListener("click", () => {
        if (window.innerWidth <= 992) {
          sidebar.classList.remove("show");
          if (sidebarOverlay) sidebarOverlay.classList.remove("show");
        } else {
          sidebar.classList.toggle("collapsed");
          mainContent.classList.toggle("expanded");
        }
      });
    }

    if (mobileBtn) {
      const newMobileBtn = mobileBtn.cloneNode(true);
      mobileBtn.parentNode.replaceChild(newMobileBtn, mobileBtn);
      newMobileBtn.addEventListener("click", () => {
        sidebar.classList.add("show");
        if (sidebarOverlay) sidebarOverlay.classList.add("show");
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("show");
      });
    }

    // Submenu Logic
    document.querySelectorAll(".nav-link.has-submenu").forEach((item) => {
      item.replaceWith(item.cloneNode(true)); // Reset listener
    });
    document.querySelectorAll(".nav-link.has-submenu").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.classList.toggle("expanded");
        const submenu = item.nextElementSibling;
        if (submenu && submenu.classList.contains("submenu")) {
          submenu.classList.toggle("show");
        }
      });
    });

    // Auto Active State
    this.initActiveMenu();
  },

  initActiveMenu: function () {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const currentPage = page === "" || page === "/" ? "index.html" : page;

    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active", "expanded"));
    document
      .querySelectorAll(".submenu")
      .forEach((s) => s.classList.remove("show"));

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const linkPage = href.split("/").pop();

      if (linkPage === currentPage) {
        link.classList.add("active");
        let parent = link.closest(".submenu");
        while (parent) {
          parent.classList.add("show");
          const parentTrigger = parent.previousElementSibling;
          if (parentTrigger && parentTrigger.classList.contains("nav-link")) {
            parentTrigger.classList.add("active", "expanded");
          }
          parent = parent.parentElement.closest(".submenu");
        }
      }
    });
    console.log(`✅ Multi-Level Active State applied for: ${currentPage}`);
  },

  initSettingsPanel: function () {
    const settingsContainer = document.getElementById("settings-container");
    if (settingsContainer) {
      fetch("components/setting-layout.html")
        .then((response) =>
          response.ok ? response.text() : Promise.reject("Failed load settings")
        )
        .then((html) => {
          settingsContainer.innerHTML = html;
          // Logic Tombol Panel
          const settingsTrigger = document.getElementById("settings-trigger");
          const settingsPanel = document.getElementById("settings-panel");
          const settingsClose = document.getElementById("settings-close");

          if (settingsTrigger && settingsPanel) {
            settingsTrigger.addEventListener("click", () =>
              settingsPanel.classList.add("show")
            );
          }
          if (settingsClose && settingsPanel) {
            settingsClose.addEventListener("click", () =>
              settingsPanel.classList.remove("show")
            );
          }
        })
        .catch((err) => console.error(err));
    }
  },

  initThemeSwitcher: function () {
    const themeDarkBtn = document.getElementById("themeDark");
    const themeLightBtn = document.getElementById("themeLight");
    const htmlElement = document.documentElement;

    function setTheme(themeName) {
      htmlElement.setAttribute("data-theme", themeName);
      localStorage.setItem("theme", themeName);

      if (themeDarkBtn && themeLightBtn) {
        if (themeName === "light") {
          themeLightBtn.classList.add("active");
          themeDarkBtn.classList.remove("active");
        } else {
          themeDarkBtn.classList.add("active");
          themeLightBtn.classList.remove("active");
        }
      }
    }

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    if (themeDarkBtn)
      themeDarkBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setTheme("dark");
      });
    if (themeLightBtn)
      themeLightBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setTheme("light");
      });
  },

  initHeaderLogic: function () {
    const notifBtn = document.getElementById("notifTrigger");
    const notifDropdown = document.getElementById("notifDropdown");
    const profileBtn = document.getElementById("profileTrigger");
    const profileDropdown = document.getElementById("profileDropdown");

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle("active");
        if (profileDropdown) profileDropdown.classList.remove("active");
      });
    }

    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("active");
        if (notifDropdown) notifDropdown.classList.remove("active");
      });
    }

    document.addEventListener("click", (e) => {
      if (
        notifDropdown &&
        notifBtn &&
        !notifDropdown.contains(e.target) &&
        !notifBtn.contains(e.target)
      ) {
        notifDropdown.classList.remove("active");
      }
      if (
        profileDropdown &&
        profileBtn &&
        !profileDropdown.contains(e.target) &&
        !profileBtn.contains(e.target)
      ) {
        profileDropdown.classList.remove("active");
      }
    });
  },

  initSearchOverlay: function () {
    const searchTrigger = document.getElementById("searchTrigger");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchClose = document.getElementById("searchClose");

    function openOverlay() {
      if (searchOverlay) {
        searchOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
        const floatInput = document.getElementById("searchInputFloating");
        if (floatInput) setTimeout(() => floatInput.focus(), 100);
      }
    }

    function closeOverlay() {
      if (searchOverlay) {
        searchOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    }

    if (searchTrigger)
      searchTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        openOverlay();
      });
    if (searchClose)
      searchClose.addEventListener("click", (e) => {
        e.preventDefault();
        closeOverlay();
      });
    if (searchOverlay)
      searchOverlay.addEventListener("click", (e) => {
        if (e.target === searchOverlay) closeOverlay();
      });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlay();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const isHorizontal =
          document.body.classList.contains("layout-horizontal");
        if (isHorizontal) {
          if (searchOverlay && searchOverlay.classList.contains("active"))
            closeOverlay();
          else openOverlay();
        } else {
          const inlineInput = document.getElementById("searchInputInline");
          if (inlineInput) inlineInput.focus();
        }
      }
    });
  },
};

/* =========================================
   3. COMPONENTS MANAGER (Global UI Logic)
   ========================================= */

// --- CUSTOM SELECT COMPONENT (CLASS) ---
// Ditambahkan untuk menangani logika dropdown select yang dapat dicari dan multi-select
class CustomSelect {
  constructor(element) {
    this.wrapper = element;
    this.trigger = element.querySelector(".custom-select-trigger");
    this.optionsContainer = element.querySelector(".custom-options");
    this.optionsList = element.querySelectorAll(".option");
    this.searchInput = element.querySelector(".select-search-input");
    this.hiddenInput = element.querySelector(".hidden-value");
    this.selectionText = element.querySelector(".selection-text");
    this.tagsContainer = element.querySelector(".select-tags");

    this.isMultiple = element.classList.contains("multiple");
    this.selectedValues = []; // Array untuk multiple

    this.init();
  }

  init() {
    // 1. Toggle Dropdown
    this.trigger.addEventListener("click", (e) => {
      // Close other selects first
      document.querySelectorAll(".custom-select-wrapper").forEach((el) => {
        if (el !== this.wrapper) el.classList.remove("open");
      });
      this.wrapper.classList.toggle("open");
      if (this.wrapper.classList.contains("open")) {
        if (this.searchInput) {
          this.searchInput.focus();
          this.searchInput.value = ""; // Reset search text
          this.filterOptions(""); // Show all
        }
      }
    });

    // 2. Select Option Logic
    this.optionsList.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation(); // Mencegah dropdown menutup seketika di multiple
        const value = option.dataset.value;
        const label = option.innerHTML; // Simpan HTML biar icon ikut

        if (this.isMultiple) {
          this.toggleMultiple(value, label, option);
        } else {
          this.selectSingle(value, label, option);
        }
      });
    });

    // 3. Live Search Logic
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.filterOptions(e.target.value.toLowerCase());
      });
    }

    // 4. Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.wrapper.classList.remove("open");
      }
    });
  }

  // --- SINGLE SELECT LOGIC ---
  selectSingle(value, labelHTML, optionElement) {
    // Visual Update
    this.selectionText.innerHTML = labelHTML;
    this.selectionText.classList.remove("text-muted");
    this.selectionText.classList.add("text-main");

    // Remove other selected classes
    this.optionsList.forEach((opt) => opt.classList.remove("selected"));
    optionElement.classList.add("selected");

    // Set Value
    if (this.hiddenInput) this.hiddenInput.value = value;

    // Close Dropdown
    this.wrapper.classList.remove("open");

    // Trigger Change Event (Opsional)
    // console.log('Selected:', value);
  }

  // --- MULTIPLE SELECT LOGIC ---
  toggleMultiple(value, labelHTML, optionElement) {
    const index = this.selectedValues.findIndex((item) => item.value === value);

    if (index === -1) {
      // Add Item
      this.selectedValues.push({ value: value, label: labelHTML });
      optionElement.classList.add("selected");
    } else {
      // Remove Item
      this.selectedValues.splice(index, 1);
      optionElement.classList.remove("selected");
    }

    this.renderTags();
    this.updateHiddenInput();
  }

  renderTags() {
    // Bersihkan container
    if (this.tagsContainer) {
      this.tagsContainer.innerHTML = "";

      if (this.selectedValues.length === 0) {
        this.tagsContainer.innerHTML =
          '<span class="selection-text text-muted">Choose items...</span>';
        return;
      }

      // Render Tags
      this.selectedValues.forEach((item) => {
        const tag = document.createElement("div");
        tag.className = "select-tag";
        tag.innerHTML = `${item.label} <span class="tag-close" data-val="${item.value}"><i class="fa-solid fa-xmark"></i></span>`;
        this.tagsContainer.appendChild(tag);

        // Handle Close Click pada Tag
        tag.querySelector(".tag-close").addEventListener("click", (e) => {
          e.stopPropagation(); // Jangan buka dropdown
          const valToRemove = e.currentTarget.dataset.val;
          // Cari option element terkait untuk hapus class selected
          const optEl = Array.from(this.optionsList).find(
            (op) => op.dataset.value === valToRemove
          );
          if (optEl) this.toggleMultiple(valToRemove, null, optEl);
        });
      });
    }
  }

  updateHiddenInput() {
    if (this.hiddenInput) {
      // Simpan sebagai koma separated (html,css,js)
      const values = this.selectedValues.map((i) => i.value).join(",");
      this.hiddenInput.value = values;
    }

    // Demo Update Preview (Khusus halaman select demo)
    const preview = document.getElementById("techValuePreview");
    if (preview)
      preview.innerText = JSON.stringify(
        this.selectedValues.map((i) => i.value)
      );
  }

  // --- SEARCH FILTER ---
  filterOptions(term) {
    this.optionsList.forEach((option) => {
      const text = option.innerText.toLowerCase();
      if (text.includes(term)) {
        option.classList.remove("hidden");
      } else {
        option.classList.add("hidden");
      }
    });
  }
}

const DailyComponents = {
  init: function () {
    this.initGlobalListeners();
    this.initTreeLogic();
    this.initCustomSelects(); // Inisialisasi Custom Select
  },

  // Method baru untuk mengaktifkan Custom Select di seluruh halaman
  initCustomSelects: function () {
    document.querySelectorAll(".custom-select-wrapper").forEach((el) => {
      new CustomSelect(el);
    });
  },

  initGlobalListeners: function () {
    // A. COPY CODE & CLICK-TO-COPY
    document.addEventListener("click", (e) => {
      // 1. Tombol Copy Code
      if (e.target && e.target.classList.contains("btn-copy-code")) {
        const wrapper = e.target.closest(".demo-wrapper");
        const content = wrapper.querySelector(".demo-content");
        if (content) {
          const htmlCode = content.innerHTML
            .trim()
            .replace(/^[ ]+|[ ]+$/gm, "");
          navigator.clipboard.writeText(htmlCode).then(() => {
            const originalIcon = e.target.innerHTML;
            e.target.innerHTML = '<i class="fa-solid fa-check"></i>';
            e.target.style.color = "var(--accent-green)";
            DailyUI.showToast("HTML Code Copied!");
            setTimeout(() => {
              e.target.innerHTML = '<i class="fa-regular fa-copy"></i>';
              e.target.style.color = "";
            }, 1500);
          });
        }
      }

      // 2. Click Element to Copy
      const copyTarget = e.target.closest(".copy-click");
      if (copyTarget) {
        e.preventDefault();
        e.stopPropagation();
        const clone = copyTarget.cloneNode(true);
        clone.classList.remove("copy-click");
        clone.removeAttribute("title");
        const cleanCode = clone.outerHTML
          .replace(/\sclass="/, ' class="')
          .trim();
        navigator.clipboard.writeText(cleanCode).then(() => {
          if (typeof DailyUI.showToast === "function") {
            DailyUI.showToast(
              `Code Copied: &lt;${clone.tagName.toLowerCase()}&gt;`
            );
          } else {
            alert("Code copied!");
          }
        });
      }

      // B. ALERT DISMISS
      if (e.target.closest(".alert-close")) {
        const alert = e.target.closest(".alert");
        if (alert) {
          alert.style.opacity = "0";
          alert.style.transform = "translateY(-10px)";
          setTimeout(() => alert.remove(), 300);
        }
      }

      // C. TABLE ACTION DROPDOWN
      const trigger = e.target.closest(".dropdown-trigger");
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        const menu = trigger.nextElementSibling;
        const parentRow = trigger.closest("tr");
        document.querySelectorAll(".dropdown-menu-action").forEach((m) => {
          if (m !== menu) m.classList.remove("show");
        });
        document.querySelectorAll("tr.row-z-index").forEach((r) => {
          if (r !== parentRow) r.classList.remove("row-z-index");
        });
        menu.classList.toggle("show");
        if (menu.classList.contains("show")) {
          if (parentRow) parentRow.classList.add("row-z-index");
        } else {
          if (parentRow) parentRow.classList.remove("row-z-index");
        }
      } else {
        // Klik di luar dropdown table
        document
          .querySelectorAll(".dropdown-menu-action")
          .forEach((m) => m.classList.remove("show"));
        document
          .querySelectorAll("tr.row-z-index")
          .forEach((r) => r.classList.remove("row-z-index"));
      }

      // D. MODAL & DRAWER OPEN
      const modalTrigger = e.target.closest(
        '[data-toggle="modal"], [data-toggle="drawer"]'
      );
      if (modalTrigger) {
        const targetId = modalTrigger.getAttribute("data-target");
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.classList.add("show");
          document.body.style.overflow = "hidden";
        }
      }

      // E. MODAL & DRAWER CLOSE (Tombol X)
      if (e.target.closest('[data-dismiss="modal"], [data-dismiss="drawer"]')) {
        const targetEl = e.target.closest(".modal-backdrop, .drawer-backdrop");
        this.closeModal(targetEl);
      }

      // F. MODAL BACKDROP CLOSE
      if (
        e.target.classList.contains("modal-backdrop") ||
        e.target.classList.contains("drawer-backdrop")
      ) {
        this.closeModal(e.target);
      }

      // G. TABS LOGIC
      const tabLink = e.target.closest(".tab-link, .premium-tab");
      if (tabLink) {
        e.preventDefault();
        const targetId = tabLink.getAttribute("data-tab");
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          const buttonsContainer = tabLink.parentElement;
          buttonsContainer
            .querySelectorAll(".tab-link, .premium-tab")
            .forEach((el) => el.classList.remove("active"));
          const paneContainer = targetPane.parentElement;
          paneContainer
            .querySelectorAll(".tab-pane")
            .forEach((el) => el.classList.remove("active"));
          tabLink.classList.add("active");
          targetPane.classList.add("active");
          window.dispatchEvent(new Event("resize"));
        }
      }

      // H. ACCORDION LOGIC
      const accHeader = e.target.closest(".accordion-header");
      if (accHeader) {
        const item = accHeader.parentElement;
        const wrapper = item.parentElement;
        const body = item.querySelector(".accordion-body");

        if (item.classList.contains("active")) {
          item.classList.remove("active");
          body.style.maxHeight = null;
        } else {
          if (wrapper.getAttribute("data-single") === "true") {
            wrapper
              .querySelectorAll(".accordion-item.active")
              .forEach((activeItem) => {
                activeItem.classList.remove("active");
                activeItem.querySelector(".accordion-body").style.maxHeight =
                  null;
              });
          }
          item.classList.add("active");
          body.style.maxHeight = body.scrollHeight + "px";
        }
      }
    });

    // Close Modal on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModal = document.querySelector(
          ".modal-backdrop.show, .drawer-backdrop.show"
        );
        if (openModal) this.closeModal(openModal);
      }
    });
  },

  closeModal: function (element) {
    if (element) {
      element.classList.remove("show");
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }
  },

  initTreeLogic: function () {
    const tree = document.getElementById("pure-tree");
    if (!tree) return;
    tree.addEventListener("click", function (e) {
      // Toggle Folder
      const toggleBtn = e.target.closest(".pure-tree-toggle");
      if (toggleBtn && tree.contains(toggleBtn)) {
        e.preventDefault();
        e.stopPropagation();
        const parentLi = toggleBtn.closest("li");
        if (!parentLi) return;
        const nestedUl = parentLi.querySelector(":scope > .pure-tree-nested");
        if (!nestedUl) return;
        nestedUl.classList.toggle("show");
        toggleBtn.classList.toggle("open");
        return;
      }

      // Checkbox Logic
      if (e.target.classList.contains("pure-tree-checkbox")) {
        const checkbox = e.target;
        e.stopPropagation();
        const parentLi = checkbox.closest("li");
        if (!parentLi) return;
        parentLi
          .querySelectorAll(".pure-tree-nested .pure-tree-checkbox")
          .forEach((child) => {
            child.checked = checkbox.checked;
            child.indeterminate = false;
          });
        updatePureTreeState(checkbox);
      }
    });

    function updatePureTreeState(checkbox) {
      const parentUl = checkbox.closest(".pure-tree-nested");
      if (!parentUl) return;
      const parentLi = parentUl.parentElement;
      const parentCheckbox = parentLi.querySelector(
        "> .pure-tree-node .pure-tree-checkbox"
      );
      if (!parentCheckbox) return;

      const children = Array.from(parentUl.children)
        .map((li) => li.querySelector(".pure-tree-checkbox"))
        .filter(Boolean);
      const checkedCount = children.filter((cb) => cb.checked).length;

      if (checkedCount === 0) {
        parentCheckbox.checked = false;
        parentCheckbox.indeterminate = false;
      } else if (checkedCount === children.length) {
        parentCheckbox.checked = true;
        parentCheckbox.indeterminate = false;
      } else {
        parentCheckbox.checked = false;
        parentCheckbox.indeterminate = true;
      }
      updatePureTreeState(parentCheckbox);
    }
  },
};

/* =========================================
   4. FORM MANAGER (Validation)
   ========================================= */

const DailyForms = {
  initValidation: function () {
    const forms = document.querySelectorAll(".needs-validation");
    if (forms.length === 0) return;

    Array.from(forms).forEach((form) => {
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      newForm.addEventListener(
        "submit",
        (event) => {
          if (!newForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            if (window.Toast) {
              window.Toast.fire({
                title: "Validation Error",
                message: "Please fix the errors below.",
                type: "error",
              });
            }
          } else {
            event.preventDefault(); // Remove this line for real submission
            if (window.Toast) {
              window.Toast.fire({
                title: "Success!",
                message: "Form submitted successfully.",
                type: "success",
              });
            }
          }
          newForm.classList.add("was-validated");
        },
        false
      );
    });
    console.log("✅ Form Validation Initialized");
  },
};

/* =========================================
   5. SPECIFIC PAGE LOGIC
   [INFO] Code below assumes elements exist on the page.
   If moving to a real project, consider moving these
   into separate files like 'profile.js' or 'settings.js'.
   ========================================= */

function initSpecificPageScripts() {
  // --- A. AVATAR UPLOAD PREVIEW ---
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          avatarPreview.src = e.target.result;
          if (window.Toast)
            window.Toast.fire({
              title: "Photo Updated",
              message: "Avatar changed!",
              type: "success",
            });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- B. PASSWORD STRENGTH ---
  const passInput = document.getElementById("newPassword");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const eyeIcon = document.getElementById("eyeIcon");

  if (passInput && strengthBar && strengthText) {
    passInput.addEventListener("input", function () {
      const val = this.value;
      let score = 0;
      if (val.length > 5) score += 20;
      if (val.length > 8) score += 20;
      if (/[A-Z]/.test(val)) score += 20;
      if (/[0-9]/.test(val)) score += 20;
      if (/[^A-Za-z0-9]/.test(val)) score += 20;

      strengthBar.style.width = score + "%";
      if (score < 40) {
        strengthBar.style.backgroundColor = "var(--danger)";
        strengthText.innerText = "Weak";
      } else if (score < 80) {
        strengthBar.style.backgroundColor = "#f1c40f";
        strengthText.innerText = "Medium";
      } else {
        strengthBar.style.backgroundColor = "var(--accent-green)";
        strengthText.innerText = "Strong";
      }
    });
  }

  // Expose toggle function globally for onclick HTML attribute
  window.togglePass = function () {
    if (passInput && eyeIcon) {
      if (passInput.type === "password") {
        passInput.type = "text";
        eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        passInput.type = "password";
        eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
      }
    }
  };

  // --- C. TAG INPUT ---
  const tagWrapper = document.getElementById("tagWrapper");
  const tagInput = document.getElementById("tagInput");
  if (tagWrapper && tagInput) {
    tagWrapper.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-tag")) {
        e.target.closest(".tag-pill").remove();
      }
    });
    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = tagInput.value.trim();
        if (val) {
          const pill = document.createElement("span");
          pill.className = "tag-pill";
          pill.innerHTML = `${val} <i class="fa-solid fa-xmark ms-1 cursor-pointer remove-tag"></i>`;
          tagWrapper.insertBefore(pill, tagInput);
          tagInput.value = "";
        }
      }
    });
  }

  // --- D. AUTO SAVE SETTINGS ---
  const settingsForm = document.getElementById("settingsForm");
  const indicator = document.getElementById("autoSaveIndicator");
  if (settingsForm && indicator) {
    settingsForm.addEventListener("input", () => {
      const formData = new FormData(settingsForm);
      const data = {};
      formData.forEach((val, key) => (data[key] = val));
      localStorage.setItem("ultimate_settings_draft", JSON.stringify(data));
      indicator.classList.remove("d-none");
      setTimeout(() => indicator.classList.add("d-none"), 2000);
    });
    // Handle Reset
    window.resetForm = function () {
      localStorage.removeItem("ultimate_settings_draft");
      settingsForm.reset();
      document.querySelectorAll(".tag-pill").forEach((el) => el.remove());
      if (window.Toast)
        window.Toast.fire({
          title: "Reset",
          message: "All changes discarded.",
          type: "warning",
        });
    };

    // Load Saved Data Helper
    window.loadSavedData = function () {
      const saved = localStorage.getItem("ultimate_settings_draft");
      if (saved) {
        const data = JSON.parse(saved);
        for (const key in data) {
          const el = settingsForm.querySelector(`[name="${key}"]`);
          if (el) {
            if (el.type === "checkbox") el.checked = true;
            else el.value = data[key];
          }
        }
        if (window.Toast)
          window.Toast.fire({
            title: "Draft Restored",
            message: "Your unsaved changes are back.",
            type: "info",
          });
      }
    };

    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = settingsForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        localStorage.removeItem("ultimate_settings_draft");
        if (window.Toast)
          window.Toast.fire({
            title: "Success",
            message: "Account settings updated!",
            type: "success",
          });
      }, 1500);
    });
  }

  // --- E. LOGO UPLOAD PREVIEW ---
  const logoInput = document.getElementById("logoInput");
  const logoPreview = document.getElementById("logoPreview");
  if (logoInput && logoPreview) {
    logoInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          logoPreview.src = e.target.result;
          if (window.Toast)
            window.Toast.fire({
              title: "Logo Updated",
              message: "New logo selected.",
              type: "success",
            });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- F. COLOR PICKER ---
  const colorInput = document.getElementById("colorInput");
  const colorDisplay = document.getElementById("colorDisplay");
  const colorHex = document.getElementById("colorHex");
  if (colorInput && colorDisplay && colorHex) {
    colorDisplay.addEventListener("click", () => colorInput.click());
    colorInput.addEventListener("input", (e) => {
      const val = e.target.value;
      colorDisplay.style.backgroundColor = val;
      colorHex.innerText = val;
    });
  }

  // --- G. API COPY ---
  const copyText = document.getElementById("apiEndpoint");
  const iconCopy = document.getElementById("iconCopy");
  if (copyText && iconCopy) {
    window.copyToClipboard = function () {
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(copyText.value);
      iconCopy.classList.replace("fa-copy", "fa-check");
      iconCopy.style.color = "var(--accent-green)";
      if (window.Toast)
        window.Toast.fire({
          title: "Copied",
          message: "API Endpoint copied!",
          type: "success",
        });
      setTimeout(() => {
        iconCopy.classList.replace("fa-check", "fa-copy");
        iconCopy.style.color = "";
      }, 2000);
    };
  }

  // --- H. RANGE SLIDER ---
  const storageRange = document.getElementById("storageRange");
  const storageVal = document.getElementById("storageVal");
  if (storageRange && storageVal) {
    storageRange.addEventListener("input", function () {
      const val = parseInt(this.value);
      if (val >= 1024) storageVal.innerText = (val / 1024).toFixed(1) + " GB";
      else storageVal.innerText = val + " MB";
    });
  }

  // --- I. SYSTEM CONFIG FORM ---
  const configForm = document.getElementById("systemConfigForm");
  if (configForm) {
    // Helper Toggle
    window.toggleMaint = function (el) {
      const badge = document.getElementById("maintStatus");
      if (!badge) return;
      if (el.checked) {
        badge.innerText = "Maintenance Mode";
        badge.className = "badge badge-soft-danger ms-3";
        if (window.Toast)
          window.Toast.fire({
            title: "Warning",
            message: "Site is now offline.",
            type: "warning",
          });
      } else {
        badge.innerText = "Live";
        badge.className = "badge badge-soft-success ms-3";
      }
    };

    // Helper Reset
    window.resetDefaults = function () {
      document.getElementById("siteName").value = "";
      const preview = document.getElementById("logoPreview");
      if (preview) preview.src = "https://via.placeholder.com/150";

      const cInput = document.getElementById("colorInput");
      if (cInput) cInput.value = "#a855f7";
      const cDisplay = document.getElementById("colorDisplay");
      if (cDisplay) cDisplay.style.backgroundColor = "#a855f7";

      const cHex = document.getElementById("colorHex");
      if (cHex) cHex.innerText = "#a855f7";
      const sRange = document.getElementById("storageRange");
      if (sRange) sRange.value = 2048;

      const sVal = document.getElementById("storageVal");
      if (sVal) sVal.innerText = "2048 MB";
      const mSwitch = document.getElementById("maintSwitch");
      if (mSwitch) {
        mSwitch.checked = false;
        window.toggleMaint(mSwitch);
      }

      if (window.Toast)
        window.Toast.fire({
          title: "Reset",
          message: "All settings restored to default.",
          type: "info",
        });
    };

    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = configForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        if (window.Toast)
          window.Toast.fire({
            title: "Saved",
            message: "System configuration updated.",
            type: "success",
          });
      }, 1500);
    });
  }
}

/* =========================================
   6. MAIN EXECUTION
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  DailyLayout.init();
  DailyComponents.init();
  DailyForms.initValidation();

  // Jalankan logika halaman spesifik
  // (Aman dijalankan karena ada pengecekan if element exist di dalamnya)
  initSpecificPageScripts();
});

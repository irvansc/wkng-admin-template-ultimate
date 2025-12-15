document.addEventListener("DOMContentLoaded", function () {
  // --- CLASS: CUSTOM SELECT MANAGER ---
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
          this.searchInput.focus();
          this.searchInput.value = ""; // Reset search text
          this.filterOptions(""); // Show all
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
      this.searchInput.addEventListener("input", (e) => {
        this.filterOptions(e.target.value.toLowerCase());
      });

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
      this.hiddenInput.value = value;

      // Close Dropdown
      this.wrapper.classList.remove("open");

      // Trigger Change Event (Opsional)
      console.log("Selected:", value);
    }

    // --- MULTIPLE SELECT LOGIC ---
    toggleMultiple(value, labelHTML, optionElement) {
      const index = this.selectedValues.findIndex(
        (item) => item.value === value
      );

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
        // Strip HTML tags for cleaner text in tag, or keep icon only?
        // Kita pakai HTML penuh tapi div resize
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

    updateHiddenInput() {
      // Simpan sebagai koma separated (html,css,js)
      const values = this.selectedValues.map((i) => i.value).join(",");
      this.hiddenInput.value = values;

      // Demo Update Preview (Khusus halaman ini)
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

  // --- INITIALIZE ALL CUSTOM SELECTS ---
  document.querySelectorAll(".custom-select-wrapper").forEach((el) => {
    new CustomSelect(el);
  });
});

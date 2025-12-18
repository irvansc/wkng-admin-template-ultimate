document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------------------------------------
       1. MOBILE MENU LOGIC (Ultimate Overlay)
    ----------------------------------------------------------- */
  const menuBtn = document.querySelectorAll(".mobile-menu-btn");
  const closeBtn = document.querySelector(".mobile-close-btn");
  const overlay = document.querySelector(".mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-nav-item"); // Link biasa
  const mobileRowLinks = document.querySelectorAll(
    ".mobile-nav-row:not(summary)"
  ); // Link row style

  function toggleMenu() {
    if (overlay) {
      overlay.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    }
  }

  if (menuBtn)
    menuBtn.forEach((btn) => btn.addEventListener("click", toggleMenu));
  if (closeBtn) closeBtn.addEventListener("click", toggleMenu);

  // Close menu when any link is clicked
  const allLinks = [...mobileLinks, ...mobileRowLinks];
  allLinks.forEach((link) => {
    link.addEventListener("click", toggleMenu);
  });

  /* -----------------------------------------------------------
       2. PRICING TOGGLE LOGIC
    ----------------------------------------------------------- */
  const switchBtns = document.querySelectorAll(".switch-btn");
  const priceValues = document.querySelectorAll(".price-value");

  if (switchBtns.length > 0) {
    switchBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        switchBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const period = btn.dataset.period;
        priceValues.forEach((price) => {
          const amount = price.getAttribute(`data-${period}`);
          price.style.opacity = 0;
          setTimeout(() => {
            price.innerText = amount;
            price.style.opacity = 1;
          }, 200);
        });
      });
    });
  }

  /* -----------------------------------------------------------
       3. FAQ ACCORDION
    ----------------------------------------------------------- */
  const accordions = document.querySelectorAll(".accordion-header");
  accordions.forEach((acc) => {
    acc.addEventListener("click", () => {
      acc.classList.toggle("active");
      const panel = acc.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* -----------------------------------------------------------
       4. SCROLL REVEAL ANIMATION
    ----------------------------------------------------------- */
  const revealElements = document.querySelectorAll(".reveal");
  const fadeUps = document.querySelectorAll(".fade-in-up");

  const revealOnScroll = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  fadeUps.forEach((el) => revealOnScroll.observe(el));
  revealElements.forEach((el) => revealOnScroll.observe(el));

  /* -----------------------------------------------------------
       5. BACK TO TOP LOGIC
    ----------------------------------------------------------- */
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /* -----------------------------------------------------------
       6. THEME TOGGLE LOGIC (Dark/Light)
    ----------------------------------------------------------- */
  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  const htmlElement = document.documentElement;
  const savedTheme = localStorage.getItem("theme") || "dark";

  function setTheme(theme) {
    htmlElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    themeToggleBtns.forEach((btn) => {
      // Cek apakah icon ada di dalam div .util-icon atau langsung
      const icon = btn.querySelector("i");
      const textSpan = btn.querySelector("span");

      // Update Class Icon
      if (theme === "light") {
        if (icon) {
          icon.classList.remove("fa-moon");
          icon.classList.add("fa-sun");
        }
        if (textSpan) textSpan.innerText = "Light Mode";
      } else {
        if (icon) {
          icon.classList.remove("fa-sun");
          icon.classList.add("fa-moon");
        }
        if (textSpan) textSpan.innerText = "Dark Mode";
      }
    });
  }

  // Set Initial Theme
  setTheme(savedTheme);

  themeToggleBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Prevent default behavior just in case
      e.preventDefault();
      const currentTheme = htmlElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  });

  /* -----------------------------------------------------------
       7. SEARCH OVERLAY LOGIC
    ----------------------------------------------------------- */
  const searchTriggers = document.querySelectorAll(".search-trigger-btn");
  const searchOverlay = document.querySelector(".search-overlay");
  const searchClose = document.querySelector(".search-close-btn");

  if (searchOverlay) {
    function toggleSearch(e) {
      if (e) e.preventDefault();
      searchOverlay.classList.toggle("active");

      // Auto focus input
      if (searchOverlay.classList.contains("active")) {
        const input = searchOverlay.querySelector("input");
        if (input) setTimeout(() => input.focus(), 100);

        // Tutup mobile menu jika sedang terbuka
        const mobileMenu = document.querySelector(".mobile-menu-overlay");
        if (mobileMenu && mobileMenu.classList.contains("active")) {
          mobileMenu.classList.remove("active");
          document.body.classList.remove("menu-open");
        }
      }
    }

    searchTriggers.forEach((btn) =>
      btn.addEventListener("click", toggleSearch)
    );
    if (searchClose) searchClose.addEventListener("click", toggleSearch);

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
        toggleSearch();
      }
    });
  }

  /* -----------------------------------------------------------
       8. FOOTER ACCORDION (Mobile Only)
    ----------------------------------------------------------- */
  const footerHeadings = document.querySelectorAll(".footer-heading-mobile");

  if (footerHeadings) {
    footerHeadings.forEach((header) => {
      header.addEventListener("click", () => {
        // Hanya aktif di layar kecil (Mobile)
        if (window.innerWidth <= 768) {
          const parent = header.parentElement;
          parent.classList.toggle("active");
        }
      });
    });
  }

  /* -----------------------------------------------------------
       9. FLOATING CTA CLOSE LOGIC (NEW)
    ----------------------------------------------------------- */
  const floatingCta = document.getElementById("floating-cta");
  const closeCtaBtn = document.getElementById("close-floating-cta");

  if (floatingCta && closeCtaBtn) {
    closeCtaBtn.addEventListener("click", () => {
      // 1. Sembunyikan elemen CTA dengan animasi halus
      floatingCta.style.opacity = "0";
      floatingCta.style.transform = "translateY(100px)"; // Turun ke bawah

      // 2. Tunggu animasi sebentar, lalu hilangkan dari layout
      setTimeout(() => {
        floatingCta.style.display = "none";

        // 3. Tambahkan class ke Body untuk menghapus padding kosong
        document.body.classList.add("cta-dismissed");
      }, 300);
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // --- MOCK DATA ---
  // Generate data dummy
  const rawPhotos = Array.from({ length: 60 }).map((_, i) => {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 20));

    return {
      id: i,
      url: `https://picsum.photos/500/500?random=${i}`,
      fullUrl: `https://picsum.photos/1200/800?random=${i}`,
      date: dateObj,
      selected: false,
    };
  });

  // Mock Albums Data
  const albums = [
    {
      id: 1,
      title: "Vacation 2024",
      count: 120,
      img: "https://picsum.photos/400/400?random=100",
    },
    {
      id: 2,
      title: "Design Assets",
      count: 45,
      img: "https://picsum.photos/400/400?random=101",
    },
    {
      id: 3,
      title: "Family",
      count: 300,
      img: "https://picsum.photos/400/400?random=102",
    },
    {
      id: 4,
      title: "Office Life",
      count: 12,
      img: "https://picsum.photos/400/400?random=103",
    },
  ];

  // Sort photos by date descending
  rawPhotos.sort((a, b) => b.date - a.date);

  // --- STATE ---
  let selectedIds = new Set();
  let isSelectMode = false;
  let currentLightboxIndex = 0;
  let currentView = "photos"; // 'photos', 'albums', 'single-album'

  // --- DOM ELEMENTS ---
  const photoContainer = document.getElementById("viewPhotos");
  const albumContainerView = document.getElementById("viewAlbums");
  const albumsGrid = document.getElementById("albumsGrid");
  const selectionBar = document.getElementById("selectionBar");
  const selectCountEl = selectionBar.querySelector(".selection-count");
  const btnSelectMode = document.getElementById("btnSelectMode");
  const pageTitle = document.querySelector(".hero-title"); // Judul Halaman
  const tabContainer = document.querySelector(".tabs-segmented"); // Container Tab

  // --- HELPER: GROUP BY DATE ---
  function groupByDate(photos) {
    const groups = {};
    photos.forEach((photo) => {
      const dateStr = photo.date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const today = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      let displayDate = dateStr === today ? "Today" : dateStr;

      if (!groups[displayDate]) groups[displayDate] = [];
      groups[displayDate].push(photo);
    });
    return groups;
  }

  // --- RENDER FUNCTIONS ---

  // 1. Render Photo Grid (Bisa terima filter album)
  function renderGallery(filterAlbumId = null) {
    // Simulasi Filter: Jika ada album ID, kita acak arraynya biar terlihat beda
    // Di real app, ini akan filter by album_id dari database
    let photosToRender = rawPhotos;

    if (filterAlbumId) {
      // Simulasi: Ambil sebagian foto saja untuk album
      photosToRender = rawPhotos.filter((_, index) => index % 2 === 0);
    }

    const groups = groupByDate(photosToRender);
    let html = "";

    if (Object.keys(groups).length === 0) {
      html = `<div class="text-center p-5 text-muted">No photos found.</div>`;
    } else {
      for (const [date, photos] of Object.entries(groups)) {
        html += `
                    <div class="gallery-section">
                        <div class="gallery-date-header">
                            <i class="fa-regular fa-calendar"></i> ${date}
                        </div>
                        <div class="photo-grid">
                            ${photos
                              .map(
                                (photo) => `
                                <div class="photo-item ${
                                  selectedIds.has(photo.id) ? "selected" : ""
                                } skeleton" 
                                     data-id="${photo.id}" 
                                     onclick="handleItemClick(${photo.id})">
                                    <img src="${photo.url}" 
                                         loading="lazy" 
                                         alt="Photo"
                                         onload="this.parentElement.classList.remove('skeleton'); this.classList.add('loaded');"
                                         onerror="this.parentElement.classList.remove('skeleton')"> 
                                    <div class="photo-select-overlay">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                `;
      }
    }
    photoContainer.innerHTML = html;
    photoContainer.style.display = "block";
  }

  // 2. Render Albums Grid
  function renderAlbums() {
    if (albumsGrid.children.length > 0) return;

    albumsGrid.innerHTML = albums
      .map(
        (alb) => `
            <div class="col-span-4 col-md-6"> 
                <button class="album-card" onclick="openAlbum(${alb.id}, '${alb.title}')">
                    <div class="album-cover-group">
                        <img src="${alb.img}" class="album-cover">
                    </div>
                    <div class="album-info">
                        <div class="album-title">${alb.title}</div>
                        <div class="album-meta">${alb.count} items</div>
                    </div>
                </button>
            </div>
        `
      )
      .join("");
  }

  // --- NAVIGATION LOGIC ---

  // Fungsi Utama: Buka Album
  window.openAlbum = function (id, title) {
    // 1. Update State
    currentView = "single-album";

    // 2. Hide Tabs & Album Grid
    tabContainer.style.display = "none"; // Sembunyikan tab Photos/Albums
    albumContainerView.style.display = "none";

    // 3. Update Header Title dengan tombol Back
    pageTitle.innerHTML = `
            <span class="cursor-pointer text-muted" onclick="closeAlbum()">
                <i class="fa-solid fa-arrow-left"></i> Albums
            </span> 
            <span class="mx-2 text-muted">/</span> 
            ${title}
        `;
    pageTitle.style.fontSize = "20px";

    // 4. Render Gallery dengan Filter (Simulasi)
    renderGallery(id);
  };

  // Fungsi Utama: Tutup Album (Back)
  window.closeAlbum = function () {
    // 1. Update State
    currentView = "albums";

    // 2. Reset Header & Tabs
    pageTitle.innerHTML = "Photos";
    pageTitle.style.fontSize = "24px";
    tabContainer.style.display = "flex"; // Munculkan tab lagi

    // 3. Trigger klik tab "Albums" untuk reset view
    document.querySelector('[data-view="albums"]').click();
  };

  // --- INTERACTION HANDLERS ---

  window.handleItemClick = function (id) {
    if (isSelectMode) {
      toggleSelection(id);
    } else {
      openLightbox(id);
    }
  };

  function toggleSelection(id) {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    updateSelectionUI();
  }

  function updateSelectionUI() {
    document.querySelectorAll(".photo-item").forEach((el) => {
      const pid = parseInt(el.dataset.id);
      if (selectedIds.has(pid)) el.classList.add("selected");
      else el.classList.remove("selected");
    });

    if (selectedIds.size > 0) {
      selectionBar.classList.add("active");
      selectCountEl.innerText = `${selectedIds.size} Selected`;
    } else {
      selectionBar.classList.remove("active");
    }
  }

  // --- TAB SWITCHING (Photos vs Albums) ---
  const tabs = document.querySelectorAll(".tab-link-segment");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Reset Active Class
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const view = tab.dataset.view;

      if (view === "photos") {
        currentView = "photos";
        photoContainer.style.display = "block";
        albumContainerView.style.display = "none";
        renderGallery(); // Render full gallery (no filter)
      } else {
        currentView = "albums";
        photoContainer.style.display = "none";
        albumContainerView.style.display = "block";
        renderAlbums();
      }
    });
  });

  // --- SELECT MODE BTN ---
  if (btnSelectMode) {
    btnSelectMode.addEventListener("click", () => {
      isSelectMode = !isSelectMode;
      if (isSelectMode) {
        btnSelectMode.classList.replace("btn-secondary", "btn-primary");
        btnSelectMode.innerHTML = '<i class="fa-solid fa-check"></i> Done';
      } else {
        btnSelectMode.classList.replace("btn-primary", "btn-secondary");
        btnSelectMode.innerHTML =
          '<i class="fa-regular fa-square-check"></i> Select';
        selectedIds.clear();
        updateSelectionUI();
      }
    });
  }

  // --- GLOBAL ACTIONS ---
  window.galleryActions = {
    clearSelection: () => {
      selectedIds.clear();
      updateSelectionUI();
      isSelectMode = false;
      btnSelectMode.click(); // Reset btn visual
    },
    delete: () => {
      if (confirm(`Delete ${selectedIds.size} photos?`)) {
        DailyUI.showToast(`${selectedIds.size} Photos deleted`);
        window.galleryActions.clearSelection();
      }
    },
    share: () => DailyUI.showToast("Sharing link copied!"),
    addToAlbum: () => DailyUI.showToast("Added to Favorites"),
  };

  // --- LIGHTBOX (Sama seperti sebelumnya) ---
  const lightbox = document.getElementById("lightbox");
  const lbImage = document.getElementById("lbImage");
  const lbDate = document.getElementById("lbDate");

  window.openLightbox = function (id) {
    currentLightboxIndex = rawPhotos.findIndex((p) => p.id === id);
    if (currentLightboxIndex === -1) return; // Safety check
    updateLightboxContent();
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  function updateLightboxContent() {
    const photo = rawPhotos[currentLightboxIndex];
    lbImage.src = photo.fullUrl;
    lbDate.innerText = photo.date.toLocaleDateString();
  }

  document.getElementById("lbClose").addEventListener("click", () => {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
  });

  // Init
  renderGallery();
});

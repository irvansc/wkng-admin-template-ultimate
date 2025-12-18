/**
 * ============================================================================
 * KANBAN BOARD CONTROLLER (FULL FEATURED)
 * ============================================================================
 */

const KanbanApp = {
  data: {
    boards: [],
    viewMode: "grid",
    searchTerm: "",
    filterType: "all",
    filterOwner: "all",
    selectedColor: "bg-gradient-blue",
    tempInvitedMembers: [12], // Me
    currentUser: 12,
  },

  dom: {
    container: document.getElementById("boardsContainer"),
    search: document.getElementById("boardSearch"),
    viewToggles: document.querySelectorAll(".view-toggle-btn"),
    colorOptions: document.querySelectorAll(".kb-color-option"),
    createBtn: document.getElementById("btnCreateBoard"),
    modal: document.getElementById("createBoardModal"),
    boardName: document.getElementById("boardNameInput"),
    boardVisibility: document.getElementById("boardVisibility"),
    radioTypes: document.querySelectorAll('input[name="boardType"]'),
    inviteSection: document.getElementById("inviteMemberSection"),
    inviteBtn: document.getElementById("btnAddMemberFake"),
    inviteList: document.getElementById("invitedMembersList"),
  },

  init() {
    this.loadData();
    this.initEvents();
    this.initSmartForm();
    this.render();
  },

  loadData() {
    const defaultData = [
      {
        id: 1,
        title: "Q4 Mobile App Revamp",
        type: "project",
        desc: "Redesigning iOS & Android apps.",
        stats: { todo: 8, doing: 4, done: 12 },
        progress: 75,
        color: "bg-gradient-blue",
        icon: "fa-mobile-screen",
        members: [3, 4, 12],
        updated: "2h ago",
        ownerId: 12,
      },
      {
        id: 2,
        title: "Enterprise Sales Q1",
        type: "sales",
        desc: "Tracking high-value prospects.",
        stats: { todo: 25, doing: 10, done: 3 },
        progress: 25,
        color: "bg-gradient-green",
        icon: "fa-sack-dollar",
        members: [12, 1],
        updated: "1d ago",
        ownerId: 12,
      },
      {
        id: 3,
        title: "Content Calendar 2025",
        type: "custom",
        desc: "Social media posts schedule.",
        stats: { todo: 15, doing: 2, done: 20 },
        progress: 90,
        color: "bg-gradient-purple",
        icon: "fa-hashtag",
        members: [33],
        updated: "Just now",
        ownerId: 99,
      },
    ];
    const stored = localStorage.getItem("kb_boards");
    this.data.boards = stored ? JSON.parse(stored) : defaultData;
  },

  saveData() {
    localStorage.setItem("kb_boards", JSON.stringify(this.data.boards));
  },

  initSmartForm() {
    const checkType = () => {
      const checked = document.querySelector('input[name="boardType"]:checked');
      if (checked && checked.value === "project")
        this.dom.inviteSection.style.display = "block";
      else this.dom.inviteSection.style.display = "none";
    };
    this.dom.radioTypes.forEach((r) => r.addEventListener("change", checkType));
    checkType();

    if (this.dom.inviteBtn) {
      this.dom.inviteBtn.addEventListener("click", () => {
        const randomId = Math.floor(Math.random() * 50) + 1;
        this.data.tempInvitedMembers.push(randomId);
        const avatarHTML = `<div class="avatar avatar-xs fade-in-up"><img src="https://i.pravatar.cc/150?img=${randomId}"></div>`;
        this.dom.inviteList.insertAdjacentHTML("beforeend", avatarHTML);
      });
    }
  },

  initEvents() {
    this.dom.viewToggles.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.dom.viewToggles.forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.data.viewMode = e.currentTarget.dataset.view;
        this.render();
      });
    });

    if (this.dom.createBtn)
      this.dom.createBtn.addEventListener("click", () => this.createBoard());

    this.dom.colorOptions.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        this.dom.colorOptions.forEach((o) => o.classList.remove("selected"));
        e.currentTarget.classList.add("selected");
        this.data.selectedColor = e.currentTarget.dataset.color;
      });
    });

    if (this.dom.search) {
      this.dom.search.addEventListener("input", (e) => {
        this.data.searchTerm = e.target.value.toLowerCase();
        this.render();
      });
    }

    document.querySelectorAll(".custom-options .option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        const type = e.target.dataset.type;
        const val = e.target.dataset.value;
        e.target
          .closest(".custom-select-wrapper")
          .querySelector(".selection-text").innerText = e.target.innerText;
        if (type === "type") this.data.filterType = val;
        if (type === "owner") this.data.filterOwner = val;
        this.render();
      });
    });
  },

  createBoard() {
    const name = this.dom.boardName.value;
    const visibility = this.dom.boardVisibility
      ? this.dom.boardVisibility.value
      : "team";
    if (!name) {
      alert("Please enter board name");
      return;
    }

    let type = "project";
    let icon = "fa-code-branch";
    const radio = document.querySelector('input[name="boardType"]:checked');
    if (radio) {
      type = radio.value;
      if (type === "sales") icon = "fa-dollar-sign";
      if (type === "custom") icon = "fa-wand-magic-sparkles";
    }

    const newBoard = {
      id: Date.now(),
      title: name,
      type: type,
      desc: "New board created just now.",
      stats: { todo: 0, doing: 0, done: 0 },
      progress: 0,
      color: this.data.selectedColor,
      icon: icon,
      members: [...this.data.tempInvitedMembers],
      visibility: visibility,
      ownerId: this.data.currentUser,
      updated: "Just now",
    };

    const btn = this.dom.createBtn;
    const oldText = btn.innerText;
    btn.innerText = "Creating...";
    btn.disabled = true;

    setTimeout(() => {
      this.data.boards.unshift(newBoard);
      this.saveData();
      this.render();
      btn.innerText = oldText;
      btn.disabled = false;
      this.dom.boardName.value = "";
      this.data.tempInvitedMembers = [12];
      this.dom.inviteList.innerHTML = `<div class="avatar avatar-xs"><img src="https://i.pravatar.cc/150?img=12"></div>`;

      if (window.DailyComponents)
        window.DailyComponents.closeModal(this.dom.modal);
      else this.dom.modal.classList.remove("show");

      if (window.Toast)
        window.Toast.fire({
          title: "Success",
          message: "Board Created!",
          type: "success",
        });
    }, 500);
  },

  openBoard(id) {
    window.location.href = "pages-kanban-view.html";
  }, // Redirect Link

  deleteBoard(id) {
    if (confirm("Delete this board?")) {
      this.data.boards = this.data.boards.filter((b) => b.id !== id);
      this.saveData();
      this.render();
    }
  },

  render() {
    const container = this.dom.container;
    container.innerHTML = "";

    if (this.data.viewMode === "list") container.classList.add("list-view");
    else container.classList.remove("list-view");

    if (this.data.viewMode === "grid") {
      container.insertAdjacentHTML(
        "beforeend",
        `
            <div class="col-span-4 kb-create-wrapper" data-toggle="modal" data-target="#createBoardModal">
                <div class="kb-create-card">
                    <div class="kb-create-icon"><i class="fa-solid fa-plus"></i></div>
                    <h5 class="fw-bold text-main mb-1">Create New Board</h5>
                    <span class="text-sm">Start a new workflow</span>
                </div>
            </div>`
      );
    }

    const filtered = this.data.boards.filter((b) => {
      const matchSearch = b.title.toLowerCase().includes(this.data.searchTerm);
      const matchType =
        this.data.filterType === "all" || b.type === this.data.filterType;
      let matchOwner = true;
      if (this.data.filterOwner === "me")
        matchOwner = b.ownerId === this.data.currentUser;
      else if (this.data.filterOwner === "shared")
        matchOwner = b.ownerId !== this.data.currentUser;
      return matchSearch && matchType && matchOwner;
    });

    if (filtered.length === 0) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="col-span-12 text-center py-5 text-muted">No boards found matching your filters.</div>`
      );
      return;
    }

    filtered.forEach((board) => {
      let badgeClass = "badge-soft-primary";
      let badgeText = "Project";
      if (board.type === "sales") {
        badgeClass = "badge-soft-success";
        badgeText = "Sales";
      }
      if (board.type === "custom") {
        badgeClass = "badge-soft-warning";
        badgeText = "Custom";
      }

      const membersHtml = board.members
        .slice(0, 4)
        .map(
          (m) =>
            `<div class="avatar avatar-sm"><img src="https://i.pravatar.cc/150?img=${m}"></div>`
        )
        .join("");

      const html = `
            <div class="col-span-4 fade-in-up">
                <div class="kb-card">
                    <div class="kb-header">
                        <div class="kb-icon-box ${board.color}"><i class="fa-solid ${board.icon}"></i></div>
                        <div class="kb-info">
                            <div class="d-flex justify-between align-start w-full">
                                <div><h4 class="kb-title">${board.title}</h4><span class="badge ${badgeClass} kb-badge">${badgeText}</span></div>
                                
                                <div class="dropdown-action">
                                    <button class="btn-icon btn-sm dropdown-trigger" onclick="KanbanApp.toggleMenu(event, this)">
                                        <i class="fa-solid fa-ellipsis"></i>
                                    </button>
                                    
                                    <div class="dropdown-menu-action icon-mode">
                                        
                                        <a href="pages-kanban-view.html" class="action-icon-btn view" title="View Details">
                                            <i class="fa-regular fa-eye"></i>
                                        </a>

                                        <a href="#" class="action-icon-btn text-primary" title="Edit Board" onclick="event.preventDefault()">
                                            <i class="fa-regular fa-pen-to-square"></i>
                                        </a>

                                        <a href="#" class="action-icon-btn delete" title="Delete" onclick="KanbanApp.deleteBoard(${board.id}); return false;">
                                            <i class="fa-regular fa-trash-can"></i>
                                        </a>

                                    </div>
                                </div>
                                </div>
                            <p class="kb-desc">${board.desc}</p>
                        </div>
                    </div>
                    <div class="kb-stats">
                        <div class="kb-stat-item"><span class="kb-stat-val">${board.stats.todo}</span><span class="kb-stat-label">To Do</span></div>
                        <div class="kb-stat-item"><span class="kb-stat-val text-warning">${board.stats.doing}</span><span class="kb-stat-label">Doing</span></div>
                        <div class="kb-stat-item"><span class="kb-stat-val text-success">${board.stats.done}</span><span class="kb-stat-label">Done</span></div>
                    </div>
                    <div class="kb-footer">
                        <div class="kb-meta">
                            <div class="avatar-group">${membersHtml}</div>
                            <span class="kb-time"><i class="fa-regular fa-clock"></i> ${board.updated}</span>
                        </div>
                        <div class="kb-progress-track">
                            <div class="kb-progress-fill" style="width: ${board.progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>`;
      container.insertAdjacentHTML("beforeend", html);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  KanbanApp.init();
});

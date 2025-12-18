/**
 * ============================================================================
 * KANBAN BOARD VIEW CONTROLLER (ULTIMATE - WITH COLUMN ACTIONS)
 * ============================================================================
 */

const BoardApp = {
  data: {
    currentBoardId: 1,
    boardTitle: "Q4 Mobile App Revamp",
    currentFilter: "all",
    columns: [
      {
        id: "col-1",
        title: "To Do",
        color: "border-l-4 border-secondary",
        tasks: [
          {
            id: "t-1",
            title: "Setup Repo",
            desc: "Init git & config",
            tags: ["dev"],
            priority: "high",
            members: [12],
          },
          {
            id: "t-2",
            title: "Design System",
            desc: "Figma assets export",
            tags: ["design"],
            priority: "medium",
            members: [33],
          },
        ],
      },
      {
        id: "col-2",
        title: "In Progress",
        color: "border-l-4 border-warning",
        tasks: [
          {
            id: "t-3",
            title: "Auth Module",
            desc: "Login & Register API",
            tags: ["backend", "api"],
            priority: "high",
            members: [12, 45],
          },
        ],
      },
      {
        id: "col-3",
        title: "Review",
        color: "border-l-4 border-info",
        tasks: [
          {
            id: "t-4",
            title: "Landing Page",
            desc: "Fix responsive issues",
            tags: ["frontend"],
            priority: "low",
            members: [33],
          },
        ],
      },
      {
        id: "col-4",
        title: "Done",
        color: "border-l-4 border-success",
        tasks: [
          {
            id: "t-5",
            title: "Kickoff Meeting",
            desc: "Zoom recording attached",
            tags: ["meeting"],
            priority: "medium",
            members: [12, 33, 45],
          },
        ],
      },
    ],
    draggedTask: null,
    currentEditTaskId: null,
  },

  dom: {}, // Cache

  init() {
    this.cacheDOM();
    this.dom.title.innerText = this.data.boardTitle;
    this.renderBoard();
    this.initDragAndDrop();
    this.initSearch();
    this.initTagInput();
    this.initGlobalEvents();
  },

  cacheDOM() {
    this.dom = {
      container: document.getElementById("boardColumnsContainer"),
      title: document.getElementById("boardTitle"),
      modal: document.getElementById("taskModal"),
      form: document.getElementById("taskForm"),
      searchInput: document.getElementById("taskSearchInput"),
      columnSelect: document.getElementById("columnOptions"),
      columnInput: document.getElementById("taskColumnId"),
      tagWrapper: document.getElementById("tagWrapper"),
      btnDelete: document.getElementById("btnDeleteTask"),
      filterMenu: document.getElementById("filterMenu"),
      filterIndicator: document.getElementById("filterIndicator"),
    };
  },

  // --- COLUMN ACTIONS (NEW) ---
  toggleColumnMenu(event, colId) {
    event.stopPropagation();

    // 1. Tutup semua menu kolom lain
    document
      .querySelectorAll(".column-dropdown-menu")
      .forEach((el) => el.classList.remove("show"));

    // 2. Buka menu kolom yang diklik
    const menu = document.getElementById(`menu-${colId}`);
    if (menu) menu.classList.toggle("show");
  },

  renameColumn(colId) {
    const col = this.data.columns.find((c) => c.id === colId);
    if (!col) return;

    const newTitle = prompt("Enter new column title:", col.title);
    if (newTitle && newTitle.trim() !== "") {
      col.title = newTitle;
      this.renderBoard();
    }
  },

  deleteColumn(colId) {
    if (
      confirm("Are you sure you want to delete this column and all its tasks?")
    ) {
      this.data.columns = this.data.columns.filter((c) => c.id !== colId);
      this.renderBoard();
    }
  },

  // --- FILTER & RENDER LOGIC ---
  renderBoard() {
    if (!this.dom.container) this.cacheDOM(); // Re-cache if lost
    this.dom.container.innerHTML = "";

    // Populate Select Options (Modal)
    const colSelect = document.getElementById("columnOptions");
    if (colSelect) colSelect.innerHTML = "";

    this.data.columns.forEach((col) => {
      // 1. Render Option di Modal
      if (colSelect) {
        const option = document.createElement("div");
        option.className = "option";
        option.innerText = col.title;
        option.onclick = (e) => {
          const wrapper = e.target.closest(".custom-select-wrapper");
          wrapper.querySelector(".selection-text").innerText = col.title;
          wrapper.querySelector(".hidden-value").value = col.id;
          wrapper.classList.remove("open");
        };
        colSelect.appendChild(option);
      }

      // 2. Filter Tasks
      let filteredTasks = col.tasks;
      if (this.data.currentFilter !== "all") {
        filteredTasks = col.tasks.filter(
          (t) => t.priority === this.data.currentFilter
        );
      }

      // 3. Render HTML Kolom (TERMASUK TOMBOL ACTION BARU)
      const colHTML = `
                <div class="kb-column" id="col-${col.id}">
                    <div class="kb-col-header ${
                      col.color
                    }" style="border-left-width: 4px; border-left-style:solid;">
                        <div class="kb-col-title-group">
                            <span>${col.title}</span>
                            <span class="kb-task-count">${
                              filteredTasks.length
                            }</span>
                        </div>
                        
                        <div class="position-relative">
                            <button class="btn-icon btn-sm btn-ghost" onclick="BoardApp.toggleColumnMenu(event, '${
                              col.id
                            }')">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                            
                            <div class="column-dropdown-menu" id="menu-${
                              col.id
                            }">
                                <div class="col-action-item" onclick="BoardApp.renameColumn('${
                                  col.id
                                }')">
                                    <i class="fa-regular fa-pen-to-square"></i> Rename
                                </div>
                                <div class="col-action-item text-danger" onclick="BoardApp.deleteColumn('${
                                  col.id
                                }')">
                                    <i class="fa-regular fa-trash-can"></i> Delete
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div class="kb-col-body" id="${col.id}">
                        ${this.renderTasks(filteredTasks)}
                    </div>
                    
                    <div class="kb-col-footer">
                        <button class="btn-add-task-ghost" onclick="BoardApp.openTaskModal('${
                          col.id
                        }')">
                            <i class="fa-solid fa-plus"></i> Add Task
                        </button>
                    </div>
                </div>
            `;
      this.dom.container.insertAdjacentHTML("beforeend", colHTML);
    });

    // Add Ghost Button
    this.dom.container.insertAdjacentHTML(
      "beforeend",
      `
            <div class="kb-add-column" onclick="alert('Feature coming soon!')">
                <span><i class="fa-solid fa-plus me-2"></i> Add Section</span>
            </div>
        `
    );

    this.initDragAndDrop();
  },

  renderTasks(tasks) {
    if (tasks.length === 0)
      return `<div class="text-center text-muted text-xs py-4">No tasks</div>`;

    return tasks
      .map((task) => {
        let tagHTML = task.tags
          .map((t) => `<span class="kb-tag">${t}</span>`)
          .join("");
        let borderClass =
          task.priority === "high"
            ? "border-l-4 border-danger"
            : task.priority === "medium"
            ? "border-l-4 border-warning"
            : "";

        return `
                <div class="kb-task-card ${borderClass}" draggable="true" data-task-id="${
          task.id
        }" onclick="BoardApp.editTask('${task.id}')">
                    <div class="kb-task-tags">${tagHTML}</div>
                    <div class="kb-task-title">${task.title}</div>
                    <div class="kb-task-desc">${task.desc}</div>
                    <div class="kb-task-footer">
                        <div class="kb-task-meta"><span><i class="fa-regular fa-message"></i> 2</span></div>
                        <div class="avatar-group">
                            ${task.members
                              .map(
                                (m) =>
                                  `<div class="avatar avatar-xs"><img src="https://i.pravatar.cc/150?img=${m}"></div>`
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  },

  // --- GLOBAL EVENTS (Klik di luar menu) ---
  initGlobalEvents() {
    document.addEventListener("click", (e) => {
      // Tutup Filter Menu
      if (!e.target.closest(".position-relative")) {
        const filterMenu = document.getElementById("filterMenu");
        if (filterMenu) filterMenu.classList.remove("show");
      }
      // Tutup Column Menu (Jika klik di luar tombol kolom)
      if (!e.target.closest(".kb-col-header")) {
        document
          .querySelectorAll(".column-dropdown-menu")
          .forEach((el) => el.classList.remove("show"));
      }
    });
  },

  // --- FILTER MENU LOGIC ---
  toggleFilterMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("filterMenu");
    if (menu) menu.classList.toggle("show");
  },

  setFilter(priority, element) {
    if (window.event) window.event.stopPropagation();
    this.data.currentFilter = priority;

    document
      .querySelectorAll(".filter-option")
      .forEach((el) => el.classList.remove("active"));
    if (element) element.classList.add("active");

    const indicator = document.getElementById("filterIndicator");
    if (indicator)
      priority === "all"
        ? indicator.classList.add("d-none")
        : indicator.classList.remove("d-none");

    this.renderBoard();
    const menu = document.getElementById("filterMenu");
    if (menu) menu.classList.remove("show");
  },

  // --- DRAG & DROP (NATIVE) ---
  initDragAndDrop() {
    const tasks = document.querySelectorAll(".kb-task-card");
    const columns = document.querySelectorAll(".kb-col-body");

    tasks.forEach((task) => {
      task.addEventListener("dragstart", () => {
        task.classList.add("dragging");
        this.data.draggedTask = task;
      });
      task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
        this.data.draggedTask = null;
      });
    });

    columns.forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = this.getDragAfterElement(col, e.clientY);
        const draggable = document.querySelector(".dragging");
        if (draggable) {
          if (afterElement == null) col.appendChild(draggable);
          else col.insertBefore(draggable, afterElement);
        }
      });
      col.addEventListener("drop", () => {
        if (this.data.draggedTask) {
          const taskId = this.data.draggedTask.getAttribute("data-task-id");
          const newColId = col.id;
          this.moveTaskData(taskId, newColId);
        }
      });
    });
  },

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".kb-task-card:not(.dragging)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset)
          return { offset: offset, element: child };
        else return closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  },

  moveTaskData(taskId, newColId) {
    let taskItem = null;
    this.data.columns.forEach((col) => {
      const idx = col.tasks.findIndex((t) => t.id === taskId);
      if (idx > -1) taskItem = col.tasks.splice(idx, 1)[0];
    });
    const destCol = this.data.columns.find((c) => c.id === newColId);
    if (destCol && taskItem) {
      destCol.tasks.push(taskItem);
      this.renderBoard();
    }
  },

  // --- MODAL & FORM ---
  openTaskModal(colId = null) {
    document.getElementById("taskForm").reset();
    document.getElementById("tagWrapper").innerHTML =
      '<input type="text" class="tag-input" id="tagInput" placeholder="Add tag & press Enter">';
    this.initTagInput();

    if (colId) {
      this.data.currentEditTaskId = null;
      document.getElementById("taskModalTitle").innerText = "Add New Task";
      document.getElementById("btnDeleteTask").classList.add("d-none");
      document.getElementById("taskColumnId").value = colId;
      // Update Select Label UI
      const col = this.data.columns.find((c) => c.id === colId);
      if (col)
        document
          .getElementById("columnSelectWrapper")
          .querySelector(".selection-text").innerText = col.title;
    }
    document.getElementById("taskModal").classList.add("show");
  },

  editTask(taskId) {
    this.data.currentEditTaskId = taskId;
    document.getElementById("taskModalTitle").innerText = "Edit Task";
    document.getElementById("btnDeleteTask").classList.remove("d-none");

    let task = null,
      colId = null;
    this.data.columns.forEach((col) => {
      const t = col.tasks.find((x) => x.id === taskId);
      if (t) {
        task = t;
        colId = col.id;
      }
    });

    if (task) {
      document.getElementById("taskTitle").value = task.title;
      document.getElementById("taskDesc").value = task.desc;
      document.getElementById("taskColumnId").value = colId;

      const col = this.data.columns.find((c) => c.id === colId);
      if (col)
        document
          .getElementById("columnSelectWrapper")
          .querySelector(".selection-text").innerText = col.title;

      // Load Tags
      const wrapper = document.getElementById("tagWrapper");
      const input = document.getElementById("tagInput");
      // Bersihkan tag lama kecuali input
      wrapper.querySelectorAll(".tag-pill").forEach((e) => e.remove());

      task.tags.forEach((tag) => {
        const pill = document.createElement("span");
        pill.className = "tag-pill";
        pill.innerHTML = `${tag} <i class="fa-solid fa-xmark ms-1 cursor-pointer remove-tag"></i>`;
        wrapper.insertBefore(pill, input);
      });

      document.getElementById("taskModal").classList.add("show");
    }
  },

  saveTask() {
    const title = document.getElementById("taskTitle").value;
    const colId = document.getElementById("taskColumnId").value;
    if (!title || !colId) return alert("Title required");

    if (this.data.currentEditTaskId)
      this.deleteTaskInternal(this.data.currentEditTaskId);

    const tags = [];
    document
      .querySelectorAll(".tag-pill")
      .forEach((p) => tags.push(p.innerText.trim()));

    const newTask = {
      id: this.data.currentEditTaskId || `t-${Date.now()}`,
      title: title,
      desc: document.getElementById("taskDesc").value,
      tags: tags,
      priority: "medium",
      members: [12],
    };

    const targetCol = this.data.columns.find((c) => c.id === colId);
    if (targetCol) {
      targetCol.tasks.push(newTask);
      this.renderBoard();
      this.closeModal();
    }
  },

  deleteCurrentTask() {
    if (confirm("Delete task?")) {
      this.deleteTaskInternal(this.data.currentEditTaskId);
      this.renderBoard();
      this.closeModal();
    }
  },

  deleteTaskInternal(taskId) {
    this.data.columns.forEach((col) => {
      col.tasks = col.tasks.filter((t) => t.id !== taskId);
    });
  },

  closeModal() {
    document.getElementById("taskModal").classList.remove("show");
  },

  initSearch() {
    this.dom.searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll(".kb-task-card").forEach((card) => {
        const title = card
          .querySelector(".kb-task-title")
          .innerText.toLowerCase();
        card.style.display = title.includes(term) ? "block" : "none";
      });
    });
  },

  initTagInput() {
    const wrapper = document.getElementById("tagWrapper");
    const input = document.getElementById("tagInput");
    if (!wrapper || !input) return;

    // Clone to remove old listeners
    const newWrapper = wrapper.cloneNode(true);
    wrapper.parentNode.replaceChild(newWrapper, wrapper);

    const newInput = newWrapper.querySelector(".tag-input");

    newWrapper.addEventListener("click", (e) => {
      if (e.target.closest(".remove-tag"))
        e.target.closest(".tag-pill").remove();
    });

    newInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = newInput.value.trim();
        if (val) {
          const pill = document.createElement("span");
          pill.className = "tag-pill";
          pill.innerHTML = `${val} <i class="fa-solid fa-xmark ms-1 cursor-pointer remove-tag"></i>`;
          newWrapper.insertBefore(pill, newInput);
          newInput.value = "";
        }
      }
    });
  },
};

window.BoardApp = BoardApp;
document.addEventListener("DOMContentLoaded", () => {
  BoardApp.init();
});

/**
 * ============================================================================
 * KANBAN PROJECT BOARDS LIST CONTROLLER
 * ============================================================================
 */

const KanbanList = {
  data: {
    boards: [
      {
        id: 1,
        title: "Q4 Mobile App Revamp",
        code: "MOB-24",
        status: "active", // active, planning, completed, onhold
        desc: "Redesigning UI/UX for iOS & Android with new Flutter engine.",
        stats: { total: 42, done: 28 },
        dueDate: "2025-12-20",
        members: [12, 33, 45, 10, 5],
        icon: "fa-mobile-screen",
        color: "text-primary",
      },
      {
        id: 2,
        title: "Marketing Website 2.0",
        code: "WEB-09",
        status: "planning",
        desc: "New landing page with SEO optimization and CMS integration.",
        stats: { total: 15, done: 3 },
        dueDate: "2026-01-15",
        members: [33, 21],
        icon: "fa-globe",
        color: "text-success",
      },
      {
        id: 3,
        title: "Internal CRM System",
        code: "SYS-01",
        status: "active",
        desc: "Migration from Legacy system to custom Laravel build.",
        stats: { total: 120, done: 95 },
        dueDate: "2025-11-30",
        members: [12, 45, 21, 5, 8, 9],
        icon: "fa-server",
        color: "text-warning",
      },
      {
        id: 4,
        title: "Legacy Data Archive",
        code: "DAT-88",
        status: "completed",
        desc: "Archiving 5 years of transaction data to cold storage.",
        stats: { total: 50, done: 50 },
        dueDate: "2025-10-01",
        members: [12],
        icon: "fa-database",
        color: "text-muted",
      },
    ],
    filter: "all",
    search: "",
  },

  dom: {
    grid: document.getElementById("projectBoardsGrid"),
    search: document.getElementById("boardSearch"),
    modal: document.getElementById("createBoardModal"),
  },

  init() {
    this.render();
    this.initEvents();
  },

  initEvents() {
    // Search Listener
    this.dom.search.addEventListener("input", (e) => {
      this.data.search = e.target.value.toLowerCase();
      this.render();
    });
  },

  // --- LOGIC: RENDER GRID ---
  render() {
    this.dom.grid.innerHTML = "";

    // Filter Data
    const filtered = this.data.boards.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(this.data.search) ||
        b.code.toLowerCase().includes(this.data.search);
      const matchStatus =
        this.data.filter === "all" || b.status === this.data.filter;
      return matchSearch && matchStatus;
    });

    // Empty State
    if (filtered.length === 0) {
      this.dom.grid.innerHTML = `
                <div class="kb-empty-state">
                    <div class="mb-3 text-muted"><i class="fa-solid fa-folder-open fa-3x"></i></div>
                    <h4>No Project Boards Found</h4>
                    <p class="text-muted text-sm">Try adjusting your filters or create a new board.</p>
                </div>
            `;
      return;
    }

    // Generate Cards
    filtered.forEach((board) => {
      // Kalkulasi Progress
      const percentage = Math.round(
        (board.stats.done / board.stats.total) * 100
      );

      // Tentukan Warna Progress
      let progressColor = "var(--primary)";
      if (percentage === 100) progressColor = "var(--success)";
      else if (percentage < 20) progressColor = "var(--danger)";

      // Status Badge Logic
      let badgeClass = "badge-soft-secondary";
      if (board.status === "active") badgeClass = "badge-soft-primary";
      if (board.status === "completed") badgeClass = "badge-soft-success";
      if (board.status === "planning") badgeClass = "badge-soft-warning";

      // Member Avatars (Max 3 + Counter)
      const maxShow = 3;
      let membersHtml = board.members
        .slice(0, maxShow)
        .map(
          (m) =>
            `<div class="avatar avatar-sm"><img src="https://i.pravatar.cc/150?img=${m}"></div>`
        )
        .join("");

      if (board.members.length > maxShow) {
        membersHtml += `<div class="avatar avatar-sm bg-card text-xs fw-bold border-dashed">+${
          board.members.length - maxShow
        }</div>`;
      }

      const html = `
                <div class="project-card fade-in-up" onclick="window.location.href='pages-kanban-view.html?id=${
                  board.id
                }'">
                    
                    <div class="pc-header">
                        <div class="pc-icon ${board.color}">
                            <i class="fa-solid ${board.icon}"></i>
                        </div>
                        <div class="d-flex align-center gap-2">
                            <span class="badge ${badgeClass} uppercase tracking-wider" style="font-size: 10px;">${
        board.status
      }</span>
                            <div class="dropdown pc-options" onclick="event.stopPropagation()">
                                <button class="btn-icon btn-sm btn-ghost"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="pc-body">
                        <a href="#" class="pc-title text-truncate">${
                          board.title
                        }</a>
                        <div class="pc-meta">
                            <span class="font-mono bg-hover px-2 rounded text-xs">${
                              board.code
                            }</span>
                            <span>Created Dec 2024</span>
                        </div>

                        <div class="pc-progress-wrapper">
                            <div class="pc-progress-info">
                                <span>Progress</span>
                                <span>${percentage}%</span>
                            </div>
                            <div class="pc-progress-bar">
                                <div class="pc-progress-fill" style="width: ${percentage}%; background: ${progressColor}"></div>
                            </div>
                            <div class="text-xs text-muted mt-2">
                                <i class="fa-solid fa-check-circle me-1 text-success"></i> ${
                                  board.stats.done
                                }/${board.stats.total} Tasks Completed
                            </div>
                        </div>
                    </div>

                    <div class="pc-footer">
                        <div class="avatar-group">
                            ${membersHtml}
                        </div>
                        <div class="pc-deadline ${
                          this.isOverdue(board.dueDate) ? "overdue" : ""
                        }">
                            <i class="fa-regular fa-calendar"></i> ${this.formatDate(
                              board.dueDate
                            )}
                        </div>
                    </div>

                </div>
            `;
      this.dom.grid.insertAdjacentHTML("beforeend", html);
    });
  },

  // --- UTILITIES ---
  filterStatus(status) {
    this.data.filter = status;
    this.render();
  },

  openCreateModal() {
    this.dom.modal.classList.add("show");
  },

  closeModal() {
    this.dom.modal.classList.remove("show");
  },

  createBoard() {
    // Simulasi Create
    const name = document.getElementById("newBoardName").value;
    if (!name) return alert("Project Name Required");

    alert(`Creating board: ${name}... (Backend Integration Required)`);
    this.closeModal();
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  },

  isOverdue(dateStr) {
    return (
      new Date(dateStr) < new Date() &&
      new Date(dateStr).getFullYear() === new Date().getFullYear()
    );
  },
};

document.addEventListener("DOMContentLoaded", () => {
  KanbanList.init();
});

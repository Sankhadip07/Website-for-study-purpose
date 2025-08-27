/* ------- Constants ------- */

const STORAGE_KEY = "foldersData";
const THEME_KEY = "theme";

/* ------- Helpers: storage ------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { folders: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.folders)) return { folders: [] };
    return parsed;
  } catch {
    return { folders: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ------- State ------- */
let state = loadData();

/* ------- DOM refs ------- */
const folderContainer = () => document.getElementById("folderContainer");
const folderInput = () => document.getElementById("folderInput");
const searchInput = () => document.getElementById("searchInput");

/* ------- Rendering ------- */
function renderFolders() {
  const container = folderContainer();
  container.innerHTML = "";

  const filter = (searchInput()?.value || "").toLowerCase().trim();

  state.folders.forEach(folder => {
    if (filter && !folder.name.toLowerCase().includes(filter)) return;

    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";
    folderDiv.dataset.id = folder.id;

    // header (title + delete)
    const folderHeader = document.createElement("div");
    folderHeader.className = "folder-header";

    const folderTitle = document.createElement("h3");
    folderTitle.innerHTML = `<i class="fa-solid fa-folder"></i> ${escapeHtml(folder.name)}`;
    folderTitle.onclick = () => {
      contentDiv.style.display = contentDiv.style.display === "block" ? "none" : "block";
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteFolder(folder.id);

    folderHeader.append(folderTitle, deleteBtn);

    // content
    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    // Inputs/Buttons row
    const linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.placeholder = "Add a new link (https://...)";

    const addLinkBtn = document.createElement("button");
    addLinkBtn.innerHTML = `<i class="fa-solid fa-link"></i> Add Link`;
    addLinkBtn.onclick = () => {
      addLink(folder.id, linkInput.value);
      linkInput.value = "";
    };

    const noteInput = document.createElement("textarea");
    noteInput.placeholder = "Write your notes here...";

    const addNoteBtn = document.createElement("button");
    addNoteBtn.innerHTML = `<i class="fa-solid fa-note-sticky"></i> Add Note`;
    addNoteBtn.onclick = () => {
      addNote(folder.id, noteInput.value);
      noteInput.value = "";
    };

    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.onchange = () => previewPhoto(folder.id, photoInput);

    const actions = document.createElement("div");
    actions.className = "inline-actions";
    actions.append(addLinkBtn, addNoteBtn);

    contentDiv.append(
      linkInput,
      actions,
      noteInput,
      photoInput
    );

    // Existing Links
    folder.links.forEach(url => {
      const linkItem = document.createElement("div");
      linkItem.innerHTML = `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`;
      contentDiv.appendChild(linkItem);
    });

    // Existing Notes
    folder.notes.forEach(n => {
      const noteItem = document.createElement("div");
      noteItem.textContent = n;
      contentDiv.appendChild(noteItem);
    });

    // Existing Photos
    folder.photos.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      contentDiv.appendChild(img);
    });

    folderDiv.append(folderHeader, contentDiv);
    container.appendChild(folderDiv);
  });
}

/* ------- CRUD actions ------- */
function addFolder() {
  const name = (folderInput().value || "").trim();
  if (!name) {
    alert("Please enter a folder name.");
    return;
  }
  const newFolder = {
    id: `f_${Date.now().toString(36)}`,
    name,
    links: [],
    notes: [],
    photos: []
  };
  state.folders.push(newFolder);
  saveData(state);
  folderInput().value = "";
  renderFolders();
}

function addLink(folderId, link) {
  const url = (link || "").trim();
  if (!url) return alert("Please enter a valid link.");
  const f = state.folders.find(x => x.id === folderId);
  if (!f) return;
  f.links.push(url);
  saveData(state);
  renderFolders();
}

function addNote(folderId, note) {
  const val = (note || "").trim();
  if (!val) return alert("Please enter a note.");
  const f = state.folders.find(x => x.id === folderId);
  if (!f) return;
  f.notes.push(val);
  saveData(state);
  renderFolders();
}

function previewPhoto(folderId, input) {
  const files = input.files;
  if (!files || !files.length) return;

  const f = state.folders.find(x => x.id === folderId);
  if (!f) return;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      f.photos.push(e.target.result); // data URL
      saveData(state);
      renderFolders();
    };
    reader.readAsDataURL(file);
  });

  input.value = "";
}

function deleteFolder(folderId) {
  if (!confirm("Are you sure you want to delete this folder?")) return;
  state.folders = state.folders.filter(f => f.id !== folderId);
  saveData(state);
  renderFolders();
}

/* ------- Search ------- */
function onSearchInput() {
  renderFolders();
}

/* ------- Theme ------- */
function applyThemeIcon() {
  const btn = document.getElementById("themeToggle");
  const isDark = document.body.classList.contains("dark");
  btn.innerHTML = isDark
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-icon lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon-icon lucide-moon"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>`;
  btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") document.body.classList.add("dark");
  applyThemeIcon();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const mode = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem(THEME_KEY, mode);
  applyThemeIcon();
}

/* ------- Utils ------- */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function escapeAttr(str) {
  // basic attribute escaping
  return escapeHtml(str).replaceAll("'", "&#39;");
}

/* ------- Boot ------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addFolderBtn").addEventListener("click", addFolder);
  const s = searchInput();
  if (s) s.addEventListener("input", onSearchInput);
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  // theme + data
  loadTheme();
  renderFolders();
});
/**
 * admin.js — Lógica del panel de administración
 */

// ===== ESTADO =====
let selectedFile = null;
let fileToDeleteId = null;

// ===== REFERENCIAS DOM =====
const dom = {
  loginScreen:      () => document.getElementById('loginScreen'),
  adminPanel:       () => document.getElementById('adminPanel'),
  loginForm:        () => document.getElementById('loginForm'),
  loginMessage:     () => document.getElementById('loginMessage'),
  logoutBtn:        () => document.getElementById('logoutBtn'),
  currentUser:      () => document.getElementById('currentUser'),

  tabDocuments:     () => document.getElementById('tabDocuments'),
  tabUpload:        () => document.getElementById('tabUpload'),
  tabUsers:         () => document.getElementById('tabUsers'),
  panelDocuments:   () => document.getElementById('panelDocuments'),
  panelUpload:      () => document.getElementById('panelUpload'),
  panelUsers:       () => document.getElementById('panelUsers'),

  uploadArea:       () => document.getElementById('uploadArea'),
  fileInput:        () => document.getElementById('fileInput'),
  filePreview:      () => document.getElementById('filePreview'),
  filePreviewName:  () => document.getElementById('filePreviewName'),
  filePreviewSize:  () => document.getElementById('filePreviewSize'),
  uploadBtn:        () => document.getElementById('uploadBtn'),
  cancelUploadBtn:  () => document.getElementById('cancelUploadBtn'),
  uploadStatus:     () => document.getElementById('uploadStatus'),
  storageUsage:     () => document.getElementById('storageUsage'),

  documentList:     () => document.getElementById('documentList'),
  docCount:         () => document.getElementById('docCount'),

  usersList:        () => document.getElementById('usersList'),
  createUserForm:   () => document.getElementById('createUserForm'),
  userMessage:      () => document.getElementById('userMessage'),

  deleteModal:      () => document.getElementById('deleteModal'),
  fileToDeleteName: () => document.getElementById('fileToDeleteName'),
  confirmDeleteBtn: () => document.getElementById('confirmDeleteBtn'),
  cancelDeleteBtn:  () => document.getElementById('cancelDeleteBtn'),
};

// ===== INICIALIZACIÓN =====
function init() {
  setupEventListeners();
  if (Auth.isLoggedIn()) {
    showPanel();
  } else {
    showLogin();
  }
}

function setupEventListeners() {
  dom.loginForm().addEventListener('submit', handleLogin);
  dom.logoutBtn().addEventListener('click', handleLogout);

  dom.tabDocuments().addEventListener('click', () => switchTab('documents'));
  dom.tabUpload().addEventListener('click', () => switchTab('upload'));
  dom.tabUsers().addEventListener('click', () => switchTab('users'));

  const area = dom.uploadArea();
  area.addEventListener('click', () => dom.fileInput().click());
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  });
  dom.fileInput().addEventListener('change', e => {
    if (e.target.files[0]) handleFileSelect(e.target.files[0]);
  });
  dom.uploadBtn().addEventListener('click', handleUpload);
  dom.cancelUploadBtn().addEventListener('click', resetUpload);

  dom.confirmDeleteBtn().addEventListener('click', confirmDelete);
  dom.cancelDeleteBtn().addEventListener('click', closeDeleteModal);
  dom.deleteModal().addEventListener('click', e => {
    if (e.target === dom.deleteModal()) closeDeleteModal();
  });

  dom.createUserForm().addEventListener('submit', handleCreateUser);
}

// ===== AUTENTICACIÓN =====
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  const account = Auth.validate(username, password);
  if (account) {
    setStatus(dom.loginMessage(), 'success', '✅ Bienvenido, accediendo...');
    setTimeout(() => {
      Auth.login(username);
      showPanel();
    }, 400);
  } else {
    setStatus(dom.loginMessage(), 'error', '❌ Usuario o contraseña incorrectos.');
    document.getElementById('loginPassword').value = '';
  }
}

function handleLogout() {
  Auth.logout();
  dom.loginForm().reset();
  showLogin();
}

function showLogin() {
  dom.loginScreen().classList.remove('hidden');
  dom.adminPanel().classList.add('hidden');
}

function showPanel() {
  dom.loginScreen().classList.add('hidden');
  dom.adminPanel().classList.remove('hidden');
  dom.currentUser().textContent = Auth.getCurrentUsername();

  // Ocultar pestaña de usuarios para no-superadmin
  dom.tabUsers().style.display = Auth.isSuperAdmin() ? '' : 'none';

  switchTab('documents');
}

// ===== PESTAÑAS =====
function switchTab(tab) {
  const tabs   = [dom.tabDocuments(), dom.tabUpload(), dom.tabUsers()];
  const panels = [dom.panelDocuments(), dom.panelUpload(), dom.panelUsers()];

  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.add('hidden'));

  const map = { documents: 0, upload: 1, users: 2 };
  const idx = map[tab];
  if (idx !== undefined) {
    tabs[idx].classList.add('active');
    panels[idx].classList.remove('hidden');
  }

  if (tab === 'documents') renderDocuments();
  if (tab === 'upload') updateStorageInfo();
  if (tab === 'users' && Auth.isSuperAdmin()) renderUsers();
}

// ===== CARGA DE ARCHIVOS =====
const ALLOWED_EXTENSIONS = ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','jpg','jpeg','png','zip'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function handleFileSelect(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    setStatus(dom.uploadStatus(), 'error', `❌ Formato no permitido. Tipos aceptados: ${ALLOWED_EXTENSIONS.join(', ')}.`);
    dom.filePreview().classList.add('hidden');
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    setStatus(dom.uploadStatus(), 'error', '❌ El archivo supera el límite de 5 MB.');
    dom.filePreview().classList.add('hidden');
    return;
  }

  selectedFile = file;
  dom.filePreviewName().textContent = file.name;
  dom.filePreviewSize().textContent = formatSize(file.size);
  dom.filePreview().classList.remove('hidden');
  dom.uploadStatus().classList.add('hidden');
}

function handleUpload() {
  if (!selectedFile) return;

  const btn = dom.uploadBtn();
  btn.disabled = true;
  btn.textContent = 'Subiendo...';
  setStatus(dom.uploadStatus(), 'info', '⏳ Procesando archivo...');

  const reader = new FileReader();

  reader.onload = function(e) {
    const doc = {
      id: Date.now(),
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      uploadDate: new Date().toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      uploadedBy: Auth.getCurrentUsername(),
      data: e.target.result
    };

    const result = Storage.add(doc);

    if (result.success) {
      setStatus(dom.uploadStatus(), 'success', `✅ "${selectedFile.name}" subido correctamente.`);
      resetUpload();
      updateStorageInfo();
    } else {
      setStatus(dom.uploadStatus(), 'error', `❌ ${result.message}`);
    }

    btn.disabled = false;
    btn.textContent = '📤 Subir Documento';
  };

  reader.onerror = function() {
    setStatus(dom.uploadStatus(), 'error', '❌ Error al leer el archivo. Inténtalo de nuevo.');
    btn.disabled = false;
    btn.textContent = '📤 Subir Documento';
  };

  reader.readAsDataURL(selectedFile);
}

function resetUpload() {
  selectedFile = null;
  dom.fileInput().value = '';
  dom.filePreview().classList.add('hidden');
}

function updateStorageInfo() {
  const info = Storage.getUsageInfo();
  const el = dom.storageUsage();
  el.textContent = `Almacenamiento usado: ${info.mb} MB (~${info.percentUsed}% de 5 MB disponibles)`;
  el.className = 'storage-info' + (info.percentUsed > 75 ? ' warning' : '');
}

// ===== DOCUMENTOS =====
function renderDocuments() {
  const docs = Storage.getAll();
  dom.docCount().textContent = `${docs.length} ${docs.length === 1 ? 'documento' : 'documentos'}`;

  if (docs.length === 0) {
    dom.documentList().innerHTML = '<p class="empty-message">No hay documentos cargados aún. Ve a "Subir Archivo" para comenzar.</p>';
    return;
  }

  dom.documentList().innerHTML = [...docs].reverse().map(doc => `
    <div class="document-card">
      <div class="doc-icon">${getFileIcon(doc.name)}</div>
      <div class="doc-info">
        <div class="doc-name" title="${escapeHtml(doc.name)}">${escapeHtml(doc.name)}</div>
        <div class="doc-meta">
          <span>📅 ${doc.uploadDate}</span>
          <span>💾 ${formatSize(doc.size)}</span>
          ${doc.uploadedBy ? `<span>👤 ${escapeHtml(doc.uploadedBy)}</span>` : ''}
        </div>
      </div>
      <div class="doc-actions">
        <button class="btn btn-sm btn-outline-primary" onclick="downloadDocument(${doc.id})">📥 Descargar</button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${doc.id}, '${escapeAttr(doc.name)}')">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');
}

function downloadDocument(id) {
  const doc = Storage.getAll().find(d => d.id === id);
  if (!doc) return;
  const a = document.createElement('a');
  a.href = doc.data;
  a.download = doc.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== MODAL DE ELIMINACIÓN =====
function openDeleteModal(id, name) {
  fileToDeleteId = id;
  dom.fileToDeleteName().textContent = name;
  dom.deleteModal().classList.remove('hidden');
}

function closeDeleteModal() {
  dom.deleteModal().classList.add('hidden');
  fileToDeleteId = null;
}

function confirmDelete() {
  if (fileToDeleteId === null) return;
  const doc = Storage.getAll().find(d => d.id === fileToDeleteId);
  Storage.remove(fileToDeleteId);
  closeDeleteModal();
  renderDocuments();
  updateStorageInfo();
  if (doc) showBanner('success', `✅ "${doc.name}" eliminado correctamente.`);
}

function showBanner(type, message) {
  const existing = document.querySelector('.panel-banner');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `status-message ${type} panel-banner`;
  el.textContent = message;
  dom.panelDocuments().insertBefore(el, dom.panelDocuments().firstChild);
  setTimeout(() => el.remove(), 3000);
}

// ===== GESTIÓN DE USUARIOS =====
function renderUsers() {
  const accounts = Auth.getAccounts();
  dom.usersList().innerHTML = accounts.map(acc => `
    <div class="user-item">
      <div class="user-info">
        <span class="user-name">${escapeHtml(acc.username)}</span>
        ${acc.isSuperAdmin
          ? '<span class="badge badge-super">Admin Principal</span>'
          : '<span class="badge badge-admin">Administrador</span>'}
      </div>
      ${!acc.isSuperAdmin ? `
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${escapeAttr(acc.username)}')">🗑️ Eliminar</button>
      ` : ''}
    </div>
  `).join('');
}

function handleCreateUser(e) {
  e.preventDefault();
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;

  const result = Auth.createAccount(username, password);
  setStatus(dom.userMessage(), result.success ? 'success' : 'error',
    result.success ? '✅ Administrador creado exitosamente.' : `❌ ${result.message}`
  );

  if (result.success) {
    dom.createUserForm().reset();
    renderUsers();
    setTimeout(() => dom.userMessage().classList.add('hidden'), 3000);
  }
}

function deleteUser(username) {
  if (!confirm(`¿Eliminar la cuenta de "${username}"? Esta acción no se puede deshacer.`)) return;
  const result = Auth.deleteAccount(username);
  if (result.success) {
    renderUsers();
  } else {
    alert(result.message);
  }
}

// ===== UTILIDADES =====
function setStatus(el, type, message) {
  el.textContent = message;
  el.className = `status-message ${type}`;
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    ppt: '🎯', pptx: '🎯', txt: '📃', jpg: '🖼️', jpeg: '🖼️',
    png: '🖼️', zip: '🗂️'
  };
  return icons[ext] || '📎';
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// ===== ARRANQUE =====
document.addEventListener('DOMContentLoaded', init);

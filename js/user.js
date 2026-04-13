/**
 * user.js — Vista pública de documentos (sin autenticación)
 */

function renderDocuments() {
  const docList  = document.getElementById('documentList');
  const docCount = document.getElementById('docCount');
  const docs = Storage.getAll();

  docCount.textContent = `${docs.length} ${docs.length === 1 ? 'documento' : 'documentos'}`;

  if (docs.length === 0) {
    docList.innerHTML = '<p class="empty-message">No hay documentos disponibles por el momento.</p>';
    return;
  }

  docList.innerHTML = [...docs].reverse().map(doc => `
    <div class="document-card">
      <div class="doc-icon">${getFileIcon(doc.name)}</div>
      <div class="doc-info">
        <div class="doc-name" title="${escapeHtml(doc.name)}">${escapeHtml(doc.name)}</div>
        <div class="doc-meta">
          <span>📅 ${doc.uploadDate}</span>
          <span>💾 ${formatSize(doc.size)}</span>
        </div>
      </div>
      <div class="doc-actions">
        <button class="btn btn-primary" onclick="downloadDocument(${doc.id})">📥 Descargar</button>
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

document.addEventListener('DOMContentLoaded', renderDocuments);

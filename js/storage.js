/**
 * storage.js — Gestión de documentos en localStorage
 */

const Storage = {
  KEY: 'portal_documents',

  getAll() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  _save(docs) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(docs));
      return { success: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        return { success: false, message: 'Almacenamiento lleno. Elimina algunos archivos para liberar espacio.' };
      }
      return { success: false, message: 'Error al guardar: ' + e.message };
    }
  },

  add(doc) {
    const docs = this.getAll();
    docs.push(doc);
    return this._save(docs);
  },

  remove(id) {
    const docs = this.getAll().filter(d => d.id !== id);
    return this._save(docs);
  },

  getUsageInfo() {
    const raw = localStorage.getItem(this.KEY) || '[]';
    const bytes = new Blob([raw]).size;
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    const percentUsed = Math.min(100, Math.round((bytes / (5 * 1024 * 1024)) * 100));
    return { bytes, mb, percentUsed };
  }
};

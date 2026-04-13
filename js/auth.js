/**
 * auth.js — Gestión de autenticación y sesiones de administrador
 */

const Auth = {
  ACCOUNTS_KEY: 'portal_admin_accounts',
  SESSION_KEY: 'portal_admin_session',
  SUPER_ADMIN: 'admin',

  _initAccounts() {
    const stored = localStorage.getItem(this.ACCOUNTS_KEY);
    if (!stored) {
      const defaults = [{ username: 'admin', password: 'admin123', isSuperAdmin: true }];
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(stored);
  },

  getAccounts() {
    return this._initAccounts();
  },

  validate(username, password) {
    const accounts = this.getAccounts();
    return accounts.find(a => a.username === username && a.password === password) || null;
  },

  createAccount(username, password) {
    const trimmed = username ? username.trim() : '';
    if (trimmed.length < 3) {
      return { success: false, message: 'El usuario debe tener al menos 3 caracteres.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
    }
    const accounts = this.getAccounts();
    if (accounts.find(a => a.username === trimmed)) {
      return { success: false, message: 'Este nombre de usuario ya existe.' };
    }
    accounts.push({ username: trimmed, password, isSuperAdmin: false });
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    return { success: true };
  },

  deleteAccount(username) {
    if (username === this.SUPER_ADMIN) {
      return { success: false, message: 'No se puede eliminar al administrador principal.' };
    }
    const accounts = this.getAccounts().filter(a => a.username !== username);
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    return { success: true };
  },

  getSession() {
    try {
      const s = localStorage.getItem(this.SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  },

  login(username) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ username, loginTime: Date.now() }));
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  isSuperAdmin() {
    const session = this.getSession();
    return session ? session.username === this.SUPER_ADMIN : false;
  },

  getCurrentUsername() {
    const session = this.getSession();
    return session ? session.username : null;
  }
};

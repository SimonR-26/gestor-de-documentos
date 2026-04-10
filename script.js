/* ================================
   PORTAL DE DOCUMENTOS - SCRIPT PRINCIPAL
   ================================ */

// ================================
// GESTIÓN DE AUTENTICACIÓN
// ================================

const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const logoutBtn = document.getElementById('logoutBtn');
const toggleRegister = document.getElementById('toggleRegister');
const toggleLogin = document.getElementById('toggleLogin');
const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');

// Credenciales por defecto
const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: '1234'
};

/**
 * Obtiene todas las cuentas registradas
 * @returns {Array} Array con todas las cuentas
 */
function getAllAccounts() {
    const stored = localStorage.getItem('accounts');
    const accounts = stored ? JSON.parse(stored) : [];
    
    // Agregar cuenta de prueba si no existe
    if (accounts.length === 0) {
        accounts.push(DEFAULT_CREDENTIALS);
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
    
    return accounts;
}

/**
 * Verifica si un usuario ya existe
 * @param {string} username - Nombre de usuario a verificar
 * @returns {boolean} True si existe
 */
function userExists(username) {
    const accounts = getAllAccounts();
    return accounts.some(acc => acc.username === username);
}

/**
 * Registra una nueva cuenta
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object} Objeto con resultado {success: boolean, message: string}
 */
function registerNewAccount(username, password) {
    // Validar que el usuario no esté vacío
    if (!username || username.trim().length < 3) {
        return { success: false, message: '❌ El usuario debe tener al menos 3 caracteres' };
    }
    
    // Validar que la contraseña no esté vacía
    if (!password || password.length < 4) {
        return { success: false, message: '❌ La contraseña debe tener al menos 4 caracteres' };
    }
    
    // Verificar que el usuario no exista
    if (userExists(username)) {
        return { success: false, message: '❌ Este usuario ya existe. Elige otro nombre' };
    }
    
    // Crear nueva cuenta
    const accounts = getAllAccounts();
    accounts.push({ username, password });
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    return { success: true, message: '✅ Cuenta creada exitosamente. Inicia sesión ahora' };
}

/**
 * Verifica las credenciales de login
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {boolean} True si son válidas
 */
function validateCredentials(username, password) {
    const accounts = getAllAccounts();
    return accounts.some(acc => acc.username === username && acc.password === password);
}

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} True si hay sesión activa
 */
function isLoggedIn() {
    return localStorage.getItem('userSession') === 'active';
}

/**
 * Establece la sesión como activa
 */
function setLoggedIn() {
    localStorage.setItem('userSession', 'active');
    loginScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
}

/**
 * Cierra la sesión
 */
function logout() {
    localStorage.removeItem('userSession');
    loginScreen.classList.remove('hidden');
    mainContent.classList.add('hidden');
    
    // Limpiar formularios
    loginForm.reset();
    registerForm.reset();
    
    // Mostrar formulario de login
    loginFormContainer.classList.remove('hidden');
    registerFormContainer.classList.add('hidden');
    
    loginMessage.classList.add('hidden');
    registerMessage.classList.add('hidden');
}

/**
 * Alterna entre formulario de login y registro
 */
function toggleForms() {
    loginFormContainer.classList.toggle('hidden');
    registerFormContainer.classList.toggle('hidden');
    loginMessage.classList.add('hidden');
    registerMessage.classList.add('hidden');
}

/**
 * Maneja el envío del formulario de login
 */
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validar credenciales
    if (validateCredentials(username, password)) {
        showLoginMessage('success', '✅ ¡Bienvenido! Ingresando...');
        
        // Simular pequeño delay para mejor UX
        setTimeout(() => {
            setLoggedIn();
        }, 500);
    } else {
        showLoginMessage('error', '❌ Usuario o contraseña incorrectos');
        document.getElementById('password').value = '';
    }
}

/**
 * Maneja el envío del formulario de registro
 */
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    
    // Validar que las contraseñas coincidan
    if (password !== password2) {
        showRegisterMessage('error', '❌ Las contraseñas no coinciden');
        return;
    }
    
    // Registrar la cuenta
    const result = registerNewAccount(username, password);
    
    if (result.success) {
        showRegisterMessage('success', result.message);
        
        // Limpiar formulario y volver al login después de 2 segundos
        setTimeout(() => {
            registerForm.reset();
            toggleForms();
            document.getElementById('username').focus();
        }, 2000);
    } else {
        showRegisterMessage('error', result.message);
    }
}

/**
 * Muestra un mensaje en la pantalla de login
 * @param {string} type - Tipo de mensaje: 'success' o 'error'
 * @param {string} message - Mensaje a mostrar
 */
function showLoginMessage(type, message) {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
}

/**
 * Muestra un mensaje en la pantalla de registro
 * @param {string} type - Tipo de mensaje: 'success' o 'error'
 * @param {string} message - Mensaje a mostrar
 */
function showRegisterMessage(type, message) {
    registerMessage.textContent = message;
    registerMessage.className = `login-message ${type}`;
}

// Event listeners del login y registro
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
toggleRegister.addEventListener('click', toggleForms);
toggleLogin.addEventListener('click', toggleForms);
logoutBtn.addEventListener('click', logout);

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar cuentas (crear la de prueba si no existe)
    getAllAccounts();
    
    if (isLoggedIn()) {
        loginScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
    } else {
        loginScreen.classList.remove('hidden');
        mainContent.classList.add('hidden');
    }
    console.log('✅ Sistema de autenticación inicializado');
});

// Cerrar modal al hacer click fuera del contenido
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// ================================
// ELEMENTOS DEL DOM
// ================================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const statusMessage = document.getElementById('statusMessage');
const uploadBtn = document.getElementById('uploadBtn');
const cancelBtn = document.getElementById('cancelBtn');
const documentList = document.getElementById('documentList');
const docCount = document.getElementById('docCount');
const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');
const fileToDelete = document.getElementById('fileToDelete');

// Variables de estado
let selectedFile = null;
let fileToDeleteId = null;

// ================================
// GESTIÓN DE CARGA DE ARCHIVOS
// ================================

// Evento: Click en el área de carga
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Evento: Cambio en el input de archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

// Evento: Drag over (archivo sobre el área)
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

// Evento: Drag leave (archivo sale del área)
uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

// Evento: Drop (archivo soltado en el área)
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
    }
});

/**
 * Maneja la selección de un archivo
 * @param {File} file - El archivo seleccionado
 */
function handleFileSelection(file) {
    // Validar tipo de archivo
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'zip'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        showStatus('error', '❌ Tipo de archivo no permitido. Los formatos aceptados son: PDF, Word, Excel, PowerPoint, TXT, JPG, PNG, ZIP');
        return;
    }
    
    // Validar tamaño (máximo 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
        showStatus('error', '❌ El archivo es demasiado grande. Tamaño máximo: 10 MB');
        return;
    }
    
    selectedFile = file;
    fileName.textContent = file.name;
    fileInfo.classList.remove('hidden');
    statusMessage.classList.add('hidden');
}

// Evento: Click en "Subir Documento"
uploadBtn.addEventListener('click', () => {
    if (selectedFile) {
        uploadDocument(selectedFile);
    }
});

// Evento: Click en "Cancelar"
cancelBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    statusMessage.classList.add('hidden');
});

/**
 * Sube un documento al almacenamiento local
 * @param {File} file - El archivo a subir
 */
function uploadDocument(file) {
    try {
        // Leer el archivo como Data URL
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Crear objeto de documento
            const document = {
                id: Date.now(), // ID único basado en el timestamp
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toLocaleString('es-ES'),
                data: e.target.result // Base64 encoded file
            };
            
            // Obtener documentos existentes
            let documents = getDocumentsFromStorage();
            
            // Agregar nuevo documento
            documents.push(document);
            
            // Guardar en localStorage
            localStorage.setItem('documents', JSON.stringify(documents));
            
            // Mostrar mensaje de éxito
            showStatus('success', `✅ "${file.name}" subido exitosamente`);
            
            // Resetear el formulario
            selectedFile = null;
            fileInput.value = '';
            fileInfo.classList.add('hidden');
            
            // Actualizar la lista de documentos
            renderDocuments();
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 3000);
        };
        
        reader.onerror = function() {
            showStatus('error', '❌ Error al leer el archivo');
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        showStatus('error', '❌ Error al subir el archivo: ' + error.message);
    }
}

// ================================
// GESTIÓN DEL HISTORIAL
// ================================

/**
 * Obtiene los documentos del almacenamiento local
 * @returns {Array} Array de documentos
 */
function getDocumentsFromStorage() {
    const stored = localStorage.getItem('documents');
    return stored ? JSON.parse(stored) : [];
}

/**
 * Renderiza la lista de documentos
 */
function renderDocuments() {
    const documents = getDocumentsFromStorage();
    
    // Actualizar contador
    docCount.textContent = `${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}`;
    
    // Si no hay documentos, mostrar mensaje vacío
    if (documents.length === 0) {
        documentList.innerHTML = '<p class="empty-message">No hay documentos cargados aún. ¡Sube tu primer documento!</p>';
        return;
    }
    
    // Renderizar cada documento (orden inverso para mostrar los más recientes primero)
    documentList.innerHTML = documents.reverse().map(doc => `
        <div class="document-item">
            <div class="doc-icon">${getFileIcon(doc.name)}</div>
            <div class="doc-name" title="${doc.name}">${doc.name}</div>
            <div class="doc-meta">
                <div class="doc-meta-item">
                    <span>📅</span>
                    <span>${doc.uploadDate}</span>
                </div>
                <div class="doc-meta-item">
                    <span>💾</span>
                    <span>${formatFileSize(doc.size)}</span>
                </div>
            </div>
            <div class="doc-buttons">
                <button class="btn btn-primary btn-sm" onclick="downloadDocument(${doc.id})">📥 Descargar</button>
                <button class="btn btn-danger btn-sm delete-btn" onclick="openDeleteModal(${doc.id}, '${escapeSingleQuote(doc.name)}')">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

/**
 * Obtiene el icono del archivo según su extensión
 * @param {string} filename - Nombre del archivo
 * @returns {string} Icono emoji
 */
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const icons = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        xls: '📊',
        xlsx: '📊',
        ppt: '🎯',
        pptx: '🎯',
        txt: '📃',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        zip: '🗂️'
    };
    
    return icons[extension] || '📎';
}

/**
 * Formatea el tamaño del archivo a un formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Descarga un documento
 * @param {number} id - ID del documento a descargar
 */
function downloadDocument(id) {
    const documents = getDocumentsFromStorage();
    const fileData = documents.find(doc => doc.id === id);
    
    if (fileData) {
        // Crear un elemento 'a' temporal para descargar
        const link = document.createElement('a');
        link.href = fileData.data;
        link.download = fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar mensaje de confirmación
        showStatus('info', `📥 Descargando: ${fileData.name}`);
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 2000);
    }
}

// ================================
// ELIMINACIÓN DE DOCUMENTOS
// ================================

/**
 * Abre el modal de confirmación de eliminación
 * @param {number} id - ID del documento a eliminar
 * @param {string} name - Nombre del archivo
 */
function openDeleteModal(id, name) {
    fileToDeleteId = id;
    fileToDelete.textContent = name;
    deleteModal.classList.remove('hidden');
}

/**
 * Cierra el modal de confirmación
 */
function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    fileToDeleteId = null;
}

// Evento: Confirmar eliminación
confirmDelete.addEventListener('click', () => {
    if (fileToDeleteId !== null) {
        let documents = getDocumentsFromStorage();
        const fileName = documents.find(doc => doc.id === fileToDeleteId)?.name;
        
        // Filtrar el documento
        documents = documents.filter(doc => doc.id !== fileToDeleteId);
        
        // Guardar cambios
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Actualizar vista
        renderDocuments();
        closeDeleteModal();
        
        // Mostrar confirmación
        showStatus('success', `✅ "${fileName}" eliminado correctamente`);
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 3000);
    }
});

// Evento: Cancelar eliminación
cancelDelete.addEventListener('click', closeDeleteModal);

// ================================
// FUNCIONES AUXILIARES
// ================================

/**
 * Muestra un mensaje de estado
 * @param {string} type - Tipo de mensaje: 'success', 'error', 'info'
 * @param {string} message - Mensaje a mostrar
 */
function showStatus(type, message) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

/**
 * Escapa comillas simples en strings (para evitar problemas con HTML)
 * @param {string} str - String a escapar
 * @returns {string} String escapado
 */
function escapeSingleQuote(str) {
    return str.replace(/'/g, "\\'");
}

// ================================
// INICIALIZACIÓN
// ================================

// Renderizar documentos y configurar interfaz al cargar la página
if (isLoggedIn()) {
    renderDocuments();
}

// Cerrar modal al hacer click fuera del contenido
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

# 🔍 Referencia Técnica - Portal de Documentos

## Flujo de Funcionamiento

### Autenticación
```
Usuario accede a index.html
    ↓
¿Hay sesión guardada?
    ├─ Sí → Mostrar portal
    └─ No → Mostrar login
    
Usuario ingresa credenciales
    ↓
¿Credenciales válidas?
    ├─ Sí → Crear sesión y mostrar portal
    └─ No → Mostrar error
```

### Registro de Nueva Cuenta
```
Usuario hace click en "Crear cuenta"
    ↓
Ingresa datos de registro
    ↓
Validar:
  - Usuario no existe
  - Usuario tiene 3+ caracteres
  - Contraseña tiene 4+ caracteres
  - Las contraseñas coinciden
    ↓
¿Validación correcta?
    ├─ Sí → Guardar cuenta, mostrar éxito
    └─ No → Mostrar error
```

### Carga de Archivo
```
Usuario carga archivo
    ↓
Validación (tipo + tamaño)
    ↓
Lectura con FileReader (Base64)
    ↓
Crear objeto documento con metadata
    ↓
Guardar en localStorage (JSON)
    ↓
Renderizar lista actualizada
    ↓
Mostrar confirmación al usuario
```

## Estructura de Datos - Documentos

Cada documento se almacena como un objeto JSON:

```javascript
{
    id: 1712755200000,              // Timestamp único
    name: "Reporte_2024.pdf",       // Nombre original del archivo
    size: 2048576,                  // Tamaño en bytes
    type: "application/pdf",        // MIME type
    uploadDate: "10/4/2026, 14:30:45", // Formato localizado
    data: "data:application/pdf;base64,JVBERi..." // Contenido codificado
}
```

## Estructura de Datos - Cuentas de Usuario

Cada cuenta se almacena como un objeto JSON:

```javascript
{
    username: "admin",              // Nombre de usuario único
    password: "1234"                // Contraseña (en plaintext localizado)
}
```

**⚠️ Nota de Seguridad**: En esta versión demo, las contraseñas se guardan en plaintext. En producción, deberían estar encriptadas con bcrypt.

## localStorage - Estructura

### documents
```javascript
// En localStorage["documents"]:
[
    { id: ..., name: ..., size: ..., ... },
    { id: ..., name: ..., size: ..., ... },
    ...
]
```

### accounts
```javascript
// En localStorage["accounts"]:
[
    { username: "admin", password: "1234" },
    { username: "usuario1", password: "pass123" },
    ...
]
```

### userSession
```javascript
// En localStorage["userSession"]:
"active" // Indica que hay una sesión activa
```

**Importante**: El máximo de localStorage es típicamente 5-10 MB, incluyendo el contenido codificado en Base64.

## Event Listeners Registrados

| Evento | Elemento | Función |
|--------|----------|---------|
| `submit` | loginForm | Procesar login |
| `submit` | registerForm | Procesar registro |
| `click` | toggleRegister | Mostrar formulario de registro |
| `click` | toggleLogin | Mostrar formulario de login |
| `click` | logoutBtn | Cerrar sesión |
| `click` | uploadArea | Abrir input file |
| `change` | fileInput | Procesar archivo seleccionado |
| `dragover` | uploadArea | Agregar clase "drag-over" |
| `dragleave` | uploadArea | Remover clase "drag-over" |
| `drop` | uploadArea | Procesar archivo soltado |
| `click` | uploadBtn | Iniciar carga del archivo |
| `click` | cancelBtn | Cancelar selección |
| `click` | confirmDelete | Confirmar eliminación |
| `click` | cancelDelete | Cancelar eliminación |
| `click` | deleteModal | Cerrar modal si se hace click fuera |
| `DOMContentLoaded` | document | Inicializar aplicación |

## Funciones de Validación

### Tipos de Archivo Permitidos
```javascript
const allowedExtensions = [
    'pdf', 'doc', 'docx',              // Documentos
    'xls', 'xlsx',                     // Hojas de cálculo
    'ppt', 'pptx',                     // Presentaciones
    'txt',                             // Texto plano
    'jpg', 'jpeg', 'png',              // Imágenes
    'zip'                              // Archivos comprimidos
];
```

### Validación de Tamaño
```javascript
const maxSize = 10 * 1024 * 1024;  // 10 MB en bytes
if (file.size > maxSize) {
    showStatus('error', 'Archivo demasiado grande');
}
```

## Funciones Principales Explicadas

### 1. getAllAccounts()
Obtiene todas las cuentas registradas:
- Lee datos de localStorage["accounts"]
- Si no hay cuentas, añade la de prueba (admin/1234)
- Retorna array con todas las cuentas

### 2. userExists(username)
Verifica si un usuario ya está registrado:
- Obtiene todas las cuentas
- Busca si existe una cuenta con ese nombre
- Retorna true/false

### 3. registerNewAccount(username, password)
Crea una nueva cuenta:
- Valida que el usuario tenga 3+ caracteres
- Valida que la contraseña tenga 4+ caracteres
- Verifica que el usuario no exista
- Si pasa todas las validaciones, guarda la cuenta
- Retorna objeto {success: boolean, message: string}

### 4. validateCredentials(username, password)
Verifica credenciales de login:
- Obtiene todas las cuentas
- Busca una cuenta que coincida con usuario y contraseña
- Retorna true si las credenciales son válidas

### 5. isLoggedIn()
Comprueba si hay sesión activa:
- Verifica localStorage["userSession"]
- Retorna true si hay una sesión activa

### 6. setLoggedIn()
Establece una sesión activa:
- Guarda en localStorage["userSession"] el valor "active"
- Oculta pantalla de login
- Muestra contenido principal

### 7. logout()
Cierra la sesión actual:
- Elimina la sesión de localStorage
- Muestra pantalla de login
- Limpia los formularios
- Reinicia el estado de visibilidad

### 8. toggleForms()
Alterna entre pantalla de login y registro:
- Oculta/muestra el contenido de login
- Oculta/muestra el contenido de registro
- Limpia mensajes anteriores

### 9. handleLogin(e)
Maneja el envío del formulario de login:
- Obtiene usuario y contraseña
- Valida credenciales
- Si son válidas, establece sesión
- Si no, muestra error

### 10. handleRegister(e)
Maneja el envío del formulario de registro:
- Obtiene datos del formulario
- Valida que las contraseñas coincidan
- Llama a registerNewAccount()
- Muestra éxito o error según resultado

### 11. handleFileSelection(file)
Valida el archivo seleccionado:
- Verifica extensión contra lista blanca
- Verifica tamaño máximo (10 MB)
- Actualiza UI para mostrar archivo seleccionado

### 12. uploadDocument(file)
Sube el archivo a almacenamiento:
- Lee archivo con FileReader API
- Convierte a Base64
- Crea objeto documento con metadata
- Obtiene documentos existentes
- Agrega nuevo documento
- Guarda en localStorage
- Actualiza la vista

### 13. renderDocuments()
Renderiza la lista de documentos:
- Obtiene documentos de localStorage
- Actualiza contador
- Genera HTML para cada documento
- Invierte orden (más recientes primero)
- Genera botones para descargar/eliminar

### 14. downloadDocument(id)
Descarga un documento:
- Busca documento por ID
- Crea elemento `<a>` temporal
- Establece `href` con Data URL
- Simula click para descargar
- Elimina elemento temporal

### 15. openDeleteModal(id, name)
Abre modal de confirmación:
- Almacena ID en variable global
- Muestra nombre del archivo
- Muestra modal

### 16. formatFileSize(bytes)
Convierte bytes a formato legible:
- Calcula unidad apropiada (B, KB, MB, GB)
- Redondea a 2 decimales
- Retorna string formateado

### 17. getFileIcon(filename)
Retorna emoji según tipo de archivo:
```javascript
const icons = {
    pdf: '📄',    // Documentos
    doc: '📝',
    docx: '📝',
    xls: '📊',    // Hojas de cálculo
    xlsx: '📊',
    ppt: '🎯',    // Presentaciones
    pptx: '🎯',
    txt: '📃',    // Texto
    jpg: '🖼️',    // Imágenes
    jpeg: '🖼️',
    png: '🖼️',
    zip: '🗂️'     // Archivos
};
```

## Base64 - Almacenamiento de Archivos

La aplicación convierte archivos binarios a Base64 para almacenarlos en localStorage:

```javascript
reader.readAsDataURL(file);
// Resultado: "data:application/pdf;base64,JVBERi0xLjQKJeLj..."
```

**Ventaja**: Es texto, se puede almacenar fácilmente en JSON y localStorage.
**Desventaja**: Aumenta el tamaño en ~33% (Base64 es menos eficiente que binario).

## Mensajes de Estado

La función `showStatus(type, message)` maneja tres tipos:

```javascript
showStatus('success', '✅ Archivo subido');  // Verde
showStatus('error', '❌ Formato no válido');  // Rojo
showStatus('info', '📥 Descargando...');     // Azul
```

## Manejo de Errores

### Try-Catch en uploadDocument()
```javascript
try {
    reader.onload = function(e) { ... }
    reader.onerror = function() { 
        showStatus('error', 'Error al leer archivo');
    }
} catch (error) {
    showStatus('error', 'Error: ' + error.message);
}
```

## Animaciones CSS

### fadeIn
- Entrada suave de documentos con opacidad y traslación

### slideDown  
- Deslizamiento hacia abajo de elementos
- Usado en file-info y status-message

### drag-over
- Escala leve y cambio de color al arrastrar archivo

### hover
- Elevación y sombra en documentos
- Cambio de borde en upload-area

## Responsive Design - Breakpoints

| Tamaño | Breakpoint | Cambios |
|--------|-----------|---------|
| Desktop | > 768px | Grilla de 3 columnas |
| Tablet | 480px - 768px | Grilla de 1 columna |
| Mobile | < 480px | Tamaño fuente reducido |

## Debugging - Tips

### Ver todas las cuentas registradas
```javascript
console.log(JSON.parse(localStorage.getItem('accounts')));
```

### Agregar una cuenta manualmente
```javascript
const accounts = JSON.parse(localStorage.getItem('accounts'));
accounts.push({ username: "test", password: "test" });
localStorage.setItem('accounts', JSON.stringify(accounts));
```

### Ver si hay sesión activa
```javascript
console.log(localStorage.getItem('userSession'));
```

### Forzar cierre de sesión
```javascript
localStorage.removeItem('userSession');
location.reload();
```

### Ver datos en localStorage
```javascript
console.log(JSON.parse(localStorage.getItem('documents')));
```

### Limpiar todos los documentos
```javascript
localStorage.removeItem('documents');
location.reload();
```

### Eliminar todas las cuentas (vuelve a crear la de prueba)
```javascript
localStorage.removeItem('accounts');
location.reload();
```

### Ver estado completo de storage
```javascript
console.log('Cuentas:', JSON.parse(localStorage.getItem('accounts')));
console.log('Documentos:', JSON.parse(localStorage.getItem('documents')));
console.log('Sesión:', localStorage.getItem('userSession'));
```

## Mejoras Implementadas

### Autenticación y Seguridad
✅ Sistema de login completo
✅ Registro de nuevas cuentas
✅ Validación de credenciales
✅ Cierre de sesión
✅ Control de acceso a aplicación
✅ Almacenamiento de cuentas en localStorage

### Funcionalidad de Documentos
✅ Carga de archivos con drag & drop
✅ Validación completa de archivos
✅ Descarga de documentos (con bug corregido)
✅ Modal para confirmación de eliminación
✅ Mensajes de estado para todas las acciones
✅ Contador de documentos

### Interfaz y Diseño
✅ Pantalla de login elegante
✅ Formulario de registro intuitivo
✅ Transiciones suave entre pantallas
✅ Diseño responsive funcional
✅ Iconos intuitivos por tipo de archivo
✅ Orden cronológico inverso (más recientes primero)
✅ Feedback visual para todas las acciones
✅ Manejo de errores robusto

## Limitaciones y Consideraciones

### Seguridad
1. **Contraseñas en plaintext**: Las contraseñas se guardan sin encriptación (no seguro para producción)
2. **localStorage**: Cualquiera con acceso al navegador puede ver las cuentas
3. **No hay HTTPS**: Sin un servidor seguro, las contraseñas se envían sin encriptación

### Almacenamiento
1. **localStorage**: Limitado a ~5-10 MB por dominio
2. **Sincronización**: No se sincroniza entre pestañas automáticamente
3. **Persistencia**: Se borra si se limpia caché
4. **Privacidad**: Los datos están en el navegador del usuario

### Escalabilidad
1. **Sin backend**: No apto para aplicaciones de escala grande
2. **Monousuario**: Solo funciona dentro de un navegador
3. **Sin base de datos**: No hay respaldo central

## Próximos Pasos (Mejoras Futuras)

Para escalar esta aplicación:

1. **Backend**: Implementar con Node.js + Express
2. **Base de datos**: PostgreSQL o MongoDB
3. **Encriptación**: Hash de contraseñas con bcrypt
4. **HTTPS**: Conexión segura cifrada
5. **Recuperación de contraseña**: Email o preguntas de seguridad
6. **Búsqueda y filtrado**: Por nombre, fecha, tipo
7. **Categorías y carpetas**: Organizar documentos
8. **Compartir**: Con otros usuarios con permisos
9. **Versionado**: Control de versiones de documentos
10. **Notificaciones**: Por email o push notifications
11. **Panel de admin**: Gestionar usuarios y documentos
12. **Exportar**: Crear backups en CSV o ZIP

---

**Nota**: Este documento es una referencia técnica. Para instrucciones de uso, ver README.md

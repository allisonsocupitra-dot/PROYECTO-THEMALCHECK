export type Idioma = 'es' | 'en';

type Entrada = { es: string; en: string };

export const traducciones: Record<string, Entrada> = {
  // Barra lateral
  'nav.explorador': { es: 'Explorador de imágenes', en: 'Image explorer' },
  'nav.visor': { es: 'Visor', en: 'Viewer' },
  'nav.reportes': { es: 'Reportes de técnicos', en: "Technicians' reports" },
  'nav.ajustes': { es: 'Ajustes', en: 'Settings' },
  'nav.salir': { es: 'Cerrar sesión', en: 'Log out' },

  // Login
  'login.titulo': { es: 'Iniciar Sesión', en: 'Sign In' },
  'login.subtitulo': { es: 'Análisis de imágenes termográficas', en: 'Thermographic image analysis' },
  'login.correo.placeholder': { es: 'Ingrese el correo electrónico', en: 'Enter your email' },
  'login.contrasena.placeholder': { es: 'Ingrese la contraseña', en: 'Enter your password' },
  'login.boton': { es: 'Iniciar sesión', en: 'Sign in' },
  'login.sinCuenta': { es: '¿No tienes una cuenta?', en: "Don't have an account?" },
  'login.registrate': { es: 'Regístrate', en: 'Sign up' },
  'login.errorCredenciales': { es: 'Correo o contraseña incorrectos', en: 'Incorrect email or password' },
  'login.errorRol': { es: 'Esta cuenta está registrada como', en: 'This account is registered as' },
  'login.olvideContrasena': { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },

  // Recuperación de contraseña
  'recuperar.titulo': { es: 'Recuperar contraseña', en: 'Recover password' },
  'recuperar.descripcion': {
    es: 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.',
    en: "Enter your email and we'll send you a link to reset your password.",
  },
  'recuperar.boton': { es: 'Enviar enlace', en: 'Send link' },
  'recuperar.enviadoTitulo': { es: 'Revisa tu correo', en: 'Check your email' },
  'recuperar.enviadoMensaje': {
    es: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
    en: 'If the email is registered, we sent you a link to reset your password.',
  },
  'recuperar.volverLogin': { es: 'Volver a iniciar sesión', en: 'Back to sign in' },
  'recuperar.restablecerTitulo': { es: 'Nueva contraseña', en: 'New password' },
  'recuperar.restablecerBoton': { es: 'Restablecer contraseña', en: 'Reset password' },
  'recuperar.tokenInvalido': {
    es: 'El enlace no es válido o ya expiró. Solicita uno nuevo.',
    en: 'The link is invalid or has expired. Request a new one.',
  },
  'recuperar.exitoTitulo': { es: '¡Contraseña actualizada!', en: 'Password updated!' },
  'recuperar.exitoMensaje': {
    es: 'Ya puedes iniciar sesión con tu nueva contraseña.',
    en: 'You can now sign in with your new password.',
  },

  // Landing
  'landing.etiqueta': { es: 'Inteligencia térmica para decisiones claras', en: 'Thermal intelligence for clear decisions' },
  'landing.descripcion': {
    es: 'Servicio especializado de análisis de imágenes termográficas para detectar lo que el ojo no puede ver.',
    en: 'Specialized thermographic image analysis to detect what the eye cannot see.',
  },
  'landing.comenzar': { es: 'Comenzar', en: 'Get started' },
  'landing.iniciar': { es: 'Iniciar sesión', en: 'Sign in' },
  'landing.pie': { es: 'Análisis termográfico preciso', en: 'Precise thermographic analysis' },
  'landing.estado': { es: 'Sistema operativo', en: 'System online' },

  // Registro
  'register.rol.tecnico': { es: 'Técnico', en: 'Technician' },
  'register.rol.tecnico.desc': {
    es: 'Carga y analiza tus propias imágenes termográficas.',
    en: 'Upload and analyze your own thermal images.',
  },
  'register.rol.admin': { es: 'Administrador', en: 'Administrator' },
  'register.rol.admin.desc': {
    es: 'Administra técnicos y revisa sus reportes.',
    en: 'Manage technicians and review their reports.',
  },
  'register.titulo': { es: 'Registro', en: 'Register' },
  'register.nombre.placeholder': { es: 'Nombre', en: 'First name' },
  'register.apellido.placeholder': { es: 'Apellido', en: 'Last name' },
  'register.correo.placeholder': { es: 'Ingrese el correo electrónico', en: 'Enter your email' },
  'register.contrasena.placeholder': { es: 'Crear contraseña', en: 'Create password' },
  'register.confirmar.placeholder': { es: 'Confirmar contraseña', en: 'Confirm password' },
  'register.boton': { es: 'Registrarse', en: 'Register' },
  'register.yaTienes': { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
  'register.inicia': { es: 'Inicia sesión', en: 'Sign in' },
  'register.errorPasswords': { es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
  'register.errorExiste': {
    es: 'Ya existe una cuenta con ese correo',
    en: 'An account with that email already exists',
  },
  'register.errorGenerico': { es: 'No se pudo completar el registro', en: 'The registration could not be completed' },

  // Explorador — carpetas
  'carpetas.nueva': { es: 'Nueva carpeta', en: 'New folder' },
  'carpetas.subirCarpeta': { es: 'Subir carpeta', en: 'Upload folder' },
  'carpetas.nombrePorDefecto': { es: 'Carpeta cargada', en: 'Uploaded folder' },
  'carpetas.nombrePlaceholder': { es: 'Nombre de la carpeta', en: 'Folder name' },
  'carpetas.crear': { es: 'Crear', en: 'Create' },
  'carpetas.cancelar': { es: 'Cancelar', en: 'Cancel' },
  'carpetas.items': { es: 'elementos', en: 'items' },

  // Explorador (dashboard)
  'dashboard.exportar': { es: 'Exportar reporte', en: 'Export report' },
  'dashboard.edicion': { es: 'Edición por lotes', en: 'Batch editing' },
  'dashboard.seleccionarTodo': { es: 'Seleccionar todo', en: 'Select all' },
  'dashboard.deseleccionarTodo': { es: 'Deseleccionar todo', en: 'Deselect all' },

  // Carpetas — eliminar
  'carpetas.eliminarSeleccion': { es: 'Eliminar', en: 'Delete' },
  'carpetas.eliminarImagen': { es: 'Eliminar imagen', en: 'Delete image' },
  'carpetas.eliminarCarpeta': { es: 'Eliminar carpeta', en: 'Delete folder' },
  'carpetas.confirmarEliminarImagen': { es: '¿Eliminar esta imagen?', en: 'Delete this image?' },
  'carpetas.confirmarEliminarImagenes': {
    es: '¿Eliminar las imágenes seleccionadas?',
    en: 'Delete the selected images?',
  },
  'carpetas.confirmarEliminarCarpeta': {
    es: '¿Eliminar esta carpeta y todo su contenido?',
    en: 'Delete this folder and everything inside it?',
  },
  'carpetas.miscarpetas': { es: 'Mis carpetas', en: 'My Folders' },
  'carpetas.subcarpetas': { es: 'subcarpetas', en: 'subfolders' },
  'carpetas.seleccionarImagen': { es: 'Ver información', en: 'View info' },
  'carpetas.abrirEnVisor': { es: 'Abrir en el visor', en: 'Open in viewer' },
  'carpetas.panel.sinSeleccion': {
    es: 'Selecciona una imagen para ver su información aquí',
    en: 'Select an image to see its info here',
  },

  // Mis reportes
  'nav.misReportes': { es: 'Mis reportes', en: 'My reports' },
  'reportes.titulo': { es: 'Mis reportes', en: 'My reports' },
  'reportes.vacio': { es: 'Aún no has generado ningún reporte.', en: "You haven't generated any reports yet." },
  'reportes.carpeta': { es: 'Carpeta', en: 'Folder' },
  'reportes.formato': { es: 'Formato', en: 'Format' },

  // Carga de imágenes
  'uploader.arrastra': { es: 'Arrastra tus imágenes termográficas aquí', en: 'Drag your thermal images here' },
  'uploader.click': {
    es: 'o haz clic para seleccionar archivos (JPG, PNG, TIFF)',
    en: 'or click to select files (JPG, PNG, TIFF)',
  },

  // Visor
  'visor.vacio': {
    es: 'Aún no has cargado imágenes. Ve al explorador para subir las primeras.',
    en: "You haven't uploaded any images yet. Go to the explorer to upload your first ones.",
  },
  'visor.sinSeleccion': { es: 'Selecciona una imagen para verla en detalle', en: 'Select an image to view it in detail' },
  'visor.exportarPdf': { es: 'Exportar reporte (PDF)', en: 'Export report (PDF)' },
  'visor.exportarDoc': { es: 'Exportar reporte (DOC)', en: 'Export report (DOC)' },
  'visor.exportarImagen': { es: 'Exportar imagen', en: 'Export image' },
  'visor.pendienteBackend': {
    es: 'Esta función se habilitará cuando el backend genere el reporte',
    en: 'This will be enabled once the backend generates the report',
  },
  'visor.tempMax': { es: 'Máx.', en: 'Max' },
  'visor.tempMin': { es: 'Mín.', en: 'Min' },
  'visor.herramienta.seleccionar': { es: 'Seleccionar', en: 'Select' },
  'visor.herramienta.punto': { es: 'Punto termográfico', en: 'Thermal point' },
  'visor.herramienta.rectangulo': { es: 'Rectángulo', en: 'Rectangle' },
  'visor.herramienta.circulo': { es: 'Círculo', en: 'Circle' },
  'visor.herramienta.color': { es: 'Color de las formas', en: 'Shape color' },
  'visor.herramienta.borrarTodo': { es: 'Borrar todas las marcas', en: 'Clear all marks' },
  'visor.reporteRegistrado': {
    es: 'Se agregó a "Mis reportes". La generación real del archivo llegará con el backend.',
    en: 'Added to "My reports". Actual file generation will come with the backend.',
  },
  'visor.editar': { es: 'Editar', en: 'Edit' },
  'visor.exportar': { es: 'Exportar', en: 'Export' },
  'visor.limpiarTodo': { es: 'Borrar todas las mediciones', en: 'Clear All Measurements' },

  // Panel del visor — tabla de parámetros de captura (valores reales pendientes de backend)
  'visor.parametros.titulo': { es: 'Parámetros', en: 'Parameters' },
  'visor.parametros.distancia': { es: 'Distancia', en: 'Distance' },
  'visor.parametros.humedad': { es: 'Humedad', en: 'Humidity' },
  'visor.parametros.emisividad': { es: 'Emisividad', en: 'Emissivity' },
  'visor.parametros.tempReflejada': { es: 'Temp. reflejada', en: 'Reflected Temp' },

  // Panel del visor — tabla de información de la imagen (valores reales pendientes de backend)
  'visor.propiedades.titulo': { es: 'Información de la imagen', en: 'Image Info' },
  'visor.propiedades.modelo': { es: 'Modelo', en: 'Model' },
  'visor.propiedades.numeroSerie': { es: 'Número de serie', en: 'Serial Number' },
  'visor.propiedades.distanciaFocal': { es: 'Distancia focal', en: 'Focal Length' },
  'visor.propiedades.apertura': { es: 'Apertura', en: 'F-Number' },
  'visor.propiedades.ancho': { es: 'Ancho', en: 'Width' },
  'visor.propiedades.alto': { es: 'Alto', en: 'Height' },
  'visor.propiedades.creado': { es: 'Creado', en: 'Created' },
  'visor.propiedades.modificado': { es: 'Modificado', en: 'Modified' },
  'visor.propiedades.coordenadas': { es: 'Coordenadas', en: 'Coordinates' },

  // Panel del visor — tabla editable de observaciones (Remarks)
  'visor.notas.titulo': { es: 'Observaciones', en: 'Remarks' },
  'visor.notas.clave': { es: 'Clave', en: 'Key' },
  'visor.notas.valor': { es: 'Valor', en: 'Value' },
  'visor.notas.agregar': { es: 'Agregar fila', en: 'Add row' },
  'visor.notas.vacio': { es: 'Sin observaciones todavía', en: 'No remarks yet' },

  // Modal de ajustes
  'ajustes.idioma.titulo': { es: 'Idioma', en: 'Language' },
  'ajustes.idioma.descripcion': {
    es: 'Elige el idioma en el que quieres ver la plataforma.',
    en: 'Choose the language you want to see the platform in.',
  },
  'ajustes.cerrar': { es: 'Cerrar', en: 'Close' },

  // Modal de confirmación (éxito en login / registro)
  'confirmacion.continuar': { es: 'Continuar', en: 'Continue' },
  'confirmacion.loginTitulo': { es: '¡Bienvenido de nuevo!', en: 'Welcome back!' },
  'confirmacion.loginMensaje': { es: 'Inicio de sesión exitoso.', en: 'You signed in successfully.' },
  'confirmacion.registroTitulo': { es: '¡Registro exitoso!', en: 'Registration successful!' },
  'confirmacion.registroMensaje': {
    es: 'Tu cuenta se creó correctamente. Ahora puedes iniciar sesión.',
    en: 'Your account was created successfully. You can now sign in.',
  },

  // Panel de administración
  'admin.titulo': { es: 'Panel de administración', en: 'Admin panel' },
  'admin.buscar.placeholder': { es: 'Buscar técnico por nombre o correo', en: 'Search technician by name or email' },
  'admin.tabla.nombre': { es: 'Nombre', en: 'Name' },
  'admin.tabla.correo': { es: 'Correo', en: 'Email' },
  'admin.tabla.registros': { es: 'Registros', en: 'Records' },
  'admin.tabla.vacio': { es: 'No se encontraron técnicos con ese criterio', en: 'No technicians found for that search' },
  'admin.cargando': { es: 'Cargando…', en: 'Loading…' },
  'admin.error': { es: 'No se pudieron cargar los datos', en: 'The data could not be loaded' },
  'admin.registros.titulo': { es: 'Registros de', en: 'Records for' },
  'admin.registros.seleccion': {
    es: 'Selecciona un técnico para ver sus registros',
    en: 'Select a technician to see their records',
  },
  'admin.registros.tabla.imagen': { es: 'Imagen', en: 'Image' },
  'admin.registros.tabla.fecha': { es: 'Fecha', en: 'Date' },
  'admin.registros.tabla.tempMax': { es: 'Temp. máx', en: 'Max temp.' },
  'admin.registros.tabla.tempMin': { es: 'Temp. mín', en: 'Min temp.' },
  'admin.registros.tabla.estado': { es: 'Estado', en: 'Status' },
  'admin.registros.vacio': { es: 'Este técnico no tiene registros aún', en: 'This technician has no records yet' },

  // Estados de un registro de análisis
  'estado.completado': { es: 'Completado', en: 'Completed' },
  'estado.pendiente': { es: 'Pendiente', en: 'Pending' },
  'estado.error': { es: 'Error', en: 'Error' },

  // Footer
  'footer.texto': {
    es: 'ThermalCheck — Análisis Termográfico | Proyecto SENA — Análisis y Desarrollo de Software | 2026',
    en: 'ThermalCheck — Thermographic Analysis | SENA Project — Software Analysis and Development | 2026',
  },
};
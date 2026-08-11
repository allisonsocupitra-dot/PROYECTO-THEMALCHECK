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

  // Registro — paso 1: elegir rol
  'register.paso.rolTitulo': { es: '¿Cómo vas a usar ThemalCheck?', en: 'How will you use ThemalCheck?' },
  'register.paso.rolDescripcion': {
    es: 'Elige un rol para continuar con el registro.',
    en: 'Choose a role to continue registering.',
  },
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

  // Registro — paso 2: formulario
  'register.titulo': { es: 'Registro', en: 'Register' },
  'register.registrandoComo': { es: 'Registrando cuenta de', en: 'Registering account as' },
  'register.cambiarRol': { es: '← Cambiar rol', en: '← Change role' },
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

  // Explorador — carpetas
  'carpetas.nueva': { es: 'Nueva carpeta', en: 'New folder' },
  'carpetas.nombrePlaceholder': { es: 'Nombre de la carpeta', en: 'Folder name' },
  'carpetas.crear': { es: 'Crear', en: 'Create' },
  'carpetas.cancelar': { es: 'Cancelar', en: 'Cancel' },
  'carpetas.items': { es: 'elementos', en: 'items' },

  // Explorador (dashboard)
  'dashboard.exportar': { es: 'Exportar reporte', en: 'Export report' },
  'dashboard.edicion': { es: 'Edición por lotes', en: 'Batch editing' },
  'dashboard.seleccionarTodo': { es: 'Seleccionar todo', en: 'Select all' },

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

  // Modal de ajustes
  'ajustes.idioma.titulo': { es: 'Idioma', en: 'Language' },
  'ajustes.idioma.descripcion': {
    es: 'Elige el idioma en el que quieres ver la plataforma.',
    en: 'Choose the language you want to see the platform in.',
  },
  'ajustes.cerrar': { es: 'Cerrar', en: 'Close' },

  // Panel de administración
  'admin.titulo': { es: 'Panel de administración', en: 'Admin panel' },
  'admin.buscar.placeholder': { es: 'Buscar técnico por nombre o correo', en: 'Search technician by name or email' },
  'admin.tabla.nombre': { es: 'Nombre', en: 'Name' },
  'admin.tabla.correo': { es: 'Correo', en: 'Email' },
  'admin.tabla.registros': { es: 'Registros', en: 'Records' },
  'admin.tabla.vacio': { es: 'No se encontraron técnicos con ese criterio', en: 'No technicians found for that search' },
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
    es: 'ThemalCheck — Análisis Termográfico | Proyecto SENA — Análisis y Desarrollo de Software | 2026',
    en: 'ThemalCheck — Thermographic Analysis | SENA Project — Software Analysis and Development | 2026',
  },
};
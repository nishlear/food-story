import type { Translations } from '../types';

export const es: Translations = {
  // Auth
  signInSubtitle: 'Inicia sesión para explorar calles gastronómicas',
  createAccountSubtitle: 'Crear una nueva cuenta',
  username: 'Usuario',
  usernamePlaceholder: 'ej. admin',
  chooseUsernamePlaceholder: 'Elige un nombre de usuario',
  password: 'Contraseña',
  confirmPassword: 'Confirmar contraseña',
  invalidCredentials: 'Usuario o contraseña incorrectos',
  connectionError: 'Error de conexión. Inténtalo de nuevo.',
  signingIn: 'Iniciando sesión…',
  signIn: 'Iniciar sesión',
  noAccount: '¿No tienes cuenta? Crear una',
  creatingAccount: 'Creando cuenta…',
  createAccount: 'Crear cuenta',
  alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
  passwordMismatch: 'Las contraseñas no coinciden',

  // Location Selection
  whereAreYou: '¿Dónde estás?',
  selectStreetHaven: 'Selecciona una calle gastronómica',
  roleAdmin: 'Admin',
  roleVendor: 'Vendedor',
  roleUser: 'Usuario',
  adminPanelTitle: 'Panel de administración',
  logout: 'Cerrar sesión',
  vendorCountOne: '{count} puesto',
  vendorCountMany: '{count} puestos',

  // Map Interface
  tapToPlaceVendor: 'Toca el mapa para colocar un puesto',
  tapMapToPlacePin: 'Toca el mapa para colocar el pin',
  pinSaved: 'Ubicación del pin guardada',
  failedSavePin: 'Error al guardar la ubicación del pin',
  tapMapToPlacePinFor: 'Toca el mapa para colocar el pin de {name}',
  placePinHere: '¿Colocar pin aquí?',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  mapFailedToLoad: 'Error al cargar el mapa. Actualiza la página.',

  // Vendor Bottom Sheet
  getDirections: 'Cómo llegar',
  share: 'Compartir',
  about: 'Acerca de',
  defaultDescription: 'Un lugar legendario conocido por sus sabores auténticos y recetas familiares secretas transmitidas de generación en generación. El aroma solo ya es suficiente para atraer a la gente de lejos.',
  reviews: 'Reseñas',

  // Vendor Rate Form
  leaveReview: 'Escribir una reseña',
  shareExperience: 'Comparte tu experiencia…',
  selectRatingError: 'Por favor selecciona una puntuación',
  submitting: 'Enviando…',
  submitReview: 'Enviar reseña',

  // Vendor Comments List
  noReviewsYet: 'Aún no hay reseñas. ¡Sé el primero!',

  // Vendor Edit Modal
  editVendor: 'Editar puesto',
  name: 'Nombre',
  description: 'Descripción',
  imageUrlsLabel: 'URLs de imágenes (una por línea)',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: 'Guardando…',
  saveChanges: 'Guardar cambios',
  setLocationOnMap: 'Establecer ubicación en el mapa',

  // Add Vendor Modal
  addVendor: 'Añadir puesto',
  requestVendor: 'Solicitar puesto',
  vendorName: 'Nombre del puesto',
  vendorNamePlaceholder: 'ej. Tacos el Rey',
  briefDescriptionPlaceholder: 'Breve descripción...',
  initialRating: 'Puntuación inicial',
  submitRequest: 'Enviar solicitud',

  // Add Location Modal
  addFoodStreet: 'Añadir calle gastronómica',
  streetName: 'Nombre de la calle',
  streetNamePlaceholder: 'ej. Calle de la Mercería',
  city: 'Ciudad',
  cityPlaceholder: 'ej. Ciudad de México',
  addStreet: 'Añadir calle',

  // Edit Location Modal
  editFoodStreet: 'Editar calle gastronómica',
  mapBoundingBox: 'Área del mapa',
  mapBoundingBoxHint: 'opcional — genera imagen del mapa',
  nwLatitude: 'Latitud NO (arriba)',
  nwLongitude: 'Longitud NO (izquierda)',
  seLatitude: 'Latitud SE (abajo)',
  seLongitude: 'Longitud SE (derecha)',
  mapImageWillGenerate: 'La imagen del mapa se generará al guardar.',
  update: 'Actualizar',

  // Delete Location Modal
  deleteFoodStreet: '¿Eliminar calle gastronómica?',
  deleteLocationConfirm: '¿Seguro que quieres eliminar completamente "{name}" y todos sus puestos? Esta acción no se puede deshacer.',
  delete: 'Eliminar',

  // Settings Modal
  settings: 'Configuración',
  narrationAudio: 'Audio de narración',
  narrationAudioHint: 'Reproducción automática al acercarse',
  textSize: 'Tamaño de texto',
  textSizeHint: 'Ajustar legibilidad',
  changePassword: 'Cambiar contraseña',
  changePasswordHint: 'Actualizar contraseña de la cuenta',

  // Change Password Modal
  currentPassword: 'Contraseña actual',
  newPassword: 'Nueva contraseña',
  confirmNewPassword: 'Confirmar nueva contraseña',
  newPasswordsMismatch: 'Las nuevas contraseñas no coinciden',
  passwordChangedSuccess: '¡Contraseña cambiada con éxito!',
  savePassword: 'Guardar contraseña',

  // Admin Screen
  adminPanel: 'Panel de administración',
  dashboard: 'Panel',
  users: 'Usuarios',
  vendors: 'Puestos',
  comments: 'Comentarios',
  addNewVendor: 'Añadir nuevo puesto',
  backToMap: 'Volver al mapa',
  signedInAs: 'Sesión iniciada como',
  searchPlaceholder: 'Buscar calles o puestos...',

  // Admin Dashboard
  streetFoodCreated: 'Calles gastronómicas creadas',
  streetsBadge: 'Calles',
  totalVendors: 'Total de puestos',
  activeBadge: 'Activo',
  totalUsers: 'Total de usuarios',
  globalBadge: 'Global',
  totalComments: 'Total de comentarios',
  newBadge: 'Nuevo',
  topPerformingStreets: 'Calles más populares',
  topStreetsSubtitle: 'Zonas de alto tráfico ordenadas por número de puestos',
  viewAllMaps: 'Ver todos los mapas',
  noStreetsYet: 'Aún no hay calles',
  rankLabel: 'Posición',
  vendorActivityChart: 'Gráfico de actividad de puestos',
  recentActivity: 'Actividad reciente',
  noActivityYet: 'Aún no hay actividad',
  newComment: 'Nuevo comentario',
  clearAllLogs: 'Limpiar todos los registros',
  needInsights: '¿Necesitas información?',
  needInsightsDesc: 'Genera un informe completo del rendimiento de calles para tus datos.',
  getReport: 'Obtener informe →',
  vendorCountOneShort: '{count} puesto',
  vendorCountManyShort: '{count} puestos',

  // Time Ago
  minAgo: 'hace {n} min',
  minsAgo: 'hace {n} min',
  hourAgo: 'hace {n} hora',
  hoursAgo: 'hace {n} horas',
  dayAgo: 'hace {n} día',
  daysAgo: 'hace {n} días',

  // Admin Users Tab
  usersHeading: 'Usuarios',
  deleteUserConfirm: '¿Eliminar este usuario?',

  // Admin Vendors Tab
  allVendors: 'Todos los puestos',
  assignOwnerPlaceholder: 'Nombre de usuario del propietario',
  save: 'Guardar',
  deleteVendorConfirm: '¿Eliminar el puesto "{name}"?',

  // Admin Comments Tab
  allComments: 'Todos los comentarios',
  noCommentsYet: 'Aún no hay comentarios',
  deleteCommentConfirm: '¿Eliminar este comentario?',

  // App Toasts
  streetAdded: 'Calle añadida con éxito',
  failedAddStreet: 'Error al añadir la calle',
  streetUpdated: 'Calle actualizada con éxito',
  failedUpdateStreet: 'Error al actualizar la calle',
  streetDeleted: 'Calle eliminada con éxito',
  failedDeleteStreet: 'Error al eliminar la calle',
  vendorRequestSubmitted: '¡Solicitud de puesto enviada!',
  vendorAdded: 'Puesto añadido con éxito',
  vendorUpdated: 'Puesto actualizado con éxito',
  failedAddVendor: 'Error al añadir el puesto',
  linkCopied: '¡Enlace copiado al portapapeles!',

  // Language Picker
  languageLabel: 'Idioma',

  // TTS Settings
  cooldownLabel: 'Tiempo de espera de narración automática',
  cooldownHint: 'Tiempo antes de volver a narrar el mismo puesto',
  cooldown5min: '5 minutos',
  cooldown10min: '10 minutos',
  cooldown20min: '20 minutos',
  cooldown30min: '30 minutos',
  cooldown1hr: '1 hora',
  cooldownNever: 'No activar automáticamente',
  gpsAccuracyWarning: 'Si el GPS no es suficientemente preciso, esta función podría no funcionar',
  gpsLowAccuracyTitle: 'Baja precisión GPS',
  gpsLowAccuracyMessage: 'La precisión del GPS es baja. La narración automática puede no funcionar correctamente. ¿Deseas desactivarla?',
  disable: 'Desactivar',
  keepEnabled: 'Mantener activada',
  transitionPhrase: 'Acabas de salir de {from}, ahora presentamos {to}',
  ttsSpeedLabel: 'Velocidad de narración',
  ttsSpeedHint: 'Qué tan rápido la voz lee las descripciones',
};

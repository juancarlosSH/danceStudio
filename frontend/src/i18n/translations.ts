import { Lang } from '../types';

export interface Translations {
  appSubtitle: string;
  appSubtitleRegister: string;
  labelName: string;
  labelPassword: string;
  placeholderName: string;
  placeholderPassword: string;
  btnEnter: string;
  btnCreateAccount: string;
  noAccount: string;
  createOne: string;
  haveAccount: string;
  signIn: string;
  namePasswordRequired: string;

  navProfile: string;
  navDashboard: string;
  navLogout: string;

  cardClassesTaken: string;
  cardClassesRemaining: string;
  cardDaysPayment: string;

  btnBachata: string;
  btnSalsa: string;
  btnCumbia: string;

  calSu: string;
  calMo: string;
  calTu: string;
  calWe: string;
  calTh: string;
  calFr: string;
  calSa: string;
  calMonths: string[];

  classHistory: string;
  btnRegisterClass: string;
  colType: string;
  colDate: string;
  emptyTitle: string;
  emptySubtitle: string;

  modalRegisterTitle: string;
  labelType: string;
  selectType: string;
  labelDate: string;
  btnCancel: string;
  btnSaveClass: string;
  typeAndDateRequired: string;

  modalDeleteTitle: string;
  confirmDeleteMsg: string;
  btnDelete: string;

  profileTitle: string;
  labelPaidAt: string;
  labelClassesPaid: string;
  btnSaveChanges: string;
  paymentRequired: string;

  passwordTitle: string;
  passwordNote: string;
  labelNewPassword: string;
  labelConfirmPassword: string;
  btnUpdatePassword: string;
  bothFieldsRequired: string;
  passwordsNoMatch: string;

  toastClassRegistered: string;
  toastClassDeleted: string;
  toastPaymentUpdated: string;
  toastPasswordUpdated: string;
  accountCreated: string;

  profileIcon: string;
  passwordIcon: string;

  sessionExpired: string;
}

const en: Translations = {
  appSubtitle:          'Sign in to your account',
  appSubtitleRegister:  'Create your account',
  labelName:            'Name',
  labelPassword:        'Password',
  placeholderName:      'Your name',
  placeholderPassword:  '••••••••',
  btnEnter:             'Enter',
  btnCreateAccount:     'Create account',
  noAccount:            "Don't have an account?",
  createOne:            'Create one',
  haveAccount:          'Already have an account?',
  signIn:               'Sign in',
  namePasswordRequired: 'Name and password are required',

  navProfile:           'Profile',
  navDashboard:         'Dashboard',
  navLogout:            'Logout',

  cardClassesTaken:     'Classes taken',
  cardClassesRemaining: 'Classes remaining',
  cardDaysPayment:      'Days remaining until the next payment',

  btnBachata:           'Bachata',
  btnSalsa:             'Salsa',
  btnCumbia:            'Cumbia',

  calSu: 'Su', calMo: 'Mo', calTu: 'Tu', calWe: 'We',
  calTh: 'Th', calFr: 'Fr', calSa: 'Sa',
  calMonths: ['January','February','March','April','May','June','July','August','September','October','November','December'],

  classHistory:         'Class history',
  btnRegisterClass:     '+ Register class',
  colType:              'Type',
  colDate:              'Date',
  emptyTitle:           'No classes registered yet',
  emptySubtitle:        'Hit "Register class" to add your first one',

  modalRegisterTitle:   'Register class',
  labelType:            'Type',
  selectType:           'Select type',
  labelDate:            'Date',
  btnCancel:            'Cancel',
  btnSaveClass:         'Save class',
  typeAndDateRequired:  'Type and date are required',

  modalDeleteTitle:     'Delete class',
  confirmDeleteMsg:     'Are you sure you want to delete this class? This action cannot be undone.',
  btnDelete:            'Delete',

  profileTitle:         'Payment info',
  labelPaidAt:          'Payment date',
  labelClassesPaid:     'Classes paid',
  btnSaveChanges:       'Save changes',
  paymentRequired:      'Payment date and classes paid are required',

  passwordTitle:        'Change password',
  passwordNote:         'Changing your password will deactivate your account until an admin reactivates it.',
  labelNewPassword:     'New password',
  labelConfirmPassword: 'Confirm password',
  btnUpdatePassword:    'Update password',
  bothFieldsRequired:   'Both fields are required',
  passwordsNoMatch:     'Passwords do not match',

  toastClassRegistered: 'Class registered successfully',
  toastClassDeleted:    'Class deleted',
  toastPaymentUpdated:  'Payment info updated',
  toastPasswordUpdated: 'Password updated. Your account has been deactivated.',
  accountCreated:       'Account created. Ask your admin to activate it.',

  profileIcon:          '💳',
  passwordIcon:         '🔒',

  sessionExpired:       'Your session has expired. Please log in again.',
};

const es: Translations = {
  appSubtitle:          'Inicia sesión en tu cuenta',
  appSubtitleRegister:  'Crea tu cuenta',
  labelName:            'Nombre',
  labelPassword:        'Contraseña',
  placeholderName:      'Tu nombre',
  placeholderPassword:  '••••••••',
  btnEnter:             'Entrar',
  btnCreateAccount:     'Crear cuenta',
  noAccount:            '¿No tienes cuenta?',
  createOne:            'Créala aquí',
  haveAccount:          '¿Ya tienes cuenta?',
  signIn:               'Inicia sesión',
  namePasswordRequired: 'Nombre y contraseña son requeridos',

  navProfile:           'Perfil',
  navDashboard:         'Dashboard',
  navLogout:            'Salir',

  cardClassesTaken:     'Clases tomadas',
  cardClassesRemaining: 'Clases restantes',
  cardDaysPayment:      'Días restantes para el próximo pago',

  btnBachata:           'Bachata',
  btnSalsa:             'Salsa',
  btnCumbia:            'Cumbia',

  calSu: 'Do', calMo: 'Lu', calTu: 'Ma', calWe: 'Mi',
  calTh: 'Ju', calFr: 'Vi', calSa: 'Sá',
  calMonths: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],

  classHistory:         'Historial de clases',
  btnRegisterClass:     '+ Registrar clase',
  colType:              'Tipo',
  colDate:              'Fecha',
  emptyTitle:           'Sin clases registradas',
  emptySubtitle:        'Pulsa "Registrar clase" para agregar tu primera',

  modalRegisterTitle:   'Registrar clase',
  labelType:            'Tipo',
  selectType:           'Selecciona tipo',
  labelDate:            'Fecha',
  btnCancel:            'Cancelar',
  btnSaveClass:         'Guardar clase',
  typeAndDateRequired:  'Tipo y fecha son requeridos',

  modalDeleteTitle:     'Eliminar clase',
  confirmDeleteMsg:     '¿Seguro que quieres eliminar esta clase? Esta acción no se puede deshacer.',
  btnDelete:            'Eliminar',

  profileTitle:         'Info de pago',
  labelPaidAt:          'Fecha de pago',
  labelClassesPaid:     'Clases pagadas',
  btnSaveChanges:       'Guardar cambios',
  paymentRequired:      'Fecha de pago y clases pagadas son requeridos',

  passwordTitle:        'Cambiar contraseña',
  passwordNote:         'Cambiar tu contraseña desactivará tu cuenta hasta que un admin la reactive.',
  labelNewPassword:     'Nueva contraseña',
  labelConfirmPassword: 'Confirmar contraseña',
  btnUpdatePassword:    'Actualizar contraseña',
  bothFieldsRequired:   'Ambos campos son requeridos',
  passwordsNoMatch:     'Las contraseñas no coinciden',

  toastClassRegistered: 'Clase registrada exitosamente',
  toastClassDeleted:    'Clase eliminada',
  toastPaymentUpdated:  'Info de pago actualizada',
  toastPasswordUpdated: 'Contraseña actualizada. Tu cuenta ha sido desactivada.',
  accountCreated:       'Cuenta creada. Pide a tu admin que la active.',

  profileIcon:          '💳',
  passwordIcon:         '🔒',

  sessionExpired:       'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
};

export const TRANSLATIONS: Record<Lang, Translations> = { en, es };

export function detectLang(): Lang {
  const saved = localStorage.getItem('lang') as Lang | null;
  if (saved === 'en' || saved === 'es') return saved;
  const browser = (navigator.language ?? 'en').slice(0, 2).toLowerCase();
  return browser === 'es' ? 'es' : 'en';
}
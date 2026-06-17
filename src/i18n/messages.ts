/**
 * i18n/messages — textos de UI. Espanol por defecto; estructura lista para
 * anadir mas idiomas (anadir una clave de locale con el mismo conjunto de keys).
 */
export const messages = {
  es: {
    'app.name': 'Patrimonio',
    'app.tagline': 'Tu patrimonio, privado y en tu dispositivo.',

    'nav.dashboard': 'Resumen',
    'nav.networth': 'Patrimonio',
    'nav.transactions': 'Movimientos',
    'nav.settings': 'Ajustes',

    'action.lock': 'Bloquear',
    'action.theme.toggle': 'Cambiar tema',

    'unlock.create.title': 'Crea tu PIN',
    'unlock.create.subtitle':
      'Protege tus datos con un PIN. Solo se guarda en tu dispositivo, cifrado.',
    'unlock.enter.title': 'Introduce tu PIN',
    'unlock.enter.subtitle': 'Desbloquea para acceder a tus datos.',
    'unlock.pin.placeholder': 'PIN (minimo 4 digitos)',
    'unlock.submit.create': 'Crear PIN y entrar',
    'unlock.submit.enter': 'Desbloquear',
    'unlock.error.short': 'El PIN debe tener al menos 4 caracteres.',
    'unlock.error.wrong': 'PIN incorrecto. Intentalo de nuevo.',

    'dashboard.title': 'Resumen',
    'dashboard.empty': 'Aun no hay datos. Las features llegan en la Fase 1.',

    'networth.title': 'Patrimonio neto',
    'networth.empty': 'Aqui veras tu patrimonio neto y su evolucion.',
    'networth.total': 'Patrimonio neto',
    'networth.assets': 'Activos',
    'networth.liabilities': 'Pasivos',
    'networth.curve.title': 'Evolucion',
    'networth.curve.empty': 'Anade valoraciones para ver tu curva de riqueza.',
    'networth.assets.title': 'Tus activos',
    'networth.liabilities.title': 'Tus pasivos',
    'networth.assets.empty': 'Aun no has anadido activos.',
    'networth.liabilities.empty': 'Aun no has anadido pasivos.',
    'networth.addAsset': 'Anadir activo',
    'networth.addLiability': 'Anadir pasivo',
    'networth.addValuation': 'Nueva valoracion',
    'networth.form.name': 'Nombre',
    'networth.form.category': 'Categoria',
    'networth.form.value': 'Valor actual (€)',
    'networth.form.principal': 'Importe pendiente (€)',
    'networth.form.interest': 'Interes anual (%)',
    'networth.form.date': 'Fecha',
    'networth.form.save': 'Guardar',
    'networth.form.cancel': 'Cancelar',
    'networth.delete': 'Eliminar',
    'networth.category.liquid': 'Liquido',
    'networth.category.invested': 'Invertido',
    'networth.category.real_estate': 'Inmueble',
    'networth.category.vehicle': 'Vehiculo',
    'networth.category.other': 'Otro',

    'transactions.title': 'Movimientos',
    'transactions.empty': 'Aqui gestionaras ingresos, gastos y transferencias.',

    'settings.title': 'Ajustes',
    'settings.privacy':
      'Todos tus datos se quedan en este dispositivo, cifrados. Sin nube.',
  },
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)['es'];

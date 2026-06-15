export type MetodoPago = {
  id: string;
  marca: 'Visa' | 'Mastercard' | 'Amex';
  ultimos4: string;
  expiracion: string;
  predeterminada: boolean;
};

export const MOCK_METODOS_PAGO: MetodoPago[] = [
  {
    id: 'mp-1',
    marca: 'Visa',
    ultimos4: '4242',
    expiracion: '08/27',
    predeterminada: true,
  },
  {
    id: 'mp-2',
    marca: 'Mastercard',
    ultimos4: '8891',
    expiracion: '03/28',
    predeterminada: false,
  },
];

export type SesionActiva = {
  id: string;
  dispositivo: string;
  navegador: string;
  ultimoUso: string;
  actual: boolean;
};

export const MOCK_SESIONES: SesionActiva[] = [
  {
    id: 's-1',
    dispositivo: 'Windows · Chrome',
    navegador: 'Este dispositivo',
    ultimoUso: 'Ahora',
    actual: true,
  },
  {
    id: 's-2',
    dispositivo: 'iPhone 15 · Safari',
    navegador: 'Móvil',
    ultimoUso: 'Hace 2 días',
    actual: false,
  },
  {
    id: 's-3',
    dispositivo: 'MacBook · Firefox',
    navegador: 'Escritorio',
    ultimoUso: 'Hace 1 semana',
    actual: false,
  },
];

export type NotificacionPref = {
  id: string;
  label: string;
  descripcion: string;
  activa: boolean;
};

export const MOCK_NOTIFICACIONES: NotificacionPref[] = [
  {
    id: 'n-estrenos',
    label: 'Próximos estrenos',
    descripcion: 'Te avisamos cuando se estrene una película que marcaste.',
    activa: true,
  },
  {
    id: 'n-promos',
    label: 'Promociones y cupones',
    descripcion: 'Ofertas especiales y descuentos de la semana.',
    activa: true,
  },
  {
    id: 'n-recordatorios',
    label: 'Recordatorios de función',
    descripcion: 'Un aviso 2 horas antes de tu película.',
    activa: false,
  },
  {
    id: 'n-marketing',
    label: 'Novedades de Cinetario',
    descripcion: 'Noticias del servicio y encuestas ocasionales.',
    activa: false,
  },
];

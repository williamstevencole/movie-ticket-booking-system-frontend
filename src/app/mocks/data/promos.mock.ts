export type PromoDisplay = {
  id: string;
  variant: 'red' | 'orange' | 'dark';
  kicker: string;
  titulo: string;
  descripcion: string;
  cta: string;
  codigo?: string;
};

export const MOCK_PROMOS: PromoDisplay[] = [
  {
    id: 'promo-1',
    variant: 'red',
    kicker: '2x1 todos los miércoles',
    titulo: 'Miércoles de cine',
    descripcion:
      'Comprá dos boletos al precio de uno en todas las funciones regulares.',
    cta: 'Aplicar cupón MIE2X1 →',
    codigo: 'MIE2X1',
  },
  {
    id: 'promo-2',
    variant: 'orange',
    kicker: '15% off para estrenos',
    titulo: 'Estrenos con descuento',
    descripcion:
      'Cupón ESTRENO15 válido en cualquier función de la primera semana.',
    cta: 'Ver términos →',
    codigo: 'ESTRENO15',
  },
  {
    id: 'promo-3',
    variant: 'dark',
    kicker: 'Sala VIP',
    titulo: 'Experiencia premium',
    descripcion:
      'Butacas reclinables, servicio en sala. Funciones disponibles en Multiplaza.',
    cta: 'Conocer más →',
  },
];

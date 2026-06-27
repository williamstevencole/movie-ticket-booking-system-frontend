export type BadgeTipo = 'estreno' | 'ultima' | 'vip' | 'fecha';

export type HeroSlide = {
  id: string;
  titulo: string;
  genero: string;
  duracion: string;
  idioma: string;
  clasificacion: string;
  rating: number;
  ratingCount: number;
  sinopsis: string;
  poster: string;
  badge: BadgeTipo;
  badgeLabel: string;
  trailerUrl?: string;
};

export type CarteleraPelicula = {
  id: string;
  titulo: string;
  genero: string;
  duracion: string;
  idioma: string;
  clasificacion?: string;
  poster: string;
  /** URL real del poster (backend). Si está presente, se prioriza sobre la clase `poster`. */
  poster_url?: string | null;
  badge?: BadgeTipo;
  badgeFecha?: string;
  funciones: { hora: string; asientosLibres: number }[];
  rating_promedio?: number | null;
  rating_count?: number;
};

export type ProximoEstreno = {
  id: string;
  titulo: string;
  genero: string;
  duracion: string;
  poster: string;
  fechaEstreno: string;
  badgeFecha: string;
};

export type FichaTecnica = {
  direccion?: string;
  guion?: string;
  fotografia?: string;
  reparto?: string[];
  musica?: string;
  pais?: string;
  productora?: string;
  distribuidor?: string;
};

export type PeliculaDetalle = {
  id: string;
  titulo: string;
  tagline?: string;
  sinopsis: string;
  genero: string;
  duracion: string;
  idioma: string;
  clasificacion: string;
  rating: number;
  ratingCount: number;
  poster: string;
  /** URL real del poster (backend). Si está presente, se prioriza sobre la clase `poster`. */
  poster_url?: string | null;
  badge: BadgeTipo | null;
  badgeLabel: string;
  estreno: string;
  ficha: FichaTecnica;
  attrs: { label: string; value: string }[];
  rating_promedio?: number | null;
  rating_count?: number;
};

export const MOCK_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'p-lobo',
    titulo: 'La hora del lobo',
    genero: 'Drama',
    duracion: '118 min',
    idioma: 'VOSE',
    clasificacion: '+13',
    rating: 4.6,
    ratingCount: 234,
    sinopsis:
      'En un valle congelado del norte, una bióloga regresa a la cabaña donde su padre desapareció veinte años atrás. Lina Soualem firma su primer largometraje de ficción tras una década en el documental.',
    poster: 'poster-1',
    badge: 'estreno',
    badgeLabel: 'ESTRENO HOY',
  },
  {
    id: 'p-faro',
    titulo: 'El faro al sur',
    genero: 'Misterio',
    duracion: '126 min',
    idioma: 'ESP',
    clasificacion: '+13',
    rating: 4.2,
    ratingCount: 189,
    sinopsis:
      'Un faro abandonado en la costa patagónica guarda secretos que tres hermanos deben desenterrar antes de la próxima tormenta.',
    poster: 'poster-2',
    badge: 'estreno',
    badgeLabel: 'ESTRENO HOY',
  },
  {
    id: 'p-ciudades',
    titulo: 'Ciudades de papel',
    genero: 'Romance',
    duracion: '108 min',
    idioma: 'VOSE',
    clasificacion: 'PG',
    rating: 4.4,
    ratingCount: 156,
    sinopsis:
      'Dos arquitectos compiten por el mismo encargo mientras reconstruyen, carta a carta, la historia de amor que nunca terminaron.',
    poster: 'poster-3',
    badge: 'estreno',
    badgeLabel: 'ESTRENO HOY',
  },
  {
    id: 'p-vientos',
    titulo: 'Vientos del este',
    genero: 'Aventura',
    duracion: '134 min',
    idioma: 'ESP',
    clasificacion: 'PG-13',
    rating: 4.8,
    ratingCount: 312,
    sinopsis:
      'Una expedición científica atraviesa el desierto de Gobi cuando descubren que el viento trae mensajes de una civilización perdida.',
    poster: 'poster-4',
    badge: 'ultima',
    badgeLabel: 'ÚLT. SEMANA',
  },
];

export const MOCK_CARTELERA: CarteleraPelicula[] = [
  {
    id: 'p-lobo',
    titulo: 'La hora del lobo',
    genero: 'Drama',
    duracion: '118m',
    idioma: 'VOSE',
    poster: 'poster-1',
    badge: 'estreno',
    rating_promedio: 4.6,
    rating_count: 234,
    funciones: [
      { hora: '15:00', asientosLibres: 68 },
      { hora: '18:30', asientosLibres: 42 },
      { hora: '21:30', asientosLibres: 14 },
      { hora: '23:45', asientosLibres: 8 },
    ],
  },
  {
    id: 'p-faro',
    titulo: 'El faro al sur',
    genero: 'Misterio',
    duracion: '126m',
    idioma: 'ESP',
    poster: 'poster-2',
    rating_promedio: 4.2,
    rating_count: 189,
    funciones: [
      { hora: '14:30', asientosLibres: 55 },
      { hora: '18:00', asientosLibres: 30 },
      { hora: '21:15', asientosLibres: 0 },
    ],
  },
  {
    id: 'p-ciudades',
    titulo: 'Ciudades de papel',
    genero: 'Romance',
    duracion: '108m',
    idioma: 'VOSE',
    poster: 'poster-3',
    rating_promedio: 4.4,
    rating_count: 156,
    funciones: [
      { hora: '15:00', asientosLibres: 72 },
      { hora: '19:30', asientosLibres: 48 },
    ],
  },
  {
    id: 'p-vientos',
    titulo: 'Vientos del este',
    genero: 'Aventura',
    duracion: '134m',
    idioma: 'ESP',
    poster: 'poster-4',
    rating_promedio: 4.8,
    rating_count: 312,
    funciones: [
      { hora: '13:45', asientosLibres: 90 },
      { hora: '17:00', asientosLibres: 65 },
      { hora: '20:30', asientosLibres: 22 },
    ],
  },
  {
    id: 'p-frontera',
    titulo: 'La frontera blanca',
    genero: 'Thriller',
    duracion: '116m',
    idioma: 'VOSE',
    poster: 'poster-5',
    badge: 'ultima',
    rating_promedio: 3.9,
    rating_count: 87,
    funciones: [
      { hora: '16:15', asientosLibres: 38 },
      { hora: '19:00', asientosLibres: 0 },
      { hora: '22:00', asientosLibres: 12 },
    ],
  },
  {
    id: 'p-nadadores',
    titulo: 'Nadadores de agosto',
    genero: 'Comedia',
    duracion: '92m',
    idioma: 'ESP',
    poster: 'poster-6',
    badge: 'vip',
    rating_promedio: 4.1,
    rating_count: 63,
    funciones: [
      { hora: '14:00', asientosLibres: 45 },
      { hora: '17:45', asientosLibres: 28 },
      { hora: '20:15', asientosLibres: 6 },
    ],
  },
];

export const MOCK_PROXIMAMENTE: ProximoEstreno[] = [
  {
    id: 'p-camino',
    titulo: 'Camino al norte',
    genero: 'Drama',
    duracion: '132m',
    poster: 'poster-3',
    fechaEstreno: '2026-06-16',
    badgeFecha: '16 JUN',
  },
  {
    id: 'p-verano',
    titulo: 'El último verano',
    genero: 'Romance',
    duracion: '104m',
    poster: 'poster-2',
    fechaEstreno: '2026-06-22',
    badgeFecha: '22 JUN',
  },
  {
    id: 'p-cobalto',
    titulo: 'Operación cobalto',
    genero: 'Acción',
    duracion: '148m',
    poster: 'poster-5',
    fechaEstreno: '2026-06-30',
    badgeFecha: '30 JUN',
  },
  {
    id: 'p-cosas',
    titulo: 'Cosas que no se dicen',
    genero: 'Comedia',
    duracion: '96m',
    poster: 'poster-4',
    fechaEstreno: '2026-07-07',
    badgeFecha: '07 JUL',
  },
];

export const MOCK_PELICULA_DETALLE: PeliculaDetalle = {
  id: 'p-lobo',
  titulo: 'La hora del lobo',
  tagline: 'El silencio del bosque también tiene un horario.',
  sinopsis:
    'En un valle congelado del norte, una bióloga regresa a la cabaña donde su padre desapareció veinte años atrás. Lo que empieza como un estudio sobre lobos grises se convierte en un descenso pausado a su propia memoria — y a lo que el bosque decidió guardarle.',
  genero: 'Drama',
  duracion: '118 min',
  idioma: 'VOSE',
  clasificacion: '+13',
  rating: 4.6,
  ratingCount: 234,
  rating_promedio: 4.6,
  rating_count: 234,
  poster: 'poster-1',
  badge: 'estreno',
  badgeLabel: 'ESTRENO HOY',
  estreno: '09 jun 2026',
  attrs: [
    { label: 'Dirección', value: 'Lina Soualem' },
    { label: 'Reparto', value: 'Adèle Haenel, Reda Kateb' },
    { label: 'Idioma original', value: 'Francés (VOSE)' },
    { label: 'Estreno', value: '09 jun 2026' },
  ],
  ficha: {
    direccion: 'Lina Soualem',
    guion: 'Lina Soualem, Mathieu Volpe',
    fotografia: 'Frida Marzouk',
    reparto: ['Adèle Haenel', 'Reda Kateb', 'Jeanne Balibar'],
    musica: 'Jóhann Jóhannsson (póstuma)',
    pais: 'Francia · Bélgica',
    productora: 'Les Films du Worso',
    distribuidor: 'Sophie Dulac Distribution',
  },
};

export const MOCK_BUSQUEDA_SUGERENCIAS = [
  { id: 'p-lobo', titulo: 'La hora del lobo', genero: 'Drama', poster: 'poster-1' },
  { id: 'p-faro', titulo: 'El faro al sur', genero: 'Misterio', poster: 'poster-2' },
  { id: 'p-ciudades', titulo: 'Ciudades de papel', genero: 'Romance', poster: 'poster-3' },
  { id: 'p-vientos', titulo: 'Vientos del este', genero: 'Aventura', poster: 'poster-4' },
];

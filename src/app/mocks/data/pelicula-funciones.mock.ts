import { LatLng } from '../../shared/utils/geo.util';

export type FuncionHorario = {
  id: string;
  hora: string;
  asientosLibres: number;
  capacidad: number;
};

export type FuncionSala = {
  id: string;
  nombre: string;
  tipo: string;
  feats: { label: string; vip?: boolean }[];
  precioDesde: number;
  horarios: FuncionHorario[];
};

export type FuncionCine = {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  coords: LatLng;
  iconLetter: string;
  iconColor?: string;
  salas: FuncionSala[];
};

export const MOCK_FUNCIONES: FuncionCine[] = [
  {
    id: 'tgu-1',
    nombre: 'Multiplaza',
    direccion: 'Boulevard Morazán',
    ciudad: 'Tegucigalpa',
    coords: { lat: 14.0723, lng: -87.1921 },
    iconLetter: 'M',
    salas: [
      {
        id: 's1',
        nombre: 'Sala 1 · 2D',
        tipo: '2D',
        feats: [{ label: 'Estándar' }, { label: '96 butacas' }],
        precioDesde: 120,
        horarios: [
          { id: 'f1', hora: '17:00', asientosLibres: 68, capacidad: 96 },
          { id: 'f2', hora: '20:00', asientosLibres: 42, capacidad: 96 },
        ],
      },
      {
        id: 's4',
        nombre: 'Sala 4 · VIP',
        tipo: 'VIP',
        feats: [
          { label: 'VIP', vip: true },
          { label: 'Reclinable' },
          { label: 'Servicio en sala' },
        ],
        precioDesde: 180,
        horarios: [
          { id: 'f3', hora: '18:30', asientosLibres: 14, capacidad: 48 },
          { id: 'f4', hora: '21:30', asientosLibres: 6, capacidad: 48 },
        ],
      },
    ],
  },
  {
    id: 'tgu-2',
    nombre: 'Mall Galerías',
    direccion: 'Lomas del Mayab',
    ciudad: 'Tegucigalpa',
    coords: { lat: 14.0891, lng: -87.1844 },
    iconLetter: 'G',
    iconColor: 'orange',
    salas: [
      {
        id: 's2',
        nombre: 'Sala 2 · 2D',
        tipo: '2D',
        feats: [{ label: 'Estándar' }, { label: '120 butacas' }],
        precioDesde: 110,
        horarios: [
          { id: 'f5', hora: '16:00', asientosLibres: 82, capacidad: 120 },
          { id: 'f6', hora: '19:15', asientosLibres: 35, capacidad: 120 },
          { id: 'f7', hora: '22:00', asientosLibres: 0, capacidad: 120 },
        ],
      },
    ],
  },
  {
    id: 'tgu-3',
    nombre: 'Las Cascadas',
    direccion: 'Boulevard Centroamérica',
    ciudad: 'Tegucigalpa',
    coords: { lat: 14.0588, lng: -87.2102 },
    iconLetter: 'C',
    salas: [
      {
        id: 's1',
        nombre: 'Sala 1 · 2D',
        tipo: '2D',
        feats: [{ label: 'Estándar' }, { label: '88 butacas' }],
        precioDesde: 115,
        horarios: [
          { id: 'f8', hora: '15:30', asientosLibres: 55, capacidad: 88 },
          { id: 'f9', hora: '18:45', asientosLibres: 20, capacidad: 88 },
        ],
      },
    ],
  },
];

export const MOCK_CINES_CITY_BAR = [
  { id: 'todos', nombre: 'Todos' },
  { id: 'tgu-1', nombre: 'Multiplaza' },
  { id: 'tgu-2', nombre: 'Mall Galerías' },
  { id: 'tgu-3', nombre: 'Las Cascadas' },
  { id: 'tgu-4', nombre: 'Citymall' },
];

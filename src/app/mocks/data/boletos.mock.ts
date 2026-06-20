export interface BoletoMock {
  id: string;
  pelicula: string;
  cine: string;
  sala: string;
  fecha: string;
  hora: string;
  asientos: string[];
  total: number;
  estado: string;
}

export const MOCK_BOLETOS: BoletoMock[] = [
  {
    id: 'RES-00001',
    pelicula: 'Spider-Man: Across the Spider-Verse',
    cine: 'Cinetario Mall',
    sala: 'Sala 4',
    fecha: '25 Junio 2026',
    hora: '7:30 PM',
    asientos: ['A5', 'A6'],
    total: 240,
    estado: 'CONFIRMADO',
  },
  {
    id: 'RES-00002',
    pelicula: 'Dune: Parte Dos',
    cine: 'Cinetario Centro',
    sala: 'Sala VIP',
    fecha: '28 Junio 2026',
    hora: '9:00 PM',
    asientos: ['C8'],
    total: 150,
    estado: 'CONFIRMADO',
  },
];

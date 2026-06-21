import { UsuarioStaff } from '../../shared/services/usuarios.service';

// Staff sembrado. Los admin tienen cines: [] (acceso a todos);
// los recepcionistas están asignados a un cine específico.
export const MOCK_USUARIOS: UsuarioStaff[] = [
  {
    id: 'usr-1',
    nombre: 'David Zelaya',
    email: 'david.zelaya@cinetario.com',
    rol: 'admin',
    cines: [],
    ultimoAcceso: '2026-06-20T08:15:00Z',
    activo: true,
    created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'usr-2',
    nombre: 'Andrea Banegas',
    email: 'andrea.banegas@cinetario.com',
    rol: 'admin',
    cines: [],
    ultimoAcceso: '2026-06-19T17:40:00Z',
    activo: true,
    created_at: '2026-01-08T00:00:00Z',
  },
  {
    id: 'usr-3',
    nombre: 'Kevin Discua',
    email: 'kevin.discua@cinetario.com',
    rol: 'recepcionista',
    cines: ['gua-1'],
    ultimoAcceso: '2026-06-20T07:50:00Z',
    activo: true,
    created_at: '2026-02-12T00:00:00Z',
  },
  {
    id: 'usr-4',
    nombre: 'Paola Cárcamo',
    email: 'paola.carcamo@cinetario.com',
    rol: 'recepcionista',
    cines: ['sps-1'],
    ultimoAcceso: '2026-06-18T20:05:00Z',
    activo: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'usr-5',
    nombre: 'Marlon Pineda',
    email: 'marlon.pineda@cinetario.com',
    rol: 'recepcionista',
    cines: ['ssv-1'],
    ultimoAcceso: null,
    activo: false,
    created_at: '2026-04-20T00:00:00Z',
  },
];

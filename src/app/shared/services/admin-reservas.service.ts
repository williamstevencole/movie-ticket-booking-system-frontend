import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_RESERVAS } from '../../mocks/data/reservas.mock';

export type AdminReservaRow = {
  id: string;
  numero_reserva: string;
  estado: string;
  num_asientos: number;
  monto_total: number;
  created_at: string;
  updated_at: string;
  usuario?: { id: string; nombre: string; email: string };
  funcion?: { id: string; fecha_hora: string };
  pelicula?: { id: string; titulo: string };
  cine?: { id: string; nombre: string };
};

export type AdminReservaDetail = AdminReservaRow & {
  asientos?: any[];
  notas_internas?: string | null;
  expira_en?: string | null;
  cupon_codigo?: string | null;
};

const USUARIOS = [
  { id: 'u-1', nombre: 'Andrea López', email: 'andrea.lopez@gmail.com' },
  { id: 'u-2', nombre: 'Marco Rodríguez', email: 'marco.rod@gmail.com' },
  { id: 'u-3', nombre: 'Sofía García', email: 'sofia.garcia@outlook.com' },
  { id: 'u-4', nombre: 'Daniel Méndez', email: 'dmendez@gmail.com' },
  { id: 'u-5', nombre: 'Lucía Hernández', email: 'lucia.h@hotmail.com' },
  { id: 'u-6', nombre: 'Pablo Castillo', email: 'pcastillo@gmail.com' },
  { id: 'u-7', nombre: 'Camila Reyes', email: 'cami.reyes@gmail.com' },
  { id: 'u-8', nombre: 'Javier Morales', email: 'j.morales@yahoo.com' },
  { id: 'u-9', nombre: 'Isabella Cruz', email: 'isa.cruz@gmail.com' },
  { id: 'u-10', nombre: 'Rodrigo Paz', email: 'rpaz@gmail.com' },
  { id: 'u-11', nombre: 'Valeria Torres', email: 'valeria.t@gmail.com' },
  { id: 'u-12', nombre: 'Mateo Aguilar', email: 'mateo.a@gmail.com' },
];

const CINES = [
  { id: 'gua-1', nombre: 'Cinépolis Oakland Mall' },
  { id: 'tgu-1', nombre: 'Multiplaza' },
  { id: 'sps-1', nombre: 'Cinépolis City Mall' },
  { id: 'ssv-1', nombre: 'Multiplaza San Salvador' },
];

const PELICULAS = [
  { id: 'p-1', titulo: 'Tormenta sobre el Pacífico' },
  { id: 'p-2', titulo: 'Cartas a mi yo de mañana' },
  { id: 'p-3', titulo: 'El Reino de Niebla' },
];

const MOCK_ROWS: AdminReservaRow[] = MOCK_RESERVAS.map((r, i) => {
  const usuario = USUARIOS.find((u) => u.id === r.id_usuario) ?? USUARIOS[i % USUARIOS.length]!;
  return {
    id: r.id,
    numero_reserva: r.numero_reserva,
    estado: r.estado,
    num_asientos: r.num_asientos,
    monto_total: r.monto_total,
    created_at: r.created_at,
    updated_at: r.updated_at,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    funcion: { id: r.id_funcion, fecha_hora: new Date(Date.now() + (i + 1) * 86400000).toISOString() },
    pelicula: PELICULAS[i % PELICULAS.length],
    cine: CINES[i % CINES.length],
  };
});

@Injectable({ providedIn: 'root' })
export class AdminReservasService {
  list(q: Record<string, any> = {}) {
    let rows = [...MOCK_ROWS];
    if (q['estado']) rows = rows.filter((r) => r.estado === q['estado']);
    const page = Number(q['page'] ?? 1);
    const limit = Number(q['limit'] ?? 10);
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit), total: rows.length, page, limit }).pipe(delay(120));
  }

  getById(id: string | number) {
    const row = MOCK_ROWS.find((r) => r.id === String(id)) ?? MOCK_ROWS[0]!;
    const detail: AdminReservaDetail = {
      ...row,
      asientos: [],
      notas_internas: null,
      expira_en: null,
      cupon_codigo: null,
    };
    return of({ ...detail }).pipe(delay(120));
  }

  cancelar(id: string | number) {
    const row = MOCK_ROWS.find((r) => r.id === String(id)) ?? MOCK_ROWS[0]!;
    return of({ reserva: { ...row, estado: 'cancelada' }, reembolso: null }).pipe(delay(120));
  }
}

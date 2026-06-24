import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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

export type AsientoCobrar = {
  id: string;
  codigo: string;
  tipo: string;
  precio: number;
};

export type ReservaCobrarDetail = {
  id: string;
  numero_reserva: string;
  estado: string;
  created_at: string;
  expira_en: string | null;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
  };
  pelicula: { id: string; titulo: string };
  funcion: { id: string; fecha_hora: string };
  sala: { id: string; nombre: string };
  cine: { id: string; nombre: string };
  asientos: AsientoCobrar[];
  num_asientos: number;
  monto_total: number;
};

const SALAS = ['Sala 1', 'Sala 2', 'Sala 3 IMAX', 'Sala 4 VIP', 'Sala 5'];

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

  /**
   * Devuelve la reserva completa lista para pasar a la pantalla de cobro
   * (cliente, película, sala, cine, asientos con precios y total).
   *
   * Mock: si el numero coincide con una reserva mockeada, devuelve esa.
   * Si no (p.ej. el numero viene del backend real), sintetiza una reserva
   * determinística a partir del propio numero — así la pantalla demo
   * funciona con cualquier numero hasta que se integre la card backend.
   */
  getByNumero(numero: string): Observable<ReservaCobrarDetail | null> {
    if (!numero) return of(null).pipe(delay(120));

    const row = MOCK_ROWS.find((r) => r.numero_reserva === numero);
    const reserva = MOCK_RESERVAS.find((r) => r.numero_reserva === numero);

    if (row && reserva) {
      return of(this.toCobrarDetail(reserva, row)).pipe(delay(140));
    }

    return of(synthCobrarDetail(numero)).pipe(delay(140));
  }

  private toCobrarDetail(
    reserva: (typeof MOCK_RESERVAS)[number],
    row: AdminReservaRow,
  ): ReservaCobrarDetail {
    const usuario =
      USUARIOS.find((u) => u.id === reserva.id_usuario) ?? USUARIOS[0]!;

    const asientos: AsientoCobrar[] = reserva.asientos.map((a) => ({
      id: a.id,
      codigo: a.codigo,
      tipo: a.tipo_asiento,
      precio: a.precio,
    }));

    const salaIdx = seedOf(reserva.id) % SALAS.length;

    return {
      id: reserva.id,
      numero_reserva: reserva.numero_reserva,
      estado: reserva.estado,
      created_at: reserva.created_at,
      expira_en: reserva.expira_en ?? null,
      cliente: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: telefonoFor(usuario.id),
      },
      pelicula: row.pelicula!,
      funcion: row.funcion!,
      sala: { id: `s-${reserva.id_funcion}`, nombre: SALAS[salaIdx]! },
      cine: row.cine!,
      asientos,
      num_asientos: reserva.num_asientos,
      monto_total: reserva.monto_total,
    };
  }
}

function telefonoFor(idUsuario: string): string {
  // Mock determinista: número hondureño realista a partir del id
  const seed = seedOf(idUsuario);
  const block1 = 3000 + (seed % 7000);
  const block2 = 1000 + ((seed >> 4) % 9000);
  return `+504 ${block1}-${block2}`;
}

function seedOf(s: string): number {
  let h = 17;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 31) >>> 0) + s.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

/**
 * Sintetiza un detalle de reserva pagable a partir del numero_reserva.
 * Se usa cuando la pantalla de cobro recibe un numero que viene del backend
 * real y no existe en los mocks locales — así la demo siempre tiene algo
 * razonable que mostrar y se ejercita el flujo completo.
 */
function synthCobrarDetail(numero: string): ReservaCobrarDetail {
  const seed = seedOf(numero);
  const usuario = USUARIOS[seed % USUARIOS.length]!;
  const pelicula = PELICULAS_SYNTH[(seed >> 2) % PELICULAS_SYNTH.length]!;
  const cine = CINES_SYNTH[(seed >> 4) % CINES_SYNTH.length]!;
  const sala = SALAS[(seed >> 6) % SALAS.length]!;

  const nAsientos = 1 + ((seed >> 8) % 4); // 1..4
  const tipos = ['Estandar', 'Estandar', 'Estandar', 'Premium', 'VIP'];
  const tipoFor = (i: number) => tipos[(seed + i * 7) % tipos.length]!;
  const precioFor = (tipo: string) =>
    tipo === 'VIP' ? 110 : tipo === 'Premium' ? 90 : 70;
  const filas = 'CDEFGHIJ';
  const filaIdx = (seed >> 10) % filas.length;
  const fila = filas[filaIdx]!;
  const startCol = 4 + ((seed >> 12) % 8);

  const asientos: AsientoCobrar[] = Array.from({ length: nAsientos }, (_, i) => {
    const tipo = tipoFor(i);
    const col = startCol + i;
    return {
      id: `a-${numero}-${i}`,
      codigo: `${fila}${col}`,
      tipo,
      precio: precioFor(tipo),
    };
  });

  const monto = asientos.reduce((s, a) => s + a.precio, 0);

  const now = new Date();
  const created = new Date(now.getTime() - 12 * 60_000).toISOString();
  const expira = new Date(now.getTime() + 8 * 60_000).toISOString();
  // funcion algunas horas adelante hoy
  const funcionHora = new Date(now);
  funcionHora.setHours(14 + ((seed >> 14) % 8), 30, 0, 0);

  return {
    id: `synth-${numero}`,
    numero_reserva: numero,
    estado: 'pendiente_pago',
    created_at: created,
    expira_en: expira,
    cliente: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: telefonoFor(usuario.id),
    },
    pelicula,
    funcion: { id: `f-synth-${numero}`, fecha_hora: funcionHora.toISOString() },
    sala: { id: `s-synth-${numero}`, nombre: sala },
    cine,
    asientos,
    num_asientos: nAsientos,
    monto_total: monto,
  };
}

const PELICULAS_SYNTH = [
  { id: 'p-1', titulo: 'Tormenta sobre el Pacífico' },
  { id: 'p-2', titulo: 'Cartas a mi yo de mañana' },
  { id: 'p-3', titulo: 'El Reino de Niebla' },
  { id: 'p-4', titulo: 'La última carretera al norte' },
  { id: 'p-5', titulo: 'Memorias del bosque azul' },
];

const CINES_SYNTH = [
  { id: 'gua-1', nombre: 'Cinépolis Oakland Mall' },
  { id: 'tgu-1', nombre: 'Multiplaza Tegucigalpa' },
  { id: 'sps-1', nombre: 'Cinépolis City Mall' },
];

export interface SnapshotPair {
  valor_anterior: Record<string, unknown> | null;
  valor_nuevo: Record<string, unknown> | null;
}

export const SNAPSHOTS_BY_EVENT_ID: Record<string, SnapshotPair> = {
  // PELICULA_CREAR
  'evt-0001': {
    valor_anterior: null,
    valor_nuevo: {
      titulo: 'Dune: Parte III',
      sinopsis: 'Paul Atreides enfrenta el destino del universo conocido.',
      fecha_estreno: '2026-08-21',
      id_idioma: 'idi-02',
      idioma_nombre: 'Inglés',
      id_genero: 'gen-04',
      genero_nombre: 'Ciencia ficción',
      activo: true,
    },
  },

  // PELICULA_EDITAR
  'evt-0002': {
    valor_anterior: {
      titulo: 'El ultimo viaje',
      activo: false,
      idioma_nombre: 'Español (LATAM)',
    },
    valor_nuevo: {
      titulo: 'El último viaje',
      activo: true,
      idioma_nombre: 'Español (LATAM)',
    },
  },

  // FUNCION_EDITAR
  'evt-0003': {
    valor_anterior: {
      id_pelicula: 'pel-422',
      pelicula_titulo: 'El último viaje',
      id_sala: 'sal-301',
      sala_nombre: 'Sala 1',
      fecha_hora: '2026-06-18T20:30:00.000Z',
      estado: 'PROGRAMADA',
    },
    valor_nuevo: {
      id_pelicula: 'pel-422',
      pelicula_titulo: 'El último viaje',
      id_sala: 'sal-304',
      sala_nombre: 'Sala 4',
      fecha_hora: '2026-06-18T22:00:00.000Z',
      estado: 'PROGRAMADA',
    },
  },

  // FUNCION_CANCELAR
  'evt-0004': {
    valor_anterior: {
      id_pelicula: 'pel-501',
      pelicula_titulo: 'Dune: Parte III',
      id_sala: 'sal-303',
      sala_nombre: 'Sala 3',
      fecha_hora: '2026-06-15T19:00:00.000Z',
      estado: 'PROGRAMADA',
    },
    valor_nuevo: null,
  },

  // POLITICA_CREAR
  'evt-0005': {
    valor_anterior: null,
    valor_nuevo: {
      nombre: 'Cancelación flexible',
      activa: true,
      id_cine: 'cin-01',
    },
  },

  // POLITICA_EDITAR
  'evt-0006': {
    valor_anterior: { nombre: 'Estándar', activa: true, id_cine: 'cin-01' },
    valor_nuevo: { nombre: 'Estándar 2026', activa: true, id_cine: 'cin-01' },
  },

  // PRECIO_EDITAR — evento estrella
  'evt-0007': {
    valor_anterior: {
      cine_nombre: 'Cine Norte',
      tipo_asiento_nombre: 'VIP',
      precio: '45.00',
    },
    valor_nuevo: {
      cine_nombre: 'Cine Norte',
      tipo_asiento_nombre: 'VIP',
      precio: '55.00',
    },
  },

  // PAGO_APROBAR
  'evt-0008': {
    valor_anterior: null,
    valor_nuevo: {
      id_reserva: 'res-4412',
      numero_reserva: 'R-2026-04412',
      monto_original: '90.00',
      monto_descuento: '0.00',
      monto_final: '90.00',
      metodo: 'TARJETA',
      estado: 'aprobado',
      marca_snapshot: 'VISA',
      ultimos4_snapshot: '4242',
      referencia_externa: 'ch_3PqLkX2HzVbQk0K1',
      id_cupon: null,
    },
  },

  // REEMBOLSO_PROCESAR
  'evt-0009': {
    valor_anterior: {
      id_pago: 'pag-9912',
      monto: '60.00',
      porcentaje_aplicado: '100.00',
      estado: 'PENDIENTE',
      id_politica: 'pol-12',
      fecha_procesado: null,
    },
    valor_nuevo: {
      id_pago: 'pag-9912',
      monto: '60.00',
      porcentaje_aplicado: '100.00',
      estado: 'PROCESADO',
      id_politica: 'pol-12',
      fecha_procesado: '2026-06-12T22:11:47.000Z',
    },
  },

  // RESERVA_CANCELAR
  'evt-0010': {
    valor_anterior: {
      numero_reserva: 'R-2026-04388',
      id_usuario: 'usu-8801',
      usuario_nombre: 'María Fernández',
      id_funcion: 'fun-1184',
      funcion_label: 'Dune: Parte III — Sala 2 — 12/06 20:00',
      estado: 'CONFIRMADA',
      asientos: ['A1', 'A2'],
      total: '90.00',
    },
    valor_nuevo: null,
  },

  // CUPON_TOGGLE
  'evt-0011': {
    valor_anterior: {
      codigo: 'VERANO25',
      tipo: 'PORCENTAJE',
      valor: '25.00',
      fecha_expiracion: '2026-09-30',
      usos_maximos: 500,
      activo: true,
    },
    valor_nuevo: {
      codigo: 'VERANO25',
      tipo: 'PORCENTAJE',
      valor: '25.00',
      fecha_expiracion: '2026-09-30',
      usos_maximos: 500,
      activo: false,
    },
  },

  // USUARIO_TOGGLE_ESTADO
  'evt-0012': {
    valor_anterior: {
      nombre: 'Luis Aramayo',
      email: 'luis.aramayo@example.com',
      id_rol: 'rol-02',
      rol_nombre: 'Cliente',
      estado: 'ACTIVO',
      notificaciones_activas: true,
    },
    valor_nuevo: {
      nombre: 'Luis Aramayo',
      email: 'luis.aramayo@example.com',
      id_rol: 'rol-02',
      rol_nombre: 'Cliente',
      estado: 'INACTIVO',
      notificaciones_activas: true,
    },
  },

  // SALA_EDITAR — cambio de filas/columnas/capacidad
  'evt-0013': {
    valor_anterior: {
      nombre: 'Sala 3',
      id_cine: 'cin-01',
      cine_nombre: 'Cine Norte',
      filas: 10,
      columnas: 12,
      capacidad: 120,
    },
    valor_nuevo: {
      nombre: 'Sala 3',
      id_cine: 'cin-01',
      cine_nombre: 'Cine Norte',
      filas: 12,
      columnas: 14,
      capacidad: 168,
    },
  },

  // CINE_EDITAR
  'evt-0014': {
    valor_anterior: {
      nombre: 'Cine Centro',
      direccion: 'Av. Buenos Aires 123',
      id_ciudad: 'ciu-01',
      ciudad_nombre: 'La Paz',
    },
    valor_nuevo: {
      nombre: 'Cine Centro',
      direccion: 'Av. 16 de Julio 1450',
      id_ciudad: 'ciu-01',
      ciudad_nombre: 'La Paz',
    },
  },

  // GENERO_CREAR
  'evt-0015': {
    valor_anterior: null,
    valor_nuevo: { nombre: 'Documental musical' },
  },

  // IDIOMA_EDITAR
  'evt-0016': {
    valor_anterior: { nombre: 'Inglés (sub)' },
    valor_nuevo: { nombre: 'Inglés (subtitulado)' },
  },

  // CIUDAD_CREAR
  'evt-0017': {
    valor_anterior: null,
    valor_nuevo: { nombre: 'Sucre' },
  },
};

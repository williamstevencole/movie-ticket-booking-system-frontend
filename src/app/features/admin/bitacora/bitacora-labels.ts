export type EntityLabelMap = { entidad: string; campos: Record<string, string> };

export const ENTITY_LABELS: Record<string, EntityLabelMap> = {
  Pelicula: {
    entidad: 'Película',
    campos: {
      titulo: 'Título',
      sinopsis: 'Sinopsis',
      fecha_estreno: 'Fecha de estreno',
      id_idioma: 'Idioma (ID)',
      idioma_nombre: 'Idioma',
      id_genero: 'Género (ID)',
      genero_nombre: 'Género',
      activo: 'Activo',
    },
  },
  Funcion: {
    entidad: 'Función',
    campos: {
      id_pelicula: 'Película (ID)',
      pelicula_titulo: 'Película',
      id_sala: 'Sala (ID)',
      sala_nombre: 'Sala',
      fecha_hora: 'Fecha y hora',
      estado: 'Estado',
    },
  },
  PoliticaCancelacion: {
    entidad: 'Política de cancelación',
    campos: {
      nombre: 'Nombre',
      activa: 'Activa',
      id_cine: 'Cine (ID)',
    },
  },
  Reserva: {
    entidad: 'Reserva',
    campos: {
      numero_reserva: 'Número',
      usuario_nombre: 'Usuario',
      funcion_label: 'Función',
      estado: 'Estado',
      asientos: 'Asientos',
      total: 'Total',
    },
  },
  Pago: {
    entidad: 'Pago',
    campos: {
      numero_reserva: 'Reserva',
      monto_original: 'Monto original',
      monto_descuento: 'Descuento',
      monto_final: 'Monto final',
      metodo: 'Método',
      estado: 'Estado',
      marca_snapshot: 'Marca tarjeta',
      ultimos4_snapshot: 'Últimos 4',
      referencia_externa: 'Referencia externa',
    },
  },
  Reembolso: {
    entidad: 'Reembolso',
    campos: {
      id_pago: 'Pago (ID)',
      monto: 'Monto',
      porcentaje_aplicado: '% aplicado',
      estado: 'Estado',
      id_politica: 'Política (ID)',
      fecha_procesado: 'Fecha procesado',
    },
  },
  Genero: { entidad: 'Género', campos: { nombre: 'Nombre' } },
  Idioma: { entidad: 'Idioma', campos: { nombre: 'Nombre' } },
  Ciudad: { entidad: 'Ciudad', campos: { nombre: 'Nombre' } },
  TipoAsiento: { entidad: 'Tipo de asiento', campos: { nombre: 'Nombre' } },
  Cine: {
    entidad: 'Cine',
    campos: {
      nombre: 'Nombre',
      direccion: 'Dirección',
      id_ciudad: 'Ciudad (ID)',
      ciudad_nombre: 'Ciudad',
    },
  },
  Sala: {
    entidad: 'Sala',
    campos: {
      nombre: 'Nombre',
      id_cine: 'Cine (ID)',
      cine_nombre: 'Cine',
      filas: 'Filas',
      columnas: 'Columnas',
      capacidad: 'Capacidad',
    },
  },
  PrecioCine: {
    entidad: 'Precio',
    campos: {
      cine_nombre: 'Cine',
      tipo_asiento_nombre: 'Tipo de asiento',
      precio: 'Precio',
    },
  },
  Cupon: {
    entidad: 'Cupón',
    campos: {
      codigo: 'Código',
      tipo: 'Tipo',
      valor: 'Valor',
      fecha_expiracion: 'Fecha expiración',
      usos_maximos: 'Usos máximos',
      activo: 'Activo',
    },
  },
  Usuario: {
    entidad: 'Usuario',
    campos: {
      nombre: 'Nombre',
      email: 'Email',
      id_rol: 'Rol (ID)',
      rol_nombre: 'Rol',
      estado: 'Estado',
      notificaciones_activas: 'Notificaciones activas',
    },
  },
};

/**
 * @file reservas.service.ts
 *
 * RETIRED: The abstract ReservasService class and its DI override (MockReservasService)
 * have been removed in the admin-residual migration (Task 1).
 *
 * Type aliases are kept here for backward-compat import resolution during the
 * multi-task migration. Tasks 2/3/7/9 will clean up the remaining imports.
 *
 * Admin consumers → AdminReservasService
 * Client consumers → MisReservasService
 * Checkout → HttpClient.post('/reservas', ...) via CheckoutStateService
 */

export type EstadoReserva =
  | 'pendiente_pago'
  | 'pagada'
  | 'cancelada'
  | 'reembolsada'
  | 'expirada';

export type ReservaAsiento = {
  id: string;
  id_asiento_funcion: string;
  codigo: string;
  fila: string;
  columna: number;
  tipo_asiento: string;
  precio: number;
};

export type Reserva = {
  id: string;
  numero_reserva: string;
  id_usuario: string;
  id_funcion: string;
  estado: EstadoReserva;
  num_asientos: number;
  monto_total: number;
  created_at: string;
  updated_at: string;
  asientos: ReservaAsiento[];
  expira_en?: string;
  cupon_codigo?: string;
  notas_internas?: string;
};

export type ConfirmarReservaInput = {
  id_funcion: string;
  asientos: Array<{
    id_asiento_funcion: string;
    version: number;
  }>;
};

export type ReservaUsuario = {
  id: string;
  nombre: string;
  email: string;
};

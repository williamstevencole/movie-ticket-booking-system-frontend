import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

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

export type ReservaUsuario = {
  id: string;
  nombre: string;
  email: string;
};

export type CrearReservaInput = {
  id_funcion: string;
  ids_asiento_funcion: string[];
};

export type CrearReservaResponse = {
  id_reserva: string;
  numero_reserva: string;
  estado: EstadoReserva;
  asientos: { codigo: string; tipo: string }[];
  total_estimado: string;
};

export type CancelarReservaResponse = {
  reserva: {
    id: string;
    numero_reserva: string;
    estado: EstadoReserva;
    fecha_cancelacion: string;
  };
  reembolso: {
    id: string;
    estado: string;
    monto: string;
  } | null;
};

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/reservas`;
  private readonly meBase = `${API_URL}/me/reservas`;
  private readonly adminBase = `${API_URL}/admin/reservas`;

  list(estado?: string): Observable<Reserva[]> {
    const params = estado ? { params: { estado } } : {};
    return this.http.get<Reserva[]>(this.meBase, params);
  }

  getByNum(numero: string): Observable<Reserva | undefined> {
    return this.http.get<Reserva>(`${this.meBase}/${numero}`);
  }

  cancelarMe(numero: string): Observable<CancelarReservaResponse> {
    return this.http.patch<CancelarReservaResponse>(
      `${this.meBase}/${numero}/cancelar`,
      {}
    );
  }

  crear(input: CrearReservaInput): Observable<CrearReservaResponse> {
    return this.http.post<CrearReservaResponse>(this.base, input);
  }

  cancelar(id: string): Observable<CancelarReservaResponse> {
    return this.http.patch<CancelarReservaResponse>(
      `${this.adminBase}/${id}/cancelar`,
      {}
    );
  }

  listAll(): Observable<Reserva[]> {
    return this.http
      .get<{ data: Reserva[] }>(this.adminBase)
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<Reserva | undefined> {
    return this.http.get<Reserva>(`${this.adminBase}/${id}`);
  }

  listUsuarios(): Observable<ReservaUsuario[]> {
  return this.http
    .get<{ data: ReservaUsuario[] }>(`${API_URL}/admin/users`)
    .pipe(map((res) => res.data));
  }

  getUsuario(id: string): Observable<ReservaUsuario | undefined> {
  return this.http.get<ReservaUsuario>(`${API_URL}/admin/clientes/${id}`);
  }
}
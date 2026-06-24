import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/config/env';
import { EstadoReserva } from './reservas.service';

// Espejo de Usuarios (rol = cliente) en api/prisma/schema.prisma
export type EstadoCliente = 'activo' | 'bloqueado';

export type Cliente = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: EstadoCliente;
  notificaciones_activas: boolean;
  num_reservas: number;
  created_at: string;
};

export type ClientesPage = {
  data: Cliente[];
  total: number;
  page: number;
  limit: number;
};

export type ListClientesQuery = {
  page?: number;
  limit?: number;
  busqueda?: string;
  estado?: EstadoCliente;
};

export type ClientesStats = {
  total: number;
  activos: number;
  bloqueados: number;
};

export type ClienteDetalleAsiento = {
  id: string;
  codigo: string;
};

export type ClienteDetalleReserva = {
  id: string;
  numero_reserva: string;
  estado: EstadoReserva;
  created_at: string;
  pelicula: string | null;
  fecha_hora: string;
  num_asientos: number;
  asientos: ClienteDetalleAsiento[];
  monto_total: number;
};

export type ClienteDetalle = Cliente & {
  reservas: ClienteDetalleReserva[];
};

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin/clientes`;

  list(q: ListClientesQuery = {}): Observable<ClientesPage> {
    let params = new HttpParams();
    if (q.page) params = params.set('page', String(q.page));
    if (q.limit) params = params.set('limit', String(q.limit));
    if (q.busqueda && q.busqueda.trim()) params = params.set('q', q.busqueda.trim());
    if (q.estado) params = params.set('estado', q.estado);
    return this.http.get<ClientesPage>(this.base, { params });
  }

  getStats(): Observable<ClientesStats> {
    return this.http.get<ClientesStats>(`${this.base}/stats`);
  }

  getById(id: string): Observable<ClienteDetalle> {
    return this.http.get<ClienteDetalle>(`${this.base}/${id}`);
  }

  setEstado(id: string, estado: EstadoCliente): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.base}/${id}/estado`, { estado });
  }

  /** @deprecated Use setEstado instead. Kept so the listado component compiles. */
  toggleEstado(id: string, currentEstado: EstadoCliente): Observable<Cliente> {
    const next: EstadoCliente = currentEstado === 'activo' ? 'bloqueado' : 'activo';
    return this.setEstado(id, next);
  }
}

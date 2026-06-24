import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_CLIENTES } from '../../mocks/data/clientes.mock';

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

@Injectable({ providedIn: 'root' })
export class ClientesService {
  list(q: ListClientesQuery = {}): Observable<ClientesPage> {
    let rows = [...MOCK_CLIENTES];
    if (q.estado) rows = rows.filter((c) => c.estado === q.estado);
    if (q.busqueda) {
      const b = q.busqueda.toLowerCase();
      rows = rows.filter((c) => c.nombre.toLowerCase().includes(b) || c.email.toLowerCase().includes(b));
    }
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit), total: rows.length, page, limit }).pipe(delay(120));
  }

  getById(id: string): Observable<Cliente> {
    const found = MOCK_CLIENTES.find((c) => c.id === id) ?? MOCK_CLIENTES[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  setEstado(id: string, estado: EstadoCliente): Observable<Cliente> {
    const found = MOCK_CLIENTES.find((c) => c.id === id) ?? MOCK_CLIENTES[0]!;
    return of({ ...found, estado }).pipe(delay(120));
  }

  /** @deprecated Use setEstado instead */
  toggleEstado(id: string, currentEstado: EstadoCliente): Observable<Cliente> {
    const next: EstadoCliente = currentEstado === 'activo' ? 'bloqueado' : 'activo';
    return this.setEstado(id, next);
  }
}

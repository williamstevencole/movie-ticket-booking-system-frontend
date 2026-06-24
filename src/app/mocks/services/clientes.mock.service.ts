import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Cliente,
  ClientesPage,
  ClientesService,
  EstadoCliente,
  ListClientesQuery,
} from '../../shared/services/clientes.service';
import { MOCK_CLIENTES } from '../data/clientes.mock';

@Injectable()
export class MockClientesService extends ClientesService {
  private clientes: Cliente[] = [...MOCK_CLIENTES];

  override list(q: ListClientesQuery = {}): Observable<ClientesPage> {
    let data = [...this.clientes];
    if (q.estado) data = data.filter((c) => c.estado === q.estado);
    if (q.busqueda) {
      const needle = q.busqueda.toLowerCase();
      data = data.filter(
        (c) =>
          c.nombre.toLowerCase().includes(needle) ||
          c.email.toLowerCase().includes(needle),
      );
    }
    const page = q.page ?? 1;
    const limit = q.limit ?? (data.length || 20);
    const total = data.length;
    const slice = data.slice((page - 1) * limit, page * limit);
    return of({ data: slice, total, page, limit });
  }

  override getById(id: string): Observable<Cliente> {
    const c = this.clientes.find((x) => x.id === id);
    if (!c) {
      return throwError(() => ({ status: 404, error: { message: 'Cliente no encontrado' } }));
    }
    return of({ ...c });
  }

  override setEstado(id: string, estado: EstadoCliente): Observable<Cliente> {
    const index = this.clientes.findIndex((c) => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Cliente con id "${id}" no encontrado`));
    }
    const updated: Cliente = { ...this.clientes[index]!, estado };
    this.clientes[index] = updated;
    return of(updated);
  }

  override toggleEstado(id: string, currentEstado: EstadoCliente): Observable<Cliente> {
    const next: EstadoCliente = currentEstado === 'activo' ? 'bloqueado' : 'activo';
    return this.setEstado(id, next);
  }
}

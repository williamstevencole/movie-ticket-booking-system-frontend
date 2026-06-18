import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Cliente,
  ClientesService,
} from '../../shared/services/clientes.service';
import { MOCK_CLIENTES } from '../data/clientes.mock';

@Injectable()
export class MockClientesService extends ClientesService {
  private clientes: Cliente[] = [...MOCK_CLIENTES];

  override list(): Observable<Cliente[]> {
    return of([...this.clientes]);
  }

  override getById(id: string): Observable<Cliente | undefined> {
    return of(this.clientes.find((c) => c.id === id));
  }

  override toggleEstado(id: string): Observable<Cliente> {
    const index = this.clientes.findIndex((c) => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Cliente con id "${id}" no encontrado`));
    }
    const current = this.clientes[index];
    const updated: Cliente = {
      ...current,
      estado: current.estado === 'activo' ? 'bloqueado' : 'activo',
    };
    this.clientes[index] = updated;
    return of(updated);
  }
}

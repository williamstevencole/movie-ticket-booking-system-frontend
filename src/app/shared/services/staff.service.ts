import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_USUARIOS } from '../../mocks/data/usuarios.mock';

export type RolStaff = 'admin' | 'cliente';

export type UsuarioStaff = {
  id: string;
  nombre: string;
  email: string;
  rol: RolStaff;
  notificaciones_activas: boolean;
  ultimoAcceso: string | null;
  activo: boolean;
  created_at: string;
};

export type StaffPage = {
  data: UsuarioStaff[];
  total: number;
  page: number;
  limit: number;
};

export type ListStaffQuery = {
  page?: number;
  limit?: number;
  busqueda?: string;
};

export type CrearStaffInput = {
  nombre: string;
  email: string;
  password?: string;
};

export type CrearStaffResponse = {
  user: UsuarioStaff;
  tempPassword?: string;
};

export type EditarStaffInput = {
  nombre?: string;
  email?: string;
};

@Injectable({ providedIn: 'root' })
export class StaffService {
  list(q: ListStaffQuery = {}): Observable<StaffPage> {
    let rows = [...MOCK_USUARIOS];
    if (q.busqueda) {
      const b = q.busqueda.toLowerCase();
      rows = rows.filter((u) => u.nombre.toLowerCase().includes(b) || u.email.toLowerCase().includes(b));
    }
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const start = (page - 1) * limit;
    return of({ data: rows.slice(start, start + limit), total: rows.length, page, limit }).pipe(delay(120));
  }

  create(input: CrearStaffInput): Observable<CrearStaffResponse> {
    const user: UsuarioStaff = {
      id: `usr-${Date.now()}`,
      nombre: input.nombre,
      email: input.email,
      rol: 'admin',
      notificaciones_activas: false,
      ultimoAcceso: null,
      activo: true,
      created_at: new Date().toISOString(),
    };
    return of({ user: { ...user }, tempPassword: 'Temp@1234' }).pipe(delay(120));
  }

  update(id: string, input: EditarStaffInput): Observable<UsuarioStaff> {
    const found = MOCK_USUARIOS.find((u) => u.id === id) ?? MOCK_USUARIOS[0]!;
    return of({ ...found, ...input }).pipe(delay(120));
  }

  setEstado(id: string, activo: boolean): Observable<UsuarioStaff> {
    const found = MOCK_USUARIOS.find((u) => u.id === id) ?? MOCK_USUARIOS[0]!;
    return of({ ...found, activo }).pipe(delay(120));
  }

  resetPassword(id: string): Observable<{ tempPassword: string }> {
    return of({ tempPassword: 'Temp@1234' }).pipe(delay(120));
  }
}

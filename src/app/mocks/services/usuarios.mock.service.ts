import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CrearUsuarioInput,
  EditarUsuarioInput,
  UsuarioStaff,
  UsuariosService,
} from '../../shared/services/usuarios.service';
import { MOCK_USUARIOS } from '../data/usuarios.mock';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class MockUsuariosService extends UsuariosService {
  private store: UsuarioStaff[] = MOCK_USUARIOS.map((u) => ({
    ...u,
    cines: [...u.cines],
  }));

  override list(): Observable<UsuarioStaff[]> {
    return of(this.store.map((u) => ({ ...u, cines: [...u.cines] })));
  }

  override create(input: CrearUsuarioInput): Observable<UsuarioStaff> {
    const err = this.validate(input);
    if (err) return throwError(() => err);

    const usuario: UsuarioStaff = {
      id: `usr-${Date.now().toString(36)}`,
      nombre: input.nombre.trim(),
      email: input.email.trim().toLowerCase(),
      rol: input.rol,
      cines: input.rol === 'admin' ? [] : [...input.cines],
      ultimoAcceso: null,
      activo: true,
      created_at: new Date().toISOString(),
    };
    this.store = [...this.store, usuario];
    return of({ ...usuario, cines: [...usuario.cines] });
  }

  override update(
    id: string,
    input: EditarUsuarioInput,
  ): Observable<UsuarioStaff> {
    const idx = this.store.findIndex((u) => u.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Usuario no encontrado' }));
    }
    const current = this.store[idx]!;
    const merged: CrearUsuarioInput = {
      nombre: input.nombre ?? current.nombre,
      email: input.email ?? current.email,
      rol: input.rol ?? current.rol,
      cines: input.cines ?? current.cines,
    };
    const err = this.validate(merged, id);
    if (err) return throwError(() => err);

    // No dejar sin admin activos: bloquear si era el último admin y cambia de rol.
    if (
      current.rol === 'admin' &&
      merged.rol !== 'admin' &&
      this.activeAdmins().length <= 1 &&
      current.activo
    ) {
      return throwError(() => ({
        code: 'LAST_ADMIN',
        message: 'No se puede quitar el rol al último administrador activo',
      }));
    }

    const next: UsuarioStaff = {
      ...current,
      nombre: merged.nombre.trim(),
      email: merged.email.trim().toLowerCase(),
      rol: merged.rol,
      cines: merged.rol === 'admin' ? [] : [...merged.cines],
    };
    this.store[idx] = next;
    return of({ ...next, cines: [...next.cines] });
  }

  override setActivo(id: string, activo: boolean): Observable<UsuarioStaff> {
    const idx = this.store.findIndex((u) => u.id === id);
    if (idx === -1) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Usuario no encontrado' }));
    }
    const current = this.store[idx]!;
    if (
      !activo &&
      current.rol === 'admin' &&
      current.activo &&
      this.activeAdmins().length <= 1
    ) {
      return throwError(() => ({
        code: 'LAST_ADMIN',
        message: 'No se puede desactivar al último administrador activo',
      }));
    }
    const next: UsuarioStaff = { ...current, activo };
    this.store[idx] = next;
    return of({ ...next, cines: [...next.cines] });
  }

  override resetPassword(id: string): Observable<{ tempPassword: string }> {
    const exists = this.store.some((u) => u.id === id);
    if (!exists) {
      return throwError(() => ({ code: 'NOT_FOUND', message: 'Usuario no encontrado' }));
    }
    return of({ tempPassword: this.randomPassword() });
  }

  // ── helpers ──

  private validate(
    input: CrearUsuarioInput,
    ignoreId?: string,
  ): { code: string; message: string } | null {
    const nombre = input.nombre.trim();
    if (!nombre) return { code: 'EMPTY', message: 'El nombre es obligatorio' };

    const email = input.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return { code: 'BAD_EMAIL', message: 'El email no es válido' };
    }
    if (
      this.store.some(
        (u) => u.email.toLowerCase() === email && u.id !== ignoreId,
      )
    ) {
      return { code: 'DUPLICATE', message: 'Ya existe un usuario con ese email' };
    }
    if (input.rol === 'recepcionista' && input.cines.length === 0) {
      return {
        code: 'NO_CINE',
        message: 'Un recepcionista debe estar asignado al menos a un cine',
      };
    }
    return null;
  }

  private activeAdmins(): UsuarioStaff[] {
    return this.store.filter((u) => u.rol === 'admin' && u.activo);
  }

  private randomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let out = '';
    for (let i = 0; i < 10; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }
}

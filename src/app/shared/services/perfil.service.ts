import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type MiPerfil = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  notificaciones_activas: boolean;
  rol: string;
  created_at: string;
};

export type ActualizarMiPerfilInput = {
  nombre?: string;
  telefono?: string;
  notificaciones_activas?: boolean;
};

const MOCK_PERFIL: MiPerfil = {
  id: 'me-1',
  nombre: 'Juan Cliente',
  email: 'juan.cliente@gmail.com',
  telefono: '+504 9911-0000',
  notificaciones_activas: true,
  rol: 'cliente',
  created_at: '2025-01-01T00:00:00Z',
};

@Injectable({ providedIn: 'root' })
export class PerfilService {
  obtenerMiPerfil(): Observable<MiPerfil> {
    return of({ ...MOCK_PERFIL }).pipe(delay(120));
  }

  actualizarMiPerfil(input: ActualizarMiPerfilInput): Observable<MiPerfil> {
    return of({ ...MOCK_PERFIL, ...input }).pipe(delay(120));
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { MessageResponse } from '../../core/types/api.types';
import type { components } from '../../core/types/api.generated';
import { SuscripcionesEstrenoService } from './suscripciones-estreno.service';

// ─── tipos ────────────────────────────────────────────────────
export type LoginRequest = components['schemas']['LoginDto'];
export type RegisterRequest = components['schemas']['RegisterDto'];

/**
 * Frontend-side user state. Extends the API's UsuarioResponse with the
 * `notificaciones_activas` field that the frontend reads/writes from
 * localStorage and the user-profile endpoint.
 */
export type AuthUser = {
  id: string;
  nombre: string;
  email: string;
  id_rol: string;
  estado: string;
  telefono?: string | null;
  notificaciones_activas?: boolean;
};

export type AuthResponse = components['schemas']['AuthResponse'];

export type JwtPayload = {
  email: string;
  sub: string;
  idRol: string;
  rol: string;
  jti: string;
  iat: number;
  exp: number;
};

// ─── almacenamiento ───────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'cinetario.token';
const USER_KEY = 'cinetario.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/auth`;
  private readonly suscripciones = inject(SuscripcionesEstrenoService);

  // estado reactivo de sesión — los componentes lo leen como signal
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _user = signal<AuthUser | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  /** Rol que viene firmado dentro del JWT por el backend. */
  readonly role = computed<string | null>(() => {
    const t = this._token();
    if (!t) return null;
    return this.decodeToken(t)?.rol ?? null;
  });

  readonly isAuthenticated = computed<boolean>(() => {
    const t = this._token();
    if (!t) return false;
    const payload = this.decodeToken(t);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  });

  // ─── HTTP ───────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  /** Invalida el JWT en el backend (best-effort). */
  logoutRemote(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/logout`, {});
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/forgot-password`, {
      email,
    });
  }

  resetPassword(token: string, password: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/reset-password`, {
      token,
      password,
    });
  }

  // ─── sesión ─────────────────────────────────────────────────
  clearSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this._token.set(null);
    this._user.set(null);
    this.suscripciones.reset();
  }

  updateUser(user: Partial<AuthUser>): void {
    const current = this._user();

    if (!current) return;

    const updated = {
      ...current,
      ...user,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this._user.set(updated);
  }

  // ─── helpers privados ───────────────────────────────────────
  private persist(res: AuthResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    }
    this._token.set(res.access_token);
    this._user.set(res.usuario);
    this.suscripciones.hydrate().subscribe({ error: () => {} });
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }
}

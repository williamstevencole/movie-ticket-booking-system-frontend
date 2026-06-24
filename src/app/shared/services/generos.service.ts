import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';

export type Genero = {
  id: string;
  nombre: string;
};

export type CrearGeneroInput = {
  nombre: string;
};

export type EditarGeneroInput = {
  nombre: string;
};

type BackendGenero = {
  id: string | number;
  nombre: string;
};

function mapGenero(g: BackendGenero): Genero {
  return { id: String(g.id), nombre: g.nombre };
}

@Injectable({ providedIn: 'root' })
export class GenerosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/generos`;

  list(nombre?: string): Observable<Genero[]> {
    let params = new HttpParams();
    if (nombre && nombre.trim()) params = params.set('nombre', nombre.trim());
    return this.http
      .get<BackendGenero[]>(this.base, { params })
      .pipe(map((rows) => rows.map(mapGenero)));
  }

  create(input: CrearGeneroInput): Observable<Genero> {
    return this.http.post<BackendGenero>(this.base, input).pipe(map(mapGenero));
  }

  update(id: string, input: EditarGeneroInput): Observable<Genero> {
    return this.http
      .patch<BackendGenero>(`${this.base}/${id}`, input)
      .pipe(map(mapGenero));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

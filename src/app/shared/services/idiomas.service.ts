import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../core/config/env';
import type { components } from '../../core/types/api.generated';
import { toStr } from '../../core/api/normalize';

export type Idioma = {
  id: string;
  nombre: string;
};

export type CrearIdiomaInput = components['schemas']['CreateIdiomaDto'];
export type EditarIdiomaInput = {
  nombre: string;
};

type BackendIdioma = {
  id: string | number;
  nombre: string;
};

function mapIdioma(i: BackendIdioma): Idioma {
  return { id: toStr(i.id), nombre: i.nombre };
}

@Injectable({ providedIn: 'root' })
export class IdiomasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/idiomas`;

  list(nombre?: string): Observable<Idioma[]> {
    let params = new HttpParams();
    if (nombre && nombre.trim()) params = params.set('nombre', nombre.trim());
    return this.http
      .get<BackendIdioma[]>(this.base, { params })
      .pipe(map((rows) => rows.map(mapIdioma)));
  }

  create(input: CrearIdiomaInput): Observable<Idioma> {
    return this.http.post<BackendIdioma>(this.base, input).pipe(map(mapIdioma));
  }

  update(id: string, input: EditarIdiomaInput): Observable<Idioma> {
    return this.http
      .patch<BackendIdioma>(`${this.base}/${id}`, input)
      .pipe(map(mapIdioma));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

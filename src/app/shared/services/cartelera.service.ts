import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, shareReplay, switchMap } from 'rxjs';
import {
  PeliculasService,
  Pelicula,
  ListPeliculasQuery,
} from './peliculas.service';
import { GenerosService } from './generos.service';
import { IdiomasService } from './idiomas.service';
import {
  CarteleraPelicula,
  BadgeTipo,
} from '../../mocks/data/cartelera-display.mock';

/** Mapas id→nombre de catálogos usados para enriquecer las películas del backend. */
type Catalogos = {
  genero: Map<string, string>;
  idioma: Map<string, string>;
};

/**
 * Servicio de cara al cliente para Búsqueda y Cartelera.
 * Envuelve `PeliculasService` y resuelve los catálogos (género/idioma) para
 * entregar `CarteleraPelicula` listas para mostrar.
 */
@Injectable({ providedIn: 'root' })
export class CarteleraService {
  private readonly peliculas = inject(PeliculasService);
  private readonly generos = inject(GenerosService);
  private readonly idiomas = inject(IdiomasService);

  /** Catálogos cacheados durante la sesión (se cargan una sola vez). */
  private readonly catalogos$: Observable<Catalogos> = forkJoin({
    generos: this.generos.list(),
    idiomas: this.idiomas.list(),
  }).pipe(
    map(({ generos, idiomas }) => ({
      genero: new Map(generos.map((g) => [g.id, g.nombre])),
      idioma: new Map(idiomas.map((i) => [i.id, i.nombre])),
    })),
    shareReplay(1),
  );

  /** Busca películas por título (búsqueda parcial en el backend). */
  buscar(titulo: string, limit = 24): Observable<CarteleraPelicula[]> {
    return this.listar({ titulo, limit });
  }

  /** Lista películas con filtros y las devuelve mapeadas a la vista de cartelera. */
  listar(query: ListPeliculasQuery = {}): Observable<CarteleraPelicula[]> {
    return this.catalogos$.pipe(
      switchMap((cat) =>
        this.peliculas
          .list(query)
          .pipe(map((page) => page.data.map((p) => this.toDisplay(p, cat)))),
      ),
    );
  }

  private toDisplay(p: Pelicula, cat: Catalogos): CarteleraPelicula {
    return {
      id: p.id,
      titulo: p.titulo,
      genero: (p.id_genero && cat.genero.get(p.id_genero)) || '—',
      duracion: p.duracion_min ? `${p.duracion_min}m` : '—',
      idioma: (p.id_idioma && cat.idioma.get(p.id_idioma)) || '—',
      poster: '',
      poster_url: p.poster_url,
      badge: this.badgeFromEstreno(p.fecha_estreno),
      funciones: [],
      rating_promedio: p.rating_promedio ?? null,
      rating_count: p.rating_count ?? 0,
    };
  }

  /** Marca como "estreno" las películas estrenadas en los últimos 14 días. */
  private badgeFromEstreno(fecha: string | null | undefined): BadgeTipo | undefined {
    if (!fecha) return undefined;
    const estreno = new Date(fecha).getTime();
    if (Number.isNaN(estreno)) return undefined;
    const dias = (Date.now() - estreno) / 86_400_000;
    return dias >= 0 && dias <= 14 ? 'estreno' : undefined;
  }
}

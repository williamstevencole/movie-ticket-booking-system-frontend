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
  PeliculaDetalle,
  ProximoEstreno,
  FichaTecnica,
  BadgeTipo,
} from '../../mocks/data/cartelera-display.mock';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_BADGE = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

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

  /** Detalle de una película (GET /peliculas/:id) mapeado para la página de detalle. */
  detalle(id: string): Observable<PeliculaDetalle> {
    return this.catalogos$.pipe(
      switchMap((cat) =>
        this.peliculas.getById(id).pipe(map((p) => this.toDetalle(p, cat))),
      ),
    );
  }

  private toDetalle(p: Pelicula, cat: Catalogos): PeliculaDetalle {
    const idioma = (p.id_idioma && cat.idioma.get(p.id_idioma)) || '—';
    const estreno = this.formatFecha(p.fecha_estreno);
    const badge = this.badgeFromEstreno(p.fecha_estreno) ?? null;
    const ficha = (p.ficha_tecnica ?? {}) as FichaTecnica;
    const attrs: { label: string; value: string }[] = [];
    if (ficha.direccion) attrs.push({ label: 'Dirección', value: ficha.direccion });
    if (ficha.reparto?.length) {
      attrs.push({ label: 'Reparto', value: ficha.reparto.slice(0, 2).join(', ') });
    }
    attrs.push({ label: 'Idioma', value: idioma });
    if (estreno) attrs.push({ label: 'Estreno', value: estreno });
    return {
      id: p.id,
      titulo: p.titulo,
      tagline: p.tagline,
      sinopsis: p.sinopsis ?? '',
      genero: (p.id_genero && cat.genero.get(p.id_genero)) || '—',
      duracion: p.duracion_min ? `${p.duracion_min} min` : '—',
      idioma,
      clasificacion: '',
      rating: p.rating_promedio ?? 0,
      ratingCount: p.rating_count ?? 0,
      poster: '',
      poster_url: p.poster_url,
      badge,
      badgeLabel: badge ? 'ESTRENO' : '',
      estreno,
      fecha_estreno: p.fecha_estreno ?? null,
      puede_reservar: p.puede_reservar,
      ficha,
      attrs,
      rating_promedio: p.rating_promedio ?? null,
      rating_count: p.rating_count ?? 0,
    };
  }

  private formatFecha(fecha: string | null | undefined): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  private toDisplay(p: Pelicula, cat: Catalogos): CarteleraPelicula {
    return {
      id: p.id,
      titulo: p.titulo,
      genero: (p.id_genero && cat.genero.get(p.id_genero)) || '—',
      duracion: p.duracion_min ? `${p.duracion_min}m` : '—',
      idioma: (p.id_idioma && cat.idioma.get(p.id_idioma)) || '—',
      sinopsis: p.sinopsis ?? '',
      poster: '',
      poster_url: p.poster_url,
      badge: this.badgeFromEstreno(p.fecha_estreno),
      funciones: [],
      puede_reservar: p.puede_reservar,
      rating_promedio: p.rating_promedio ?? null,
      rating_count: p.rating_count ?? 0,
    };
  }

  /**
   * Próximos estrenos: películas cuya fecha de estreno es futura
   * (GET /peliculas?fecha_inicio=mañana), ordenadas por fecha ascendente.
   */
  proximos(limit = 8): Observable<ProximoEstreno[]> {
    const manana = new Date();
    manana.setHours(0, 0, 0, 0);
    manana.setDate(manana.getDate() + 1);
    return this.catalogos$.pipe(
      switchMap((cat) =>
        this.peliculas
          .list({ fecha_inicio: manana.toISOString(), limit })
          .pipe(
            map((page) =>
              page.data
                .filter((p) => this.esFuturo(p.fecha_estreno))
                .sort((a, b) => (a.fecha_estreno ?? '').localeCompare(b.fecha_estreno ?? ''))
                .map((p) => this.toProximo(p, cat)),
            ),
          ),
      ),
    );
  }

  private toProximo(p: Pelicula, cat: Catalogos): ProximoEstreno {
    return {
      id: p.id,
      titulo: p.titulo,
      genero: (p.id_genero && cat.genero.get(p.id_genero)) || '—',
      duracion: p.duracion_min ? `${p.duracion_min}m` : '—',
      poster: '',
      poster_url: p.poster_url,
      fechaEstreno: p.fecha_estreno ?? '',
      badgeFecha: this.badgeFecha(p.fecha_estreno),
    };
  }

  private esFuturo(fecha: string | null | undefined): boolean {
    if (!fecha) return false;
    const t = new Date(fecha).getTime();
    return !Number.isNaN(t) && t > Date.now();
  }

  private badgeFecha(fecha: string | null | undefined): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')} ${MESES_BADGE[d.getMonth()]}`;
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

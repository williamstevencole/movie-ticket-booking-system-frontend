import { Component, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenerosService, Genero } from '../../../shared/services/generos.service';
import { IdiomasService, Idioma } from '../../../shared/services/idiomas.service';

export type FiltrosBusqueda = {
  /** ID del género (vacío = todos). */
  genero: string;
  /** ID del idioma (vacío = todos). */
  idioma: string;
};

const EMPTY_FILTROS: FiltrosBusqueda = { genero: '', idioma: '' };

@Component({
  selector: 'app-busqueda-filtros',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="filtros">
      <div class="field">
        <label for="f-genero">Género</label>
        <select id="f-genero" class="select" [ngModel]="genero()" (ngModelChange)="set('genero', $event)">
          <option value="">Todos</option>
          @for (g of generos(); track g.id) {
            <option [value]="g.id">{{ g.nombre }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label for="f-idioma">Idioma</label>
        <select id="f-idioma" class="select" [ngModel]="idioma()" (ngModelChange)="set('idioma', $event)">
          <option value="">Todos</option>
          @for (i of idiomas(); track i.id) {
            <option [value]="i.id">{{ i.nombre }}</option>
          }
        </select>
      </div>
    </div>
  `,
  styleUrl: './filtros.component.scss',
})
export class BusquedaFiltrosComponent implements OnInit {
  private generosSvc = inject(GenerosService);
  private idiomasSvc = inject(IdiomasService);

  readonly value = input<FiltrosBusqueda>(EMPTY_FILTROS);
  readonly filtrosChange = output<FiltrosBusqueda>();

  readonly genero = signal('');
  readonly idioma = signal('');

  readonly generos = signal<Genero[]>([]);
  readonly idiomas = signal<Idioma[]>([]);

  constructor() {
    effect(() => {
      const v = this.value();
      this.genero.set(v.genero);
      this.idioma.set(v.idioma);
    });
  }

  ngOnInit(): void {
    this.generosSvc.list().subscribe({
      next: (g) => this.generos.set(g),
      error: () => this.generos.set([]),
    });
    this.idiomasSvc.list().subscribe({
      next: (i) => this.idiomas.set(i),
      error: () => this.idiomas.set([]),
    });
  }

  set(key: keyof FiltrosBusqueda, value: string): void {
    if (key === 'genero') this.genero.set(value);
    if (key === 'idioma') this.idioma.set(value);
    this.filtrosChange.emit({
      genero: this.genero(),
      idioma: this.idioma(),
    });
  }
}

import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type FiltrosBusqueda = {
  genero: string;
  idioma: string;
  clasificacion: string;
};

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
          @for (g of generos; track g) {
            <option [value]="g">{{ g }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label for="f-idioma">Idioma</label>
        <select id="f-idioma" class="select" [ngModel]="idioma()" (ngModelChange)="set('idioma', $event)">
          <option value="">Todos</option>
          @for (i of idiomas; track i) {
            <option [value]="i">{{ i }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label for="f-clas">Clasificación</label>
        <select id="f-clas" class="select" [ngModel]="clasificacion()" (ngModelChange)="set('clasificacion', $event)">
          <option value="">Todas</option>
          @for (c of clasificaciones; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
      </div>
    </div>
  `,
  styleUrl: './filtros.component.scss',
})
export class BusquedaFiltrosComponent {
  readonly filtrosChange = output<FiltrosBusqueda>();

  readonly genero = signal('');
  readonly idioma = signal('');
  readonly clasificacion = signal('');

  readonly generos = ['Drama', 'Misterio', 'Romance', 'Aventura', 'Thriller', 'Comedia', 'Acción'];
  readonly idiomas = ['VOSE', 'ESP'];
  readonly clasificaciones = ['PG', '+13', 'PG-13'];

  set(key: keyof FiltrosBusqueda, value: string): void {
    if (key === 'genero') this.genero.set(value);
    if (key === 'idioma') this.idioma.set(value);
    if (key === 'clasificacion') this.clasificacion.set(value);
    this.filtrosChange.emit({
      genero: this.genero(),
      idioma: this.idioma(),
      clasificacion: this.clasificacion(),
    });
  }
}

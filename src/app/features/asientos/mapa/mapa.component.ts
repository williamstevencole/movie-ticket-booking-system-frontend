import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PanelLateralComponent } from '../panel-lateral/panel-lateral.component';
import { Asiento } from './asiento.model';
import { ErrorComponent } from '../error/error.component';
import { TipoAsiento } from './seat-types/seat-type.model';
import { EstadoAsiento } from './seat-states/seat-state.model';
import { FuncionBarComponent } from '../funcion-bar/funcion-bar.component';
import { TimerComponent } from '../timer/timer.component';
import { CtaComponent } from '../cta/cta.component';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [
    PanelLateralComponent,
    ErrorComponent,
    FuncionBarComponent,
    TimerComponent,
    CtaComponent,
    AppbarComponent,
    FooterComponent,
  ],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent {
  private readonly router = inject(Router);
  readonly funcionId = signal<string | null>(null);

  // --- funcion-bar signals ---
  readonly pelicula = signal<string>('Spider-Man: Across the Spider-Verse');
  readonly cine = signal<string>('Cinetario Mall');
  readonly sala = signal<string>('Sala 4');
  readonly fechaHora = signal<string>(new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString());
  readonly duracionMin = signal<number | null>(140);
  readonly idioma = signal<string | null>('SUB');
  readonly posterUrl = signal<string | null>(null);
  readonly cargoServicio = signal<number>(15);

  // --- seat data ---
  readonly asientosRaw = signal<Asiento[]>(this.crearAsientos());

  /** Asientos completos actualmente seleccionados (includes version, bloqueado_hasta) */
  readonly asientosSeleccionados = signal<Asiento[]>([]);

  /** Error de conflicto de asiento */
  readonly errorAsiento = signal<string | null>(null);

  /** Adapter: transforms flat Asiento[] into row-grouped shape for template */
  readonly filas = computed(() => {
    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const todos = this.asientosRaw();
    return letras.map((letra) => ({
      letra,
      asientos: todos
        .filter((a) => a.fila === letra)
        .map((a) => ({
          codigo: a.id,
          estado: (a.estado === 'seleccionado' ? 'disponible' : a.estado) as 'disponible' | 'ocupado' | 'bloqueado',
          tipo: a.tipo,
        })),
    }));
  });

  readonly asientosSeleccionadosDetallados = computed(() => {
    const asientos = this.asientosSeleccionados();
    return asientos.map((a) => ({
      codigo: a.id,
      tipo: a.tipo,
      precio: this.precioPorTipo(a.tipo),
      version: a.version,
    }));
  });

  readonly total = computed(() => {
    const subtotal = this.asientosSeleccionadosDetallados()
      .reduce((sum, a) => sum + a.precio, 0);
    return subtotal + this.cargoServicio();
  });

  constructor(private route: ActivatedRoute) {
    this.funcionId.set(this.route.snapshot.paramMap.get('id'));
  }

  estaSeleccionado(codigo: string): boolean {
    return this.asientosSeleccionados().some((a) => a.id === codigo);
  }

  toggle(asiento: { codigo: string; estado: string }): void {
    if (asiento.estado === 'bloqueado') return;
    if (asiento.estado === 'ocupado') {
      this.errorAsiento.set(asiento.codigo);
      return;
    }
    const fullAsiento = this.buscarAsientoCompleto(asiento.codigo);
    if (!fullAsiento) return;

    const sel = this.asientosSeleccionados();
    if (sel.some((a) => a.id === asiento.codigo)) {
      this.asientosSeleccionados.set(sel.filter((a) => a.id !== asiento.codigo));
    } else {
      this.asientosSeleccionados.set([...sel, fullAsiento]);
    }
  }

  onTimerExpirado(): void {
    this.asientosSeleccionados.set([]);
  }

  continuarAPago(): void {
    this.router.navigate(['/checkout/metodos-pago']);
  }

  private precioPorTipo(tipo: 'estandar' | 'vip' | 'accesible'): number {
    if (tipo === 'vip') return 180;
    if (tipo === 'accesible') return 90;
    return 100;
  }

  private buscarAsientoCompleto(codigo: string): Asiento | null {
    return this.asientosRaw().find((a) => a.id === codigo) ?? null;
  }

  private crearAsientos(): Asiento[] {
    const resultado: Asiento[] = [];

    for (const fila of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      for (let numero = 1; numero <= 10; numero++) {
        const rand = Math.random();

        let tipo: TipoAsiento = 'estandar';

        if (fila === 'A' || fila === 'B') {
          tipo = 'vip';
        }

        if (fila === 'H') {
          tipo = 'accesible';
        }

        let estado: EstadoAsiento;

        if (rand < 0.5) {
          estado = 'disponible';
        } else {
          estado = 'ocupado';
        }

        if (fila === 'D' && numero <= 3) {
          estado = 'bloqueado';
        }

        const asiento: Asiento = {
          id: `${fila}-${numero}`,
          fila,
          numero,
          tipo,
          estado,
          version: 1,
        };

        // Set bloqueado_hasta for locked seats
        if (estado === 'bloqueado') {
          asiento.bloqueado_hasta = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        }

        resultado.push(asiento);
      }
    }

    return resultado;
  }
}

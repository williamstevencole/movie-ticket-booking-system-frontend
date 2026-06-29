import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ReenviarBoletoComponent } from '../acciones/reenviar-boleto/reenviar-boleto.component';
import { DescargarBoletoComponent } from '../acciones/descargar-boleto/descargar-boleto.component';
import { QrBoletoComponent } from './qr/qr.component';
import { ReembolsosComponent } from './reembolsos/reembolsos.component';
import { TiempoRestanteComponent } from './tiempo-restante/tiempo-restante.component';
import { MisBoletosSidebarComponent } from './sidebar/mis-boletos-sidebar.component';
import { CountdownPagoComponent } from '../../../shared/components/countdown-pago/countdown-pago.component';

import { Boleto } from '../../../shared/services/boletos.service';
import { MisReservasService } from '../../../shared/services/mis-reservas.service';
import { AuthService } from '../../../shared/services/auth.service';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';

type Filtro = 'proximos' | 'pasados' | 'cancelados';
type Vista = 'boletos' | 'reembolsos' | 'perfil';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-mis-boletos',
  standalone: true,
  imports: [
    RouterLink,
    AppbarComponent,
    FooterComponent,
    ReenviarBoletoComponent,
    DescargarBoletoComponent,
    QrBoletoComponent,
    ReembolsosComponent,
    TiempoRestanteComponent,
    MisBoletosSidebarComponent,
    RatingDisplayComponent,
    CountdownPagoComponent,
    DatePipe,
  ],
  templateUrl: './mis-boletos.component.html',
  styleUrl: './mis-boletos.component.scss',
})
export class MisBoletosComponent {
  private readonly router = inject(Router);
  private readonly misReservasSvc = inject(MisReservasService);
  private readonly auth = inject(AuthService);

  readonly userName = computed(() => this.auth.user()?.nombre ?? '');
  readonly userEmail = computed(() => this.auth.user()?.email ?? '');

  readonly vistaActual = signal<Vista>('boletos');
  readonly filtroBoletos = signal<Filtro>('proximos');
  readonly pagina = signal(1);
  readonly seatsExpandidos = signal<Set<string>>(new Set());

  readonly countProximos = signal(0);
  readonly countPasados = signal(0);
  readonly countCancelados = signal(0);

  readonly cargando = signal(true);
  readonly boletos = signal<Boleto[]>([]);
  readonly total = signal(0);

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / PAGE_SIZE)),
  );

  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos', route: '/proximos-estrenos' },
    { label: 'Cupones', route: '/cupones' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];

  constructor() {
    this.cargarContadores();

    effect(() => {
      const vista = this.filtroBoletos();
      const page = this.pagina();
      this.cargarPagina(vista, page);
    });
  }

  private cargarContadores() {
    this.misReservasSvc
      .list({ vista: 'proximos', limit: 1 })
      .subscribe((r) => this.countProximos.set(r.total));
    this.misReservasSvc
      .list({ vista: 'pasados', limit: 1 })
      .subscribe((r) => this.countPasados.set(r.total));
    this.misReservasSvc
      .list({ vista: 'cancelados', limit: 1 })
      .subscribe((r) => this.countCancelados.set(r.total));
  }

  private cargarPagina(vista: Filtro, page: number) {
    this.cargando.set(true);
    this.misReservasSvc
      .list({ vista, page, limit: PAGE_SIZE })
      .subscribe({
        next: (res) => {
          this.boletos.set(res.data);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: () => {
          this.boletos.set([]);
          this.total.set(0);
          this.cargando.set(false);
        },
      });
  }

  irCartelera() {
    this.router.navigate(['/']);
  }

  cambiarFiltro(filtro: Filtro) {
    if (filtro === this.filtroBoletos()) return;
    this.filtroBoletos.set(filtro);
    this.pagina.set(1);
  }

  cambiarVista(vista: Vista) {
    if (vista === 'perfil') {
      this.router.navigate(['/perfil']);
      return;
    }
    this.vistaActual.set(vista);
  }

  irPagina(p: number) {
    const total = this.totalPaginas();
    const clamped = Math.min(Math.max(1, p), total);
    if (clamped === this.pagina()) return;
    this.pagina.set(clamped);
  }

  toggleSeats(boletoId: string) {
    const next = new Set(this.seatsExpandidos());
    if (next.has(boletoId)) {
      next.delete(boletoId);
    } else {
      next.add(boletoId);
    }
    this.seatsExpandidos.set(next);
  }

  seatsAbiertos(boletoId: string): boolean {
    return this.seatsExpandidos().has(boletoId);
  }

  seatsPreview(boleto: Boleto): string {
    const cap = 4;
    const asientos = boleto.asientos;
    if (asientos.length <= cap) {
      return asientos.map((a) => a.codigo).join(' · ');
    }
    const visibles = asientos.slice(0, cap).map((a) => a.codigo).join(' · ');
    const restantes = asientos.length - cap;
    return `${visibles} +${restantes}`;
  }

  /** ¿La función de este boleto fue cancelada? */
  funcionCancelada(boleto: Boleto): boolean {
    return boleto.funcionEstado === 'cancelada';
  }

  puedeReenviar(boleto: Boleto): boolean {
    if (boleto.estado !== 'pagada') return false;
    if (this.funcionCancelada(boleto)) return false;
    return new Date(boleto.fecha_hora).getTime() > Date.now();
  }

  puedeDescargar(boleto: Boleto): boolean {
    return boleto.estado === 'pagada';
  }

  puedeCancelar(boleto: Boleto): boolean {
    if (boleto.estado !== 'pagada' && boleto.estado !== 'pendiente_pago') return false;
    if (this.funcionCancelada(boleto)) return false;
    return new Date(boleto.fecha_hora).getTime() > Date.now();
  }

  estadoLabel(estado: Boleto['estado']): string {
    switch (estado) {
      case 'pagada': return 'Pagada';
      case 'pendiente_pago': return 'Pendiente de pago';
      case 'cancelada': return 'Cancelada';
      case 'reembolsada': return 'Reembolsada';
      case 'expirada': return 'Expirada';
      default: return estado;
    }
  }

  metodoPagoLabel(boleto: Boleto): string {
    if (boleto.metodo === 'tarjeta') {
      if (boleto.ultimos4_snapshot) {
        return `${this.formatMarca(boleto.marca_snapshot)} •••• ${boleto.ultimos4_snapshot}`;
      }
      return 'Tarjeta';
    }
    if (boleto.metodo === 'efectivo') return 'Efectivo · taquilla';
    return 'Sin pago';
  }

  recargar(): void {
    this.cargarPagina(this.filtroBoletos(), this.pagina());
    this.cargarContadores();
  }

  onExpiradoBoleto(_id: string): void {
    this.recargar();
  }

  private formatMarca(marca: Boleto['marca_snapshot']): string {
    switch (marca) {
      case 'visa': return 'Visa';
      case 'master': return 'Mastercard';
      case 'amex': return 'Amex';
      case 'discover': return 'Discover';
      default: return 'Tarjeta';
    }
  }
}

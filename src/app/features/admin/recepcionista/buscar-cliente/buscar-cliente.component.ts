import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucideUserSearch,
  LucideMail,
  LucidePhone,
  LucideTicket,
  LucideX,
  LucideBan,
  LucideUsers,
  LucideUserCheck,
  LucideWallet,
} from '@lucide/angular';

import {
  Cliente,
  ClientesService,
} from '../../../../shared/services/clientes.service';
import {
  EstadoReserva,
  Reserva,
  ReservasService,
} from '../../../../shared/services/reservas.service';
import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';

@Component({
  selector: 'app-recepcionista-buscar-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminSidebarComponent,
    LucideSearch,
    LucideUserSearch,
    LucideMail,
    LucidePhone,
    LucideTicket,
    LucideX,
    LucideBan,
    LucideUsers,
    LucideUserCheck,
    LucideWallet,
  ],
  template: `
    <div class="admin-body">
      <app-admin-sidebar />
      <main class="admin-main">
        <div class="shell">
          <header class="topbar">
            <div class="crumb">
              <a routerLink="/admin">Admin</a>
              <span aria-hidden="true">·</span>
              <span class="crumb-current">Buscar cliente</span>
            </div>
            <div class="head-row">
              <div>
                <h1>Buscar cliente</h1>
                <p class="lead">
                  Localiza a un cliente para atenderlo en taquilla y revisar sus
                  reservas.
                </p>
              </div>
              <div class="stats">
                <span class="stat">
                  <svg lucideUsers [size]="15"></svg>
                  <b>{{ totalClientes() }}</b> clientes
                </span>
                <span class="stat ok">
                  <svg lucideUserCheck [size]="15"></svg>
                  <b>{{ activos() }}</b> activos
                </span>
                <span class="stat danger">
                  <svg lucideBan [size]="15"></svg>
                  <b>{{ bloqueados() }}</b> bloqueados
                </span>
              </div>
            </div>
          </header>

          <section class="search-wrap">
            <label class="search">
              <svg lucideSearch [size]="18"></svg>
              <input
                #q
                class="search-input"
                type="text"
                placeholder="Nombre, email, teléfono o #reserva…"
                autocomplete="off"
                [ngModel]="query()"
                (ngModelChange)="onQuery($event)"
              />
              @if (query()) {
                <button class="clear" (click)="clear(); q.focus()" aria-label="Limpiar">
                  <svg lucideX [size]="16"></svg>
                </button>
              }
            </label>
            <span class="hint">
              @if (matchedReserva(); as r) {
                Coincidencia exacta con reserva
                <strong>#{{ r.numero_reserva }}</strong>
              } @else if (hasQuery()) {
                {{ results().length }} coincidencia(s) para "{{ query() }}"
              } @else {
                Mostrando todos los clientes
              }
            </span>
          </section>

          <section class="split">
            <!-- Resultados -->
            <div class="results">
              <div class="panel-head">
                <span class="panel-title">
                  {{ hasQuery() ? 'Resultados' : 'Todos los clientes' }}
                </span>
                <span class="panel-count">{{ results().length }}</span>
              </div>

              @if (results().length === 0) {
                <div class="placeholder">
                  <svg lucideUserSearch [size]="26"></svg>
                  <p>Ningún cliente coincide con <strong>"{{ query() }}"</strong>.</p>
                </div>
              } @else {
                <ul class="res-list res-scroll">
                  @for (c of results(); track c.id) {
                    <li>
                      <button
                        class="res-item"
                        [class.on]="c.id === selectedId()"
                        (click)="select(c.id)"
                      >
                        <span class="avatar" [class.blocked]="c.estado === 'bloqueado'">
                          {{ initials(c.nombre) }}
                        </span>
                        <span class="res-main">
                          <span class="res-name">{{ c.nombre }}</span>
                          <span class="res-sub">{{ c.email }}</span>
                        </span>
                        @if (c.estado === 'bloqueado') {
                          <span class="mini-badge blocked">Bloqueado</span>
                        } @else {
                          <span class="mini-count">{{ c.num_reservas }} res.</span>
                        }
                      </button>
                    </li>
                  }
                </ul>
              }
            </div>

            <!-- Ficha del cliente -->
            <div class="detail">
              @if (selected(); as c) {
                <div class="ficha">
                  <div class="ficha-head" [class.is-blocked]="c.estado === 'bloqueado'">
                    <span class="avatar xl" [class.blocked]="c.estado === 'bloqueado'">
                      {{ initials(c.nombre) }}
                    </span>
                    <div class="ficha-id">
                      <h2>{{ c.nombre }}</h2>
                      <span
                        class="estado-badge"
                        [class.activo]="c.estado === 'activo'"
                        [class.bloqueado]="c.estado === 'bloqueado'"
                      >
                        {{ c.estado === 'activo' ? 'Activo' : 'Bloqueado' }}
                      </span>
                    </div>
                    <div class="ficha-quick">
                      <div class="qstat">
                        <span class="qnum">{{ selectedReservas().length }}</span>
                        <span class="qlbl">reservas</span>
                      </div>
                      <div class="qdiv"></div>
                      <div class="qstat">
                        <span class="qnum">{{ money(totalPagado()) }}</span>
                        <span class="qlbl">pagado</span>
                      </div>
                    </div>
                  </div>

                  <div class="ficha-body">
                    @if (c.estado === 'bloqueado') {
                      <div class="alert">
                        <svg lucideBan [size]="15"></svg>
                        <span>
                          Cliente bloqueado. No puede generar nuevas reservas en
                          taquilla.
                        </span>
                      </div>
                    }

                    <dl class="contact">
                      <div>
                        <dt><svg lucideMail [size]="14"></svg> Email</dt>
                        <dd>{{ c.email }}</dd>
                      </div>
                      <div>
                        <dt><svg lucidePhone [size]="14"></svg> Teléfono</dt>
                        <dd>{{ c.telefono || 'No registrado' }}</dd>
                      </div>
                    </dl>

                    <div class="res-head">
                      <h3><svg lucideTicket [size]="16"></svg> Reservas</h3>
                      @if (pendientes() > 0) {
                        <span class="por-cobrar">
                          <svg lucideWallet [size]="13"></svg>
                          {{ pendientes() }} por cobrar
                        </span>
                      }
                    </div>

                    @if (selectedReservas().length === 0) {
                      <p class="no-res">Este cliente no tiene reservas registradas.</p>
                    } @else {
                      <ul class="reservas">
                        @for (r of selectedReservas(); track r.id) {
                          <li class="reserva" [class.pendiente]="r.estado === 'pendiente_pago'">
                            <div class="r-top">
                              <span class="r-num">{{ r.numero_reserva }}</span>
                              <span class="estado-badge" [class]="'st-' + r.estado">
                                {{ estadoLabel(r.estado) }}
                              </span>
                            </div>
                            <div class="r-meta">
                              <span>{{ r.num_asientos }} {{ r.num_asientos === 1 ? 'asiento' : 'asientos' }}</span>
                              @if (r.asientos.length) {
                                <span class="r-seats">
                                  @for (a of r.asientos; track a.id) {
                                    <span class="seat-chip">{{ a.codigo }}</span>
                                  }
                                </span>
                              }
                              <span class="r-monto">{{ money(r.monto_total) }}</span>
                            </div>
                            <div class="r-foot">
                              <span class="r-date">{{ fmtDate(r.created_at) }}</span>
                              @if (r.estado === 'pendiente_pago') {
                                <a
                                  class="btn btn-sm primary"
                                  [routerLink]="['/admin/recepcionista/pago-efectivo', r.numero_reserva]"
                                >
                                  <svg lucideWallet [size]="13"></svg>
                                  Cobrar en taquilla
                                </a>
                              }
                            </div>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                </div>
              } @else {
                <div class="placeholder tall">
                  <span class="ph-mark"><svg lucideUserSearch [size]="28"></svg></span>
                  <p>Selecciona un cliente de la lista para ver su ficha y reservas.</p>
                </div>
              }
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styleUrl: './buscar-cliente.component.scss',
})
export class RecepcionistaBuscarClienteComponent {
  private clientesSvc = inject(ClientesService);
  private reservasSvc = inject(ReservasService);

  readonly query = signal('');
  readonly clientes = signal<Cliente[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly selectedId = signal<string | null>(null);

  readonly hasQuery = computed(() => this.query().trim().length > 0);

  readonly sortedClientes = computed(() =>
    [...this.clientes()].sort((a, b) => a.nombre.localeCompare(b.nombre)),
  );

  readonly results = computed(() => {
    const all = this.sortedClientes();
    if (!this.hasQuery()) return all;
    const q = this.query().trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');

    const reservaQuery = q.replace(/^#/, '');
    const usuariosPorReserva = new Set(
      this.reservas()
        .filter((r) => r.numero_reserva.toLowerCase().includes(reservaQuery))
        .map((r) => r.id_usuario),
    );

    return all.filter((c) => {
      if (c.nombre.toLowerCase().includes(q)) return true;
      if (c.email.toLowerCase().includes(q)) return true;
      if (qDigits && c.telefono) {
        if (c.telefono.replace(/\D/g, '').includes(qDigits)) return true;
      }
      return usuariosPorReserva.has(c.id);
    });
  });

  readonly matchedReserva = computed<Reserva | null>(() => {
    if (!this.hasQuery()) return null;
    const q = this.query().trim().toLowerCase().replace(/^#/, '');
    if (!q) return null;
    return (
      this.reservas().find((r) => r.numero_reserva.toLowerCase() === q) ?? null
    );
  });

  readonly totalClientes = computed(() => this.clientes().length);
  readonly activos = computed(
    () => this.clientes().filter((c) => c.estado === 'activo').length,
  );
  readonly bloqueados = computed(
    () => this.clientes().filter((c) => c.estado === 'bloqueado').length,
  );

  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? (this.clientes().find((c) => c.id === id) ?? null) : null;
  });

  readonly selectedReservas = computed(() => {
    const id = this.selectedId();
    if (!id) return [];
    return this.reservas()
      .filter((r) => r.id_usuario === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  });

  readonly pendientes = computed(
    () => this.selectedReservas().filter((r) => r.estado === 'pendiente_pago').length,
  );

  readonly totalPagado = computed(() =>
    this.selectedReservas()
      .filter((r) => r.estado === 'pagada')
      .reduce((sum, r) => sum + r.monto_total, 0),
  );

  constructor() {
    this.clientesSvc.list().subscribe((page) => this.clientes.set(page.data));
    this.reservasSvc.list().subscribe((data) => this.reservas.set(data));
  }

  onQuery(value: string) {
    this.query.set(value);
    const matched = this.matchedReserva();
    if (matched) {
      this.selectedId.set(matched.id_usuario);
      return;
    }
    const id = this.selectedId();
    if (id && !this.results().some((c) => c.id === id)) {
      this.selectedId.set(null);
    }
  }

  clear() {
    this.query.set('');
  }

  select(id: string) {
    this.selectedId.set(id);
  }

  initials(nombre: string): string {
    return nombre
      .split(' ')
      .filter((p) => p.length)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  estadoLabel(estado: EstadoReserva): string {
    switch (estado) {
      case 'pendiente_pago':
        return 'Pendiente de pago';
      case 'pagada':
        return 'Pagada';
      case 'cancelada':
        return 'Cancelada';
      case 'reembolsada':
        return 'Reembolsada';
      case 'expirada':
        return 'Expirada';
    }
  }

  money(n: number): string {
    return `L ${n.toLocaleString('es-HN')}`;
  }

  fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}

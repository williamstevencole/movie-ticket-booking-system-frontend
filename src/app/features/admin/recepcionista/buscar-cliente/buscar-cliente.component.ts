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

const MIN_CHARS = 2;
const MAX_RESULTS = 8;

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
            </div>
          </header>

          <section class="search-wrap">
            <label class="search">
              <svg lucideSearch [size]="18"></svg>
              <input
                #q
                class="search-input"
                type="text"
                placeholder="Nombre, email o teléfono…"
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
            @if (hasQuery()) {
              <span class="hint">{{ results().length }} coincidencia(s)</span>
            } @else {
              <span class="hint">Escribe al menos {{ MIN_CHARS }} caracteres</span>
            }
          </section>

          <section class="split">
            <!-- Resultados -->
            <div class="results">
              @if (!hasQuery()) {
                <div class="placeholder">
                  <svg lucideUserSearch [size]="26"></svg>
                  <p>Empieza a escribir para buscar.</p>
                </div>
              } @else if (results().length === 0) {
                <div class="placeholder">
                  <svg lucideUserSearch [size]="26"></svg>
                  <p>Ningún cliente coincide con <strong>"{{ query() }}"</strong>.</p>
                </div>
              } @else {
                <ul class="res-list">
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
                  <div class="ficha-head">
                    <span class="avatar lg" [class.blocked]="c.estado === 'bloqueado'">
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
                  </div>

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
                            @if (r.asientos_codigos?.length) {
                              <span class="r-seats">{{ r.asientos_codigos!.join(', ') }}</span>
                            }
                            <span class="r-monto">{{ money(r.monto_total) }}</span>
                          </div>
                          <div class="r-foot">
                            <span class="r-date">{{ fmtDate(r.created_at) }}</span>
                            @if (r.estado === 'pendiente_pago') {
                              <button class="btn btn-sm is-disabled" disabled title="Disponible en el módulo de pago en efectivo">
                                Cobrar en taquilla · próximamente
                              </button>
                            }
                          </div>
                        </li>
                      }
                    </ul>
                  }
                </div>
              } @else {
                <div class="placeholder tall">
                  <svg lucideUserSearch [size]="26"></svg>
                  <p>Selecciona un cliente para ver su ficha y reservas.</p>
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

  readonly MIN_CHARS = MIN_CHARS;

  readonly query = signal('');
  readonly clientes = signal<Cliente[]>([]);
  readonly reservas = signal<Reserva[]>([]);
  readonly selectedId = signal<string | null>(null);

  readonly hasQuery = computed(() => this.query().trim().length >= MIN_CHARS);

  readonly results = computed(() => {
    if (!this.hasQuery()) return [];
    const q = this.query().trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return this.clientes()
      .filter((c) => {
        if (c.nombre.toLowerCase().includes(q)) return true;
        if (c.email.toLowerCase().includes(q)) return true;
        if (qDigits && c.telefono) {
          return c.telefono.replace(/\D/g, '').includes(qDigits);
        }
        return false;
      })
      .slice(0, MAX_RESULTS);
  });

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

  constructor() {
    this.clientesSvc.list().subscribe((data) => this.clientes.set(data));
    this.reservasSvc.list().subscribe((data) => this.reservas.set(data));
  }

  onQuery(value: string) {
    this.query.set(value);
    // Si el cliente seleccionado deja de aparecer, limpia la selección.
    const id = this.selectedId();
    if (id && !this.results().some((c) => c.id === id)) {
      this.selectedId.set(null);
    }
  }

  clear() {
    this.query.set('');
    this.selectedId.set(null);
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

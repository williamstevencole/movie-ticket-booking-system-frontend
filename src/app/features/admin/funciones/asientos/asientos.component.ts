import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideRefreshCw } from '@lucide/angular';

import { AdminSidebarComponent } from '../../../../shared/components/admin-sidebar.component';
import { extractMessage } from '../../../../shared/utils/http-errors';
import {
  AdminAsientoMapaItem,
  AdminMapaAsientos,
  FuncionesService,
} from '../../../../shared/services/funciones.service';

@Component({
  selector: 'app-admin-funcion-asientos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    AdminSidebarComponent,
    LucideRefreshCw,
  ],
  templateUrl: './asientos.component.html',
  styleUrl: './asientos.component.scss',
})
export class AdminFuncionAsientosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly funcionesSvc = inject(FuncionesService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly mapa = signal<AdminMapaAsientos | null>(null);
  readonly hovered = signal<AdminAsientoMapaItem | null>(null);
  readonly selected = signal<AdminAsientoMapaItem | null>(null);

  funcionId = '';

  readonly filas = computed(() => {
    const m = this.mapa();
    if (!m) return [];
    const byFila = new Map<string, AdminAsientoMapaItem[]>();
    for (const a of m.asientos) {
      (byFila.get(a.fila) ?? byFila.set(a.fila, []).get(a.fila)!).push(a);
    }
    return Array.from(byFila.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letra, asientos]) => ({
        letra,
        asientos: asientos.sort((x, y) => x.columna - y.columna),
      }));
  });

  readonly tooltipItem = computed(() => this.selected() ?? this.hovered());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.funcionId = id;
    this.fetchMapa(id);
  }

  reload(): void {
    this.fetchMapa(this.funcionId);
  }

  onSeatClick(a: AdminAsientoMapaItem): void {
    this.selected.set(this.selected() === a ? null : a);
  }

  private fetchMapa(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.funcionesSvc.mapaAdmin(id).subscribe({
      next: (data) => {
        this.mapa.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(extractMessage(err));
        this.loading.set(false);
      },
    });
  }
}

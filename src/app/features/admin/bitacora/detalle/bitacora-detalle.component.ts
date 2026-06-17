import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { BitacoraService } from '../bitacora.service';
import { AuditLogDetail } from '../bitacora.types';
import { ENTITY_LABELS } from '../bitacora-labels';
import { DiffViewerComponent } from './diff-viewer.component';

type Modo = 'create' | 'delete' | 'update' | 'loading';

@Component({
  selector: 'app-admin-bitacora-detalle',
  standalone: true,
  imports: [CommonModule, DatePipe, DiffViewerComponent],
  templateUrl: './bitacora-detalle.component.html',
  styleUrl: './bitacora-detalle.component.scss',
})
export class BitacoraDetalleComponent {
  private svc = inject(BitacoraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly detail = signal<AuditLogDetail | null>(null);
  readonly loading = signal(true);

  readonly modo = computed<Modo>(() => {
    const d = this.detail();
    if (!d) return 'loading';
    const hasPrev = d.valor_anterior != null;
    const hasNext = d.valor_nuevo != null;
    if (!hasPrev && hasNext) return 'create';
    if (hasPrev && !hasNext) return 'delete';
    return 'update';
  });

  constructor() {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (!id) return;
      this.loading.set(true);
      this.detail.set(null);
      this.svc.getById(id).subscribe({
        next: (d) => {
          this.detail.set(d);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    });
  }

  entidadLabel(key: string | null | undefined): string {
    if (!key) return '—';
    return ENTITY_LABELS[key]?.entidad ?? key;
  }

  close() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }
}

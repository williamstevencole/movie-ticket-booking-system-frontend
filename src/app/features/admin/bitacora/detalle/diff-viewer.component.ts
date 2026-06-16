import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENTITY_LABELS } from '../bitacora-labels';

interface DiffRow {
  label: string;
  antes: unknown;
  despues: unknown;
}

@Component({
  selector: 'app-diff-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diff-viewer.component.html',
  styleUrls: ['./diff-viewer.component.scss'],
})
export class DiffViewerComponent {
  entidad = input<string | null>(null);
  valorAnterior = input<Record<string, unknown> | null>(null);
  valorNuevo = input<Record<string, unknown> | null>(null);

  readonly modo = computed<'create' | 'delete' | 'update' | 'none'>(() => {
    const a = this.valorAnterior();
    const n = this.valorNuevo();
    if (!a && n) return 'create';
    if (a && !n) return 'delete';
    if (a && n) return 'update';
    return 'none';
  });

  readonly rows = computed<DiffRow[]>(() => {
    const entidad = this.entidad();
    if (!entidad) return [];
    const labels = ENTITY_LABELS[entidad]?.campos ?? {};
    const a = this.valorAnterior();
    const n = this.valorNuevo();
    const m = this.modo();

    if (m === 'create') {
      return Object.entries(n ?? {}).map(([k, v]) => ({
        label: labels[k] ?? k,
        antes: undefined,
        despues: v,
      }));
    }
    if (m === 'delete') {
      return Object.entries(a ?? {}).map(([k, v]) => ({
        label: labels[k] ?? k,
        antes: v,
        despues: undefined,
      }));
    }
    if (m === 'update') {
      const allKeys = new Set([
        ...Object.keys(a ?? {}),
        ...Object.keys(n ?? {}),
      ]);
      const diff: DiffRow[] = [];
      for (const k of allKeys) {
        const av = (a as Record<string, unknown>)[k];
        const nv = (n as Record<string, unknown>)[k];
        if (!this.deepEqual(av, nv)) {
          diff.push({ label: labels[k] ?? k, antes: av, despues: nv });
        }
      }
      return diff;
    }
    return [];
  });

  formatValue(v: unknown): string {
    if (v === undefined || v === null) return '—';
    if (Array.isArray(v)) return '[' + v.join(', ') + ']';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      return (
        a.length === b.length && a.every((x, i) => this.deepEqual(x, b[i]))
      );
    }
    return false;
  }
}

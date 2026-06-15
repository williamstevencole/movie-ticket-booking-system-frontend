import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule, LucideChevronLeft, LucideChevronRight],
  template: `
    <div class="pager">
      <span class="range">
        {{ rangeFrom() }}–{{ rangeTo() }} de {{ total() }}
      </span>

      <div class="controls">
        <button
          class="page-btn"
          [disabled]="page() <= 1"
          (click)="goTo(page() - 1)"
          aria-label="Página anterior"
        >
          <svg lucideChevronLeft [size]="14"></svg>
        </button>

        @for (item of pageItems(); track $index) {
          @if (item === -1) {
            <span class="ellipsis">…</span>
          } @else {
            <button
              class="page-btn"
              [class.on]="item === page()"
              (click)="goTo(item)"
              [attr.aria-current]="item === page() ? 'page' : null"
            >{{ item }}</button>
          }
        }

        <button
          class="page-btn"
          [disabled]="page() >= totalPages()"
          (click)="goTo(page() + 1)"
          aria-label="Página siguiente"
        >
          <svg lucideChevronRight [size]="14"></svg>
        </button>
      </div>

      <label class="size">
        <span>Por página</span>
        <select [value]="pageSize()" (change)="onSizeChange($event)">
          @for (s of pageSizeOptions; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </label>
    </div>
  `,
  styleUrl: './pager.component.scss',
})
export class PagerComponent {
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly total = signal(0);

  readonly pageSizeOptions = [10, 20, 50];

  @Input({ required: true }) set value(v: { page: number; pageSize: number; total: number }) {
    this.page.set(v.page);
    this.pageSize.set(v.pageSize);
    this.total.set(v.total);
  }

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  readonly rangeFrom = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  readonly rangeTo = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );

  readonly pageItems = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items: number[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) items.push(-1);
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 1) items.push(-1);
    items.push(total);
    return items;
  });

  goTo(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.pageChange.emit(p);
  }

  onSizeChange(e: Event) {
    const size = Number((e.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(size);
  }
}

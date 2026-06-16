import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type PeriodPreset = '7d' | '30d' | 'mes' | 'custom';

export interface PeriodValue {
  preset: PeriodPreset;
  from: string; // 'YYYY-MM-DD'
  to: string;   // 'YYYY-MM-DD'
}

@Component({
  selector: 'app-period-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { display: inline-flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
    .preset-group {
      display: inline-flex;
      background: var(--bg);
      border: 1px solid var(--border-2);
      border-radius: var(--r);
      padding: 3px;
      gap: 2px;
    }
    .preset-chip {
      height: 36px;
      padding: 0 14px;
      border-radius: 6px;
      border: 0;
      background: transparent;
      color: var(--text-2);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 140ms var(--ease);
    }
    .preset-chip:hover { color: var(--text); }
    .preset-chip.on { background: var(--text); color: var(--bg); }
    .select-filter {
      height: 40px;
      padding: 0 12px;
      border-radius: var(--r);
      background: var(--bg);
      border: 1px solid var(--border-2);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .select-filter:hover { border-color: var(--text-3); }
    .select-filter:focus {
      outline: none;
      border-color: var(--red);
      box-shadow: 0 0 0 3px var(--red-soft);
    }
  `],
  template: `
    <div class="preset-group" role="tablist">
      <button class="preset-chip" [class.on]="value.preset === '7d'"
        (click)="setPreset('7d')">Últimos 7 días</button>
      <button class="preset-chip" [class.on]="value.preset === '30d'"
        (click)="setPreset('30d')">Últimos 30 días</button>
      <button class="preset-chip" [class.on]="value.preset === 'mes'"
        (click)="setPreset('mes')">Este mes</button>
      <button class="preset-chip" [class.on]="value.preset === 'custom'"
        (click)="setPreset('custom')">Personalizado</button>
    </div>
    @if (value.preset === 'custom') {
      <input type="date" class="select-filter" style="min-width:150px"
        [(ngModel)]="value.from" (ngModelChange)="emit()" />
      <input type="date" class="select-filter" style="min-width:150px"
        [(ngModel)]="value.to" (ngModelChange)="emit()" />
    }
  `,
})
export class PeriodPickerComponent implements OnInit {
  @Input() value: PeriodValue = { preset: '30d', from: '', to: '' };
  @Output() valueChange = new EventEmitter<PeriodValue>();

  ngOnInit() {
    if (!this.value.from || !this.value.to) {
      this.setPreset(this.value.preset);
    }
  }

  setPreset(preset: PeriodPreset) {
    const today = new Date();
    const to = this.fmt(today);
    let from = to;
    if (preset === '7d') from = this.fmt(this.addDays(today, -7));
    if (preset === '30d') from = this.fmt(this.addDays(today, -30));
    if (preset === 'mes') from = this.fmt(new Date(today.getFullYear(), today.getMonth(), 1));
    this.value = { preset, from, to };
    this.emit();
  }

  emit() { this.valueChange.emit({ ...this.value }); }

  private addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  private fmt(d: Date) { return d.toISOString().slice(0, 10); }
}

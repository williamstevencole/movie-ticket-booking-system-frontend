import { Component, output, signal, computed, OnInit } from '@angular/core';

export type DayChip = {
  date: Date;
  wd: string;
  num: string;
  mn: string;
  label: string;
};

const WD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MN = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'app-day-strip',
  standalone: true,
  template: `
    <div class="day-strip" role="listbox" aria-label="Seleccionar día">
      @for (d of days(); track d.label) {
        <button
          type="button"
          class="day"
          [class.on]="selectedLabel() === d.label"
          [class.today]="isToday(d.date)"
          role="option"
          [attr.aria-selected]="selectedLabel() === d.label"
          (click)="pick(d)"
        >
          <span class="wd">{{ d.wd }}</span>
          <span class="num">{{ d.num }}</span>
          <span class="mn">{{ d.mn }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './day-strip.component.scss',
})
export class DayStripComponent implements OnInit {
  readonly dayChange = output<Date>();

  readonly days = signal<DayChip[]>([]);
  readonly selectedLabel = signal('');

  readonly selectedDate = computed(() => {
    const label = this.selectedLabel();
    return this.days().find((d) => d.label === label)?.date ?? new Date();
  });

  ngOnInit(): void {
    const list = this.buildDays(9);
    this.days.set(list);
    const today = list.find((d) => this.isToday(d.date)) ?? list[0]!;
    this.selectedLabel.set(today.label);
    this.dayChange.emit(today.date);
  }

  pick(d: DayChip): void {
    this.selectedLabel.set(d.label);
    this.dayChange.emit(d.date);
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return (
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
    );
  }

  private buildDays(count: number): DayChip[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        date,
        wd: WD[date.getDay()]!,
        num: String(date.getDate()).padStart(2, '0'),
        mn: MN[date.getMonth()]!,
        label: date.toISOString().slice(0, 10),
      };
    });
  }
}

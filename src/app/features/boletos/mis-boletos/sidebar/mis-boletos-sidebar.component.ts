import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-boletos-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-boletos-sidebar.component.html',
  styleUrl: './mis-boletos-sidebar.component.scss',
})
export class MisBoletosSidebarComponent {
  @Input() userName = '';
  @Input() userEmail = '';
  @Input() countProximos = 0;
  @Input() countPasados = 0;
  @Input() countCancelados = 0;
  @Input() activeView: 'boletos' | 'reembolsos' | 'perfil' = 'boletos';

  @Output() viewChange = new EventEmitter<'boletos' | 'reembolsos' | 'perfil'>();

  get iniciales(): string {
    return this.userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Boleto } from '../../../shared/services/boletos.service';
import { PoliticaCancelacion } from '../../../shared/services/politicas-cancelacion.service';

@Component({
  selector: 'app-politicas-cancelacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.scss',
})
export class PoliticasComponent {
  constructor(private router: Router) {}

  @Input() boleto!: Boleto;
  @Input() politica: PoliticaCancelacion | null = null;

  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }

  continuarCancelacion() {
    this.router.navigate(['/cancelar', this.boleto.numero_reserva]);
  }
}

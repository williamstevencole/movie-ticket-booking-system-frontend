import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Input() boleto!: Boleto;
  @Input() politica: PoliticaCancelacion | null = null;
  @Input() cancelando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  cerrarModal() {
    if (this.cancelando) return;
    this.cerrar.emit();
  }

  continuarCancelacion() {
    if (this.cancelando) return;
    this.confirmar.emit();
  }
}

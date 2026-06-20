import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BoletoMock } from '../../../mocks/data/boletos.mock';

@Component({
  selector: 'app-politicas-cancelacion',
  standalone: true,
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.scss',
})
export class PoliticasComponent {
  constructor(private router: Router) {}

  @Input() boleto!: BoletoMock;

  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }

  continuarCancelacion() {
    this.router.navigate(['/cancelar', this.boleto.id]);
  }
}

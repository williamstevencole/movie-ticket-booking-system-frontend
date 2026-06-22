import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Boleto } from '../../../shared/services/boletos.service';

@Component({
  selector: 'app-politicas-cancelacion',
  standalone: true,
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.scss',
})
export class PoliticasComponent {
  constructor(private router: Router) {}

  @Input() boleto!: Boleto;

  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }

  continuarCancelacion() {
    this.router.navigate(['/cancelar', this.boleto.id]);
  }
}

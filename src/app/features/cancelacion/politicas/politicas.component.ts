import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-politicas-cancelacion',
  standalone: true,
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.scss',
})
export class PoliticasComponent {
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }
}

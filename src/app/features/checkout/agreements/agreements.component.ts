import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agreements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agreements.component.html',
  styleUrl: './agreements.component.scss',
})
export class AgreementsComponent {
  @Input() cinema = '';
  @Output() politicaAceptada = new EventEmitter<boolean>();
  @Output() recordatorios = new EventEmitter<boolean>();

  readonly aceptaPolitica = signal(false);
  readonly quiereRecordatorios = signal(false);

  onPolitica(v: boolean): void {
    this.aceptaPolitica.set(v);
    this.politicaAceptada.emit(v);
  }
  onRecordatorios(v: boolean): void {
    this.quiereRecordatorios.set(v);
    this.recordatorios.emit(v);
  }
}

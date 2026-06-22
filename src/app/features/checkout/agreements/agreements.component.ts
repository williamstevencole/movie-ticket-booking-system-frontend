import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-agreements',
  standalone: true,
  templateUrl: './agreements.component.html',
  styleUrl: './agreements.component.scss',
})

export class AgreementsComponent {

  @Input() visible = false;

  @Output() aceptar = new EventEmitter<void>();

  @Output() cerrar = new EventEmitter<void>();

  @Output() recordatorioCambio = new EventEmitter<boolean>();


  aceptado = false;

  recibirRecordatorios = false;


  toggle() {
    this.aceptado = !this.aceptado;
  }


  toggleRecordatorios() {

    this.recibirRecordatorios = !this.recibirRecordatorios;

    this.recordatorioCambio.emit(this.recibirRecordatorios);

  }


  confirmar() {

    if (!this.aceptado) return;

    this.aceptar.emit();

  }


  cerrarModal() {

    this.aceptado = false;

    this.recibirRecordatorios = false;

    this.cerrar.emit();

  }

}
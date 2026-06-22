import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type HistorialEstado = 'attended' | 'missed' | 'cancelled';
type HistorialItem = { id: string; pelicula: string; fecha: string; asientos: string; estado: HistorialEstado };

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss',
})
export class HistorialComponent {
  readonly items: HistorialItem[] = [
    { id: '1', pelicula: 'Dune: Parte Dos', fecha: '20 Jun 2026', asientos: 'C8', estado: 'attended' },
    { id: '2', pelicula: 'Oppenheimer', fecha: '12 Jun 2026', asientos: 'F4, F5', estado: 'missed' },
    { id: '3', pelicula: 'Barbie', fecha: '5 Jun 2026', asientos: 'H1', estado: 'cancelled' },
  ];

  etiquetaEstado(e: HistorialEstado): string {
    return e === 'attended' ? 'Asistida' : e === 'missed' ? 'No asistida' : 'Cancelada';
  }
}

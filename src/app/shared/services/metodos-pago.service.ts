import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type MetodoPagoTipo = 'tarjeta'; // expandir si hay más

export type MetodoPago = {
  id: string;
  id_usuario: string;
  tipo: MetodoPagoTipo;
  marca?: string;       // 'visa' | 'mastercard' | ...
  ultimos4?: string;    // '1234'
  expiracion?: string;  // 'MM/YY'
  titular?: string;
  predeterminado: boolean;
  created_at: string;
};

export type CrearMetodoPagoDto = {
  tipo: MetodoPagoTipo;
  numero: string;       // PAN raw, backend cifra
  expiracion: string;
  titular: string;
  predeterminado?: boolean;
};

let mockItems: MetodoPago[] = [
  {
    id: 'mp-1',
    id_usuario: 'me',
    tipo: 'tarjeta',
    marca: 'visa',
    ultimos4: '4242',
    expiracion: '08/27',
    titular: 'Juan Cliente',
    predeterminado: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mp-2',
    id_usuario: 'me',
    tipo: 'tarjeta',
    marca: 'mastercard',
    ultimos4: '8891',
    expiracion: '03/28',
    titular: 'Juan Cliente',
    predeterminado: false,
    created_at: new Date().toISOString(),
  },
];

function detectarMarca(numero: string): string {
  const n = numero.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (n.startsWith('5')) return 'mastercard';
  if (n.startsWith('3')) return 'amex';
  return 'otra';
}

@Injectable({ providedIn: 'root' })
export class MetodosPagoService {
  listar() {
    return of([...mockItems]).pipe(delay(120));
  }

  crear(dto: CrearMetodoPagoDto) {
    const nuevo: MetodoPago = {
      id: `mp-${Date.now()}`,
      id_usuario: 'me',
      tipo: dto.tipo,
      marca: detectarMarca(dto.numero),
      ultimos4: dto.numero.replace(/\s/g, '').slice(-4),
      expiracion: dto.expiracion,
      titular: dto.titular,
      predeterminado: !!dto.predeterminado,
      created_at: new Date().toISOString(),
    };
    if (nuevo.predeterminado) {
      mockItems = mockItems.map((i) => ({ ...i, predeterminado: false }));
    }
    mockItems = [...mockItems, nuevo];
    return of({ ...nuevo }).pipe(delay(120));
  }

  borrar(id: string) {
    mockItems = mockItems.filter((i) => i.id !== id);
    return of(undefined as void).pipe(delay(120));
  }

  marcarPredeterminado(id: string) {
    mockItems = mockItems.map((i) => ({ ...i, predeterminado: i.id === id }));
    const found = mockItems.find((i) => i.id === id) ?? mockItems[0]!;
    return of({ ...found }).pipe(delay(120));
  }

  // NOTE: actualizar() removed — backend does not support PATCH on update.
  // To update a card, delete and recreate it.
}

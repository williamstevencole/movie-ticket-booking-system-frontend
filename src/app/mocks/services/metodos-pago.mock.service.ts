/**
 * MockMetodosPagoService — kept for reference / test use.
 * No longer registered as a provider (MetodosPagoService is now a concrete HTTP class).
 */
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  MetodoPago,
  CrearMetodoPagoDto,
} from '../../shared/services/metodos-pago.service';

@Injectable()
export class MockMetodosPagoService {
  private items: MetodoPago[] = [
    {
      id: '1',
      id_usuario: '2',
      tipo: 'tarjeta',
      marca: 'visa',
      ultimos4: '4242',
      expiracion: '12/27',
      titular: 'Juan Cliente',
      predeterminado: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      id_usuario: '2',
      tipo: 'tarjeta',
      marca: 'mastercard',
      ultimos4: '8891',
      expiracion: '03/28',
      titular: 'Juan Cliente',
      predeterminado: false,
      created_at: new Date().toISOString(),
    },
  ];

  listar(): Observable<MetodoPago[]> {
    return of([...this.items]).pipe(delay(80));
  }

  crear(dto: CrearMetodoPagoDto): Observable<MetodoPago> {
    const id = String(Date.now());
    const mp: MetodoPago = {
      id,
      id_usuario: '2',
      tipo: dto.tipo,
      marca: this.detectarMarca(dto.numero),
      ultimos4: dto.numero.replace(/\s/g, '').slice(-4),
      expiracion: dto.expiracion,
      titular: dto.titular,
      predeterminado: !!dto.predeterminado || this.items.length === 0,
      created_at: new Date().toISOString(),
    };
    if (mp.predeterminado) {
      this.items.forEach((i) => (i.predeterminado = false));
    }
    this.items.push(mp);
    return of({ ...mp }).pipe(delay(120));
  }

  borrar(id: string): Observable<void> {
    this.items = this.items.filter((i) => i.id !== id);
    return of(void 0).pipe(delay(80));
  }

  marcarPredeterminado(id: string): Observable<MetodoPago> {
    this.items.forEach((i) => (i.predeterminado = i.id === id));
    const found = this.items.find((i) => i.id === id)!;
    return of({ ...found }).pipe(delay(80));
  }

  private detectarMarca(numero: string): string {
    const n = numero.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5')) return 'mastercard';
    return 'otra';
  }
}

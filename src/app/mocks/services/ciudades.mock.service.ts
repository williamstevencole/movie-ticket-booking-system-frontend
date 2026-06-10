import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Ciudad, CiudadesService } from '../../shared/services/ciudades.service';
import { MOCK_CIUDADES } from '../data/ciudades.mock';

const SIMULATED_LATENCY_MS = 120;

@Injectable()
export class MockCiudadesService extends CiudadesService {
  override list(): Observable<Ciudad[]> {
    return of(MOCK_CIUDADES).pipe(delay(SIMULATED_LATENCY_MS));
  }
}

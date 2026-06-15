import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Genero, GenerosService } from '../../shared/services/generos.service';
import { MOCK_GENEROS } from '../data/generos.mock';

@Injectable()
export class MockGenerosService extends GenerosService {
  override list(): Observable<Genero[]> {
    return of([...MOCK_GENEROS].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }
}

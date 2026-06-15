import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Idioma, IdiomasService } from '../../shared/services/idiomas.service';
import { MOCK_IDIOMAS } from '../data/idiomas.mock';

@Injectable()
export class MockIdiomasService extends IdiomasService {
  override list(): Observable<Idioma[]> {
    return of([...MOCK_IDIOMAS]);
  }
}

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SuscripcionesEstrenoService } from './suscripciones-estreno.service';

describe('SuscripcionesEstrenoService', () => {
  let svc: SuscripcionesEstrenoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SuscripcionesEstrenoService],
    });
    svc = TestBed.inject(SuscripcionesEstrenoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('hydrate llena el signal con las suscripciones del usuario', (done) => {
    svc.hydrate().subscribe(() => {
      expect(svc.estaSuscrito('10')).toBe(true);
      expect(svc.estaSuscrito('11')).toBe(true);
      expect(svc.estaSuscrito('12')).toBe(false);
      done();
    });
    http.expectOne('/api/me/suscripciones-estreno').flush(['10', '11']);
  });

  it('subscribe agrega al signal optimísticamente', (done) => {
    svc.subscribe('10').subscribe(() => done());
    expect(svc.estaSuscrito('10')).toBe(true);
    http.expectOne('/api/peliculas/10/suscripcion-estreno').flush({ subscribed: true });
  });

  it('subscribe revierte el signal si falla', (done) => {
    svc.subscribe('10').subscribe({
      error: () => {
        expect(svc.estaSuscrito('10')).toBe(false);
        done();
      },
    });
    http.expectOne('/api/peliculas/10/suscripcion-estreno').flush(
      { error: 'boom' }, { status: 500, statusText: 'Server Error' },
    );
  });

  it('unsubscribe quita del signal optimísticamente', (done) => {
    svc['_subscritas'].set(new Set(['10']));
    svc.unsubscribe('10').subscribe(() => done());
    expect(svc.estaSuscrito('10')).toBe(false);
    http.expectOne('/api/peliculas/10/suscripcion-estreno').flush({ subscribed: false });
  });
});

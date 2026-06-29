import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalificacionesService } from './calificaciones.service';

describe('CalificacionesService', () => {
  let service: CalificacionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CalificacionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GET /peliculas/:id/calificacion-mia', () => {
    let result: any;
    service.obtenerMia('42').subscribe(r => (result = r));

    const req = httpMock.expectOne('/api/peliculas/42/calificacion-mia');
    expect(req.request.method).toBe('GET');
    req.flush({ elegible: true, puntuacion: 4 });

    expect(result).toEqual({ elegible: true, puntuacion: 4 });
  });

  it('PATCH /peliculas/:id/calificacion con puntuacion en body', () => {
    let result: any;
    service.calificar('42', 5).subscribe(r => (result = r));

    const req = httpMock.expectOne('/api/peliculas/42/calificacion');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ puntuacion: 5 });
    req.flush({ puntuacion: 5, rating_promedio: 4.5, rating_count: 10 });

    expect(result.puntuacion).toBe(5);
  });

  it('DELETE /peliculas/:id/calificacion', () => {
    let result: any;
    service.borrar('42').subscribe(r => (result = r));

    const req = httpMock.expectOne('/api/peliculas/42/calificacion');
    expect(req.request.method).toBe('DELETE');
    req.flush({ rating_promedio: 4.4, rating_count: 9 });

    expect(result.rating_count).toBe(9);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReenvioBoletosService } from './reenvio-boletos.service';

describe('ReenvioBoletosService', () => {
  let svc: ReenvioBoletosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReenvioBoletosService],
    });
    svc = TestBed.inject(ReenvioBoletosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reenviarMio retorna ok cuando backend retorna { ok: true }', (done) => {
    svc.reenviarMio('RES-1').subscribe((r) => {
      expect(r).toEqual({ ok: true });
      done();
    });
    const req = http.expectOne('/api/me/reservas/RES-1/reenviar-boleto');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });

  it('reenviarMio mapea ok=false con retry_after a retryAfter', (done) => {
    svc.reenviarMio('RES-1').subscribe((r) => {
      expect(r).toEqual({ ok: false, retryAfter: 42 });
      done();
    });
    http.expectOne('/api/me/reservas/RES-1/reenviar-boleto').flush({ ok: false, retry_after: 42 });
  });

  it('reenviarComoAdmin pega a /admin/reservas/:id/reenviar-boleto', (done) => {
    svc.reenviarComoAdmin('99').subscribe(() => done());
    http.expectOne('/api/admin/reservas/99/reenviar-boleto').flush({ ok: true });
  });

  it('reenviarComprobanteReembolso pega al endpoint correcto', (done) => {
    svc.reenviarComprobanteReembolso('99').subscribe(() => done());
    http.expectOne('/api/admin/reservas/99/reenviar-comprobante-reembolso').flush({ ok: true });
  });
});

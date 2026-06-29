import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CountdownPagoComponent } from './countdown-pago.component';

describe('CountdownPagoComponent', () => {
  let fixture: ComponentFixture<CountdownPagoComponent>;
  let component: CountdownPagoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownPagoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownPagoComponent);
    component = fixture.componentInstance;
  });

  it('muestra mm:ss formateado cuando faltan 10 minutos', () => {
    component.expiraEn = new Date(Date.now() + 10 * 60_000);
    fixture.detectChanges();
    expect(component.display()).toBe('10:00');
    expect(component.estado()).toBe('ok');
  });

  it('estado=warn entre 1 y 5 minutos', () => {
    component.expiraEn = new Date(Date.now() + 3 * 60_000);
    fixture.detectChanges();
    expect(component.estado()).toBe('warn');
  });

  it('estado=danger debajo del último minuto', () => {
    component.expiraEn = new Date(Date.now() + 30_000);
    fixture.detectChanges();
    expect(component.estado()).toBe('danger');
  });

  it('emite (expirado) una sola vez al llegar a 0', fakeAsync(() => {
    component.expiraEn = new Date(Date.now() + 1500);
    const spy = jest.fn();
    component.expirado.subscribe(spy);
    fixture.detectChanges();

    tick(2000);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.estado()).toBe('expired');

    tick(2000);
    expect(spy).toHaveBeenCalledTimes(1);
  }));
});

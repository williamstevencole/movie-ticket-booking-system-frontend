import { Provider } from '@angular/core';

// CinesService is now concrete HTTP — no mock override needed
// CuponesService is now concrete HTTP — no mock override needed
// GenerosService and IdiomasService are now concrete @Injectable — no mock override needed
import { ReservasService } from '../../shared/services/reservas.service';
// PagosService and ReembolsosService are now concrete @Injectable — no mock override needed
// PoliticasCancelacionService is now concrete HTTP — no mock override needed
// TiposAsientoService is now concrete HTTP — no mock override needed
import { PreciosService } from '../../shared/services/precios.service';
import { UsuariosService } from '../../shared/services/usuarios.service';
// MetodosPagoService and CalificacionesService are now concrete @Injectable — no mock override needed

// MockCuponesService no longer registered (CuponesService is concrete HTTP)
// MockGenerosService and MockIdiomasService no longer registered (services are now concrete HTTP classes)
import { MockReservasService } from '../../mocks/services/reservas.mock.service';
// MockPagosService and MockReembolsosService no longer registered (services are now concrete HTTP classes)
// MockPoliticasCancelacionService no longer registered (PoliticasCancelacionService is concrete HTTP)
// MockTiposAsientoService no longer registered (TiposAsientoService is concrete HTTP)
import { MockPreciosService } from '../../mocks/services/precios.mock.service';
import { MockUsuariosService } from '../../mocks/services/usuarios.mock.service';
// MockMetodosPagoService and MockCalificacionesService no longer registered (services are now concrete HTTP classes)

export const dataProviders: Provider[] = [
  // CuponesService: concrete HTTP service, no mock override
  // GenerosService and IdiomasService: concrete HTTP services, no mock override
  // FuncionesService is now concrete HTTP — no mock override needed
  { provide: ReservasService, useClass: MockReservasService },
  // PagosService and ReembolsosService: concrete HTTP services, no mock override
  // PoliticasCancelacionService: concrete HTTP service, no mock override
  // TiposAsientoService: concrete HTTP service, no mock override
  { provide: PreciosService, useClass: MockPreciosService },
  { provide: UsuariosService, useClass: MockUsuariosService },
  // MetodosPagoService and CalificacionesService: concrete HTTP services, no mock override
];

import { Provider } from '@angular/core';

// CinesService is now concrete HTTP — no mock override needed
// CuponesService is now concrete HTTP — no mock override needed
// GenerosService and IdiomasService are now concrete @Injectable — no mock override needed
import { ReservasService } from '../../shared/services/reservas.service';
// PagosService and ReembolsosService are now concrete @Injectable — no mock override needed
// PoliticasCancelacionService is now concrete HTTP — no mock override needed
import { TiposAsientoService } from '../../shared/services/tipos-asiento.service';
import { PreciosService } from '../../shared/services/precios.service';
// UsuariosService are now concrete @Injectable - no mock override needed
// MetodosPagoService and CalificacionesService are now concrete @Injectable — no mock override needed

// MockCuponesService no longer registered (CuponesService is concrete HTTP)
// MockGenerosService and MockIdiomasService no longer registered (services are now concrete HTTP classes)
import { MockReservasService } from '../../mocks/services/reservas.mock.service';
// MockPagosService and MockReembolsosService no longer registered (services are now concrete HTTP classes)
// MockPoliticasCancelacionService no longer registered (PoliticasCancelacionService is concrete HTTP)
import { MockTiposAsientoService } from '../../mocks/services/tipos-asiento.mock.service';
import { MockPreciosService } from '../../mocks/services/precios.mock.service';
// MockUsuariosService no longer regsitered (services are now concrete HTTP classes)
// MockMetodosPagoService and MockCalificacionesService no longer registered (services are now concrete HTTP classes)

export const dataProviders: Provider[] = [
  // CuponesService: concrete HTTP service, no mock override
  // GenerosService and IdiomasService: concrete HTTP services, no mock override
  // FuncionesService is now concrete HTTP — no mock override needed
  { provide: ReservasService, useClass: MockReservasService },
  // PagosService and ReembolsosService: concrete HTTP services, no mock override
  // PoliticasCancelacionService: concrete HTTP service, no mock override
  { provide: TiposAsientoService, useClass: MockTiposAsientoService },
  { provide: PreciosService, useClass: MockPreciosService },
  // UsuariosService: concrete HTTP services, no mock override
  // MetodosPagoService and CalificacionesService: concrete HTTP services, no mock override
];

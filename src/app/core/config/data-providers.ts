import { Provider } from '@angular/core';

// CinesService is now concrete HTTP — no mock override needed
import { CuponesService } from '../../shared/services/cupones.service';
// GenerosService and IdiomasService are now concrete @Injectable — no mock override needed
import { ReservasService } from '../../shared/services/reservas.service';
// PagosService and ReembolsosService are now concrete @Injectable — no mock override needed
import { PoliticasCancelacionService } from '../../shared/services/politicas-cancelacion.service';
import { TiposAsientoService } from '../../shared/services/tipos-asiento.service';
import { PreciosService } from '../../shared/services/precios.service';
import { UsuariosService } from '../../shared/services/usuarios.service';
// MetodosPagoService and CalificacionesService are now concrete @Injectable — no mock override needed

import { MockCuponesService } from '../../mocks/services/cupones.mock.service';
// MockGenerosService and MockIdiomasService no longer registered (services are now concrete HTTP classes)
import { MockReservasService } from '../../mocks/services/reservas.mock.service';
// MockPagosService and MockReembolsosService no longer registered (services are now concrete HTTP classes)
import { MockPoliticasCancelacionService } from '../../mocks/services/politicas-cancelacion.mock.service';
import { MockTiposAsientoService } from '../../mocks/services/tipos-asiento.mock.service';
import { MockPreciosService } from '../../mocks/services/precios.mock.service';
import { MockUsuariosService } from '../../mocks/services/usuarios.mock.service';
// MockMetodosPagoService and MockCalificacionesService no longer registered (services are now concrete HTTP classes)

export const dataProviders: Provider[] = [
  { provide: CuponesService, useClass: MockCuponesService },
  // GenerosService and IdiomasService: concrete HTTP services, no mock override
  // FuncionesService is now concrete HTTP — no mock override needed
  { provide: ReservasService, useClass: MockReservasService },
  // PagosService and ReembolsosService: concrete HTTP services, no mock override
  { provide: PoliticasCancelacionService, useClass: MockPoliticasCancelacionService },
  { provide: TiposAsientoService, useClass: MockTiposAsientoService },
  { provide: PreciosService, useClass: MockPreciosService },
  { provide: UsuariosService, useClass: MockUsuariosService },
  // MetodosPagoService and CalificacionesService: concrete HTTP services, no mock override
];

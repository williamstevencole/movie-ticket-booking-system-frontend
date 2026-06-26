import { Provider } from '@angular/core';

import { ReservasService } from '../../shared/services/reservas.service';
import { PreciosService } from '../../shared/services/precios.service';
import { UsuariosService } from '../../shared/services/usuarios.service';

import { MockReservasService } from '../../mocks/services/reservas.mock.service';
import { MockPreciosService } from '../../mocks/services/precios.mock.service';
import { MockUsuariosService } from '../../mocks/services/usuarios.mock.service';

export const dataProviders: Provider[] = [
  { provide: ReservasService, useClass: MockReservasService },
  { provide: PreciosService, useClass: MockPreciosService },
  { provide: UsuariosService, useClass: MockUsuariosService },
];

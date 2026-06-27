import { Provider } from '@angular/core';

import { ReservasService } from '../../shared/services/reservas.service';
import { PreciosService } from '../../shared/services/precios.service';

import { MockReservasService } from '../../mocks/services/reservas.mock.service';
import { MockPreciosService } from '../../mocks/services/precios.mock.service';

export const dataProviders: Provider[] = [
  { provide: ReservasService, useClass: MockReservasService },
  { provide: PreciosService, useClass: MockPreciosService },
];

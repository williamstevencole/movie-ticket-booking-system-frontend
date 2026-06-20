import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MOCK_BOLETOS, BoletoMock } from '../../../mocks/data/boletos.mock';
import { AppbarComponent } from '../../../shared/components/appbar/appbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-cancelar',
  standalone: true,
  imports: [CommonModule, AppbarComponent, FooterComponent],
  templateUrl: './cancelar.component.html',
  styleUrl: './cancelar.component.scss',
})
export class CancelarComponent implements OnInit {


  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {}


  readonly nav = [
    { label: 'Cartelera', route: '/' },
    { label: 'Próximos estrenos' },
    { label: 'Promociones' },
    { label: 'Cines' },
    { label: 'Mis boletos', route: '/mis-boletos', active: true },
  ];


  id!: string;

  reserva!: BoletoMock;

  cancelado = false;


  ngOnInit() {

    this.id = this.route.snapshot.paramMap.get('id')!;

    console.log('Cancelando reserva:', this.id);


    this.reserva = MOCK_BOLETOS.find(
      b => b.id === this.id
    )!;

  }


  confirmarCancelacion() {

    // aquí después va el backend
    console.log('Cancelando:', this.reserva.id);


    this.cancelado = true;


    setTimeout(() => {
      this.volverBoletos();
    }, 2000);

  }


  volver() {
    this.location.back();
  }


  volverBoletos() {
    this.router.navigate(['/mis-boletos']);
  }

}
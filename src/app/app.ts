import { Component, signal } from '@angular/core';
import { EstadoDeVacunacion } from "./estado-de-vacunacion/estado-de-vacunacion";
import { AreaPrivada } from "./area-privada/area-privada";
import { Registracion } from "./registracion/registracion";


@Component({
  selector: 'app-root',
  imports: [EstadoDeVacunacion, AreaPrivada, Registracion],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('Gestión de vacunas');

  
  
}

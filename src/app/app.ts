import { Component, OnInit, signal } from '@angular/core';
import { EstadoDeVacunacion } from "./estado-de-vacunacion/estado-de-vacunacion";
import { AreaPrivada } from "./area-privada/area-privada";
import { Registracion } from "./registracion/registracion";
import { AuthService } from './services/auth.service';
import { RouterOutlet, Router } from '@angular/router';  



@Component({
  selector: 'app-root',
  imports: [EstadoDeVacunacion, AreaPrivada, Registracion, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {

  protected readonly title = signal('Gestión de vacunas');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  ngOnInit() {
    // Verificar el estado de autenticación al iniciar la app
    this.authService.user$.subscribe(user => {
      if (user) {
        // Si hay usuario autenticado y estamos en login, redirigir al área privada
        if (this.router.url === '/login' || this.router.url === '/') {
          this.router.navigate(['/area-privada']);
        }
      } else {
        // Si no hay usuario y no estamos en login, redirigir al login
        if (this.router.url !== '/login') {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
//import { EstadoDeVacunacion } from "./estado-de-vacunacion/estado-de-vacunacion";
//import { AreaPrivada } from "./area-privada/area-privada";
//import { Registracion } from "./registracion/registracion";
import { AuthService } from './services/auth.service';
import { RouterOutlet, Router } from '@angular/router';  
import { Subscription, take } from 'rxjs';
import { ToastComponent } from './toast/toast';
import { PushNotification } from './services/push-notification';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {

  protected readonly title = signal('Gestión de vacunas');
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private pushNotification: PushNotification
  ) {}

  async ngOnInit() {
    await this.pushNotification.initPushNotifications();
    // Verificar el estado de autenticación al iniciar la app
    this.authSubscription = this.authService.user$.pipe(
      take(1)
    ).subscribe(user => {
      const currentUrl = this.router.url;

      if (user && (currentUrl === '/login' || currentUrl === '/')) {
          this.router.navigate(['/area-privada']);
      } else if (!user && currentUrl !== '/login') {
          this.router.navigate(['/login']);
        }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}
import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('../app/registracion/registracion').then(m => m.Registracion),
    canActivate: [loginGuard]
  },
  {
    path: 'area-privada',
    loadComponent: () => import('./area-privada/area-privada').then(m => m.AreaPrivada),
    canActivate: [authGuard],
    children: [
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil').then(m => m.Perfil)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario-de-vacunas/calendario-de-vacunas').then(m => m.CalendarioDeVacunas)
      },
      {
        path: 'estado',
        loadComponent: () => import('./estado-de-vacunacion/estado-de-vacunacion').then(m => m.EstadoDeVacunacion)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./contacto/contacto').then(m => m.Contacto)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
]
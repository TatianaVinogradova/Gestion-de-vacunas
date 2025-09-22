import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './services/auth.guard';
import { Perfil } from './perfil/perfil';
import { Persona } from './area-privada/persona.model';
import { Registracion } from '../app/registracion/registracion';


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
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  },

  {
    path: 'perfil',
    loadComponent: () => import('../app/perfil/perfil').then(m => m.Perfil),
    canActivate: []
  },

]

export class appRoutes {}
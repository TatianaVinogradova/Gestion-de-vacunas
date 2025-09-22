import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EstadoDeVacunacion } from './estado-de-vacunacion/estado-de-vacunacion';
import { AreaPrivada } from './area-privada/area-privada';
import { CalendarioDeVacunas } from './calendario-de-vacunas/calendario-de-vacunas';
import { Contacto } from './contacto/contacto';
import { Perfil } from './perfil/perfil';
import { Registracion } from './registracion/registracion';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { PersonaService } from './services/persona.service';
import { EstadoSaludService } from './estado-de-vacunacion/estado-salud.service';
import { DatePipe } from '@angular/common';

const appRoutes:Routes=[
  {path:'', redirectTo: 'login', pathMatch: 'full'},
  {path:'calendario-de-vacunas', component: CalendarioDeVacunas}, 
  {path:'area-privada', component: AreaPrivada},
  {path:'contacto', component: Contacto},
  {path: 'perfil', component: Perfil},
  {path: '**', redirectTo: 'login'},
  {path: 'registracion', component: Registracion},
  {path: 'estado-de-vacunacion', component: EstadoDeVacunacion},
  {path: 'estado-salud', component: EstadoSaludService},

  
  
  ];

@NgModule({
  declarations: [
    Perfil,
    AreaPrivada,
    CalendarioDeVacunas,
    Registracion,
    Contacto,
    EstadoDeVacunacion
    
    
    
],
  imports: [
    BrowserModule,
    FormsModule,
    NgModule,
    CommonModule,
    RouterModule.forRoot(appRoutes)
],
  providers: [
    AuthService,
    PersonaService,
    EstadoSaludService,
    DatePipe
  ],
  bootstrap: [
    App
],
})
export class AppModule {}
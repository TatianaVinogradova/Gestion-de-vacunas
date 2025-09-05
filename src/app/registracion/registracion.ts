import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registracion',
  imports: [CommonModule],
  templateUrl: './registracion.html',
  styleUrls: ['./registracion.scss']
})
export class Registracion {
  titulo_reg = 'Registro de Usario:';
  mensaje_reg="";
  registrado=false;
  

  
  registrarUsuario() {
    this.registrado=true

    this.mensaje_reg="Usuario registrado con èxito"
  }
}

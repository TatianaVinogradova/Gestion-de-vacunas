import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Persona } from './persona.model';


@Component({
  selector: 'app-area-privada',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './area-privada.html',
  styleUrls: ['./area-privada.scss']
})
export class AreaPrivada implements OnInit {
  mensaje_guard="";
  guardado=false;

  areaPrivada:Persona[]=[
    { nombre: "Tatiana", edad: "35", altura: "165", peso: "58" },
    { nombre: "Sofía", edad: "10", altura: "130", peso: "25" },
  ];


  cuadroNombre:string="";
  cuadroEdad:string="";
  cuadroAltura:string="";
  cuadroPeso:string="";


  constructor() {
    
  }

  ngOnInit(): void {
  }

  guardarCambios(){
    this.guardado=true
    this.mensaje_guard="Cambios guardados con èxito"
    
    // Crear nueva persona a partir de los inputs
    const miCambios: Persona = {
      nombre: this.cuadroNombre,
      edad: this.cuadroEdad,
      altura: this.cuadroAltura,
      peso: this.cuadroPeso
    };

    // Agregar a la lista
    this.areaPrivada.push(miCambios);

    // Resetear inputs
    this.cuadroNombre = "";
    this.cuadroEdad = "";
    this.cuadroAltura = "";
    this.cuadroPeso = "";
  }
}
  
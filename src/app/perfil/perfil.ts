import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Persona } from '../area-privada/persona.model';
import { PersonaService } from '../services/persona.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  personas: Persona[] = [];
  personaSeleccionada: Persona | null = null;
  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  personaForm: Persona = new Persona();

  constructor(private personaService: PersonaService) {}

  ngOnInit() {
    this.personaService.personas$.subscribe(personas => {
      this.personas = personas;
  });
  this.personaService.personaSeleccionada$.subscribe(persona => {
    this.personaSeleccionada = persona;
  });
}
  seleccionarPersona(persona: Persona) {
    this.personaService.seleccionarPersona(persona);
    this.mostrarFormulario=false;
  }
  nuevaPersona() {
    this.personaForm = new Persona();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.personaService.deseleccionarPersona();
  }
  editarPersona() {
    if (this.personaSeleccionada) {
      this.personaForm = { ...this.personaSeleccionada };
      this.modoEdicion = true;
      this.mostrarFormulario = true;
    }
  }
  guardarPersona() {
    if (!this.personaForm.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (this.modoEdicion && this.personaForm.id) {
      this.personaService.actualizarPersona(this.personaForm);
      this.personaService.seleccionarPersona(this.personaForm);
    } else {
      this.personaService.añadirPersona(this.personaForm);
    }

    this.mostrarFormulario = false;
    this.personaForm = new Persona();
  }
  eliminarPersona(event: Event, id: string) {
    event.stopPropagation(); // Evitar que se seleccione la persona al eliminar
    
    if (confirm('¿Estás seguro de que quieres eliminar esta persona?')) {
      this.personaService.eliminarPersona(id);
    }
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.personaForm = new Persona();
    this.modoEdicion = false;
  }
}

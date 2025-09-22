import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonaService } from '../services/persona.service';
import { EstadoSaludService } from './estado-salud.service';
import { Persona } from '../area-privada/persona.model';
import { EstadoVacunacion, Vacuna } from './vacuna.model';
import { DocumentUploaderComponent } from './doocument-uploader';

@Component({
  selector: 'app-estado-de-vacunacion',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DocumentUploaderComponent],
  templateUrl: './estado-de-vacunacion.html',
  styleUrls: ['./estado-de-vacunacion.scss']
})
export class EstadoDeVacunacion implements OnInit {
  personas: Persona[] = [];
  personaSeleccionada: Persona | null = null;
  estadoActual: EstadoVacunacion | null = null;
  segmentosGrafico: any[] = [];
  estadisticasGlobales: any = {};
  mostrarCargadorDocumentos: boolean = false;

  constructor(
    private personaService: PersonaService,
    private estadoSaludService: EstadoSaludService
  ) {}

  ngOnInit() {
    // Cargar personas
    this.personaService.personas$.subscribe(personas => {
      this.personas = personas;
      if (personas.length > 0 && !this.personaSeleccionada) {
        this.seleccionarPersona(personas[0]);
      }
      this.actualizarEstadisticasGlobales();
    });

    // Escuchar cambios en estados de vacunación
    this.estadoSaludService.estados$.subscribe(() => {
      this.actualizarEstadisticasGlobales();
      if (this.personaSeleccionada) {
        this.cargarEstadoPersona();
      }
    });
  }

  seleccionarPersona(persona: Persona) {
    this.personaSeleccionada = persona;
    this.cargarEstadoPersona();
  }

  cargarEstadoPersona() {
    if (this.personaSeleccionada?.id) {
      this.estadoActual = this.estadoSaludService.obtenerEstadoPorPersona(this.personaSeleccionada.id);
      this.generarSegmentosGrafico();
    }
  }

  obtenerPorcentaje(personaId: string): number {
    const estado = this.estadoSaludService.obtenerEstadoPorPersona(personaId);
    return estado.calcularPorcentaje();
  }

  toggleVacuna(vacuna: Vacuna) {
    vacuna.aplicada = !vacuna.aplicada;
    const fecha = vacuna.aplicada ? new Date() : undefined;
    
    if (this.personaSeleccionada?.id && vacuna.id) {
      this.estadoSaludService.actualizarVacuna(
        this.personaSeleccionada.id, 
        vacuna.id, 
        vacuna.aplicada, 
        fecha
      );
    }
    
    this.generarSegmentosGrafico();
  }

  actualizarFecha(vacuna: Vacuna, event: any) {
    const fecha = new Date(event.target.value);
    if (this.personaSeleccionada?.id && vacuna.id) {
      this.estadoSaludService.actualizarVacuna(
        this.personaSeleccionada.id,
        vacuna.id,
        vacuna.aplicada,
        fecha
      );
    }
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  generarSegmentosGrafico() {
    if (!this.estadoActual) return;
    
    const totalVacunas = this.estadoActual.vacunas.length;
    const anguloPorSegmento = (2 * Math.PI) / totalVacunas;
    const radio = 80;
    const centroX = 100;
    const centroY = 100;

    this.segmentosGrafico = this.estadoActual.vacunas.map((vacuna, index) => {
      const anguloInicio = index * anguloPorSegmento - Math.PI / 2;
      const anguloFin = (index + 1) * anguloPorSegmento - Math.PI / 2;

      const x1 = centroX + radio * Math.cos(anguloInicio);
      const y1 = centroY + radio * Math.sin(anguloInicio);
      const x2 = centroX + radio * Math.cos(anguloFin);
      const y2 = centroY + radio * Math.sin(anguloFin);

      const radioInterno = 60;
      const x3 = centroX + radioInterno * Math.cos(anguloFin);
      const y3 = centroY + radioInterno * Math.sin(anguloFin);
      const x4 = centroX + radioInterno * Math.cos(anguloInicio);
      const y4 = centroY + radioInterno * Math.sin(anguloInicio);

      const path = `M ${x1} ${y1} A ${radio} ${radio} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${radioInterno} ${radioInterno} 0 0 0 ${x4} ${y4} Z`;

      // Posición del texto
      const anguloTexto = (anguloInicio + anguloFin) / 2;
      const radioTexto = 70;
      const textX = centroX + radioTexto * Math.cos(anguloTexto);
      const textY = centroY + radioTexto * Math.sin(anguloTexto);

      return {
        path,
        aplicada: vacuna.aplicada,
        nombre: vacuna.nombre,
        textX,
        textY
      };
    });
  }

  actualizarEstadisticasGlobales() {
    this.estadisticasGlobales = this.estadoSaludService.obtenerEstadisticasGlobales();
  }

  mostrarCargador() {
    this.mostrarCargadorDocumentos = true;
  }
  cerrarCargador() {
    this.mostrarCargadorDocumentos = false;
  }
  onVacunasActualizadas() {
    // Actualizar el estado cuando se cargan vacunas desde documento
    this.actualizarEstadisticasGlobales();
    if (this.personaSeleccionada) {
      this.cargarEstadoPersona();
    }
    this.cerrarCargador();
  }
}
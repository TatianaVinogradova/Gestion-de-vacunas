import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EstadoVacunacion, Vacuna } from './vacuna.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoSaludService {
  private estadosVacunacion: EstadoVacunacion[] = [];
  private estadosSubject = new BehaviorSubject<EstadoVacunacion[]>([]);
  public estados$ = this.estadosSubject.asObservable();

  constructor() {
    this.cargarEstados();
  }

  private cargarEstados() {
    const estadosGuardados = localStorage.getItem('estados_vacunacion');
    if (estadosGuardados) {
      const estadosData = JSON.parse(estadosGuardados);
      this.estadosVacunacion = estadosData.map((estado: any) => {
        const nuevoEstado = new EstadoVacunacion(estado.personaId);
        nuevoEstado.vacunas = estado.vacunas.map((vacuna: any) => new Vacuna(vacuna));
        nuevoEstado.porcentajeCompletado = estado.porcentajeCompletado;
        return nuevoEstado;
      });
      this.estadosSubject.next([...this.estadosVacunacion]);
    }
  }

  private guardarEstados() {
    localStorage.setItem('estados_vacunacion', JSON.stringify(this.estadosVacunacion));
    this.estadosSubject.next([...this.estadosVacunacion]);
  }

  obtenerEstadoPorPersona(personaId: string): EstadoVacunacion {
    let estado = this.estadosVacunacion.find(e => e.personaId === personaId);
    
    if (!estado) {
      estado = new EstadoVacunacion(personaId);
      this.estadosVacunacion.push(estado);
      this.guardarEstados();
    }
    
    return estado;
  }

  actualizarVacuna(personaId: string, vacunaId: string, aplicada: boolean, fechaAplicacion?: Date) {
    const estado = this.obtenerEstadoPorPersona(personaId);
    const vacuna = estado.vacunas.find(v => v.id === vacunaId);
    
    if (vacuna) {
      vacuna.aplicada = aplicada;
      if (aplicada && fechaAplicacion) {
        vacuna.fechaAplicacion = fechaAplicacion;
      } else {
        vacuna.fechaAplicacion = undefined;
      }
      
      estado.calcularPorcentaje();
      this.guardarEstados();
    }
  }

  eliminarEstadoPersona(personaId: string) {
    this.estadosVacunacion = this.estadosVacunacion.filter(e => e.personaId !== personaId);
    this.guardarEstados();
  }

  obtenerEstadisticasGlobales() {
    const totalPersonas = this.estadosVacunacion.length;
    const totalVacunas = this.estadosVacunacion.reduce((sum, estado) => sum + estado.vacunas.length, 0);
    const vacunasAplicadas = this.estadosVacunacion.reduce(
      (sum, estado) => sum + estado.vacunas.filter(v => v.aplicada).length, 0
    );
    
    return {
      totalPersonas,
      totalVacunas,
      vacunasAplicadas,
      porcentajeGlobal: totalVacunas > 0 ? Math.round((vacunasAplicadas / totalVacunas) * 100) : 0
    };
  }
}
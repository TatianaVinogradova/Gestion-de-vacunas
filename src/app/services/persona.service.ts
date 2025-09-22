import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Persona } from '../area-privada/persona.model';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private personas: Persona[] = [];
  private personasSubject = new BehaviorSubject<Persona[]>([]);
  public personas$ = this.personasSubject.asObservable();

  private personaSeleccionadaSubject = new BehaviorSubject<Persona | null>(null);
  public personaSeleccionada$ = this.personaSeleccionadaSubject.asObservable();

  constructor() {
    // Cargar datos del localStorage si existen
    this.cargarPersonas();
  }

  private cargarPersonas() {
    const personasGuardadas = localStorage.getItem('personas_familia');
    if (personasGuardadas) {
      this.personas = JSON.parse(personasGuardadas);
      this.personasSubject.next([...this.personas]);
    }
  }

  private guardarPersonas() {
    localStorage.setItem('personas_familia', JSON.stringify(this.personas));
    this.personasSubject.next([...this.personas]);
  }

  obtenerPersonas(): Persona[] {
    return [...this.personas];
  }

  añadirPersona(persona: Persona): void {
    // Generar un ID único simple
    const nuevaPersona = { 
      ...persona, 
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    this.personas.push(nuevaPersona);
    this.guardarPersonas();
  }

  actualizarPersona(personaActualizada: Persona): void {
    const index = this.personas.findIndex(p => p.id === personaActualizada.id);
    if (index !== -1) {
      this.personas[index] = { ...personaActualizada };
      this.guardarPersonas();
    }
  }

  eliminarPersona(id: string): void {
    this.personas = this.personas.filter(p => p.id !== id);
    this.guardarPersonas();
    
    // Si la persona eliminada era la seleccionada, deseleccionar
    const personaSeleccionada = this.personaSeleccionadaSubject.value;
    if (personaSeleccionada && personaSeleccionada.id === id) {
      this.personaSeleccionadaSubject.next(null);
    }
  }

  seleccionarPersona(persona: Persona): void {
    this.personaSeleccionadaSubject.next(persona);
  }

  obtenerPersonaSeleccionada(): Persona | null {
    return this.personaSeleccionadaSubject.value;
  }

  deseleccionarPersona(): void {
    this.personaSeleccionadaSubject.next(null);
  }
}
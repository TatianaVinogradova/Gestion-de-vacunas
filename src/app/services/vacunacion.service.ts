import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

export interface Vacuna {
  nombre: string;
  aplicada: boolean;
  fechaAplicacion?: Date;
  lote?: string;
  proximaDosis?: Date;
}

export interface Persona {
  id?: string;
  nombre: string;
  fechaNacimiento: Date;
  parentesco: string;
  userId: string;
}

export interface EstadoVacunacion {
  personaId: string;
  vacunas: Vacuna[];
  porcentajeCompletado: number;
  ultimaActualizacion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VacunacionService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private estadosSubject = new BehaviorSubject<Map<string, EstadoVacunacion>>(new Map());
  public estados$ = this.estadosSubject.asObservable();

  // Lista de vacunas oficiales según edad
  private vacunasOficiales: Vacuna[] = [
    { nombre: 'BCG', aplicada: false },
    { nombre: 'Hepatitis B', aplicada: false },
    { nombre: 'Pentavalente (1ra dosis)', aplicada: false },
    { nombre: 'Pentavalente (2da dosis)', aplicada: false },
    { nombre: 'Pentavalente (3ra dosis)', aplicada: false },
    { nombre: 'Polio (1ra dosis)', aplicada: false },
    { nombre: 'Polio (2da dosis)', aplicada: false },
    { nombre: 'Polio (3ra dosis)', aplicada: false },
    { nombre: 'Rotavirus (1ra dosis)', aplicada: false },
    { nombre: 'Rotavirus (2da dosis)', aplicada: false },
    { nombre: 'Neumococo (1ra dosis)', aplicada: false },
    { nombre: 'Neumococo (2da dosis)', aplicada: false },
    { nombre: 'Influenza', aplicada: false },
    { nombre: 'SRP (Sarampión, Rubéola, Paperas)', aplicada: false },
    { nombre: 'Varicela', aplicada: false },
    { nombre: 'Hepatitis A', aplicada: false },
    { nombre: 'DPT (Refuerzo)', aplicada: false },
    { nombre: 'COVID-19', aplicada: false },
  ];

  async cargarEstadoVacunacion(personaId: string): Promise<EstadoVacunacion | null> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) return null;

    try {
      const docRef = doc(this.firestore, `users/${userId}/vacunaciones/${personaId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as EstadoVacunacion;
        // Convertir fechas de Firestore a Date
        data.vacunas = data.vacunas.map(v => ({
          ...v,
          fechaAplicacion: v.fechaAplicacion ? new Date(v.fechaAplicacion) : undefined,
          proximaDosis: v.proximaDosis ? new Date(v.proximaDosis) : undefined
        }));
        return data;
      } else {
        // Si no existe, crear estado inicial
        return await this.crearEstadoInicial(personaId);
      }
    } catch (error) {
      console.error('Error cargando estado de vacunación:', error);
      return null;
    }
  }

  private async crearEstadoInicial(personaId: string): Promise<EstadoVacunacion> {
    const estadoInicial: EstadoVacunacion = {
      personaId,
      vacunas: [...this.vacunasOficiales],
      porcentajeCompletado: 0,
      ultimaActualizacion: new Date()
    };

    await this.guardarEstadoVacunacion(estadoInicial);
    return estadoInicial;
  }

  async guardarEstadoVacunacion(estado: EstadoVacunacion): Promise<void> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      // Calcular porcentaje
      const aplicadas = estado.vacunas.filter(v => v.aplicada).length;
      estado.porcentajeCompletado = Math.round((aplicadas / estado.vacunas.length) * 100);
      estado.ultimaActualizacion = new Date();

      const docRef = doc(this.firestore, `users/${userId}/vacunaciones/${estado.personaId}`);
      await setDoc(docRef, {
        ...estado,
        ultimaActualizacion: estado.ultimaActualizacion.toISOString()
      });

      // Actualizar el observable
      const estados = this.estadosSubject.value;
      estados.set(estado.personaId, estado);
      this.estadosSubject.next(new Map(estados));
    } catch (error) {
      console.error('Error guardando estado de vacunación:', error);
      throw error;
    }
  }

  async actualizarVacuna(personaId: string, nombreVacuna: string, aplicada: boolean, fechaAplicacion?: Date): Promise<void> {
    const estado = await this.cargarEstadoVacunacion(personaId);
    if (!estado) throw new Error('Estado no encontrado');

    const vacuna = estado.vacunas.find(v => v.nombre === nombreVacuna);
    if (!vacuna) throw new Error('Vacuna no encontrada');

    vacuna.aplicada = aplicada;
    vacuna.fechaAplicacion = aplicada ? (fechaAplicacion || new Date()) : undefined;

    await this.guardarEstadoVacunacion(estado);
  }

  async cargarPersonas(): Promise<Persona[]> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) return [];

    try {
      const personasRef = collection(this.firestore, `users/${userId}/personas`);
      const querySnapshot = await getDocs(personasRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Persona));
    } catch (error) {
      console.error('Error cargando personas:', error);
      return [];
    }
  }

  calcularEstadisticasGlobales(estados: EstadoVacunacion[]) {
    const totalPersonas = estados.length;
    let vacunasAplicadas = 0;
    let totalVacunas = 0;

    estados.forEach(estado => {
      vacunasAplicadas += estado.vacunas.filter(v => v.aplicada).length;
      totalVacunas += estado.vacunas.length;
    });

    const porcentajeGlobal = totalVacunas > 0 ? Math.round((vacunasAplicadas / totalVacunas) * 100) : 0;

    return {
      totalPersonas,
      vacunasAplicadas,
      totalVacunas,
      porcentajeGlobal
    };
  }
}

    
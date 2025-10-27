export class Vacuna {
    id?: string;
    nombre: string = "";
    aplicada: boolean = false;
    fechaAplicacion?: Date;
    proximaDosis?: Date;
    numerosDosis?: number;
    dosisCompletada?: number;
  
    constructor(data?: Partial<Vacuna>) {
      if (data) {
        Object.assign(this, data);
      }
    }
  }
  
  export class EstadoVacunacion {
    personaId: string = "";
    vacunas: Vacuna[] = [];
    porcentajeCompletado: number = 0;
  
    constructor(personaId: string) {
      this.personaId = personaId;
      this.inicializarVacunas();
    }
  
    private inicializarVacunas() {
      const vacunasBase = [
        'Covid-19',
        'Poliomielitis', 
        'Gripe',
        'Difteria',
        'Parotiditis',
        'Tétanos',
        'Rubeola',
        'Tos ferina',
        'Sarampión'
      ];
  
      this.vacunas = vacunasBase.map(nombre => new Vacuna({
        id: `${this.personaId}_${nombre.toLowerCase().replace(/\s+/g, '_')}`,
        nombre: nombre,
        aplicada: false
      }));
    }
  
    calcularPorcentaje(): number {
      const vacunasAplicadas = this.vacunas.filter(v => v.aplicada).length;
      this.porcentajeCompletado = Math.round((vacunasAplicadas / this.vacunas.length) * 100);
      return this.porcentajeCompletado;
    }
  }

  export class VaccinationRecord {
    id?: string;
    personaId: string = "";
    vacunasBase: string = "";
    fechaAplicacion?: Date;
    proximaDosis?: Date;
    estado?: "completada" | "programada" | "vencida";
    createdAt?: Date;
    updatedAt?: Date;
  }

  export class Reminder {
    id?: string;
    personaId: string = "";
    vacunasBase: string = ""
    fechaProgramada?: Date;
    estado?: "pendiente" | "completado" | "vencido";
    notificado?: boolean;
    fechaNotificacion?: Date;
    notas?: string;
    createdAt?: Date;
  }

  export class VacunaStatistics {
    totalVacunasAplicadas?: number;
    vacunasPendientes?: number;
    vacunasVencidas?: number;
    ultimaVacuna?: VaccinationRecord;
    proximaVacuna?: Reminder;
  
  }

  export class FamilyMember {
    id?: string;
    personaId: string ="";
    nombre: string ="";
    createAt?: Date;
  }
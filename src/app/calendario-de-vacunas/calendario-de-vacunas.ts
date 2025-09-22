import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Modelos para el calendario oficial
export interface VacunaOficial {
  nombre: string;
  nombreCorto: string;
  edades: EdadVacuna[];
  descripcion: string;
  observaciones?: string;
  color: string;
}

export interface EdadVacuna {
  edad: string;
  dosis: string;
  obligatoria: boolean;
  notas?: string;
}

@Component({
  selector: 'app-calendario-de-vacunas',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './calendario-de-vacunas.html',
  styleUrl: './calendario-de-vacunas.scss'
})
export class CalendarioDeVacunas implements OnInit {
  grupoSeleccionado: string = 'infantil';
  vistaActual: 'timeline' | 'vacunas' = 'timeline';

  gruposEdad = [
    { id: 'prenatal', nombre: 'Prenatal' },
    { id: 'infantil', nombre: 'Infantil (0-6 años)' },
    { id: 'adolescente', nombre: 'Adolescente (12-18 años)' },
    { id: 'adulto', nombre: 'Adulto (19-64 años)' },
    { id: 'mayor', nombre: 'Mayor (≥65 años)' },
    { id: 'todos', nombre: 'Todos los grupos' }
  ];
  vacunasOficiales: VacunaOficial[] = [
    {
      nombre: 'Difteria, Tétanos y Tosferina',
      nombreCorto: 'DTPa/dTpa/Td',
      color: '#FF6B6B',
      descripcion: 'Protege contra tres enfermedades bacterianas graves: difteria, tétanos y tosferina.',
      edades: [
        { edad: 'Prenatal', dosis: '1 dosis (semana 27-28)', obligatoria: true, notas: 'En cada embarazo' },
        { edad: '2 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '4 meses', dosis: '2ª dosis', obligatoria: true },
        { edad: '11 meses', dosis: '3ª dosis', obligatoria: true },
        { edad: '6 años', dosis: 'Refuerzo', obligatoria: true },
        { edad: '14 años', dosis: 'Refuerzo (dTpa)', obligatoria: true },
        { edad: '≥65 años', dosis: 'Refuerzo (Td)', obligatoria: true, notas: 'Cada 10 años' }
      ],
      observaciones: 'Es crucial respetar el calendario para mantener la inmunidad a lo largo de toda la vida.'
    },
    {
      nombre: 'Poliomielitis',
      nombreCorto: 'VPI',
      color: '#4ECDC4',
      descripcion: 'Previene la poliomielitis, enfermedad vírica que puede causar parálisis permanente.',
      edades: [
        { edad: '2 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '4 meses', dosis: '2ª dosis', obligatoria: true },
        { edad: '11 meses', dosis: '3ª dosis', obligatoria: true },
        { edad: '6 años', dosis: 'Refuerzo', obligatoria: true }
      ],
      observaciones: 'Se administra junto con DTPa en vacuna combinada.'
    },
    {
      nombre: 'Haemophilus influenzae tipo b',
      nombreCorto: 'Hib',
      color: '#45B7D1',
      descripcion: 'Protege contra infecciones graves causadas por Haemophilus influenzae tipo b.',
      edades: [
        { edad: '2 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '4 meses', dosis: '2ª dosis', obligatoria: true },
        { edad: '11 meses', dosis: '3ª dosis', obligatoria: true }
      ]
    },
    {
      nombre: 'Hepatitis B',
      nombreCorto: 'HB',
      color: '#96CEB4',
      descripcion: 'Previene la hepatitis B, infección vírica del hígado que puede volverse crónica.',
      edades: [
        { edad: '0 meses', dosis: 'Al nacer', obligatoria: true, notas: 'Si madre AgHBs+' },
        { edad: '2 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '4 meses', dosis: '2ª dosis', obligatoria: true },
        { edad: '11 meses', dosis: '3ª dosis', obligatoria: true }
      ],
      observaciones: 'Cribado prenatal obligatorio para detectar portadoras.'
    },
    {
      nombre: 'Enfermedad Neumocócica',
      nombreCorto: 'VNC',
      color: '#FECA57',
      descripcion: 'Protege contra infecciones por neumococo: neumonía, meningitis, sepsis.',
      edades: [
        { edad: '2 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '4 meses', dosis: '2ª dosis', obligatoria: true },
        { edad: '11 meses', dosis: '3ª dosis', obligatoria: true },
        { edad: '≥65 años', dosis: '1 dosis', obligatoria: true }
      ]
    },
    {
      nombre: 'Rotavirus',
      nombreCorto: 'RV',
      color: '#FF9FF3',
      descripcion: 'Previene gastroenteritis grave por rotavirus en lactantes.',
      edades: [
        { edad: '6-24 semanas', dosis: 'Según ficha técnica', obligatoria: true, notas: 'Implementación antes de 2026' }
      ],
      observaciones: 'Vacunación oral. Nueva incorporación en 2025.'
    },
    {
      nombre: 'Enfermedad Meningocócica B',
      nombreCorto: 'MenB',
      color: '#FF6B9A',
      descripcion: 'Protege contra meningitis y sepsis por meningococo del serogrupo B.',
      edades: [
        { edad: '2 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '4 meses', dosis: '2ª dosis', obligatoria: true },
        { edad: '12 meses', dosis: 'Refuerzo', obligatoria: true }
      ]
    },
    {
      nombre: 'Enfermedad Meningocócica C y ACWY',
      nombreCorto: 'MenC/MenACWY',
      color: '#A29BFE',
      descripcion: 'Protege contra meningitis por meningococos de varios serogrupos.',
      edades: [
        { edad: '12 meses', dosis: 'MenC', obligatoria: true },
        { edad: '12 años', dosis: 'MenACWY', obligatoria: true },
        { edad: '15-18 años', dosis: 'Captación MenACWY', obligatoria: false }
      ]
    },
    {
      nombre: 'Sarampión, Rubeola y Parotiditis',
      nombreCorto: 'TV (Triple Vírica)',
      color: '#FD79A8',
      descripcion: 'Protege contra tres enfermedades víricas: sarampión, rubeola y parotiditis.',
      edades: [
        { edad: '12 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '3-4 años', dosis: '2ª dosis', obligatoria: true },
        { edad: 'Adultos', dosis: 'Según historia', obligatoria: false, notas: 'Nacidos desde 1978' }
      ],
      observaciones: 'Contraindicada en embarazadas e inmunodeprimidos.'
    },
    {
      nombre: 'Varicela',
      nombreCorto: 'VVZ',
      color: '#74B9FF',
      descripcion: 'Previene la varicela, enfermedad vírica muy contagiosa.',
      edades: [
        { edad: '15 meses', dosis: '1ª dosis', obligatoria: true },
        { edad: '3-4 años', dosis: '2ª dosis', obligatoria: true },
        { edad: 'Adolescentes', dosis: '2 dosis si susceptible', obligatoria: false }
      ],
      observaciones: 'Contraindicada en embarazadas e inmunodeprimidos.'
    },
    {
      nombre: 'Virus del Papiloma Humano',
      nombreCorto: 'VPH',
      color: '#E17055',
      descripcion: 'Previene cánceres y lesiones causadas por el virus del papiloma humano.',
      edades: [
        { edad: '12 años', dosis: '1 dosis', obligatoria: true, notas: 'Niños y niñas' },
        { edad: '12-18 años', dosis: 'Captación', obligatoria: false, notas: 'Si no vacunados' }
      ],
      observaciones: 'Estrategia de una dosis implementada desde 2024.'
    },
    {
      nombre: 'Herpes Zóster',
      nombreCorto: 'HZ',
      color: '#FDCB6E',
      descripcion: 'Previene el herpes zóster y la neuralgia postherpética.',
      edades: [
        { edad: '65 años', dosis: '2 dosis', obligatoria: true, notas: '8 semanas entre dosis' },
        { edad: '66-80 años', dosis: 'Captación progresiva', obligatoria: false }
      ]
    },
    {
      nombre: 'Gripe Estacional',
      nombreCorto: 'Gripe',
      color: '#6C5CE7',
      descripcion: 'Protege contra la gripe estacional, actualizándose anualmente.',
      edades: [
        { edad: 'Prenatal', dosis: 'Anual', obligatoria: true, notas: 'Cualquier trimestre' },
        { edad: '6-59 meses', dosis: 'Anual', obligatoria: true },
        { edad: '≥60 años', dosis: 'Anual', obligatoria: true },
        { edad: 'Grupos de riesgo', dosis: 'Anual', obligatoria: true }
      ],
      observaciones: 'La edad específica se define cada temporada.'
    },
    {
      nombre: 'COVID-19',
      nombreCorto: 'COVID-19',
      color: '#00B894',
      descripcion: 'Protege contra COVID-19 causado por SARS-CoV-2.',
      edades: [
        { edad: 'Prenatal', dosis: 'Estacional', obligatoria: true, notas: 'Cualquier trimestre' },
        { edad: '≥60 años', dosis: 'Estacional', obligatoria: true, notas: 'Temporada 2024-25' },
        { edad: 'Grupos de riesgo', dosis: 'Según indicación', obligatoria: false }
      ],
      observaciones: 'Las recomendaciones se actualizan por temporada.'
    },
    {
      nombre: 'Virus Respiratorio Sincitial',
      nombreCorto: 'VRS',
      color: '#FF7675',
      descripcion: 'Inmunización pasiva contra el virus respiratorio sincitial en lactantes.',
      edades: [
        { edad: '0-6 meses', dosis: '1 dosis', obligatoria: true, notas: 'Anticuerpo monoclonal' }
      ],
      observaciones: 'Temporada octubre-marzo. Administración muy precoz en nacidos durante la temporada.'
    }
  ];

  constructor() {}

  ngOnInit() {
    // Componente inicializado
  }

  seleccionarGrupo(grupoId: string) {
    this.grupoSeleccionado = grupoId;
  }

  cambiarVista(vista: 'timeline' | 'vacunas') {
    this.vistaActual = vista;
  }

  obtenerNombreGrupo(grupoId: string): string {
    const grupo = this.gruposEdad.find(g => g.id === grupoId);
    return grupo ? grupo.nombre : 'Todos los grupos';
  }

  obtenerEdadesFiltradas() {
    const edades = [
      { 
        nombre: 'Prenatal', 
        descripcion: 'Durante el embarazo',
        vacunas: this.filtrarVacunasPorEdad('Prenatal')
      },
      { 
        nombre: '0m', 
        descripcion: 'Al nacer',
        vacunas: this.filtrarVacunasPorEdad('0 meses')
      },
      { 
        nombre: '2m', 
        descripcion: '2 meses',
        vacunas: this.filtrarVacunasPorEdad('2 meses')
      },
      { 
        nombre: '4m', 
        descripcion: '4 meses',
        vacunas: this.filtrarVacunasPorEdad('4 meses')
      },
      { 
        nombre: '6m', 
        descripcion: '6 meses',
        vacunas: this.filtrarVacunasPorEdad('6 meses')
      },
      { 
        nombre: '11m', 
        descripcion: '11 meses',
        vacunas: this.filtrarVacunasPorEdad('11 meses')
      },
      { 
        nombre: '12m', 
        descripcion: '12 meses',
        vacunas: this.filtrarVacunasPorEdad('12 meses')
      },
      { 
        nombre: '15m', 
        descripcion: '15 meses',
        vacunas: this.filtrarVacunasPorEdad('15 meses')
      },
      { 
        nombre: '3-4a', 
        descripcion: '3-4 años',
        vacunas: this.filtrarVacunasPorEdad('3-4 años')
      },
      { 
        nombre: '6a', 
        descripcion: '6 años',
        vacunas: this.filtrarVacunasPorEdad('6 años')
      },
      { 
        nombre: '12a', 
        descripcion: '12 años',
        vacunas: this.filtrarVacunasPorEdad('12 años')
      },
      { 
        nombre: '14a', 
        descripcion: '14 años',
        vacunas: this.filtrarVacunasPorEdad('14 años')
      },
      { 
        nombre: '≥65a', 
        descripción: '65 años o más',
        vacunas: this.filtrarVacunasPorEdad('≥65 años')
      }
    ];

    if (this.grupoSeleccionado === 'todos') return edades;
    
    return edades.filter(edad => this.perteneceAlGrupo(edad.nombre));
  }

  private perteneceAlGrupo(edad: string): boolean {
    switch (this.grupoSeleccionado) {
      case 'prenatal':
        return edad === 'Prenatal';
      case 'infantil':
        return ['0m', '2m', '4m', '6m', '11m', '12m', '15m', '3-4a', '6a'].includes(edad);
      case 'adolescente':
        return ['12a', '14a'].includes(edad);
      case 'adulto':
        return edad.includes('adulto') || edad.includes('19-64');
      case 'mayor':
        return edad === '≥65a';
      default:
        return true;
    }
  }

  private filtrarVacunasPorEdad(edad: string) {
    const vacunas: any[] = [];
    
    this.vacunasOficiales.forEach(vacuna => {
      const edadEncontrada = vacuna.edades.find(e => e.edad === edad);
      if (edadEncontrada) {
        vacunas.push({
          nombre: vacuna.nombre,
          nombreCorto: vacuna.nombreCorto,
          dosis: edadEncontrada.dosis,
          obligatoria: edadEncontrada.obligatoria,
          notas: edadEncontrada.notas,
          color: vacuna.color
        });
      }
    });
    
    return vacunas;
  }
}


import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Modelo para resultado de escaneo
export interface VacunaDetectada {
  nombre: string;
  fecha?: Date;
  lote?: string;
  laboratorio?: string;
  confianza: number; // 0-1, nivel de confianza en la detección
}

export interface ResultadoEscaneo {
  vacunasDetectadas: VacunaDetectada[];
  textoCompleto: string;
  nombrePersona?: string;
  fechaDocumento?: Date;
  tipoDocumento: 'cartilla' | 'certificado' | 'informe' | 'desconocido';
}

@Injectable({
  providedIn: 'root'
})
export class DocumentScannerService {
  private procesandoSubject = new BehaviorSubject<boolean>(false);
  public procesando$ = this.procesandoSubject.asObservable();
// Patrones de reconocimiento de vacunas españolas
private patronesVacunas = {
    'difteria|tétanos|tosferina|dtpa|dtp': 'DTPa/dTpa/Td',
    'poliomielitis|polio|vpi': 'Poliomielitis',
    'haemophilus|hib': 'Haemophilus influenzae b',
    'hepatitis b|hep b|hb': 'Hepatitis B',
    'neumococo|pneumo|vnc': 'Neumococo',
    'rotavirus|rota|rv': 'Rotavirus',
    'meningoco|menb|menc|menacwy': 'Meningococo',
    'sarampión|rubeola|parotiditis|triple vírica|tv|mmr': 'Triple Vírica',
    'varicela|vzv|vvz': 'Varicela',
    'papiloma|vph|hpv': 'VPH',
    'herpes zóster|zóster|hz': 'Herpes Zóster',
    'gripe|influenza': 'Gripe',
    'covid|coronavirus|sars': 'COVID-19',
    'respiratorio sincitial|vrs|rsv': 'VRS'
  };

  // Patrones de fechas
  private patronesFechas = [
    /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/g,
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/gi
  ];

  constructor() {}

  async procesarArchivo(archivo: File): Promise<ResultadoEscaneo> {
    this.procesandoSubject.next(true);
    
    try {
      let textoExtraido = '';
      
      if (archivo.type.startsWith('image/')) {
        textoExtraido = await this.extraerTextoDeImagen(archivo);
      } else if (archivo.type === 'application/pdf') {
        textoExtraido = await this.extraerTextoDePDF(archivo);
      } else {
        throw new Error('Tipo de archivo no soportado');
      }

      const resultado = this.analizarTexto(textoExtraido);
      return resultado;
      
    } finally {
      this.procesandoSubject.next(false);
    }
  }

  private async extraerTextoDeImagen(archivo: File): Promise<string> {
    // Simulación de OCR - En producción usarías Tesseract.js o similar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulamos extracción de texto de imagen
        // En la realidad aquí usarías Tesseract.js u otro OCR
        setTimeout(() => {
          const textoSimulado = this.generarTextoSimulado();
          resolve(textoSimulado);
        }, 2000);
      };
      reader.readAsDataURL(archivo);
    });
  }

  private async extraerTextoDePDF(archivo: File): Promise<string> {
    // Simulación de extracción de PDF
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // En producción usarías PDF.js o similar
        setTimeout(() => {
          const textoSimulado = this.generarTextoSimulado();
          resolve(textoSimulado);
        }, 1500);
      };
      reader.readAsArrayBuffer(archivo);
    });
  }

  private analizarTexto(texto: string): ResultadoEscaneo {
    const vacunasDetectadas: VacunaDetectada[] = [];
    const textoLower = texto.toLowerCase();

    // Buscar vacunas
    Object.entries(this.patronesVacunas).forEach(([patron, nombreVacuna]) => {
      const regex = new RegExp(patron, 'gi');
      const coincidencias = textoLower.match(regex);
      
      if (coincidencias) {
        const fechas = this.extraerFechasCercanas(texto, coincidencias[0]);
        
        vacunasDetectadas.push({
          nombre: nombreVacuna,
          fecha: fechas.length > 0 ? fechas[0] : undefined,
          confianza: this.calcularConfianza(coincidencias, patron)
        });
      }
    });

    // Detectar tipo de documento
    const tipoDocumento = this.detectarTipoDocumento(textoLower);
    
    // Extraer nombre de persona (patrón simple)
    const nombrePersona = this.extraerNombrePersona(texto);

    return {
      vacunasDetectadas,
      textoCompleto: texto,
      nombrePersona,
      tipoDocumento
    };
  }

  private extraerFechasCercanas(texto: string, terminoBusqueda: string): Date[] {
    const fechas: Date[] = [];
    
    this.patronesFechas.forEach(patron => {
      const matches = texto.matchAll(patron);
      for (const match of matches) {
        try {
          let fecha: Date;
          
          if (match[0].includes('de')) {
            // Formato: "15 de marzo de 2023"
            const meses: {[key: string]: number} = {
              enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
              julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
            };
            fecha = new Date(parseInt(match[3]), meses[match[2].toLowerCase()], parseInt(match[1]));
          } else {
            // Formato: "15/03/2023" o "15-03-2023"
            let año = parseInt(match[3]);
            if (año < 100) año += 2000;
            fecha = new Date(año, parseInt(match[2]) - 1, parseInt(match[1]));
          }
          
          if (fecha.getFullYear() >= 1990 && fecha.getFullYear() <= 2030) {
            fechas.push(fecha);
          }
        } catch (e) {
          // Ignorar fechas malformadas
        }
      }
    });
    
    return fechas.sort((a, b) => b.getTime() - a.getTime()); // Más recientes primero
  }

  private calcularConfianza(coincidencias: RegExpMatchArray, patron: string): number {
    // Lógica simple de confianza basada en número de coincidencias y longitud del patrón
    const baseConfianza = Math.min(coincidencias.length * 0.3, 0.9);
    const factorPatron = patron.length > 10 ? 0.1 : 0;
    return Math.min(baseConfianza + factorPatron, 1);
  }

  private detectarTipoDocumento(texto: string): 'cartilla' | 'certificado' | 'informe' | 'desconocido' {
    if (texto.includes('cartilla') || texto.includes('vacunación')) return 'cartilla';
    if (texto.includes('certificado')) return 'certificado';
    if (texto.includes('informe')) return 'informe';
    return 'desconocido';
  }

  private extraerNombrePersona(texto: string): string | undefined {
    // Patrón simple para extraer nombres (mejorable)
    const patrones = [
      /nombre[:\s]+([a-záéíóúñ\s]+)/gi,
      /paciente[:\s]+([a-záéíóúñ\s]+)/gi
    ];

    for (const patron of patrones) {
      const match = texto.match(patron);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  // Función para testing/simulación
  private generarTextoSimulado(): string {
    const ejemplos = [
      `CARTILLA DE VACUNACIÓN
      NOMBRE: Juan Pérez García
      FECHA NACIMIENTO: 15/03/2010
      
      VACUNAS ADMINISTRADAS:
      - DTPa: 15/05/2010 (Lote: AB123)
      - Poliomielitis: 15/05/2010
      - Hepatitis B: 20/06/2010
      - Triple Vírica: 12/05/2011
      - Varicela: 12/05/2011
      
      Centro de Salud: Madrid Centro
      Fecha del documento: 20/01/2024`,
      
      `CERTIFICADO DE VACUNACIÓN COVID-19
      María López Ruiz
      DNI: 12345678X
      
      1ª DOSIS: Pfizer - 15/02/2021
      2ª DOSIS: Pfizer - 08/03/2021
      DOSIS REFUERZO: Pfizer - 20/09/2021
      
      Ministerio de Sanidad`,
      
      `INFORME DE VACUNACIÓN
      Paciente: Carlos Rodríguez
      
      Vacuna Gripe: 15/10/2023
      Vacuna COVID-19: 22/10/2023
      Herpes Zóster: 05/11/2023
      
      Todas las vacunas administradas correctamente.`
    ];

    return ejemplos[Math.floor(Math.random() * ejemplos.length)];
  }
}
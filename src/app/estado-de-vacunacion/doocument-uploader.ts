import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentScannerService, ResultadoEscaneo, VacunaDetectada } from '../services/document-scanner.service';
import { EstadoSaludService } from '../estado-de-vacunacion/estado-salud.service';
import { PersonaService } from '../services/persona.service';
import { Persona } from '../area-privada/persona.model';

@Component({
  selector: 'app-document-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-uploader.html',
  styleUrls: ['./document-uploader.scss']
})

export class DocumentUploaderComponent implements OnInit {
    @Output() vacunasActualizadas = new EventEmitter<void>();
  
    dragOver = false;
    procesando = false;
    ultimoResultado: ResultadoEscaneo | null = null;
    personaSeleccionada: string = '';
    personas: Persona[] = [];
    vacunasParaAplicar: VacunaDetectada[] = [];
    mostrarExito = false;
    vacunasAplicadas = 0;
    nombrePersonaActualizada = '';
  
    constructor(
      private scannerService: DocumentScannerService,
      private estadoSaludService: EstadoSaludService,
      private personaService: PersonaService
    ) {}
  
    ngOnInit() {
      this.personaService.personas$.subscribe(personas => {
        this.personas = personas;
      });
  
      this.scannerService.procesando$.subscribe(procesando => {
        this.procesando = procesando;
      });
    }
  
    onDragOver(event: DragEvent) {
      event.preventDefault();
      this.dragOver = true;
    }
  
    onDragLeave(event: DragEvent) {
      event.preventDefault();
      this.dragOver = false;
    }
  
    onDrop(event: DragEvent) {
      event.preventDefault();
      this.dragOver = false;
      
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.procesarArchivo(files[0]);
      }
    }
  
    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.procesarArchivo(file);
      }
    }
  
    async procesarArchivo(archivo: File) {
      // Validar tipo de archivo
      if (!this.esArchivoValido(archivo)) {
        alert('Tipo de archivo no soportado. Usa JPG, PNG o PDF.');
        return;
      }
  
      // Validar tamaño (máximo 10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
  
      try {
        this.ultimoResultado = await this.scannerService.procesarArchivo(archivo);
        
        // Auto-seleccionar persona si se detectó en el documento
        if (this.ultimoResultado.nombrePersona && this.personas.length > 0) {
          const personaEncontrada = this.personas.find(p => 
            p.nombre.toLowerCase().includes(this.ultimoResultado!.nombrePersona!.toLowerCase()) ||
            this.ultimoResultado!.nombrePersona!.toLowerCase().includes(p.nombre.toLowerCase())
          );
          
          if (personaEncontrada) {
            this.personaSeleccionada = personaEncontrada.id!;
          }
        }
  
        // Pre-seleccionar vacunas con alta confianza
        this.vacunasParaAplicar = this.ultimoResultado.vacunasDetectadas.filter(v => v.confianza > 0.6);
        
      } catch (error) {
        console.error('Error procesando archivo:', error);
        alert('Error procesando el archivo. Intenta con otro formato o imagen más clara.');
      }
    }
  
    esArchivoValido(archivo: File): boolean {
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      return tiposPermitidos.includes(archivo.type);
    }
  
    toggleVacunaAplicar(vacuna: VacunaDetectada, event: any) {
      if (event.target.checked) {
        if (!this.vacunasParaAplicar.includes(vacuna)) {
          this.vacunasParaAplicar.push(vacuna);
        }
      } else {
        this.vacunasParaAplicar = this.vacunasParaAplicar.filter(v => v !== vacuna);
      }
    }
  
    async aplicarVacunas() {
      if (!this.personaSeleccionada || this.vacunasParaAplicar.length === 0) {
        console.log('No se puede aplicar:', {
            personaSeleccionada: this.personaSeleccionada,
            vacunasParaAplicar: this.vacunasParaAplicar.length
          });
        return;
      }
  
      const persona = this.personas.find(p => p.id === this.personaSeleccionada);
      if (!persona) {
        console.log('Persona no encontrada');
       return;
      }
      console.log('Aplicando vacunas para:', persona.nombre);
  let vacunasAplicadasCount = 0;

  
      // Aplicar cada vacuna seleccionada
      for (const vacunaDetectada of this.vacunasParaAplicar) {
        console.log('Procesando vacuna:', vacunaDetectada.nombre);
        // Buscar la vacuna correspondiente en el sistema
        const estado = this.estadoSaludService.obtenerEstadoPorPersona(this.personaSeleccionada);
        const vacunaEnSistema = estado.vacunas.find(v => 
            this.coincideNombreVacuna(v.nombre, vacunaDetectada.nombre)
          );
  
          if (vacunaEnSistema && vacunaEnSistema.id) {
            console.log('Actualizando vacuna:', vacunaEnSistema.nombre);
            this.estadoSaludService.actualizarVacuna(
              this.personaSeleccionada,
              vacunaEnSistema.id,
              true,
              vacunaDetectada.fecha || new Date()
            );
            vacunasAplicadasCount++;
          } else {
            console.log('No se encontró vacuna en sistema para:', vacunaDetectada.nombre);
          }
        }
      
        console.log('Vacunas aplicadas:', vacunasAplicadasCount);
  
      // Mostrar mensaje de éxito
      this.vacunasAplicadas = vacunasAplicadasCount;
      this.nombrePersonaActualizada = persona.nombre;
      this.mostrarExito = true;
      
      // Emitir evento para actualizar la UI padre
      this.vacunasActualizadas.emit();
  
      // Limpiar después de un tiempo
      setTimeout(() => {
        this.limpiarResultados();
      }, 3000);
    }

    private coincideNombreVacuna(nombreSistema: string, nombreDetectado: string): boolean {
        const normalizarNombre = (nombre: string) => 
          nombre.toLowerCase()
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]/g, '');
      
        const sistemaNorm = normalizarNombre(nombreSistema);
        const detectadoNorm = normalizarNombre(nombreDetectado);

        // Mapeo de nombres comunes
  const mapeoVacunas: {[key: string]: string[]} = {
    'difteriatetonostosferinadtpadtpatd': ['dtpa', 'dtp', 'difteria', 'tetanos', 'tosferina', 'td'],
    'poliomielitis': ['polio', 'vpi', 'poliomielitis'],
    'haemophilusinfluenzaeb': ['hib', 'haemophilus'],
    'hepatitisb': ['hepb', 'hepatitis', 'hb'],
    'enfermedadneumococica': ['neumococo', 'pneumo', 'vnc'],
    'rotavirus': ['rota', 'rv', 'rotavirus'],
    'enfermedadmeningococicab': ['menb', 'meningococo'],
    'enfermedadmeningococicacmenacwy': ['menc', 'menacwy', 'meningococo'],
    'sarampiónrubeolaparotiditis': ['tripleviricat', 'mmr', 'sarampion', 'rubeola', 'parotiditis'],
    'varicela': ['vzv', 'vvz', 'varicela'],
    'virusdelpapiloma': ['vph', 'hpv', 'papiloma'],
    'herpeszoster': ['hz', 'zoster', 'herpes'],
    'gripe': ['influenza', 'gripe', 'flu'],
    'covid19': ['covid', 'coronavirus', 'sarscov2']
  };

  // Verificar coincidencia directa
  if (sistemaNorm.includes(detectadoNorm) || detectadoNorm.includes(sistemaNorm)) {
    return true;
  }

  // Verificar en el mapeo
  for (const [sistema, detectados] of Object.entries(mapeoVacunas)) {
    if (sistemaNorm.includes(sistema) || sistema.includes(sistemaNorm)) {
      return detectados.some(d => detectadoNorm.includes(d) || d.includes(detectadoNorm));
    }
  }

  return false;
}
  
    limpiarResultados() {
      this.ultimoResultado = null;
      this.vacunasParaAplicar = [];
      this.personaSeleccionada = '';
      this.mostrarExito = false;
    }
  
    getTipoDocumentoTexto(tipo: string): string {
      switch (tipo) {
        case 'cartilla': return 'Cartilla de Vacunación';
        case 'certificado': return 'Certificado';
        case 'informe': return 'Informe Médico';
        default: return 'Documento';
      }
    }
  
    getConfianzaTexto(confianza: number): string {
      if (confianza > 0.8) return 'Alta';
      if (confianza > 0.5) return 'Media';
      return 'Baja';
    }
  }


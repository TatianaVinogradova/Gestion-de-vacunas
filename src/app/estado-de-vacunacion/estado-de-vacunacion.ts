import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonaService } from '../services/persona.service';
import { EstadoSaludService } from './estado-salud.service';
import { Persona } from '../area-privada/persona.model';
import { EstadoVacunacion, Vacuna } from './vacuna.model';
import { DocumentUploaderComponent } from './doocument-uploader';
import { DocumentService, VaccinationDocument } from '../services/document.service';
import { ToastService } from '../services/toast.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-estado-de-vacunacion',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DocumentUploaderComponent],
  templateUrl: './estado-de-vacunacion.html',
  styleUrls: ['./estado-de-vacunacion.scss']
})
export class EstadoDeVacunacion implements OnInit {
[x: string]: any;
  personas: Persona[] = [];
  personaSeleccionada: Persona | null = null;
  estadoActual: EstadoVacunacion | null = null;
  segmentosGrafico: any[] = [];
  estadisticasGlobales: any = {
    totalPersonas: 0,
    vacunasAplicadas: 0,
    totalVacunas: 0,
    porcentajeGlobal: 0
  };
  mostrarCargadorDocumentos = false;
  documents: VaccinationDocument[] = [];
  selectedDocument: VaccinationDocument | null = null;
  mostrarModalViewer = false;
  mostrarModalFoto = false;
  mostrarModalEstadoSalud = false;
  vacunasDetectadas: any[] = [];
  cargando = false;

  constructor(
    private personaService: PersonaService,
    private estadoSaludService: EstadoSaludService,
    private documentService: DocumentService,
    private toast: ToastService
  ) {}

  async ngOnInit() {
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
        this.cargarEstadoVacunacion();
      }
    });

    // Suscribirse a documentos
    this.documentService.documents$.subscribe(docs => {
      this.documents = docs;
    });
  }
  
  async tomarFotoConCamara() {
    if (!Capacitor.isNativePlatform()) {
      this.toast.error('La cámara solo está disponible en dispositivos móviles', 'Error');
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1200,
        height: 1600
      });

      if (image.dataUrl) {
        this.documentService.addDocument(image.dataUrl, 'photo');
        this.cerrarModalFoto();
        this.toast.success('Foto capturada y agregada', 'Éxito');

        // Abrir automáticamente el modal de estado de vacunación
        setTimeout(() => {
          this.mostrarEstadoSalud();
        }, 300);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      this.toast.error('No se pudo tomar la foto', 'Error');
    }
  }

  async subirDocumento() {
    // Para web: usar input file
    if (!Capacitor.isNativePlatform()) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';

      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            this.documentService.addDocument(event.target.result, 'file');
            this.cerrarModalFoto();
            this.toast.success('Documento cargado y agregado', 'Éxito');
            
            // Abrir automáticamente el modal de estado de vacunación
            setTimeout(() => {
              this.mostrarEstadoSalud();
            }, 300);
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
      return;
    }

    // Para móvil: usar galería de fotos
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1200,
        height: 1600
      });

      if (image.dataUrl) {
        this.documentService.addDocument(image.dataUrl, 'file');
        this.cerrarModalFoto();
        this.toast.success('Documento cargado correctamente', 'Éxito');
        
        // Abrir automáticamente el modal de estado de vacunación
        setTimeout(() => {
          this.mostrarEstadoSalud();
        }, 300);
      }
    } catch (error) {
      console.error('Error subiendo documento:', error);
      this.toast.error('No se pudo cargar el documento', 'Error');
    }
  }

  async analizarYAplicarVacunas(doc: VaccinationDocument) {
    if (!this.personaSeleccionada) {
      this.toast.error('Selecciona una persona primero', 'Error');
      return;
    }
  
    this.cargando = true;
    try {
      // Mostrar modal de análisis con selector manual
      this.selectedDocument = doc;
      this.mostrarModalEstadoSalud = true;
    } catch (error) {
      console.error('Error analizando documento:', error);
      this.toast.error('Error al analizar el documento', 'Error');
    } finally {
      this.cargando = false;
    }
  }

  toggleVacunaParaAplicar(vacuna: Vacuna) {
    if (vacuna.aplicada) return;

    const index = this.vacunasDetectadas.findIndex(v => v.nombre === vacuna.nombre);
    
    if (index > -1) {
      this.vacunasDetectadas.splice(index, 1);
    } else {
      this.vacunasDetectadas.push({
        nombre: vacuna.nombre,
        confianza: 1
      });
    }
  }
  estaVacunaSeleccionada(vacuna: Vacuna): boolean {
    return this.vacunasDetectadas.some(v => v.nombre === vacuna.nombre);
  }


  async aplicarVacunasSeleccionadas() {
    if (!this.personaSeleccionada || !this.estadoActual) return;

    try {
      let aplicadas = 0;

      for (const vacunaDetectada of this.vacunasDetectadas) {
        const vacuna = this.estadoActual.vacunas.find(v => v.nombre === vacunaDetectada.nombre);

        if (vacuna && !vacuna.aplicada) {
          vacuna.aplicada = true;
          vacuna.fechaAplicacion = new Date();
          aplicadas++;

          if (this.personaSeleccionada.id && vacuna.id) {
            this.estadoSaludService.actualizarVacuna(
              this.personaSeleccionada.id,
              vacuna.id,
              true,
              new Date()
            );
          }
        }
      }

      if (aplicadas > 0) {

        this.actualizarPorcentaje();
        this.toast.success(`${aplicadas} vacuna(s) aplicada(s) correctamente`, '¡Éxito!');
      } else {
        this.toast.info('No se encontraron vacunas nuevas para aplicar', 'Información');
      }

      this.cerrarModalEstadoSalud();
    } catch (error) {
      console.error('Error aplicando vacunas:', error);
      this.toast.error('Error al aplicar las vacunas', 'Error');
    }
  }

  seleccionarPersona(persona: Persona) {
    this.personaSeleccionada = persona;
    this.cargarEstadoVacunacion();
  }

  cargarEstadoVacunacion() {
    if (!this.personaSeleccionada?.id) return;

    this.estadoActual = this.estadoSaludService.obtenerEstadoPorPersona(this.personaSeleccionada.id);
    this.generarSegmentosGrafico();
  }

  toggleVacuna(vacuna: Vacuna) {
    if (!this.personaSeleccionada?.id || !vacuna.id) return;

    vacuna.aplicada = !vacuna.aplicada;
    
    if (vacuna.aplicada && !vacuna.fechaAplicacion) {
      vacuna.fechaAplicacion = new Date();
    } else if (!vacuna.aplicada) {
      vacuna.fechaAplicacion = undefined;
    }

    this.estadoSaludService.actualizarVacuna(
      this.personaSeleccionada.id,
      vacuna.id,
      vacuna.aplicada,
      vacuna.fechaAplicacion
    );

    this.actualizarPorcentaje();
  }

  actualizarFecha(vacuna: Vacuna, event: any) {
    if (!this.personaSeleccionada?.id || !vacuna.id) return;

    vacuna.fechaAplicacion = new Date(event.target.value);
    
    this.estadoSaludService.actualizarVacuna(
      this.personaSeleccionada.id,
      vacuna.id,
      vacuna.aplicada,
      vacuna.fechaAplicacion
    );
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '';
    return new Date(fecha).toISOString().split('T')[0];
  }

  actualizarPorcentaje() {
    if (!this.estadoActual) return;

    const aplicadas = this.estadoActual.vacunas.filter(v => v.aplicada).length;
    const total = this.estadoActual.vacunas.length;
    this.estadoActual.porcentajeCompletado = Math.round((aplicadas / total) * 100);
    this.generarSegmentosGrafico();
    this.actualizarEstadisticasGlobales();
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

      const anguloTexto = (anguloInicio + anguloFin) / 2;
      const radioTexto = 70;
      const textX = centroX + radioTexto * Math.cos(anguloTexto);
      const textY = centroY + radioTexto * Math.sin(anguloTexto);

      return {
        path,
        aplicada: vacuna.aplicada,
        nombre: vacuna.nombre.substring(0, 10),
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
    this.cerrarCargador();
    if (this.personaSeleccionada) {
      this.cargarEstadoVacunacion();
    }
    this.actualizarEstadisticasGlobales();
    this.toast.success('Vacunas actualizadas correctamente', 'Éxito');
  }

  verDocumento(doc: VaccinationDocument) {
    this.selectedDocument = doc;
    this.mostrarModalViewer = true;
  }

  cerrarViewer() {
    this.mostrarModalViewer = false;
    this.selectedDocument = null;
  }

  eliminarDocumento(doc: VaccinationDocument, event: Event) {
    event.stopPropagation();
    
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      this.documentService.removeDocument(doc.id);
      this.toast.info('Documento eliminado', 'Información');
    }
  }

  descargarDocumento(doc: VaccinationDocument, event: Event) {
    event.stopPropagation();
    
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = `${doc.name}.jpg`;
    link.click();
    
    this.toast.success('Documento descargado', 'Éxito');
  }

  abrirModalFoto() {
    this.mostrarModalFoto = true;
  }

  cerrarModalFoto() {
    this.mostrarModalFoto = false;
  }

  mostrarEstadoSalud() {
    this.mostrarModalEstadoSalud = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalEstadoSalud() {
    this.mostrarModalEstadoSalud = false;
    this.vacunasDetectadas = [];
    this.selectedDocument = null;
    document.body.style.overflow = 'auto';
  }

  obtenerPorcentaje(personaId: string): number {
    const estado = this.estadoSaludService.obtenerEstadoPorPersona(personaId);
    return estado?.porcentajeCompletado || 0;
  }
}
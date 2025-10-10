import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { Perfil } from '../perfil/perfil'; // Importar el componente Perfil
import { EstadoDeVacunacion } from '../estado-de-vacunacion/estado-de-vacunacion';
import { CalendarioDeVacunas } from '../calendario-de-vacunas/calendario-de-vacunas';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastService } from '../services/toast.service';
import { DocumentService } from '../services/document.service';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-area-privada',
  standalone: true,
  imports: [CommonModule, Perfil, EstadoDeVacunacion, CalendarioDeVacunas], // Añadir Perfil a imports
  templateUrl: './area-privada.html',
  styleUrls: ['./area-privada.scss']
})
export class AreaPrivada implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private documentService = inject(DocumentService);

  usuario: any = null;
  photoUrl: string | null = null;
  mostrarModalPerfil = false;
  mostrarModalEstadoSalud = false;
  mostrarModalCalendario = false;
  menuAbierto = false;
  mostrarModalFoto = false;

  ngOnInit() {
    // Suscribirse al estado del usuario
    this.authService.user$.subscribe(user => {
      this.usuario = user;
    });

    if (window.innerWidth <= 768) {
      setTimeout(() => {
        this.toast.success(
          'Has iniciado sesión correctamente', 
          '¡Bienvenido!');
      }, 500);
    }
  }

  async cerrarSesion() {
    try {
      this.menuAbierto = false;
      await this.authService.logout();
      this.toast.info('Has cerrado sesión', 'Hasta pronto');
      // El servicio ya redirige automáticamente al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.toast.error('Error al cerrar sesión', 'Error');
    }
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
  // Subir documento desde galería/archivos
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

  // Función para mostrar el modal del perfil
  mostrarPerfil() {
    this.mostrarModalPerfil = true;
    // Evitar scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Función para cerrar el modal del perfil
  cerrarPerfil() {
    this.mostrarModalPerfil = false;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Función para ir al calendario de vacunas
  irACalendario() {
    this.mostrarCalendario();
  }

  // Función para mostrar ayuda
  mostrarAyuda() {
    alert('Sección de Ayuda:\n\n• Ver Perfil: Gestiona los perfiles de tu familia\n• Calendario: Consulta las vacunas programadas\n• Para más información, contacta con soporte');
  }

  mostrarEstadoSalud() {
    this.mostrarModalEstadoSalud = true;
    document.body.style.overflow = 'hidden';
  }
  
  cerrarEstadoSalud() {
    this.mostrarModalEstadoSalud = false;
    document.body.style.overflow = 'auto';
  }

  mostrarCalendario() {
    this.mostrarModalCalendario = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarCalendario() {
    this.mostrarModalCalendario = false;
    document.body.style.overflow = 'auto';
  }
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
  getInitials(): string {
    if (this.usuario?.email) {
      return this.usuario.email.charAt(0).toUpperCase();
    }
    return 'U';
  }
  mostrarRecordatorios() {
    this.toast.info('Sección de recordatorios en desarrollo', 'Recordatorios');
  this.menuAbierto = false;
  }
  mostrarHistorial() {
    this.toast.info('Sección de historial en desarrollo', 'Historial');
  this.menuAbierto = false;
  }
  eliminarFoto() {
    this.photoUrl = null;
    this.toast.info('Foto eliminada', 'Información');
  }
  abrirOpcionesFoto() {
    this.mostrarModalFoto = true;
    this.menuAbierto = false;
  }
  cerrarModalFoto() {
    this.mostrarModalFoto = false;
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { Perfil } from '../perfil/perfil'; // Importar el componente Perfil
import { EstadoDeVacunacion } from '../estado-de-vacunacion/estado-de-vacunacion'
import { CalendarioDeVacunas } from '../calendario-de-vacunas/calendario-de-vacunas';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-area-privada',
  standalone: true,
  imports: [CommonModule, Perfil, EstadoDeVacunacion, CalendarioDeVacunas], // Añadir Perfil a imports
  templateUrl: './area-privada.html',
  styleUrls: ['./area-privada.scss']
})
export class AreaPrivada implements OnInit {
  usuario: User | null = null;
  photoUrl: string | undefined;
  mostrarModalPerfil: boolean = false; // Variable para controlar el modal
  mostrarModalEstadoSalud: boolean = false; // Variable para controlar el modal de estado de salud
  mostrarModalCalendario: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse al estado del usuario
    this.authService.user$.subscribe(user => {
      if (user) {
        this.usuario = user;
      } else {
        // Si no hay usuario, redirigir al login
        this.router.navigate(['/login']);
      }
    });
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      // El servicio ya redirige automáticamente al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      this.photoUrl = image.webPath;
    } catch (error) {
      console.error('Error al tomar foto:', error);
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
}
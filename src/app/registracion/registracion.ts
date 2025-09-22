import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registracion.html',
  styleUrls: ['./registracion.scss']
})
export class Registracion {
  email: string = '';
  password: string = '';
  mensaje: string = '';
  tipoMensaje: string = '';
  loading: boolean = false;
  mostrarRegistro: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.mostrarMensaje('Por favor, complete todos los campos.', 'error');
      return;
    }

    this.loading = true;
    this.mensaje = '';

    try {
      if (this.mostrarRegistro) {
        // Registro
        await this.authService.register({ 
          email: this.email, 
          password: this.password 
        });
        this.mostrarMensaje('Usuario registrado con éxito. Redirigiendo...', 'success');
        setTimeout(() => {
          this.router.navigate(['/area-privada']);
        }, 1500);
      } else {
        // Login
        await this.authService.login({ 
          email: this.email, 
          password: this.password 
        });
        this.mostrarMensaje('Inicio de sesión exitoso. Redirigiendo...', 'success');
        setTimeout(() => {
          this.router.navigate(['/area-privada']);
        }, 1500);
      }
    } catch (error) {
      this.mostrarMensaje(error as string, 'error');
    } finally {
      this.loading = false;
    }
  }

  toggleMode(event: Event) {
    event.preventDefault();
    this.mostrarRegistro = !this.mostrarRegistro;
    this.mensaje = '';
    this.limpiarFormulario();
  }

  private mostrarMensaje(mensaje: string, tipo: string) {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }

  private limpiarFormulario() {
    this.email = '';
    this.password = '';
  }
}


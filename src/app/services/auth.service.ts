import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private firebaseAuth: Auth = inject(Auth);
  private router = inject(Router);

  // Observable para el estado del usuario
private userSubject = new BehaviorSubject<User | null>(null);
public user$ = this.userSubject.asObservable();

  constructor() {
	// Escuchar cambios en el estado de autenticación
	onAuthStateChanged(this.firebaseAuth, (user) => {
		this.userSubject.next(user);
	});
   }

	async register({ email, password } : { email: string; password: string }) {
		try {
			const userCredential = await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
			return userCredential;
		} catch (error: any) {
      console.error('Register error:', error);
			throw this.getErrorMessage(error.code);
		}
	}

	async login({ email, password } : { email: string; password: string }) {
		try {
			const userCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
			return userCredential;
		} catch (error: any) {
      console.error('Login error:', error);
	  throw this.getErrorMessage(error.code);
		}
	}

	async logout() {
		try {
			await signOut(this.firebaseAuth);
			this.router.navigate(['/login']);
		} catch (error) {
			console.error('Logout error', error);
			throw error;
		}
	}
	// Obtener el usuario actual
	getCurrentUser(): User | null {
		return this.firebaseAuth.currentUser;
	  }
	  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Mensajes de error más amigables
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-disabled':
        return 'Usuario deshabilitado';
      default:
        return 'Error de autenticación';
    }
  }
}




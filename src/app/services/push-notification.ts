import { Injectable } from '@angular/core';
import { 
  PushNotifications, 
  Token, 
  PushNotificationSchema, 
  ActionPerformed 
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PushNotification {
  constructor() { }

  async initPushNotifications() {
    if (Capacitor.getPlatform() === 'ios') {
      await this.registerNotifications();
      this.addListeners();
    }
  }

  async registerNotifications() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Permisos denegados');
      return;
    }

    await PushNotifications.register();
  }

  addListeners() {
    // Cuando se registra exitosamente
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Token: ' + token.value);
      // Aquí guardarías el token en tu backend
    });

    // Error al registrar
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error: ' + JSON.stringify(error));
    });

    // Notificación recibida (app abierta)
    PushNotifications.addListener(
      'pushNotificationReceived', 
      (notification: PushNotificationSchema) => {
        console.log('Notificación recibida: ' + JSON.stringify(notification));
      }
    );

    // Usuario toca la notificación
    PushNotifications.addListener(
      'pushNotificationActionPerformed', 
      (notification: ActionPerformed) => {
        console.log('Notificación tocada: ' + JSON.stringify(notification));
      }
    );
  }
}

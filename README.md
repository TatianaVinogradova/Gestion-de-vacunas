# Gestión de Vacunas

Sistema de gestión y seguimiento de vacunación construido con Angular 20 y Firebase.

## Características

- Autenticación de usuarios con Firebase Auth
- Calendario de vacunas
- Estado de vacunación
- Perfil de usuario
- PWA - funciona sin conexión
- Notificaciones push (Capacitor)
- Captura de fotos (Capacitor)

## Tecnologías

- Angular 20
- Firebase (Auth, Firestore, Storage, Messaging)
- Bootstrap 5
- Capacitor (iOS support)
- Service Worker (PWA)

## Requisitos previos

- Node.js (v18 o superior)
- npm o yarn
- Angular CLI: `npm install -g @angular/cli`

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/TatianaVinogradova/Gestion-de-vacunas.git
cd Gestion-de-vacunas
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar Firebase
- Crear archivo `src/environments/environment.ts`
- Copiar configuración de Firebase

4. Ejecutar en desarrollo
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Scripts disponibles

- `npm start` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm test` - Ejecutar tests
- `npm run watch` - Build en modo watch

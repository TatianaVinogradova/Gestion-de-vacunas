import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyD8YcpE0FCINW2rp-z9BLDQRAFzxq1cVM",
  authDomain: "gestion-de-vacunas.firebaseapp.com",
  projectId: "gestion-de-vacunas",
  storageBucket: "gestion-de-vacunas.firebasestorage.app",
  messagingSenderId: "31131656S409",
  appId: "1:31131165654409:web:ece0db2760ec2b8dcc0fe0",
  measurementId: "G-1Q8NLNXKvW"
};

initializeApp(firebaseConfig);


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

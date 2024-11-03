import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { initializeApp } from 'firebase/app'; // Asegúrate de importar initializeApp
initializeApp(environment.firebaseConfig); // Inicializa Firebase aquí

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

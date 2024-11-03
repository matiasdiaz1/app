import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);

  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent' });
  }

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  // GUARDAR ELEMENTO EN LOCALSTORAGE
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  // OBTENER ELEMENTO EN LOCALSTORAGE
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }
}

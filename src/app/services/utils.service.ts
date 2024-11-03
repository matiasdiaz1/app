import { inject, Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);


  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent' })
  }
}
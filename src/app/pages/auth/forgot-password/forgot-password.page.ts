// forgot-password.page.ts
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {  // Removemos el OnInit
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.email
    ]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  // Removemos el ngOnInit que causaba la redirección

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const email = this.form.get('email')!.value;
        await this.firebaseSvc.sendRecoveryEmail(email);
        
        this.form.reset();
        this.utilsSvc.presentToast({
          message: 'Correo de recuperación enviado exitosamente',
          duration: 2500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
        
        this.router.navigate(['/auth/login']);
      } catch (error: any) {
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }
}
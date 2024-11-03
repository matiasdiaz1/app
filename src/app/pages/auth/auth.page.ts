import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    isTeacher: new FormControl(false)
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      const user: User = {
        email: this.form.get('email')!.value,
        password: this.form.get('password')!.value,
        name: '', // Puedes ajustar esto si es necesario
        uid: '',
        isTeacher: this.form.get('isTeacher')!.value
      };

      console.log('Intentando iniciar sesión con:', user);

      this.firebaseSvc.signIn(user).then(res => {
        console.log('Usuario autenticado con éxito:', res);
        this.router.navigate(['/main/home']);
      }).catch(error => {
        console.error('Error de autenticación:', error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }).finally(() => {
        loading.dismiss();
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}

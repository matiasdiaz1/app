import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required,])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      const user: User = {
        email: this.form.get('email')!.value,
        password: this.form.get('password')!.value,
        name: 'defaultName' // Agrega un valor por defecto si es necesario
        ,
        uid: ''
      };

      console.log('Intentando iniciar sesión con:', user);

      this.firebaseSvc.signIn(user).then(res => {
        console.log('Usuario autenticado con éxito:', res);
      }).catch(error => {
        console.error('Error de autenticación:', error);
      }).finally(() => {
        loading.dismiss();
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}

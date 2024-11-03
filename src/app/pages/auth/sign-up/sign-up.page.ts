import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.updateUser(this.form.value.name);

      const user: User = {
        email: this.form.get('email')!.value,
        password: this.form.get('password')!.value,
        name: this.form.get('name')!.value,  // Valor del nombre desde el formulario
        uid: ''
      };

      console.log('Intentando registrar usuario con:', user);

      this.firebaseSvc.signUp(user).then(res => {
        console.log('Usuario registrado con éxito:', res);
      }).catch(error => {
        console.error('Error al registrar usuario:', error);

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

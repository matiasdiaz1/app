import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)])
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
        name: this.form.get('name')!.value,
        uid: ''
      };

      console.log('Intentando registrar usuario con:', user);

      try {
        const res = await this.firebaseSvc.signUp(user);
        const uid = res.user.uid;
        this.form.controls.uid.setValue(uid);
        await this.setUserInfo(uid); // Espera a que se complete
        console.log('Usuario registrado con éxito:', res);
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss(); // Asegúrate de que se llame aquí
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  async setUserInfo(uid: string) {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    const userData = { ...this.form.value };
    delete userData.password; // Eliminar la contraseña antes de guardar

    const path = `users/${uid}`;

    try {
      await this.firebaseSvc.setDocument(path, userData);
      console.log('Usuario registrado en Firestore con éxito');
      this.router.navigate(['/main/home']); // Redirigir al home
      this.form.reset();
    } catch (error) {
      console.error('Error al registrar usuario en Firestore:', error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss(); // Asegúrate de que se llame aquí
    }
  }
}

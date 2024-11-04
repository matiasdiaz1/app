import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  ngOnInit() {
    this.firebaseSvc.signOut(); // Asegúrate de que no haya un usuario activo al cargar la página
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const user = {
          email: this.form.get('email')!.value,
          password: this.form.get('password')!.value,
          isTeacher: this.form.get('isTeacher')!.value
        };

        const res = await this.firebaseSvc.signIn(user);

        if (res && res.user) {
          this.form.reset();
          // Redirección según el rol del usuario
          if (user.isTeacher) {
            this.router.navigate(['/main/teacher-home']); // Redirige a la página de profesor
          } else {
            this.router.navigate(['/main/student-home']); // Redirige a la página de alumno
          }
        }
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
    } else {
      this.utilsSvc.presentToast({
        message: 'Por favor, completa todos los campos correctamente',
        duration: 2500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
  }
}

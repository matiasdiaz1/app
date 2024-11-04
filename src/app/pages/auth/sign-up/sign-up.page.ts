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
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
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

      try {
        const user: User = {
          email: this.form.get('email')!.value,
          password: this.form.get('password')!.value,
          name: this.form.get('name')!.value,
          uid: '',
          isTeacher: this.form.get('isTeacher')!.value,
          role: this.form.get('isTeacher')!.value ? 'teacher' : 'student'
        };

        const res = await this.firebaseSvc.signUp(user);

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

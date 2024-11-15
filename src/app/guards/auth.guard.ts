import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise((resolve) => {
      this.firebaseSvc.getAuth().onAuthStateChanged(async (auth) => {
        if (auth) {
          const userEmail = localStorage.getItem('userEmail');
          const isTeacher = localStorage.getItem('isTeacher') === 'true';

          if (userEmail) {
            // Verificar si la ruta actual coincide con el rol del usuario
            const currentPath = state.url;
            const isTeacherRoute = currentPath.includes('teacher-home');
            const isStudentRoute = currentPath.includes('student-home');

            if ((isTeacher && isTeacherRoute) || (!isTeacher && isStudentRoute)) {
              resolve(true);
              return;
            } else {
              // Redirigir al usuario a su ruta correspondiente
              const correctPath = isTeacher ? '/main/teacher-home' : '/main/student-home';
              await this.utilsSvc.routerLink(correctPath);
              resolve(false);
              return;
            }
          }
        }
        await this.utilsSvc.routerLink('/auth');
        resolve(false);
      });
    });
  }
}

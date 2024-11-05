import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  [x: string]: any;

  private authState = new BehaviorSubject<any>(null);
  public currentUser$ = this.authState.asObservable();

  firestore = inject(AngularFirestore);
  router = inject(Router);

  constructor(private afAuth: AngularFireAuth) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.authState.next(user);
    });
  }

  // AUTENTICACIÓN CON VERIFICACIÓN DE ROL
  async signIn(user: User) {
    if (!user.email || !user.password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      const userDoc = await this.getUserProfile(userCredential.user.uid);

      if (userDoc.isTeacher !== user.isTeacher) {
        await auth.signOut();
        throw new Error(user.isTeacher ? 
          'Esta cuenta no es de profesor' : 
          'Esta cuenta no es de alumno');
      }

      await this.verifyUserSession(userCredential.user);
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // REGISTRO CON VERIFICACIÓN DE ROL
  async signUp(user: User) {
    if (!user.email || !user.password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      if (userCredential.user) {
        if (user.name) {
          await this.updateUser(user.name);
        }

        const userData = {
          uid: userCredential.user.uid,
          email: user.email,
          name: user.name,
          isTeacher: user.isTeacher,
          role: user.isTeacher ? 'teacher' : 'student',
          createdAt: new Date().toISOString()
        };

        await this.setDocument(`users/${userCredential.user.uid}`, userData);
      }

      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // ACTUALIZAR PERFIL
  async updateUser(displayName: string) {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      await updateProfile(currentUser, { displayName });
      return true;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      throw error;
    }
  }

  // OBTENER PERFIL DE USUARIO
  async getUserProfile(uid: string) {
    try {
      const db = getFirestore();
      const docRef = doc(db, `users/${uid}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as User;
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  // OBTENER DOCUMENTO DE FIRESTORE
  async getDocument(path: string) {
    const db = getFirestore();
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error('No se encontró el documento:', path);
      return null;
    }
  }

  // VERIFICAR SESIÓN
  private async verifyUserSession(user: any) {
    if (!user) {
      throw new Error('No se pudo verificar la sesión del usuario');
    }

    try {
      const token = await user.getIdToken();
      localStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  }

  // GUARDAR DOCUMENTO EN FIRESTORE
  async setDocument(path: string, data: any) {
    try {
      const db = getFirestore();
      await setDoc(doc(db, path), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error al guardar documento:', error);
      throw error;
    }
  }

  // REGISTRAR ASISTENCIA
  async registerAttendance(studentId: string, teacherId: string) {
    const db = getFirestore();
    const attendanceRecord = {
      studentId: studentId,
      teacherId: teacherId,
      date: new Date().toISOString(), // Fecha y hora actual
    };

    try {
      await setDoc(doc(db, `attendance/${studentId}_${teacherId}_${new Date().toISOString()}`), attendanceRecord);
      console.log('Asistencia registrada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      throw error;
    }
  }

  // CERRAR SESIÓN
  async signOut() {
    try {
      const auth = getAuth();
      await auth.signOut();
      localStorage.removeItem('userToken');
      this.authState.next(null);
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // MANEJAR ERRORES DE AUTENTICACIÓN
  private handleAuthError(error: any) {
    let message = 'Ha ocurrido un error en la autenticación';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Este correo electrónico ya está registrado';
        break;
      case 'auth/invalid-email':
        message = 'El correo electrónico no es válido';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operación no permitida';
        break;
      case 'auth/weak-password':
        message = 'La contraseña es demasiado débil';
        break;
      case 'auth/user-disabled':
        message = 'Esta cuenta ha sido deshabilitada';
        break;
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos fallidos. Por favor, intente más tarde';
        break;
    }

    console.error('Error de autenticación:', message);
    throw new Error(message);
  }
}

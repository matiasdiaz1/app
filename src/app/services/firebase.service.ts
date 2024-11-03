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
import { getFirestore, setDoc, doc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  
  private authState = new BehaviorSubject<any>(null);
  public currentUser$ = this.authState.asObservable();
  
  firestore = inject(AngularFirestore);
  
  constructor(private afAuth: AngularFireAuth) {
    // Observar cambios en el estado de autenticación
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.authState.next(user);
    });
  }

  // AUTENTIFICACION
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
      await this.verifyUserSession(userCredential.user);
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // REGISTRAR NUEVO USUARIO
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
      
      // Actualizar el perfil inmediatamente después de crear la cuenta
      if (userCredential.user && user.name) {
        await this.updateUser(user.name);
      }
      
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // ACTUALIZAR USUARIO
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

  // Verificar sesión del usuario
  private async verifyUserSession(user: any) {
    if (!user) {
      throw new Error('No se pudo verificar la sesión del usuario');
    }
    
    try {
      const token = await user.getIdToken();
      // Guardar el token en localStorage si lo necesitas
      localStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  }

  // BASE DE DATOS
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

  // Cerrar sesión
  async signOut() {
    try {
      const auth = getAuth();
      await auth.signOut();
      localStorage.removeItem('userToken');
      this.authState.next(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Manejador de errores de autenticación
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
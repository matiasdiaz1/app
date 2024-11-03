import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private afAuth: AngularFireAuth) { }

  // AUTENTIFICACION
  signIn(user: User) {
    if (!user.email || !user.password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    const auth = getAuth();
    return signInWithEmailAndPassword(auth, user.email, user.password)
      .catch(error => {
        console.error('Error al iniciar sesión:', error);
        throw error; // O maneja el error de alguna otra forma
      });
  }

  // REGISTRAR NUEVO USUARIO
  signUp(user: User) {
    if (!user.email || !user.password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, user.email, user.password)
      .catch(error => {
        console.error('Error al registrar usuario:', error);
        throw error; // O maneja el error de alguna otra forma
      });
  }

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

}

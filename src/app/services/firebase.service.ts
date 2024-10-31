import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject( AngularFireAuth );





// AUTENTIFICACION



// acceder

signIn(user: User) {
  return signInWithEmailAndPassword(getAuth(), user.name, user.password )
}


}
import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { User } from 'src/app/models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Attendance } from 'src/app/models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
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

  async getCourses() {
    try {
      const db = getFirestore();
      const coursesCollection = collection(db, 'cursos');
      const courseSnapshot = await getDocs(coursesCollection);
      const coursesList: any[] = [];

      courseSnapshot.forEach((doc) => {
        coursesList.push({ id: doc.id, ...doc.data() });
      });

      console.log('Cursos cargados:', coursesList); // Log para depuración
      return coursesList;
    } catch (error) {
      console.error('Error al obtener los cursos:', error);
      throw error;
    }
  }

  async getSections(courseId: string) {
    try {
      const db = getFirestore();
      const sectionsCollection = collection(db, `cursos/${courseId}/secciones`);
      const sectionsSnapshot = await getDocs(sectionsCollection);
      const sectionsList: any[] = [];

      sectionsSnapshot.forEach((doc) => {
        sectionsList.push({ id: doc.id, ...doc.data() });
      });

      console.log('Secciones cargadas:', sectionsList); // Log para depuración
      return sectionsList;
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
      throw error;
    }
  }

  async signIn(user: User) {
    if (!user.email || !user.password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
      const userDoc = await this.getUserProfile(userCredential.user.uid);

      if (userDoc.isTeacher !== user.isTeacher) {
        await auth.signOut();
        throw new Error(user.isTeacher ? 'Esta cuenta no es de profesor' : 'Esta cuenta no es de alumno');
      }

      await this.verifyUserSession(userCredential.user);
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async signUp(user: User) {
    if (!user.email || !user.password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

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

  private handleAuthError(error: any) {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña es demasiado débil',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, intente más tarde',
    };
    throw new Error(messages[error.code] || 'Ha ocurrido un error en la autenticación');
  }

  async recordAttendance(attendance: Attendance) {
    try {
        const currentUser = this.afAuth.currentUser; // Obtener el usuario autenticado
        if (!currentUser) {
            throw new Error('No hay usuario autenticado');
        }
        
        // Obtener el ID del estudiante
        const studentId = (await currentUser).uid; 

        // Obtener el perfil del estudiante para obtener su nombre
        const userProfile = await this.getUserProfile(studentId); 
        
        // Asignar los valores a la asistencia
        attendance.studentId = studentId; // ID del estudiante
        attendance.studentName = userProfile.name; // Nombre del estudiante

        // Registrar la asistencia en Firestore
        const db = getFirestore();
        const attendancePath = `attendances/${attendance.studentId}_${attendance.date}`; 
        await setDoc(doc(db, attendancePath), attendance);
        console.log('Asistencia registrada:', attendance);
        return true;
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        throw error;
    }
}

  async signOut() {
    const auth = getAuth();
    await auth.signOut();
    localStorage.clear();
    this.authState.next(null);
    await this.router.navigate(['/auth']);
  }

  async getStudentAttendance(studentId: string) {
    try {
      const db = getFirestore();
      const attendanceCollection = collection(db, 'attendances');
      const q = query(attendanceCollection, where('studentId', '==', studentId));
      const attendanceSnapshot = await getDocs(q);

      const attendanceList: Attendance[] = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));

      return attendanceList;
    } catch (error) {
      console.error('Error al obtener las asistencias:', error);
      throw error;
    }
  }

  async getAllAttendance(courseId: string, section: string) {
    try {
        const db = getFirestore();
        const attendanceCollection = collection(db, 'attendances');
        const q = query(attendanceCollection, where('courseId', '==', courseId), where('section', '==', section));
        const attendanceSnapshot = await getDocs(q);

        const attendanceList: Attendance[] = attendanceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Attendance));

        return attendanceList;
    } catch (error) {
        console.error('Error al obtener las asistencias:', error);
        throw error;
    }
}
}

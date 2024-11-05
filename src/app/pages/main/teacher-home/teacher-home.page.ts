import { Component } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Attendance } from 'src/app/models/attendance.model';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.page.html',
  styleUrls: ['./teacher-home.page.scss'],
})
export class TeacherHomePage {
  // Cursos predefinidos
  courses = [
    { id: 'Matemáticas', name: 'Matemáticas', sections: ['Sección A', 'Sección B'] },
    { id: 'Ciencias', name: 'Ciencias', sections: ['Sección A', 'Sección B', 'Sección C'] },
    { id: 'Historia', name: 'Historia', sections: ['Sección A'] },
  ];

  selectedCourseId: string | null = null;
  selectedSection: string | null = null;
  attendanceRecords: Attendance[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  onCourseChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.selectedSection = null; // Resetear sección al cambiar de curso
  }

  async onSectionChange(section: string) {
    this.selectedSection = section;
  }

  async loadAttendance() {
    if (!this.selectedCourseId || !this.selectedSection) {
      this.showAlert('Error', 'Selecciona un curso y una sección para cargar la asistencia');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Cargando asistencia...'
    });
    await loading.present();

    try {
      // Cargar asistencia con curso y sección
      this.attendanceRecords = await this.firebaseService.getAllAttendance(this.selectedCourseId, this.selectedSection);
    } catch (error) {
      console.error('Error al cargar la asistencia:', error);
      this.showAlert('Error', 'Hubo un problema al cargar la asistencia. Por favor, intenta nuevamente.');
    } finally {
      await loading.dismiss();
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}

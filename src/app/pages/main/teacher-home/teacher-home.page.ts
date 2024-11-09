import { Component } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { QRCodeService } from 'src/app/services/qrcode.service'; // Asegúrate de tener este servicio implementado
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.page.html',
  styleUrls: ['./teacher-home.page.scss'],
})
export class TeacherHomePage {
  courses: any[] = [];
  sections: any[] = [];
  selectedCourseId: string | null = null;
  selectedSection: string | null = null;
  qrCodeUrl: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private qrCodeService: QRCodeService, // Inyecta el servicio de generación de QR
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loadCourses();
  }

  async loadCourses() {
    try {
      this.courses = await this.firebaseService.getCourses();
      console.log('Cursos cargados:', this.courses); // Añadir log para depuración
    } catch (error) {
      console.error('Error al cargar los cursos:', error);
      this.showAlert('Error', 'Hubo un problema al cargar los cursos. Por favor, intenta nuevamente.');
    }
  }

  async onCourseChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.selectedSection = null;
    try {
      this.sections = await this.firebaseService.getSections(courseId);
      console.log('Secciones cargadas:', this.sections); // Añadir log para depuración
    } catch (error) {
      console.error('Error al cargar las secciones:', error);
      this.showAlert('Error', 'Hubo un problema al cargar las secciones. Por favor, intenta nuevamente.');
    }
  }

  async generateQRCode() {
    if (!this.selectedCourseId || !this.selectedSection) {
      this.showAlert('Error', 'Selecciona un curso y una sección antes de generar el código QR');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[1].split('.')[0];

    const qrData = {
      courseId: this.selectedCourseId,
      section: this.selectedSection,
      date,
      time
    };

    try {
      const loading = await this.loadingController.create({
        message: 'Generando código QR...'
      });
      await loading.present();

      this.qrCodeUrl = await this.qrCodeService.generateQRCode(JSON.stringify(qrData));

      await loading.dismiss();
      this.showToast('Código QR generado correctamente');
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      this.showAlert('Error', 'Hubo un problema al generar el código QR. Por favor, intenta nuevamente.');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
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

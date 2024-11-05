import { Component } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { QRCodeService } from 'src/app/services/qrcode.service';
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
    { id: 'cCiencias', name: 'Ciencias', sections: ['Sección A', 'Sección B', 'Sección C'] },
    { id: 'Historia', name: 'Historia', sections: ['Sección A'] },
  ];

  selectedCourseId: string | null = null;
  selectedSection: string | null = null;
  qrCodeUrl: string | null = null;
  timestamp: number | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private qrCodeService: QRCodeService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  onCourseChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.selectedSection = null; // Resetear sección al cambiar de curso
  }

  async generateQRCode() {
    if (!this.selectedCourseId || !this.selectedSection) {
      this.showAlert('Error', 'Selecciona un curso y una sección antes de generar el código QR');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];

    // Ajustar la hora para que no esté adelantada
    const time = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[1].split('.')[0]; // Obtener la hora local

    this.timestamp = now.getTime();

    const qrData = {
      courseId: this.selectedCourseId,
      section: this.selectedSection,
      date,
      time,
      timestamp: this.timestamp
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

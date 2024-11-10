import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Attendance } from 'src/app/models/attendance.model';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.page.html',
  styleUrls: ['./student-home.page.scss'],
})
export class StudentHomePage implements OnInit {
  isSupported = false;
  user: any = null;
  courses: any[] = [];
  selectedCourseId: string | null = null;
  attendanceRecords: Attendance[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const result = await BarcodeScanner.isSupported();
    this.isSupported = result.supported;

    this.firebaseService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadCourses(); // Cargar cursos al iniciar
      }
    });
  }

  async loadCourses() {
    try {
      this.courses = await this.firebaseService.getCourses();
      console.log('Cursos cargados:', this.courses); // Log para depuración
    } catch (error) {
      console.error('Error al cargar los cursos:', error);
      this.showAlert('Error', 'Hubo un problema al cargar los cursos. Por favor, intenta nuevamente.');
    }
  }

  async onCourseChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.loadAttendance(); // Cargar asistencias del curso seleccionado
  }

  async loadAttendance() {
    if (!this.selectedCourseId) {
      return;
    }

    try {
      const attendanceList = await this.firebaseService.getStudentAttendance(this.user.uid);
      this.attendanceRecords = attendanceList.filter(record => record.courseId === this.selectedCourseId);

      if (this.attendanceRecords.length === 0) {
        this.showToast('No se han registrado asistencias para este curso.');
      }
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      this.showAlert('Error', 'Hubo un error al cargar las asistencias. Por favor, intenta nuevamente.');
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted';
  }

  async scan() {
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        this.showAlert('Permiso Requerido', 'Necesitamos acceso a la cámara para escanear el código QR.');
        return;
      }

      const { barcodes } = await BarcodeScanner.scan();

      if (barcodes.length === 0) {
        this.showToast('No se detectó ningún código QR');
        return;
      }

      await this.processQRCode(barcodes[0].rawValue);

    } catch (error) {
      console.error('Error en el escaneo:', error);
      this.showAlert('Error', 'Hubo un error al procesar el código QR. Por favor, intenta nuevamente.');
    }
  }

  private async processQRCode(rawValue: string) {
    let qrData;

    try {
      qrData = JSON.parse(rawValue);
    } catch (parseError) {
      console.error('Error al parsear el QR:', parseError);
      this.showAlert('Error', 'El código QR escaneado no es válido.');
      return;
    }

    // Validar que todos los campos necesarios están presentes
    const requiredFields = ['courseId', 'section', 'date', 'time'];
    for (const field of requiredFields) {
      if (!qrData[field]) {
        console.error(`El campo ${field} falta en el QR escaneado.`);
        this.showAlert('Error', `El código QR escaneado no contiene el campo necesario: ${field}.`);
        return;
      }
    }

    // Registrar asistencia
    const attendanceData: Attendance = {
      studentId: this.user.uid,
      studentName: this.user.name || 'Desconocido', // Nombre del estudiante
      courseId: qrData.courseId,
      section: qrData.section,
      date: qrData.date,
      time: qrData.time,
      attended: true
    };

    await this.recordAttendance(attendanceData);
  }

  private async recordAttendance(attendanceData: Attendance) {
    try {
      await this.firebaseService.recordAttendance(attendanceData);
      this.showToast('¡Asistencia registrada con éxito!');
      this.loadAttendance(); // Actualizar lista de asistencias
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      this.showAlert('Error', 'Hubo un error al registrar la asistencia. Por favor, intenta nuevamente.');
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

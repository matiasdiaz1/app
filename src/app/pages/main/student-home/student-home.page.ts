import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AttendanceModalComponent } from '../attendance-modal/attendance-modal.component'; // Ajusta la ruta aquí
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.page.html',
  styleUrls: ['./student-home.page.scss'],
})
export class StudentHomePage implements OnInit {
  courses = [
    { subject: 'Matemáticas', section: 'A', attendance: [] },
    { subject: 'Historia', section: 'B', attendance: [] },
    { subject: 'Ciencias', section: 'C', attendance: [] }
  ];

  isSupported = false;
  barcodes: Barcode[] = [];

  constructor(
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  async scanBarcode(course: any): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }

    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);

    const studentId = 'ID_DEL_ESTUDIANTE'; // Reemplaza con el ID real del estudiante
    const teacherId = 'ID_DEL_PROFESOR'; // Reemplaza con el ID real del profesor
    const attendanceRecord = {
      studentId,
      teacherId,
      course: course.subject,
      section: course.section,
      date: new Date().toISOString()
    };

    await this.firebaseService.setDocument(`attendance/${studentId}_${teacherId}_${course.subject}`, attendanceRecord);
    course.attendance.push(attendanceRecord);
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permiso denegado',
      message: 'Para usar la aplicación, autoriza los permisos de cámara.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async openAttendanceModal(course: any) {
    const modal = await this.modalController.create({
      component: AttendanceModalComponent,
      componentProps: {
        course: course
      }
    });
    await modal.present();
  }

  async getAttendance(course: any) {
    const studentId = 'ID_DEL_ESTUDIANTE'; // Reemplaza con el ID real del estudiante
    const teacherId = 'ID_DEL_PROFESOR'; // Reemplaza con el ID real del profesor

    const docSnap = await this.firebaseService['getDocument'](`attendance/${studentId}_${teacherId}_${course.subject}`);
    
    // Acceder a las propiedades con notación de corchetes
    if (docSnap['exists']) {
      course.attendance = docSnap['data']().attendance || [];
    } else {
      console.error('No se encontró el registro de asistencia');
    }
  }
}

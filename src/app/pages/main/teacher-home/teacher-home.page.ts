import { Component, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { QRCodeService } from 'src/app/services/qrcode.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.page.html',
  styleUrls: ['./teacher-home.page.scss'],
})
export class TeacherHomePage {
createCourse() {
throw new Error('Method not implemented.');
}
  courses: any[] = [];
  sections: any[] = [];
  selectedCourseId: string | null = null;
  selectedSection: string | null = null;
  qrCodeUrl: string | null = null;
  attendanceList: any[] = [];
  newCourse: any = {
    name: '',
    section: ''
  };
  newSection: any = {
    nombre: '',
    numero_seccion: ''
  };
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  constructor(
    private firebaseService: FirebaseService,
    private qrCodeService: QRCodeService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loadCourses();
  }

  // Cargar los cursos del profesor
  async loadCourses() {
    try {
      this.courses = await this.firebaseService.getCourses();
      console.log('Cursos cargados:', this.courses);
    } catch (error) {
      console.error('Error al cargar los cursos:', error);
      this.showAlert('Error', 'Hubo un problema al cargar los cursos. Por favor, intenta nuevamente.');
    }
  }

  // Cambiar el curso seleccionado y cargar las secciones correspondientes
  async onCourseChange(courseId: string) {
    this.selectedCourseId = courseId;
    this.selectedSection = null;
    try {
      this.sections = await this.firebaseService.getSections(courseId);
      console.log('Secciones cargadas:', this.sections);
    } catch (error) {
      console.error('Error al cargar las secciones:', error);
      this.showAlert('Error', 'Hubo un problema al cargar las secciones. Por favor, intenta nuevamente.');
    }
  }

  // Cambiar la sección seleccionada y cargar la lista de asistencia
  async onSectionChange(section: string) {
    this.selectedSection = section;
    if (this.selectedCourseId && this.selectedSection) {
      this.firebaseService.listenToAttendance(this.selectedCourseId, this.selectedSection, async (attendance) => {
        this.attendanceList = await Promise.all(attendance.map(async (record) => {
          const percentage = await this.firebaseService.getAttendancePercentage(record.studentId, this.selectedCourseId);
          return { ...record, percentage };
        }));
        console.log('Asistencia actualizada:', this.attendanceList);
      });
    }
  }

  // Agregar una nueva sección
  async addSection() {
    if (!this.selectedCourseId || !this.newSection.nombre || !this.newSection.numero_seccion) {
      this.showAlert('Error', 'Por favor, completa todos los campos obligatorios');
      return;
    }

    // Verificar si la sección ya existe en el curso seleccionado
    const sectionExists = await this.checkSectionExists(this.selectedCourseId, this.newSection.nombre);
    if (sectionExists) {
      this.showAlert('Error', 'Ya existe una sección con ese nombre en este curso.');
      return;
    }

    try {
      await this.firebaseService.addSectionToCourse(this.selectedCourseId, this.newSection);
      this.showToast('Sección agregada exitosamente');
      this.newSection = { nombre: '', numero_seccion: '' }; // Resetear formulario
      this.loadCourses(); // Actualizar la lista de cursos
    } catch (error) {
      console.error('Error al agregar la sección:', error);
      this.showAlert('Error', 'Hubo un problema al agregar la sección. Por favor, intenta nuevamente.');
    }
  }

  // Función para verificar si la sección ya existe en el curso
  async checkSectionExists(courseId: string, sectionName: string): Promise<boolean> {
    try {
      const sections = await this.firebaseService.getSections(courseId);
      return sections.some(section => section.nombre === sectionName); // Verificar duplicados
    } catch (error) {
      console.error('Error al verificar las secciones:', error);
      return false; // Si ocurre un error, asumimos que la sección no existe
    }
  }

  // Función para generar un código QR para la sección seleccionada
  async generateQRCode() {
    if (!this.selectedCourseId || !this.selectedSection) {
      this.showAlert('Error', 'Selecciona un curso y una sección antes de generar el código QR');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[1].split('.')[0];
    const expirationTime = new Date(now.getTime() + 5 * 60000).toISOString(); // QR válido por 5 minutos

    const qrData = {
      courseId: this.selectedCourseId,
      section: this.selectedSection,
      date,
      time,
      expirationTime
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

  // Función para mostrar un toast
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  // Función para mostrar una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Cerrar sesión
  signOut() {
    this.firebaseSvc.signOut();
  }
}

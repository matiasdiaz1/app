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

  async loadCourses() {
    try {
      this.courses = await this.firebaseService.getCourses();
      console.log('Cursos cargados:', this.courses);
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
      console.log('Secciones cargadas:', this.sections);
    } catch (error) {
      console.error('Error al cargar las secciones:', error);
      this.showAlert('Error', 'Hubo un problema al cargar las secciones. Por favor, intenta nuevamente.');
    }
  }

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

  onSectionNameChange() {
    // Aceptar solo letras mayúsculas (A-Z) y evitar números o caracteres no válidos
    this.newSection.nombre = this.newSection.nombre.toUpperCase();
    if (!/^[A-Z]+$/.test(this.newSection.nombre)) {
      this.newSection.nombre = ''; // Restablecer el valor si no es una letra mayúscula
    }
    if (this.newSection.nombre.length === 1) {
      this.newSection.numero_seccion = this.newSection.nombre; // Sincronizar con el número de sección
    }
  }

  async addSection() {
    if (!this.selectedCourseId || !this.newSection.nombre || !this.newSection.numero_seccion) {
      this.showAlert('Error', 'Por favor, completa todos los campos obligatorios');
      return;
    }

    if (this.newSection.nombre !== this.newSection.numero_seccion) {
      this.showAlert('Error', 'El nombre de la sección y el número de sección deben ser iguales');
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

  async checkSectionExists(courseId: string, sectionName: string): Promise<boolean> {
    try {
      const sections = await this.firebaseService.getSections(courseId);
      return sections.some(section => section.nombre === sectionName); // Verificar duplicados
    } catch (error) {
      console.error('Error al verificar las secciones:', error);
      return false; // Si ocurre un error, asumimos que la sección no existe
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

  signOut() {
    this.firebaseSvc.signOut();
  }
  async createCourse() {
    if (!this.newCourse.name || !this.newCourse.section) {
      this.showAlert('Error', 'Por favor, completa todos los campos obligatorios');
      return;
    }
  
    // Validate section name (uppercase letters only)
    const formattedSection = this.newCourse.section.toUpperCase();
    if (!/^[A-Z0-9]+$/.test(formattedSection)) {
      this.showAlert('Error', 'La sección solo puede contener letras mayúsculas o números');
      return;
    }
  
    const courseData = {
      nombre: this.newCourse.name,
    };
  
    try {
      // Usar el nombre del curso como ID del documento
      const courseRef = await this.firebaseService.addCourse(courseData);
  
      // Crear la subcolección de secciones para el curso
      const sectionData = {
        nombre: formattedSection,
        numero_seccion: formattedSection.substring(0, 1)
      };
  
      // Agregar la sección al curso recién creado
      await this.firebaseService.addSectionToCourse(this.newCourse.name, sectionData);
  
      this.showToast(`Curso "${this.newCourse.name}" creado exitosamente`);
  
      // Resetear formulario
      this.newCourse = { name: '', section: '' };
  
      // Actualizar la lista de cursos
      this.loadCourses();
    } catch (error) {
      console.error('Error al crear el curso:', error);
      this.showAlert('Error', 'Hubo un problema al crear el curso. Por favor, intenta nuevamente.');
    }
  }
  
}
// src/app/models/attendance.model.ts
export interface Attendance {
  id?: string;         // ID del documento (opcional)
  studentId: string;   // UID del estudiante
  studentName: string; // Nombre del estudiante
  courseId: string;    // ID del curso
  section: string;     // Sección del curso
  date: string;        // Fecha de la clase (en formato YYYY-MM-DD)
  time: string;        // Hora de la clase (en formato HH:MM)
  attended: boolean;   // Indica si asistió o no
}

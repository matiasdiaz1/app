export interface User {
    uid: string;
    email: string;
    password: string;
    name: string;
    isTeacher?: boolean; // Hacer opcional
    role?: string; // Hacer opcional
  }
  
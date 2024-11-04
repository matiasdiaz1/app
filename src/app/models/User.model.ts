export interface User {
  uid?: string;
  email: string;
  password: string;
  name?: string;
  isTeacher: boolean;
  role?: string;
}

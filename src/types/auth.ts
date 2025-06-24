export interface User {
  id: string;
  name: string;
  userName: string;
  idNumber: string;
  role: 'admin' | 'student';
  department?: string;
}

export interface LoginCredentials {
  idNumber: string;
  name: string;
}

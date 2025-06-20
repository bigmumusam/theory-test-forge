
export interface User {
  id: string;
  name: string;
  idNumber: string;
  role: 'admin' | 'student';
  department?: string;
  status: '0' | '1';
  createTime?: string;
  updateTime?: string;
}

export interface UserCreateRequest {
  name: string;
  idNumber: string;
  role: 'admin' | 'student';
  department?: string;
}

export interface UserUpdateRequest {
  id: string;
  name: string;
  idNumber: string;
  role: 'admin' | 'student';
  department?: string;
  status: '0' | '1';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  status: '0' | '1';
}

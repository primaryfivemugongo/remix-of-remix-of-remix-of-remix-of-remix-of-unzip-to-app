export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  schoolEmail: string;
  name: string;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  grade: string;
  section: string;
  parentContact?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  department: string;
  subjects: string[];
  qualification: string;
}

export interface Admin extends User {
  role: 'admin';
  adminId: string;
  department: string;
  permissions: string[];
}
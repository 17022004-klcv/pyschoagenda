import { Timestamp } from "firebase/firestore";

// Extendemos los roles para incluir usuarios no asignados que acaban de registrarse con Google
export type UserRole = "admin" | "psychologist" | "receptionist" | "unassigned";

// Extendemos los estados para manejar el flujo de aprobación
export type UserStatus = "active" | "inactive" | "pending" | "rejected";

// Firestore Document (Mantenemos tu estructura original)
export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp;
}

// UI Model (Mantenemos tu estructura original)
export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

// Data para creación / edición (Mantenemos tu estructura original)
export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  photoURL: string;
  password?: string;
}

// DTOs específicos para las acciones del Admin al aprobar/rechazar solicitudes
export interface ApproveUserPayload {
  uid: string;
  role: UserRole;
}

export interface RejectUserPayload {
  uid: string;
}

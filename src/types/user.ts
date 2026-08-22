import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "psychologist" | "receptionist";
export type UserStatus = "active" | "inactive";

// Firestore Document
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

// UI Model
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

// Data para creación / edición
export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  photoURL: string;
  password?: string; // Requerida solo al crear o si el admin la cambia
}

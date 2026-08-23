import { Timestamp } from "firebase/firestore";

export type AuditAction = "INSERT" | "UPDATE" | "DELETE";

export type AuditCollection =
  | "appointments"
  | "expedients"
  | "patients"
  | "sessions"
  | "therapy_categories"
  | "users";

export interface AuditLogDocument {
  id?: string;
  action: AuditAction;
  collectionName: AuditCollection;
  documentId: string;
  performedBy: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };
  details?: string; // Breve descripción (ej: "Paciente Juan Pérez creado")
  previousData?: Record<string, any> | null; // Datos antes del cambio (en UPDATE/DELETE)
  newData?: Record<string, any> | null; // Datos nuevos (en INSERT/UPDATE)
  timestamp: Timestamp;
}

export interface AuditLogUI {
  id: string;
  action: AuditAction;
  collectionName: AuditCollection;
  documentId: string;
  performedBy: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };
  details: string;
  timestamp: string;
}

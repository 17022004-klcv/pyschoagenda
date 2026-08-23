export type TherapyType =
  | "Terapia Individual"
  | "Terapia de Pareja"
  | "Terapia Familiar"
  | "Terapia en Línea"
  | "Orientación Vocacional"
  | "Terapia de Grupo";

export type AppointmentStatus = "Programada" | "Completada" | "Cancelada";

export interface Appointment {
  id: string;
  patientIds: string[];
  patientNames: string[];
  therapyType: TherapyType;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  status: AppointmentStatus;
  notes?: string;
}

export interface CreateAppointmentDTO {
  patientIds: string[];
  patientNames: string[];
  therapyType: TherapyType;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
}

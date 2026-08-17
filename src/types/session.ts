export interface SessionData {
  id?: string;
  expedientCode: string; // Ej: "EXP-2026-001"
  patientId: string;
  patientName?: string;
  therapyType: string;
  hasTutor: boolean;
  tutorName?: string;
  theme: string;
  summary: string;
  analysis: string;
  date: string;
  createdAt?: any;
}

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

export const AppointmentService = {
  // 🟢 GET: Obtener todas las citas
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch("/api/appointments", { method: "GET" });
    if (!response.ok) throw new Error("Error al obtener la lista de citas");
    return await response.json();
  },

  // 🟡 POST: Crear una nueva cita
  create: async (data: CreateAppointmentDTO): Promise<Appointment> => {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al agendar la cita");
    return await response.json();
  },

  // 🟠 PUT: Actualizar cita existente
  update: async (
    id: string,
    data: Partial<CreateAppointmentDTO>,
  ): Promise<void> => {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar la cita");
  },

  // 🔴 DELETE: Cancelar cita (Borrado Lógico)
  cancel: async (id: string): Promise<void> => {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al cancelar la cita");
  },
};

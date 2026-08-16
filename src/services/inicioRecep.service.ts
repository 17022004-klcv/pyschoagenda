export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason?: string;
  status: "Pendiente" | "Completada" | "Cancelada";
  notes?: string;
}

export const AppointmentService = {
  // 🟢 GET: Obtener citas por fecha específica (YYYY-MM-DD)
  getByDate: async (dateStr: string): Promise<Appointment[]> => {
    const response = await fetch(`/api/appointments?date=${dateStr}`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Error al obtener las citas de la fecha");
    return await response.json();
  },

  // 🟢 GET: Citas de Hoy
  getToday: async (): Promise<Appointment[]> => {
    const today = new Date().toISOString().split("T")[0];
    return await AppointmentService.getByDate(today);
  },

  // 🟢 GET: Citas de Mañana
  getTomorrow: async (): Promise<Appointment[]> => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
    return await AppointmentService.getByDate(tomorrowStr);
  },

  // 🟠 PATCH: Actualizar Estado
  updateStatus: async (id: string, status: string) => {
    try {
      // 🟢 Cambiado a PUT para coincidir con la API de Next.js
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la cita");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en updateStatus:", error);
      throw error;
    }
  },
};

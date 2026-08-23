import { Appointment, CreateAppointmentDTO } from "@/types/appointment";
import { UserContext } from "@/types/auditLog";
import { logAuditEvent } from "@/services/logger.service";

export const AppointmentService = {
  // 🟢 GET: Obtener todas las citas
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch("/api/appointments", { method: "GET" });
    if (!response.ok) throw new Error("Error al obtener la lista de citas");
    return await response.json();
  },

  // 🟡 POST: Crear una nueva cita
  create: async (
    data: CreateAppointmentDTO,
    user: UserContext,
  ): Promise<Appointment> => {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error al agendar la cita");

    const newAppointment: Appointment = await response.json();

    // Registrar en bitácora
    const patientList = data.patientNames.join(", ");
    await logAuditEvent({
      action: "INSERT",
      collectionName: "appointments",
      documentId: newAppointment.id,
      performedBy: user,
      details: `Cita de ${data.therapyType} agendada para: ${patientList}`,
      newData: data as Record<string, any>,
    });

    return newAppointment;
  },

  // 🟠 PUT: Actualizar cita existente
  update: async (
    id: string,
    data: Partial<CreateAppointmentDTO>,
    user: UserContext,
  ): Promise<void> => {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Error al actualizar la cita");

    // Registrar en bitácora
    await logAuditEvent({
      action: "UPDATE",
      collectionName: "appointments",
      documentId: id,
      performedBy: user,
      details: `Cita (${id}) actualizada`,
      newData: data as Record<string, any>,
    });
  },

  // 🔴 DELETE: Cancelar cita (Borrado Lógico)
  cancel: async (id: string, user: UserContext): Promise<void> => {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al cancelar la cita");

    // Registrar en bitácora
    await logAuditEvent({
      action: "DELETE",
      collectionName: "appointments",
      documentId: id,
      performedBy: user,
      details: `Cita (${id}) cancelada/eliminada`,
    });
  },
};

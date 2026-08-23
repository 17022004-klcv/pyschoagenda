import { Patient, CreatePatientDTO } from "@/types/patient";
import { UserContext } from "@/types/auditLog";

export const PatientService = {
  // 🟢 GET: Obtener todos los pacientes (o buscar)
  getAll: async (search?: string): Promise<Patient[]> => {
    const url = search
      ? `/api/patients?search=${encodeURIComponent(search)}`
      : "/api/patients";

    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error("Error al obtener la lista de pacientes");
    return await response.json();
  },

  // 🔵 GET: Obtener paciente por ID
  getById: async (id: string): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`, { method: "GET" });
    if (!response.ok) throw new Error("Error al obtener el paciente");
    return await response.json();
  },

  // 🟡 POST: Crear un nuevo paciente (con Auditoría)
  create: async (
    data: CreatePatientDTO,
    user?: UserContext,
  ): Promise<Patient> => {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, user }),
    });
    if (!response.ok) throw new Error("Error al guardar el paciente");
    return await response.json();
  },

  // 🟠 PUT: Actualizar un paciente existente (con Auditoría)
  update: async (
    id: string,
    data: Partial<CreatePatientDTO>,
    user?: UserContext,
  ): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, user }),
    });
    if (!response.ok) throw new Error("Error al actualizar el paciente");
    return await response.json();
  },

  // 🔴 DELETE: Eliminar un paciente físicamente (con Auditoría)
  delete: async (id: string, user?: UserContext): Promise<void> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });
    if (!response.ok) throw new Error("Error al eliminar el paciente");
  },

  // 🔴 Inactivar Paciente (Borrado Lógico con Auditoría)
  inactivate: async (id: string, user?: UserContext): Promise<Patient> => {
    return await PatientService.update(id, { status: "Inactivo" }, user);
  },

  // 📥 DOWNLOAD: Descargar reporte CSV filtrado
  downloadReport: async (
    genderFilter: "Todos" | "Femenino" | "Masculino" | "Otro",
  ): Promise<void> => {
    const response = await fetch(
      `/api/patients/download?gender=${genderFilter}`,
    );
    if (!response.ok) throw new Error("Error al generar el reporte");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacientes_${genderFilter.toLowerCase()}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // 📥 Descargar Ficha Individual
  downloadSingleReport: async (id: string, name: string): Promise<void> => {
    const response = await fetch(`/api/patients/${id}/download`);
    if (!response.ok)
      throw new Error("Error al descargar la ficha del paciente");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${name.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

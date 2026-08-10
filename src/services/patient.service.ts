export interface Patient {
  id: string;
  name: string;
  gender: "Femenino" | "Masculino";
  birthDate: string;
  age: number;
  dui?: string;
  phone: string;
  email?: string;
  status: "Activo" | "Inactivo";
  isMinor: boolean;
  observations?: string;
  consentStatus?: "Pendiente" | "Firmado";
  consentDate?: string;
  consentSignature?: string;
  tutor?: {
    name: string;
    relationship: string;
    dui: string;
    phone: string;
  };
}

// DTO (Data Transfer Object) para la creación de pacientes
export interface CreatePatientDTO {
  name: string;
  gender: "Femenino" | "Masculino";
  birthDate: string;
  age: number;
  dui?: string;
  phone: string;
  email?: string;
  status: "Activo" | "Inactivo";
  isMinor: boolean;
  tutor?: {
    name: string;
    relationship: string;
    dui: string;
    phone: string;
  };
}

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

  // 🟡 POST: Crear un nuevo paciente
  create: async (data: CreatePatientDTO): Promise<Patient> => {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al guardar el paciente");
    return await response.json();
  },

  // 🟠 PUT: Actualizar un paciente existente
  update: async (
    id: string,
    data: Partial<CreatePatientDTO>,
  ): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar el paciente");
    return await response.json();
  },

  // 🔴 DELETE: Eliminar un paciente
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Error al eliminar el paciente");
  },

  // 📥 DOWNLOAD: Descargar reporte CSV filtrado
  downloadReport: async (
    genderFilter: "Todos" | "Femenino" | "Masculino",
  ): Promise<void> => {
    const response = await fetch(
      `/api/patients/download?gender=${genderFilter}`,
    );
    if (!response.ok) throw new Error("Error al generar el reporte");

    // Convertir respuesta a Blob para iniciar la descarga nativa en el navegador
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

  // Agrega estas funciones dentro de tu objeto PatientService en src/services/patient.service.ts

  // 🔴 Inactivar Paciente (Borrado Lógico)
  inactivate: async (id: string): Promise<Patient> => {
    return await PatientService.update(id, { status: "Inactivo" });
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

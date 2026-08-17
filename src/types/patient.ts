export interface Patient {
  id: string;
  // 🟢 Tipo para diferenciar el registro
  type?: "Individual" | "Pareja" | "Familiar";
  name: string; // Ej: "Carlos Mendoza" O "Carlos Mendoza & Ana López"

  // Opcional: Si es pareja/familiar, guardamos las referencias a los IDs individuales
  associatedPatientIds?: string[];

  gender?: "Femenino" | "Masculino" | "Otro" | "N/A";
  birthDate?: string;
  age?: number;
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

// DTO para Creación
export interface CreatePatientDTO {
  type?: "Individual" | "Pareja" | "Familiar";
  name: string;
  associatedPatientIds?: string[];
  gender?: "Femenino" | "Masculino" | "Otro" | "N/A";
  birthDate?: string;
  age?: number;
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

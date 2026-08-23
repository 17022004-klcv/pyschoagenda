export interface Tutor {
  name: string;
  relationship: string;
  dui: string;
  phone: string;
}

export interface Patient {
  id: string;
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
  observations?: string;
  consentStatus?: "Pendiente" | "Firmado";
  consentDate?: string;
  consentSignature?: string;
  tutor?: Tutor;
}

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
  tutor?: Tutor;
}

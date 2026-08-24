// 1. MÁSCARAS DE FORMATO (Se aplican en el onChange de los inputs)

export const formatters = {
  // Formato DUI: 00000000-0 (Máximo 10 caracteres)
  dui: (value: string): string => {
    const raw = value.replace(/\D/g, "").slice(0, 9);
    if (raw.length > 8) return `${raw.slice(0, 8)}-${raw.slice(8)}`;
    return raw;
  },

  // Formato Teléfono El Salvador: 0000-0000 (Máximo 9 caracteres)
  phone: (value: string): string => {
    const raw = value.replace(/\D/g, "").slice(0, 8);
    if (raw.length > 4) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return raw;
  },

  // Limitar longitud máxima de texto general
  maxLength: (value: string, max: number): string => {
    return value.slice(0, max);
  },
};

// 2. REGLAS DE VALIDACIÓN (Se usan antes de guardar)

export const validators = {
  // Validar si un campo requerido tiene texto
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Validar formato de Correo (@ y dominio)
  email: (value: string): boolean => {
    if (!value) return true; // Si es opcional no valida hasta que haya texto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  },

  // Validar DUI completo (exactamente 8 dígitos + 1 verificador)
  dui: (value: string): boolean => {
    if (!value) return true;
    const duiRegex = /^\d{8}-\d{1}$/;
    return duiRegex.test(value);
  },

  // Validar Teléfono completo (exactamente 4 dígitos + guion + 4 dígitos)
  phone: (value: string): boolean => {
    if (!value) return true;
    const phoneRegex = /^\d{4}-\d{4}$/;
    return phoneRegex.test(value);
  },
};

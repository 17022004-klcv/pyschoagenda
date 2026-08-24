"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { validatePasswordSecurity } from "@/lib/validators";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const PasswordInputWithRequirements: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Evaluamos las reglas en tiempo real según lo ingresado
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
  };

  const requirements = [
    { label: "Mínimo 8 caracteres", met: checks.length },
    { label: "Una letra mayúscula (A-Z)", met: checks.upper },
    { label: "Una letra minúscula (a-z)", met: checks.lower },
    { label: "Un número (0-9)", met: checks.number },
    { label: "Un carácter especial (@, #, $, %)", met: checks.special },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
        Contraseña
      </label>

      {/* Input de Contraseña con Toggle de Ojo */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Requisitos visuales dentro del Modal */}
      {value.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-700 space-y-1.5 text-xs">
          <p className="font-semibold text-gray-600 dark:text-slate-300 mb-1">
            Requisitos de seguridad:
          </p>
          {requirements.map((req, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 transition-colors ${
                req.met
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-gray-400 dark:text-slate-400"
              }`}
            >
              {req.met ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

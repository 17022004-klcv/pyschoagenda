import React from "react";
import { Clock, LogOut } from "lucide-react";

interface Props {
  onLogout: () => void;
}

export default function PendingApprovalScreen({ onLogout }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-900/50">
          <Clock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Solicitud en Revisión
        </h2>

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          Tu cuenta ha sido registrada exitosamente. Un Administrador debe
          revisar y activar tu acceso asignándote un rol (Psicólogo o
          Recepcionista) antes de que puedas ingresar.
        </p>

        <div className="pt-4">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión / Volver
          </button>
        </div>
      </div>
    </div>
  );
}

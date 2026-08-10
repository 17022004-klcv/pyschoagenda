import React from "react";
import { Loader2 } from "lucide-react";

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  title: string;
  cancelText?: string;
  submitText?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  cancelText = "Cancelar",
  submitText = "Guardar",
  isLoading = false,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]">
      <div className="bg-white border border-gray-200/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <form
          onSubmit={onSubmit}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Header iOS Style */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>

            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              {title}
            </h2>

            <button
              type="submit"
              disabled={isLoading}
              className="text-base font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitText}
            </button>
          </div>

          {/* Cuerpos con Scroll */}
          <div className="p-6 overflow-y-auto space-y-4">{children}</div>
        </form>
      </div>
    </div>
  );
};

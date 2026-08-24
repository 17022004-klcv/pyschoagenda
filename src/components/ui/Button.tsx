import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  // Estilos Base estilo iOS/macOS
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]";

  // Tamaños
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2.5",
  };

  // Variantes de color adaptadas para modo claro y oscuro
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md shadow-blue-500/15 dark:shadow-blue-900/30",
    secondary:
      "bg-gray-100 hover:bg-gray-200/80 text-gray-800 border border-gray-200/60 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700",
    danger:
      "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white shadow-md shadow-rose-500/15 dark:shadow-rose-900/30",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-600 dark:hover:bg-slate-800 dark:text-slate-300",
    link: "bg-transparent text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 shadow-none font-bold",
    outline:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

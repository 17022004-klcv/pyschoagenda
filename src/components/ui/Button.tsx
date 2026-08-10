import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
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

  // Variantes de color
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/15",
    secondary:
      "bg-gray-100 hover:bg-gray-200/80 text-gray-800 border border-gray-200/60",
    danger:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/15",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
    link: "bg-transparent text-blue-600 hover:text-blue-700 p-0 shadow-none font-bold",
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

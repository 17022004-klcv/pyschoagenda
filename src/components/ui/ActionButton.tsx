import React from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  variant?: "default" | "primary" | "warning" | "success" | "danger";
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  variant = "default",
  className = "",
  ...props
}) => {
  const variants = {
    default: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
    primary: "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
    warning: "text-gray-400 hover:text-amber-600 hover:bg-amber-50",
    success: "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50",
    danger: "text-gray-400 hover:text-rose-600 hover:bg-rose-50",
  };

  return (
    <button
      type="button"
      title={title}
      className={`p-2 rounded-xl transition-all duration-150 active:scale-90 ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
    </button>
  );
};

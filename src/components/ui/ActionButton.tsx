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
    default:
      "text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60",
    primary:
      "text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50",
    warning:
      "text-gray-400 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50",
    success:
      "text-gray-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
    danger:
      "text-gray-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50",
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

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  badge?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  badge,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block font-bold text-gray-800 dark:text-slate-200 text-sm">
          {label}{" "}
          {badge && (
            <span className="text-gray-400 dark:text-slate-400 font-normal">
              ({badge})
            </span>
          )}
        </label>
      )}

      <input
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-2xl text-base border transition-all duration-200 focus:outline-none ${
          disabled
            ? "bg-gray-100 dark:bg-slate-900/50 text-gray-400 dark:text-slate-600 border-gray-200 dark:border-slate-800 cursor-not-allowed"
            : error
              ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 focus:border-rose-500 dark:focus:border-rose-500 placeholder:text-rose-300 dark:placeholder:text-rose-700"
              : "bg-gray-50 dark:bg-slate-900/80 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500"
        } ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs font-medium text-rose-500 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

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
        <label className="block font-bold text-gray-800 text-sm">
          {label}{" "}
          {badge && (
            <span className="text-gray-400 font-normal">({badge})</span>
          )}
        </label>
      )}

      <input
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-2xl text-base border transition-all duration-200 focus:outline-none ${
          disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : error
              ? "bg-rose-50/50 border-rose-300 text-rose-900 focus:border-rose-500"
              : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500"
        } ${className}`}
        {...props}
      />

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};

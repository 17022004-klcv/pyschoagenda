import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block font-bold text-gray-800 text-sm">{label}</label>
      )}

      <select
        className={`w-full px-4 py-3 rounded-2xl text-base border bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
          error ? "border-rose-300 bg-rose-50/50" : ""
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};

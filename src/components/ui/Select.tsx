"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  value,
  onChange,
  className = "",
  placeholder = "Seleccionar...",
  searchable = true,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stringValue = String(value ?? "");
  const selectedOption = options.find(
    (opt) => String(opt.value) === stringValue,
  );

  const toggleOpen = () => {
    if (disabled) return;

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;

      // Abre hacia arriba SOLO si hay menos de 180px disponibles en la pantalla
      setDropUp(spaceBelow < 180);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    if (onChange) {
      onChange({ target: { value: String(val) } });
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-1 w-full relative" ref={containerRef}>
      {label && (
        <label className="block font-bold text-gray-800 dark:text-slate-200 text-sm">
          {label}
        </label>
      )}

      <div
        onClick={toggleOpen}
        className={`w-full h-[42px] px-4 rounded-2xl text-sm border bg-gray-50 dark:bg-slate-900/80 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white flex items-center justify-between transition-all duration-200 cursor-pointer ${
          error
            ? "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
            : "hover:border-blue-400 dark:hover:border-blue-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        <span
          className={`truncate pr-2 ${
            selectedOption
              ? "font-semibold text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-slate-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-[60] left-0 right-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-slate-950/50 p-2 space-y-1 ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {searchable && (
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
                No hay resultados
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === stringValue;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold"
                        : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-500 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

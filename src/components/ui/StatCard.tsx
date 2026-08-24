import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  badgeText: string;
  badgeColor?: "blue" | "amber" | "emerald" | "purple";
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  badgeText,
  badgeColor = "blue",
  icon,
}) => {
  // Configuración de colores con Tailwind según el badgeColor (Soporte Modo Oscuro)
  const styles = {
    blue: {
      badge:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-900/50",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
    },
    amber: {
      badge:
        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-900/50",
      iconBg:
        "bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-900/50 text-amber-600 dark:text-amber-400",
    },
    emerald: {
      badge:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-900/50",
      iconBg:
        "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    },
    purple: {
      badge:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-900/50",
      iconBg:
        "bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-900/50 text-purple-600 dark:text-purple-400",
    },
  }[badgeColor];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-gray-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-none flex items-center justify-between transition-colors">
      <div className="space-y-1">
        <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {value}
          </span>
          <span
            className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${styles.badge}`}
          >
            {badgeText}
          </span>
        </div>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${styles.iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
};

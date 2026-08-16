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
  // Configuración de colores con Tailwind según el badgeColor
  const styles = {
    blue: {
      badge: "text-blue-600 bg-blue-50 border-blue-200/60",
      iconBg: "bg-blue-50 border-blue-200/60 text-blue-600",
    },
    amber: {
      badge: "text-amber-600 bg-amber-50 border-amber-200/60",
      iconBg: "bg-amber-50 border-amber-200/60 text-amber-600",
    },
    emerald: {
      badge: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
      iconBg: "bg-emerald-50 border-emerald-200/60 text-emerald-600",
    },
    purple: {
      badge: "text-purple-600 bg-purple-50 border-purple-200/60",
      iconBg: "bg-purple-50 border-purple-200/60 text-purple-600",
    },
  }[badgeColor];

  return (
    <div className="bg-white border border-gray-200/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900">{value}</span>
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

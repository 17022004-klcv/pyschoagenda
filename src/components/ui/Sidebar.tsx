"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, User } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  groups: SidebarGroup[];
  userRole?: string; // 👈 Rol proveniente de la colección 'users' de Firebase
}

// Mapeo de identificadores de Firebase/URL a nombres legibles para la UI
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  psicology: "Psicóloga",
  psychologist: "Psicóloga",
  recepcionist: "Recepcionista",
  receptionist: "Recepcionista",
};

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  subtitle,
  logoUrl,
  groups,
  userRole,
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Extrae el módulo base de la URL como fallback (ej: /admin/users -> "admin")
  const urlRole = pathname.split("/")[1] || "recepcionist";

  // 2. Determina el rol activo: Prioriza Firebase (`userRole`) sobre la URL
  const activeRoleKey = userRole || urlRole;

  // 3. Genera la ruta de perfil según el rol del usuario
  const profileHref = `/${activeRoleKey}/profile`;
  const isProfileActive = pathname === profileHref;

  // 4. Etiqueta amigable para mostrar en el footer
  const displayRole = ROLE_LABELS[activeRoleKey] || "Usuario";

  return (
    <aside
      className={`sticky top-2 h-[calc(100vh-1rem)] m-1 rounded-2xl bg-[#F2F1F6] dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none flex flex-col justify-between p-4 select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] transition-all duration-300 z-40 shrink-0 ${
        isCollapsed ? "w-20" : "w-68"
      }`}
    >
      {/* Contenedor Superior (Header + Navegación) */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/80 dark:border-slate-800 shrink-0 min-h-[52px]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative w-10 h-10 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="bg-amber-500 font-bold text-lg text-white w-full h-full flex items-center justify-center">
                    Ψ
                  </span>
                )}
              </div>

              <div className="flex flex-col overflow-hidden transition-opacity duration-200">
                <h1 className="text-[16px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight truncate">
                  {title}
                </h1>
                {subtitle && (
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium tracking-tight truncate mt-0.5">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Botón de Colapsar */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 shrink-0 ${
              isCollapsed ? "w-full flex justify-center" : ""
            }`}
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Elementos de Navegación */}
        <nav className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.title && !isCollapsed && (
                <p className="px-3 text-[14px] font-bold text-gray-900 dark:text-slate-200 mb-2 truncate">
                  {group.title}
                </p>
              )}

              {group.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={`${item.href}-${itemIdx}`}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 px-2.5 py-2 rounded-2xl text-[13px] transition-all duration-200 ${
                      isActive
                        ? "bg-gray-300/80 dark:bg-slate-800 text-black dark:text-white shadow-md shadow-gray-400/20 dark:shadow-none scale-[1.01]"
                        : "text-gray-800 dark:text-slate-300 hover:bg-gray-200/70 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {item.icon && (
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? "text-black dark:text-white"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {item.icon}
                      </div>
                    )}

                    {!isCollapsed && (
                      <span className="font-medium tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer con Rol dinámico de Firebase */}
      <div className="pt-3 border-t border-gray-200/80 dark:border-slate-800 shrink-0">
        <Link
          href={profileHref}
          title={isCollapsed ? `Perfil - ${displayRole}` : undefined}
          className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            isProfileActive
              ? "bg-gray-300/80 dark:bg-slate-800 text-black dark:text-white shadow-sm"
              : "hover:bg-gray-200/60 dark:hover:bg-slate-800/60"
          } ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200 tracking-tight truncate">
                Perfil
              </span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium truncate">
                {displayRole}
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};

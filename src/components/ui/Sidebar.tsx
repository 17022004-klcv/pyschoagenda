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
}

export const Sidebar: React.FC<SidebarProps> = ({
  title,
  subtitle,
  logoUrl,
  groups,
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🎯 Determinar la ruta base dinámicamente (/recepcionist o /psicologa)
  const baseModule = pathname.split("/")[1] || "recepcionist";
  const profileHref = `/${baseModule}/profile`;
  const isProfileActive = pathname === profileHref;

  return (
    <aside
      /* 🟢 'sticky top-2' o 'fixed top-1' lo mantendrá congelado mientras haces scroll */
      className={`sticky top-2 h-[calc(100vh-1rem)] m-1 rounded-2xl bg-[#F2F1F6] backdrop-blur-xl border border-gray-200/60 shadow-xl shadow-gray-200/40 flex flex-col justify-between p-4 select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] transition-all duration-300 z-40 shrink-0 ${
        isCollapsed ? "w-20" : "w-68"
      }`}
    >
      {/* Contenedor Superior (Header + Navegación) */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/80 shrink-0 min-h-[52px]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Logo */}
              <div className="relative w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
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

              {/* Título y Subtítulo */}
              <div className="flex flex-col overflow-hidden transition-opacity duration-200">
                <h1 className="text-[16px] font-bold text-gray-900 leading-tight tracking-tight truncate">
                  {title}
                </h1>
                {subtitle && (
                  <span className="text-[11px] text-gray-500 font-medium tracking-tight truncate mt-0.5">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Botón de Colapsar */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200 shrink-0 ${
              isCollapsed ? "w-full flex justify-center" : ""
            }`}
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-blue-600" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 🟢 Navigation Items con Scroll Propio si la pantalla es corta */}
        <nav className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* Título de sección */}
              {group.title && !isCollapsed && (
                <p className="px-3 text-[14px] font-bold text-gray-900 mb-2 truncate">
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
                        ? "bg-gray-300 text-black shadow-md shadow-gray-400/20 scale-[1.01]"
                        : "text-gray-800 hover:bg-gray-200/70 hover:text-gray-900"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {/* Contenedor del Ícono */}
                    {item.icon && (
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? "bg-white/40 text-black"
                            : "bg-transparent text-blue-600 group-hover:bg-blue-50/80"
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

      {/* 🟢 Footer Perfil Clickeable */}
      <div className="pt-3 border-t border-gray-200/80 shrink-0">
        <Link
          href={profileHref}
          title={isCollapsed ? "Perfil" : undefined}
          className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            isProfileActive
              ? "bg-gray-300 text-black shadow-sm"
              : "hover:bg-gray-200/60"
          } ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-gray-800 tracking-tight truncate">
                Perfil
              </span>
              <span className="text-[10px] text-gray-500 font-medium truncate">
                Ver ajustes
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};

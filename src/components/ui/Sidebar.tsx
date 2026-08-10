"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft } from "lucide-react";

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

  return (
    <aside
      className={`h-[calc(100vh-2rem)] m-1 rounded-2xl bg-[#F2F1F6] backdrop-blur-xl border border-gray-200/60 shadow-xl shadow-gray-200/40 flex flex-col justify-between p-4 select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-68"
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 min-h-[52px]">
          {/* Cuando está colapsado, ocultamos logo y textos */}
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
                  <span className=" bg-amber-500 font-bold text-lg">Ψ</span>
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

        {/* Navigation Items */}
        <nav className="mt-5 space-y-4">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* Título de sección */}
              {group.title && !isCollapsed && (
                <p className="px-3 text-[18px] font-bold text-black mb-2 truncate">
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
                        ? "bg-gray-300 text-black shadow-md shadow-blue-500/25 scale-[1.01]"
                        : "text-black hover:bg-gray-100/80 hover:text-gray-900"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {/* Contenedor con Figura Azul del Ícono */}
                    {item.icon && (
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-transparent text-blue-600 group-hover:bg-blue-50/60"
                        }`}
                      >
                        {item.icon}
                      </div>
                    )}

                    {!isCollapsed && (
                      <span className="tracking-tight truncate">
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

      {/* Footer Perfil */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between px-1 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            PA
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-gray-800 tracking-tight truncate">
                Perfil
              </span>
              <span className="text-[10px] text-gray-400 font-medium truncate">
                Ver ajustes
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

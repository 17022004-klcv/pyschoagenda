"use client";

import React from "react";
import { Sidebar, SidebarGroup } from "@/components/ui/Sidebar";
import {
  Home,
  Users,
  Tags,
  Calendar,
  Clock,
  UserCheck,
  FileSignature,
  ShieldAlert,
  History,
  FileText,
} from "lucide-react";

// Estructura de navegación para el Administrador
const adminGroups: SidebarGroup[] = [
  {
    title: "Gestión Diaria",
    items: [
      {
        label: "Inicio",
        href: "/admin",
        icon: <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
      {
        label: "Usuarios",
        href: "/admin/users",
        icon: <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
      {
        label: "Categorías de Terapias",
        href: "/admin/category",
        icon: <Tags className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
    ],
  },
  {
    title: "Atención Clínica", // 👈 Título sugerido
    items: [
      {
        label: "Citas",
        href: "/admin/appointment",
        icon: <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
      {
        label: "Sesiones",
        href: "/admin/session",
        icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
      {
        label: "Expedientes",
        href: "/admin/medical_history",
        icon: <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
    ],
  },
  {
    title: "Pacientes",
    items: [
      {
        label: "Directorio de Pacientes",
        href: "/admin/patient",
        icon: (
          <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ),
      },
      {
        label: "Consentimientos",
        href: "/admin/consent",
        icon: (
          <FileSignature className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ),
      },
    ],
  },
  {
    title: "Seguridad y Auditoría",
    items: [
      {
        label: "Solicitudes",
        href: "/admin/application",
        icon: (
          <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ),
      },
      {
        label: "Bitácora de Sistema",
        href: "/admin/logs",
        icon: <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <aside className="sticky top-0 h-screen flex-shrink-0 z-20">
        <Sidebar
          title="Centro Psicológico"
          subtitle="Integral Sensuntepeque"
          logoUrl="/logo.png"
          groups={adminGroups}
        />
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

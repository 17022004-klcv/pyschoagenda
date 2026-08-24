"use client";

import React from "react";
import { Sidebar, SidebarGroup } from "@/components/ui/Sidebar";
import {
  FolderClock,
  HomeIcon,
  ListCheck,
  NotebookIcon,
  User,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

// Opciones de navegación con rutas ÚNICAS
const psychologistGroups: SidebarGroup[] = [
  {
    title: "Consulta",
    items: [
      {
        label: "Inicio",
        href: "/psychologist",
        icon: <HomeIcon className="w-4 h-4 text-blue-600" />,
      },
      {
        label: "Sesiones",
        href: "/psychologist/session",
        icon: <NotebookIcon className="w-4 h-4 text-blue-600" />,
      },
      {
        label: "Historial Clínico",
        href: "/psychologist/medical_history",
        icon: <FolderClock className="w-4 h-4 text-blue-600" />,
      },
    ],
  },
  {
    title: "Pacientes",
    items: [
      {
        label: "Pacientes",
        href: "/psychologist/patient",
        icon: <User className="w-4 h-4 text-blue-600" />,
      },
      {
        label: "Consentimientos",
        href: "/psychologist/consent",
        icon: <ListCheck className="w-4 h-4 text-blue-600" />,
      },
    ],
  },
];

export default function PsychologistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["psychologist", "admin"]}>
      <div className="flex min-h-screen bg-[#FFFFFF]">
        <Sidebar
          title="Centro Psicologico"
          subtitle="Integral Sensuntepeque"
          logoUrl="/logo.png"
          groups={psychologistGroups}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}

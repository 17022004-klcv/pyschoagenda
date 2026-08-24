"use client";

import React from "react";
import { Sidebar, SidebarGroup } from "@/components/ui/Sidebar";
import { Clipboard, HomeIcon, ListCheck, User } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";

const recepcionistGroups: SidebarGroup[] = [
  {
    title: "Gestión Diaria",
    items: [
      {
        label: "Inicio",
        href: "/recepcionist",
        icon: <HomeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
      {
        label: "Citas",
        href: "/recepcionist/appointment",
        icon: (
          <Clipboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ),
      },
    ],
  },
  {
    title: "Pacientes",
    items: [
      {
        label: "Pacientes",
        href: "/recepcionist/patient",
        icon: <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      },
      {
        label: "Consentimientos",
        href: "/recepcionist/consent",
        icon: (
          <ListCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ),
      },
    ],
  },
];

export default function RecepcionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["receptionist", "recepcionist", "admin"]}>
      <div className="flex min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
        <aside className="sticky top-0 h-screen flex-shrink-0 z-20">
          <Sidebar
            title="Centro Psicologico"
            subtitle="Integral Sensuntepeque"
            logoUrl="/logo.png"
            groups={recepcionistGroups}
          />
        </aside>

        {/* 🟢 Renderizado único y correcto de las páginas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </RoleGuard>
  );
}

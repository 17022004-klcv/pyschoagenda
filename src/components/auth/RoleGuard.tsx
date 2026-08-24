"use client";

import { useAuth } from "@/lib/AuthContext";
import { usePathname } from "next/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();

  console.log("Rol actual:", userData?.role, "Roles permitidos:", allowedRoles);

  if (allowedRoles && userData?.role && !allowedRoles.includes(userData.role)) {
    return null; // 👈 Si este if se cumple, mostrará pantalla en blanco
  }

  // 1. Mientras verifica Firebase Auth -> Mostrar Loader (No renderiza la página)
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">
            Verificando permisos...
          </p>
        </div>
      </div>
    );
  }

  // 2. Si NO hay usuario autenticado -> Retornar NULO inmediatamente
  // Esto evita que React monte la vista mientras `router.push('/login')` redirige
  if (!user) {
    return null;
  }

  // 3. Si el rol del usuario no está autorizado -> Retornar NULO
  if (allowedRoles && userData?.role && !allowedRoles.includes(userData.role)) {
    return null;
  }

  // 4. Si pasa todas las validaciones -> Renderizar la interfaz protegida
  return <>{children}</>;
}

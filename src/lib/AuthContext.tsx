"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { UserDocument } from "@/types/user";

export interface AuditUserContext {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserDocument | null;
  currentUser: AuditUserContext | null;
  loading: boolean;
}

const HOME_PAGES: Record<string, string> = {
  admin: "/admin",
  psychologist: "/psychologist",
  receptionist: "/recepcionist",
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["/admin", "/psychologist", "/recepcionist"],
  psychologist: [
    "/psychologist",
    "/psychologist/consent",
    "/psychologist/medical_history",
    "/psychologist/patient",
    "/psychologist/profile",
    "/psychologist/session",
  ],
  receptionist: [
    "/recepcionist",
    "/recepcionist/appointment",
    "/recepcionist/consent",
    "/recepcionist/patient",
    "/recepcionist/profile",
  ],
};

const PUBLIC_ROUTES = ["/login", "/pending"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  currentUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [currentUser, setCurrentUser] = useState<AuditUserContext | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserDocument;
            setUserData(data);

            const userRole = data.role?.toLowerCase().trim() || "unassigned";

            setCurrentUser({
              uid: firebaseUser.uid,
              name:
                data.name ||
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "Usuario",
              email: firebaseUser.email || "",
              role: userRole,
            });

            // 1. Control de cuentas Inactivas, Rechazadas o Pendientes
            if (data.status === "pending" || userRole === "unassigned") {
              if (pathname !== "/pending") {
                router.push("/pending");
              }
              setLoading(false);
              return;
            }

            if (data.status === "inactive" || data.status === "rejected") {
              if (pathname !== "/login") {
                router.push("/login");
              }
              setLoading(false);
              return;
            }

            // 2. Control de accesos para usuarios ACTIVOS con ROL
            const allowedRoutes = ROLE_PERMISSIONS[userRole] || [];
            const homePage = HOME_PAGES[userRole] || "/login";

            const isAllowed = allowedRoutes.some((route) =>
              pathname.startsWith(route),
            );

            // Si intenta entrar al login o pending teniendo ya un rol activo
            if (PUBLIC_ROUTES.includes(pathname)) {
              router.push(homePage);
            } else if (!isAllowed) {
              router.push(homePage);
            }
          } else {
            // Usuario en Auth pero no existe aún en Firestore
            if (pathname !== "/pending") {
              router.push("/pending");
            }
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setCurrentUser(null);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
        <div className="relative flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-blue-500/20 opacity-75"></div>
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600/30 border-t-blue-600 dark:border-blue-400/30 dark:border-t-blue-400"></div>
            <div className="absolute h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/50"></div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
            <span className="text-base font-semibold tracking-wide text-gray-800 dark:text-gray-100">
              Psychoagenda
            </span>
            <span className="text-xs font-medium text-gray-400 animate-pulse">
              Verificando accesos...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

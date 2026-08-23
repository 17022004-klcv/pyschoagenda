import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserContext } from "@/types/auditLog";

export function useAuth() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          let role = "usuario"; // Rol por defecto

          try {
            // Intentar obtener el rol guardado en la colección de usuarios en Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              role = userDoc.data()?.role || "usuario";
            }
          } catch (error) {
            console.error("Error al obtener detalles del usuario:", error);
          }

          // Mapeamos el usuario de Firebase al formato UserContext que exige la bitácora
          setUser({
            uid: firebaseUser.uid,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "Usuario",
            email: firebaseUser.email || "",
            role: role,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

"use client";

import React, { useEffect, useState } from "react";
// Importamos el componente UserProfile (que ya debe contener su Skeleton interno)
import { UserProfile, UserProfileData } from "@/components/ui/UserProfile";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";

// Ya no necesitamos Loader2 aquí, la carga se maneja con Skeleton
// import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true); // Estado inicial en true
  const router = useRouter();

  useEffect(() => {
    // Escuchador del estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Aseguramos carga al intentar autenticar

      if (firebaseUser) {
        // Obtenemos el proveedor (Google, contraseña, etc.)
        const providerId =
          firebaseUser.providerData[0]?.providerId || "password";
        let userRole = "Recepcionista"; // Rol por defecto
        let userPhotoURL = firebaseUser.photoURL || ""; // Foto por defecto de Auth

        try {
          // Consultar datos extendidos en Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            userRole = data.role || userRole; // Sincronizar rol de Firestore

            // Priorizar la foto guardada en Firestore sobre la de Google/Auth
            if (data.photoURL) {
              userPhotoURL = data.photoURL;
            }
          }
        } catch (e) {
          console.error("Error al obtener datos extendidos del usuario:", e);
        }

        // Guardar en estado local estructurado
        setUserData({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          role: userRole,
          photoURL: userPhotoURL,
          providerId: providerId,
        });
      } else {
        // Si no hay usuario, redirigir al Login inmediatamente
        router.push("/login");
      }

      // 🔴 IMPORTANTE: Desactivar carga al finalizar todo el proceso (Auth + Firestore)
      setLoading(false);
    });

    // Cleanup del listener
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSave = async (updatedData: {
    name?: string;
    phone?: string;
    photoURL?: string;
    password?: string;
  }) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      // A. Actualizar nombre en Firebase Auth
      if (updatedData.name && updatedData.name !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, { displayName: updatedData.name });
      }

      // B. Actualizar foto en Firebase Auth
      if (updatedData.photoURL) {
        await updateProfile(firebaseUser, { photoURL: updatedData.photoURL });
      }

      // C. Manejo de Contraseña / Vinculación si viene contraseña
      if (updatedData.password) {
        const isGoogleAccount = firebaseUser.providerData.some(
          (provider) => provider.providerId === "google.com",
        );
        const hasPasswordAccount = firebaseUser.providerData.some(
          (provider) => provider.providerId === "password",
        );

        // Si es cuenta Google pura, vincular con email/pass
        if (isGoogleAccount && !hasPasswordAccount && firebaseUser.email) {
          const credential = EmailAuthProvider.credential(
            firebaseUser.email,
            updatedData.password,
          );
          await linkWithCredential(firebaseUser, credential);
        } else {
          // Si ya tiene pass local, solo actualizarla
          await updatePassword(firebaseUser, updatedData.password);
        }
      }

      // 🟢 D. Sincronizar con Firestore SOLO campos definidos
      const fieldsToUpdate: Record<string, any> = {};
      if (updatedData.name !== undefined)
        fieldsToUpdate.name = updatedData.name;
      if (updatedData.phone !== undefined)
        fieldsToUpdate.phone = updatedData.phone;
      if (updatedData.photoURL !== undefined)
        fieldsToUpdate.photoURL = updatedData.photoURL;

      // ActualizarFirestore usando setDoc con { merge: true } para crear o actualizar
      if (Object.keys(fieldsToUpdate).length > 0) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, fieldsToUpdate, { merge: true });
      }

      // Actualizar el estado local para reflejar cambios en pantalla sin recargar
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              ...(updatedData.name ? { name: updatedData.name } : {}),
              ...(updatedData.photoURL
                ? { photoURL: updatedData.photoURL }
                : {}),
            }
          : null,
      );
    } catch (error) {
      console.error("Error al guardar cambios del perfil:", error);
      // Aquí podrías disparar una alerta de error (ej: toasts)
    }
  };

  /* 
    🟢 ELIMINADO EL RENDERIZADO CONDICIONAL RUIDOSO 🔴
    if (loading) { ... }
  */

  // Manejo de seguridad si no hay datos tras la carga
  if (!loading && !userData) return null;

  // Renderizado final
  return (
    <UserProfile
      user={userData}
      onSave={handleSave}
      onLogout={handleLogout}
      // 🟢 PASAMOS EL ESTADO DE CARGA AL COMPONENTE para que muestre el Skeleton interno
      isPageLoading={loading}
    />
  );
}

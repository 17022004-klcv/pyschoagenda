"use client";

import React, { useEffect, useState } from "react";
import { UserProfile, UserProfileData } from "@/components/ui/UserProfile";
import { setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
// 1. Importamos linkWithCredential y EmailAuthProvider
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const providerId =
          firebaseUser.providerData[0]?.providerId || "password";
        let userRole = "Recepcionista";
        let userPhotoURL = firebaseUser.photoURL || "";

        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userRole = data.role || userRole;

            if (data.photoURL) {
              userPhotoURL = data.photoURL;
            }
          }
        } catch (e) {
          console.error("Error al obtener datos del usuario:", e);
        }

        setUserData({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          role: userRole,
          photoURL: userPhotoURL,
          providerId: providerId,
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

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

    // A. Actualizar nombre en Auth si vino definido y cambió
    if (updatedData.name && updatedData.name !== firebaseUser.displayName) {
      await updateProfile(firebaseUser, { displayName: updatedData.name });
    }

    // B. Actualizar foto en Auth si vino definida
    if (updatedData.photoURL) {
      await updateProfile(firebaseUser, { photoURL: updatedData.photoURL });
    }

    // C. Manejo de Contraseña / Vinculación
    if (updatedData.password) {
      const isGoogleAccount = firebaseUser.providerData.some(
        (provider) => provider.providerId === "google.com",
      );
      const hasPasswordAccount = firebaseUser.providerData.some(
        (provider) => provider.providerId === "password",
      );

      if (isGoogleAccount && !hasPasswordAccount && firebaseUser.email) {
        const credential = EmailAuthProvider.credential(
          firebaseUser.email,
          updatedData.password,
        );
        await linkWithCredential(firebaseUser, credential);
      } else {
        await updatePassword(firebaseUser, updatedData.password);
      }
    }

    // 🟢 D. Construir el objeto de Firestore SOLO con campos definidos (evita campos 'undefined')
    const fieldsToUpdate: Record<string, any> = {};

    if (updatedData.name !== undefined) fieldsToUpdate.name = updatedData.name;
    if (updatedData.phone !== undefined)
      fieldsToUpdate.phone = updatedData.phone;
    if (updatedData.photoURL !== undefined)
      fieldsToUpdate.photoURL = updatedData.photoURL;

    // Solo ejecuta updateDoc si hay al menos un campo para actualizar
    if (Object.keys(fieldsToUpdate).length > 0) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, fieldsToUpdate, { merge: true });
    }

    // Actualizar el estado local
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            ...(updatedData.name ? { name: updatedData.name } : {}),
            ...(updatedData.photoURL ? { photoURL: updatedData.photoURL } : {}),
          }
        : null,
    );
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-gray-400 text-sm gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Cargando perfil...</span>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <UserProfile user={userData} onSave={handleSave} onLogout={handleLogout} />
  );
}

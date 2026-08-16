"use client";

import React, { useEffect, useState } from "react";
import { UserProfile, UserProfileData } from "@/components/ui/UserProfile";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
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

        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            userRole = userDoc.data().role || userRole;
          }
        } catch (e) {
          console.error("Error al obtener rol:", e);
        }

        setUserData({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          role: userRole,
          providerId: providerId,
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 🚪 Función para cerrar sesión y redirigir
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSave = async (updatedData: {
    name?: string;
    phone?: string;
    password?: string;
  }) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    if (updatedData.name && updatedData.name !== firebaseUser.displayName) {
      await updateProfile(firebaseUser, { displayName: updatedData.name });
    }

    if (updatedData.password) {
      await updatePassword(firebaseUser, updatedData.password);
    }

    const userDocRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userDocRef, {
      name: updatedData.name,
      ...(updatedData.phone ? { phone: updatedData.phone } : {}),
    });

    setUserData((prev) =>
      prev ? { ...prev, name: updatedData.name || prev.name } : null,
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

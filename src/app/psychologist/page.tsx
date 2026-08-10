"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PsychologistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Escuchar el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login"); // Si no está logueado, al login
        return;
      }

      // Consultar el rol en Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "psychologist") {
        setLoading(false); // Es psicóloga, la dejamos pasar
      } else {
        // Si no es psicóloga (es recepcionista), la rebotamos
        router.push("/recepcionist");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs font-semibold text-gray-500">
          Verificando permisos...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
// 1. Importar signInWithEmailAndPassword
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const heroImageUrl = "/img3.png";
  const logoUrl = "/logo.png";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "receptionist";

      if (userSnap.exists()) {
        const userData = userSnap.data();
        role = userData.role || "receptionist";
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "receptionist",
          createdAt: new Date(),
        });
      }

      if (role === "psychologist") {
        router.push("/psychologist");
      } else {
        router.push("/recepcionist");
      }
    } catch (err: any) {
      setError("Error al iniciar sesión con Google.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 2. Inicio de sesión real con correo y contraseña
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Autenticar credenciales en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Obtener el rol desde Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "receptionist";
      if (userSnap.exists()) {
        role = userSnap.data().role || "receptionist";
      }

      // Redirigir según el rol asignado
      if (role === "psychologist") {
        router.push("/psychologist");
      } else {
        router.push("/recepcionist");
      }
    } catch (err: any) {
      console.error(err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* MITAD IZQUIERDA: IMAGEN */}
      <div className="w-full md:w-1/2 min-h-[300px] md:min-h-screen relative flex flex-col p-8 md:p-12 overflow-hidden shrink-0">
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt="Animación Centro Psicológico"
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
      </div>

      {/* MITAD DERECHA: FORMULARIO */}
      <div className="w-full md:w-1/2 flex bg-[#f5f5f7] items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 overflow-hidden shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-blue-600 font-bold">
                <span className="text-4xl">Ψ</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-center">
            Bienvenido
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1 mb-8 text-center">
            Inicia sesión para acceder al sistema
          </p>

          {error && (
            <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="w-full space-y-3.5">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4.5 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-400 disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4.5 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-2xl shadow-md shadow-blue-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="w-full flex items-center my-6 gap-3">
            <div className="flex-1 h-[1px] bg-gray-200" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              o
            </span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-2xl border border-gray-200/80 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 text-xs cursor-pointer"
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Acceder con Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Skeleton de carga para el Login
const LoginSkeleton = () => {
  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-pulse space-y-4">
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 mb-2"></div>
      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-36 mb-1"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
      <div className="w-full h-11 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
      <div className="w-full h-11 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
      <div className="w-full h-11 bg-blue-200 dark:bg-blue-900/50 rounded-2xl"></div>
      <div className="w-full h-10 bg-gray-200 dark:bg-slate-700 rounded-2xl mt-4"></div>
    </div>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialMounting, setInitialMounting] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const heroImageUrl = "/prueba.jpg";
  const logoUrl = "/logo.png";

  useEffect(() => {
    setInitialMounting(false);
  }, []);

  // 1. Manejo del Login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let role = "unassigned";
      let status = "pending";

      if (!userSnap.exists()) {
        // Usuario nuevo: Se registra como PENDING
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "Usuario Nuevo",
          email: user.email || "",
          phone: user.phoneNumber || "",
          photoURL: user.photoURL || "",
          role: "unassigned",
          status: "pending",
          createdAt: serverTimestamp(),
        });
      } else {
        // Usuario existente: Lee sus datos reales de Firestore
        const userData = userSnap.data();
        role = userData.role || "unassigned";
        status = userData.status || "pending";
      }

      // Evaluar accesos según status y role
      if (status === "pending" || role === "unassigned") {
        router.push("/pending");
        return;
      }

      if (status === "inactive" || status === "rejected") {
        await signOut(auth);
        setError("Tu cuenta no tiene un acceso activo habilitado.");
        return;
      }

      if (role === "psychologist") {
        router.push("/psychologist");
      } else if (role === "admin") {
        router.push("/admin/users");
      } else {
        router.push("/recepcionist");
      }
    } catch (err: any) {
      console.error("Error en Google Login:", err);
      setError("Error al autenticar con Google.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Manejo del Login con Email y Password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // Control de cuentas inactivas, pendientes o rechazadas
        if (userData.status === "inactive") {
          await signOut(auth);
          setError("Tu cuenta está inactiva. Consulta con el administrador.");
          return;
        }

        if (userData.status === "pending") {
          router.push("/pending");
          return;
        }

        if (userData.status === "rejected") {
          await signOut(auth);
          setError("Tu solicitud de acceso fue rechazada.");
          return;
        }

        const role = userData.role;
        if (role === "psychologist") {
          router.push("/psychologist");
        } else if (role === "admin") {
          router.push("/admin/users");
        } else {
          router.push("/recepcionist");
        }
      } else {
        setError("No se encontraron datos asociados a esta cuenta.");
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
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="hidden md:flex w-1/2 h-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt="Centro Psicológico"
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#f5f5f7] dark:bg-slate-900 overflow-y-auto">
        {initialMounting ? (
          <LoginSkeleton />
        ) : (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-50 dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-blue-500/10 overflow-hidden shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  <span className="text-3xl md:text-4xl">Ψ</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight text-center">
              Bienvenido
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1 mb-6 text-center">
              Inicia sesión para acceder al sistema
            </p>

            {error && (
              <div className="w-full mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs text-center font-medium">
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
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 disabled:opacity-50"
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-xs rounded-2xl shadow-md shadow-blue-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="w-full flex items-center my-5 gap-3">
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-slate-800" />
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                o
              </span>
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 text-xs cursor-pointer"
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
        )}
      </div>
    </div>
  );
}

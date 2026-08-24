"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Shield,
  Lock,
  Save,
  Loader2,
  Camera,
  Info,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { showAlert } from "@/lib/sweetalert";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { formatters, validatePasswordSecurity } from "@/lib/validators";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: "Recepcionista" | "Psicóloga" | "Administrador" | string;
  phone?: string;
  photoURL?: string;
  providerId?: string;
}

interface UserProfileProps {
  user: UserProfileData | null;
  isPageLoading?: boolean;
  onSave?: (
    updatedData: Partial<UserProfileData> & {
      password?: string;
      photoURL?: string;
    },
  ) => Promise<void>;
  onLogout?: () => Promise<void>;
}

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse max-w-4xl mx-auto px-1 sm:px-0">
    <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700"></div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-40"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-32"></div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
        </div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-2xl w-32"></div>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 space-y-4">
      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-10 bg-gray-100 dark:bg-slate-700/50 rounded-2xl"></div>
        <div className="h-10 bg-gray-100 dark:bg-slate-700/50 rounded-2xl"></div>
      </div>
    </div>
  </div>
);

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  isPageLoading = false,
  onSave,
  onLogout,
}) => {
  if (isPageLoading || !user) {
    return <ProfileSkeleton />;
  }

  return <UserProfileForm user={user} onSave={onSave} onLogout={onLogout} />;
};

const UserProfileForm: React.FC<{
  user: UserProfileData;
  onSave?: UserProfileProps["onSave"];
  onLogout?: UserProfileProps["onLogout"];
}> = ({ user, onSave, onLogout }) => {
  const isGoogleUser = user.providerId === "google.com";

  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "name") {
      formattedValue = formatters.maxLength(value, 60);
    } else if (name === "newPassword" || name === "confirmPassword") {
      formattedValue = formatters.maxLength(value, 30);
    } else if (name === "phone") {
      formattedValue = formatters.phone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert.errorToast("Por favor selecciona una imagen válida");
      return;
    }

    try {
      setUploadingPhoto(true);
      const uploadedUrl = await uploadImageToImgBB(file);
      setPhotoURL(uploadedUrl);

      if (onSave) {
        await onSave({ photoURL: uploadedUrl });
      }

      showAlert.successToast("Foto de perfil actualizada correctamente");
    } catch (error) {
      console.error(error);
      showAlert.errorToast("No se pudo subir la foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogoutClick = async () => {
    const isConfirmed = await showAlert.confirm(
      "¿Cerrar sesión?",
      "Tendrás que volver a ingresar para acceder.",
      "Sí, salir",
    );

    if (isConfirmed && onLogout) {
      try {
        setLoggingOut(true);
        await onLogout();
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        showAlert.errorToast("No se pudo cerrar la sesión");
      } finally {
        setLoggingOut(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 Validación de Seguridad para la Nueva Contraseña
    if (formData.newPassword) {
      const { isValid, errors } = validatePasswordSecurity(
        formData.newPassword,
      );
      if (!isValid) {
        showAlert.errorToast(`Contraseña insegura: ${errors[0]}`);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showAlert.errorToast("Las contraseñas no coinciden");
        return;
      }
    }

    try {
      setLoading(true);
      if (onSave) {
        await onSave({
          name: formData.name,
          phone: formData.phone,
          ...(formData.newPassword ? { password: formData.newPassword } : {}),
        });
      }
      showAlert.successToast("Perfil actualizado correctamente");
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      console.error("Error al actualizar el perfil:", error);
      if (error.code === "auth/credential-already-in-use") {
        showAlert.errorToast(
          "Esta contraseña ya está en uso o el método ya existe.",
        );
      } else {
        showAlert.errorToast("Error al guardar los cambios");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
          Gestiona tu información personal y opciones de seguridad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RESUMEN DE USUARIO */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-3xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md overflow-hidden relative">
                {photoURL ? (
                  <Image
                    src={photoURL}
                    alt={formData?.name || "Foto de perfil"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : formData?.name ? (
                  formData.name.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>

              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="Cambiar foto de perfil"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {formData?.name || "Usuario"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                {user.email}
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200/60 dark:border-blue-800/50">
                  <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/60 dark:border-red-800/50 font-semibold text-xs transition-all cursor-pointer shrink-0"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* INFORMACIÓN PERSONAL */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-slate-700/60 pb-3">
            Información Personal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData?.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-100 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-500 dark:text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEGURIDAD Y VINCULACIÓN */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-slate-700/60 pb-3">
            Seguridad y Acceso
          </h3>

          {isGoogleUser && (
            <div className="flex items-start gap-3 p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 rounded-2xl text-blue-800 dark:text-blue-200 text-xs font-medium mb-4">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p>
                Iniciaste sesión con <strong>Google</strong>. Puedes asignar una
                contraseña a continuación si también deseas poder entrar usando
                tu correo y contraseña manualmente.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                {isGoogleUser ? "Asignar Contraseña Local" : "Nueva Contraseña"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Ingresa nueva contraseña"
                  value={formData?.newPassword || ""}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repite la contraseña"
                  value={formData?.confirmPassword || ""}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Requisitos visuales dinámicos de seguridad */}
          {(formData.newPassword || "").length > 0 && (
            <div className="p-3.5 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 space-y-1.5 text-xs mt-3">
              <p className="font-semibold text-gray-600 dark:text-slate-300 mb-1">
                La contraseña debe cumplir con:
              </p>
              {[
                {
                  label: "Mínimo 8 caracteres",
                  met: (formData.newPassword || "").length >= 8,
                },
                {
                  label: "Una letra mayúscula (A-Z)",
                  met: /[A-Z]/.test(formData.newPassword || ""),
                },
                {
                  label: "Una letra minúscula (a-z)",
                  met: /[a-z]/.test(formData.newPassword || ""),
                },
                {
                  label: "Un número (0-9)",
                  met: /[0-9]/.test(formData.newPassword || ""),
                },
                {
                  label: "Un carácter especial (@, #, $, %)",
                  met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                    formData.newPassword || "",
                  ),
                },
              ].map((req, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 transition-colors ${
                    req.met
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      req.met
                        ? "bg-emerald-500"
                        : "bg-gray-300 dark:bg-slate-600"
                    }`}
                  />
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-2xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* 🟢 PREFERENCIA DE APARIENCIA */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            Apariencia del Sistema
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
            Personaliza el tema visual para este navegador.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700/80 border border-gray-200/80 dark:border-slate-700 font-bold text-xs transition-all cursor-pointer shrink-0"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Modo Oscuro</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

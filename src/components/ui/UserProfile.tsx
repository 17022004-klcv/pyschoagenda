"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { showAlert } from "@/lib/sweetalert";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: "Recepcionista" | "Psicóloga" | "Administrador" | string;
  phone?: string;
  avatarUrl?: string;
  providerId?: string;
}

interface UserProfileProps {
  user: UserProfileData;
  onSave?: (
    updatedData: Partial<UserProfileData> & { password?: string },
  ) => Promise<void>;
  onLogout?: () => Promise<void>; // 👈 Nueva prop para cerrar sesión
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onSave,
  onLogout,
}) => {
  const isGoogleUser = user.providerId === "google.com";

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoutClick = async () => {
    const isConfirmed = await showAlert.confirm(
      "¿Cerrar sesión?",
      "Tendrás que volver a ingresar tus credenciales para acceder.",
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

    if (!isGoogleUser && formData.newPassword) {
      if (formData.newPassword.length < 6) {
        showAlert.errorToast(
          "La nueva contraseña debe tener al menos 6 caracteres",
        );
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
          ...(!isGoogleUser && formData.newPassword
            ? { password: formData.newPassword }
            : {}),
        });
      }
      showAlert.successToast("Perfil actualizado correctamente");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      showAlert.errorToast("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Gestiona tu información personal y opciones de seguridad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TARJETA DE RESUMEN, AVATAR Y BOTÓN DE CERRAR SESIÓN */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-all cursor-pointer"
                title="Cambiar foto"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {formData.name || "Usuario"}
              </h2>
              <p className="text-sm text-gray-500 font-medium">{user.email}</p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200/60">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* 🚪 BOTÓN CERRAR SESIÓN */}
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 font-semibold text-xs transition-all cursor-pointer shrink-0"
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
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 tracking-tight border-b border-gray-100 pb-3">
            Información Personal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-50 border-gray-200 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-100 border-gray-200 text-sm font-medium text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEGURIDAD */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 tracking-tight border-b border-gray-100 pb-3">
            Seguridad
          </h3>

          {isGoogleUser ? (
            <div className="flex items-start gap-3 p-4 bg-blue-50/60 border border-blue-200/60 rounded-2xl text-blue-800 text-xs font-medium">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                Iniciaste sesión con tu cuenta de <strong>Google</strong>. La
                gestión de tu contraseña se administra directamente desde tu
                cuenta de Google.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-50 border-gray-200 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repite la contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-gray-50 border-gray-200 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
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
    </div>
  );
};

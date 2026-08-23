"use client";

import React, { useEffect, useState } from "react";
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { UserAccount, UserRole } from "@/types/user";
import { adminService } from "@/services/admin.service";
import { useAuth } from "@/lib/AuthContext";

export default function ApplicationPage() {
  const { userData } = useAuth();

  const [requests, setRequests] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "active" | "rejected"
  >("pending");

  const [selectedRequest, setSelectedRequest] = useState<UserAccount | null>(
    null,
  );
  const [assignedRole, setAssignedRole] = useState<UserRole>("psychologist");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos del usuario administrador activo para la bitácora
  const currentUser = {
    uid: userData?.uid || "",
    name: userData?.name || "Administrador",
    email: userData?.email || "",
    role: userData?.role || "admin",
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAccessRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con Firestore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenApproveModal = (request: UserAccount) => {
    setSelectedRequest(request);
    setAssignedRole("psychologist");
    setIsModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      await adminService.approveUser(
        {
          uid: selectedRequest.uid,
          role: assignedRole,
        },
        currentUser,
      );
      setIsModalOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || "No se pudo aprobar la solicitud.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (uid: string) => {
    try {
      setActionLoading(true);
      await adminService.rejectUser(uid, currentUser);
      await fetchRequests();
    } catch (error: any) {
      alert(error.message || "Error al rechazar la solicitud.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Solicitudes de Acceso
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Gestiona los nuevos registros e ingresantes de la plataforma.
          </p>
        </div>

        {/* Buscador y Filtro */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="pending">Pendientes</option>
            <option value="active">Activos</option>
            <option value="rejected">Rechazados</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {/* Estado Carga / Error / Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-500 dark:text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando solicitudes de Firestore...
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200/80 dark:border-slate-700/80">
              <Clock className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
                No hay solicitudes pendientes en Firestore
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.uid}
                className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  {req.photoURL ? (
                    <img
                      src={req.photoURL}
                      alt={req.name}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                      {req.name ? req.name.charAt(0) : "U"}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {req.name}
                      {req.role && req.role !== "unassigned" && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-900">
                          {req.role}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {req.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString()
                          : "Reciente"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {req.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleReject(req.uid)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleOpenApproveModal(req)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Aprobar y Asignar Rol</span>
                      </button>
                    </>
                  )}

                  {req.status === "active" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobado / Activo
                    </span>
                  )}

                  {req.status === "rejected" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                      <XCircle className="w-4 h-4" />
                      Rechazado
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal para Aprobar y Asignar Rol */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Aprobar Solicitud de Acceso
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Asigna el rol que determinará los permisos de{" "}
                <strong className="text-gray-800 dark:text-slate-200">
                  {selectedRequest.name}
                </strong>
                .
              </p>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setAssignedRole("psychologist")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  assignedRole === "psychologist"
                    ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200"
                    : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-300"
                }`}
              >
                <Shield className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Psicólogo / Especialista</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Acceso a expedientes clínicos y consultas.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setAssignedRole("receptionist")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  assignedRole === "receptionist"
                    ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200"
                    : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-300"
                }`}
              >
                <User className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Recepcionista / Asistente</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Gestión general de citas y recepción.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmApproval}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar y Activar Acceso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

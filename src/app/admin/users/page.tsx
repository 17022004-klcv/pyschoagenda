"use client";

import React, { useState, useEffect, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  UserPlus,
  Search,
  Edit2,
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar,
  Lock,
  UserX,
  UserCheck,
  FileDown,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ListFilter,
} from "lucide-react";
import {
  getUsers,
  createUserWithAuth,
  updateUser,
  toggleUserStatus,
} from "@/services/user.service";
import { UserAccount, UserRole, UserStatus, UserFormData } from "@/types/user";

// Componentes UI de tu proyecto
import { Table, Column } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { ModalSheet } from "@/components/ui/Modal";

// PDF Templates (Asegúrate de tener o ajustar estas importaciones)
import { UsersListPDF, SingleUserPDF } from "@/components/pdf/UserPDF";

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Todos");

  // Estado para desplegar el menú de exportación
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Formulario tipado
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "psychologist",
    status: "active",
    photoURL: "https://i.ibb.co/ptJ1Mcc/OIP.jpg",
    password: "",
  });

  // Skeleton Local
  const TableSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/4 mb-6"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 dark:bg-slate-700/50 rounded-2xl w-full"
        ></div>
      ))}
    </div>
  );

  const fetchUsers = async () => {
    try {
      setIsPageLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cierra el menú desplegable si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPdfDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtro
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesRole = roleFilter === "Todos" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handlers para Modales
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "psychologist",
      status: "active",
      photoURL: "https://i.ibb.co/ptJ1Mcc/OIP.jpg",
      password: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
      photoURL: user.photoURL || "https://i.ibb.co/ptJ1Mcc/OIP.jpg",
      password: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenViewModal = (user: UserAccount) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleOpenStatusModal = (user: UserAccount) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  // Guardar (Crear/Editar)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      if (selectedUser) {
        await updateUser(selectedUser.uid, formData);
      } else {
        await createUserWithAuth(formData);
      }

      await fetchUsers();
      setIsFormModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Error al registrar el usuario");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Cambiar estado (Inactivar / Activar)
  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setIsSubmitLoading(true);

    try {
      const newStatus =
        selectedUser.status === "active" ? "inactive" : "active";
      await toggleUserStatus(selectedUser.uid, newStatus);
      await fetchUsers();
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // 📄 DESCARGAS EN PDF
  const handleDownloadFilteredPDF = async (
    filterType: "Todos" | "active" | "inactive",
  ) => {
    setIsPdfDropdownOpen(false);

    let listToExport = users;
    let titleLabel = "Todos los Usuarios";

    if (filterType === "active") {
      listToExport = users.filter((u) => u.status === "active");
      titleLabel = "Usuarios Activos";
    } else if (filterType === "inactive") {
      listToExport = users.filter((u) => u.status === "inactive");
      titleLabel = "Usuarios Inactivos";
    }

    const blob = await pdf(
      <UsersListPDF users={listToExport} filterTitle={titleLabel} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_usuarios_${filterType}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSinglePDF = async (user: UserAccount) => {
    const blob = await pdf(<SingleUserPDF user={user} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuario_${user.name.replace(/\s+/g, "_")}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Columnas para el componente <Table />
  const userColumns: Column<UserAccount>[] = [
    {
      header: "Usuario",
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <img
            src={user.photoURL || "https://i.ibb.co/ptJ1Mcc/OIP.jpg"}
            alt={user.name}
            className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-slate-700 shrink-0"
          />
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {user.name}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>Alta: {user.createdAt}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contacto",
      accessor: (user) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300 font-medium">
            <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-medium">
            <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <span>{user.phone || "Sin teléfono"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Rol",
      accessor: (user) => {
        const isPsych = user.role === "psychologist";
        const isAdmin = user.role === "admin";
        const label = isAdmin
          ? "Administrador"
          : isPsych
            ? "Psicólogo"
            : "Recepcionista";

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isAdmin
                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50"
                : isPsych
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50"
            }`}
          >
            <Shield className="w-3 h-3 shrink-0" />
            {label}
          </span>
        );
      },
    },
    {
      header: "Estado",
      accessor: (user) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            user.status === "active"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user.status === "active" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {user.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      align: "right",
      accessor: (user) => (
        <div className="flex items-center justify-end gap-1">
          {/* Botón Ver */}
          <button
            type="button"
            onClick={() => handleOpenViewModal(user)}
            title="Ver Detalle"
            className="p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Botón Editar */}
          <button
            type="button"
            onClick={() => handleOpenEditModal(user)}
            title="Editar Usuario / Cambiar Contraseña"
            className="p-1.5 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Botón Descargar PDF Individual */}
          <button
            type="button"
            onClick={() => handleDownloadSinglePDF(user)}
            title="Descargar Ficha PDF"
            className="p-1.5 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Botón Inactivar / Activar */}
          <button
            type="button"
            onClick={() => handleOpenStatusModal(user)}
            title={
              user.status === "active" ? "Inactivar Acceso" : "Activar Acceso"
            }
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              user.status === "active"
                ? "text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400"
                : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400"
            }`}
          >
            {user.status === "active" ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Administra accesos, contraseñas y estado de psicólogos y personal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-44">
            <Select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              options={[
                { label: "Todos los Roles", value: "Todos" },
                { label: "Psicólogos", value: "psychologist" },
                { label: "Recepcionistas", value: "receptionist" },
                { label: "Administradores", value: "admin" },
              ]}
            />
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* 🔽 BOTÓN DROPDOWN DE REPORTE PDF */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-purple-600" />
              <span>Exportar PDF</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isPdfDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPdfDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-700/60">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Seleccionar Reporte
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadFilteredPDF("Todos")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ListFilter className="w-4 h-4 text-purple-500" />
                  <span>Todos los Usuarios</span>
                </button>

                <button
                  onClick={() => handleDownloadFilteredPDF("active")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Solo Activos</span>
                </button>

                <button
                  onClick={() => handleDownloadFilteredPDF("inactive")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Solo Inactivos</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {isPageLoading ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={userColumns}
          data={filteredUsers}
          keyExtractor={(user: UserAccount) => user.uid}
          itemsPerPage={6}
          emptyMessage="No se encontraron usuarios en la base de datos."
        />
      )}

      {/* 👁️ MODAL VER DETALLES DE USUARIO */}
      <ModalSheet
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Usuario"
        submitText="Cerrar"
        onSubmit={(e: any) => {
          e.preventDefault();
          setIsViewModalOpen(false);
        }}
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
              <img
                src={
                  selectedUser.photoURL || "https://i.ibb.co/ptJ1Mcc/OIP.jpg"
                }
                alt={selectedUser.name}
                className="w-14 h-14 rounded-2xl object-cover border border-gray-200 dark:border-slate-700"
              />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {selectedUser.name}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold border ${
                    selectedUser.role === "admin"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : selectedUser.role === "psychologist"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {selectedUser.role === "admin"
                    ? "Administrador"
                    : selectedUser.role === "psychologist"
                      ? "Psicólogo"
                      : "Recepcionista"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs text-gray-400">Correo Electrónico:</p>
                <p className="font-semibold text-gray-800 dark:text-slate-200 mt-0.5">
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Teléfono:</p>
                <p className="font-semibold text-gray-800 dark:text-slate-200 mt-0.5">
                  {selectedUser.phone || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado de Cuenta:</p>
                <p className="font-semibold text-gray-800 dark:text-slate-200 mt-0.5">
                  {selectedUser.status === "active" ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fecha de Registro:</p>
                <p className="font-semibold text-gray-800 dark:text-slate-200 mt-0.5">
                  {selectedUser.createdAt || "No disponible"}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* 👤 MODAL CREAR / EDITAR USUARIO */}
      <ModalSheet
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveUser}
        title={selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
        submitText={selectedUser ? "Guardar Cambios" : "Crear Usuario"}
        cancelText="Cancelar"
        isLoading={isSubmitLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej. Karla Villanueva"
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="ejemplo@gmail.com"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+503 7000-0000"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {selectedUser
                  ? "Nueva Contraseña (Dejar en blanco para conservar)"
                  : "Contraseña Inicial"}
              </span>
            </label>
            <input
              type="password"
              required={!selectedUser}
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={selectedUser ? "••••••••" : "Mínimo 6 caracteres"}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Rol Asignado
              </label>
              <Select
                value={formData.role}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as UserRole,
                  })
                }
                options={[
                  { label: "Psicólogo", value: "psychologist" },
                  { label: "Recepcionista", value: "receptionist" },
                  { label: "Administrador", value: "admin" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Estado de la Cuenta
              </label>
              <Select
                value={formData.status}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as UserStatus,
                  })
                }
                options={[
                  { label: "Activo (Puede Entrar)", value: "active" },
                  { label: "Inactivo (Acceso Bloqueado)", value: "inactive" },
                ]}
              />
            </div>
          </div>
        </div>
      </ModalSheet>

      {/* ⚠️ MODAL CAMBIO DE ESTADO (SOFT DELETE / INACTIVAR) */}
      <ModalSheet
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={(e: any) => {
          e.preventDefault();
          handleToggleStatus();
        }}
        title={
          selectedUser?.status === "active"
            ? "Inactivar Usuario"
            : "Reactivar Usuario"
        }
        submitText={selectedUser?.status === "active" ? "Inactivar" : "Activar"}
        cancelText="Cancelar"
        isLoading={isSubmitLoading}
      >
        {selectedUser && (
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {selectedUser.status === "active" ? (
              <>
                ¿Estás seguro de que deseas desactivar a{" "}
                <strong className="text-gray-900 dark:text-white">
                  {selectedUser.name}
                </strong>
                ? El usuario{" "}
                <strong className="text-rose-600">
                  no podrá iniciar sesión
                </strong>{" "}
                en el sistema hasta que vuelva a ser activado.
              </>
            ) : (
              <>
                ¿Deseas reactivar el acceso para{" "}
                <strong className="text-gray-900 dark:text-white">
                  {selectedUser.name}
                </strong>
                ? Podrá volver a ingresar al sistema normalmente.
              </>
            )}
          </p>
        )}
      </ModalSheet>
    </div>
  );
}

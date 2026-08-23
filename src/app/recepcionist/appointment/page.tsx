"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Eye,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarDays,
  Pencil,
  Trash2,
  Mail,
  List,
} from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Select } from "@/components/ui/Select";
import { ModalSheet as Modal } from "@/components/ui/Modal";
import { Table, Column } from "@/components/ui/Table";
import { AppointmentCalendar } from "@/components/ui/Calendar";
import { showAlert } from "@/lib/sweetalert";
import { useAuth } from "@/lib/AuthContext";
import { AppointmentService } from "@/services/appointment.service";
import { PatientService } from "@/services/patient.service";
import { Patient } from "@/types/patient";
import {
  Appointment,
  TherapyType,
  AppointmentStatus,
} from "@/types/appointment";

const THERAPY_OPTIONS: TherapyType[] = [
  "Terapia Individual",
  "Terapia de Pareja",
  "Terapia Familiar",
  "Terapia en Línea",
  "Orientación Vocacional",
  "Terapia de Grupo",
];

const MULTI_PATIENT_THERAPIES: TherapyType[] = [
  "Terapia de Pareja",
  "Terapia Familiar",
  "Terapia de Grupo",
];

const STATUS_OPTIONS: AppointmentStatus[] = [
  "Programada",
  "Completada",
  "Cancelada",
];

export default function AppointmentsPage() {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Modo de vista
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  const todayDateStr = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    therapyType: "Terapia Individual" as TherapyType,
    date: todayDateStr,
    time: "09:00",
    status: "Programada" as AppointmentStatus,
    notes: "",
  });

  // Objeto con la información del usuario actual para la bitácora
  const currentUser = {
    uid: userData?.uid || "",
    name: userData?.name || "Usuario",
    email: userData?.email || "",
    role: userData?.role || "psicologo",
  };

  const fetchData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const [patientsData, appointmentsData] = await Promise.all([
        PatientService.getAll(),
        AppointmentService.getAll(),
      ]);
      setPatientsList(patientsData);
      setAppointments(appointmentsData);
    } catch (error) {
      showAlert.errorToast("Error al obtener datos desde la API.");
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Validaciones y Handlers
  const checkTimeConflict = (
    newDate: string,
    newTime: string,
    currentId?: string,
  ) => {
    const timeToMinutes = (str: string) => {
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    };
    const newStart = timeToMinutes(newTime);
    const newEnd = newStart + 60;

    return appointments.some((app) => {
      if (app.status === "Cancelada" || (currentId && app.id === currentId))
        return false;
      if (app.date === newDate) {
        const existingStart = timeToMinutes(app.time);
        const existingEnd = existingStart + 60;
        return newStart < existingEnd && newEnd > existingStart;
      }
      return false;
    });
  };

  const handleSendWhatsApp = (appointment: Appointment) => {
    const firstPatientId = appointment.patientIds[0];
    const patientData = patientsList.find((p) => p.id === firstPatientId);

    if (!patientData) {
      showAlert.errorToast("No se encontró el perfil del paciente.");
      return;
    }

    let targetPhone = "";
    let recipientName = "";

    if (patientData.isMinor && patientData.tutor) {
      if (!patientData.tutor.phone)
        return showAlert.errorToast("El tutor no posee teléfono.");
      targetPhone = patientData.tutor.phone;
      recipientName = patientData.tutor.name
        ? `Encargado/a de ${patientData.name}`
        : "Encargado/a";
    } else {
      if (!patientData.phone)
        return showAlert.errorToast("El paciente no posee teléfono.");
      targetPhone = patientData.phone;
      recipientName = appointment.patientNames.join(" y ");
    }

    const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
    const message = `Estimado/a *${recipientName}*, le saludamos para recordarle la cita de *${appointment.therapyType}* para el día *${appointment.date}* a las *${appointment.time} HS*. Por favor confirme su asistencia.`;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      checkTimeConflict(formData.date, formData.time, selectedAppointment?.id)
    ) {
      showAlert.errorToast(
        `Ya existe una cita agendada en la fecha ${formData.date} a las ${formData.time} HS.`,
      );
      return;
    }

    setIsLoading(true);
    const patientNames = selectedPatientIds.map(
      (id) => patientsList.find((p) => p.id === id)?.name || "Paciente",
    );
    const dataToSave = {
      patientIds: selectedPatientIds,
      patientNames,
      therapyType: formData.therapyType,
      date: formData.date,
      time: formData.time,
      status: formData.status,
      notes: formData.notes,
    };

    try {
      if (selectedAppointment) {
        // 🟢 Se pasa `currentUser` como 3er parámetro
        await AppointmentService.update(
          selectedAppointment.id,
          dataToSave,
          currentUser,
        );
        showAlert.successToast("Cita actualizada correctamente.");
      } else {
        // 🟢 Se pasa `currentUser` como 2do parámetro
        await AppointmentService.create(dataToSave, currentUser);
        showAlert.successToast("Cita agendada correctamente.");
      }
      await fetchData();
      setIsFormModalOpen(false);
    } catch (error) {
      showAlert.errorToast("Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    const confirmed = await showAlert.confirm(
      "¿Cancelar Cita?",
      "El estado cambiará a Cancelada.",
    );
    if (confirmed) {
      try {
        // 🟢 Se pasa `currentUser` como 2do parámetro
        await AppointmentService.cancel(id, currentUser);
        showAlert.successToast("La cita fue cancelada.");
        fetchData();
      } catch (error) {
        showAlert.errorToast("Error al cancelar la cita.");
      }
    }
  };

  const handleOpenAddModal = (initialDate?: string) => {
    setSelectedAppointment(null);
    setSelectedPatientIds([patientsList[0]?.id || ""]);
    setFormData({
      therapyType: "Terapia Individual",
      date: initialDate || todayDateStr,
      time: "09:00",
      status: "Programada",
      notes: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedPatientIds(
      appointment.patientIds?.length
        ? appointment.patientIds
        : [patientsList[0]?.id || ""],
    );
    setFormData({
      therapyType: appointment.therapyType,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setIsFormModalOpen(true);
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patientNames?.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || app.therapyType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Todos" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const appointmentColumns: Column<Appointment>[] = [
    {
      header: "Paciente(s)",
      accessor: (app) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base block">
              {app.patientNames?.join(", ")}
            </span>
            <p className="text-xs text-gray-400 mt-0.5">
              {app.patientNames?.length > 1
                ? `${app.patientNames.length} Pacientes`
                : "Paciente Individual"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Tipo de Terapia",
      accessor: (app) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          {app.therapyType}
        </span>
      ),
    },
    {
      header: "Fecha y Hora",
      accessor: (app) => (
        <div className="flex flex-col gap-0.5 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-gray-800">
            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{app.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{app.time} HS</span>
          </div>
        </div>
      ),
    },
    {
      header: "Estado",
      accessor: (app) => {
        if (app.status === "Completada")
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completada
            </span>
          );
        if (app.status === "Cancelada")
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Cancelada
            </span>
          );
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            Programada
          </span>
        );
      },
    },
    {
      header: "Acciones",
      align: "right",
      accessor: (app) => {
        const isCancelled = app.status === "Cancelada";
        return (
          <div className="flex items-center justify-end gap-1">
            <ActionButton
              icon={<Mail className="w-4 h-4" />}
              title={isCancelled ? "Cita cancelada" : "Enviar WhatsApp"}
              variant={isCancelled ? "danger" : "success"}
              disabled={isCancelled}
              onClick={() => !isCancelled && handleSendWhatsApp(app)}
            />
            <ActionButton
              icon={<Eye className="w-4 h-4" />}
              title="Ver Detalles"
              variant="primary"
              onClick={() => {
                setSelectedAppointment(app);
                setIsViewModalOpen(true);
              }}
            />
            <ActionButton
              icon={<Pencil className="w-4 h-4" />}
              title="Editar Cita"
              variant="warning"
              onClick={() => handleOpenEditModal(app)}
            />
            <ActionButton
              icon={<Trash2 className="w-4 h-4" />}
              title="Cancelar Cita"
              variant="danger"
              disabled={isCancelled}
              onClick={() => !isCancelled && handleCancelAppointment(app.id)}
            />
          </div>
        );
      },
    },
  ];

  // Skeleton para el modo Tabla
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

  // Skeleton para el modo Calendario
  const CalendarSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 animate-pulse space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-xl w-48"></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-slate-700/40 rounded-xl"
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* Header General */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Gestión de Citas
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Organiza tus consultas fácilmente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Switch Tab (Tabla vs Calendario) */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Calendario
            </button>
          </div>

          {viewMode === "table" && (
            <>
              <div className="w-full sm:w-44">
                <Select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  options={[
                    { label: "Todos los Estados", value: "Todos" },
                    { label: "Programadas", value: "Programada" },
                    { label: "Completadas", value: "Completada" },
                    { label: "Canceladas", value: "Cancelada" },
                  ]}
                />
              </div>
              <div className="relative w-full sm:w-52">
                <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={() => handleOpenAddModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Agendar Cita
          </button>
        </div>
      </div>

      {/* Renderizado Condicional de Componentes */}
      {isPageLoading ? (
        viewMode === "table" ? (
          <TableSkeleton />
        ) : (
          <CalendarSkeleton />
        )
      ) : viewMode === "table" ? (
        /* COMPONENTE 1: TABLA */
        <Table
          columns={appointmentColumns}
          data={filteredAppointments}
          keyExtractor={(app: any) => app.id}
          itemsPerPage={6}
        />
      ) : (
        /* COMPONENTE 2: CALENDARIO */
        <AppointmentCalendar
          appointments={appointments}
          onAddClick={handleOpenAddModal}
          onEditClick={handleOpenEditModal}
          onViewClick={(app: any) => {
            setSelectedAppointment(app);
            setIsViewModalOpen(true);
          }}
          onCancelClick={handleCancelAppointment}
          onWhatsAppClick={handleSendWhatsApp}
        />
      )}

      {/* Modal para Agendar / Editar Cita */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitForm}
        title={selectedAppointment ? "Editar Cita" : "Agendar Cita"}
        submitText={isLoading ? "Guardando..." : "Guardar"}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          {/* Tipo de Terapia */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Tipo Terapia
            </label>
            <Select
              value={formData.therapyType}
              onChange={(e: any) => {
                const newTherapy = e.target.value;
                setFormData({
                  ...formData,
                  therapyType: newTherapy,
                });

                const isMulti = [
                  "Terapia de Pareja",
                  "Terapia Familiar",
                  "Terapia Grupal",
                ].includes(newTherapy);
                if (!isMulti && selectedPatientIds.length > 1) {
                  setSelectedPatientIds([selectedPatientIds[0]]);
                }
              }}
              options={THERAPY_OPTIONS.map((t: string) => ({
                label: t,
                value: t,
              }))}
            />
          </div>

          {/* SECCIÓN DE PACIENTES DINÁMICA */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">
                {[
                  "Terapia de Pareja",
                  "Terapia Familiar",
                  "Terapia Grupal",
                ].includes(formData.therapyType)
                  ? "Pacientes Participantes"
                  : "Paciente"}
              </label>
              {[
                "Terapia de Pareja",
                "Terapia Familiar",
                "Terapia Grupal",
              ].includes(formData.therapyType) && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPatientIds([...selectedPatientIds, ""])
                  }
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Paciente
                </button>
              )}
            </div>

            <div className="space-y-2">
              {selectedPatientIds.map((currentId: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      value={currentId}
                      onChange={(e: any) => {
                        const updated = [...selectedPatientIds];
                        updated[index] = e.target.value;
                        setSelectedPatientIds(updated);
                      }}
                      options={[
                        { label: "-- Seleccionar Paciente --", value: "" },
                        ...patientsList.map((p: any) => ({
                          label: p.name,
                          value: p.id,
                        })),
                      ]}
                    />
                  </div>

                  {selectedPatientIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = selectedPatientIds.filter(
                          (_: any, i: number) => i !== index,
                        );
                        setSelectedPatientIds(updated);
                      }}
                      className="p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar paciente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                min={todayDateStr}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Hora
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Estado
            </label>
            <Select
              value={formData.status}
              onChange={(e: any) =>
                setFormData({
                  ...formData,
                  status: e.target.value,
                })
              }
              options={STATUS_OPTIONS.map((st: string) => ({
                label: st,
                value: st,
              }))}
            />
          </div>
        </div>
      </Modal>

      {/* Modal para Ver Cita */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Cita"
        cancelText="Cerrar"
      >
        {selectedAppointment && (
          <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedAppointment.patientNames?.join(", ")}
                </h3>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  {selectedAppointment.therapyType}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                {selectedAppointment.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                <span className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                  Fecha
                </span>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {selectedAppointment.date}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                <span className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                  Hora
                </span>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {selectedAppointment.time} HS
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Eye,
  Plus,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  Trash2,
  FileText,
  CalendarDays,
  Pencil,
  Trash,
  Mail,
} from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Select } from "@/components/ui/Select";
import { ModalSheet as Modal } from "@/components/ui/Modal";
import { Table, Column } from "@/components/ui/Table";
import { showAlert } from "@/lib/sweetalert";

// --- TIPOS DE DATOS ---
export type TherapyType =
  | "Terapia Individual"
  | "Terapia de Pareja"
  | "Terapia Familiar"
  | "Terapia en Línea"
  | "Orientación Vocacional"
  | "Terapia de Grupo";

export type AppointmentStatus = "Programada" | "Completada" | "Cancelada";

export interface Appointment {
  id: string;
  patientIds: string[]; // Múltiples pacientes si aplica
  patientNames: string[];
  therapyType: TherapyType;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
}

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

// PACIENTES MOCK
const MOCK_PATIENTS = [
  { id: "1", name: "Carlos Eduardo Mendoza" },
  { id: "2", name: "María José Ramos" },
  { id: "3", name: "Andrea Beatriz Gómez" },
  { id: "4", name: "Roberto Carlos Flores" },
  { id: "5", name: "Lucía Fernanda Martínez" },
];

// CITAS DUMMY DE PRUEBA
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    patientIds: ["1"],
    patientNames: ["Carlos Eduardo Mendoza"],
    therapyType: "Terapia Individual",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    status: "Programada",
    notes: "Primera sesión de evaluación.",
  },
  {
    id: "2",
    patientIds: ["2", "4"],
    patientNames: ["María José Ramos", "Roberto Carlos Flores"],
    therapyType: "Terapia de Pareja",
    date: new Date().toISOString().split("T")[0],
    time: "14:30",
    status: "Completada",
    notes: "Sesión de seguimiento.",
  },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fecha actual formateada (YYYY-MM-DD) para restricción
  const todayDate = new Date().toISOString().split("T")[0];

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cita Seleccionada y Estado del Formulario
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Lista de IDs de pacientes seleccionados (por defecto 1 paciente)
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([MOCK_PATIENTS[0].id]);
  const [formData, setFormData] = useState({
    therapyType: "Terapia Individual" as TherapyType,
    date: todayDate,
    time: "09:00",
    status: "Programada" as AppointmentStatus,
    notes: "",
  });

  const fetchAppointments = useCallback(async () => {
    setIsPageLoading(true);
    setTimeout(() => {
      setAppointments(INITIAL_APPOINTMENTS);
      setIsPageLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Si cambia el tipo de terapia y NO admite múltiples pacientes, reiniciamos a solo 1 paciente
  const handleTherapyChange = (therapy: TherapyType) => {
    setFormData((prev) => ({ ...prev, therapyType: therapy }));
    if (!MULTI_PATIENT_THERAPIES.includes(therapy)) {
      setSelectedPatientIds((prev) => [prev[0] || MOCK_PATIENTS[0].id]);
    }
  };

  // Agregar un combobox más de paciente
  const handleAddPatientSelect = () => {
    const availablePatient = MOCK_PATIENTS.find(
      (p) => !selectedPatientIds.includes(p.id)
    );
    const nextId = availablePatient ? availablePatient.id : MOCK_PATIENTS[0].id;
    setSelectedPatientIds((prev) => [...prev, nextId]);
  };

  // Eliminar un combobox de paciente
  const handleRemovePatientSelect = (index: number) => {
    if (selectedPatientIds.length > 1) {
      setSelectedPatientIds((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Actualizar la selección de paciente de una posición específica
  const handlePatientSelectChange = (index: number, newPatientId: string) => {
    setSelectedPatientIds((prev) => {
      const updated = [...prev];
      updated[index] = newPatientId;
      return updated;
    });
  };

  // Abrir modal para crear nueva cita
  const handleOpenAddModal = () => {
    setSelectedAppointment(null);
    setSelectedPatientIds([MOCK_PATIENTS[0].id]);
    setFormData({
      therapyType: "Terapia Individual",
      date: todayDate,
      time: "09:00",
      status: "Programada",
      notes: "",
    });
    setIsFormModalOpen(true);
  };

  // Abrir modal para editar cita existente
  const handleOpenEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedPatientIds(appointment.patientIds || [MOCK_PATIENTS[0].id]);
    setFormData({
      therapyType: appointment.therapyType,
      date: appointment.date < todayDate ? todayDate : appointment.date, // Ajuste por si era anterior
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || "",
    });
    setIsFormModalOpen(true);
  };

  // Abrir modal para ver detalles
  const handleOpenViewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // Guardar Cita
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mapear nombres de pacientes elegidos
    const patientNames = selectedPatientIds.map(
      (id) => MOCK_PATIENTS.find((p) => p.id === id)?.name || "Paciente"
    );

    setTimeout(() => {
      if (selectedAppointment) {
        // Actualizar Cita
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === selectedAppointment.id
              ? {
                  ...item,
                  ...formData,
                  patientIds: selectedPatientIds,
                  patientNames: patientNames,
                }
              : item
          )
        );
        showAlert.successToast("Cita actualizada con éxito");
      } else {
        // Crear Cita
        const newApp: Appointment = {
          id: Date.now().toString(),
          patientIds: selectedPatientIds,
          patientNames: patientNames,
          therapyType: formData.therapyType,
          date: formData.date,
          time: formData.time,
          status: formData.status,
          notes: formData.notes,
        };
        setAppointments((prev) => [newApp, ...prev]);
        showAlert.successToast("Cita agendada con éxito");
      }

      setIsLoading(false);
      setIsFormModalOpen(false);
    }, 400);
  };

  // Eliminar Cita
  const handleDeleteAppointment = async (id: string) => {
    const confirmed = await showAlert.confirm(
      "¿Eliminar Cita?",
      "Esta cita se eliminará del registro de forma permanente"
    );

    if (confirmed) {
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      showAlert.successToast("Cita eliminada con éxito");
    }
  };

  // Filtrado de citas
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patientNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || app.therapyType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "Todos" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isMultiPatientAllowed = MULTI_PATIENT_THERAPIES.includes(formData.therapyType);

  // Columnas para la tabla
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
              {app.patientNames.join(", ")}
            </span>
            <p className="text-xs text-gray-400 mt-0.5">
              {app.patientNames.length > 1
                ? `${app.patientNames.length} Pacientes registrados`
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
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
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
        if (app.status === "Completada") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completada
            </span>
          );
        }
        if (app.status === "Cancelada") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Cancelada
            </span>
          );
        }
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
      accessor: (app) => (
        <div className="flex items-center justify-end gap-1">
            <ActionButton
            icon={<Mail className="w-4 h-4" />}
            title="Enviar Recordatorio"
            variant="success"
            onClick={() => handleOpenViewModal(app)}
          />
          {/* 👁️ VER DETALLES */}
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            title="Ver Detalles"
            variant="primary"
            onClick={() => handleOpenViewModal(app)}
          />
          {/* ✏️ EDITAR CITA */}
          <ActionButton
            icon={<Pencil className="w-4 h-4" />}
            title="Editar Cita"
            variant="warning"
            onClick={() => handleOpenEditModal(app)}
          />
          {/* 🗑️ ELIMINAR CITA */}
          <ActionButton
            icon={<Trash2 className="w-4 h-4" />}
            title="Eliminar Cita"
            variant="danger"
            onClick={() => handleDeleteAppointment(app.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* Header + Buscador + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
           
            Gestión de Citas
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Agenda y administración del calendario de sesiones terapéuticas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Filtro por Estado */}
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Todos los Estados", value: "Todos" },
                { label: "Programadas", value: "Programada" },
                { label: "Completadas", value: "Completada" },
                { label: "Canceladas", value: "Cancelada" },
              ]}
            />
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar paciente o terapia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border border-gray-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Botón Agendar Cita */}
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-sm transition-all text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agendar Cita
          </button>
        </div>
      </div>

      {/* Tabla de Citas */}
      {isPageLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
          <p className="text-sm font-medium">Cargando la agenda de citas...</p>
        </div>
      ) : (
        <Table
          columns={appointmentColumns}
          data={filteredAppointments}
          keyExtractor={(app) => app.id}
          itemsPerPage={6}
          emptyMessage="No se encontraron citas agendadas que coincidan."
        />
      )}

      {/* 📝 MODAL AGENDAR / EDITAR CITA (`form_agendarcita`) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitForm}
        title={selectedAppointment ? "Editar Cita" : "Agendar Cita"}
        submitText={isLoading ? "Guardando..." : "Done"}
        cancelText="Cancel"
        isLoading={isLoading}
      >
        <div className="space-y-4">
          {/* Campo: Tipo Terapia */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Tipo Terapia
            </label>
            <Select
              value={formData.therapyType}
              onChange={(e) =>
                handleTherapyChange(e.target.value as TherapyType)
              }
              options={THERAPY_OPTIONS.map((t) => ({
                label: t,
                value: t,
              }))}
            />
          </div>

          {/* Campo: Paciente(s) Dinámicos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {selectedPatientIds.length > 1 ? "Pacientes" : "Paciente"}
              </label>

              {/* Muestra el botón solo si la terapia permite múltiples pacientes */}
              {isMultiPatientAllowed && (
                <button
                  type="button"
                  onClick={handleAddPatientSelect}
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Agregar paciente
                </button>
              )}
            </div>

            {/* Renderizar uno o varios Comboboxes de Pacientes */}
            {selectedPatientIds.map((patientId, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={patientId}
                    onChange={(e) =>
                      handlePatientSelectChange(index, e.target.value)
                    }
                    options={MOCK_PATIENTS.map((p) => ({
                      label: p.name,
                      value: p.id,
                    }))}
                  />
                </div>
                {/* Permite eliminar comboboxes adicionales si hay más de 1 */}
                {selectedPatientIds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePatientSelect(index)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Quitar paciente"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Campo: Fecha (Bloqueado para fechas pasadas) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Fecha
            </label>
            <input
              type="date"
              required
              min={todayDate} // 👈 Restricción para no permitir fechas pasadas
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Campo: Hora */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Hora
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Campo: Estado */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Estado
            </label>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AppointmentStatus,
                })
              }
              options={STATUS_OPTIONS.map((st) => ({
                label: st,
                value: st,
              }))}
            />
          </div>
        </div>
      </Modal>

      {/* 👁️ MODAL VER DETALLES DE CITA */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Cita"
        cancelText="Cerrar"
      >
        {selectedAppointment && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedAppointment.patientNames.join(", ")}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  {selectedAppointment.therapyType}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedAppointment.status === "Completada"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : selectedAppointment.status === "Cancelada"
                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                {selectedAppointment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-gray-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Fecha</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {selectedAppointment.date}
                </p>
              </div>

              <div className="p-3 bg-white border border-gray-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hora</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {selectedAppointment.time} HS
                </p>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-3 bg-white border border-gray-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notas Adicionales</span>
                </div>
                <p className="text-xs font-medium text-gray-700">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
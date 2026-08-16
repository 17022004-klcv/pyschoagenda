"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  CalendarRange,
  Clock,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Appointment,
  AppointmentService,
} from "@/services/inicioRecep.service";
import { Patient, PatientService } from "@/services/patient.service";
import { StatCard } from "@/components/ui/StatCard";
import { showAlert } from "@/lib/sweetalert"; // 👈 Asegúrate de que esta sea la ruta correcta a tu helper

// 📅 Función para obtener fecha local YYYY-MM-DD
const getLocalDateString = (dateObj: Date = new Date()): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 🗓️ Rango de la semana (Domingo a Sábado)
const getWeekRangeStrings = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  // El domingo de la semana actual es retroceder 'dayOfWeek' días
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);

  // El sábado de la semana actual es avanzar 6 días desde el domingo
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    startStr: getLocalDateString(sunday),
    endStr: getLocalDateString(saturday),
  };
};

export default function RecepcionistPage() {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [patientsMap, setPatientsMap] = useState<Map<string, Patient>>(
    new Map(),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Fechas clave
  const todayStr = getLocalDateString(new Date());

  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrowObj);

  const { startStr: weekStartStr, endStr: weekEndStr } = getWeekRangeStrings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [appointmentsData, patientsData] = await Promise.all([
          typeof AppointmentService.getByDate === "function"
            ? AppointmentService.getByDate(todayStr)
            : AppointmentService.getToday(),
          PatientService.getAll().catch(() => [] as Patient[]),
        ]);

        // Mapa de pacientes por ID
        const pMap = new Map<string, Patient>();
        if (Array.isArray(patientsData)) {
          patientsData.forEach((p) => {
            if (p.id) pMap.set(String(p.id), p);
          });
        }
        setPatientsMap(pMap);

        setAllAppointments(appointmentsData || []);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayStr]);

  // 🔍 Extraer fecha de la cita
  const extractDate = (app: any): string => {
    if (!app.date) return todayStr;
    return typeof app.date === "string" ? app.date.split("T")[0] : "";
  };

  // 👤 OBTENCIÓN DEL PACIENTE
  const getPatientDisplayName = (item: any): string => {
    if (!item) return "Sin datos";

    if (Array.isArray(item.patientNames) && item.patientNames.length > 0) {
      return item.patientNames.join(", ");
    }

    if (Array.isArray(item.patientIds) && item.patientIds.length > 0) {
      const names = item.patientIds
        .map((id: string) => patientsMap.get(String(id))?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }

    const singleId = item.patientId || item.patient_id;
    if (singleId && patientsMap.has(String(singleId))) {
      return patientsMap.get(String(singleId))!.name;
    }

    if (item.patient) {
      if (typeof item.patient === "string" && item.patient.length < 24)
        return item.patient;
      if (typeof item.patient === "object" && item.patient.name)
        return item.patient.name;
    }

    if (item.patientName) return item.patientName;

    return "Paciente sin nombre";
  };

  // 🎯 OBTENCIÓN DEL TIPO DE SESIÓN
  const getSessionType = (item: any): string => {
    if (!item) return "Consulta General";
    return (
      item.therapyType ||
      item.sessionType ||
      item.type ||
      item.reason ||
      "Consulta General"
    );
  };

  // Filtrados por fecha
  const todayAppointments = allAppointments.filter(
    (app) => extractDate(app) === todayStr,
  );

  const tomorrowAppointments = allAppointments.filter(
    (app) => extractDate(app) === tomorrowStr,
  );

  const weekAppointments = allAppointments.filter((app) => {
    const d = extractDate(app);
    return d >= weekStartStr && d <= weekEndStr;
  });

  // 🛑 Citas PROGRAMADAS de hoy
  const pendingAppointmentsToday = todayAppointments.filter(
    (app: any) =>
      app.status === "Programada" ||
      app.status === "PROGRAMADA" ||
      app.status === "programada",
  );

  // ⏰ Ordenar de AM a PM
  const sortedPendingAppointments = [...pendingAppointmentsToday].sort(
    (a: any, b: any) => {
      const timeA = a.time || a.hour || "00:00";
      const timeB = b.time || b.hour || "00:00";
      return timeA.localeCompare(timeB);
    },
  );

  // 🟢 Cambiar estado de la cita con actualización de tabla y alerta
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await AppointmentService.updateStatus(id, newStatus as any);

      // 1. Actualizar estado local asegurando el tipo explícito de status
      setAllAppointments((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, status: newStatus as Appointment["status"] }
            : app,
        ),
      );

      // 2. Mostrar Alerta con tu helper
      if (typeof showAlert?.successToast === "function") {
        showAlert.successToast("Cita marcada como completada");
      }
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      if (typeof showAlert?.errorToast === "function") {
        showAlert.errorToast("Error al actualizar la cita");
      } else {
        alert("Error al actualizar el estado de la cita.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Inicio
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gestión de citas programadas y resumen de la agenda.
          </p>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Citas de Hoy"
          value={todayAppointments.length}
          badgeText="Hoy"
          badgeColor="blue"
          icon={<CalendarDays className="w-6 h-6" />}
        />

        <StatCard
          title="Citas de Mañana"
          value={tomorrowAppointments.length}
          badgeText="Siguiente día"
          badgeColor="purple"
          icon={<CalendarCheck className="w-6 h-6" />}
        />

        <StatCard
          title="Total de la Semana"
          value={weekAppointments.length}
          badgeText="Semana actual"
          badgeColor="emerald"
          icon={<CalendarRange className="w-6 h-6" />}
        />
      </div>

      {/* TABLA DE CITAS PROGRAMADAS DEL DÍA */}
      <div className="bg-white border border-gray-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Citas Programadas de Hoy
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Solo se muestran los pacientes programados para el día de hoy
            </p>
          </div>
          {isUpdating && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-xl">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando
              cambios...
            </span>
          )}
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="py-12 flex justify-center items-center text-gray-400 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Cargando las citas del día...</span>
          </div>
        ) : sortedPendingAppointments.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-medium text-sm">
            🎉 ¡Excelente! No hay citas programadas por atender el día de hoy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Hora</th>
                  <th className="py-3.5 px-6">Paciente</th>
                  <th className="py-3.5 px-6">Tipo de Sesión</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {sortedPendingAppointments.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-150"
                  >
                    {/* Hora */}
                    <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {item.time || item.hour || "00:00"}
                      </div>
                    </td>

                    {/* Paciente */}
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {getPatientDisplayName(item)}
                    </td>

                    {/* Tipo de Sesión */}
                    <td className="py-4 px-6 text-gray-500 font-medium text-xs">
                      {getSessionType(item)}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Programada
                      </span>
                    </td>

                    {/* Botón Acción */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleStatusChange(item.id, "Completada")
                        }
                        disabled={isUpdating}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Marcar Completada
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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
import { PatientService } from "@/services/patient.service";
import { Patient } from "@/types/patient";
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

  // 🟢 Componente Skeleton para las KPI Cards
  const StatCardSkeleton = () => (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 shadow-sm animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16 mt-2"></div>
    </div>
  );

  // 🟢 Componente Skeleton para la Tabla
  const TableSkeleton = () => (
    <div className="p-6 space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 dark:bg-slate-700/50 rounded-2xl w-full"
        ></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Inicio
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
            Gestión de citas programadas y resumen de la agenda.
          </p>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* SECCIÓN DE CITAS PROGRAMADAS */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Citas Programadas de Hoy
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              Solo se muestran los pacientes programados para el día de hoy
            </p>
          </div>
          {isUpdating && (
            <span className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/50 px-3 py-1.5 rounded-xl">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando
              cambios...
            </span>
          )}
        </div>

        {/* CONTENIDO DE CITAS */}
        {loading ? (
          <TableSkeleton />
        ) : sortedPendingAppointments.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-slate-400 font-medium text-sm px-4">
            🎉 ¡Excelente! No hay citas programadas por atender el día de hoy.
          </div>
        ) : (
          <>
            {/* VISTA TABLET Y DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/80 text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Hora</th>
                    <th className="py-3.5 px-6">Paciente</th>
                    <th className="py-3.5 px-6">Tipo de Sesión</th>
                    <th className="py-3.5 px-6">Estado</th>
                    <th className="py-3.5 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-sm">
                  {sortedPendingAppointments.map((item: any) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
                          {item.time || item.hour || "00:00"}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        {getPatientDisplayName(item)}
                      </td>

                      <td className="py-4 px-6 text-gray-500 dark:text-slate-400 font-medium text-xs">
                        {getSessionType(item)}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-200/60 dark:border-amber-800/50">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Programada
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleStatusChange(item.id, "Completada")
                          }
                          disabled={isUpdating}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
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

            {/* VISTA MÓVIL */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-slate-700/60">
              {sortedPendingAppointments.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 space-y-3 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-mono">
                      <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
                      {item.time || item.hour || "00:00"}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-200/60 dark:border-amber-800/50">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Programada
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {getPatientDisplayName(item)}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                      {getSessionType(item)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStatusChange(item.id, "Completada")}
                    disabled={isUpdating}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar Completada
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

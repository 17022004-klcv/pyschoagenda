import { useEffect, useState } from "react";
import {
  Appointment,
  AppointmentService,
} from "../../services/inicioRecep.service";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
} from "lucide-react";

export const Dashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await AppointmentService.getToday();
        setTodayAppointments(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar las citas del día");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto p-4">
        <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-lg w-48 mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/80 rounded-2xl p-4"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium">
        Error: {error}
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Completada":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completada
          </span>
        );
      case "Cancelada":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
            <Clock3 className="w-3.5 h-3.5" /> Programada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
            Citas de Hoy
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
            Resumen de consultas agendadas para la jornada.
          </p>
        </div>
      </div>

      {todayAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-8 text-center space-y-2">
          <Calendar className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            No hay citas programadas para hoy.
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Las nuevas citas asignadas para hoy aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    {appointment.patientName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                    <span>{appointment.time} HS</span>
                  </div>
                </div>
              </div>

              <div>{renderStatusBadge(appointment.status)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Heart,
  CalendarCheck2,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { StatCard } from "@/components/ui/StatCard";
import { PatientService } from "@/services/patient.service";
import { AppointmentService } from "@/services/inicioRecep.service";
import { getUsers } from "@/services/user.service";
import { UserAccount } from "@/types/user";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de KPIs
  const [totalPsychologists, setTotalPsychologists] = useState<number>(0);
  const [totalReceptionists, setTotalReceptionists] = useState<number>(0);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [totalAppointmentsMonth, setTotalAppointmentsMonth] =
    useState<number>(0);

  // Estados de Gráficas Dinámicas
  const [therapyDistribution, setTherapyDistribution] = useState<any[]>([]);
  const [monthlyAppointmentsData, setMonthlyAppointmentsData] = useState<any[]>(
    [],
  );
  const [patientStatusData, setPatientStatusData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Intentamos obtener todas las citas si el servicio lo soporta, o traemos el listado base
        const fetchAppointments = async () => {
          if (typeof (AppointmentService as any).getAll === "function") {
            return await (AppointmentService as any).getAll();
          } else if (typeof AppointmentService.getByDate === "function") {
            return await AppointmentService.getByDate(
              new Date().toISOString().split("T")[0],
            );
          } else if (typeof AppointmentService.getToday === "function") {
            return await AppointmentService.getToday();
          }
          return [];
        };

        const [patients, appointments, users] = await Promise.all([
          PatientService.getAll().catch(() => []),
          fetchAppointments().catch(() => []),
          getUsers().catch(() => [] as UserAccount[]),
        ]);

        // 1. KPI: Usuarios por Rol
        if (Array.isArray(users)) {
          const psychs = users.filter(
            (u) => u.role === "psychologist" && u.status === "active",
          );
          const receps = users.filter(
            (u) => u.role === "receptionist" && u.status === "active",
          );
          setTotalPsychologists(psychs.length);
          setTotalReceptionists(receps.length);
        }

        // 2. KPI & Gráfica: Pacientes por Estado
        if (Array.isArray(patients)) {
          setTotalPatients(patients.length);

          const statusCount = patients.reduce((acc: any, p: any) => {
            const status =
              p.status === "active"
                ? "Activo"
                : p.status === "inactive"
                  ? "Inactivo"
                  : p.status || "Activo";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});

          setPatientStatusData(
            Object.keys(statusCount).map((key) => ({
              estado: key,
              cantidad: statusCount[key],
            })),
          );
        }

        // 3. Gráficas Dinámicas de Citas
        if (Array.isArray(appointments)) {
          setTotalAppointmentsMonth(appointments.length);

          // A) Procesar Distribución por Especialidad / Terapia (Dona)
          const therapyCount = appointments.reduce((acc: any, app: any) => {
            const type =
              app.therapyType ||
              app.sessionType ||
              app.type ||
              "Consulta General";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});

          setTherapyDistribution(
            Object.keys(therapyCount).map((key) => ({
              name: key,
              value: therapyCount[key],
            })),
          );

          // B) Procesar Evolución Mensual Dinámica REAL de Citas
          const monthlyMap: { [key: number]: number } = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
          };

          appointments.forEach((app: any) => {
            if (app.date) {
              const dateObj = new Date(app.date);
              if (!isNaN(dateObj.getTime())) {
                const monthIndex = dateObj.getMonth();
                monthlyMap[monthIndex] = (monthlyMap[monthIndex] || 0) + 1;
              }
            }
          });

          // Mapeamos a los últimos 6 meses del año actual
          const currentMonth = new Date().getMonth();
          const last6Months = [];
          for (let i = 5; i >= 0; i--) {
            const mIndex = (currentMonth - i + 12) % 12;
            last6Months.push({
              mes: MESES[mIndex],
              citas: monthlyMap[mIndex] || 0,
            });
          }

          setMonthlyAppointmentsData(last6Months);
        }
      } catch (err) {
        console.error("Error al cargar métricas dinámicas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const ChartSkeleton = () => (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 shadow-sm animate-pulse h-[260px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
          Métricas dinámicas y métricas operativas de la clínica.
        </p>
      </div>

      {/* KPIS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {loading ? (
          <p className="text-sm text-gray-400">Cargando indicadores...</p>
        ) : (
          <>
            <StatCard
              title="Psicólogas/os"
              value={totalPsychologists}
              badgeText="Activos"
              badgeColor="blue"
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Recepcionistas"
              value={totalReceptionists}
              badgeText="Atención"
              badgeColor="purple"
              icon={<UserCheck className="w-6 h-6" />}
            />
            <StatCard
              title="Total Pacientes"
              value={totalPatients}
              badgeText="Registrados"
              badgeColor="emerald"
              icon={<Heart className="w-6 h-6" />}
            />
            <StatCard
              title="Total Citas"
              value={totalAppointmentsMonth}
              badgeText="Histórico"
              badgeColor="amber"
              icon={<CalendarCheck2 className="w-6 h-6" />}
            />
          </>
        )}
      </div>

      {/* SECCIÓN DE GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICA 1: TENDENCIA REAL DE CITAS (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Evolución de Sesiones Atendidas
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mt-0.5">
              Volumen de citas por mes (Últimos 6 meses)
            </p>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyAppointmentsData}>
                  <defs>
                    <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="mes"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      borderColor: "#334155",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="citas"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCitas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* GRÁFICA 2: DONA AJUSTADA (Sin desbordamiento) */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-500" />
              Especialidades
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mt-0.5">
              Demanda por categoría
            </p>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[200px] w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      therapyDistribution.length > 0
                        ? therapyDistribution
                        : [{ name: "Sin Citas", value: 1 }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {therapyDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      borderColor: "#334155",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Leyenda Personalizada dentro de un scroll contenedor para prevenir desbordamiento */}
          <div className="max-h-[80px] overflow-y-auto space-y-1.5 pr-1 mt-2 border-t border-gray-100 dark:border-slate-700/50 pt-2">
            {therapyDistribution.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-slate-300 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ESTADO DE PACIENTES */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Condición de Pacientes
          </h2>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  patientStatusData.length > 0
                    ? patientStatusData
                    : [{ estado: "Activos", cantidad: totalPatients }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="estado"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "12px",
                    borderColor: "#334155",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  barSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

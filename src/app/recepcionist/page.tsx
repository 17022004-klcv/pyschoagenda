"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  CalendarRange,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

// Datos ficticios de prueba
const mockTodayAppointments = [
  {
    id: "1",
    time: "08:00 AM",
    patient: "Sofía Martínez",
    psychologist: "Dra. Carmen López",
    status: "completada",
    type: "Terapia Individual",
  },
  {
    id: "2",
    time: "09:30 AM",
    patient: "Carlos Mendoza",
    psychologist: "Dra. Carmen López",
    status: "en_espera",
    type: "Primera Consulta",
  },
  {
    id: "3",
    time: "11:00 AM",
    patient: "Ana María Rivas",
    psychologist: "Lic. Roberto Gómez",
    status: "pendiente",
    type: "Terapia de Pareja",
  },
  {
    id: "4",
    time: "02:00 PM",
    patient: "Diego Fernández",
    psychologist: "Dra. Carmen López",
    status: "pendiente",
    type: "Seguimiento",
  },
];

export default function RecepcionistDashboard() {
  const [appointments, setAppointments] = useState(mockTodayAppointments);

  const handleStatusChange = (id: string, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* Header Saludo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            ¡Hola, Recepción! 👋
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Resumen de la agenda clínica y control de pacientes.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-md shadow-blue-500/15 transition-all duration-200">
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      {/* 📊 KPI CARDS (Fondo suave para resaltar sobre la página blanca) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Hoy */}
        <div className="bg-[#F8F9FA] border border-gray-200/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Citas para Hoy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {appointments.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                4 Programadas
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Mañana */}
        <div className="bg-[#F8F9FA] border border-gray-200/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Citas para Mañana
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">6</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                Confirmadas
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Semana Actual (CORREGIDO) */}
        <div className="bg-[#F8F9FA] border border-gray-200/80 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Semana Actual
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">24</span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-200/60 px-2 py-0.5 rounded-full">
                Total semanal
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200/60 flex items-center justify-center text-violet-600">
            <CalendarRange className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 📅 AGENDA DEL DÍA */}
      <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-3xl shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Agenda del Día
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Gestión e ingreso de pacientes en tiempo real
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-xl">
            Hoy
          </span>
        </div>

        {/* Citas */}
        <div className="space-y-3">
          {appointments.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-gray-200/60 hover:border-blue-200 hover:shadow-sm transition-all duration-200 gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100/80 text-gray-700 rounded-xl text-xs font-bold shrink-0">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  {item.time}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    {item.patient}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.psychologist}
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                {item.status === "completada" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Atendido
                  </span>
                )}
                {item.status === "en_espera" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/60">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    En Sala de Espera
                  </span>
                )}
                {item.status === "pendiente" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200/60">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    Pendiente
                  </span>
                )}

                {item.status === "pendiente" && (
                  <button
                    onClick={() => handleStatusChange(item.id, "en_espera")}
                    className="text-xs bg-gray-900 hover:bg-black text-white font-semibold px-3 py-1.5 rounded-xl transition-all"
                  >
                    Marcar Llegada
                  </button>
                )}
                {item.status === "en_espera" && (
                  <button
                    onClick={() => handleStatusChange(item.id, "completada")}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all"
                  >
                    Pasar a Consulta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

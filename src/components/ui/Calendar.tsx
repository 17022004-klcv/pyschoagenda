"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Mail,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Appointment } from "@/services/appointment.service";
import { ActionButton } from "@/components/ui/ActionButton";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAddClick: (date: string) => void;
  onEditClick: (appointment: Appointment) => void;
  onViewClick: (appointment: Appointment) => void;
  onCancelClick: (id: string) => void;
  onWhatsAppClick: (appointment: Appointment) => void;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function AppointmentCalendar({
  appointments,
  onAddClick,
  onEditClick,
  onViewClick,
  onCancelClick,
  onWhatsAppClick,
}: AppointmentCalendarProps) {
  const todayObj = new Date();
  const todayDateStr = todayObj.toISOString().split("T")[0];

  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(todayObj.getFullYear(), todayObj.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Citas del día seleccionado
  const dayAppointments = useMemo(() => {
    return appointments.filter((app) => app.date === selectedDate);
  }, [appointments, selectedDate]);

  // Cálculo de los días del mes
  // Tipamos la estructura explícita de cada slot
  type CalendarSlot =
    | { empty: true; key: string }
    | {
        empty: false;
        day: number;
        dateStr: string;
        hasAppointments: boolean;
        isToday: boolean;
        isSelected: boolean;
        key: string;
      };

  const calendarDays = useMemo<CalendarSlot[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const slots: CalendarSlot[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      slots.push({ empty: true, key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const fullDateStr = `${year}-${monthStr}-${dayStr}`;

      const dayApps = appointments.filter((a) => a.date === fullDateStr);

      slots.push({
        empty: false,
        day,
        dateStr: fullDateStr,
        hasAppointments: dayApps.length > 0,
        isToday: fullDateStr === todayDateStr,
        isSelected: fullDateStr === selectedDate,
        key: fullDateStr,
      });
    }

    return slots;
  }, [currentMonth, appointments, selectedDate, todayDateStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Grilla Principal del Calendario */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-gray-900 capitalize">
              {currentMonth.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDate(todayDateStr);
              }}
              className="mt-1 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-600 hover:text-white transition-all"
            >
              Hoy
            </button>
          </div>

          <button
            onClick={() =>
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 py-1 border-b border-gray-100">
          {DAY_NAMES.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((slot) => {
            if (slot.empty) {
              return (
                <div
                  key={slot.key}
                  className="aspect-square rounded-xl bg-gray-50/50"
                />
              );
            }

            return (
              <button
                key={slot.key}
                onClick={() => setSelectedDate(slot.dateStr)}
                className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-center relative transition-all text-sm font-semibold border ${
                  slot.isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                    : slot.isToday
                      ? "bg-blue-50 text-blue-600 border-blue-300 font-bold"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-100"
                }`}
              >
                <span>{slot.day}</span>
                {slot.hasAppointments && (
                  <span
                    className={`w-2 h-2 rounded-full mt-1 ${
                      slot.isSelected ? "bg-white" : "bg-blue-600"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Lateral del Día */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              Agenda del Día
            </h3>
            <p className="text-xs text-gray-400 font-medium">{selectedDate}</p>
          </div>
          <button
            onClick={() => onAddClick(selectedDate)}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px]">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <CalendarIcon className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
              <p className="text-xs font-medium">Sin citas agendadas.</p>
              <button
                onClick={() => onAddClick(selectedDate)}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Agendar en este día
              </button>
            </div>
          ) : (
            dayAppointments.map((app) => {
              const isCancelled = app.status === "Cancelada";
              return (
                <div
                  key={app.id}
                  className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/60 flex flex-col gap-2 transition-all hover:bg-white hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">
                        {app.patientNames?.join(", ")}
                      </span>
                      <span className="text-xs text-gray-500 font-medium block">
                        {app.therapyType}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === "Completada"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "Cancelada"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{app.time} HS</span>
                  </div>

                  <div className="flex items-center justify-end gap-1 border-t border-gray-200/50 pt-2 mt-1">
                    <ActionButton
                      icon={<Mail className="w-3.5 h-3.5" />}
                      title={isCancelled ? "Cita cancelada" : "Enviar WhatsApp"}
                      variant={isCancelled ? "danger" : "success"}
                      disabled={isCancelled}
                      onClick={() => !isCancelled && onWhatsAppClick(app)}
                    />
                    <ActionButton
                      icon={<Eye className="w-3.5 h-3.5" />}
                      title="Ver Detalles"
                      variant="primary"
                      onClick={() => onViewClick(app)}
                    />
                    <ActionButton
                      icon={<Pencil className="w-3.5 h-3.5" />}
                      title="Editar"
                      variant="warning"
                      onClick={() => onEditClick(app)}
                    />
                    <ActionButton
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      title="Cancelar"
                      variant="danger"
                      disabled={isCancelled}
                      onClick={() => !isCancelled && onCancelClick(app.id)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

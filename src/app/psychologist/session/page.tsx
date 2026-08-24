"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { showAlert } from "@/lib/sweetalert";
import { sessionService } from "@/services/session.service";
import { PatientService } from "@/services/patient.service";
import { TherapyType } from "@/services/appointment.service";
import { ExpedientService } from "@/services/expedient.service";
import { Patient } from "@/types/patient"; // O la interfaz/tipo de tu paciente
import { useAuth } from "@/lib/AuthContext";
import { formatters } from "@/lib/validators";

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

export default function SessionPage() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const { currentUser } = useAuth();

  const [rawPatients, setRawPatients] = useState<Patient[]>([]);
  const [patientOptions, setPatientOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Cargando pacientes..." }]);

  const [tutorOptions, setTutorOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Seleccionar tutor..." }]);

  // 1. Cambiamos patient: "" por selectedPatients: [""]
  const [formData, setFormData] = useState({
    selectedPatients: [""] as string[],
    therapyType: "Terapia Individual" as TherapyType,
    hasTutor: false,
    tutorName: "",
    theme: "",
    summary: "",
    analysis: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const patientsData = await PatientService.getAll();

        // 1. Guardar pacientes en estado sin formatear
        setRawPatients(patientsData);

        // 2. Formatear lista para el Select de Pacientes
        const formattedPatients = patientsData.map((p) => ({
          value: p.id,
          label: p.name,
        }));

        // 3. Extraer y formatear lista de Tutores
        const tutorsList = patientsData
          .filter((p) => p.tutor && p.tutor.name)
          .map((p) => ({
            value: p.tutor!.name,
            label: `${p.tutor!.name} (${p.tutor!.relationship} de ${p.name})`,
          }));

        // 4. Actualizar las opciones de los Selects
        setPatientOptions([
          { value: "", label: "Seleccionar paciente..." },
          ...formattedPatients,
        ]);

        setTutorOptions([
          { value: "", label: "Seleccionar tutor..." },
          ...tutorsList,
        ]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    }

    loadData();
  }, []);
  // Handlers para agregar, actualizar y remover selectores de paciente
  const handlePatientChange = (index: number, value: string) => {
    const updated = [...formData.selectedPatients];
    updated[index] = value;
    setFormData({ ...formData, selectedPatients: updated });
  };

  const handleAddPatientSelect = () => {
    setFormData({
      ...formData,
      selectedPatients: [...formData.selectedPatients, ""],
    });
  };

  const handleRemovePatientSelect = (index: number) => {
    const updated = formData.selectedPatients.filter((_, i) => i !== index);
    setFormData({ ...formData, selectedPatients: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showAlert.errorToast("Debes estar autenticado para guardar una sesión.");
      return;
    }
    // Validación: verificar que al menos el primer paciente esté seleccionado
    const validPatients = formData.selectedPatients.filter((p) => p !== "");
    if (validPatients.length === 0 || !formData.theme) {
      showAlert?.errorToast
        ? showAlert.errorToast("Por favor completa los campos obligatorios")
        : alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      // 🟢 1. Obtener la información completa de los pacientes seleccionados
      const selectedPatientsData = rawPatients.filter((p) =>
        validPatients.includes(p.id),
      );

      const patientIds = selectedPatientsData.map((p) => p.id);
      const patientNames = selectedPatientsData.map((p) => p.name);

      const fallbackUser = currentUser || {
        uid: user?.uid || "",
        name: user?.displayName || user?.email?.split("@")[0] || "Usuario",
        email: user?.email || "",
        role: "psicologo",
      };

      const expedient = await ExpedientService.getOrCreateExpedient(
        {
          patientIds,
          patientNames,
          therapyType: formData.therapyType,
        },
        fallbackUser, // 🟢 Pasamos el contexto del usuario con name y role
      );

      // 🟢 3. Crear la sesión pasando el código real obtenido y el usuario autenticado
      await sessionService.createSession(
        {
          patientId: validPatients[0], // O enviar el arreglo 'patientIds' si tu backend lo acepta
          expedientCode: expedient.code, // 👈 Aquí se asigna el código dinámico
          therapyType: formData.therapyType,
          hasTutor: formData.hasTutor,
          tutorName: formData.hasTutor ? formData.tutorName : "",
          theme: formData.theme,
          summary: formData.summary,
          analysis: formData.analysis,
          date: currentDate,
        },
        fallbackUser, // 👈 Se agrega el argumento 'user' obligatorio
      );

      showAlert?.successToast
        ? showAlert.successToast("Sesión guardada en el expediente con éxito")
        : alert("Sesión guardada con éxito");

      // Limpieza de formulario
      setFormData({
        selectedPatients: [""],
        therapyType: "Terapia Individual" as TherapyType,
        hasTutor: false,
        tutorName: "",
        theme: "",
        summary: "",
        analysis: "",
      });
    } catch (error) {
      console.error("Error al guardar la sesión:", error);
      showAlert?.errorToast
        ? showAlert.errorToast("Error al guardar la sesión")
        : alert("Error al guardar la sesión");
    }
  };

  const SessionFormSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-700/80">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
        <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-xl w-32"></div>
      </div>

      {/* Form Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
      </div>

      <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
      <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-24 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-24 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>

      <div className="flex justify-end">
        <div className="h-11 bg-gray-200 dark:bg-slate-700 rounded-2xl w-40"></div>
      </div>
    </div>
  );
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-700/80">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Registro de Sesión
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 w-fit">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{currentDate}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lista Dinámica de Pacientes - Optimizada para iPads */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Paciente(s)
              </label>
              {formData.selectedPatients.map(
                (patientId: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 transition-all duration-200 fade-in"
                  >
                    <div className="flex-1">
                      <Select
                        value={patientId}
                        onChange={(e: any) =>
                          handlePatientChange(index, e.target.value)
                        }
                        options={patientOptions}
                      />
                    </div>
                    {formData.selectedPatients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePatientSelect(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar paciente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ),
              )}
              <button
                type="button"
                onClick={handleAddPatientSelect}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline flex items-center gap-1.5 pt-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar otro paciente
              </button>
            </div>

            {/* Tipo de Terapia */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Tipo de Terapia
              </label>
              <Select
                value={formData.therapyType}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    therapyType: e.target.value,
                  })
                }
                options={THERAPY_OPTIONS.map((therapy: string) => ({
                  value: therapy,
                  label: therapy,
                }))}
              />
            </div>
          </div>

          {/* Sección de Tutor Legal - Dark Mode */}
          <div className="p-4 bg-gray-50/70 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700 rounded-xl space-y-3.5 transition-colors duration-200">
            <div className="flex items-center space-x-2.5">
              <input
                type="checkbox"
                id="hasTutor"
                checked={formData.hasTutor}
                onChange={(e) =>
                  setFormData({ ...formData, hasTutor: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-white dark:focus:ring-offset-slate-800 cursor-pointer"
              />
              <label
                htmlFor="hasTutor"
                className="text-xs font-semibold text-gray-700 dark:text-slate-300 cursor-pointer select-none"
              >
                ¿La sesión involucra o requiere tutor legal?
              </label>
            </div>

            {formData.hasTutor && (
              <div className="pt-1 transition-all duration-300 fade-in">
                <Select
                  value={formData.tutorName}
                  onChange={(e: any) =>
                    setFormData({ ...formData, tutorName: e.target.value })
                  }
                  options={tutorOptions}
                />
              </div>
            )}
          </div>

          {/* Tema Tratado */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
              Tema Tratado
            </label>
            <Input
              placeholder="Ej. Manejo de ansiedad, duelo, dinámica familiar..."
              value={formData.theme}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  theme: formatters.maxLength(e.target.value, 100),
                })
              }
            />
          </div>

          {/* Resumen de la Sesión */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
              Resumen de la Sesión
            </label>
            <textarea
              rows={3}
              placeholder="Descripción objetiva de los hechos principales expuestos en la sesión..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 font-medium placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 transition-all resize-none"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          {/* Análisis Clínico */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
              Análisis Clínico
            </label>
            <textarea
              rows={3}
              placeholder="Evaluación psicológica profesional, observaciones y plan a seguir..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 font-medium placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 transition-all resize-none"
              value={formData.analysis}
              onChange={(e) =>
                setFormData({ ...formData, analysis: e.target.value })
              }
            />
          </div>

          {/* Botón Guardar - Optimizada para iPads */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-2xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95 shadow-blue-500/10"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

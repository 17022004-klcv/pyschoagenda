"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { showAlert } from "@/lib/sweetalert";
import { sessionService } from "@/services/session.service";
import { PatientService } from "@/services/patient.service"; // Importas tu servicio de pacientes

export default function SessionPage() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [patientOptions, setPatientOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Cargando pacientes..." }]);

  const [tutorOptions, setTutorOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Seleccionar tutor..." }]);

  const [formData, setFormData] = useState({
    patient: "",
    therapyType: "Individual",
    hasTutor: false,
    tutorName: "",
    theme: "",
    summary: "",
    analysis: "",
  });

  useEffect(() => {
    async function fetchPatients() {
      try {
        const patients = await PatientService.getAll(); // Trae los datos de la BD
        const formattedPatients = patients.map((patient) => ({
          value: patient.id,
          label: patient.name,
        }));

        setPatientOptions([
          { value: "", label: "Seleccionar paciente..." },
          ...formattedPatients,
        ]);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      }
    }

    fetchPatients();
  }, []);

  // Dentro del componente SessionPage:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.theme) {
      showAlert?.errorToast
        ? showAlert.errorToast("Por favor completa los campos obligatorios")
        : alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      await sessionService.createSession({
        patientId: formData.patient,
        expedientCode: "EXP-TEMP", // Se reemplazará con la lectura dinámica del paciente
        therapyType: formData.therapyType,
        hasTutor: formData.hasTutor,
        tutorName: formData.hasTutor ? formData.tutorName : "",
        theme: formData.theme,
        summary: formData.summary,
        analysis: formData.analysis,
        date: currentDate,
      });

      showAlert?.successToast
        ? showAlert.successToast("Sesión guardada en el expediente con éxito")
        : alert("Sesión guardada con éxito");

      // Limpiar el formulario
      setFormData({
        patient: "",
        therapyType: "Individual",
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      <div>
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Registro de Sesión
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 w-fit">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Fila 1: Paciente y Tipo de Terapia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Paciente(s)
              </label>
              <Select
                value={formData.patient}
                onChange={(e) =>
                  setFormData({ ...formData, patient: e.target.value })
                }
                options={patientOptions}
              />
              <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline block pt-0.5">
                + Agregar nuevo paciente
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Tipo de Terapia
              </label>
              <Select
                value={formData.therapyType}
                onChange={(e) =>
                  setFormData({ ...formData, therapyType: e.target.value })
                }
                options={[
                  { value: "Individual", label: "Individual" },
                  { value: "Pareja", label: "Pareja" },
                  { value: "Familiar", label: "Familiar" },
                  { value: "Infantil", label: "Infantil / Adolescente" },
                ]}
              />
            </div>
          </div>

          {/* Sección de Tutor Legal */}
          <div className="p-4 bg-gray-50/70 border border-gray-200/60 rounded-xl space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasTutor"
                checked={formData.hasTutor}
                onChange={(e) =>
                  setFormData({ ...formData, hasTutor: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="hasTutor"
                className="text-xs font-semibold text-gray-700 cursor-pointer"
              >
                ¿La sesión involucra o requiere tutor legal?
              </label>
            </div>

            {formData.hasTutor && (
              <div className="pt-1">
                <Select
                  value={formData.tutorName}
                  onChange={(e) =>
                    setFormData({ ...formData, tutorName: e.target.value })
                  }
                  options={tutorOptions}
                />
              </div>
            )}
          </div>

          {/* Tema Tratado */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Tema Tratado
            </label>
            <Input
              placeholder="Ej. Manejo de ansiedad, duelo, dinámica familiar..."
              value={formData.theme}
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value })
              }
            />
          </div>

          {/* Resumen de la Sesión */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Resumen de la Sesión
            </label>
            <textarea
              rows={3}
              placeholder="Descripción objetiva de los hechos principales expuestos en la sesión..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all resize-none"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          {/* Análisis Clínico */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Análisis Clínico
            </label>
            <textarea
              rows={3}
              placeholder="Evaluación psicológica profesional, observaciones y plan a seguir..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all resize-none"
              value={formData.analysis}
              onChange={(e) =>
                setFormData({ ...formData, analysis: e.target.value })
              }
            />
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end pt-2">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar Sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

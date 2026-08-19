"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  FileText,
  Eye,
  Edit,
  Calendar,
  FileCheck,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { ModalSheet } from "@/components/ui/Modal";
import { sessionService } from "@/services/session.service";
import { PatientService, Patient } from "@/services/patient.service";
import { SessionData } from "@/types/session";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { SessionDetailPdfDocument } from "@/components/pdf/SessionDetailPdfDocument";
import { AppointmentProofPdfDocument } from "@/components/pdf/AppointmentProofPdfDocument";
import { FullExpedientPdfDocument } from "@/components/pdf/FullExpedientPdfDocument";

const THERAPY_OPTIONS = [
  { value: "TODAS", label: "Todas las terapias" },
  { value: "Terapia Individual", label: "Terapia Individual" },
  { value: "Terapia de Pareja", label: "Terapia de Pareja" },
  { value: "Terapia Familiar", label: "Terapia Familiar" },
  { value: "Terapia en Línea", label: "Terapia en Línea" },
  { value: "Orientación Vocacional", label: "Orientación Vocacional" },
  { value: "Terapia de Grupo", label: "Terapia de Grupo" },
];

export default function MedicalHistoryPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // 🟢 Filtros de la tabla principal
  const [selectedExpedient, setSelectedExpedient] = useState<string>("");
  const [selectedTherapy, setSelectedTherapy] = useState("TODAS");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [loading, setLoading] = useState(true);

  // Estados para Modal de Descarga
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadScope, setDownloadScope] = useState<"ALL" | "SPECIFIC">("ALL");
  const [selectedPatientExpedient, setSelectedPatientExpedient] =
    useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 🟢 Título / nombre de archivo del expediente a descargar (derivados)
  const downloadTitle =
    downloadScope === "SPECIFIC"
      ? `EXPEDIENTE: ${selectedPatientExpedient}`
      : "HISTORIAL CLÍNICO GENERAL";

  const downloadFileName =
    downloadScope === "SPECIFIC"
      ? `Expediente_${selectedPatientExpedient.replace(/\s+/g, "_")}.pdf`
      : "Historial_Clinico_Completo.pdf";

  // Estados para Modales de Detalle/Edición
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(
    null,
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editFormData, setEditFormData] = useState({
    theme: "",
    therapyType: "",
    summary: "",
    analysis: "",
  });

  // Carga inicial de datos
  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsData, patientsData] = await Promise.all([
          sessionService.getAllSessions(),
          PatientService.getAll(),
        ]);
        setSessions(sessionsData);
        setPatients(patientsData);
      } catch (error) {
        console.error("Error al cargar los datos del historial:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 🟢 Función para obtener nombres cruzando IDs
  const getPatientDisplayNames = (session: SessionData): string => {
    if (session.patientName) return session.patientName;

    const pIds = session.patientId ? [session.patientId] : [];

    if (pIds.length > 0) {
      const foundNames = patients
        .filter((p) => pIds.includes(p.id))
        .map((p) => p.name);

      if (foundNames.length > 0) return foundNames.join(", ");
    }

    return "Paciente no encontrado";
  };

  // 🟢 Opciones del buscador (Select) por paciente / código de expediente
  const patientExpedientOptions = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => {
      const pName = getPatientDisplayNames(s);
      const key = s.expedientCode || pName;
      if (key && !map.has(key)) {
        map.set(
          key,
          `${s.expedientCode ? `[${s.expedientCode}] ` : ""}${pName}`,
        );
      }
    });

    return [
      { label: "Todos los pacientes / expedientes", value: "" },
      ...Array.from(map.entries()).map(([value, label]) => ({
        label,
        value,
      })),
    ];
  }, [sessions, patients]);

  // 🟢 Normaliza cualquier formato de fecha (string ISO, "DD/MM/YYYY", Date,
  // o Timestamp tipo Firestore con { seconds }) a "YYYY-MM-DD" para comparar
  const toDateOnlyString = (value: unknown): string => {
    if (!value) return "";

    // Firestore Timestamp-like: { seconds: number, nanoseconds: number }
    if (
      typeof value === "object" &&
      value !== null &&
      "seconds" in (value as Record<string, unknown>)
    ) {
      const seconds = (value as { seconds: number }).seconds;
      const d = new Date(seconds * 1000);
      return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    }

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
    }

    if (typeof value === "string") {
      // Ya viene como YYYY-MM-DD (o con hora pegada al final)
      const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return isoMatch[0];

      // Formato D/M/YYYY o DD/MM/YYYY (con o sin ceros a la izquierda)
      const dmyMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dmyMatch) {
        const [, dd, mm, yyyy] = dmyMatch;
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      }

      // Último recurso: dejar que Date lo intente parsear
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
      return "";
    }

    return "";
  };

  // 1️⃣ Filtrado de sesiones principal (paciente/expediente + terapia + rango de fechas)
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Filtro Paciente / Expediente (Select)
      if (selectedExpedient) {
        const patientNameStr = getPatientDisplayNames(session);
        const matchesSelection =
          session.expedientCode === selectedExpedient ||
          patientNameStr === selectedExpedient;
        if (!matchesSelection) return false;
      }

      // Filtro Tipo de Terapia
      if (
        selectedTherapy !== "TODAS" &&
        session.therapyType !== selectedTherapy
      ) {
        return false;
      }

      // Filtro Rango de Fechas
      const sessionDateOnly = toDateOnlyString(session.date);
      if (startDate && sessionDateOnly && sessionDateOnly < startDate) {
        return false;
      }
      if (endDate && sessionDateOnly && sessionDateOnly > endDate) {
        return false;
      }

      return true;
    });
  }, [
    sessions,
    patients,
    selectedExpedient,
    selectedTherapy,
    startDate,
    endDate,
  ]);

  // 3️⃣ Lógica de sesiones a descargar (modal de opciones de descarga)
  const sessionsToDownload = useMemo(() => {
    if (downloadScope === "ALL") {
      return filteredSessions.map((s) => ({
        ...s,
        patientName: getPatientDisplayNames(s),
      }));
    }

    return sessions
      .filter(
        (s) =>
          s.expedientCode === selectedPatientExpedient ||
          getPatientDisplayNames(s) === selectedPatientExpedient,
      )
      .map((s) => ({
        ...s,
        patientName: getPatientDisplayNames(s),
      }));
  }, [
    downloadScope,
    selectedPatientExpedient,
    filteredSessions,
    sessions,
    patients,
  ]);

  // Handler que genera el PDF EN EL MOMENTO del click (evita descargar una
  // versión desactualizada por condiciones de carrera con datos async)
  const handleDownloadExpedient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (downloadScope === "SPECIFIC" && !selectedPatientExpedient) {
      alert("Selecciona un expediente / paciente para descargar.");
      return;
    }
    if (sessionsToDownload.length === 0) {
      alert("No hay sesiones para descargar con los filtros seleccionados.");
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const blob = await pdf(
        <FullExpedientPdfDocument
          sessions={sessionsToDownload}
          expedientTitle={downloadTitle}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error("Error al generar el PDF del expediente:", error);
      alert("Ocurrió un error al generar el PDF. Intenta de nuevo.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Acciones de Modal
  const handleOpenView = (session: SessionData) => {
    setSelectedSession(session);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (session: SessionData) => {
    setSelectedSession(session);
    setEditFormData({
      theme: session.theme || "",
      therapyType: session.therapyType || "Terapia Individual",
      summary: session.summary || "",
      analysis: session.analysis || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession?.id) return;

    try {
      setIsSaving(true);
      await sessionService.updateSession(selectedSession.id, editFormData);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id ? { ...s, ...editFormData } : s,
        ),
      );

      setIsEditOpen(false);
    } catch (error) {
      console.error("Error al actualizar la sesión:", error);
      alert("No se pudo actualizar la sesión.");
    } finally {
      setIsSaving(false);
    }
  };

  // Definición de Columnas
  const columns: Column<SessionData>[] = [
    {
      header: "Cod. Exp",
      accessor: (item) => (
        <span className="font-semibold text-blue-600">
          {item.expedientCode || "N/A"}
        </span>
      ),
    },
    {
      header: "Fecha",
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{item.date}</span>
        </div>
      ),
    },
    {
      header: "Paciente(s)",
      accessor: (item) => (
        <span className="font-medium text-gray-900">
          {getPatientDisplayNames(item)}
        </span>
      ),
    },
    {
      header: "T. Terapia",
      accessor: (item) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {item.therapyType}
        </span>
      ),
    },
    {
      header: "Tema Tratado",
      accessor: (item) => (
        <span className="text-gray-500 max-w-xs block truncate">
          {item.theme || "-"}
        </span>
      ),
    },
    {
      header: "Acciones",
      align: "center",
      accessor: (item) => {
        const patientName = getPatientDisplayNames(item);

        return (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleOpenView(item)}
              className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
              title="Ver Detalle"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenEdit(item)}
              className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg transition-colors"
              title="Editar Sesión"
            >
              <Edit className="w-4 h-4" />
            </button>

            <PDFDownloadLink
              document={
                <SessionDetailPdfDocument
                  session={item}
                  patientName={patientName}
                />
              }
              fileName={`Sesion_${item.expedientCode || "EXP"}_${item.date}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button
                  disabled={pdfLoading}
                  className="p-1.5 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-lg transition-colors disabled:opacity-30"
                  title="Descargar Detalle de la Sesión"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </PDFDownloadLink>

            <PDFDownloadLink
              document={
                <AppointmentProofPdfDocument
                  session={item}
                  patientName={patientName}
                />
              }
              fileName={`Constancia_${patientName.replace(/\s+/g, "_")}_${item.date}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button
                  disabled={pdfLoading}
                  className="p-1.5 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded-lg transition-colors disabled:opacity-30"
                  title="Descargar Constancia de Cita"
                >
                  <FileCheck className="w-4 h-4" />
                </button>
              )}
            </PDFDownloadLink>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]">
      {/* Encabezado */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Historial Clínico
        </h1>
      </div>

      {/* Barra de Filtros y Botón de Opciones de Descarga */}
      <div className="flex flex-col sm:flex-row items-end gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Buscador por paciente / expediente (Select buscable) */}
        <div className="w-full sm:flex-1">
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Paciente / Expediente
          </label>
          <Select
            value={selectedExpedient}
            onChange={(e) => setSelectedExpedient(e.target.value)}
            options={patientExpedientOptions}
            placeholder="Buscar por código o nombre..."
            searchable={true}
          />
        </div>

        {/* Filtro de Tipo de Terapia */}
        <div className="w-full sm:w-64">
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Tipo de Terapia
          </label>
          <Select
            value={selectedTherapy}
            onChange={(e) => setSelectedTherapy(e.target.value)}
            options={THERAPY_OPTIONS}
          />
        </div>

        {/* Filtro de Rango de Fechas */}
        <div className="w-full sm:w-40">
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botón para Abrir Modal de Opciones de Descarga */}
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => setIsDownloadModalOpen(true)}
            variant="secondary"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 w-full justify-center"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Opciones de Descarga</span>
          </Button>
        </div>
      </div>

      {/* 🟢 MODAL DE DESCARGA DE EXPEDIENTES */}
      {isDownloadModalOpen && (
        <ModalSheet
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onSubmit={handleDownloadExpedient}
          title="Descargar Expedientes Clínicos"
          cancelText="Cancelar"
          submitText={isGeneratingPdf ? "Generando..." : "Descargar PDF"}
          isLoading={isGeneratingPdf}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Tipo de Reporte / Descarga
              </label>
              <Select
                value={downloadScope}
                onChange={(e) =>
                  setDownloadScope(e.target.value as "ALL" | "SPECIFIC")
                }
                options={[
                  {
                    label: "Todas las sesiones (Historial filtrado)",
                    value: "ALL",
                  },
                  {
                    label: "Expediente específico de un paciente",
                    value: "SPECIFIC",
                  },
                ]}
                searchable={false}
              />
            </div>

            {/* Si elige Expediente Específico, se muestra el Select de Pacientes */}
            {downloadScope === "SPECIFIC" && (
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Seleccionar Expediente / Paciente
                </label>
                <Select
                  value={selectedPatientExpedient}
                  onChange={(e) => setSelectedPatientExpedient(e.target.value)}
                  options={patientExpedientOptions.filter((o) => o.value)}
                  placeholder="Buscar por código o nombre..."
                  searchable={true}
                />
              </div>
            )}

            <p className="text-gray-400 text-[11px]">
              {sessionsToDownload.length} sesión(es) incluida(s) en el PDF. Usa
              el botón &quot;Descargar PDF&quot; de arriba para generarlo y
              descargarlo.
            </p>
          </div>
        </ModalSheet>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="bg-white p-8 text-center text-sm text-gray-500 rounded-2xl border border-gray-200">
          Cargando historial clínico...
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredSessions}
          keyExtractor={(item) => item.id || Math.random().toString()}
          itemsPerPage={8}
          emptyMessage="No se encontraron expedientes ni sesiones que coincidan con la búsqueda."
        />
      )}

      {/* 🟢 MODAL VER DETALLE */}
      {selectedSession && (
        <ModalSheet
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Detalle de Sesión - ${selectedSession.expedientCode || "N/A"}`}
          cancelText="Cerrar"
          submitText="Aceptar"
          onSubmit={(e) => {
            e.preventDefault();
            setIsViewOpen(false);
          }}
        >
          <div className="space-y-4 text-xs text-gray-700">
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 font-medium block">
                  Paciente(s):
                </span>
                <span className="font-semibold text-gray-900">
                  {getPatientDisplayNames(selectedSession)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">
                  Tipo de Terapia:
                </span>
                <span className="font-semibold text-blue-600">
                  {selectedSession.therapyType}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Fecha:</span>
                <span className="font-semibold text-gray-800">
                  {selectedSession.date}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Código:</span>
                <span className="font-semibold text-gray-800">
                  {selectedSession.expedientCode || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-bold block mb-1">
                Tema Tratado:
              </span>
              <p className="p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-800">
                {selectedSession.theme || "Sin tema especificado"}
              </p>
            </div>

            <div>
              <span className="text-gray-500 font-bold block mb-1">
                Resumen de la Sesión:
              </span>
              <p className="p-3 bg-white border border-gray-200 rounded-xl leading-relaxed whitespace-pre-wrap">
                {selectedSession.summary || "Sin resumen registrado."}
              </p>
            </div>

            <div>
              <span className="text-gray-500 font-bold block mb-1">
                Análisis Clínico:
              </span>
              <p className="p-3 bg-white border border-gray-200 rounded-xl leading-relaxed whitespace-pre-wrap">
                {selectedSession.analysis || "Sin análisis registrado."}
              </p>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* 🟢 MODAL EDITAR SESIÓN */}
      {selectedSession && (
        <ModalSheet
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdateSubmit}
          title={`Editar Sesión - ${selectedSession.expedientCode || "N/A"}`}
          cancelText="Cancelar"
          submitText="Guardar Cambios"
          isLoading={isSaving}
        >
          <div className="space-y-4 text-xs">
            {/* Datos no editables (Solo lectura) */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 font-medium block">
                  Paciente:
                </span>
                <span className="font-semibold text-gray-800">
                  {getPatientDisplayNames(selectedSession)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Fecha:</span>
                <span className="font-semibold text-gray-800">
                  {selectedSession.date}
                </span>
              </div>
            </div>

            {/* Select: Tipo de Terapia (Editable) */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Tipo de Terapia
              </label>
              <Select
                value={editFormData.therapyType}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    therapyType: e.target.value,
                  })
                }
                options={THERAPY_OPTIONS.filter((opt) => opt.value !== "TODAS")}
              />
            </div>

            {/* Input: Tema Tratado (Editable) */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Tema Tratado
              </label>
              <Input
                value={editFormData.theme}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, theme: e.target.value })
                }
              />
            </div>

            {/* Textarea: Resumen (Editable) */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Resumen de la Sesión
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                value={editFormData.summary}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    summary: e.target.value,
                  })
                }
              />
            </div>

            {/* Textarea: Análisis Clínico (Editable) */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Análisis Clínico
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                value={editFormData.analysis}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    analysis: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
}

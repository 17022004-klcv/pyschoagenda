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
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { ModalSheet } from "@/components/ui/Modal";
import { sessionService } from "@/services/session.service";
import { PatientService } from "@/services/patient.service";
import { Patient } from "@/types/patient";
import { SessionData } from "@/types/session";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { SessionDetailPdfDocument } from "@/components/pdf/SessionDetailPdfDocument";
import { AppointmentProofPdfDocument } from "@/components/pdf/AppointmentProofPdfDocument";
import { FullExpedientPdfDocument } from "@/components/pdf/FullExpedientPdfDocument";
import { useAuth } from "@/lib/AuthContext";
import { showAlert } from "@/lib/sweetalert";
import { formatters } from "@/lib/validators";

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
  const { userData } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Filtros de la tabla principal
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

  // Título / nombre derivado
  const downloadTitle =
    downloadScope === "SPECIFIC"
      ? `EXPEDIENTE: ${selectedPatientExpedient}`
      : "HISTORIAL CLÍNICO GENERAL";

  const downloadFileName =
    downloadScope === "SPECIFIC"
      ? `Expediente_${selectedPatientExpedient.replace(/\s+/g, "_")}.pdf`
      : "Historial_Clinico_Completo.pdf";

  // Modales de Detalle/Edición
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

  // Usuario para logs
  const currentUser = {
    uid: userData?.uid || "",
    name: userData?.name || "Usuario",
    email: userData?.email || "",
    role: userData?.role || "psicologo",
  };

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

  const toDateOnlyString = (value: unknown): string => {
    if (!value) return "";
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
      const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return isoMatch[0];
      const dmyMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dmyMatch) {
        const [, dd, mm, yyyy] = dmyMatch;
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      }
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }
    return "";
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (selectedExpedient) {
        const patientNameStr = getPatientDisplayNames(session);
        const matchesSelection =
          session.expedientCode === selectedExpedient ||
          patientNameStr === selectedExpedient;
        if (!matchesSelection) return false;
      }
      if (
        selectedTherapy !== "TODAS" &&
        session.therapyType !== selectedTherapy
      ) {
        return false;
      }
      const sessionDateOnly = toDateOnlyString(session.date);
      if (startDate && sessionDateOnly && sessionDateOnly < startDate)
        return false;
      if (endDate && sessionDateOnly && sessionDateOnly > endDate) return false;

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
      await sessionService.updateSession(
        selectedSession.id,
        editFormData,
        currentUser,
      );

      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id ? { ...s, ...editFormData } : s,
        ),
      );

      setIsEditOpen(false);

      // 🟢 Alerta simple en el flujo correcto
      showAlert.successToast("¡La sesión se ha actualizado correctamente!");
    } catch (error) {
      console.error("Error al actualizar la sesión:", error);
      showAlert.errorToast("No se pudo actualizar la sesión.");
    } finally {
      setIsSaving(false);
    }
  };

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
        <span className="font-medium text-gray-900 dark:text-white">
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

  // Skeleton para los Filtros Superiores
  const HistoryFiltersSkeleton = () => (
    <div className="flex flex-col md:flex-row items-end gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm animate-pulse">
      <div className="w-full md:flex-1 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
        <div className="h-10 bg-gray-100 dark:bg-slate-700/60 rounded-xl"></div>
      </div>
      <div className="w-full md:w-64 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
        <div className="h-10 bg-gray-100 dark:bg-slate-700/60 rounded-xl"></div>
      </div>
      <div className="w-full md:w-40 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
        <div className="h-10 bg-gray-100 dark:bg-slate-700/60 rounded-xl"></div>
      </div>
      <div className="w-full md:w-40 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
        <div className="h-10 bg-gray-100 dark:bg-slate-700/60 rounded-xl"></div>
      </div>
      <div className="w-full md:w-auto">
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl w-full md:w-44"></div>
      </div>
    </div>
  );

  // Skeleton para la Tabla
  const TableSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-100 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-800/50 flex gap-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/5"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/5"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12 ml-auto"></div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-4 border-b border-gray-100 dark:border-slate-700/60 flex items-center gap-4"
        >
          <div className="h-4 bg-gray-100 dark:bg-slate-700/80 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-100 dark:bg-slate-700/80 rounded w-1/5"></div>
          <div className="h-4 bg-gray-100 dark:bg-slate-700/80 rounded w-1/5"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-xl w-20 ml-auto"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* Encabezado */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-700/80">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Historial Clínico
        </h1>
      </div>

      {/* Barra de Filtros y Botón de Descarga */}
      {loading ? (
        <HistoryFiltersSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm transition-colors duration-200 items-end">
          {/* Buscador Paciente / Expediente */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
              Paciente / Expediente
            </label>
            <Select
              value={selectedExpedient}
              onChange={(e: any) => setSelectedExpedient(e.target.value)}
              options={patientExpedientOptions}
              placeholder="Buscar por código o nombre..."
              searchable={true}
            />
          </div>

          {/* Filtro Tipo de Terapia */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
              Tipo de Terapia
            </label>
            <Select
              value={selectedTherapy}
              onChange={(e: any) => setSelectedTherapy(e.target.value)}
              options={THERAPY_OPTIONS}
            />
          </div>

          {/* Fecha Desde */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Botón Descarga */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Button
              onClick={() => setIsDownloadModalOpen(true)}
              variant="secondary"
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/60 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 w-full justify-center rounded-xl transition-all active:scale-95 cursor-pointer h-[38px]"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden lg:inline">Descargar</span>
              <span className="lg:hidden">Opciones Descarga</span>
            </Button>
          </div>
        </div>
      )}

      {/* 🟢 MODAL DE DESCARGA DE EXPEDIENTES REDISEÑADO */}
      {isDownloadModalOpen && (
        <ModalSheet
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onSubmit={handleDownloadExpedient}
          title="Descargar Expediente Clínico"
          cancelText="Cancelar"
          submitText={isGeneratingPdf ? "Generando..." : "Descargar PDF"}
          isLoading={isGeneratingPdf}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-2">
                Selecciona el alcance de la descarga
              </label>

              {/* Selector Visual de Alcance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Opción 1: Todas las Sesiones */}
                <button
                  type="button"
                  onClick={() => setDownloadScope("ALL")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    downloadScope === "ALL"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-xs">
                      Todas las sesiones
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        downloadScope === "ALL"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    >
                      {downloadScope === "ALL" && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Incluye las consultas que coincidan con los filtros
                    actuales.
                  </p>
                </button>

                {/* Opción 2: Expediente Específico */}
                <button
                  type="button"
                  onClick={() => setDownloadScope("SPECIFIC")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    downloadScope === "SPECIFIC"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-xs">
                      Expediente Específico
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        downloadScope === "SPECIFIC"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 dark:border-slate-600"
                      }`}
                    >
                      {downloadScope === "SPECIFIC" && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Genera la ficha completa y privada de un único paciente.
                  </p>
                </button>
              </div>
            </div>

            {/* Select condicional para expediente específico */}
            {downloadScope === "SPECIFIC" && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">
                  Seleccionar Expediente / Paciente
                </label>
                <Select
                  value={selectedPatientExpedient}
                  onChange={(e: any) =>
                    setSelectedPatientExpedient(e.target.value)
                  }
                  options={patientExpedientOptions.filter((o: any) => o.value)}
                  placeholder="Buscar por código o nombre..."
                  searchable={true}
                />
              </div>
            )}

            {/* Indicador Informativo */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/60 dark:border-slate-700/60 flex items-center gap-2 text-[11px] text-gray-600 dark:text-slate-400">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                <strong>{sessionsToDownload.length}</strong> sesión(es) será(n)
                incluida(s) en este documento.
              </span>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Tabla con Skeleton */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm transition-colors duration-200">
          <Table
            columns={columns}
            data={filteredSessions}
            keyExtractor={(item: any) => item.id || Math.random().toString()}
            itemsPerPage={8}
            emptyMessage="No se encontraron expedientes ni sesiones que coincidan con la búsqueda."
          />
        </div>
      )}

      {/* 🟢 MODAL VER DETALLE */}
      {selectedSession && (
        <ModalSheet
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Detalle de Sesión - ${selectedSession.expedientCode || "N/A"}`}
          cancelText="Cerrar"
          submitText="Aceptar"
          onSubmit={(e: any) => {
            e.preventDefault();
            setIsViewOpen(false);
          }}
        >
          <div className="space-y-4 text-xs text-gray-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700">
              <div>
                <span className="text-gray-400 dark:text-slate-500 font-medium block">
                  Paciente(s):
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getPatientDisplayNames(selectedSession)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 dark:text-slate-500 font-medium block">
                  Tipo de Terapia:
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {selectedSession.therapyType}
                </span>
              </div>
              <div>
                <span className="text-gray-400 dark:text-slate-500 font-medium block">
                  Fecha:
                </span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {selectedSession.date}
                </span>
              </div>
              <div>
                <span className="text-gray-400 dark:text-slate-500 font-medium block">
                  Código:
                </span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {selectedSession.expedientCode || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Tema Tratado:
              </span>
              <p className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-800 dark:text-slate-200">
                {selectedSession.theme || "Sin tema especificado"}
              </p>
            </div>

            <div>
              <span className="text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Resumen de la Sesión:
              </span>
              <p className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-slate-200">
                {selectedSession.summary || "Sin resumen registrado."}
              </p>
            </div>

            <div>
              <span className="text-gray-500 dark:text-slate-400 font-bold block mb-1">
                Análisis Clínico:
              </span>
              <p className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-slate-200">
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
            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
              <div>
                <span className="text-gray-400 dark:text-slate-500 font-medium block">
                  Paciente:
                </span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {getPatientDisplayNames(selectedSession)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 dark:text-slate-500 font-medium block">
                  Fecha:
                </span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {selectedSession.date}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">
                Tipo de Terapia
              </label>
              <Select
                value={editFormData.therapyType}
                onChange={(e: any) =>
                  setEditFormData({
                    ...editFormData,
                    therapyType: e.target.value,
                  })
                }
                options={THERAPY_OPTIONS.filter(
                  (opt: any) => opt.value !== "TODAS",
                )}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">
                Tema Tratado
              </label>
              <Input
                value={editFormData.theme}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData({
                    ...editFormData,
                    theme: formatters.maxLength(e.target.value, 100),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">
                Resumen de la Sesión
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-colors"
                value={editFormData.summary}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    summary: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-slate-300 font-bold mb-1">
                Análisis Clínico
              </label>
              <textarea
                rows={4}
                className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-colors"
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

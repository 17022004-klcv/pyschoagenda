"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, FileText, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { sessionService} from "@/services/session.service";
import { SessionData } from "@/types/session";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ExpedientHistoryPdfDocument } from "@/components/pdf/ExpedientHistoryPdfDocument";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTherapy, setSelectedTherapy] = useState("TODAS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await sessionService.getAllSessions();
        setSessions(data);
      } catch (error) {
        console.error("Error al cargar el historial clínico:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // Filtro en tiempo real por búsqueda y tipo de terapia
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesCodeOrPatient =
        !query ||
        session.expedientCode?.toLowerCase().includes(query) ||
        session.patientName?.toLowerCase().includes(query);

      const matchesTherapy =
        selectedTherapy === "TODAS" ||
        session.therapyType === selectedTherapy;

      return matchesCodeOrPatient && matchesTherapy;
    });
  }, [sessions, searchQuery, selectedTherapy]);

  // Texto dinámico para la etiqueta del PDF
  const pdfFilterLabel = useMemo(() => {
    if (searchQuery && selectedTherapy !== "TODAS") {
      return `Búsqueda: "${searchQuery}" | Terapia: ${selectedTherapy}`;
    }
    if (searchQuery) return `Búsqueda: "${searchQuery}"`;
    if (selectedTherapy !== "TODAS") return `Terapia: ${selectedTherapy}`;
    return "Todos los expedientes registrados";
  }, [searchQuery, selectedTherapy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* Título de la vista */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Historial Clínico
        </h1>
      </div>

      {/* Barra de Filtros según Mockup */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Input: Buscar por Cod. Exp / Paciente */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cod. exp / paciente"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Botón Descargar PDF */}
        <div className="w-full sm:w-auto">
          <PDFDownloadLink
            document={
              <ExpedientHistoryPdfDocument
                sessions={filteredSessions}
                filterLabel={pdfFilterLabel}
              />
            }
            fileName={
              searchQuery
                ? `Expediente_${searchQuery.replace(/\s+/g, "_")}.pdf`
                : "Historial_Clinico_Completo.pdf"
            }
          >
            {({ loading: pdfLoading }) => (
              <Button
                variant="outline"
                disabled={pdfLoading || filteredSessions.length === 0}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 text-gray-700 hover:bg-gray-50 border-gray-300 w-full justify-center"
                title="Descargar expediente completo en PDF"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>
                  {pdfLoading ? "Generando PDF..." : "Descargar Expediente"}
                </span>
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        {/* Select: Tipo de Terapia */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedTherapy}
            onChange={(e) => setSelectedTherapy(e.target.value)}
            options={THERAPY_OPTIONS}
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Cargando historial clínico...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No se encontraron sesiones que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Cod. Exp</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Paciente(s)</th>
                  <th className="px-4 py-3">T. Terapia</th>
                  <th className="px-4 py-3">Tema Tratado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {session.expedientCode || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {session.date}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {session.patientName || "Paciente sin nombre"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {session.therapyType}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-500">
                      {session.theme || "-"}
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
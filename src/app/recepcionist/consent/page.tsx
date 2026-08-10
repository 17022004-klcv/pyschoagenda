"use client";

import React, { useState, useEffect, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Search,
  User,
  Eye,
  Download,
  Loader2,
  FileSignature,
  CheckCircle2,
  Clock,
  Calendar,
  IdCard,
} from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Select } from "@/components/ui/Select";
import { ModalSheet as Modal } from "@/components/ui/Modal";
import { Table, Column } from "@/components/ui/Table";
import { SignaturePad } from "@/components/ui/SignaturePad";

import { PatientService, Patient } from "@/services/patient.service";
import { showAlert } from "@/lib/sweetalert";
import { PatientPdfDocument } from "@/components/pdf/PatientPdfDocument";
import { ConsentPdfDocument } from "@/components/pdf/ConsentPdfDocument";

export default function ConsentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | "Firmado" | "Pendiente"
  >("Todos");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Modales
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado de Selección
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tempSignature, setTempSignature] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const data = await PatientService.getAll();
      setPatients(data);
    } catch (error) {
      showAlert.errorToast("Error al cargar la lista de consentimientos");
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filtrado
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dui && p.dui.includes(searchTerm)) ||
      (p.tutor &&
        p.tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = p.consentStatus === "Firmado" ? "Firmado" : "Pendiente";
    const matchesStatus = statusFilter === "Todos" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenView = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleOpenConsentModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsConsentModalOpen(true);
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    if (!selectedPatient) return;
    setIsLoading(true);

    const updatedPatientData = {
      ...selectedPatient,
      consentStatus: "Firmado" as const,
      consentDate: new Date().toLocaleDateString("es-SV"),
      consentSignature: signatureDataUrl,
    };

    try {
      await PatientService.update(selectedPatient.id, updatedPatientData);
      showAlert.successToast("Consentimiento firmado y guardado con éxito");
      await fetchPatients();
      setIsConsentModalOpen(false);
      setTempSignature(null);
    } catch (error) {
      showAlert.errorToast("Error al guardar la firma del consentimiento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadConsentPdf = async (patient: Patient) => {
    try {
      showAlert.successToast("Generando Consentimiento PDF...");
      const blob = await pdf(<ConsentPdfDocument patient={patient} />).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Consentimiento_${patient.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert.errorToast("Error al descargar el consentimiento");
    }
  };

  const handleDownloadSinglePdf = async (patient: Patient) => {
    try {
      showAlert.successToast("Generando Ficha PDF...");
      const blob = await pdf(<PatientPdfDocument patient={patient} />).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Ficha_${patient.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert.errorToast("Ocurrió un error al generar la ficha");
    }
  };

  const consentColumns: Column<Patient>[] = [
    {
      header: "Paciente",
      accessor: (patient) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base">
                {patient.name}
              </span>
              {patient.isMinor && (
                <span className="text-[11px] font-bold text-[#9A0076] bg-[#9A0076]/10 px-2 py-0.5 rounded-full border border-[#9A0076]/20">
                  Menor
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {patient.isMinor && patient.tutor
                ? `Tutor: ${patient.tutor.name} (${patient.tutor.relationship})`
                : `DUI: ${patient.dui || "N/A"}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Estado de Consentimiento",
      accessor: (patient) => {
        const isSigned = patient.consentStatus === "Firmado";
        return (
          <div className="flex items-center gap-1.5">
            {isSigned ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Firmado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pendiente
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Fecha de Firma",
      accessor: (patient) => (
        <div className="flex items-center gap-1.5 font-medium text-gray-700 text-sm">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{patient.consentDate || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Acciones",
      align: "right",
      accessor: (patient) => {
        const isSigned = patient.consentStatus === "Firmado";

        return (
          <div className="flex items-center justify-end gap-1">
            {/* ✍️ SOLO MOSTRAR ICONO DE FIRMAR SI ESTÁ PENDIENTE */}
            {!isSigned && (
              <ActionButton
                icon={<FileSignature className="w-4 h-4" />}
                title="Firmar Consentimiento Informado"
                variant="warning"
                onClick={() => handleOpenConsentModal(patient)}
              />
            )}

            {/* 📥 DESCARGAR CONSENTIMIENTO SI YA FUE FIRMADO */}
            {isSigned && (
              <ActionButton
                icon={<FileSignature className="w-4 h-4 text-blue-500" />}
                title="Descargar Consentimiento PDF"
                variant="primary"
                onClick={() => handleDownloadConsentPdf(patient)}
              />
            )}

            {/* 👁️ VER DETALLES */}
            <ActionButton
              icon={<Eye className="w-4 h-4" />}
              title="Ver Detalles"
              variant="primary"
              onClick={() => handleOpenView(patient)}
            />

            {/* 📥 DESCARGAR FICHA DEL PACIENTE */}
            <ActionButton
              icon={<Download className="w-4 h-4" />}
              title="Descargar Ficha Paciente PDF"
              variant="success"
              onClick={() => handleDownloadSinglePdf(patient)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif]">
      {/* Header + Buscador + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestión de Consentimientos
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Control de firmas digitales y documentos de consentimiento
            informado.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Selector de Filtro de Estado */}
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "Todos" | "Firmado" | "Pendiente",
                )
              }
              options={[
                { label: "Todos los Estados", value: "Todos" },
                { label: "Solo Firmados", value: "Firmado" },
                { label: "Solo Pendientes", value: "Pendiente" },
              ]}
            />
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar paciente, DUI o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border border-gray-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Consentimientos */}
      {isPageLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
          <p className="text-sm font-medium">Cargando consentimientos...</p>
        </div>
      ) : (
        <Table
          columns={consentColumns}
          data={filteredPatients}
          keyExtractor={(patient) => patient.id}
          itemsPerPage={6}
          emptyMessage="No se encontraron consentimientos registrados."
        />
      )}

      {/* ✍️ MODAL FIRMA DIGITAL DE CONSENTIMIENTO */}
      <Modal
        isOpen={isConsentModalOpen}
        onClose={() => {
          setIsConsentModalOpen(false);
          setTempSignature(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (tempSignature) {
            handleSaveSignature(tempSignature);
          } else {
            showAlert.errorToast("Por favor realiza la firma antes de guardar");
          }
        }}
        title="Consentimiento Informado"
        submitText="Guardar Firma"
        cancelText="Cancelar"
        isLoading={isLoading}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900">
              <p className="font-bold">
                {selectedPatient.isMinor && selectedPatient.tutor
                  ? `Firma requerida del Tutor Legal: ${selectedPatient.tutor.name} (${selectedPatient.tutor.relationship})`
                  : `Firma requerida del Paciente: ${selectedPatient.name}`}
              </p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Pase la pantalla/tablet al declarante para que realice su firma
                digital.
              </p>
            </div>

            <SignaturePad
              onSignatureChange={(signature) => setTempSignature(signature)}
            />
          </div>
        )}
      </Modal>

      {/* 👁️ MODAL VER DETALLES (SOLO LECTURA, SIN BOTÓN DE GUARDAR) */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Consentimiento"
        cancelText="Cerrar"
        /* Omitimos submitText y onSubmit para que actúe solo como modal de visualización */
      >
        {selectedPatient && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedPatient.name}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Género: {selectedPatient.gender}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedPatient.consentStatus === "Firmado"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                {selectedPatient.consentStatus === "Firmado" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Firmado
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Pendiente
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-gray-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Fecha Registro/Firma</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {selectedPatient.consentDate || "Aún no firmado"}
                </p>
              </div>

              <div className="p-3 bg-white border border-gray-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <IdCard className="w-3.5 h-3.5" />
                  <span>DUI / Identificación</span>
                </div>
                <p className="font-semibold text-gray-800">
                  {selectedPatient.isMinor
                    ? selectedPatient.tutor
                      ? `Tutor: ${selectedPatient.tutor.dui}`
                      : "N/A"
                    : selectedPatient.dui || "N/A"}
                </p>
              </div>
            </div>

            {selectedPatient.consentSignature ? (
              <div className="p-3 bg-white border border-gray-200/80 rounded-xl space-y-2">
                <span className="text-xs font-bold text-gray-500">
                  Firma Digital Registrada:
                </span>
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 flex justify-center">
                  <img
                    src={selectedPatient.consentSignature}
                    alt="Firma Digital"
                    className="h-20 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                <p className="font-semibold">Sin firma registrada</p>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Este paciente aún no ha completado la firma del consentimiento
                  informado.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

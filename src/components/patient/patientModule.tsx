"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Search,
  UserPlus,
  User,
  Phone,
  Mail,
  Eye,
  Pencil,
  Download,
  Trash2,
  ShieldAlert,
  FileText,
  Loader2,
  Calendar,
  IdCard,
  FileSignature,
  CheckCircle2,
  Clock,
  ChevronDown,
  Users,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ActionButton } from "@/components/ui/ActionButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ModalSheet as Modal } from "@/components/ui/Modal";
import { Table, Column } from "@/components/ui/Table";
import { SignaturePad } from "@/components/ui/SignaturePad";

import { PatientService } from "@/services/patient.service";
import { Patient } from "@/types/patient";
import { showAlert } from "@/lib/sweetalert";
import { PatientPdfDocument } from "@/components/pdf/PatientPdfDocument";
import { PatientListPdfDocument } from "@/components/pdf/PatientListPdfDocument";
import { ConsentPdfDocument } from "@/components/pdf/ConsentPdfDocument";
import { useAuth } from "@/lib/AuthContext";
import { formatters } from "@/lib/validators";

export default function PatientsPage() {
  const { userData } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("Todos");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tempSignature, setTempSignature] = useState<string | null>(null);
  const todayString = new Date().toISOString().split("T")[0];

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado de Selección / Edición
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtro de Descarga General (Dropdown Flotante)
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Formulario Paciente
  const [name, setName] = useState("");
  const [gender, setGender] = useState<
    "Femenino" | "Masculino" | "Otro" | "N/A"
  >("Femenino");
  const [birthDate, setBirthDate] = useState("");
  const [dui, setDui] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"Activo" | "Inactivo">("Activo");
  const [observations, setObservations] = useState("");

  // Formulario Tutor
  const [tutorName, setTutorName] = useState("");
  const [tutorRelationship, setTutorRelationship] = useState("");
  const [tutorDui, setTutorDui] = useState("");
  const [tutorPhone, setTutorPhone] = useState("");

  // Contexto de Usuario para Auditoría
  const currentUser = {
    uid: userData?.uid || "",
    name: userData?.name || "Usuario",
    email: userData?.email || "",
    role: userData?.role || "recepcionista",
  };

  const fetchPatients = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const data = await PatientService.getAll();
      setPatients(data);
    } catch (error) {
      showAlert.errorToast("Error al cargar la lista de pacientes");
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPdfDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dui && p.dui.includes(searchTerm)) ||
      (p.tutor &&
        p.tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter === "Todos" || p.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  const handleDownloadFilteredPDF = async (
    filterType: "Todos" | "Femenino" | "Masculino",
  ) => {
    setIsPdfDropdownOpen(false);

    try {
      showAlert.successToast("Generando reporte PDF...");
      let listToExport = patients;
      let titleLabel = "Todos los Pacientes";

      if (filterType !== "Todos") {
        listToExport = patients.filter((p) => p.gender === filterType);
        titleLabel = `Pacientes Género ${filterType}`;
      }

      const blob = await pdf(
        <PatientListPdfDocument
          patients={listToExport}
          filterLabel={titleLabel}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Pacientes_${filterType}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert.errorToast("Error al generar el reporte PDF");
    }
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return 0;
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(birthDate);
  const isMinor = birthDate !== "" && calculatedAge < 18;

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

    if (!currentUser.uid) {
      showAlert.errorToast("No hay usuario autenticado activo.");
      return;
    }

    setIsLoading(true);

    const updatedPatientData = {
      ...selectedPatient,
      consentStatus: "Firmado" as const,
      consentDate: new Date().toLocaleDateString("es-SV"),
      consentSignature: signatureDataUrl,
    };

    try {
      await PatientService.update(
        selectedPatient.id,
        updatedPatientData,
        currentUser,
      );
      showAlert.successToast("Consentimiento firmado y guardado con éxito");
      await fetchPatients();
      setIsConsentModalOpen(false);
    } catch (error) {
      showAlert.errorToast("Error al guardar la firma del consentimiento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadConsentPdf = async (patient: Patient) => {
    try {
      showAlert.successToast("Generando Consentimiento PDF...");
      const blob = await pdf(
        <ConsentPdfDocument patient={patient as any} />,
      ).toBlob();
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

  const handleOpenEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setName(patient.name);
    setGender(patient.gender || "Femenino");
    setBirthDate(patient.birthDate || "");
    setDui(patient.dui || "");
    setPhone(patient.phone);
    setEmail(patient.email || "");
    setStatus(patient.status);
    setObservations(patient.observations || "");

    if (patient.isMinor && patient.tutor) {
      setTutorName(patient.tutor.name);
      setTutorRelationship(patient.tutor.relationship);
      setTutorDui(patient.tutor.dui);
      setTutorPhone(patient.tutor.phone);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 Verificación obligatoria del ID de usuario
    if (!currentUser.uid) {
      showAlert.errorToast(
        "Esperando sesión del usuario... Intenta de nuevo en un segundo.",
      );
      return;
    }

    setIsLoading(true);

    const patientData = {
      name,
      gender,
      birthDate,
      age: calculatedAge,
      dui: isMinor ? undefined : dui,
      phone,
      email,
      status,
      isMinor,
      observations: observations.trim() || undefined,
      consentStatus: editingId ? undefined : ("Pendiente" as const),
      tutor: isMinor
        ? {
            name: tutorName,
            relationship: tutorRelationship,
            dui: tutorDui,
            phone: tutorPhone || phone,
          }
        : undefined,
    };

    try {
      if (editingId) {
        await PatientService.update(editingId, patientData, currentUser);
        showAlert.successToast("Paciente actualizado correctamente");
      } else {
        const created = await PatientService.create(patientData, currentUser);
        showAlert.successToast("Paciente registrado exitosamente");

        const confirmSign = await showAlert.confirm(
          "¿Firmar Consentimiento Ahora?",
          "¿Deseas pasar la tablet al paciente o tutor para firmar el consentimiento en este momento?",
          "Sí, firmar ahora",
        );

        if (confirmSign && created) {
          handleOpenConsentModal(created);
        }
      }

      await fetchPatients();
      closeAndResetModal();
    } catch (error: any) {
      console.error("Error al guardar paciente:", error);
      showAlert.errorToast(error.message || "Error al guardar la información");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInactivate = async (id: string, currentStatus: string) => {
    if (currentStatus === "Inactivo") {
      showAlert.errorToast("El paciente ya se encuentra inactivo");
      return;
    }

    const confirmed = await showAlert.confirm(
      "¿Inactivar paciente?",
      "El expediente pasará a estado inactivo pero sus datos se conservarán.",
      "Sí, inactivar",
    );

    if (confirmed) {
      try {
        await PatientService.inactivate(id, currentUser);
        await fetchPatients();
        showAlert.successToast("Paciente marcado como inactivo");
      } catch (error) {
        showAlert.errorToast("Error al cambiar el estado del paciente");
      }
    }
  };

  const handleDownloadSinglePdf = async (patient: Patient) => {
    try {
      showAlert.successToast("Generando Ficha PDF...");
      const blob = await pdf(
        <PatientPdfDocument patient={patient as any} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Ficha_${patient.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert.errorToast("Ocurrió un error al generar el PDF");
    }
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setGender("Femenino");
    setBirthDate("");
    setDui("");
    setPhone("");
    setEmail("");
    setStatus("Activo");
    setObservations("");
    setTutorName("");
    setTutorRelationship("");
    setTutorDui("");
    setTutorPhone("");
  };

  const patientColumns: Column<Patient>[] = [
    {
      header: "Paciente",
      accessor: (patient) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-slate-100 text-base">
                {patient.name}
              </span>
              {patient.isMinor && (
                <span className="text-[11px] font-bold text-[#9A0076] dark:text-fuchsia-400 bg-[#9A0076]/10 dark:bg-fuchsia-950/40 px-2 py-0.5 rounded-full border border-[#9A0076]/20 dark:border-fuchsia-800/40">
                  Menor
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
              {patient.isMinor && patient.tutor
                ? `Tutor: ${patient.tutor.name} (${patient.tutor.relationship})`
                : `DUI: ${patient.dui || "N/A"}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Consentimiento",
      accessor: (patient) => {
        const isSigned = patient.consentStatus === "Firmado";
        return (
          <div className="flex items-center gap-1.5">
            {isSigned ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Firmado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Pendiente
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Teléfono",
      accessor: (patient) => (
        <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-slate-300">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span>{patient.phone}</span>
        </div>
      ),
    },
    {
      header: "Estado",
      accessor: (patient) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
            patient.status === "Activo"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60"
              : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700"
          }`}
        >
          {patient.status}
        </span>
      ),
    },
    {
      header: "Acciones",
      align: "right",
      accessor: (patient) => (
        <div className="flex items-center justify-end gap-1">
          <ActionButton
            icon={<FileSignature className="w-4 h-4" />}
            title={
              patient.consentStatus === "Firmado"
                ? "Ver / Descargar Consentimiento PDF"
                : "Firmar Consentimiento Informado"
            }
            variant={
              patient.consentStatus === "Firmado" ? "primary" : "warning"
            }
            onClick={() =>
              patient.consentStatus === "Firmado"
                ? handleDownloadConsentPdf(patient)
                : handleOpenConsentModal(patient)
            }
          />
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            title="Ver Expediente"
            variant="primary"
            onClick={() => handleOpenView(patient)}
          />
          <ActionButton
            icon={<Pencil className="w-4 h-4" />}
            title="Editar"
            variant="warning"
            onClick={() => handleOpenEdit(patient)}
          />
          <ActionButton
            icon={<Download className="w-4 h-4" />}
            title="Descargar Ficha PDF"
            variant="success"
            onClick={() => handleDownloadSinglePdf(patient)}
          />
          <ActionButton
            icon={<Trash2 className="w-4 h-4" />}
            title="Inactivar Paciente"
            variant="danger"
            onClick={() => handleInactivate(patient.id, patient.status)}
          />
        </div>
      ),
    },
  ];

  const TableSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-3xl p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/4 mb-6"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 dark:bg-slate-700/50 rounded-2xl w-full"
        ></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* Header + Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Gestión de Pacientes
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Listado general, administración de expedientes y consentimientos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, DUI o tutor..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(formatters.maxLength(e.target.value, 50))
              }
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Exportar PDF</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isPdfDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menú Desplegable Flotante */}
            {isPdfDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-700/60">
                  <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Alcance del Reporte
                  </p>
                </div>

                {/* Opción Todos */}
                <button
                  type="button"
                  onClick={() => handleDownloadFilteredPDF("Todos")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Todos los Pacientes</span>
                </button>

                {/* Opción Femenino */}
                <button
                  type="button"
                  onClick={() => handleDownloadFilteredPDF("Femenino")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserRound className="w-4 h-4 text-purple-500" />
                  <span>Solo Género Femenino</span>
                </button>

                {/* Opción Masculino */}
                <button
                  type="button"
                  onClick={() => handleDownloadFilteredPDF("Masculino")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserRound className="w-4 h-4 text-purple-500" />
                  <span>Solo Género Masculino</span>
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Nuevo Paciente
          </Button>
        </div>
      </div>

      {/* Renderizado de Tabla o Skeleton */}
      {isPageLoading ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={patientColumns}
          data={filteredPatients}
          keyExtractor={(patient: Patient) => patient.id}
          itemsPerPage={5}
          emptyMessage="No se encontraron pacientes registrados."
        />
      )}

      {/* MODAL FIRMA DIGITAL DE CONSENTIMIENTO */}
      <Modal
        isOpen={isConsentModalOpen}
        onClose={() => {
          setIsConsentModalOpen(false);
          setTempSignature(null);
        }}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          if (tempSignature) {
            handleSaveSignature(tempSignature);
          } else {
            showAlert.errorToast("Por favor realiza la firma antes de guardar");
          }
        }}
        title="Consentimiento Informado"
        submitText="Guardar Firma"
        cancelText="Cerrar"
        isLoading={isLoading}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/50 rounded-2xl text-xs text-blue-900 dark:text-blue-200">
              <p className="font-bold">
                {selectedPatient.isMinor && selectedPatient.tutor
                  ? `Firma requerida del Tutor Legal: ${selectedPatient.tutor.name} (${selectedPatient.tutor.relationship})`
                  : `Firma requerida del Paciente: ${selectedPatient.name}`}
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Pase la pantalla/tablet al declarante para que realice su firma
                digital.
              </p>
            </div>

            <SignaturePad
              onSignatureChange={(signature: string | null) =>
                setTempSignature(signature)
              }
            />
          </div>
        )}
      </Modal>

      {/* MODAL VER EXPEDIENTE */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Paciente"
        cancelText="Cerrar"
      >
        {selectedPatient && (
          <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200/60 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedPatient.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Género: {selectedPatient.gender}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedPatient.status === "Activo"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                }`}
              >
                {selectedPatient.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Fecha de Nacimiento</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {selectedPatient.birthDate} ({selectedPatient.age} años)
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-medium">
                  <IdCard className="w-3.5 h-3.5" />
                  <span>DUI</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {selectedPatient.dui || "N/A (Menor)"}
                </p>
              </div>
            </div>

            {selectedPatient.observations && (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-1">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Observaciones Médicas / Notas
                </span>
                <p className="text-xs text-gray-700 dark:text-slate-300">
                  {selectedPatient.observations}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL CREAR / EDITAR PACIENTE */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeAndResetModal}
        onSubmit={handleSubmit}
        title={editingId ? "Editar Paciente" : "Agregar Paciente"}
        submitText={editingId ? "Actualizar" : "Guardar"}
        cancelText="Cancelar"
        isLoading={isLoading}
      >
        <Input
          label="Nombre Completo"
          placeholder="Ej: Sofía Martínez"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(formatters.maxLength(e.target.value, 60))
          }
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Género"
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as "Femenino" | "Masculino")
            }
            options={[
              { label: "Femenino", value: "Femenino" },
              { label: "Masculino", value: "Masculino" },
            ]}
            required
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            max={todayString}
            value={birthDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBirthDate(e.target.value)
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="DUI"
            badge={isMinor ? "Menor" : undefined}
            disabled={isMinor}
            placeholder="00000000-0"
            value={isMinor ? "" : dui}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDui(formatters.dui(e.target.value))
            }
            required={!isMinor && birthDate !== ""}
          />
          <Input
            label="Teléfono"
            placeholder="0000-0000"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPhone(formatters.phone(e.target.value))
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value as "Activo" | "Inactivo")}
            options={[
              { label: "Activo", value: "Activo" },
              { label: "Inactivo", value: "Inactivo" },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center justify-between">
            <span>Observaciones Médicas / Recepción</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
              (Opcional)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="Escribe notas relevantes o antecedentes iniciales..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full p-3 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-xs text-gray-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none"
          />
        </div>

        {isMinor && (
          <div className="mt-4 p-4 bg-[#9A0076]/5 dark:bg-[#9A0076]/10 border border-[#9A0076]/20 dark:border-[#9A0076]/30 rounded-2xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#9A0076] dark:text-[#d651b7] font-bold border-b border-[#9A0076]/15 dark:border-[#9A0076]/30 pb-2">
              <ShieldAlert className="w-4 h-4 text-[#9A0076] dark:text-[#d651b7]" />
              <span className="text-sm">Datos del Encargado / Tutor Legal</span>
            </div>
            <Input
              label="Nombre Completo del Responsable"
              placeholder="Ej: Mariana de Benítez"
              value={tutorName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTutorName(formatters.maxLength(e.target.value, 60))
              }
              required={isMinor}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Parentesco"
                value={tutorRelationship}
                onChange={(e) => setTutorRelationship(e.target.value)}
                options={[
                  { label: "Seleccionar...", value: "" },
                  { label: "Madre", value: "Madre" },
                  { label: "Padre", value: "Padre" },
                  { label: "Tío/a", value: "Tío/a" },
                  { label: "Abuelo/a", value: "Abuelo/a" },
                  { label: "Tutor Legal", value: "Tutor Legal" },
                ]}
                required={isMinor}
              />
              <Input
                label="DUI del Responsable"
                placeholder="00000000-0"
                value={tutorDui}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTutorDui(formatters.dui(e.target.value))
                }
                required={isMinor}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

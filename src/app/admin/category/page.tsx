"use client";

import React, { useState, useEffect, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  FileDown,
  Power,
  Layers,
  Calendar,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ListFilter,
  FolderOpen,
  Key,
  AlertTriangle,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
} from "@/services/category.service";
import {
  TherapyCategory,
  TherapyCategoryFormData,
} from "@/types/therapyCategory";
import { useAuth } from "@/lib/AuthContext";
import { formatters } from "@/lib/validators";
import { showAlert } from "@/lib/sweetalert";

// Componentes UI
import { Table, Column } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { ModalSheet } from "@/components/ui/Modal";

// PDF Templates
import {
  CategoriesListPDF,
  SingleCategoryPDF,
} from "@/components/pdf/TherapyCategoryPDF";

export default function TherapyCategoriesPage() {
  const { userData } = useAuth();

  const [categories, setCategories] = useState<TherapyCategory[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  // Estado para desplegar el menú de exportación
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<TherapyCategory | null>(null);

  const [formData, setFormData] = useState<TherapyCategoryFormData>({
    name: "",
    status: "active",
  });

  // Usuario que realiza la acción para la auditoría
  const currentUser = {
    uid: userData?.uid || "",
    name: userData?.name || "Usuario",
    email: userData?.email || "",
    role: userData?.role || "psicologo",
  };

  const fetchCategories = async () => {
    try {
      setIsPageLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Cierra el menú desplegable si se hace clic fuera de él
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

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Todos" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers para Modales
  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    setFormData({ name: "", status: "active" });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (cat: TherapyCategory) => {
    setSelectedCategory(cat);
    setFormData({ name: cat.name, status: cat.status });
    setIsFormModalOpen(true);
  };

  const handleOpenViewModal = (cat: TherapyCategory) => {
    setSelectedCategory(cat);
    setIsViewModalOpen(true);
  };

  const handleOpenStatusModal = (cat: TherapyCategory) => {
    setSelectedCategory(cat);
    setIsStatusModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, formData, currentUser);
        showAlert.successToast("Categoría actualizada correctamente");
      } else {
        await createCategory(formData, currentUser);
        showAlert.successToast("Categoría creada correctamente");
      }
      await fetchCategories();
      setIsFormModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedCategory) return;
    setIsSubmitLoading(true);
    try {
      const newStatus =
        selectedCategory.status === "active" ? "inactive" : "active";
      await toggleCategoryStatus(selectedCategory.id, newStatus, currentUser);
      showAlert.successToast(
        `Categoría ${newStatus === "active" ? "activada" : "inactivada"} correctamente`,
      );
      await fetchCategories();
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // 📄 DESCARGAS EN PDF CON FILTRADO ESPECÍFICO
  const handleDownloadFilteredPDF = async (
    filterType: "Todos" | "active" | "inactive",
  ) => {
    setIsPdfDropdownOpen(false);

    let listToExport = categories;
    let titleLabel = "Todas las Categorías";

    if (filterType === "active") {
      listToExport = categories.filter((c) => c.status === "active");
      titleLabel = "Categorías Activas";
    } else if (filterType === "inactive") {
      listToExport = categories.filter((c) => c.status === "inactive");
      titleLabel = "Categorías Inactivas";
    }

    const blob = await pdf(
      <CategoriesListPDF categories={listToExport} filterTitle={titleLabel} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_categorias_${filterType}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSinglePDF = async (cat: TherapyCategory) => {
    const blob = await pdf(<SingleCategoryPDF category={cat} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `categoria_${cat.name.replace(/\s+/g, "_")}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<TherapyCategory>[] = [
    {
      header: "Categoría",
      accessor: (cat) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">
              {cat.name}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400 dark:text-slate-500" />
              <span>Alta: {cat.createdAt}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Estado",
      accessor: (cat) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            cat.status === "active"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              cat.status === "active" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {cat.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      align: "right",
      accessor: (cat) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenViewModal(cat)}
            title="Ver Detalle"
            className="p-2 sm:p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditModal(cat)}
            title="Editar Categoría"
            className="p-2 sm:p-1.5 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadSinglePDF(cat)}
            title="Descargar Ficha PDF"
            className="p-2 sm:p-1.5 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenStatusModal(cat)}
            title={cat.status === "active" ? "Inactivar" : "Activar"}
            className={`p-2 sm:p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 ${
              cat.status === "active"
                ? "text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800"
                : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800"
            }`}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Categorías de Terapia
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
            Gestión de especialidades y tipos de terapias ofertadas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          {/* Filtro por Estado */}
          <div className="w-full sm:w-auto md:w-36">
            <Select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              options={[
                { label: "Todos", value: "Todos" },
                { label: "Activos", value: "active" },
                { label: "Inactivos", value: "inactive" },
              ]}
              className="w-full bg-gray-50/80 dark:bg-slate-800/80 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-700/80 rounded-xl"
            />
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-auto md:w-56 lg:w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(formatters.maxLength(e.target.value, 30))
              }
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
            />
          </div>

          {/* Botón Dropdown PDF */}
          <div className="relative w-full sm:w-auto shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/60 text-gray-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <FileDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Exportar PDF</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isPdfDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPdfDropdownOpen && (
              <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-56 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-700/60">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                    Seleccionar Reporte
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadFilteredPDF("Todos")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ListFilter className="w-4 h-4 text-purple-500" />
                  <span>Todas las Categorías</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFilteredPDF("active")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Solo Activas</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFilteredPDF("inactive")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Solo Inactivas</span>
                </button>
              </div>
            )}
          </div>

          {/* Botón Nueva Categoría */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold transition-all shrink-0 cursor-pointer shadow-sm shadow-blue-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* SKELETON DE CARGA / TABLA REAL */}
      {isPageLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/6" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 space-x-4"
            >
              <div className="h-4 bg-gray-100 dark:bg-slate-800/80 rounded-lg w-1/3" />
              <div className="h-6 bg-gray-100 dark:bg-slate-800/80 rounded-full w-20" />
              <div className="h-4 bg-gray-100 dark:bg-slate-800/80 rounded-lg w-1/5 hidden md:block" />
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <Table
            columns={columns}
            data={filteredCategories}
            keyExtractor={(cat: any) => cat.id}
            itemsPerPage={6}
            emptyMessage="No se encontraron categorías de terapia."
          />
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      <ModalSheet
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSave}
        title={selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
        submitText={selectedCategory ? "Guardar Cambios" : "Crear Categoría"}
        cancelText="Cancelar"
        isLoading={isSubmitLoading}
      >
        <div className="space-y-4 pt-1 overflow-visible">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: formatters.maxLength(e.target.value, 60),
                })
              }
              placeholder="Ej. Terapia Cognitivo Conductual"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative z-20">
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Estado Inicial
            </label>
            <Select
              value={formData.status}
              onChange={(e: any) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={[
                { label: "Activo", value: "active" },
                { label: "Inactivo", value: "inactive" },
              ]}
              className="bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-700/80 rounded-xl"
            />
          </div>
        </div>
      </ModalSheet>

      {/* MODAL VER */}
      <ModalSheet
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles de la Categoría"
        submitText="Cerrar"
        onSubmit={(e: any) => {
          e.preventDefault();
          setIsViewModalOpen(false);
        }}
      >
        {selectedCategory && (
          <div className="space-y-3 pt-1">
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  Nombre
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-slate-100">
                  {selectedCategory.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> ID Referencia
                </p>
                <p className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300 mt-1 truncate">
                  {selectedCategory.id}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  Estado Actual
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedCategory.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedCategory.status === "active"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />
                    {selectedCategory.status === "active"
                      ? "Activo"
                      : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-400" />
              <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  Fecha de Creación
                </p>
                <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mt-0.5">
                  {selectedCategory.createdAt || "Sin registro de fecha"}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* MODAL CAMBIO DE ESTADO */}
      <ModalSheet
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={(e: any) => {
          e.preventDefault();
          handleToggleStatus();
        }}
        title={
          selectedCategory?.status === "active"
            ? "Inactivar Categoría"
            : "Activar Categoría"
        }
        submitText={
          selectedCategory?.status === "active" ? "Inactivar" : "Activar"
        }
        cancelText="Cancelar"
        isLoading={isSubmitLoading}
      >
        {selectedCategory && (
          <div className="flex items-start gap-3.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed">
              ¿Deseas cambiar el estado de la categoría{" "}
              <strong className="font-bold underline">
                {selectedCategory.name}
              </strong>{" "}
              a{" "}
              <strong className="font-bold uppercase">
                {selectedCategory.status === "active" ? "Inactivo" : "Activo"}
              </strong>
              ? Esto afectará la visibilidad al seleccionar especialidades.
            </p>
          </div>
        )}
      </ModalSheet>
    </div>
  );
}

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
        await updateCategory(selectedCategory.id, formData);
      } else {
        await createCategory(formData);
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
      await toggleCategoryStatus(selectedCategory.id, newStatus);
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
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {cat.name}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
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
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            cat.status === "active"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${cat.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
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
            className="p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditModal(cat)}
            title="Editar Categoría"
            className="p-1.5 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadSinglePDF(cat)}
            title="Descargar Ficha PDF"
            className="p-1.5 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenStatusModal(cat)}
            title={cat.status === "active" ? "Inactivar" : "Activar"}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              cat.status === "active"
                ? "text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400"
                : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400"
            }`}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Categorías de Terapia
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Gestión de especialidades y tipos de terapias ofertadas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-36">
            <Select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              options={[
                { label: "Todos", value: "Todos" },
                { label: "Activos", value: "active" },
                { label: "Inactivos", value: "inactive" },
              ]}
            />
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 🔽 BOTÓN DROPDOWN DE REPORTE PDF */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-purple-600" />
              <span>Exportar PDF</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isPdfDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isPdfDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-700/60">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Seleccionar Reporte
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadFilteredPDF("Todos")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ListFilter className="w-4 h-4 text-purple-500" />
                  <span>Todas las Categorías</span>
                </button>

                <button
                  onClick={() => handleDownloadFilteredPDF("active")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Solo Activas</span>
                </button>

                <button
                  onClick={() => handleDownloadFilteredPDF("inactive")}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Solo Inactivas</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredCategories}
        keyExtractor={(cat) => cat.id}
        itemsPerPage={6}
        emptyMessage="No se encontraron categorías de terapia."
      />

      {/* 📝 MODAL CREAR / EDITAR */}
      <ModalSheet
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSave}
        title={selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
        submitText={selectedCategory ? "Guardar Cambios" : "Crear"}
        cancelText="Cancelar"
        isLoading={isSubmitLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej. Terapia Cognitivo Conductual"
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
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
            />
          </div>
        </div>
      </ModalSheet>

      {/* 👁️ MODAL VER */}
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
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">ID:</p>
              <p className="font-mono text-gray-700 dark:text-slate-300">
                {selectedCategory.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Nombre:</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {selectedCategory.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estado:</p>
              <p className="font-medium text-gray-700 dark:text-slate-300">
                {selectedCategory.status === "active" ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha de Creación:</p>
              <p className="font-medium text-gray-700 dark:text-slate-300">
                {selectedCategory.createdAt}
              </p>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* ⚠️ MODAL CAMBIO DE ESTADO */}
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
          <p className="text-sm text-gray-600 dark:text-slate-300">
            ¿Deseas cambiar el estado de la categoría{" "}
            <strong>{selectedCategory.name}</strong> a{" "}
            <strong>
              {selectedCategory.status === "active" ? "Inactivo" : "Activo"}
            </strong>
            ?
          </p>
        )}
      </ModalSheet>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Search,
  PlusCircle,
  RefreshCw,
  Trash2,
  User,
  Clock,
  Loader2,
  Info,
} from "lucide-react";
import { AuditLogUI, AuditAction, AuditCollection } from "@/types/auditLog";
import { auditService } from "@/services/audit.service";
import { Table, Column } from "@/components/ui/Table";
import { formatters } from "@/lib/validators";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogUI[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [collectionFilter, setCollectionFilter] = useState<string>("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error cargando bitácora:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtrado Seguro frente a nulos/indefinidos
  const filteredLogs = logs.filter((log) => {
    const userName = log.performedBy?.name || "";
    const userEmail = log.performedBy?.email || "";
    const details = log.details || "";
    const docId = log.documentId || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === "ALL" ||
      log.action?.toUpperCase() === actionFilter.toUpperCase();

    const matchesCollection =
      collectionFilter === "ALL" || log.collectionName === collectionFilter;

    return matchesSearch && matchesAction && matchesCollection;
  });

  // Badge compatible con inglés y español
  const getActionBadge = (action: string) => {
    const normalizedAction = action?.toUpperCase();

    switch (normalizedAction) {
      case "CREATE":
      case "CREAR":
      case "INSERT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <PlusCircle className="w-3.5 h-3.5" />
            {normalizedAction}
          </span>
        );
      case "UPDATE":
      case "ACTUALIZAR":
      case "EDIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5" />
            {normalizedAction}
          </span>
        );
      case "DELETE":
      case "ELIMINAR":
      case "INACTIVAR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <Trash2 className="w-3.5 h-3.5" />
            {normalizedAction}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
            <Info className="w-3.5 h-3.5" />
            {normalizedAction || "LOG"}
          </span>
        );
    }
  };

  // Configuración de Columnas para el componente Table
  const columns: Column<AuditLogUI>[] = [
    {
      header: "Acción",
      accessor: (log) => getActionBadge(log.action),
    },
    {
      header: "Colección",
      accessor: (log) => (
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold">
          {log.collectionName}
        </span>
      ),
    },
    {
      header: "Usuario Responsable",
      accessor: (log) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-400" />
            {log.performedBy?.name || "Sistema / Desconocido"}
          </div>
          <div className="text-[10px] text-gray-400">
            {log.performedBy?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Detalle del Evento",
      accessor: (log) => (
        <div className="max-w-xs font-medium text-gray-700">
          <p>{log.details}</p>
          {log.documentId && (
            <span className="block text-[10px] font-mono text-gray-400 mt-0.5">
              ID Doc: {log.documentId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Fecha y Hora",
      accessor: (log) => (
        <div className="text-gray-500 flex items-center gap-1.5 whitespace-nowrap text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {log.timestamp}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',sans-serif] px-1 sm:px-0">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Bitácora de Auditoría
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">
            Registro histórico de inserciones, actualizaciones y eliminaciones
            del sistema.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ${loading ? "animate-spin" : ""}`}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuario, detalles o ID..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(formatters.maxLength(e.target.value, 30))
            }
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all shadow-2xs"
          />
        </div>

        {/* Filtro Acciones */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 focus:outline-none focus:border-purple-500 transition-all shadow-2xs cursor-pointer"
        >
          <option value="ALL">Todas las acciones</option>
          <option value="INSERT">Crear / Inserción (CREATE)</option>
          <option value="UPDATE">Modificación (UPDATE)</option>
          <option value="DELETE">Eliminación / Inactivación (DELETE)</option>
        </select>

        {/* Filtro Colecciones */}
        <select
          value={collectionFilter}
          onChange={(e) => setCollectionFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-semibold text-gray-700 dark:text-slate-200 focus:outline-none focus:border-purple-500 transition-all shadow-2xs cursor-pointer"
        >
          <option value="ALL">Todas las colecciones</option>
          <option value="appointments">Citas</option>
          <option value="patients">Pacientes</option>
          <option value="sessions">Sesiones</option>
          <option value="therapy_categories">Tipos de Terapia</option>
          <option value="users">Usuarios</option>
        </select>
      </div>

      {/* 💀 SKELETON DE CARGA / TABLA REAL */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
          {/* Skeleton Header de la Tabla */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/5" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/6" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/12" />
          </div>
          {/* Skeleton Filas */}
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 space-x-4 border-b border-gray-50 dark:border-slate-800/50 last:border-0"
            >
              <div className="h-4 bg-gray-100 dark:bg-slate-800/80 rounded-lg w-1/4" />
              <div className="h-5 bg-gray-100 dark:bg-slate-800/80 rounded-full w-20" />
              <div className="h-4 bg-gray-100 dark:bg-slate-800/80 rounded-lg w-1/3" />
              <div className="h-4 bg-gray-100 dark:bg-slate-800/80 rounded-lg w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <Table<AuditLogUI>
            columns={columns}
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            itemsPerPage={10}
            emptyMessage="No se encontraron registros de auditoría que coincidan con la búsqueda."
          />
        </div>
      )}
    </div>
  );
}
